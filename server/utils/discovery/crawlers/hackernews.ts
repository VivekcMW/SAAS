/**
 * Hacker News "Show HN" Crawler
 * Source: https://hn.algolia.com/api/v1 (Algolia HN Search API — free, no auth)
 * Schedule: Daily (4am UTC)
 * Auth: None required
 * Est. apps: ~5-15 new Show HN posts per day
 *
 * Fetches "Show HN:" posts from the past 7 days.
 * Filters to posts that link to actual product websites (not GitHub, HN, articles).
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore, type FieldConfidence } from '~/server/utils/ai-extractor'

const HN_API = 'https://hn.algolia.com/api/v1'

interface HNHit {
  objectID: string
  title: string
  url: string | null
  author: string
  created_at: string
  points: number
  num_comments: number
}

const SKIP_DOMAINS = [
  'github.com', 'gitlab.com', 'news.ycombinator.com', 'medium.com',
  'dev.to', 'substack.com', 'youtube.com', 'twitter.com', 'x.com',
  'reddit.com', 'linkedin.com', 'producthunt.com'
]

function isSaasProductUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    const domain = hostname.replace(/^www\./, '')
    return !SKIP_DOMAINS.some(skip => domain.endsWith(skip))
  }
  catch {
    return false
  }
}

async function fetchShowHNPosts(daysBack = 7, page = 0): Promise<{ hits: HNHit[]; nbPages: number }> {
  const since = Math.floor((Date.now() - daysBack * 86_400_000) / 1000)
  const query = encodeURIComponent('Show HN')
  const url = `${HN_API}/search?query=${query}&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=50&page=${page}`

  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (!res.ok) throw new Error(`HN Algolia API ${res.status}`)

  const json = await res.json() as { hits: HNHit[]; nbPages: number }
  return json
}

export async function runHackerNewsCrawler(limit = 60): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'hackernews', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allHits: HNHit[] = []
    const { hits: firstHits, nbPages } = await fetchShowHNPosts(7, 0)
    allHits.push(...firstHits)

    // Fetch additional pages if needed
    for (let page = 1; page < Math.min(nbPages, 5) && allHits.length < limit; page++) {
      const { hits } = await fetchShowHNPosts(7, page)
      allHits.push(...hits)
      await new Promise(r => setTimeout(r, 1000))
    }

    found = allHits.length

    // Filter: only posts with external SaaS product URLs
    const qualified = allHits
      .filter((h): h is HNHit & { url: string } => h.url !== null && h.url !== undefined && isSaasProductUrl(h.url))
      .slice(0, limit)

    const newUrls = filterNew(qualified.map(h => h.url))
    const newSet = new Set(newUrls)
    const toProcess = qualified.filter(h => newSet.has(h.url))

    const now = new Date().toISOString()

    for (const hit of toProcess) {
      const siteUrl = hit.url

      try {
        const extracted: Record<string, unknown> = {
          name: hit.title.replace(/^Show HN:\s*/i, '').trim(),
          tagline: '',
          short_description: '',
          long_description: '',
          category: 'Other',
          pricing_type: 'contact',
          pricing_starts_at: null,
          target_audience: '',
          key_features: [],
          integrations: [],
          logo_url: null,
          website_url: siteUrl,
          founded_year: null,
          hn_points: hit.points,
          hn_comments: hit.num_comments,
          hn_author: hit.author,
          confidence: {
            name: 0.7, description: 0.1, category: 0.2,
            pricing: 0.1, features: 0.1, overall: 0.24
          }
        }

        // AI enrichment — needed here since HN gives minimal metadata
        try {
          const pageText = await fetchPageText(siteUrl)
          const aiResult = await extractWithAI(pageText, siteUrl)
          extracted.tagline = aiResult.tagline
          extracted.short_description = aiResult.short_description
          extracted.long_description = aiResult.long_description
          extracted.category = aiResult.category
          extracted.pricing_type = aiResult.pricing_type
          extracted.pricing_starts_at = aiResult.pricing_starts_at
          extracted.key_features = aiResult.key_features
          extracted.target_audience = aiResult.target_audience
          extracted.logo_url = aiResult.logo_url
          extracted.confidence = aiResult.confidence
        }
        catch { /* site may be unreachable */ }

        const score = computeScore(extracted.confidence as FieldConfidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')
        const hnPostUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, processed_at, created_at)
          VALUES (?, 'hackernews', ?, ?, ?, ?, ?, ?, ?)
        `).run(
          itemId,
          hnPostUrl,
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
        console.error('[hn-crawler] Failed for', siteUrl, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 3000))
    }
  }
  catch (err) {
    console.error('[hn-crawler] Fatal error', err)
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

  console.log(`[hn-crawler] Done — found:${found} added:${added} failed:${failed}`)
  return { found, added, failed }
}
