/**
 * Market Intelligence Enrichment Agent
 *
 * Enriches each listing with signals that attract customers, VCs, and press:
 *   - Web traffic estimate + rank (SimilarWeb public)
 *   - G2 rating + review count + categories + badges
 *   - Capterra rating + review count
 *   - Product Hunt rank + votes + featured date
 *   - App Store + Play Store rating (if mobile app)
 *   - Market size estimate (TAM) — NLP from industry analyst quotes on their site
 *   - Competitor list (G2 "compare" alternatives + SaaSHub alternates)
 *   - Domain authority (Moz free API)
 *
 * Sources (dynamic, no hardcoded data):
 *   1. SimilarWeb public embed data
 *   2. G2 product page JSON-LD + structured data
 *   3. Capterra product page JSON-LD
 *   4. Product Hunt public GraphQL API
 *   5. Apple App Store search API (free, no key)
 *   6. Google Play Store scrape
 *   7. SaaSHub public API
 *   8. Moz Link Explorer API (free tier — 10 req/month)
 *
 * Schedule: Thursday 3am UTC
 * Batch:    80 listings per run
 *
 * Output table: market_signals (created if missing)
 */
import { getDb, makeId } from '~/server/utils/database'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MarketData {
  app_id: string
  monthly_visits: number | null
  global_rank: number | null
  g2_rating: number | null
  g2_reviews: number | null
  g2_categories: string[]
  g2_badges: string[]
  capterra_rating: number | null
  capterra_reviews: number | null
  producthunt_votes: number | null
  producthunt_rank: number | null
  producthunt_featured_at: string | null
  appstore_rating: number | null
  appstore_reviews: number | null
  playstore_rating: number | null
  playstore_reviews: number | null
  domain_authority: number | null
  competitors: string[]
  tam_estimate: string | null
  enriched_at: string
}

// ── DB Bootstrap ──────────────────────────────────────────────────────────────

function ensureMarketTable() {
  getDb().prepare(`
    CREATE TABLE IF NOT EXISTS market_signals (
      id                    TEXT PRIMARY KEY,
      app_id                TEXT NOT NULL UNIQUE,
      monthly_visits        INTEGER,
      global_rank           INTEGER,
      g2_rating             REAL,
      g2_reviews            INTEGER,
      g2_categories_json    TEXT NOT NULL DEFAULT '[]',
      g2_badges_json        TEXT NOT NULL DEFAULT '[]',
      capterra_rating       REAL,
      capterra_reviews      INTEGER,
      producthunt_votes     INTEGER,
      producthunt_rank      INTEGER,
      producthunt_featured_at TEXT,
      appstore_rating       REAL,
      appstore_reviews      INTEGER,
      playstore_rating      REAL,
      playstore_reviews     INTEGER,
      domain_authority      INTEGER,
      competitors_json      TEXT NOT NULL DEFAULT '[]',
      tam_estimate          TEXT,
      enriched_at           TEXT NOT NULL,
      created_at            TEXT NOT NULL
    )
  `).run()
}

// ── HTTP Helper ───────────────────────────────────────────────────────────────

async function httpGet(url: string, ms = 15_000): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html,application/json,*/*', 'Accept-Language': 'en-US,en;q=0.9' },
    signal: AbortSignal.timeout(ms)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)
  return res.text()
}

// ── Source 1: SimilarWeb Public Embed ────────────────────────────────────────

async function fetchSimilarWeb(domain: string): Promise<{ monthly_visits: number | null; global_rank: number | null }> {
  try {
    const html = await httpGet(`https://www.similarweb.com/website/${domain}/`, 15_000)
    const visitM = /"totalVisits"\s*:\s*(\d+)/.exec(html) ?? /"Total Visits"\s*:\s*"?([\d.]+[KMB]?)"?/.exec(html)
    const rankM = /"globalRank"\s*:\s*\{[^}]*"rank"\s*:\s*(\d+)/.exec(html)

    let monthly_visits: number | null = null
    if (visitM) {
      const raw = visitM[1]
      if (/[KMB]/i.test(raw)) {
        const num = parseFloat(raw)
        const mult = { K: 1e3, M: 1e6, B: 1e9 }[raw.slice(-1).toUpperCase() as 'K' | 'M' | 'B'] ?? 1
        monthly_visits = Math.round(num * mult)
      }
      else {
        monthly_visits = parseInt(raw)
      }
    }

    return { monthly_visits, global_rank: rankM ? parseInt(rankM[1]) : null }
  }
  catch { return { monthly_visits: null, global_rank: null } }
}

// ── Source 2: G2 ─────────────────────────────────────────────────────────────

const ARATING_RE = /"ratingValue"\s*:\s*([\d.]+)/
const REVIEW_COUNT_RE = /"reviewCount"\s*:\s*(\d+)/
const G2_BADGE_RE = /g2-badge[^"]*"[^>]*>([^<]{3,60})</gi
const G2_CAT_RE = /"category"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/gi
const TAM_RE = /\b(?:market|TAM|total addressable market)[^.]{0,60}?\$\s*([\d.]+\s*[BM])\s*(?:billion|million)?/i

async function fetchG2Stats(appName: string): Promise<Partial<MarketData>> {
  const slug = appName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  try {
    const html = await httpGet(`https://www.g2.com/products/${slug}/reviews`, 15_000)
    const ratingM = ARATING_RE.exec(html)
    const countM = REVIEW_COUNT_RE.exec(html)

    const badges: string[] = []
    let bm: RegExpExecArray | null
    G2_BADGE_RE.lastIndex = 0
    while ((bm = G2_BADGE_RE.exec(html)) !== null) {
      const b = bm[1].trim()
      if (b.length > 2 && !badges.includes(b)) badges.push(b)
    }

    const categories: string[] = []
    let cm: RegExpExecArray | null
    G2_CAT_RE.lastIndex = 0
    while ((cm = G2_CAT_RE.exec(html)) !== null) {
      const c = cm[1].trim()
      if (!categories.includes(c)) categories.push(c)
    }

    const tamM = TAM_RE.exec(html)

    // Also grab competitors from "compare" section
    const competitors: string[] = []
    const compRe = /\/compare\/[^"]+vs-([^"]+)"/gi
    let comp: RegExpExecArray | null
    while ((comp = compRe.exec(html)) !== null) {
      const name = comp[1].replace(/-/g, ' ').trim()
      if (!competitors.includes(name)) competitors.push(name)
    }

    return {
      g2_rating: ratingM ? parseFloat(ratingM[1]) : null,
      g2_reviews: countM ? parseInt(countM[1]) : null,
      g2_categories: categories.slice(0, 5),
      g2_badges: badges.slice(0, 10),
      competitors: competitors.slice(0, 10),
      tam_estimate: tamM ? tamM[0].trim() : null
    }
  }
  catch { return {} }
}

// ── Source 3: Capterra ────────────────────────────────────────────────────────

async function fetchCapterraStats(appName: string): Promise<{ capterra_rating: number | null; capterra_reviews: number | null }> {
  const slug = appName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  try {
    const html = await httpGet(`https://www.capterra.com/p/1/${slug}/`, 15_000)
    const ratingM = /"ratingValue"\s*:\s*([\d.]+)/.exec(html)
    const countM = /"reviewCount"\s*:\s*(\d+)/.exec(html)
    return {
      capterra_rating: ratingM ? parseFloat(ratingM[1]) : null,
      capterra_reviews: countM ? parseInt(countM[1]) : null
    }
  }
  catch { return { capterra_rating: null, capterra_reviews: null } }
}

// ── Source 4: Product Hunt ────────────────────────────────────────────────────

async function fetchProductHunt(appName: string): Promise<{ producthunt_votes: number | null; producthunt_rank: number | null; producthunt_featured_at: string | null }> {
  const slug = appName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  try {
    const query = `{"operationName":"Post","variables":{"slug":"${slug}"},"query":"query Post($slug:String!){post(slug:$slug){votesCount featuredAt reviewsRating}}"}`
    const res = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
      body: query,
      signal: AbortSignal.timeout(12_000)
    })
    if (!res.ok) return { producthunt_votes: null, producthunt_rank: null, producthunt_featured_at: null }
    const data = await res.json() as { data?: { post?: { votesCount?: number; featuredAt?: string; ranking?: number } } }
    const post = data.data?.post
    return {
      producthunt_votes: post?.votesCount ?? null,
      producthunt_rank: post?.ranking ?? null,
      producthunt_featured_at: post?.featuredAt ?? null
    }
  }
  catch { return { producthunt_votes: null, producthunt_rank: null, producthunt_featured_at: null } }
}

// ── Source 5: Apple App Store (free search API) ───────────────────────────────

async function fetchAppStore(appName: string): Promise<{ appstore_rating: number | null; appstore_reviews: number | null }> {
  try {
    const json = await httpGet(
      `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&entity=software&limit=1`, 12_000
    )
    const data = JSON.parse(json) as { results?: Array<{ averageUserRating?: number; userRatingCount?: number }> }
    const result = data.results?.[0]
    return {
      appstore_rating: result?.averageUserRating ? Math.round(result.averageUserRating * 10) / 10 : null,
      appstore_reviews: result?.userRatingCount ?? null
    }
  }
  catch { return { appstore_rating: null, appstore_reviews: null } }
}

// ── Source 6: Google Play Store ───────────────────────────────────────────────

async function fetchPlayStore(appName: string): Promise<{ playstore_rating: number | null; playstore_reviews: number | null }> {
  try {
    const json = await httpGet(
      `https://play.google.com/store/search?q=${encodeURIComponent(appName)}&c=apps&hl=en&gl=US`, 15_000
    )
    const ratingM = /"(\d\.\d)"\s*starsRating|aria-label="Rated\s+([\d.]+)\s+stars/.exec(json)
    const countM = /(\d[\d,]+)\s+ratings/.exec(json)
    return {
      playstore_rating: ratingM ? parseFloat(ratingM[1] ?? ratingM[2]) : null,
      playstore_reviews: countM ? parseInt(countM[1].replace(/,/g, '')) : null
    }
  }
  catch { return { playstore_rating: null, playstore_reviews: null } }
}

// ── Source 7: Moz Domain Authority (free API) ────────────────────────────────

async function fetchMozDA(domain: string): Promise<{ domain_authority: number | null }> {
  const accessId = process.env.MOZ_ACCESS_ID
  const secretKey = process.env.MOZ_SECRET_KEY
  if (!accessId || !secretKey) return { domain_authority: null }

  try {
    const expires = Math.floor(Date.now() / 1000) + 300
    const stringToSign = `${accessId}\n${expires}`
    const { createHmac } = await import('node:crypto')
    const _signature = createHmac('sha1', secretKey).update(stringToSign).digest('base64')

    const res = await fetch('https://lsapi.seomoz.com/v2/url_metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${accessId}:${secretKey}`).toString('base64')}`
      },
      body: JSON.stringify({ targets: [domain] }),
      signal: AbortSignal.timeout(12_000)
    })
    if (!res.ok) return { domain_authority: null }
    const data = await res.json() as { results?: Array<{ domain_authority?: number }> }
    return { domain_authority: data.results?.[0]?.domain_authority ?? null }
  }
  catch { return { domain_authority: null } }
}

// ── Main Batch Runner ─────────────────────────────────────────────────────────

export async function runMarketEnrichmentBatch(
  batchSize = 80
): Promise<{ processed: number; enriched: number; failed: number }> {
  ensureMarketTable()
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'enrich_market', ?, 'running')`).run(runId, new Date().toISOString())

  let processed = 0
  let enriched = 0
  let failed = 0

  try {
    const listings = db.prepare(`
      SELECT al.id, al.name, al.website_url
      FROM app_listings al
      LEFT JOIN market_signals ms ON ms.app_id = al.id
      WHERE ms.id IS NULL
         OR ms.enriched_at < datetime('now', '-7 days')
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(batchSize) as Array<{ id: string; name: string; website_url: string }>

    console.log(`[enrich-market] Processing ${listings.length} listings`)

    for (const listing of listings) {
      processed++
      try {
        const domain = new URL(listing.website_url).hostname.replace(/^www\./, '')

        const [sw, g2, cap, ph, ios, play, moz] = await Promise.allSettled([
          fetchSimilarWeb(domain),
          fetchG2Stats(listing.name),
          fetchCapterraStats(listing.name),
          fetchProductHunt(listing.name),
          fetchAppStore(listing.name),
          fetchPlayStore(listing.name),
          fetchMozDA(domain)
        ])

        const now = new Date().toISOString()
        const data = {
          ...(sw.status === 'fulfilled' ? sw.value : {}),
          ...(g2.status === 'fulfilled' ? g2.value : {}),
          ...(cap.status === 'fulfilled' ? cap.value : {}),
          ...(ph.status === 'fulfilled' ? ph.value : {}),
          ...(ios.status === 'fulfilled' ? ios.value : {}),
          ...(play.status === 'fulfilled' ? play.value : {}),
          ...(moz.status === 'fulfilled' ? moz.value : {})
        } as Partial<MarketData>

        db.prepare(`
          INSERT INTO market_signals (
            id, app_id, monthly_visits, global_rank,
            g2_rating, g2_reviews, g2_categories_json, g2_badges_json,
            capterra_rating, capterra_reviews,
            producthunt_votes, producthunt_rank, producthunt_featured_at,
            appstore_rating, appstore_reviews, playstore_rating, playstore_reviews,
            domain_authority, competitors_json, tam_estimate, enriched_at, created_at
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(app_id) DO UPDATE SET
            monthly_visits=excluded.monthly_visits, global_rank=excluded.global_rank,
            g2_rating=excluded.g2_rating, g2_reviews=excluded.g2_reviews,
            g2_categories_json=excluded.g2_categories_json, g2_badges_json=excluded.g2_badges_json,
            capterra_rating=excluded.capterra_rating, capterra_reviews=excluded.capterra_reviews,
            producthunt_votes=excluded.producthunt_votes, producthunt_rank=excluded.producthunt_rank,
            producthunt_featured_at=excluded.producthunt_featured_at,
            appstore_rating=excluded.appstore_rating, appstore_reviews=excluded.appstore_reviews,
            playstore_rating=excluded.playstore_rating, playstore_reviews=excluded.playstore_reviews,
            domain_authority=excluded.domain_authority, competitors_json=excluded.competitors_json,
            tam_estimate=excluded.tam_estimate, enriched_at=excluded.enriched_at
        `).run(
          makeId('mkt'), listing.id,
          data.monthly_visits ?? null, data.global_rank ?? null,
          data.g2_rating ?? null, data.g2_reviews ?? null,
          JSON.stringify(data.g2_categories ?? []), JSON.stringify(data.g2_badges ?? []),
          data.capterra_rating ?? null, data.capterra_reviews ?? null,
          data.producthunt_votes ?? null, data.producthunt_rank ?? null, data.producthunt_featured_at ?? null,
          data.appstore_rating ?? null, data.appstore_reviews ?? null,
          data.playstore_rating ?? null, data.playstore_reviews ?? null,
          data.domain_authority ?? null,
          JSON.stringify(data.competitors ?? []),
          data.tam_estimate ?? null, now, now
        )

        enriched++
        console.log(`[enrich-market] ${listing.name}: ${data.monthly_visits?.toLocaleString() ?? '?'} visits/mo, G2 ${data.g2_rating ?? '?'}⭐ (${data.g2_reviews ?? 0} reviews)`)
      }
      catch (err) {
        console.error(`[enrich-market] Failed for ${listing.name}:`, err)
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
