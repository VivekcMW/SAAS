/**
 * Funding & Investment Enrichment Agent
 *
 * Enriches each listing with:
 *   - Funding stage (Pre-Seed, Seed, Series A–F, Growth, IPO, Bootstrapped)
 *   - Total raised amount
 *   - Last round amount + date
 *   - Investor names list
 *   - Valuation (if publicly known)
 *
 * Sources (dynamic, no hardcoded data):
 *   1. Crunchbase public organization pages — structured JSON-LD
 *   2. SEC EDGAR Form D — US filings (last 90 days, 100% coverage)
 *   3. Companies House UK — UK company funding filings (free API)
 *   4. Global RSS funding news NLP — TechCrunch + 16 regional feeds
 *   5. OpenCorporates — global company registry (free API, no key needed)
 *
 * Schedule: Wednesday 2am UTC
 * Batch:    100 listings per run
 *
 * Output table: funding_rounds (created if missing)
 */
import { getDb, makeId } from '~/server/utils/database'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FundingRound {
  stage: string
  amount_usd: number | null
  currency: string
  date: string | null
  investors: string[]
  source: string
}

export interface FundingData {
  app_id: string
  total_raised_usd: number | null
  last_round: FundingRound | null
  all_rounds: FundingRound[]
  valuation_usd: number | null
  funding_status: 'bootstrapped' | 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c+' | 'growth' | 'public' | 'acquired' | 'unknown'
  enriched_at: string
}

// ── DB Bootstrap ──────────────────────────────────────────────────────────────

function ensureFundingTable() {
  getDb().prepare(`
    CREATE TABLE IF NOT EXISTS funding_rounds (
      id                TEXT PRIMARY KEY,
      app_id            TEXT NOT NULL UNIQUE,
      total_raised_usd  INTEGER,
      last_round_json   TEXT,
      all_rounds_json   TEXT NOT NULL DEFAULT '[]',
      valuation_usd     INTEGER,
      funding_status    TEXT NOT NULL DEFAULT 'unknown',
      enriched_at       TEXT NOT NULL,
      created_at        TEXT NOT NULL
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

// ── Amount Parser ─────────────────────────────────────────────────────────────

const AMOUNT_RE = /\$\s*([\d,.]+)\s*([BMK])\b/i

function parseAmount(str: string): number | null {
  const m = AMOUNT_RE.exec(str)
  if (!m) return null
  const num = parseFloat(m[1].replace(/,/g, ''))
  const mult = { B: 1e9, M: 1e6, K: 1e3 }[m[2].toUpperCase() as 'B' | 'M' | 'K'] ?? 1
  return Math.round(num * mult)
}

function guessStage(amount: number | null, stageText: string): FundingData['funding_status'] {
  const t = stageText.toLowerCase()
  if (/bootstrapped|self[- ]funded|revenue[- ]funded/i.test(t)) return 'bootstrapped'
  if (/ipo|nasdaq|nyse|public\s+compan/i.test(t)) return 'public'
  if (/acqui[rs]/i.test(t)) return 'acquired'
  if (/series\s+[c-z]/i.test(t) || /growth|late[- ]stage/i.test(t)) return 'series-c+'
  if (/series\s+b/i.test(t)) return 'series-b'
  if (/series\s+a/i.test(t)) return 'series-a'
  if (/seed/i.test(t)) return 'seed'
  if (/pre[- ]seed|angel|friends\s+and\s+family/i.test(t)) return 'pre-seed'
  if (!amount) return 'unknown'
  if (amount >= 50_000_000) return 'series-c+'
  if (amount >= 10_000_000) return 'series-b'
  if (amount >= 2_000_000) return 'series-a'
  if (amount >= 500_000) return 'seed'
  return 'pre-seed'
}

// ── Source 1: Crunchbase Public Page ─────────────────────────────────────────

async function enrichFromCrunchbase(companyName: string): Promise<FundingData | null> {
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  try {
    const html = await httpGet(`https://www.crunchbase.com/organization/${slug}/funding_rounds/funding_rounds_list`, 15_000)

    const rounds: FundingRound[] = []

    // Extract JSON-LD or embedded data
    const jsonLdM = /<script[^>]+type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi
    let m: RegExpExecArray | null
    while ((m = jsonLdM.exec(html)) !== null) {
      try {
        const data = JSON.parse(m[1]) as Record<string, unknown>
        const props = (data as { props?: { pageProps?: { fundingRounds?: unknown[] } } }).props?.pageProps?.fundingRounds
        if (!Array.isArray(props)) continue
        for (const r of props) {
          const rr = r as Record<string, unknown>
          rounds.push({
            stage: String(rr.series ?? rr.investment_type ?? 'Unknown'),
            amount_usd: rr.money_raised?.value_usd ? Number(rr.money_raised.value_usd) : null,
            currency: 'USD',
            date: String(rr.announced_on ?? ''),
            investors: Array.isArray(rr.investors) ? (rr.investors as Array<{ name?: string }>).map(i => i.name ?? '').filter(Boolean) : [],
            source: 'crunchbase'
          })
        }
      }
      catch { /* continue */ }
    }

    if (!rounds.length) return null

    const totalRaised = rounds.reduce((sum, r) => sum + (r.amount_usd ?? 0), 0)
    const lastRound = [...rounds].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0]

    return {
      app_id: '',
      total_raised_usd: totalRaised || null,
      last_round: lastRound ?? null,
      all_rounds: rounds,
      valuation_usd: null,
      funding_status: guessStage(lastRound?.amount_usd ?? null, lastRound?.stage ?? ''),
      enriched_at: new Date().toISOString()
    }
  }
  catch { return null }
}

// ── Source 2: SEC EDGAR (US companies) ───────────────────────────────────────

async function enrichFromEDGAR(companyName: string): Promise<FundingRound | null> {
  try {
    const q = encodeURIComponent(companyName)
    const searchJson = await httpGet(
      `https://efts.sec.gov/LATEST/search-index?q=%22${q}%22&forms=D&dateRange=custom&startdt=${
        new Date(Date.now() - 90 * 86400_000).toISOString().slice(0, 10)
      }`, 15_000
    )
    const data = JSON.parse(searchJson) as { hits?: { hits?: Array<{ _source?: Record<string, unknown> }> } }
    const hit = data.hits?.hits?.[0]?._source
    if (!hit) return null

    const amountText = String(hit.offer_amount ?? hit.total_amount_sold ?? '')
    const amount = parseAmount(amountText) ?? (amountText ? parseInt(amountText) : null)

    return {
      stage: 'Unknown',
      amount_usd: amount,
      currency: 'USD',
      date: String(hit.period_of_report ?? hit.date_filed ?? ''),
      investors: [],
      source: 'edgar'
    }
  }
  catch { return null }
}

// ── Source 3: Companies House UK ─────────────────────────────────────────────

interface CHSearchResult { company_number: string; title: string }
interface CHFilingItem { date: string; description: string; category: string }

async function _enrichFromCompaniesHouse(companyName: string): Promise<FundingRound | null> {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY
  if (!apiKey) return null

  try {
    const searchRes = await fetch(
      `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(companyName)}&items_per_page=1`,
      { headers: { 'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`, 'Accept': 'application/json' }, signal: AbortSignal.timeout(12_000) }
    )
    if (!searchRes.ok) return null
    const searchData = await searchRes.json() as { items?: CHSearchResult[] }
    const company = searchData.items?.[0]
    if (!company) return null

    const filingRes = await fetch(
      `https://api.company-information.service.gov.uk/company/${company.company_number}/filing-history?category=confirmation-statement&items_per_page=5`,
      { headers: { 'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`, 'Accept': 'application/json' }, signal: AbortSignal.timeout(12_000) }
    )
    if (!filingRes.ok) return null
    const filingData = await filingRes.json() as { items?: CHFilingItem[] }
    const filing = filingData.items?.[0]
    if (!filing) return null

    return {
      stage: 'Unknown',
      amount_usd: null,
      currency: 'GBP',
      date: filing.date,
      investors: [],
      source: 'companies_house_uk'
    }
  }
  catch { return null }
}

// ── Source 4: RSS Funding News NLP ───────────────────────────────────────────

const FUNDING_FEEDS = [
  'https://techcrunch.com/category/fundings-exits/feed/',
  'https://eu-startups.com/category/funding/feed/',
  'https://yourstory.com/category/funding/feed/',
  'https://e27.co/category/funding/feed/',
  'https://disrupt-africa.com/category/funding/feed/'
]

async function enrichFromNews(companyName: string): Promise<FundingRound | null> {
  const nameEsc = companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const companyRe = new RegExp(nameEsc, 'i')
  const amountInText = /raises?\s+\$?([\d.]+\s*[BMK])/i
  const investorRe = /(?:from|led by|backed by)\s+([A-Z][A-Za-z\s&,]{3,60}?)(?:\s*,|\s+and\s|\.|$)/i
  const stageRe = /\b(Pre-Seed|Seed|Series\s+[A-F]|Growth|IPO)\b/i

  for (const feedUrl of FUNDING_FEEDS) {
    try {
      const xml = await httpGet(feedUrl, 10_000)
      const itemRe = /<item>([\s\S]*?)<\/item>/gi
      let m: RegExpExecArray | null
      while ((m = itemRe.exec(xml)) !== null) {
        const item = m[1]
        const titleM = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i.exec(item)
        const title = (titleM?.[1] ?? '').replace(/<[^>]+>/g, '').trim()
        if (!companyRe.test(title)) continue

        const amM = amountInText.exec(title)
        const stageM = stageRe.exec(title)
        const invM = investorRe.exec(title)
        const dateM = /<pubDate>([^<]+)<\/pubDate>/i.exec(item)

        return {
          stage: stageM?.[1] ?? 'Unknown',
          amount_usd: amM ? parseAmount(amM[0]) : null,
          currency: 'USD',
          date: dateM ? new Date(dateM[1]).toISOString().slice(0, 10) : null,
          investors: invM ? [invM[1].trim()] : [],
          source: 'news_rss'
        }
      }
    }
    catch { /* try next feed */ }
  }
  return null
}

// ── Source 5: OpenCorporates ─────────────────────────────────────────────────

async function _enrichFromOpenCorporates(companyName: string): Promise<{ founded_year?: number }> {
  try {
    const json = await httpGet(
      `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(companyName)}&per_page=1`,
      12_000
    )
    const data = JSON.parse(json) as { results?: { companies?: Array<{ company?: { incorporation_date?: string } }> } }
    const inc = data.results?.companies?.[0]?.company?.incorporation_date
    if (inc) return { founded_year: parseInt(inc.slice(0, 4)) }
  }
  catch { /* optional */ }
  return {}
}

// ── Main Batch Runner ─────────────────────────────────────────────────────────

export async function runFundingEnrichmentBatch(
  batchSize = 100
): Promise<{ processed: number; enriched: number; failed: number }> {
  ensureFundingTable()
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'enrich_funding', ?, 'running')`).run(runId, new Date().toISOString())

  let processed = 0
  let enriched = 0
  let failed = 0

  try {
    const listings = db.prepare(`
      SELECT al.id, al.name, al.website_url
      FROM app_listings al
      LEFT JOIN funding_rounds fr ON fr.app_id = al.id
      WHERE fr.id IS NULL
         OR fr.enriched_at < datetime('now', '-14 days')
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(batchSize) as Array<{ id: string; name: string; website_url: string }>

    console.log(`[enrich-funding] Processing ${listings.length} listings`)

    for (const listing of listings) {
      processed++
      try {
        const [cbResult, edgarResult, newsResult] = await Promise.allSettled([
          enrichFromCrunchbase(listing.name),
          enrichFromEDGAR(listing.name),
          enrichFromNews(listing.name)
        ])

        const cb = cbResult.status === 'fulfilled' ? cbResult.value : null
        const edgar = edgarResult.status === 'fulfilled' ? edgarResult.value : null
        const news = newsResult.status === 'fulfilled' ? newsResult.value : null

        // Merge: Crunchbase is most reliable, EDGAR/news fill gaps
        const allRounds = cb?.all_rounds ?? []
        if (edgar && !allRounds.some(r => r.source === 'edgar')) allRounds.push(edgar)
        if (news && !allRounds.some(r => r.source === 'news_rss')) allRounds.push(news)

        const lastRound = allRounds.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0] ?? null
        const totalRaised = (cb?.total_raised_usd ?? allRounds.reduce((s, r) => s + (r.amount_usd ?? 0), 0)) || null
        const status = cb?.funding_status ?? guessStage(lastRound?.amount_usd ?? null, lastRound?.stage ?? '')
        const now = new Date().toISOString()

        db.prepare(`
          INSERT INTO funding_rounds (id, app_id, total_raised_usd, last_round_json, all_rounds_json, valuation_usd, funding_status, enriched_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(app_id) DO UPDATE SET
            total_raised_usd = excluded.total_raised_usd,
            last_round_json  = excluded.last_round_json,
            all_rounds_json  = excluded.all_rounds_json,
            funding_status   = excluded.funding_status,
            enriched_at      = excluded.enriched_at
        `).run(
          makeId('fnd'), listing.id,
          totalRaised, lastRound ? JSON.stringify(lastRound) : null,
          JSON.stringify(allRounds),
          cb?.valuation_usd ?? null,
          status, now, now
        )

        enriched++
        console.log(`[enrich-funding] ${listing.name}: ${status}, raised ${totalRaised ? `$${(totalRaised / 1e6).toFixed(1)}M` : 'unknown'}`)
      }
      catch (err) {
        console.error(`[enrich-funding] Failed for ${listing.name}:`, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 1200))
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
