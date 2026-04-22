/**
 * POST /api/listings/scrape
 * Body: { url: string }
 *
 * Multi-page crawl of a public SaaS site. We fetch the homepage and a small
 * set of high-value secondary pages (pricing, features, product, about,
 * solutions, integrations, use-cases) in parallel and aggregate the
 * extracted text. This dramatically reduces what the user has to type:
 *  - name + tagline + long description from OG/meta + about page
 *  - logo via apple-touch-icon / icon link / og:image / favicon fallback
 *  - one or more category guesses from the combined corpus
 *  - pricingType from explicit signals; pricingValue parsed from $N/mo
 *  - 6-12 keyword tags pulled from headings + meta keywords + hint dictionary
 *
 * Returned shape mirrors the fields the chat onboarding component
 * hydrates the form with so the client can apply it in one assignment.
 */

interface ScrapeResult {
  ok: boolean
  url: string
  domain: string
  name?: string
  provider?: string
  tagline?: string
  description?: string
  logo?: string
  screenshot?: string
  category?: string
  categories?: string[]
  pricingType?: 'free' | 'freemium' | 'paid' | 'contact'
  pricingValue?: number | null
  detectedKeywords?: string[]
  pagesCrawled?: number
  error?: string
}

const CATEGORY_HINTS: Record<string, string[]> = {
  payments: ['payment', 'invoice', 'billing', 'checkout', 'stripe', 'subscription', 'paywall', 'merchant'],
  crm: ['crm', 'sales pipeline', 'lead', 'deal', 'customer relationship', 'contact management'],
  productivity: ['productivity', 'workspace', 'notes', 'docs', 'task', 'project management', 'kanban', 'collaboration'],
  marketing: ['marketing', 'email campaign', 'newsletter', 'seo', 'campaign', 'audience', 'attribution'],
  support: ['support', 'helpdesk', 'ticket', 'live chat', 'customer service', 'knowledge base'],
  hr: ['hr ', 'human resources', 'payroll', 'recruiting', 'onboarding employees', 'people ops', 'applicant tracking'],
  developer: ['developer', 'api ', 'sdk', 'devops', 'ci/cd', 'github', 'deploy', 'infrastructure', 'observability'],
  design: ['design', 'figma', 'prototyping', 'ui kit', 'wireframe', 'illustration', 'mockup'],
  integration: ['integration', 'webhook', 'zapier', 'sync data', 'connect apps', 'no-code', 'workflow automation'],
  ai: ['gpt', 'llm', 'machine learning', 'artificial intelligence', 'ai-powered', 'generative ai', 'embeddings', 'rag']
}

const PRICING_HINTS: Array<{ type: ScrapeResult['pricingType']; words: string[] }> = [
  { type: 'free', words: ['100% free', 'always free', 'free forever', 'open source', 'free and open'] },
  { type: 'freemium', words: ['free plan', 'free trial', 'freemium', 'free tier', 'free to start', 'start free'] },
  { type: 'contact', words: ['contact sales', 'request a quote', 'enterprise pricing', 'talk to sales', 'request demo'] },
  { type: 'paid', words: ['$', 'per month', '/month', 'per user', 'subscription', '/mo', '/seat'] }
]

// Secondary pages we'll try to crawl. Path patterns matched against href values
// that appear in the homepage's HTML. We also try a small set of common
// canonical paths blindly when no link is present.
const SECONDARY_PATTERNS: Array<{ key: string; re: RegExp; fallbacks: string[] }> = [
  { key: 'pricing', re: /pricing|plans/i, fallbacks: ['/pricing', '/plans'] },
  { key: 'features', re: /features|product|platform/i, fallbacks: ['/features', '/product'] },
  { key: 'about', re: /about|company/i, fallbacks: ['/about', '/about-us'] },
  { key: 'solutions', re: /solutions|use-?cases/i, fallbacks: ['/solutions', '/use-cases'] },
  { key: 'integrations', re: /integrations|apps|marketplace/i, fallbacks: ['/integrations'] }
]

const MAX_SECONDARY_PAGES = 5
const FETCH_TIMEOUT_MS = 6000
const MAIN_TIMEOUT_MS = 8000

function normalizeUrl(input: string): string | null {
  try {
    const trimmed = input.trim()
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const u = new URL(withScheme)
    return u.toString()
  } catch {
    return null
  }
}

function absolutize(maybeRelative: string, base: string): string {
  try {
    return new URL(maybeRelative, base).toString()
  } catch {
    return maybeRelative
  }
}

function decodeEntities(s: string): string {
  return s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ')
}

function firstMatch(html: string, patterns: RegExp[]): string | undefined {
  for (const p of patterns) {
    const m = p.exec(html)
    if (m?.[1]) return decodeEntities(m[1].trim())
  }
  return undefined
}

function stripTags(html: string): string {
  return html
    .replaceAll(/<script[\s\S]*?<\/script>/gi, ' ')
    .replaceAll(/<style[\s\S]*?<\/style>/gi, ' ')
    .replaceAll(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
}

function extractHeadings(html: string, limit = 12): string[] {
  const out: string[] = []
  const re = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null && out.length < limit) {
    const txt = decodeEntities(stripTags(m[1])).trim()
    if (txt && txt.length < 120) out.push(txt)
  }
  return out
}

function extractMetaKeywords(html: string): string[] {
  const re = /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i
  const m = re.exec(html)
  if (!m?.[1]) return []
  return decodeEntities(m[1])
    .split(/[,;]/)
    .map(k => k.trim().toLowerCase())
    .filter(k => k && k.length > 2 && k.length < 32)
}

function detectCategories(haystack: string): string[] {
  const lower = haystack.toLowerCase()
  const scored: Array<{ cat: string; score: number }> = []
  for (const [cat, words] of Object.entries(CATEGORY_HINTS)) {
    const score = words.reduce((s, w) => s + (lower.includes(w) ? 1 : 0), 0)
    if (score > 0) scored.push({ cat, score })
  }
  scored.sort((a, b) => b.score - a.score)
  // Return up to 3 categories that scored at least half of the top
  if (!scored.length) return []
  const threshold = Math.max(1, Math.floor(scored[0].score / 2))
  return scored.filter(s => s.score >= threshold).slice(0, 3).map(s => s.cat)
}

function detectPricing(haystack: string): ScrapeResult['pricingType'] | undefined {
  const lower = haystack.toLowerCase()
  for (const hint of PRICING_HINTS) {
    if (hint.words.some(w => lower.includes(w))) return hint.type
  }
  return undefined
}

function detectPricingValue(haystack: string): number | null {
  // Find lowest non-zero "$N" or "$N/mo" in pricing text
  const re = /\$\s?(\d{1,4})(?:\.\d{1,2})?\s*(?:\/|per)?\s*(?:mo|month|user|seat)?/gi
  const values: number[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(haystack)) !== null) {
    const n = Number.parseInt(m[1], 10)
    if (n > 0 && n < 10000) values.push(n)
  }
  if (!values.length) return null
  values.sort((a, b) => a - b)
  return values[0]
}

function detectKeywords(headings: string[], metaKeywords: string[], haystack: string): string[] {
  const lower = haystack.toLowerCase()
  const found = new Set<string>()

  for (const k of metaKeywords) found.add(k)

  for (const words of Object.values(CATEGORY_HINTS)) {
    for (const w of words) {
      if (lower.includes(w) && w.length > 3) {
        found.add(w.replaceAll(/[^a-z0-9 ]/g, '').trim())
      }
    }
  }

  // Pull short, distinctive phrases from headings
  for (const h of headings) {
    const cleaned = h.toLowerCase().replaceAll(/[^a-z0-9 ]/g, '').trim()
    if (cleaned && cleaned.split(/\s+/).length <= 4 && cleaned.length <= 32) {
      found.add(cleaned)
    }
  }

  return [...found]
    .filter(k => k && !/^[\d\s]+$/.test(k))
    .slice(0, 10)
}

async function fetchHtml(url: string, timeout: number): Promise<string> {
  const res = await $fetch.raw(url, {
    timeout,
    retry: 0,
    headers: {
      'user-agent': 'SaaSWorldBot/1.0 (+https://saasworld.io/bot)',
      accept: 'text/html,application/xhtml+xml'
    }
  })
  const text = await res._data
  return typeof text === 'string' ? text : String(text ?? '')
}

function discoverSecondaryUrls(html: string, baseUrl: string): string[] {
  const out = new Map<string, string>() // key -> absolute url, dedupe per key

  // Scan all anchor hrefs once
  const hrefRe = /<a[^>]+href=["']([^"'#?]+)(?:\?[^"']*)?(?:#[^"']*)?["']/gi
  const hrefs: string[] = []
  let m: RegExpExecArray | null
  while ((m = hrefRe.exec(html)) !== null) {
    if (m[1] && hrefs.length < 400) hrefs.push(m[1])
  }

  const baseHost = new URL(baseUrl).host
  const sameOrigin = (href: string): boolean => {
    try { return new URL(href, baseUrl).host === baseHost } catch { return false }
  }

  for (const { key, re, fallbacks } of SECONDARY_PATTERNS) {
    if (out.has(key)) continue
    const match = hrefs.find(h => re.exec(h) && sameOrigin(h))
    if (match) {
      out.set(key, absolutize(match, baseUrl))
    } else if (fallbacks[0]) {
      out.set(key, absolutize(fallbacks[0], baseUrl))
    }
  }

  return [...out.values()].slice(0, MAX_SECONDARY_PAGES)
}

export default defineEventHandler(async (event): Promise<ScrapeResult> => {
  const body = await readBody<{ url?: string }>(event)
  const normalized = body?.url ? normalizeUrl(body.url) : null

  if (!normalized) {
    return { ok: false, url: '', domain: '', error: 'Please provide a valid website URL.' }
  }

  const domain = new URL(normalized).hostname.replace(/^www\./, '')
  const faviconLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  const fallbackName = domain.split('.')[0].replaceAll('-', ' ').replaceAll(/\b\w/g, c => c.toUpperCase())

  let homeHtml = ''
  try {
    homeHtml = await fetchHtml(normalized, MAIN_TIMEOUT_MS)
  } catch (err) {
    return {
      ok: true,
      url: normalized,
      domain,
      name: fallbackName,
      provider: fallbackName,
      logo: faviconLogo,
      pagesCrawled: 0,
      error: `Could not fetch site (${(err as Error).message}). You can still continue and edit details manually.`
    }
  }

  // Discover secondary pages, fetch in parallel
  const secondaryUrls = discoverSecondaryUrls(homeHtml, normalized)
  const secondaryResults = await Promise.allSettled(
    secondaryUrls.map(u => fetchHtml(u, FETCH_TIMEOUT_MS))
  )
  const secondaryHtml = secondaryResults
    .map(r => (r.status === 'fulfilled' ? r.value : ''))
    .filter(Boolean)
  const pagesCrawled = 1 + secondaryHtml.length

  // ===== Extract from homepage (preferred for branding fields) =====
  const result: ScrapeResult = { ok: true, url: normalized, domain, pagesCrawled }

  result.name = firstMatch(homeHtml, [
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']application-name["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<title>([^<]+)<\/title>/i
  ]) || fallbackName

  // Tagline: prefer og:description, then twitter:description, then meta description
  result.tagline = firstMatch(homeHtml, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  ])

  // Long description: try about page first, fallback to homepage tagline
  const aboutHtml = secondaryHtml.find(h => /about|company|mission/i.test(h.slice(0, 4000)))
  if (aboutHtml) {
    const aboutText = stripTags(aboutHtml)
    // Take the first 2-3 substantial sentences
    const sentences = aboutText.split(/(?<=[.!?])\s+/).filter(s => s.length > 40 && s.length < 280)
    if (sentences.length) {
      result.description = sentences.slice(0, 3).join(' ').slice(0, 600)
    }
  }
  if (!result.description) result.description = result.tagline

  // Provider name: use og:site_name or fallback to capitalized name
  result.provider = result.name

  // Screenshot
  result.screenshot = firstMatch(homeHtml, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
  ])
  if (result.screenshot) result.screenshot = absolutize(result.screenshot, normalized)

  // Logo
  const appleIconRe = /<link[^>]+rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["'][^>]+href=["']([^"']+)["']/i
  const standardIconRe = /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i
  const logoMatch = appleIconRe.exec(homeHtml) ?? standardIconRe.exec(homeHtml)
  result.logo = logoMatch?.[1] ? absolutize(logoMatch[1], normalized) : faviconLogo

  // ===== Aggregate corpus for category / pricing / keyword detection =====
  const allHtml = [homeHtml, ...secondaryHtml].join('\n')
  const corpus = `${result.name ?? ''} ${result.tagline ?? ''} ${result.description ?? ''} ${stripTags(allHtml).slice(0, 30000)}`

  const cats = detectCategories(corpus)
  if (cats.length) {
    result.categories = cats
    result.category = cats[0]
  }

  // Pricing: focus the heuristic on the pricing page if we got one
  const pricingHtml = secondaryHtml.find(h => /pricing|\/mo|per month|per user/i.test(h.slice(0, 8000))) ?? ''
  const pricingCorpus = pricingHtml ? stripTags(pricingHtml) : corpus
  result.pricingType = detectPricing(pricingCorpus) ?? detectPricing(corpus)
  result.pricingValue = detectPricingValue(pricingCorpus)

  // Keywords from headings + meta + hint dictionary
  const headings = extractHeadings(homeHtml, 8).concat(
    secondaryHtml.flatMap(h => extractHeadings(h, 4))
  )
  const metaKeywords = extractMetaKeywords(homeHtml)
  result.detectedKeywords = detectKeywords(headings, metaKeywords, corpus)

  return result
})
