/**
 * Dynamic Worldwide VC & Startup Discovery
 *
 * Discovers new VCs and startups globally WITHOUT any hardcoded VC URLs.
 * Every run self-updates its own source list by learning new VC domains.
 *
 * Schedule: Sunday 6am UTC (after angels at 4am, after dedup at 1am)
 * Est. startups per run: 500–2,000 (grows over time as vc_sources fills up)
 *
 * ── 5 Discovery Sources ────────────────────────────────────────────────────
 *
 * 1. Global Tech Media RSS Feeds (NLP funding extraction)
 *    Regions: US, EU, UK, India, SEA, APAC, LatAm, Africa, MENA, Nordics
 *    Feeds:   TechCrunch, VentureBeat, EU-Startups, Sifted, Tech.eu, e27,
 *             TechInAsia, DealStreetAsia, YourStory, Contxto, Disrupt Africa,
 *             Wamda, BusinessWire (funding)
 *    Output:  startup names + VC names from funding headlines
 *
 * 2. SEC EDGAR Form D Filings (US only, but ~100% coverage)
 *    Source:  https://efts.sec.gov — all US startups must file before raising
 *    Output:  company names from last 14 days of D-form filings
 *
 * 3. VC Trade Association Member Directories (10 regions)
 *    Orgs:    NVCA (US), BVCA (UK), Invest Europe (EU), AVCJ (Asia),
 *             LAVCA (LatAm), AVCA (Africa), SVCA (SEA), IVCA (India),
 *             CVCA (Canada), AVCAL (Australasia)
 *    Output:  VC firm websites → auto-probed for portfolio pages
 *
 * 4. GitHub Awesome-VC Community Lists
 *    Sources: Known awesome-vc repos + dynamic GitHub search for new ones
 *    Output:  VC firm websites → auto-probed for portfolio pages
 *
 * 5. Self-Learning vc_sources Table
 *    Crawls portfolio pages of all previously discovered VC domains
 *    (last_crawled > 7 days ago) — the engine grows smarter every week
 *
 * ── Self-learning DB table: vc_sources ────────────────────────────────────
 *    Stores every discovered VC domain + portfolio URL.
 *    Subsequent runs crawl stored VCs automatically — no manual updates needed.
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

// ── Types ────────────────────────────────────────────────────────────────────

interface DiscoveredStartup {
  name: string
  website?: string
  vcName?: string
  source: string
  region: string
}

interface DiscoveredVC {
  name: string
  domain: string
  portfolioUrl?: string
  region: string
  discoveredFrom: string
}

// ── DB bootstrap ─────────────────────────────────────────────────────────────

function ensureVCSourcesTable() {
  const db = getDb()
  db.prepare(`
    CREATE TABLE IF NOT EXISTS vc_sources (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      domain          TEXT UNIQUE NOT NULL,
      portfolio_url   TEXT,
      region          TEXT NOT NULL DEFAULT 'global',
      discovered_from TEXT,
      first_seen      TEXT NOT NULL,
      last_crawled    TEXT,
      status          TEXT NOT NULL DEFAULT 'active'
    )
  `).run()
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function httpGet(url: string, timeoutMs = 20_000): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xml,application/json,*/*',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    signal: AbortSignal.timeout(timeoutMs)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)
  return res.text()
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 1: Global Tech Media RSS Feeds — NLP funding extraction
// ─────────────────────────────────────────────────────────────────────────────

const RSS_FEEDS: Array<{ url: string; region: string }> = [
  // Americas
  { url: 'https://techcrunch.com/feed/', region: 'US' },
  { url: 'https://venturebeat.com/feed/', region: 'US' },
  { url: 'https://www.businesswire.com/rss/home/?rss=G22', region: 'US' },
  { url: 'https://contxto.com/en/feed/', region: 'LatAm' },
  // Europe
  { url: 'https://eu-startups.com/feed/', region: 'EU' },
  { url: 'https://sifted.eu/feed/', region: 'EU' },
  { url: 'https://tech.eu/feed/', region: 'EU' },
  { url: 'https://nordic9.com/feed/', region: 'Nordics' },
  // India
  { url: 'https://yourstory.com/feed', region: 'India' },
  { url: 'https://entrackr.com/feed/', region: 'India' },
  // SEA & APAC
  { url: 'https://e27.co/feed/', region: 'SEA' },
  { url: 'https://www.techinasia.com/feed', region: 'APAC' },
  { url: 'https://dealstreetasia.com/feed/', region: 'APAC' },
  { url: 'https://kr-asia.com/feed', region: 'APAC' },
  // Africa & MENA
  { url: 'https://disrupt-africa.com/feed/', region: 'Africa' },
  { url: 'https://wamda.com/feed/', region: 'MENA' },
  { url: 'https://magnitt.com/feed/', region: 'MENA' },
  // ANZ
  { url: 'https://www.startupdaily.net/feed/', region: 'Australasia' },
]

// Matches: "Acme raises $5M Series A" / "Acme secures $12M from ..."
const FUNDING_TITLE_RE = /^([A-Z][A-Za-z0-9\s&.,'!-]{2,50}?)\s+(?:raises?|secures?|closes?|lands?|gets?|announces?)\s+\$?([\d.]+\s*[MBKmb]+)/

// Matches VC name after "led by / from / backed by / with ... from"
const VC_NAME_RE = /(?:led by|from|backed by|with participation(?:\s+from)?)\s+([A-Z][A-Za-z0-9\s&.,']{3,60}?)(?:\s*,|\s+and\s|\.|$)/i

function parseRSSForFunding(xml: string, region: string): DiscoveredStartup[] {
  const results: DiscoveredStartup[] = []
  const itemRe = /<item>([\s\S]*?)<\/item>/gi
  let itemMatch: RegExpExecArray | null

  while ((itemMatch = itemRe.exec(xml)) !== null) {
    const item = itemMatch[1]

    // Extract title (handle CDATA and plain)
    const titleM = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i.exec(item)
    const title = (titleM?.[1] ?? '').replace(/<[^>]+>/g, '').trim()
    if (!title) continue

    const fundingM = FUNDING_TITLE_RE.exec(title)
    if (!fundingM) continue

    const companyName = fundingM[1].trim()
    // Skip if looks like a person name or publication
    if (/^(the|a|an|new|top|how|why|what|when|meet)\b/i.test(companyName)) continue

    // Try to find VC name from title + description combined
    const descM = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i.exec(item)
    const desc = (descM?.[1] ?? '').replace(/<[^>]+>/g, '').slice(0, 500)
    const vcM = VC_NAME_RE.exec(title + ' ' + desc)

    results.push({
      name: companyName,
      vcName: vcM?.[1]?.trim(),
      source: 'rss_funding_news',
      region
    })
  }

  return results
}

async function discoverFromNews(): Promise<{ startups: DiscoveredStartup[]; vcs: DiscoveredVC[] }> {
  const startups: DiscoveredStartup[] = []
  const vcNameSet = new Map<string, string>() // vcName → region

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async feed => {
      const xml = await httpGet(feed.url)
      return { items: parseRSSForFunding(xml, feed.region), region: feed.region }
    })
  )

  for (const r of results) {
    if (r.status !== 'fulfilled') continue
    for (const s of r.items) {
      startups.push(s)
      if (s.vcName) vcNameSet.set(s.vcName, r.region)
    }
  }

  // Convert VC names to probable domains
  const vcs: DiscoveredVC[] = []
  for (const [vcName, region] of vcNameSet) {
    // Strip common suffixes and build slug
    const slug = vcName.toLowerCase()
      .replace(/\b(capital|ventures?|partners?|fund|vc|investments?|group|equity|management)\b/g, '')
      .replace(/[^a-z0-9]+/g, '')
      .trim()
    if (slug.length < 3) continue

    // Priority: .vc > .com > {slug}capital.com > {slug}ventures.com
    vcs.push({ name: vcName, domain: `${slug}.vc`, region, discoveredFrom: 'rss_nlp' })
    vcs.push({ name: vcName, domain: `${slug}.com`, region, discoveredFrom: 'rss_nlp' })
  }

  return { startups, vcs }
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 2: SEC EDGAR Form D (US — all startups raising money must file)
// ─────────────────────────────────────────────────────────────────────────────

async function discoverFromEDGAR(daysBack = 14): Promise<DiscoveredStartup[]> {
  const from = new Date()
  from.setDate(from.getDate() - daysBack)
  const startdt = from.toISOString().slice(0, 10)

  // EDGAR Atom feed for recent Form D filers (no auth required)
  const atomUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=D&dateb=&owner=include&count=100&search_text=&start=0&output=atom`

  try {
    const xml = await httpGet(atomUrl)
    const results: DiscoveredStartup[] = []

    // Parse company-name from Atom <company-name> elements
    const nameRe = /<company-name>([^<]+)<\/company-name>/gi
    const dateRe = /<filing-date>([^<]+)<\/filing-date>/gi

    let nameM: RegExpExecArray | null
    let dateM: RegExpExecArray | null

    const names: string[] = []
    const dates: string[] = []

    while ((nameM = nameRe.exec(xml)) !== null) names.push(nameM[1].trim())
    while ((dateM = dateRe.exec(xml)) !== null) dates.push(dateM[1].trim())

    for (let i = 0; i < names.length; i++) {
      // Filter to recent filings within our window
      if (dates[i] && dates[i] < startdt) continue
      const name = names[i]
      if (!name || name.length < 3) continue
      // Skip fund names (they contain LLC, LP, TRUST, INC pattern for funds)
      if (/\b(fund|trust|reit|llp|lp\s+[ivx]+)\b/i.test(name)) continue
      results.push({ name, source: 'edgar_form_d', region: 'US' })
    }

    console.log(`[vc-dynamic] EDGAR: ${results.length} Form D filers found`)
    return results
  }
  catch (err) {
    console.warn('[vc-dynamic] EDGAR failed:', err)
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 3: Trade Association Member Directories (10 global regions)
// ─────────────────────────────────────────────────────────────────────────────

const TRADE_DIRECTORIES: Array<{ name: string; url: string; region: string }> = [
  { name: 'NVCA',         url: 'https://nvca.org/members/',                            region: 'US' },
  { name: 'BVCA',         url: 'https://www.bvca.co.uk/Our-Members/',                  region: 'UK' },
  { name: 'Invest Europe', url: 'https://www.investeurope.eu/about-us/members/',        region: 'EU' },
  { name: 'AVCJ',         url: 'https://www.avcj.com/avcj/news/directory/',             region: 'APAC' },
  { name: 'LAVCA',        url: 'https://lavca.org/members/',                            region: 'LatAm' },
  { name: 'AVCA',         url: 'https://www.avca-africa.org/members/',                  region: 'Africa' },
  { name: 'SVCA',         url: 'https://svca.org.sg/members/',                          region: 'SEA' },
  { name: 'IVCA',         url: 'https://www.ivca.in/members',                           region: 'India' },
  { name: 'CVCA',         url: 'https://www.cvca.ca/members/',                          region: 'Canada' },
  { name: 'AVCAL',        url: 'https://www.avcal.com.au/our-members/',                 region: 'Australasia' },
  { name: 'EMPEA',        url: 'https://empea.org/members/',                            region: 'EmergingMarkets' },
  { name: 'GVA',          url: 'https://globalvc.org/members/',                         region: 'global' },
]

function extractVCLinksFromHTML(html: string, region: string, skipDomain: string): DiscoveredVC[] {
  const vcs: DiscoveredVC[] = []
  const seen = new Set<string>()

  const linkRe = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([^<]{3,80})<\/a>/gi
  let m: RegExpExecArray | null

  while ((m = linkRe.exec(html)) !== null) {
    const url = m[1].trim()
    const name = m[2].replace(/<[^>]+>/g, '').trim()

    if (url.includes(skipDomain)) continue
    if (/twitter|linkedin|facebook|youtube|instagram|mailto:|tel:|#|\.(pdf|png|jpg)/i.test(url)) continue

    try {
      const domain = new URL(url).hostname.replace(/^www\./, '')
      if (seen.has(domain)) continue
      seen.add(domain)
      vcs.push({ name, domain, region, discoveredFrom: `directory:${skipDomain}` })
    }
    catch { /* skip */ }
  }

  return vcs
}

async function discoverFromDirectories(): Promise<DiscoveredVC[]> {
  const allVCs: DiscoveredVC[] = []

  const results = await Promise.allSettled(
    TRADE_DIRECTORIES.map(async dir => {
      const html = await httpGet(dir.url)
      const skipDomain = new URL(dir.url).hostname.replace(/^www\./, '')
      return extractVCLinksFromHTML(html, dir.region, skipDomain)
    })
  )

  for (const r of results) {
    if (r.status === 'fulfilled') allVCs.push(...r.value)
    else console.warn('[vc-dynamic] Directory fetch failed:', r.reason)
  }

  console.log(`[vc-dynamic] Trade directories: ${allVCs.length} VC candidates`)
  return allVCs
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 4: GitHub Awesome-VC Community Lists
// ─────────────────────────────────────────────────────────────────────────────

// Seeded list of known awesome-vc README files
const KNOWN_AWESOME_LISTS = [
  'https://raw.githubusercontent.com/breadchris/awesome-vc/main/README.md',
  'https://raw.githubusercontent.com/KrishMunot/awesome-startup/master/README.md',
  'https://raw.githubusercontent.com/ahmadnassri/awesome-startup-resources/master/README.md',
  'https://raw.githubusercontent.com/freeCodeCamp/how-to-contribute-to-open-source/main/README.md',
  'https://raw.githubusercontent.com/dakshshah96/awesome-startup-credits/master/README.md',
]

const GITHUB_SEARCH_API = 'https://api.github.com/search/repositories?q=awesome+venture+capital+investors&sort=stars&per_page=10'

function extractVCLinksFromMarkdown(md: string): DiscoveredVC[] {
  const vcs: DiscoveredVC[] = []
  // Match [Name](https://...) markdown link pattern
  const mdLinkRe = /\[([^\]]{3,80})\]\((https?:\/\/(?!github\.com|twitter\.com|linkedin\.com|crunchbase\.com|wikipedia\.org)[^)]+)\)/g
  let m: RegExpExecArray | null

  while ((m = mdLinkRe.exec(md)) !== null) {
    const name = m[1].trim()
    const url = m[2].trim()
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '')
      vcs.push({ name, domain, region: 'global', discoveredFrom: 'github_awesome' })
    }
    catch { /* skip */ }
  }

  return vcs
}

async function discoverFromGitHub(): Promise<DiscoveredVC[]> {
  const allVCs: DiscoveredVC[] = []

  // Fetch known lists
  const knownResults = await Promise.allSettled(
    KNOWN_AWESOME_LISTS.map(async url => {
      const md = await httpGet(url)
      return extractVCLinksFromMarkdown(md)
    })
  )
  for (const r of knownResults) {
    if (r.status === 'fulfilled') allVCs.push(...r.value)
  }

  // Dynamically search GitHub for more awesome-vc repos
  try {
    const json = await httpGet(GITHUB_SEARCH_API)
    const data = JSON.parse(json) as { items?: Array<{ full_name: string; default_branch: string }> }
    const repos = data.items ?? []

    const dynamicResults = await Promise.allSettled(
      repos.slice(0, 8).map(async repo => {
        const rawUrl = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/README.md`
        const md = await httpGet(rawUrl, 12_000)
        return extractVCLinksFromMarkdown(md)
      })
    )
    for (const r of dynamicResults) {
      if (r.status === 'fulfilled') allVCs.push(...r.value)
    }
  }
  catch (err) {
    console.warn('[vc-dynamic] GitHub search API failed:', err)
  }

  console.log(`[vc-dynamic] GitHub awesome lists: ${allVCs.length} VC candidates`)
  return allVCs
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio URL Auto-Probe
// ─────────────────────────────────────────────────────────────────────────────

const PORTFOLIO_PATHS = [
  '/portfolio', '/portfolio/', '/companies', '/companies/',
  '/portfolio-companies', '/portfolio-companies/', '/investments',
  '/our-portfolio', '/our-companies', '/team-companies', '/startups'
]

async function probePortfolioUrl(domain: string): Promise<string | null> {
  for (const path of PORTFOLIO_PATHS) {
    const url = `https://${domain}${path}`
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(10_000),
        redirect: 'follow'
      })
      if (!res.ok) continue
      const text = await res.text()
      // Must be substantial page with portfolio-like content (not a redirect to homepage)
      if (
        text.length > 4000 &&
        (text.includes('portfolio') || text.includes('companies') || text.includes('investment') || text.includes('backed'))
      ) {
        return url
      }
    }
    catch { /* try next path */ }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Startup Website Resolution (name → URL)
// ─────────────────────────────────────────────────────────────────────────────

async function resolveStartupWebsite(name: string): Promise<string | null> {
  // Strategy 1: DuckDuckGo Instant Answer API (free, no key)
  try {
    const q = encodeURIComponent(`${name} startup official website`)
    const json = await httpGet(`https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1`, 8_000)
    const data = JSON.parse(json) as { AbstractURL?: string; RelatedTopics?: Array<{ FirstURL?: string }> }
    if (data.AbstractURL?.startsWith('http')) return data.AbstractURL
    const first = data.RelatedTopics?.[0]?.FirstURL
    if (first?.startsWith('http') && !first.includes('duckduckgo')) return first
  }
  catch { /* fall through */ }

  // Strategy 2: Slug-guess {name-slug}.com
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 24)
  if (slug.length < 3) return null

  const candidates = [`https://${slug}.com`, `https://${slug}.io`, `https://${slug}.co`]
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(7_000),
        redirect: 'follow'
      })
      if (res.ok) return url
    }
    catch { /* try next */ }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function extractPortfolioCompanies(html: string, vcDomain: string): Array<{ name: string; website: string }> {
  const results: Array<{ name: string; website: string }> = []
  const seen = new Set<string>()

  const linkRe = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([^<]{2,80})<\/a>/gi
  let m: RegExpExecArray | null

  while ((m = linkRe.exec(html)) !== null) {
    const url = m[1].trim()
    const name = m[2].replace(/<[^>]+>/g, '').trim()

    if (url.includes(vcDomain)) continue
    if (/twitter|linkedin|facebook|youtube|instagram|mailto:|tel:|#|\.(pdf|png|jpg)/i.test(url)) continue
    if (name.length < 2 || name.length > 80) continue

    try {
      const domain = new URL(url).hostname.replace(/^www\./, '')
      if (seen.has(domain)) continue
      seen.add(domain)
      results.push({ name, website: url })
    }
    catch { /* skip */ }
  }

  return results
}

function saveDiscoveredVC(vc: DiscoveredVC, portfolioUrl: string | null) {
  const db = getDb()
  const id = `vc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  db.prepare(`
    INSERT OR IGNORE INTO vc_sources (id, name, domain, portfolio_url, region, discovered_from, first_seen, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(id, vc.name, vc.domain, portfolioUrl, vc.region, vc.discoveredFrom, new Date().toISOString())
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

export async function runDynamicVCCrawler(
  limit = 400
): Promise<{ found: number; added: number; vcDiscovered: number; failed: number }> {
  ensureVCSourcesTable()

  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'vc_dynamic', ?, 'running')`)
    .run(runId, new Date().toISOString())

  let found = 0
  let added = 0
  let vcDiscovered = 0
  let failed = 0

  const resolvedStartups: Array<{ name: string; website: string; source: string; region: string }> = []

  try {
    // ── Phase 1: Run all 4 dynamic discovery sources in parallel ─────────────
    console.log('[vc-dynamic] Phase 1: Running all discovery sources...')

    const [newsResult, edgarResult, dirResult, ghResult] = await Promise.allSettled([
      discoverFromNews(),
      discoverFromEDGAR(14),
      discoverFromDirectories(),
      discoverFromGitHub()
    ])

    // ── Phase 2: Collect all discovered VCs, dedupe by domain ────────────────
    console.log('[vc-dynamic] Phase 2: Deduplicating discovered VC domains...')

    const vcByDomain = new Map<string, DiscoveredVC>()

    const addVCs = (vcs: DiscoveredVC[]) => {
      for (const vc of vcs) {
        if (!vcByDomain.has(vc.domain)) vcByDomain.set(vc.domain, vc)
      }
    }

    if (newsResult.status === 'fulfilled') addVCs(newsResult.value.vcs)
    if (dirResult.status === 'fulfilled') addVCs(dirResult.value)
    if (ghResult.status === 'fulfilled') addVCs(ghResult.value)

    console.log(`[vc-dynamic] Total unique VC domain candidates: ${vcByDomain.size}`)

    // ── Phase 3: Probe + save newly seen VC domains ───────────────────────────
    console.log('[vc-dynamic] Phase 3: Probing portfolio URLs for new VC domains...')

    const newVCs = [...vcByDomain.values()].filter(vc => {
      const existing = db.prepare('SELECT id FROM vc_sources WHERE domain = ?').get(vc.domain)
      return !existing
    })

    console.log(`[vc-dynamic] ${newVCs.length} new VC domains to probe (of ${vcByDomain.size} total)`)

    for (const vc of newVCs.slice(0, 60)) {
      try {
        const portfolioUrl = await probePortfolioUrl(vc.domain)
        saveDiscoveredVC(vc, portfolioUrl)
        vcDiscovered++
        console.log(`[vc-dynamic] Saved VC: ${vc.name} (${vc.domain}) → portfolio: ${portfolioUrl ?? 'none'}`)
      }
      catch (err) {
        console.warn(`[vc-dynamic] Probe failed for ${vc.domain}:`, err)
      }
      await new Promise(r => setTimeout(r, 800))
    }

    // ── Phase 4: Crawl portfolio pages from self-learning vc_sources table ───
    console.log('[vc-dynamic] Phase 4: Crawling stored VC portfolio pages...')

    const staleSources = db.prepare(`
      SELECT name, domain, portfolio_url FROM vc_sources
      WHERE portfolio_url IS NOT NULL
        AND status = 'active'
        AND (last_crawled IS NULL OR last_crawled < datetime('now', '-7 days'))
      ORDER BY last_crawled ASC NULLS FIRST
      LIMIT 30
    `).all() as Array<{ name: string; domain: string; portfolio_url: string }>

    console.log(`[vc-dynamic] Crawling ${staleSources.length} stored VC portfolio pages`)

    for (const vc of staleSources) {
      try {
        const html = await httpGet(vc.portfolio_url)
        const companies = extractPortfolioCompanies(html, vc.domain)
        console.log(`[vc-dynamic] ${vc.name}: ${companies.length} companies from portfolio page`)
        for (const c of companies) {
          resolvedStartups.push({ name: c.name, website: c.website, source: `vc_sources:${vc.name}`, region: 'global' })
        }
        db.prepare(`UPDATE vc_sources SET last_crawled = ? WHERE domain = ?`)
          .run(new Date().toISOString(), vc.domain)
        await new Promise(r => setTimeout(r, 1200))
      }
      catch (err) {
        console.warn(`[vc-dynamic] Portfolio crawl failed for ${vc.domain}:`, err)
      }
    }

    // ── Phase 5: Resolve startup names → websites ────────────────────────────
    console.log('[vc-dynamic] Phase 5: Resolving startup websites from news/EDGAR...')

    const namedStartups: DiscoveredStartup[] = []
    if (newsResult.status === 'fulfilled') namedStartups.push(...newsResult.value.startups)
    if (edgarResult.status === 'fulfilled') namedStartups.push(...edgarResult.value)

    // Only resolve a batch (each resolution = 1–2 HTTP calls)
    for (const startup of namedStartups.slice(0, 80)) {
      if (!startup.name || startup.name.length < 3) continue
      try {
        const website = await resolveStartupWebsite(startup.name)
        if (website) {
          resolvedStartups.push({ name: startup.name, website, source: startup.source, region: startup.region })
        }
      }
      catch { /* skip */ }
      await new Promise(r => setTimeout(r, 400))
    }

    console.log(`[vc-dynamic] Total resolved startup URLs: ${resolvedStartups.length}`)
    found = resolvedStartups.length

    // ── Phase 6: Dedupe against DB + AI enrich + insert ─────────────────────
    console.log('[vc-dynamic] Phase 6: Filtering new + AI enriching...')

    const newUrls = filterNew(resolvedStartups.map(s => s.website))
    const newSet = new Set(newUrls)
    const toProcess = resolvedStartups.filter(s => newSet.has(s.website)).slice(0, limit)

    console.log(`[vc-dynamic] ${toProcess.length} new startups to enrich and insert`)

    const now = new Date().toISOString()

    for (const startup of toProcess) {
      try {
        let extracted = {
          name: startup.name,
          tagline: startup.name,
          short_description: '',
          long_description: '',
          category: 'Other' as const,
          pricing_type: 'contact' as const,
          pricing_starts_at: null as number | null,
          target_audience: '',
          key_features: [] as string[],
          integrations: [] as string[],
          logo_url: null as string | null,
          website_url: startup.website,
          founded_year: null as number | null,
          confidence: {
            name: 0.75,
            description: 0.1,
            category: 0.1,
            pricing: 0.1,
            features: 0.1,
            overall: 0.23
          }
        }

        try {
          const pageText = await fetchPageText(startup.website)
          const aiResult = await extractWithAI(pageText, startup.website)
          extracted = {
            ...extracted,
            category: aiResult.category,
            pricing_type: aiResult.pricing_type,
            pricing_starts_at: aiResult.pricing_starts_at,
            key_features: aiResult.key_features,
            target_audience: aiResult.target_audience,
            long_description: aiResult.long_description || '',
            short_description: aiResult.short_description || '',
            tagline: aiResult.tagline || startup.name,
            logo_url: aiResult.logo_url,
            founded_year: aiResult.founded_year,
            confidence: aiResult.confidence
          }
        }
        catch { /* AI enrichment best-effort */ }

        const score = computeScore(extracted.confidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, founder_email, processed_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          itemId,
          startup.source,
          startup.website,
          startup.website,
          JSON.stringify({ ...extracted, discovery_region: startup.region }),
          score,
          status,
          now,
          now
        )

        added++
      }
      catch (err) {
        console.error('[vc-dynamic] Failed for', startup.website, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 1000))
    }

    db.prepare(`UPDATE agent_runs SET status='done', finished_at=?, items_found=?, items_added=?, items_failed=? WHERE id=?`)
      .run(new Date().toISOString(), found, added, failed, runId)

    console.log(`[vc-dynamic] Done — found:${found} added:${added} vcDiscovered:${vcDiscovered} failed:${failed}`)
  }
  catch (err) {
    console.error('[vc-dynamic] Fatal error:', err)
    db.prepare(`UPDATE agent_runs SET status='error', finished_at=? WHERE id=?`)
      .run(new Date().toISOString(), runId)
    throw err
  }

  return { found, added, vcDiscovered, failed }
}
