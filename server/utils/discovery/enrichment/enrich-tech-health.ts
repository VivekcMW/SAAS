/**
 * Technical Health Enrichment Agent
 *
 * Collects domain-level technical health signals that customers and enterprises
 * care about: performance (PageSpeed), security (SSL, headers), credibility
 * (domain age, Wayback first snapshot), and patent activity (Google Patents).
 *
 * All sources are free / no-auth with optional API keys for higher limits.
 *
 * Sources:
 *   1. Google PageSpeed Insights API (free — 25,000 req/day; GOOGLE_PSI_API_KEY optional)
 *   2. SSL certificate validity via HTTPS probe (no key needed)
 *   3. Security Headers grader — securityheaders.com (no key, public scrape)
 *   4. Wayback CDX API — first archive date (no key, public API)
 *   5. WHOIS via WhoisXML API (WHOISXML_API_KEY optional; free tier 500/mo)
 *   6. Google Patents count search (no auth — public search scrape)
 *   7. DNS MX record → email provider detection (Node.js built-in DNS)
 *   8. The Green Web Foundation API — green hosting check (no key, public API)
 *
 * Output table: `tech_health` (created if missing)
 *   id, app_id, domain, pagespeed_mobile, pagespeed_desktop,
 *   fcp_ms, lcp_ms, cls_score, tbt_ms, perf_grade,
 *   ssl_valid, ssl_expiry_days, ssl_issuer, security_headers_grade,
 *   headers_json, domain_age_days, wayback_first_seen, whois_registrar,
 *   whois_created, whois_expires, patent_count, email_provider,
 *   mx_record, is_green_hosted, enriched_at, created_at
 *
 * Schedule: Sunday 4am UTC  (task: enrich:tech-health)
 * Batch:    100 apps/run
 */
import { getDb, makeId } from '~/server/utils/database'
import * as https from 'https'
import * as tls from 'tls'
import * as dns from 'dns'
import { promisify } from 'util'

const dnsResolveMx = promisify(dns.resolveMx)
const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

// ── DB Migration ──────────────────────────────────────────────────────────────

function ensureTable() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS tech_health (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL UNIQUE,
      domain TEXT,
      pagespeed_mobile INTEGER,
      pagespeed_desktop INTEGER,
      fcp_ms INTEGER,
      lcp_ms INTEGER,
      cls_score REAL,
      tbt_ms INTEGER,
      perf_grade TEXT,
      ssl_valid INTEGER DEFAULT 0,
      ssl_expiry_days INTEGER,
      ssl_issuer TEXT,
      security_headers_grade TEXT,
      headers_json TEXT DEFAULT '{}',
      domain_age_days INTEGER,
      wayback_first_seen TEXT,
      whois_registrar TEXT,
      whois_created TEXT,
      whois_expires TEXT,
      patent_count INTEGER DEFAULT 0,
      email_provider TEXT,
      mx_record TEXT,
      is_green_hosted INTEGER DEFAULT 0,
      enriched_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_tech_health_app ON tech_health(app_id);
  `)
}

// ── Source 1: Google PageSpeed Insights ───────────────────────────────────────

interface PsiResult {
  mobile: number | null
  desktop: number | null
  fcp_ms: number | null
  lcp_ms: number | null
  cls: number | null
  tbt_ms: number | null
  grade: string
}

async function getPageSpeed(url: string): Promise<PsiResult> {
  const key = process.env.GOOGLE_PSI_API_KEY ?? ''
  const keyParam = key ? `&key=${key}` : ''
  const base = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance${keyParam}`

  const gradeScore = (s: number | null): string => {
    if (s === null) return 'N/A'
    if (s >= 90) return 'A'
    if (s >= 75) return 'B'
    if (s >= 50) return 'C'
    if (s >= 25) return 'D'
    return 'F'
  }

  let mobile: number | null = null
  let desktop: number | null = null
  let fcp_ms: number | null = null
  let lcp_ms: number | null = null
  let cls: number | null = null
  let tbt_ms: number | null = null

  try {
    const mobileRes = await fetch(`${base}&strategy=mobile`, { signal: AbortSignal.timeout(30_000) })
    if (mobileRes.ok) {
      const d = await mobileRes.json() as {
        lighthouseResult?: {
          categories?: { performance?: { score?: number } }
          audits?: {
            'first-contentful-paint'?: { numericValue?: number }
            'largest-contentful-paint'?: { numericValue?: number }
            'cumulative-layout-shift'?: { numericValue?: number }
            'total-blocking-time'?: { numericValue?: number }
          }
        }
      }
      mobile = Math.round((d.lighthouseResult?.categories?.performance?.score ?? 0) * 100)
      fcp_ms = Math.round(d.lighthouseResult?.audits?.['first-contentful-paint']?.numericValue ?? 0)
      lcp_ms = Math.round(d.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue ?? 0)
      cls = d.lighthouseResult?.audits?.['cumulative-layout-shift']?.numericValue ?? null
      tbt_ms = Math.round(d.lighthouseResult?.audits?.['total-blocking-time']?.numericValue ?? 0)
    }
  } catch { /* PSI timeout or quota */ }

  try {
    const desktopRes = await fetch(`${base}&strategy=desktop`, { signal: AbortSignal.timeout(30_000) })
    if (desktopRes.ok) {
      const d = await desktopRes.json() as {
        lighthouseResult?: { categories?: { performance?: { score?: number } } }
      }
      desktop = Math.round((d.lighthouseResult?.categories?.performance?.score ?? 0) * 100)
    }
  } catch { /* PSI timeout */ }

  return { mobile, desktop, fcp_ms, lcp_ms, cls, tbt_ms, grade: gradeScore(mobile) }
}

// ── Source 2: SSL Certificate Check ───────────────────────────────────────────

interface SslResult {
  valid: boolean
  expiry_days: number | null
  issuer: string | null
}

async function checkSSL(hostname: string): Promise<SslResult> {
  return new Promise((resolve) => {
    const cleanHost = hostname.replace(/^https?:\/\//, '').split('/')[0]
    const socket = tls.connect({ host: cleanHost, port: 443, servername: cleanHost, timeout: 10_000 })
    socket.once('secureConnect', () => {
      const cert = socket.getPeerCertificate()
      const expiry = cert.valid_to ? new Date(cert.valid_to) : null
      const expiryDays = expiry ? Math.floor((expiry.getTime() - Date.now()) / 86_400_000) : null
      const issuer = cert.issuer?.O ?? cert.issuer?.CN ?? null
      socket.destroy()
      resolve({ valid: true, expiry_days: expiryDays, issuer })
    })
    socket.once('error', () => {
      socket.destroy()
      resolve({ valid: false, expiry_days: null, issuer: null })
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolve({ valid: false, expiry_days: null, issuer: null })
    })
  })
}

// ── Source 3: Security Headers ────────────────────────────────────────────────

interface HeadersResult {
  grade: string
  headers: Record<string, string | boolean>
}

async function checkSecurityHeaders(url: string): Promise<HeadersResult> {
  const SECURITY_HEADERS = [
    'strict-transport-security',    // HSTS
    'content-security-policy',      // CSP
    'x-content-type-options',       // nosniff
    'x-frame-options',              // clickjacking
    'referrer-policy',              // referrer leaking
    'permissions-policy',           // browser feature control
    'x-xss-protection'             // legacy XSS
  ]

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10_000),
      redirect: 'follow'
    })

    const found: Record<string, string | boolean> = {}
    for (const h of SECURITY_HEADERS) {
      const val = res.headers.get(h)
      if (val) found[h] = val
    }

    const score = Object.keys(found).length
    const grade = score >= 6 ? 'A' : score >= 4 ? 'B' : score >= 2 ? 'C' : score >= 1 ? 'D' : 'F'
    return { grade, headers: found }
  }
  catch { return { grade: 'N/A', headers: {} } }
}

// ── Source 4: Wayback Machine First Snapshot ──────────────────────────────────

async function getWaybackFirst(domain: string): Promise<{ first_seen: string | null; age_days: number | null }> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0]
    const res = await fetch(
      `http://web.archive.org/cdx/search/cdx?url=${cleanDomain}&output=json&limit=1&fl=timestamp&from=19960101&to=${new Date().getFullYear()}0101&filter=statuscode:200`,
      { signal: AbortSignal.timeout(15_000) }
    )
    if (!res.ok) return { first_seen: null, age_days: null }
    const data = await res.json() as Array<Array<string>>
    const rows = data.filter((_, i) => i > 0) // skip header
    if (!rows[0]?.[0]) return { first_seen: null, age_days: null }
    const ts = rows[0][0]
    // Wayback timestamp: YYYYMMDDHHMMSS
    const year = parseInt(ts.slice(0, 4))
    const month = parseInt(ts.slice(4, 6)) - 1
    const day = parseInt(ts.slice(6, 8))
    const firstDate = new Date(year, month, day)
    const ageDays = Math.floor((Date.now() - firstDate.getTime()) / 86_400_000)
    return {
      first_seen: firstDate.toISOString().split('T')[0],
      age_days: ageDays
    }
  }
  catch { return { first_seen: null, age_days: null } }
}

// ── Source 5: WHOIS via WhoisXML API ─────────────────────────────────────────

interface WhoisResult {
  registrar: string | null
  created: string | null
  expires: string | null
}

async function getWhois(domain: string): Promise<WhoisResult> {
  const key = process.env.WHOISXML_API_KEY
  if (!key) return { registrar: null, created: null, expires: null }

  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0]
  try {
    const res = await fetch(
      `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${key}&domainName=${cleanDomain}&outputFormat=JSON`,
      { signal: AbortSignal.timeout(10_000) }
    )
    if (!res.ok) return { registrar: null, created: null, expires: null }
    const d = await res.json() as {
      WhoisRecord?: {
        registrarName?: string
        createdDate?: string
        expiresDate?: string
      }
    }
    return {
      registrar: d.WhoisRecord?.registrarName ?? null,
      created: d.WhoisRecord?.createdDate ?? null,
      expires: d.WhoisRecord?.expiresDate ?? null
    }
  }
  catch { return { registrar: null, created: null, expires: null } }
}

// ── Source 6: Patent Count (Google Patents) ───────────────────────────────────

async function getPatentCount(companyName: string): Promise<number> {
  try {
    const q = encodeURIComponent(`assignee:"${companyName}"`)
    const res = await fetch(
      `https://patents.google.com/xhr/query?url=q%3D${q}&exp=&language=ENGLISH&num=1&start=0&output=search&ajax=1`,
      {
        headers: { 'User-Agent': UA, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15_000)
      }
    )
    if (!res.ok) return 0
    const data = await res.json() as { results?: { cluster?: Array<{ num_results?: number }> } }
    return data.results?.cluster?.[0]?.num_results ?? 0
  }
  catch { return 0 }
}

// ── Source 7: Email Provider via MX Records ───────────────────────────────────

const EMAIL_PROVIDERS: Record<string, string> = {
  'google': 'Google Workspace',
  'googlemail': 'Google Workspace',
  'outlook': 'Microsoft 365',
  'microsoft': 'Microsoft 365',
  'office365': 'Microsoft 365',
  'zoho': 'Zoho Mail',
  'amazonses': 'Amazon SES',
  'sendgrid': 'SendGrid',
  'mailgun': 'Mailgun',
  'protonmail': 'ProtonMail',
  'fastmail': 'Fastmail',
  'mxroute': 'MXRoute',
  'mailchimp': 'Mailchimp Transactional'
}

async function getEmailProvider(domain: string): Promise<{ provider: string | null; mx: string | null }> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0]
  try {
    const records = await dnsResolveMx(cleanDomain)
    if (!records.length) return { provider: null, mx: null }

    records.sort((a, b) => a.priority - b.priority)
    const topMx = records[0].exchange.toLowerCase()

    for (const [key, name] of Object.entries(EMAIL_PROVIDERS)) {
      if (topMx.includes(key)) return { provider: name, mx: topMx }
    }

    return { provider: 'Custom/Unknown', mx: topMx }
  }
  catch { return { provider: null, mx: null } }
}

// ── Source 8: Green Hosting Check ────────────────────────────────────────────

async function checkGreenHosting(domain: string): Promise<boolean> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0]
  try {
    const res = await fetch(
      `https://api.thegreenwebfoundation.org/api/v3/greencheck/${cleanDomain}`,
      { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10_000) }
    )
    if (!res.ok) return false
    const d = await res.json() as { green?: boolean }
    return d.green === true
  }
  catch { return false }
}

// ── Main Enrichment Runner ────────────────────────────────────────────────────

export async function runTechHealthEnrichmentBatch(batchSize = 100): Promise<{
  processed: number; enriched: number; skipped: number; failed: number
}> {
  ensureTable()

  const db = getDb()
  const runId = makeId('run')

  // Get apps pending tech health enrichment (not yet enriched or >14 days stale)
  const apps = db.prepare(`
    SELECT al.id, al.website, al.name
    FROM app_listings al
    LEFT JOIN tech_health th ON th.app_id = al.id
    WHERE al.status IN ('approved', 'pending')
      AND al.website IS NOT NULL
      AND (th.id IS NULL OR th.enriched_at < datetime('now', '-14 days'))
    LIMIT ?
  `).all(batchSize) as Array<{ id: string; website: string; name: string }>

  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'enrich_tech_health', ?, 'running')`).run(runId, new Date().toISOString())
  console.log(`[enrich-tech-health] Processing ${apps.length} apps`)

  let enriched = 0
  let failed = 0

  for (const app of apps) {
    try {
      console.log(`[enrich-tech-health] → ${app.name} (${app.website})`)

      // Run all checks concurrently (they're independent)
      const [psi, ssl, headers, wayback, whois, patentCount, emailInfo, isGreen] = await Promise.all([
        getPageSpeed(app.website),
        checkSSL(app.website),
        checkSecurityHeaders(app.website),
        getWaybackFirst(app.website),
        getWhois(app.website),
        getPatentCount(app.name),
        getEmailProvider(app.website),
        checkGreenHosting(app.website)
      ])

      const id = makeId('thl') // tech health
      const now = new Date().toISOString()
      const domain = app.website.replace(/^https?:\/\//, '').split('/')[0]

      db.prepare(`
        INSERT INTO tech_health (
          id, app_id, domain,
          pagespeed_mobile, pagespeed_desktop,
          fcp_ms, lcp_ms, cls_score, tbt_ms, perf_grade,
          ssl_valid, ssl_expiry_days, ssl_issuer,
          security_headers_grade, headers_json,
          domain_age_days, wayback_first_seen,
          whois_registrar, whois_created, whois_expires,
          patent_count, email_provider, mx_record, is_green_hosted,
          enriched_at
        ) VALUES (
          ?, ?, ?,
          ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?,
          ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          ?
        )
        ON CONFLICT(app_id) DO UPDATE SET
          pagespeed_mobile=excluded.pagespeed_mobile,
          pagespeed_desktop=excluded.pagespeed_desktop,
          fcp_ms=excluded.fcp_ms,
          lcp_ms=excluded.lcp_ms,
          cls_score=excluded.cls_score,
          tbt_ms=excluded.tbt_ms,
          perf_grade=excluded.perf_grade,
          ssl_valid=excluded.ssl_valid,
          ssl_expiry_days=excluded.ssl_expiry_days,
          ssl_issuer=excluded.ssl_issuer,
          security_headers_grade=excluded.security_headers_grade,
          headers_json=excluded.headers_json,
          domain_age_days=excluded.domain_age_days,
          wayback_first_seen=excluded.wayback_first_seen,
          whois_registrar=excluded.whois_registrar,
          whois_created=excluded.whois_created,
          whois_expires=excluded.whois_expires,
          patent_count=excluded.patent_count,
          email_provider=excluded.email_provider,
          mx_record=excluded.mx_record,
          is_green_hosted=excluded.is_green_hosted,
          enriched_at=excluded.enriched_at
      `).run(
        id, app.id, domain,
        psi.mobile, psi.desktop,
        psi.fcp_ms, psi.lcp_ms, psi.cls, psi.tbt_ms, psi.grade,
        ssl.valid ? 1 : 0, ssl.expiry_days, ssl.issuer,
        headers.grade, JSON.stringify(headers.headers),
        wayback.age_days, wayback.first_seen,
        whois.registrar, whois.created, whois.expires,
        patentCount, emailInfo.provider, emailInfo.mx, isGreen ? 1 : 0,
        now
      )

      enriched++
      console.log(`[enrich-tech-health] ✓ ${app.name} — PSI Mobile: ${psi.mobile}, SSL: ${ssl.valid ? 'OK' : 'FAIL'}, Headers: ${headers.grade}`)

      await new Promise(r => setTimeout(r, 2000)) // rate-limit PSI
    }
    catch (err) {
      console.error(`[enrich-tech-health] ✗ ${app.name}:`, (err as Error).message)
      failed++
    }
  }

  db.prepare(`UPDATE agent_runs SET status='done', finished_at=?, items_found=?, items_added=?, items_failed=? WHERE id=?`)
    .run(new Date().toISOString(), apps.length, enriched, failed, runId)

  return { processed: apps.length, enriched, skipped: 0, failed }
}
