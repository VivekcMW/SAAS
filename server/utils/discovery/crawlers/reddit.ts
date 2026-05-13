/**
 * Reddit Crawler
 * Sources: r/SaaS, r/microsaas, r/startups, r/indiehackers (launch posts)
 * Auth: Requires REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET (OAuth2 client_credentials)
 * Schedule: Daily
 * Est. apps: ~20-40 new posts per run
 *
 * Uses Reddit OAuth2 app-only flow (no user account needed).
 * Searches for launch/product posts and extracts external URLs.
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore, type FieldConfidence } from '~/server/utils/ai-extractor'

const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token'
const REDDIT_API = 'https://oauth.reddit.com'

/** Subreddits + search queries to mine for SaaS launches */
const SEARCH_TARGETS = [
  { sub: 'SaaS', q: 'launch OR "just launched" OR "I built"', sort: 'new' },
  { sub: 'microsaas', q: 'launch OR product OR tool', sort: 'new' },
  { sub: 'indiehackers', q: 'launched OR "just shipped"', sort: 'new' },
  { sub: 'startups', q: '"SaaS" launch new product', sort: 'new' }
]

const SKIP_DOMAINS = [
  'github.com', 'gitlab.com', 'reddit.com', 'medium.com', 'dev.to',
  'youtube.com', 'twitter.com', 'x.com', 'linkedin.com', 'substack.com',
  'producthunt.com', 'news.ycombinator.com', 'notion.so', 'docs.google.com'
]

interface RedditPost {
  id: string
  title: string
  url: string
  selftext: string
  subreddit: string
  author: string
  score: number
  created_utc: number
}

interface RedditTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

function isSaasUrl(url: string): boolean {
  if (!url.startsWith('http')) return false
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return !SKIP_DOMAINS.some(s => host.endsWith(s))
  }
  catch { return false }
}

/** Extract product URL from a Reddit post — prefer the linked URL, then scan selftext for URLs */
function extractProductUrl(post: RedditPost): string | null {
  // Self-posts link to reddit itself — extract URL from text
  if (!isSaasUrl(post.url)) {
    // Try to find a URL in the post text
    const urlMatch = /https?:\/\/[^\s\])"]+/g.exec(post.selftext)
    if (urlMatch && isSaasUrl(urlMatch[0])) return urlMatch[0]
    return null
  }
  return post.url
}

async function getRedditToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are required')
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(REDDIT_TOKEN_URL, {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'SaasWorldBot/1.0 by SaasWorld'
    },
    body: 'grant_type=client_credentials'
  })

  if (!res.ok) throw new Error(`Reddit token error: ${res.status}`)
  const data = await res.json() as RedditTokenResponse
  return data.access_token
}

async function searchSubreddit(
  token: string,
  sub: string,
  q: string,
  sort: string,
  limit = 25
): Promise<RedditPost[]> {
  const params = new URLSearchParams({
    q,
    sort,
    t: 'week',
    limit: String(limit),
    restrict_sr: 'true'
  })

  const res = await fetch(`${REDDIT_API}/r/${sub}/search.json?${params}`, {
    signal: AbortSignal.timeout(15_000),
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'SaasWorldBot/1.0 by SaasWorld'
    }
  })

  if (!res.ok) {
    console.warn(`[reddit-crawler] /r/${sub} search returned ${res.status}`)
    return []
  }

  const json = await res.json() as { data: { children: Array<{ data: RedditPost }> } }
  return json.data.children.map(c => c.data)
}

export async function runRedditCrawler(limit = 60): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'reddit', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const token = await getRedditToken()
    const allPosts: (RedditPost & { productUrl: string })[] = []

    for (const target of SEARCH_TARGETS) {
      const posts = await searchSubreddit(token, target.sub, target.q, target.sort, 25)
      for (const post of posts) {
        const productUrl = extractProductUrl(post)
        if (productUrl) allPosts.push({ ...post, productUrl })
      }
      await new Promise(r => setTimeout(r, 1500))
    }

    // Deduplicate within batch
    const seen = new Set<string>()
    const unique = allPosts.filter(p => {
      if (seen.has(p.productUrl)) return false
      seen.add(p.productUrl)
      return true
    })

    found = unique.length

    const newUrls = filterNew(unique.map(p => p.productUrl))
    const newSet = new Set(newUrls)
    const toProcess = unique.filter(p => newSet.has(p.productUrl)).slice(0, limit)

    const now = new Date().toISOString()

    for (const post of toProcess) {
      try {
        const extracted: Record<string, unknown> = {
          name: post.title.replace(/^(Show HN:|Launch:|Launched:|I built|We built)\s*/i, '').trim(),
          tagline: '',
          short_description: post.selftext.slice(0, 300).trim(),
          long_description: '',
          category: 'Other',
          pricing_type: 'contact',
          pricing_starts_at: null,
          target_audience: '',
          key_features: [],
          integrations: [],
          logo_url: null,
          website_url: post.productUrl,
          founded_year: null,
          reddit_score: post.score,
          reddit_subreddit: post.subreddit,
          confidence: {
            name: 0.5,
            description: post.selftext.length > 50 ? 0.5 : 0.2,
            category: 0.2,
            pricing: 0.1,
            features: 0.1,
            overall: 0.3
          }
        }

        // AI enrichment
        try {
          const pageText = await fetchPageText(post.productUrl)
          const aiResult = await extractWithAI(pageText, post.productUrl)
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
        catch { /* site unreachable */ }

        const score = computeScore(extracted.confidence as FieldConfidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')
        const sourceUrl = `https://reddit.com/r/${post.subreddit}/comments/${post.id}`

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, processed_at, created_at)
          VALUES (?, 'reddit', ?, ?, ?, ?, ?, ?, ?)
        `).run(itemId, sourceUrl, post.productUrl, JSON.stringify(extracted), score, status, now, now)

        added++
      }
      catch (err) {
        console.error('[reddit-crawler] Failed for', post.productUrl, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 3000))
    }
  }
  catch (err) {
    console.error('[reddit-crawler] Fatal error', err)
    db.prepare(`UPDATE agent_runs SET status='error', finished_at=? WHERE id=?`).run(new Date().toISOString(), runId)
    throw err
  }

  db.prepare(`
    UPDATE agent_runs SET status='done', finished_at=?, urls_found=?, urls_new=?, urls_failed=? WHERE id=?
  `).run(new Date().toISOString(), found, added, failed, runId)

  console.log(`[reddit-crawler] Done. found=${found} added=${added} failed=${failed}`)
  return { found, added, failed }
}
