/**
 * Technology Stack Enrichment Agent
 *
 * Fingerprints every listed company's tech stack from public signals:
 *   - HTTP response headers (X-Powered-By, Server, X-Framework, etc.)
 *   - HTML meta tags (generator, viewport vendor hints)
 *   - Script src patterns (cdn.jsdelivr.net, unpkg, vendor bundles)
 *   - Cookie names (wp-settings → WordPress, _shopify → Shopify, etc.)
 *   - Link rel preload / prefetch patterns
 *   - BuiltWith free API (BUILTWITH_API_KEY env var)
 *   - Wappalyzer-style fingerprint library (header + HTML pattern matching)
 *   - Job description tech mentions (joins enrich-jobs data)
 *
 * No paid keys required for fingerprinting — keys only extend coverage.
 *
 * Schedule: Wednesday 4am UTC
 * Batch:    100 listings per run
 *
 * Output table: tech_stack (created if missing)
 */
import { getDb, makeId } from '~/server/utils/database'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TechStackData {
  app_id: string
  frontend: string[]
  backend: string[]
  databases: string[]
  infrastructure: string[]
  analytics: string[]
  payments: string[]
  communications: string[]
  cms: string[]
  mobile: string[]
  devtools: string[]
  security: string[]
  raw_technologies: string[]
  enriched_at: string
}

// ── DB Bootstrap ──────────────────────────────────────────────────────────────

function ensureTechStackTable() {
  getDb().prepare(`
    CREATE TABLE IF NOT EXISTS tech_stack (
      id                TEXT PRIMARY KEY,
      app_id            TEXT NOT NULL UNIQUE,
      frontend_json     TEXT NOT NULL DEFAULT '[]',
      backend_json      TEXT NOT NULL DEFAULT '[]',
      databases_json    TEXT NOT NULL DEFAULT '[]',
      infra_json        TEXT NOT NULL DEFAULT '[]',
      analytics_json    TEXT NOT NULL DEFAULT '[]',
      payments_json     TEXT NOT NULL DEFAULT '[]',
      comms_json        TEXT NOT NULL DEFAULT '[]',
      cms_json          TEXT NOT NULL DEFAULT '[]',
      mobile_json       TEXT NOT NULL DEFAULT '[]',
      devtools_json     TEXT NOT NULL DEFAULT '[]',
      security_json     TEXT NOT NULL DEFAULT '[]',
      raw_json          TEXT NOT NULL DEFAULT '[]',
      enriched_at       TEXT NOT NULL,
      created_at        TEXT NOT NULL
    )
  `).run()
}

// ── Wappalyzer-style fingerprints (header + HTML patterns) ────────────────────

const FINGERPRINTS: Array<{
  name: string
  category: keyof Omit<TechStackData, 'app_id' | 'raw_technologies' | 'enriched_at'>
  headers?: Record<string, RegExp>
  html?: RegExp[]
  cookies?: RegExp[]
  scripts?: RegExp[]
}> = [
  // ── Frontend ──
  { name: 'React', category: 'frontend', html: [/react[./](?:production|development)/, /__REACT/, /data-reactroot/i, /data-reactid/i] },
  { name: 'Vue.js', category: 'frontend', html: [/__VUE_OPTIONS_API__|vue(?:\.runtime)?\.global\.prod\.js/i, /data-v-[a-f0-9]{8}/] },
  { name: 'Angular', category: 'frontend', html: [/ng-version=/, /\/angular(?:\.min)?\.js/, /\[\(ngModel\)\]/] },
  { name: 'Next.js', category: 'frontend', html: [/__NEXT_DATA__/, /_next\/static\//] },
  { name: 'Nuxt', category: 'frontend', html: [/__NUXT__/, /_nuxt\//] },
  { name: 'Svelte', category: 'frontend', html: [/svelte\/internal/, /\.svelte-[a-z0-9]{6}/] },
  { name: 'jQuery', category: 'frontend', html: [/jquery[.-](min\.)?js/, /jquery\.com/] },
  { name: 'Bootstrap', category: 'frontend', html: [/bootstrap(?:\.min)?\.(?:css|js)/, /getbootstrap\.com/] },
  { name: 'Tailwind CSS', category: 'frontend', html: [/tailwindcss/, /cdn\.tailwindcss\.com/] },
  { name: 'Webflow', category: 'frontend', headers: { 'x-powered-by': /Webflow/i }, html: [/assets\.website-files\.com/, /webflow\.com\/css/] },
  { name: 'Framer', category: 'frontend', html: [/framer\.com\/m\//, /framer-motion/] },
  // ── Backend ──
  { name: 'Node.js', category: 'backend', headers: { 'x-powered-by': /Express|node\.js/i } },
  { name: 'Ruby on Rails', category: 'backend', headers: { 'x-powered-by': /Phusion Passenger/i }, cookies: [/^_session_id$/, /^__profilin/] },
  { name: 'PHP', category: 'backend', headers: { 'x-powered-by': /PHP\//i }, html: [/wp-content\/plugins/, /wp-includes\//] },
  { name: 'Python / Django', category: 'backend', cookies: [/csrftoken/], html: [/django/i] },
  { name: 'ASP.NET', category: 'backend', headers: { 'x-powered-by': /ASP\.NET/i, 'x-aspnet-version': /.+/ } },
  { name: 'Java / Spring', category: 'backend', cookies: [/JSESSIONID/] },
  { name: 'Laravel', category: 'backend', cookies: [/laravel_session/], html: [/laravel_token/] },
  // ── CMS ──
  { name: 'WordPress', category: 'cms', html: [/wp-content\//i, /wp-json\//i, /xmlrpc\.php/] },
  { name: 'Shopify', category: 'cms', html: [/cdn\.shopify\.com/, /shopify-cdn\.com/], cookies: [/_shopify_[a-z]+/] },
  { name: 'Webflow', category: 'cms', html: [/webflow\.io\//] },
  { name: 'Contentful', category: 'cms', html: [/cdn\.contentful\.com/, /images\.ctfassets\.net/] },
  { name: 'Ghost', category: 'cms', html: [/ghost-v\d/, /content\.ghost\.io/] },
  { name: 'Sanity', category: 'cms', html: [/cdn\.sanity\.io/] },
  // ── Analytics ──
  { name: 'Google Analytics', category: 'analytics', html: [/google-analytics\.com\/analytics\.js/, /gtag\(/, /GTM-[A-Z0-9]+/] },
  { name: 'Segment', category: 'analytics', html: [/cdn\.segment\.com/, /analytics\.js/] },
  { name: 'Amplitude', category: 'analytics', html: [/cdn\.amplitude\.com/, /amplitude\.getInstance/] },
  { name: 'Mixpanel', category: 'analytics', html: [/cdn\.mxpnl\.com/, /mixpanel\.track/] },
  { name: 'Hotjar', category: 'analytics', html: [/static\.hotjar\.com/, /hj\(|hjid:/] },
  { name: 'PostHog', category: 'analytics', html: [/posthog\.io\/static/, /posthog\.capture/] },
  { name: 'Heap', category: 'analytics', html: [/cdn\.heapanalytics\.com/, /heap\.track/] },
  // ── Payments ──
  { name: 'Stripe', category: 'payments', html: [/js\.stripe\.com/, /stripe\.createPaymentMethod/] },
  { name: 'Paddle', category: 'payments', html: [/cdn\.paddle\.com/, /Paddle\.Setup/] },
  { name: 'PayPal', category: 'payments', html: [/paypalobjects\.com/, /paypal\.com\/sdk/] },
  { name: 'Chargebee', category: 'payments', html: [/chargebee\.com\/js/] },
  { name: 'Recurly', category: 'payments', html: [/js\.recurly\.com/] },
  // ── Infrastructure ──
  { name: 'Cloudflare', category: 'infrastructure', headers: { server: /cloudflare/i, 'cf-ray': /.+/ } },
  { name: 'AWS CloudFront', category: 'infrastructure', headers: { 'x-amz-cf-id': /.+/, server: /CloudFront/i } },
  { name: 'Fastly', category: 'infrastructure', headers: { 'x-served-by': /cache-[a-z]+-[a-z]+\d/i } },
  { name: 'Vercel', category: 'infrastructure', headers: { 'x-vercel-id': /.+/, server: /Vercel/i } },
  { name: 'Netlify', category: 'infrastructure', headers: { server: /Netlify/i, 'x-nf-request-id': /.+/ } },
  { name: 'Heroku', category: 'infrastructure', headers: { server: /Cowboy/i }, html: [/herokucdn\.com/] },
  // ── Communications ──
  { name: 'Intercom', category: 'communications', html: [/js\.intercomcdn\.com/, /intercom\.io\/messenger/] },
  { name: 'Zendesk', category: 'communications', html: [/static\.zdassets\.com/, /zopim\.com/] },
  { name: 'HubSpot', category: 'communications', html: [/js\.hs-scripts\.com/, /hs-analytics\.net/] },
  { name: 'Drift', category: 'communications', html: [/js\.driftt\.com/] },
  { name: 'Crisp', category: 'communications', html: [/client\.crisp\.chat/] },
  // ── Security ──
  { name: 'reCAPTCHA', category: 'security', html: [/google\.com\/recaptcha/, /grecaptcha/] },
  { name: 'hCaptcha', category: 'security', html: [/hcaptcha\.com\/1\/api\.js/, /hcaptcha\.com/] },
  { name: 'Cloudflare Turnstile', category: 'security', html: [/challenges\.cloudflare\.com\/turnstile/] },
  // ── Mobile ──
  { name: 'React Native', category: 'mobile', html: [/react-native/i] },
  { name: 'Flutter', category: 'mobile', html: [/flutter_service_worker\.js/] },
  // ── DevTools ──
  { name: 'Sentry', category: 'devtools', html: [/browser\.sentry-cdn\.com/, /Sentry\.init/] },
  { name: 'Datadog', category: 'devtools', html: [/browser-intake-datadoghq\.com/, /DD_CLIENT_TOKEN/] },
  { name: 'LogRocket', category: 'devtools', html: [/cdn\.logrocket\.io/] }
]

// ── HTTP Fetch with header capture ────────────────────────────────────────────

interface FetchResult { html: string; headers: Record<string, string>; cookies: string[] }

async function fetchWithHeaders(url: string): Promise<FetchResult> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*', 'Accept-Language': 'en-US,en;q=0.9', 'Accept-Encoding': 'gzip, deflate, br' },
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000)
  })

  const headers: Record<string, string> = {}
  res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value })

  // Parse Set-Cookie header for cookie-based fingerprinting
  const cookieHeader = headers['set-cookie'] ?? ''
  const cookies = cookieHeader.split(',').map(c => c.split(';')[0].trim().split('=')[0])

  const html = await res.text()
  return { html, headers, cookies }
}

// ── Header + HTML fingerprinting ──────────────────────────────────────────────

function fingerprintSite(result: FetchResult): Partial<TechStackData> {
  const detected: Partial<TechStackData> = {
    frontend: [], backend: [], databases: [], infrastructure: [], analytics: [],
    payments: [], communications: [], cms: [], mobile: [], devtools: [], security: [],
    raw_technologies: []
  }

  for (const fp of FINGERPRINTS) {
    let matched = false

    // Check header patterns
    if (fp.headers) {
      for (const [hdr, pattern] of Object.entries(fp.headers)) {
        if (pattern.test(result.headers[hdr] ?? '')) { matched = true; break }
      }
    }

    // Check HTML patterns
    if (!matched && fp.html) {
      for (const pattern of fp.html) {
        if (pattern.test(result.html)) { matched = true; break }
      }
    }

    // Check cookie patterns
    if (!matched && fp.cookies) {
      for (const cookiePattern of fp.cookies) {
        if (result.cookies.some(c => cookiePattern.test(c))) { matched = true; break }
      }
    }

    if (matched) {
      const arr = detected[fp.category] as string[]
      if (!arr.includes(fp.name)) arr.push(fp.name)
      if (!detected.raw_technologies!.includes(fp.name)) detected.raw_technologies!.push(fp.name)
    }
  }

  return detected
}

// ── BuiltWith API (optional, extends coverage) ────────────────────────────────

interface BWTech { tag?: string; name?: string }
interface BWResult { Results?: Array<{ Result?: { Paths?: Array<{ Technologies?: BWTech[] }> } }> }

async function fetchBuiltWith(domain: string): Promise<string[]> {
  const apiKey = process.env.BUILTWITH_API_KEY
  if (!apiKey) return []

  try {
    const json = await fetch(
      `https://api.builtwith.com/free1/api.json?KEY=${apiKey}&LOOKUP=${domain}`,
      { signal: AbortSignal.timeout(12_000), headers: { 'User-Agent': UA } }
    ).then(r => r.json()) as BWResult

    const techs: string[] = []
    for (const result of json.Results ?? []) {
      for (const path of result.Result?.Paths ?? []) {
        for (const tech of path.Technologies ?? []) {
          if (tech.name && !techs.includes(tech.name)) techs.push(tech.name)
        }
      }
    }
    return techs
  }
  catch { return [] }
}

// ── Categorize BuiltWith technologies ─────────────────────────────────────────

function categorizeBuiltWith(techs: string[]): Partial<TechStackData> {
  const result: Partial<TechStackData> = {
    frontend: [], backend: [], databases: [], infrastructure: [], analytics: [],
    payments: [], communications: [], cms: [], mobile: [], devtools: [], security: []
  }

  const CATEGORY_MAP: Record<string, keyof Omit<TechStackData, 'app_id' | 'raw_technologies' | 'enriched_at'>> = {
    'React': 'frontend', 'Vue.js': 'frontend', 'Angular': 'frontend', 'Next.js': 'frontend',
    'Svelte': 'frontend', 'jQuery': 'frontend', 'Bootstrap': 'frontend',
    'Ruby on Rails': 'backend', 'Django': 'backend', 'Laravel': 'backend', 'Express': 'backend',
    'ASP.NET': 'backend', 'Spring': 'backend', 'Flask': 'backend',
    'MySQL': 'databases', 'PostgreSQL': 'databases', 'MongoDB': 'databases', 'Redis': 'databases',
    'Elasticsearch': 'databases', 'MariaDB': 'databases', 'Supabase': 'databases',
    'AWS': 'infrastructure', 'Cloudflare': 'infrastructure', 'Fastly': 'infrastructure',
    'Vercel': 'infrastructure', 'Netlify': 'infrastructure', 'DigitalOcean': 'infrastructure',
    'Google Analytics': 'analytics', 'Segment': 'analytics', 'Amplitude': 'analytics',
    'Mixpanel': 'analytics', 'Hotjar': 'analytics', 'PostHog': 'analytics',
    'Stripe': 'payments', 'PayPal': 'payments', 'Paddle': 'payments', 'Chargebee': 'payments',
    'Intercom': 'communications', 'Zendesk': 'communications', 'HubSpot': 'communications',
    'WordPress': 'cms', 'Shopify': 'cms', 'Contentful': 'cms', 'Webflow': 'cms',
    'React Native': 'mobile', 'Flutter': 'mobile', 'Capacitor': 'mobile',
    'Sentry': 'devtools', 'Datadog': 'devtools', 'New Relic': 'devtools', 'LogRocket': 'devtools',
    'reCAPTCHA': 'security', 'hCaptcha': 'security', 'Cloudflare Turnstile': 'security'
  }

  for (const tech of techs) {
    const category = CATEGORY_MAP[tech]
    if (category) {
      const arr = result[category] as string[]
      if (!arr.includes(tech)) arr.push(tech)
    }
  }

  return result
}

// ── Main Batch Runner ─────────────────────────────────────────────────────────

export async function runTechStackEnrichmentBatch(
  batchSize = 100
): Promise<{ processed: number; enriched: number; failed: number }> {
  ensureTechStackTable()
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'enrich_tech_stack', ?, 'running')`).run(runId, new Date().toISOString())

  let processed = 0
  let enriched = 0
  let failed = 0

  try {
    const listings = db.prepare(`
      SELECT al.id, al.name, al.website_url
      FROM app_listings al
      LEFT JOIN tech_stack ts ON ts.app_id = al.id
      WHERE ts.id IS NULL
         OR ts.enriched_at < datetime('now', '-14 days')
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(batchSize) as Array<{ id: string; name: string; website_url: string }>

    console.log(`[enrich-tech-stack] Processing ${listings.length} listings`)

    for (const listing of listings) {
      processed++
      try {
        const domain = new URL(listing.website_url).hostname.replace(/^www\./, '')

        // Parallel: site fingerprint + BuiltWith
        const [siteResult, bwTechs] = await Promise.allSettled([
          fetchWithHeaders(`https://${domain}`),
          fetchBuiltWith(domain)
        ])

        const stack: Partial<TechStackData> = {
          frontend: [], backend: [], databases: [], infrastructure: [], analytics: [],
          payments: [], communications: [], cms: [], mobile: [], devtools: [], security: [],
          raw_technologies: []
        }

        if (siteResult.status === 'fulfilled') {
          const fp = fingerprintSite(siteResult.value)
          for (const [key, val] of Object.entries(fp)) {
            if (Array.isArray(val)) {
              const existing = (stack[key as keyof TechStackData] as string[] | undefined) ?? []
              stack[key as keyof TechStackData] = [...new Set([...existing, ...val])] as never
            }
          }
        }

        if (bwTechs.status === 'fulfilled' && bwTechs.value.length) {
          const categorized = categorizeBuiltWith(bwTechs.value)
          for (const [key, val] of Object.entries(categorized)) {
            if (Array.isArray(val)) {
              const existing = (stack[key as keyof TechStackData] as string[] | undefined) ?? []
              stack[key as keyof TechStackData] = [...new Set([...existing, ...val])] as never
            }
          }
          // Merge BuiltWith raw list into raw_technologies
          stack.raw_technologies = [...new Set([...(stack.raw_technologies ?? []), ...bwTechs.value])]
        }

        // Also pull job-description tech data if available
        const jobData = db.prepare('SELECT tech_stack_from_jd FROM job_signals WHERE app_id = ?').get(listing.id) as { tech_stack_from_jd?: string } | undefined
        if (jobData?.tech_stack_from_jd) {
          const jdTechs: string[] = JSON.parse(jobData.tech_stack_from_jd)
          const categorized = categorizeBuiltWith(jdTechs)
          for (const [key, val] of Object.entries(categorized)) {
            if (Array.isArray(val)) {
              const existing = (stack[key as keyof TechStackData] as string[] | undefined) ?? []
              stack[key as keyof TechStackData] = [...new Set([...existing, ...val])] as never
            }
          }
          stack.raw_technologies = [...new Set([...(stack.raw_technologies ?? []), ...jdTechs])]
        }

        const now = new Date().toISOString()
        db.prepare(`
          INSERT INTO tech_stack (
            id, app_id, frontend_json, backend_json, databases_json, infra_json,
            analytics_json, payments_json, comms_json, cms_json, mobile_json,
            devtools_json, security_json, raw_json, enriched_at, created_at
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(app_id) DO UPDATE SET
            frontend_json=excluded.frontend_json, backend_json=excluded.backend_json,
            databases_json=excluded.databases_json, infra_json=excluded.infra_json,
            analytics_json=excluded.analytics_json, payments_json=excluded.payments_json,
            comms_json=excluded.comms_json, cms_json=excluded.cms_json,
            mobile_json=excluded.mobile_json, devtools_json=excluded.devtools_json,
            security_json=excluded.security_json, raw_json=excluded.raw_json,
            enriched_at=excluded.enriched_at
        `).run(
          makeId('tst'), listing.id,
          JSON.stringify(stack.frontend ?? []), JSON.stringify(stack.backend ?? []),
          JSON.stringify(stack.databases ?? []), JSON.stringify(stack.infrastructure ?? []),
          JSON.stringify(stack.analytics ?? []), JSON.stringify(stack.payments ?? []),
          JSON.stringify(stack.communications ?? []), JSON.stringify(stack.cms ?? []),
          JSON.stringify(stack.mobile ?? []), JSON.stringify(stack.devtools ?? []),
          JSON.stringify(stack.security ?? []), JSON.stringify(stack.raw_technologies ?? []),
          now, now
        )

        enriched++
        const total = (stack.raw_technologies ?? []).length
        console.log(`[enrich-tech-stack] ${listing.name}: ${total} technologies (Frontend: ${(stack.frontend ?? []).join(', ') || 'none'})`)
      }
      catch (err) {
        console.error(`[enrich-tech-stack] Failed for ${listing.name}:`, err)
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
