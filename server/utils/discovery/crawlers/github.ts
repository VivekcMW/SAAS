/**
 * GitHub Topics Crawler
 * Source: https://api.github.com/search/repositories (GitHub REST API v3)
 * Schedule: Weekly (Monday 3am UTC)
 * Auth: GITHUB_TOKEN (personal access token, public_repo scope)
 * Est. apps: 50,000+
 *
 * Searches topics: saas, micro-saas, saas-boilerplate, saas-starter
 * Uses the `homepage` field as the product website URL.
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore, type FieldConfidence } from '~/server/utils/ai-extractor'

const GH_API = 'https://api.github.com'

const TOPICS = ['saas', 'micro-saas', 'saas-boilerplate', 'saas-starter', 'saas-template']

interface GHRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  homepage: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics: string[]
  owner: { login: string; avatar_url: string }
}

async function searchRepos(topic: string, page: number): Promise<GHRepo[]> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SaasWorldBot/1.0'
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const url = `${GH_API}/search/repositories?q=topic:${topic}&sort=stars&order=desc&per_page=30&page=${page}`
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) })

  if (res.status === 403) {
    console.warn('[github-crawler] Rate limited — sleeping 60s')
    await new Promise(r => setTimeout(r, 60_000))
    return []
  }

  if (!res.ok) throw new Error(`GitHub API ${res.status}`)

  const json = await res.json() as { items: GHRepo[]; total_count: number }
  return json.items ?? []
}

export async function runGitHubCrawler(limit = 150): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'github', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allRepos: GHRepo[] = []

    for (const topic of TOPICS) {
      if (allRepos.length >= limit) break

      for (let page = 1; page <= 3; page++) {
        const repos = await searchRepos(topic, page)
        if (repos.length === 0) break
        allRepos.push(...repos)
        await new Promise(r => setTimeout(r, 2000)) // respect rate limit
      }
    }

    found = allRepos.length

    // Only keep repos that have a non-GitHub homepage URL
    const withSite = allRepos.filter(r => {
      const hp = r.homepage
      return hp &&
        hp.startsWith('http') &&
        !hp.includes('github.com') &&
        !hp.includes('github.io') &&
        hp.length > 10
    }).slice(0, limit) as (GHRepo & { homepage: string })[]

    const newUrls = filterNew(withSite.map(r => r.homepage))
    const newSet = new Set(newUrls)
    const toProcess = withSite.filter(r => newSet.has(r.homepage))

    const now = new Date().toISOString()

    for (const repo of toProcess) {
      const siteUrl = repo.homepage

      try {
        const extracted: Record<string, unknown> = {
          name: repo.name,
          tagline: repo.description ?? '',
          short_description: repo.description ?? '',
          long_description: repo.description ?? '',
          category: 'Developer Tools',
          pricing_type: 'contact',
          pricing_starts_at: null,
          target_audience: 'Developers',
          key_features: repo.topics ?? [],
          integrations: [],
          logo_url: repo.owner.avatar_url,
          website_url: siteUrl,
          founded_year: null,
          source_url: repo.html_url,
          github_stars: repo.stargazers_count,
          confidence: {
            name: 0.9, description: 0.5, category: 0.6,
            pricing: 0.1, features: 0.4, overall: 0.52
          }
        }

        // AI enrichment on actual product website (best-effort)
        try {
          const pageText = await fetchPageText(siteUrl)
          const aiResult = await extractWithAI(pageText, siteUrl)
          extracted.category = aiResult.category
          extracted.pricing_type = aiResult.pricing_type
          extracted.pricing_starts_at = aiResult.pricing_starts_at
          extracted.key_features = aiResult.key_features
          extracted.target_audience = aiResult.target_audience
          extracted.long_description = aiResult.long_description
          extracted.confidence = aiResult.confidence
        }
        catch { /* optional */ }

        const score = computeScore(extracted.confidence as FieldConfidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, processed_at, created_at)
          VALUES (?, 'github', ?, ?, ?, ?, ?, ?, ?)
        `).run(
          itemId,
          repo.html_url,
          siteUrl,
          JSON.stringify(extracted),
          score,
          status,
          now,
          now
        )

        added++
      }
      catch (err) {
        console.error('[github-crawler] Failed for', siteUrl, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 3000))
    }
  }
  catch (err) {
    console.error('[github-crawler] Fatal error', err)
    db.prepare(
      `UPDATE agent_runs SET status='error', finished_at=? WHERE id=?`
    ).run(new Date().toISOString(), runId)
    throw err
  }

  db.prepare(
    `UPDATE agent_runs
     SET status='done', finished_at=?, urls_found=?, urls_new=?, urls_failed=?
     WHERE id=?`
  ).run(new Date().toISOString(), found, added, failed, runId)

  console.log(`[github-crawler] Done — found:${found} added:${added} failed:${failed}`)
  return { found, added, failed }
}
