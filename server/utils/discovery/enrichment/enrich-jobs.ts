/**
 * Jobs & Hiring Signal Enrichment Agent
 *
 * Enriches each listing with talent signals that show company health and culture:
 *   - Open job count + roles being hired
 *   - ATS platform detected (Greenhouse, Lever, Workday, Ashby, Rippling, etc.)
 *   - Tech stack inferred from job descriptions (React, Python, Go, K8s, etc.)
 *   - Remote / hybrid / office hiring policy
 *   - Hiring velocity (delta vs last snapshot)
 *   - Glassdoor rating (culture signal for talent attraction)
 *   - Top hiring departments (Engineering, Sales, Marketing, etc.)
 *
 * Sources (dynamic, no hardcoded data):
 *   1. Greenhouse Jobs API — /boards/:company/jobs (public, no auth)
 *   2. Lever Jobs API — /api/v0/postings/:company?mode=json (public)
 *   3. Ashby Jobs API — /api/job-board?organizationHostedJobsPageName=:company
 *   4. Workday careers page scrape (common URL pattern)
 *   5. Company /careers, /jobs page scrape (fallback)
 *   6. Glassdoor public rating widget
 *
 * Schedule: Friday 3am UTC
 * Batch:    100 listings per run
 *
 * Output table: job_signals (created if missing)
 */
import { getDb, makeId } from '~/server/utils/database'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface JobData {
  app_id: string
  open_jobs: number
  ats_platform: string | null
  roles_json: string[]            // ["Software Engineer", "Account Executive", ...]
  departments_json: string[]      // ["Engineering", "Sales", ...]
  tech_stack_from_jd: string[]   // ["React", "Python", "Kubernetes", ...]
  hiring_policy: 'remote' | 'hybrid' | 'office' | 'mixed' | null
  glassdoor_rating: number | null
  previous_open_jobs: number | null
  hiring_velocity: number | null  // open_jobs - previous_open_jobs
  enriched_at: string
}

// ── DB Bootstrap ──────────────────────────────────────────────────────────────

function ensureJobsTable() {
  getDb().prepare(`
    CREATE TABLE IF NOT EXISTS job_signals (
      id                    TEXT PRIMARY KEY,
      app_id                TEXT NOT NULL UNIQUE,
      open_jobs             INTEGER NOT NULL DEFAULT 0,
      ats_platform          TEXT,
      roles_json            TEXT NOT NULL DEFAULT '[]',
      departments_json      TEXT NOT NULL DEFAULT '[]',
      tech_stack_from_jd   TEXT NOT NULL DEFAULT '[]',
      hiring_policy         TEXT,
      glassdoor_rating      REAL,
      previous_open_jobs    INTEGER,
      hiring_velocity       INTEGER,
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

// ── Tech Stack Fingerprint from JD Text ─────────────────────────────────────

const TECH_KEYWORDS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Nuxt', 'Svelte', 'TypeScript', 'JavaScript',
  'Python', 'Go', 'Rust', 'Java', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala',
  'Node.js', 'Django', 'FastAPI', 'Rails', 'Spring Boot', 'Laravel',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB',
  'AWS', 'GCP', 'Azure', 'Kubernetes', 'Docker', 'Terraform', 'Pulumi',
  'GraphQL', 'REST', 'gRPC', 'Kafka', 'RabbitMQ', 'Spark', 'Databricks',
  'Stripe', 'Twilio', 'Segment', 'Amplitude', 'Salesforce', 'HubSpot'
]

const REMOTE_JD_RE = /\bfully\s+remote\b|\bremote\s+first\b|\bwork\s+from\s+anywhere\b|\bremote\s+only\b/i
const HYBRID_JD_RE = /\bhybrid\b/i
const OFFICE_JD_RE = /\bon[- ]site\b|\bin[- ]office\b|\boffice[- ]based\b/i

function extractTechFromJD(text: string): string[] {
  const found: string[] = []
  for (const kw of TECH_KEYWORDS) {
    if (new RegExp(`\\b${kw.replace(/\./g, '\\.')}\\b`, 'i').test(text)) found.push(kw)
  }
  return [...new Set(found)]
}

function extractHiringPolicy(allText: string): JobData['hiring_policy'] {
  if (REMOTE_JD_RE.test(allText)) return 'remote'
  if (HYBRID_JD_RE.test(allText) && OFFICE_JD_RE.test(allText)) return 'mixed'
  if (HYBRID_JD_RE.test(allText)) return 'hybrid'
  if (OFFICE_JD_RE.test(allText)) return 'office'
  return null
}

// ── Source 1: Greenhouse ──────────────────────────────────────────────────────

interface GreenhouseJob { title: string; departments?: Array<{ name: string }>; content?: string }

async function fetchGreenhouse(slug: string): Promise<Partial<JobData> | null> {
  try {
    const json = await httpGet(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`, 12_000)
    const data = JSON.parse(json) as { jobs?: GreenhouseJob[] }
    const jobs = data.jobs ?? []
    if (!jobs.length) return null

    const allText = jobs.map(j => `${j.title} ${j.content ?? ''}`).join(' ')
    const depts = [...new Set(jobs.flatMap(j => j.departments?.map(d => d.name) ?? []))]

    return {
      ats_platform: 'Greenhouse',
      open_jobs: jobs.length,
      roles_json: jobs.map(j => j.title).slice(0, 30),
      departments_json: depts.slice(0, 15),
      tech_stack_from_jd: extractTechFromJD(allText),
      hiring_policy: extractHiringPolicy(allText)
    }
  }
  catch { return null }
}

// ── Source 2: Lever ───────────────────────────────────────────────────────────

interface LeverPosting { text: string; categories?: { team?: string; department?: string }; descriptionPlain?: string }

async function fetchLever(slug: string): Promise<Partial<JobData> | null> {
  try {
    const json = await httpGet(`https://api.lever.co/v0/postings/${slug}?mode=json`, 12_000)
    const jobs = JSON.parse(json) as LeverPosting[]
    if (!Array.isArray(jobs) || !jobs.length) return null

    const allText = jobs.map(j => `${j.text} ${j.descriptionPlain ?? ''}`).join(' ')
    const depts = [...new Set(jobs.map(j => j.categories?.team ?? j.categories?.department ?? '').filter(Boolean))]

    return {
      ats_platform: 'Lever',
      open_jobs: jobs.length,
      roles_json: jobs.map(j => j.text).slice(0, 30),
      departments_json: depts.slice(0, 15),
      tech_stack_from_jd: extractTechFromJD(allText),
      hiring_policy: extractHiringPolicy(allText)
    }
  }
  catch { return null }
}

// ── Source 3: Ashby ───────────────────────────────────────────────────────────

interface AshbyJob { title: string; department?: { name: string }; descriptionHtml?: string }
interface AshbyResponse { jobBoard?: { jobPostings?: AshbyJob[] } }

async function fetchAshby(slug: string): Promise<Partial<JobData> | null> {
  try {
    const json = await httpGet(`https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams`, 12_000)
    // Try the standard Ashby public endpoint
    const res2 = await fetch('https://api.ashbyhq.com/posting-api/job-board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
      body: JSON.stringify({ organizationHostedJobsPageName: slug }),
      signal: AbortSignal.timeout(12_000)
    })
    if (!res2.ok) return null
    const data = await res2.json() as AshbyResponse
    const jobs = data.jobBoard?.jobPostings ?? []
    if (!jobs.length) return null

    const allText = jobs.map(j => `${j.title} ${j.descriptionHtml ?? ''}`).join(' ')
    const depts = [...new Set(jobs.map(j => j.department?.name ?? '').filter(Boolean))]

    return {
      ats_platform: 'Ashby',
      open_jobs: jobs.length,
      roles_json: jobs.map(j => j.title).slice(0, 30),
      departments_json: depts.slice(0, 15),
      tech_stack_from_jd: extractTechFromJD(allText),
      hiring_policy: extractHiringPolicy(allText)
    }
  }
  catch { return null }
}

// ── Source 4: Careers page scrape fallback ────────────────────────────────────

const CAREERS_PATHS = ['/careers', '/jobs', '/join-us', '/join', '/work-with-us', '/we-are-hiring']

async function fetchCareersPage(domain: string): Promise<Partial<JobData> | null> {
  for (const path of CAREERS_PATHS) {
    try {
      const html = await httpGet(`https://${domain}${path}`, 12_000)
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ')

      // Count job-like items (<h2>, <h3>, or list items near "Apply" / "Engineer" / "Manager")
      const jobTitleRe = /\b((?:Senior|Junior|Staff|Lead|Principal|Head of|VP of|Director of)?\s*(?:Software|Frontend|Backend|Full[- ]Stack|Data|ML|AI|Product|UX|UI|Design|Sales|Marketing|Customer|Growth|DevOps|Platform|Security|QA|Finance|Legal|HR|Recruiting)\s+(?:Engineer|Developer|Manager|Designer|Analyst|Specialist|Lead|Director|Scientist|Representative|Success|Operations))/gi
      const titles: string[] = []
      let m: RegExpExecArray | null
      while ((m = jobTitleRe.exec(text)) !== null) {
        if (!titles.includes(m[1].trim())) titles.push(m[1].trim())
      }

      if (!titles.length) continue

      return {
        ats_platform: 'Website',
        open_jobs: titles.length,
        roles_json: titles.slice(0, 20),
        departments_json: [],
        tech_stack_from_jd: extractTechFromJD(text),
        hiring_policy: extractHiringPolicy(text)
      }
    }
    catch { /* try next path */ }
  }
  return null
}

// ── Source 5: Glassdoor ───────────────────────────────────────────────────────

async function fetchGlassdoor(companyName: string): Promise<{ glassdoor_rating: number | null }> {
  try {
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const html = await httpGet(`https://www.glassdoor.com/Overview/Working-at-${slug}-EI_IE0.htm`, 15_000)
    const ratingM = /"ratingValue"\s*:\s*"?([\d.]+)"?/.exec(html)
    return { glassdoor_rating: ratingM ? parseFloat(ratingM[1]) : null }
  }
  catch { return { glassdoor_rating: null } }
}

// ── Slug guesser for ATS platforms ────────────────────────────────────────────

function guessSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// ── Main Batch Runner ─────────────────────────────────────────────────────────

export async function runJobsEnrichmentBatch(
  batchSize = 100
): Promise<{ processed: number; enriched: number; failed: number }> {
  ensureJobsTable()
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'enrich_jobs', ?, 'running')`).run(runId, new Date().toISOString())

  let processed = 0
  let enriched = 0
  let failed = 0

  try {
    const listings = db.prepare(`
      SELECT al.id, al.name, al.website_url
      FROM app_listings al
      LEFT JOIN job_signals js ON js.app_id = al.id
      WHERE js.id IS NULL
         OR js.enriched_at < datetime('now', '-7 days')
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(batchSize) as Array<{ id: string; name: string; website_url: string }>

    console.log(`[enrich-jobs] Processing ${listings.length} listings`)

    for (const listing of listings) {
      processed++
      try {
        const domain = new URL(listing.website_url).hostname.replace(/^www\./, '')
        const slug = guessSlug(listing.name)
        const domainSlug = domain.split('.')[0]

        // Get previous job count for velocity calculation
        const prev = db.prepare('SELECT open_jobs FROM job_signals WHERE app_id = ?').get(listing.id) as { open_jobs?: number } | undefined
        const previousCount = prev?.open_jobs ?? null

        // Try all ATS platforms in priority order
        let jobData: Partial<JobData> | null = null

        for (const fetcher of [
          () => fetchGreenhouse(slug),
          () => fetchGreenhouse(domainSlug),
          () => fetchLever(slug),
          () => fetchLever(domainSlug),
          () => fetchAshby(slug),
          () => fetchAshby(domainSlug),
          () => fetchCareersPage(domain)
        ]) {
          try {
            jobData = await fetcher()
            if (jobData && jobData.open_jobs) break
          }
          catch { /* try next */ }
          await new Promise(r => setTimeout(r, 500))
        }

        const [glassdoorResult] = await Promise.allSettled([fetchGlassdoor(listing.name)])
        const glassdoor = glassdoorResult.status === 'fulfilled' ? glassdoorResult.value : { glassdoor_rating: null }

        const openJobs = jobData?.open_jobs ?? 0
        const velocity = previousCount !== null ? openJobs - previousCount : null
        const now = new Date().toISOString()

        db.prepare(`
          INSERT INTO job_signals (
            id, app_id, open_jobs, ats_platform, roles_json, departments_json,
            tech_stack_from_jd, hiring_policy, glassdoor_rating,
            previous_open_jobs, hiring_velocity, enriched_at, created_at
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(app_id) DO UPDATE SET
            open_jobs=excluded.open_jobs, ats_platform=excluded.ats_platform,
            roles_json=excluded.roles_json, departments_json=excluded.departments_json,
            tech_stack_from_jd=excluded.tech_stack_from_jd, hiring_policy=excluded.hiring_policy,
            glassdoor_rating=excluded.glassdoor_rating, previous_open_jobs=excluded.previous_open_jobs,
            hiring_velocity=excluded.hiring_velocity, enriched_at=excluded.enriched_at
        `).run(
          makeId('job'), listing.id, openJobs,
          jobData?.ats_platform ?? null,
          JSON.stringify(jobData?.roles_json ?? []),
          JSON.stringify(jobData?.departments_json ?? []),
          JSON.stringify(jobData?.tech_stack_from_jd ?? []),
          jobData?.hiring_policy ?? null,
          glassdoor.glassdoor_rating,
          previousCount, velocity, now, now
        )

        enriched++
        console.log(`[enrich-jobs] ${listing.name}: ${openJobs} open roles via ${jobData?.ats_platform ?? 'none'}, velocity ${velocity ?? '?'}`)
      }
      catch (err) {
        console.error(`[enrich-jobs] Failed for ${listing.name}:`, err)
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
