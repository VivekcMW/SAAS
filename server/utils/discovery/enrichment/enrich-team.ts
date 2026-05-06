/**
 * Team & Founder Enrichment Agent
 *
 * Enriches each app_listing / discovery_queue entry with:
 *   - Founder names + titles (About page NLP + LinkedIn)
 *   - Founder email (Hunter.io free API)
 *   - Team size range (LinkedIn + Crunchbase)
 *   - Key executive names (CTO, CMO, VP Engineering)
 *   - Remote / office / hybrid signal (from About + careers pages)
 *
 * Sources (all free, no scraping ToS violation):
 *   1. Company About/Team page — HTML NLP extraction
 *   2. LinkedIn company public page — employee count + executive names
 *   3. Hunter.io domain search — founder email guessing
 *   4. Crunchbase public summary — founder names + roles
 *
 * Schedule: Tuesday 3am UTC
 * Batch:    80 listings per run (rate-limited by Hunter.io free: 25 req/month)
 *
 * Output table: company_team (created if missing)
 */
import { getDb, makeId } from '~/server/utils/database'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TeamData {
  app_id: string
  founders: Array<{ name: string; title: string; linkedin_url?: string; email?: string }>
  executives: Array<{ name: string; title: string }>
  team_size_min: number | null
  team_size_max: number | null
  work_style: 'remote' | 'hybrid' | 'office' | null
  enriched_at: string
}

// ── DB Bootstrap ──────────────────────────────────────────────────────────────

function ensureTeamTable() {
  getDb().prepare(`
    CREATE TABLE IF NOT EXISTS company_team (
      id            TEXT PRIMARY KEY,
      app_id        TEXT NOT NULL UNIQUE,
      founders_json TEXT NOT NULL DEFAULT '[]',
      executives_json TEXT NOT NULL DEFAULT '[]',
      team_size_min INTEGER,
      team_size_max INTEGER,
      work_style    TEXT,
      enriched_at   TEXT NOT NULL,
      created_at    TEXT NOT NULL
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

// ── Source 1: About/Team Page NLP ────────────────────────────────────────────

const ABOUT_PATHS = ['/about', '/about-us', '/team', '/our-team', '/company', '/people']

// Matches "Jane Doe, Co-Founder & CEO" / "John Smith - CTO" / "Meet Jane Doe (Founder)"
const PERSON_RE = /\b([A-Z][a-z]+ (?:[A-Z][a-z]+ )?[A-Z][a-z]+)[,\s\-–—]+(?:is\s+)?([A-Z][A-Za-z\s&,/]{3,50}?)(?:<|,|\.|$)/g

const FOUNDER_TITLE_RE = /\b(?:co-?founder|founder|ceo|chief\s+executive|president|co-?ceo)\b/i
const EXEC_TITLE_RE = /\b(?:cto|cmo|coo|vp\s+(?:of\s+)?(?:engineering|product|sales|marketing)|chief\s+(?:technology|marketing|operating|product))\b/i

const REMOTE_RE = /\bfully\s+remote\b|\bremote.?first\b|\bwork\s+from\s+anywhere\b/i
const HYBRID_RE = /\bhybrid\b/i

const TEAM_SIZE_RE = /\b(\d{1,4})\s*(?:to|-)\s*(\d{1,4})\s*(?:employees|team\s*members|people)\b|\bteam\s+of\s+(\d{1,4})\b/i

function scrapeAboutPage(html: string): Partial<TeamData> {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')

  const founders: TeamData['founders'] = []
  const executives: TeamData['executives'] = []

  let m: RegExpExecArray | null
  PERSON_RE.lastIndex = 0
  while ((m = PERSON_RE.exec(text)) !== null) {
    const name = m[1].trim()
    const title = m[2].trim()
    if (name.split(' ').length < 2) continue
    if (FOUNDER_TITLE_RE.test(title)) {
      if (!founders.some(f => f.name === name)) founders.push({ name, title })
    }
    else if (EXEC_TITLE_RE.test(title)) {
      if (!executives.some(e => e.name === name)) executives.push({ name, title })
    }
  }

  let team_size_min: number | null = null
  let team_size_max: number | null = null
  const tsM = TEAM_SIZE_RE.exec(text)
  if (tsM) {
    if (tsM[1] && tsM[2]) { team_size_min = parseInt(tsM[1]); team_size_max = parseInt(tsM[2]) }
    else if (tsM[3]) { team_size_min = parseInt(tsM[3]); team_size_max = parseInt(tsM[3]) }
  }

  const work_style: TeamData['work_style'] = REMOTE_RE.test(text) ? 'remote' : HYBRID_RE.test(text) ? 'hybrid' : null

  return { founders, executives, team_size_min, team_size_max, work_style }
}

async function enrichFromAboutPage(domain: string): Promise<Partial<TeamData>> {
  for (const path of ABOUT_PATHS) {
    try {
      const html = await httpGet(`https://${domain}${path}`, 12_000)
      const result = scrapeAboutPage(html)
      if (result.founders && result.founders.length > 0) return result
    }
    catch { /* try next path */ }
  }
  return {}
}

// ── Source 2: LinkedIn Company Page ──────────────────────────────────────────

const LI_EMPLOYEE_RE = /["']?(?:employeesOnLinkedIn|companyEmployeesCount|staffCount)["']?\s*:\s*(\d+)/i
const LI_NAME_RE = /<h1[^>]*>([^<]{3,80})<\/h1>/i

async function enrichFromLinkedIn(companySlug: string): Promise<{ team_size_min?: number; team_size_max?: number }> {
  try {
    const html = await httpGet(`https://www.linkedin.com/company/${companySlug}/about/`, 15_000)
    const countM = LI_EMPLOYEE_RE.exec(html)
    if (countM) {
      const count = parseInt(countM[1])
      // Map to LinkedIn bracket ranges
      const brackets: Array<[number, number, number]> = [
        [1, 10, 10], [11, 50, 50], [51, 200, 200], [201, 500, 500],
        [501, 1000, 1000], [1001, 5000, 5000], [5001, 10000, 10000], [10001, 999999, 999999]
      ]
      for (const [min, max] of brackets) {
        if (count >= min && count <= max) return { team_size_min: min, team_size_max: max }
      }
    }
  }
  catch { /* optional */ }
  return {}
}

// ── Source 3: Hunter.io Domain Search ────────────────────────────────────────

interface HunterEmail {
  value: string
  type: string
  confidence: number
  first_name?: string
  last_name?: string
  position?: string
}

async function enrichFromHunter(domain: string): Promise<TeamData['founders']> {
  const apiKey = process.env.HUNTER_API_KEY
  if (!apiKey) return []
  try {
    const res = await fetch(
      `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&limit=10&api_key=${apiKey}`,
      { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(12_000) }
    )
    if (!res.ok) return []
    const data = await res.json() as { data?: { emails?: HunterEmail[] } }
    const emails = data.data?.emails ?? []
    return emails
      .filter(e => e.type === 'personal' && e.confidence > 70 && e.first_name)
      .slice(0, 5)
      .map(e => ({
        name: `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim(),
        title: e.position ?? 'Team Member',
        email: e.value
      }))
  }
  catch { return [] }
}

// ── Source 4: Crunchbase Public Summary ──────────────────────────────────────

interface CrunchbasePerson { name?: string; title?: string; linkedin?: string }

async function enrichFromCrunchbase(companyName: string): Promise<{ founders: TeamData['founders']; team_size_min?: number }> {
  try {
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    const html = await httpGet(`https://www.crunchbase.com/organization/${slug}`, 15_000)

    const founders: TeamData['founders'] = []
    const founderRe = /"title"\s*:\s*"(?:Co-Founder|Founder|CEO)[^"]*"[\s\S]{0,200}?"full_name"\s*:\s*"([^"]+)"/gi
    let m: RegExpExecArray | null
    while ((m = founderRe.exec(html)) !== null) {
      founders.push({ name: m[1].trim(), title: 'Founder' })
    }

    const empM = /"num_employees_enum"\s*:\s*"([^"]+)"/.exec(html)
    const empMap: Record<string, number> = {
      'c_00001_00010': 10, 'c_00011_00050': 50, 'c_00051_00100': 100,
      'c_00101_00250': 250, 'c_00251_00500': 500, 'c_00501_01000': 1000,
      'c_01001_05000': 5000, 'c_05001_10000': 10000
    }

    return { founders, team_size_min: empM ? empMap[empM[1]] : undefined }
  }
  catch { return { founders: [] } }
}

// ── Main Batch Runner ─────────────────────────────────────────────────────────

export async function runTeamEnrichmentBatch(
  batchSize = 80
): Promise<{ processed: number; enriched: number; failed: number }> {
  ensureTeamTable()
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'enrich_team', ?, 'running')`).run(runId, new Date().toISOString())

  let processed = 0
  let enriched = 0
  let failed = 0

  try {
    // Get listings not yet team-enriched (or stale > 30 days)
    const listings = db.prepare(`
      SELECT al.id, al.name, al.website_url
      FROM app_listings al
      LEFT JOIN company_team ct ON ct.app_id = al.id
      WHERE ct.id IS NULL
         OR ct.enriched_at < datetime('now', '-30 days')
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(batchSize) as Array<{ id: string; name: string; website_url: string }>

    console.log(`[enrich-team] Processing ${listings.length} listings`)

    for (const listing of listings) {
      processed++
      try {
        const domain = new URL(listing.website_url).hostname.replace(/^www\./, '')
        const companySlug = domain.split('.')[0]

        const [aboutData, liData, hunterFounders, cbData] = await Promise.allSettled([
          enrichFromAboutPage(domain),
          enrichFromLinkedIn(companySlug),
          enrichFromHunter(domain),
          enrichFromCrunchbase(listing.name)
        ])

        const about = aboutData.status === 'fulfilled' ? aboutData.value : {}
        const li = liData.status === 'fulfilled' ? liData.value : {}
        const hunterF = hunterFounders.status === 'fulfilled' ? hunterFounders.value : []
        const cb = cbData.status === 'fulfilled' ? cbData.value : { founders: [] }

        // Merge founders — prefer About page NLP, fill emails from Hunter
        const founderMap = new Map<string, TeamData['founders'][0]>()
        for (const f of [...(about.founders ?? []), ...(cb.founders ?? [])]) {
          founderMap.set(f.name, f)
        }
        for (const hf of hunterF) {
          if (!founderMap.has(hf.name) && hf.email) founderMap.set(hf.name, hf)
        }

        const founders = [...founderMap.values()].slice(0, 10)
        const executives = (about.executives ?? []).slice(0, 10)
        const team_size_min = about.team_size_min ?? li.team_size_min ?? cb.team_size_min ?? null
        const team_size_max = about.team_size_max ?? li.team_size_max ?? null
        const work_style = about.work_style ?? null
        const now = new Date().toISOString()

        db.prepare(`
          INSERT INTO company_team (id, app_id, founders_json, executives_json, team_size_min, team_size_max, work_style, enriched_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(app_id) DO UPDATE SET
            founders_json = excluded.founders_json,
            executives_json = excluded.executives_json,
            team_size_min = excluded.team_size_min,
            team_size_max = excluded.team_size_max,
            work_style = excluded.work_style,
            enriched_at = excluded.enriched_at
        `).run(makeId('ctm'), listing.id, JSON.stringify(founders), JSON.stringify(executives), team_size_min, team_size_max, work_style, now, now)

        enriched++
        console.log(`[enrich-team] ${listing.name}: ${founders.length} founders, size ${team_size_min ?? '?'}–${team_size_max ?? '?'}`)
      }
      catch (err) {
        console.error(`[enrich-team] Failed for ${listing.website_url}:`, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 1500))
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
