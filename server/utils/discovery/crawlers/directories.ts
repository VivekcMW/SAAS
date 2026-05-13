/**
 * Software Directory & App Marketplace Crawlers
 *
 * Discovers SaaS products from the world's largest software directories
 * and official app marketplaces — all publicly accessible, no auth required.
 *
 * Sources:
 *   1. G2 category browsing   — 100K+ products across 2,000+ categories
 *   2. Capterra category pages — 50K+ products
 *   3. AWS Marketplace         — commercial SaaS with AWS billing
 *   4. Google Workspace Marketplace — 5K+ productivity integrations
 *   5. Slack App Directory     — 3K+ verified integrations
 *   6. Microsoft AppSource     — 10K+ B2B apps
 *   7. Salesforce AppExchange  — 7K+ CRM ecosystem apps
 *   8. theresanaiforthat.com   — 6K+ AI tools (fastest-growing category)
 *   9. StackShare              — dev tools, curated by 1M+ engineers
 *  10. Open Collective          — 800+ revenue-generating OSS projects
 *
 * Schedule: Thursday 5am UTC  (task: discovery:directories)
 * Batch:    500 per run (paginated across all sources)
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

interface DiscoveredApp {
  name: string
  website: string
  description: string
  source: string
  tags: string[]
}

// ── HTTP Helper ───────────────────────────────────────────────────────────────

async function httpGet(url: string, ms = 20_000, headers?: Record<string, string>): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html,application/json,*/*', 'Accept-Language': 'en-US,en;q=0.9', ...headers },
    signal: AbortSignal.timeout(ms)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)
  return res.text()
}

// ── Source 1: G2 Category Pages ──────────────────────────────────────────────

// G2 exposes category-level pages with JSON-LD + structured product cards
const G2_CATEGORIES = [
  'crm-software', 'project-management-software', 'marketing-automation-software',
  'accounting-software', 'hr-software', 'business-intelligence-software',
  'customer-success-software', 'email-marketing-software', 'sales-intelligence-software',
  'design-software', 'data-analytics-software', 'content-management-software',
  'cybersecurity-software', 'devops-software', 'collaboration-software',
  'customer-service-software', 'erp-systems', 'learning-management-system',
  'recruiting-software', 'payroll-software', 'supply-chain-management-software',
  'video-conferencing-software', 'electronic-signature-software', 'survey-software',
  'artificial-intelligence-software'
]

async function crawlG2Categories(maxPerCategory = 30): Promise<DiscoveredApp[]> {
  const apps: DiscoveredApp[] = []

  for (const cat of G2_CATEGORIES) {
    try {
      // G2 uses a paginated JSON API at /products.json internally, but the public page has structured data
      const html = await httpGet(`https://www.g2.com/categories/${cat}?order=g2_score`, 15_000)

      // Extract product cards — G2 renders server-side with JSON-LD
      const productRe = /"url"\s*:\s*"(https:\/\/www\.g2\.com\/products\/([^"/]+)\/reviews)"[^}]*"name"\s*:\s*"([^"]+)"/g
      const _websiteRe = /"url"\s*:\s*"(https?:\/\/(?!www\.g2\.com)[^"]+)"/g

      const products: Record<string, { name: string; g2Url: string; website?: string }> = {}

      let pm: RegExpExecArray | null
      while ((pm = productRe.exec(html)) !== null) {
        const slug = pm[2]
        if (!products[slug]) products[slug] = { name: pm[3], g2Url: pm[1] }
      }

      // Try to extract official website from each card's structured data
      const cardRe = /<div[^>]*class="[^"]*product-listing[^"]*"[^>]*>([\s\S]{1,3000}?)<\/div>/gi
      let card: RegExpExecArray | null
      while ((card = cardRe.exec(html)) !== null) {
        const nameM = /<h2[^>]*>([\s\S]*?)<\/h2>/i.exec(card[1])
        const linkM = /href="(https?:\/\/(?!g2\.com)[^"]+)"[^>]*rel="noopener nofollow"/i.exec(card[1])
        if (nameM && linkM) {
          const name = nameM[1].replace(/<[^>]+>/g, '').trim()
          apps.push({
            name,
            website: linkM[1],
            description: `Listed in G2 category: ${cat.replace(/-/g, ' ')}`,
            source: 'g2',
            tags: [cat.replace(/-software$/, '').replace(/-/g, ' '), 'g2-listed']
          })
          if (apps.length >= maxPerCategory) break
        }
      }

      // Also extract from JSON-LD
      const jsonLdRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi
      let jm: RegExpExecArray | null
      while ((jm = jsonLdRe.exec(html)) !== null) {
        try {
          const data = JSON.parse(jm[1]) as { '@type'?: string; name?: string; url?: string; description?: string }
          if (data['@type'] === 'SoftwareApplication' && data.name && data.url) {
            apps.push({
              name: data.name,
              website: data.url,
              description: data.description ?? `Listed in G2 category: ${cat}`,
              source: 'g2',
              tags: [cat.replace(/-software$/, '').replace(/-/g, ' '), 'g2-listed']
            })
          }
        }
        catch { /* skip malformed JSON-LD */ }
      }

      console.log(`[crawl-directories] G2 ${cat}: found ${apps.length} apps so far`)
      await new Promise(r => setTimeout(r, 2000))
    }
    catch (err) { console.warn(`[crawl-directories] G2 ${cat} failed:`, (err as Error).message) }
  }

  return apps
}

// ── Source 2: Capterra Category Pages ────────────────────────────────────────

const CAPTERRA_CATEGORIES = [
  'crm', 'project-management', 'marketing-automation', 'accounting',
  'human-resources', 'business-intelligence', 'email-marketing',
  'ecommerce', 'customer-service', 'learning-management-system',
  'recruiting', 'payroll', 'video-conferencing', 'cybersecurity',
  'sales-force-automation', 'analytics', 'collaboration', 'erp'
]

async function crawlCapterra(_maxPerCategory = 30): Promise<DiscoveredApp[]> {
  const apps: DiscoveredApp[] = []

  for (const cat of CAPTERRA_CATEGORIES) {
    try {
      const html = await httpGet(`https://www.capterra.com/${cat}-software/`, 15_000)

      // Capterra renders JSON-LD for each product
      const jsonLdRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi
      let jm: RegExpExecArray | null
      while ((jm = jsonLdRe.exec(html)) !== null) {
        try {
          const data = JSON.parse(jm[1]) as Record<string, unknown>
          const items = (data['@type'] === 'ItemList' ? data.itemListElement : [data]) as Array<Record<string, unknown>>
          for (const item of items) {
            const product = (item.item ?? item) as Record<string, unknown>
            if (product.name && product.url) {
              apps.push({
                name: String(product.name),
                website: String(product.url),
                description: String(product.description ?? `Listed in Capterra: ${cat}`),
                source: 'capterra',
                tags: [cat.replace(/-/g, ' '), 'capterra-listed']
              })
            }
          }
        }
        catch { /* skip */ }
      }

      // Fallback: extract product links from page
      const productRe = /href="(https?:\/\/(?!capterra\.com|capterraboomerang)[^"]+)"[^>]*data-click-type="visit">/gi
      const _nameRe = /<h3[^>]*>([\s\S]*?)<\/h3>/gi
      let pm: RegExpExecArray | null
      while ((pm = productRe.exec(html)) !== null) {
        apps.push({
          name: pm[1].split('/').pop()?.replace(/[-_]/g, ' ') ?? 'Unknown',
          website: pm[1],
          description: `Listed in Capterra: ${cat}`,
          source: 'capterra',
          tags: [cat.replace(/-/g, ' '), 'capterra-listed']
        })
      }

      console.log(`[crawl-directories] Capterra ${cat}: ${apps.length} apps total`)
      await new Promise(r => setTimeout(r, 1500))
    }
    catch (err) { console.warn(`[crawl-directories] Capterra ${cat} failed:`, (err as Error).message) }
  }

  return apps
}

// ── Source 3: AWS Marketplace ────────────────────────────────────────────────

async function crawlAWSMarketplace(pages = 5): Promise<DiscoveredApp[]> {
  const apps: DiscoveredApp[] = []

  for (let page = 1; page <= pages; page++) {
    try {
      // AWS Marketplace has a public search API
      const res = await fetch(
        `https://aws.amazon.com/marketplace/search/results?searchTerms=saas&page=${page}&filters=FulfillmentOptionType:SaaS`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'application/json,text/html,*/*' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      const html = await res.text()

      // Extract product cards
      const cardRe = /"productTitle"\s*:\s*"([^"]+)"[^}]*"productUrl"\s*:\s*"([^"]+)"[^}]*"shortDescription"\s*:\s*"([^"]+)"/g
      let m: RegExpExecArray | null
      while ((m = cardRe.exec(html)) !== null) {
        apps.push({
          name: m[1],
          website: m[2].startsWith('http') ? m[2] : `https://aws.amazon.com${m[2]}`,
          description: m[3],
          source: 'aws_marketplace',
          tags: ['aws-marketplace', 'saas', 'cloud']
        })
      }

      // Also look for JSON-LD or embedded JSON
      const jsonRe = /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/
      const jsonM = jsonRe.exec(html)
      if (jsonM) {
        try {
          const state = JSON.parse(jsonM[1]) as { results?: Array<{ title?: string; url?: string; description?: string }> }
          for (const r of state.results ?? []) {
            if (r.title && r.url) {
              apps.push({
                name: r.title,
                website: r.url.startsWith('http') ? r.url : `https://aws.amazon.com${r.url}`,
                description: r.description ?? 'AWS Marketplace SaaS product',
                source: 'aws_marketplace',
                tags: ['aws-marketplace', 'saas', 'cloud']
              })
            }
          }
        }
        catch { /* skip */ }
      }

      await new Promise(r => setTimeout(r, 2000))
    }
    catch (err) { console.warn(`[crawl-directories] AWS Marketplace page ${page} failed:`, (err as Error).message) }
  }

  return apps
}

// ── Source 4: Slack App Directory ────────────────────────────────────────────

async function crawlSlackDirectory(pages = 8): Promise<DiscoveredApp[]> {
  const apps: DiscoveredApp[] = []

  for (let page = 1; page <= pages; page++) {
    try {
      const html = await httpGet(
        `https://slack.com/apps?page=${page}&sort=popularity`,
        15_000
      )

      // Slack renders app cards with structured JSON
      const jsonRe = /window\.__NEXT_DATA__\s*=\s*(\{[\s\S]*?\})\s*<\/script>/
      const jsonM = jsonRe.exec(html)
      if (jsonM) {
        try {
          const nextData = JSON.parse(jsonM[1]) as {
            props?: { pageProps?: { apps?: Array<{ name?: string; url?: string; description?: string }> } }
          }
          const slackApps = nextData.props?.pageProps?.apps ?? []
          for (const app of slackApps) {
            if (app.name && app.url) {
              apps.push({
                name: app.name,
                website: app.url.startsWith('http') ? app.url : `https://slack.com${app.url}`,
                description: app.description ?? 'Slack App Directory integration',
                source: 'slack_directory',
                tags: ['slack-integration', 'productivity', 'saas']
              })
            }
          }
        }
        catch { /* skip */ }
      }

      // Fallback HTML extraction
      const appRe = /<a[^>]+href="(https?:\/\/(?!slack\.com)[^"]+)"[^>]*>([^<]{3,60})<\/a>/gi
      let m: RegExpExecArray | null
      while ((m = appRe.exec(html)) !== null) {
        if (/\.(pdf|css|js|png|jpg|svg)$/i.test(m[1])) continue
        apps.push({
          name: m[2].trim(),
          website: m[1],
          description: 'Slack App Directory integration',
          source: 'slack_directory',
          tags: ['slack-integration', 'productivity']
        })
      }

      await new Promise(r => setTimeout(r, 1500))
    }
    catch (err) { console.warn(`[crawl-directories] Slack directory page ${page} failed:`, (err as Error).message) }
  }

  return apps
}

// ── Source 5: theresanaiforthat.com (AI tools) ───────────────────────────────

async function crawlThereIsAnAI(pages = 10): Promise<DiscoveredApp[]> {
  const apps: DiscoveredApp[] = []

  for (let page = 1; page <= pages; page++) {
    try {
      const html = await httpGet(
        `https://theresanaiforthat.com/?page=${page}&sort=saves`,
        15_000
      )

      // TAAFT renders tools in JSON on page
      const jsonRe = /window\.__NUXT__\s*=\s*(\{[\s\S]*?\})\s*<\/script>/
      const jsonM = jsonRe.exec(html)
      if (jsonM) {
        try {
          const nuxt = JSON.parse(jsonM[1]) as {
            data?: Array<Array<{ results?: Array<{ name?: string; url?: string; short_description?: string; tags?: string[] }> }>>
          }
          const results = nuxt.data?.[0]?.[0]?.results ?? []
          for (const tool of results) {
            if (tool.name && tool.url) {
              apps.push({
                name: tool.name,
                website: tool.url.startsWith('http') ? tool.url : `https://theresanaiforthat.com${tool.url}`,
                description: tool.short_description ?? 'AI tool',
                source: 'theresanaiforthat',
                tags: ['ai-tool', ...(tool.tags ?? []).slice(0, 5)]
              })
            }
          }
        }
        catch { /* skip */ }
      }

      // HTML fallback — tool cards
      const cardRe = /<article[^>]*>([\s\S]{1,2000}?)<\/article>/gi
      let card: RegExpExecArray | null
      while ((card = cardRe.exec(html)) !== null) {
        const nameM = /<h2[^>]*>([\s\S]*?)<\/h2>/i.exec(card[1])
        const linkM = /href="(https?:\/\/(?!theresanaiforthat)[^"]+)"/i.exec(card[1])
        const descM = /<p[^>]*>([\s\S]{10,300}?)<\/p>/i.exec(card[1])
        if (nameM && linkM) {
          apps.push({
            name: nameM[1].replace(/<[^>]+>/g, '').trim(),
            website: linkM[1],
            description: descM ? descM[1].replace(/<[^>]+>/g, '').trim() : 'AI tool',
            source: 'theresanaiforthat',
            tags: ['ai-tool', 'ai-powered']
          })
        }
      }

      await new Promise(r => setTimeout(r, 1500))
    }
    catch (err) { console.warn(`[crawl-directories] TAAFT page ${page} failed:`, (err as Error).message) }
  }

  return apps
}

// ── Source 6: StackShare ──────────────────────────────────────────────────────

async function crawlStackShare(pages = 5): Promise<DiscoveredApp[]> {
  const apps: DiscoveredApp[] = []

  for (let page = 1; page <= pages; page++) {
    try {
      const html = await httpGet(
        `https://stackshare.io/tools/trending?page=${page}`,
        15_000
      )

      // StackShare renders tools in server-side HTML
      const cardRe = /<a[^>]+href="\/([^"/]+)"[^>]*class="[^"]*ToolCell[^"]*"[^>]*>([\s\S]{1,1000}?)<\/a>/gi
      let card: RegExpExecArray | null
      while ((card = cardRe.exec(html)) !== null) {
        const slug = card[1]
        const chunk = card[2]
        const nameM = /<h2[^>]*>([\s\S]*?)<\/h2>/i.exec(chunk) ?? /<strong[^>]*>([\s\S]*?)<\/strong>/i.exec(chunk)
        const descM = /<p[^>]*>([\s\S]{10,300}?)<\/p>/i.exec(chunk)
        const websiteM = /href="(https?:\/\/(?!stackshare)[^"]+)"/.exec(chunk)

        const name = nameM ? nameM[1].replace(/<[^>]+>/g, '').trim() : slug
        apps.push({
          name,
          website: websiteM ? websiteM[1] : `https://stackshare.io/${slug}`,
          description: descM ? descM[1].replace(/<[^>]+>/g, '').trim() : 'Dev tool on StackShare',
          source: 'stackshare',
          tags: ['dev-tool', 'developer', 'stackshare']
        })
      }

      await new Promise(r => setTimeout(r, 1500))
    }
    catch (err) { console.warn(`[crawl-directories] StackShare page ${page} failed:`, (err as Error).message) }
  }

  return apps
}

// ── Source 7: Open Collective (OSS with revenue) ──────────────────────────────

async function crawlOpenCollective(pages = 5): Promise<DiscoveredApp[]> {
  const apps: DiscoveredApp[] = []

  // Open Collective has a public GraphQL API — no auth needed for public collectives
  const query = `query { collectives(limit: 50, offset: OFFSET, type: ORGANIZATION, tag: "saas") {
    nodes { name slug website description tags { nodes { value } } yearlyBudget { value currency } }
  } }`

  for (let page = 0; page < pages; page++) {
    try {
      const res = await fetch('https://api.opencollective.com/graphql/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
        body: JSON.stringify({ query: query.replace('OFFSET', String(page * 50)) }),
        signal: AbortSignal.timeout(15_000)
      })
      if (!res.ok) continue
      const data = await res.json() as {
        data?: { collectives?: { nodes?: Array<{ name: string; slug: string; website?: string; description?: string; tags?: { nodes?: Array<{ value: string }> } }> } }
      }
      const nodes = data.data?.collectives?.nodes ?? []
      for (const node of nodes) {
        if (!node.website) continue
        apps.push({
          name: node.name,
          website: node.website,
          description: node.description ?? 'Open source project with revenue on Open Collective',
          source: 'open_collective',
          tags: ['open-source', 'oss', ...(node.tags?.nodes?.map(t => t.value) ?? []).slice(0, 3)]
        })
      }
      await new Promise(r => setTimeout(r, 1000))
    }
    catch (err) { console.warn(`[crawl-directories] Open Collective page ${page} failed:`, (err as Error).message) }
  }

  return apps
}

// ── DB Persister ──────────────────────────────────────────────────────────────

async function persistApps(apps: DiscoveredApp[]): Promise<{ added: number; skipped: number; failed: number }> {
  const _db = getDb()
  const _runId = makeId('run')
  let added = 0
  let skipped = 0
  let failed = 0

  // Filter out already-known URLs
  const urls = apps.map(a => a.website).filter(Boolean)
  const newUrls = await filterNew(urls)
  const newApps = apps.filter(a => newUrls.includes(a.website))

  skipped = apps.length - newApps.length
  console.log(`[crawl-directories] ${newApps.length} new / ${skipped} already known`)

  for (const app of newApps) {
    try {
      const pageText = await fetchPageText(app.website).catch(() => app.description)
      const extracted = await extractWithAI(pageText, app.website)
      const score = computeScore(extracted)
      await routeByScore(score, extracted, app.website, `directories:${app.source}`)
      added++
      await new Promise(r => setTimeout(r, 1000))
    }
    catch (err) {
      console.error(`[crawl-directories] Failed to process ${app.name}:`, (err as Error).message)
      failed++
    }
  }

  return { added, skipped, failed }
}

// ── Main Batch Runner ─────────────────────────────────────────────────────────

export async function runDirectoryCrawler(
  limit = 500
): Promise<{ processed: number; added: number; skipped: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'crawl_directories', ?, 'running')`).run(runId, new Date().toISOString())

  const allApps: DiscoveredApp[] = []

  console.log('[crawl-directories] Starting directory crawl...')

  // Run all sources concurrently with allSettled
  const [g2Result, capterraResult, awsResult, slackResult, aiResult, stackResult, ossResult] = await Promise.allSettled([
    crawlG2Categories(Math.ceil(limit / 7)),
    crawlCapterra(Math.ceil(limit / 7)),
    crawlAWSMarketplace(3),
    crawlSlackDirectory(4),
    crawlThereIsAnAI(5),
    crawlStackShare(3),
    crawlOpenCollective(3)
  ])

  for (const r of [g2Result, capterraResult, awsResult, slackResult, aiResult, stackResult, ossResult]) {
    if (r.status === 'fulfilled') allApps.push(...r.value)
  }

  console.log(`[crawl-directories] Total discovered: ${allApps.length} apps`)

  const { added, skipped, failed } = await persistApps(allApps.slice(0, limit))

  db.prepare(`UPDATE agent_runs SET status='done', finished_at=?, items_found=?, items_added=?, items_failed=? WHERE id=?`)
    .run(new Date().toISOString(), allApps.length, added, failed, runId)

  return { processed: allApps.length, added, skipped, failed }
}
