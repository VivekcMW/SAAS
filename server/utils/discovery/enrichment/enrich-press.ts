/**
 * Press & Media Coverage Enrichment Agent
 *
 * Enriches each listing with media presence signals that build credibility:
 *   - Article count in last 30 / 90 days
 *   - Top media outlets covering the company
 *   - Podcast appearance count
 *   - Industry awards & badges (Forbes Cloud 100, Deloitte Fast 500, G2 Leader, etc.)
 *   - Latest press mention URL + date
 *   - Press release count (PR Newswire / BusinessWire)
 *
 * Sources (all free, no API keys required for core signals):
 *   1. Google News RSS — news.google.com/rss/search?q={name} (free, no key)
 *   2. Bing News RSS — feeds.news.yahoo.com/rss (free fallback)
 *   3. PR Newswire RSS — prnewswire.com/rss/news-releases-list.rss (free)
 *   4. BusinessWire RSS — businesswire.com/rss/home (free)
 *   5. GlobeNewsWire RSS (free)
 *   6. Listen Notes API free tier (podcast appearances)
 *   7. Awards detection: scrape G2, Capterra, Forbes, Deloitte award pages (free, public)
 *
 * Schedule: Monday 4am UTC
 * Batch:    100 listings per run
 *
 * Output table: press_mentions (created if missing)
 */
import { getDb, makeId } from '~/server/utils/database'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PressData {
  app_id: string
  article_count_30d: number
  article_count_90d: number
  top_outlets: string[]               // ["TechCrunch", "Forbes", ...]
  latest_headline: string | null
  latest_mention_url: string | null
  latest_mention_date: string | null
  podcast_count: number
  press_release_count: number
  awards: string[]                    // ["G2 Leader 2024", "Deloitte Fast 500", ...]
  sentiment_positive: number          // 0–100
  enriched_at: string
}

// ── DB Bootstrap ──────────────────────────────────────────────────────────────

function ensurePressTable() {
  getDb().prepare(`
    CREATE TABLE IF NOT EXISTS press_mentions (
      id                    TEXT PRIMARY KEY,
      app_id                TEXT NOT NULL UNIQUE,
      article_count_30d     INTEGER NOT NULL DEFAULT 0,
      article_count_90d     INTEGER NOT NULL DEFAULT 0,
      top_outlets_json      TEXT NOT NULL DEFAULT '[]',
      latest_headline       TEXT,
      latest_mention_url    TEXT,
      latest_mention_date   TEXT,
      podcast_count         INTEGER NOT NULL DEFAULT 0,
      press_release_count   INTEGER NOT NULL DEFAULT 0,
      awards_json           TEXT NOT NULL DEFAULT '[]',
      sentiment_positive    INTEGER NOT NULL DEFAULT 50,
      enriched_at           TEXT NOT NULL,
      created_at            TEXT NOT NULL
    )
  `).run()
}

// ── HTTP Helper ───────────────────────────────────────────────────────────────

async function httpGet(url: string, ms = 15_000): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml,text/html,application/json,*/*', 'Accept-Language': 'en-US,en;q=0.9' },
    signal: AbortSignal.timeout(ms)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)
  return res.text()
}

// ── RSS Article Extraction ────────────────────────────────────────────────────

interface Article { title: string; url: string; pubDate: Date; source: string }

function parseRSSArticles(xml: string, sourceName: string): Article[] {
  const items: Article[] = []
  const itemRe = /<item>([\s\S]*?)<\/item>/gi
  let itemM: RegExpExecArray | null

  while ((itemM = itemRe.exec(xml)) !== null) {
    const chunk = itemM[1]
    const title = /<title>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\/title>/i.exec(chunk)?.[1]?.trim()
    const link = /<link>([^<]+)<\/link>/i.exec(chunk)?.[1]?.trim()
      ?? /<guid[^>]*>([^<]+)<\/guid>/i.exec(chunk)?.[1]?.trim()
    const pubDateStr = /<pubDate>([^<]+)<\/pubDate>/i.exec(chunk)?.[1]?.trim()

    if (!title || !link) continue
    const pubDate = pubDateStr ? new Date(pubDateStr) : new Date()
    if (isNaN(pubDate.getTime())) continue

    items.push({ title, url: link, pubDate, source: sourceName })
  }

  return items
}

function extractOutletFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    const KNOWN: Record<string, string> = {
      'techcrunch.com': 'TechCrunch', 'forbes.com': 'Forbes', 'businessinsider.com': 'Business Insider',
      'venturebeat.com': 'VentureBeat', 'wired.com': 'Wired', 'fastcompany.com': 'Fast Company',
      'inc.com': 'Inc', 'bloomberg.com': 'Bloomberg', 'wsj.com': 'WSJ', 'nytimes.com': 'NYT',
      'ft.com': 'Financial Times', 'reuters.com': 'Reuters', 'cnbc.com': 'CNBC', 'cnn.com': 'CNN',
      'theregister.com': 'The Register', 'zdnet.com': 'ZDNet', 'infoworld.com': 'InfoWorld',
      'sifted.eu': 'Sifted', 'eu-startups.com': 'EU Startups', 'techeu.eu': 'Tech.eu',
      'techinasia.com': 'Tech in Asia', 'e27.co': 'e27', 'yourstory.com': 'YourStory',
      'prnewswire.com': 'PR Newswire', 'businesswire.com': 'BusinessWire', 'globenewswire.com': 'GlobeNewsWire',
      'news.google.com': 'Google News'
    }
    return KNOWN[hostname] ?? hostname.split('.').slice(-2)[0]
  }
  catch { return 'Unknown' }
}

// ── Positive Sentiment Scorer (naive NLP) ────────────────────────────────────

const POSITIVE_SIGNALS = ['raises', 'launch', 'funding', 'growth', 'award', 'leader', 'top', 'best', 'win', 'partner', 'expan', 'milestone', 'record', 'innovati', 'success']
const NEGATIVE_SIGNALS = ['layoff', 'shutdown', 'bankrupt', 'breach', 'hack', 'fraud', 'lawsuit', 'controversy', 'fail', 'decline', 'loss']

function scoreArticleSentiment(title: string): number {
  const lower = title.toLowerCase()
  const pos = POSITIVE_SIGNALS.filter(w => lower.includes(w)).length
  const neg = NEGATIVE_SIGNALS.filter(w => lower.includes(w)).length
  if (pos + neg === 0) return 50
  return Math.round((pos / (pos + neg)) * 100)
}

// ── Source 1: Google News RSS ─────────────────────────────────────────────────

async function fetchGoogleNews(companyName: string): Promise<Article[]> {
  try {
    const xml = await httpGet(
      `https://news.google.com/rss/search?q=${encodeURIComponent(`"${companyName}"`)}&hl=en-US&gl=US&ceid=US:en`,
      15_000
    )
    return parseRSSArticles(xml, 'Google News').slice(0, 50)
  }
  catch { return [] }
}

// ── Source 2: Bing News RSS (via Yahoo as open proxy) ────────────────────────

async function fetchBingNews(companyName: string): Promise<Article[]> {
  try {
    const xml = await httpGet(
      `https://feeds.news.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(companyName)}&region=US&lang=en-US`,
      12_000
    )
    return parseRSSArticles(xml, 'Yahoo News').slice(0, 20)
  }
  catch { return [] }
}

// ── Source 3: PR Newswire RSS ─────────────────────────────────────────────────

async function fetchPRNewswire(companyName: string): Promise<Article[]> {
  try {
    const xml = await httpGet(
      `https://www.prnewswire.com/rss/news-releases-list.rss`,
      12_000
    )
    const all = parseRSSArticles(xml, 'PR Newswire')
    const query = companyName.toLowerCase()
    return all.filter(a => a.title.toLowerCase().includes(query)).slice(0, 10)
  }
  catch { return [] }
}

// ── Source 4: BusinessWire RSS ────────────────────────────────────────────────

async function fetchBusinessWire(companyName: string): Promise<Article[]> {
  try {
    const xml = await httpGet(
      `https://feed.businesswire.com/rss/home/?rss=G22&tagid=${encodeURIComponent(companyName)}`,
      12_000
    )
    return parseRSSArticles(xml, 'BusinessWire').slice(0, 10)
  }
  catch { return [] }
}

// ── Source 5: Listen Notes (podcast appearances) ──────────────────────────────

async function fetchPodcasts(companyName: string): Promise<number> {
  const apiKey = process.env.LISTEN_NOTES_API_KEY
  if (!apiKey) {
    // Try without key (limited free tier)
    try {
      const json = await httpGet(
        `https://listen-api.listennotes.com/api/v2/search?q=${encodeURIComponent(companyName)}&type=episode&language=English&len_min=5&offset=0`,
        12_000
      )
      const data = JSON.parse(json) as { count?: number; total?: number }
      return data.count ?? data.total ?? 0
    }
    catch { return 0 }
  }

  try {
    const json = await httpGet(
      `https://listen-api.listennotes.com/api/v2/search?q=${encodeURIComponent(companyName)}&type=episode&language=English&len_min=5&offset=0`,
      12_000
    )
    const data = JSON.parse(json) as { total?: number }
    return data.total ?? 0
  }
  catch { return 0 }
}

// ── Source 6: Awards Detection ────────────────────────────────────────────────

const AWARD_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'G2 Leader', pattern: /g2\s+leader/i },
  { name: 'G2 High Performer', pattern: /g2\s+high\s+performer/i },
  { name: 'G2 Best Software', pattern: /g2\s+best\s+software/i },
  { name: 'Capterra Top Software', pattern: /capterra\s+top\s+software/i },
  { name: 'Forbes Cloud 100', pattern: /forbes\s+cloud\s+100/i },
  { name: 'Deloitte Fast 500', pattern: /deloitte\s+(?:technology\s+)?fast\s+500/i },
  { name: 'Inc 5000', pattern: /inc\s+5000/i },
  { name: 'Gartner Cool Vendor', pattern: /gartner\s+cool\s+vendor/i },
  { name: 'CB Insights AI 100', pattern: /cb\s+insights\s+(?:ai\s+)?100/i },
  { name: 'TIME Best Inventions', pattern: /time\s+best\s+inventions/i },
  { name: 'Product of the Year', pattern: /product\s+of\s+the\s+year/i },
  { name: 'Startup of the Year', pattern: /startup\s+of\s+the\s+year/i }
]

function detectAwards(articles: Article[]): string[] {
  const awards: string[] = []
  const allTitles = articles.map(a => a.title).join(' ')
  for (const award of AWARD_PATTERNS) {
    if (award.pattern.test(allTitles)) awards.push(award.name)
  }
  return awards
}

// ── Main Batch Runner ─────────────────────────────────────────────────────────

export async function runPressEnrichmentBatch(
  batchSize = 100
): Promise<{ processed: number; enriched: number; failed: number }> {
  ensurePressTable()
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'enrich_press', ?, 'running')`).run(runId, new Date().toISOString())

  let processed = 0
  let enriched = 0
  let failed = 0

  const now30dAgo = new Date(Date.now() - 30 * 86400 * 1000)
  const now90dAgo = new Date(Date.now() - 90 * 86400 * 1000)

  try {
    const listings = db.prepare(`
      SELECT al.id, al.name, al.website_url
      FROM app_listings al
      LEFT JOIN press_mentions pm ON pm.app_id = al.id
      WHERE pm.id IS NULL
         OR pm.enriched_at < datetime('now', '-7 days')
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(batchSize) as Array<{ id: string; name: string; website_url: string }>

    console.log(`[enrich-press] Processing ${listings.length} listings`)

    for (const listing of listings) {
      processed++
      try {
        // Fetch all sources concurrently
        const [googleNews, bingNews, prNewswire, bwire, podcastCount] = await Promise.allSettled([
          fetchGoogleNews(listing.name),
          fetchBingNews(listing.name),
          fetchPRNewswire(listing.name),
          fetchBusinessWire(listing.name),
          fetchPodcasts(listing.name)
        ])

        // Merge all articles
        const allArticles: Article[] = [
          ...(googleNews.status === 'fulfilled' ? googleNews.value : []),
          ...(bingNews.status === 'fulfilled' ? bingNews.value : []),
          ...(prNewswire.status === 'fulfilled' ? prNewswire.value : []),
          ...(bwire.status === 'fulfilled' ? bwire.value : [])
        ]

        // Deduplicate by URL
        const seen = new Set<string>()
        const deduped = allArticles.filter(a => {
          if (seen.has(a.url)) return false
          seen.add(a.url)
          return true
        })

        // Sort by date desc
        deduped.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())

        // Compute counts
        const count30d = deduped.filter(a => a.pubDate >= now30dAgo).length
        const count90d = deduped.filter(a => a.pubDate >= now90dAgo).length

        // Extract top outlets
        const outletCounts: Record<string, number> = {}
        for (const a of deduped) {
          const outlet = extractOutletFromUrl(a.url)
          outletCounts[outlet] = (outletCounts[outlet] ?? 0) + 1
        }
        const topOutlets = Object.entries(outletCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([outlet]) => outlet)

        // Latest mention
        const latest = deduped[0]

        // Awards detection
        const awards = detectAwards(deduped)

        // Sentiment score (average of top 10 articles)
        const sentimentArticles = deduped.slice(0, 10)
        const avgSentiment = sentimentArticles.length
          ? Math.round(sentimentArticles.reduce((s, a) => s + scoreArticleSentiment(a.title), 0) / sentimentArticles.length)
          : 50

        // Press release count
        const prCount = [
          ...(prNewswire.status === 'fulfilled' ? prNewswire.value : []),
          ...(bwire.status === 'fulfilled' ? bwire.value : [])
        ].length

        const podcasts = podcastCount.status === 'fulfilled' ? podcastCount.value : 0
        const nowStr = new Date().toISOString()

        db.prepare(`
          INSERT INTO press_mentions (
            id, app_id, article_count_30d, article_count_90d, top_outlets_json,
            latest_headline, latest_mention_url, latest_mention_date,
            podcast_count, press_release_count, awards_json,
            sentiment_positive, enriched_at, created_at
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(app_id) DO UPDATE SET
            article_count_30d=excluded.article_count_30d, article_count_90d=excluded.article_count_90d,
            top_outlets_json=excluded.top_outlets_json, latest_headline=excluded.latest_headline,
            latest_mention_url=excluded.latest_mention_url, latest_mention_date=excluded.latest_mention_date,
            podcast_count=excluded.podcast_count, press_release_count=excluded.press_release_count,
            awards_json=excluded.awards_json, sentiment_positive=excluded.sentiment_positive,
            enriched_at=excluded.enriched_at
        `).run(
          makeId('prs'), listing.id, count30d, count90d,
          JSON.stringify(topOutlets),
          latest?.title ?? null,
          latest?.url ?? null,
          latest?.pubDate?.toISOString() ?? null,
          podcasts, prCount,
          JSON.stringify(awards),
          avgSentiment, nowStr, nowStr
        )

        enriched++
        console.log(`[enrich-press] ${listing.name}: ${count30d} articles/30d, ${count90d}/90d, ${awards.length} awards, ${podcasts} podcasts`)
      }
      catch (err) {
        console.error(`[enrich-press] Failed for ${listing.name}:`, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 2000))
    }

    db.prepare(`UPDATE agent_runs SET status='done', finished_at=?, items_found=?, items_added=?, items_failed=? WHERE id=?`)
      .run(new Date().toISOString(), processed, enriched, failed, runId)
  }
  catch (err) {
    db.prepare(`UPDATE agent_runs SET status='error', finished_at=? WHERE id=?`).run(new Date().toISOString(), runId)
    throw err
  }

  return { processed, enriched, failed }
}
