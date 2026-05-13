/**
 * GitHub Awesome Lists Crawler
 * Source: Human-curated awesome-* lists on GitHub (markdown files)
 * Schedule: Weekly (Saturday 1am UTC)
 * Auth: GITHUB_TOKEN (optional but recommended for higher rate limit)
 * Est. apps: 5,000+ across curated lists
 *
 * Parses markdown lists to extract product names + URLs, then feeds
 * each through the standard AI extraction pipeline.
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

const _GH_API = 'https://api.github.com'
const GH_RAW = 'https://raw.githubusercontent.com'

/** Curated list of awesome repos to crawl */
const AWESOME_REPOS = [
  { owner: 'awesome-selfhosted', repo: 'awesome-selfhosted', file: 'README.md' },
  { owner: 'ripienaar', repo: 'free-for-dev', file: 'README.md' },
  { owner: 'nicolesaidy', repo: 'awesome-web-design', file: 'README.md' },
  { owner: 'johnjago', repo: 'awesome-free-software', file: 'README.md' },
  { owner: 'kdeldycke', repo: 'awesome-falsehood', file: 'README.md' },
  { owner: 'openappsec', repo: 'awesome-saas-services', file: 'README.md' },
  { owner: 'virajkulkarni14', repo: 'WebDeveloperSecurityChecklist', file: 'README.md' },
] as const

function _githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'MoonmartBot/1.0'
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

/** Fetch raw markdown content of a GitHub file */
async function fetchMarkdown(owner: string, repo: string, file: string): Promise<string> {
  const url = `${GH_RAW}/${owner}/${repo}/HEAD/${file}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'MoonmartBot/1.0' },
    signal: AbortSignal.timeout(20_000)
  })
  if (!res.ok) throw new Error(`GitHub raw ${owner}/${repo} → ${res.status}`)
  return res.text()
}

interface ExtractedLink {
  name: string
  url: string
  description: string
}

/**
 * Parse markdown to extract [Name](url) — description style entries.
 * Handles both:
 *   - **[Name](url)** — description
 *   - - [Name](url) — description
 */
function extractLinksFromMarkdown(markdown: string): ExtractedLink[] {
  const results: ExtractedLink[] = []
  // Match markdown links: [text](url) followed by optional description
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)(?:[^—–\n]*[—–]\s*([^\n]+))?/g

  let match: RegExpExecArray | null
  while ((match = linkRegex.exec(markdown)) !== null) {
    const name = match[1].trim()
    const url = match[2].trim()
    const description = (match[3] || '').trim()

    // Skip GitHub repo URLs (we want product websites, not source repos)
    if (url.includes('github.com') && !url.includes('/releases')) continue
    // Skip anchors and docs
    if (url.includes('#') || url.endsWith('.pdf') || url.endsWith('.md')) continue
    // Skip obvious non-product links
    if (/wikipedia|twitter\.com|reddit\.com|youtube\.com|linkedin\.com/i.test(url)) continue

    results.push({ name, url, description })
  }

  return results
}

export async function runAwesomeListsCrawler(
  limit = 200
): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'awesomelists', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allLinks: ExtractedLink[] = []

    for (const { owner, repo, file } of AWESOME_REPOS) {
      try {
        console.log(`[awesomelists] Fetching ${owner}/${repo}/${file}`)
        const markdown = await fetchMarkdown(owner, repo, file)
        const links = extractLinksFromMarkdown(markdown)
        console.log(`[awesomelists] Found ${links.length} links in ${owner}/${repo}`)
        allLinks.push(...links)
        await new Promise(r => setTimeout(r, 800))
      }
      catch (err) {
        console.error(`[awesomelists] Failed to fetch ${owner}/${repo}:`, err)
      }
    }

    found = allLinks.length

    // Deduplicate URLs
    const newUrls = filterNew(allLinks.map(l => l.url))
    const newSet = new Set(newUrls)
    const toProcess = allLinks
      .filter(l => newSet.has(l.url))
      .slice(0, limit)

    const now = new Date().toISOString()

    for (const link of toProcess) {
      try {
        // Use list metadata as base, enrich with AI
        let extracted = {
          name: link.name,
          tagline: link.description || link.name,
          short_description: link.description || '',
          long_description: link.description || '',
          category: 'Other' as const,
          pricing_type: 'contact' as const,
          pricing_starts_at: null as number | null,
          target_audience: '',
          key_features: [] as string[],
          integrations: [] as string[],
          logo_url: null as string | null,
          website_url: link.url,
          founded_year: null as number | null,
          confidence: {
            name: 0.9,
            description: link.description ? 0.6 : 0.1,
            category: 0.1,
            pricing: 0.1,
            features: 0.1,
            overall: 0.32
          }
        }

        // AI enrichment (best-effort)
        try {
          const pageText = await fetchPageText(link.url)
          const aiResult = await extractWithAI(pageText, link.url)
          extracted = {
            ...extracted,
            category: aiResult.category,
            pricing_type: aiResult.pricing_type,
            pricing_starts_at: aiResult.pricing_starts_at,
            key_features: aiResult.key_features,
            target_audience: aiResult.target_audience,
            long_description: aiResult.long_description || extracted.long_description,
            short_description: aiResult.short_description || extracted.short_description,
            logo_url: aiResult.logo_url,
            confidence: aiResult.confidence
          }
        }
        catch { /* AI enrichment optional */ }

        const score = computeScore(extracted.confidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, founder_email, processed_at, created_at)
          VALUES (?, 'awesomelists', ?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          itemId,
          link.url,
          link.url,
          JSON.stringify(extracted),
          score,
          status,
          now,
          now
        )

        added++
      }
      catch (err) {
        console.error('[awesomelists] Failed for', link.url, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 1200))
    }

    db.prepare(
      `UPDATE agent_runs SET status = 'done', finished_at = ?, items_found = ?, items_added = ?, items_failed = ? WHERE id = ?`
    ).run(new Date().toISOString(), found, added, failed, runId)
  }
  catch (err) {
    console.error('[awesomelists] Fatal error:', err)
    db.prepare(`UPDATE agent_runs SET status = 'error', finished_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), runId)
    throw err
  }

  return { found, added, failed }
}
