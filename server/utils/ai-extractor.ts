/**
 * AI Extractor — fetches a SaaS landing page, strips it to readable text,
 * calls OpenAI to extract structured product data, and returns a confidence-
 * scored ExtractedListing ready to route into the discovery pipeline.
 *
 * No external scraping library required — uses Node 18+ built-in fetch.
 * Swap `fetchPageText` for Firecrawl if you need JS-rendered pages at scale.
 */

export const SAAS_CATEGORIES = [
  'CRM', 'Project Management', 'Analytics', 'Marketing', 'HR & Recruitment',
  'Finance & Accounting', 'Developer Tools', 'Security', 'Communication',
  'Customer Support', 'E-Commerce', 'Design', 'Legal', 'Productivity',
  'Data & BI', 'IT Management', 'Sales', 'Operations', 'Education', 'Other'
] as const

export type SaasCategory = typeof SAAS_CATEGORIES[number]
export type PricingType = 'free' | 'freemium' | 'paid' | 'contact'

export interface FieldConfidence {
  name: number
  description: number
  category: number
  pricing: number
  features: number
  overall: number
}

export interface ExtractedListing {
  name: string
  tagline: string
  short_description: string
  long_description: string
  category: SaasCategory
  pricing_type: PricingType
  pricing_starts_at: number | null   // USD/month, null if contact or free
  target_audience: string
  key_features: string[]
  integrations: string[]
  logo_url: string | null
  website_url: string
  founded_year: number | null
  confidence: FieldConfidence
}

// ─── Page Fetcher ─────────────────────────────────────────────────────────────

export async function fetchPageText(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    return extractReadableContent(html, url)
  }
  finally {
    clearTimeout(timeout)
  }
}

/** Strips HTML down to a token-efficient text block OpenAI can reason about. */
function extractReadableContent(html: string, url: string): string {
  const parts: string[] = [`URL: ${url}`]

  // Title
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
  if (title) parts.push(`Page title: ${title}`)

  // Meta description
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]
  if (metaDesc) parts.push(`Meta description: ${metaDesc}`)

  // OpenGraph
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
  const ogDesc  = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
  if (ogTitle) parts.push(`OG title: ${ogTitle}`)
  if (ogDesc)  parts.push(`OG description: ${ogDesc}`)
  if (ogImage) parts.push(`Logo/image URL: ${ogImage}`)

  // Twitter card
  const twTitle = html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
  const twDesc  = html.match(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i)?.[1]
  if (twTitle && twTitle !== ogTitle) parts.push(`Twitter title: ${twTitle}`)
  if (twDesc  && twDesc  !== ogDesc)  parts.push(`Twitter description: ${twDesc}`)

  // JSON-LD schema.org (often contains structured product/organization data)
  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1])
      const relevant = JSON.stringify(parsed, null, 0).slice(0, 800)
      parts.push(`Schema.org data: ${relevant}`)
    } catch { /* ignore invalid JSON */ }
  }

  // Strip all HTML tags, collapse whitespace, grab first 3000 chars of body text
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 3000)

  if (bodyText) parts.push(`Page body (truncated): ${bodyText}`)

  return parts.join('\n\n')
}

// ─── LLM Extraction ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a SaaS product analyst. Given a web page's content, extract
structured data about the software product and return ONLY valid JSON.

CATEGORY — pick exactly one: ${SAAS_CATEGORIES.join(', ')}

PRICING_TYPE rules:
- "free"      = completely free, no paid tier
- "freemium"  = free tier AND paid tier exist
- "paid"      = requires payment (trials are OK, no real free tier)
- "contact"   = no public pricing, enterprise only

CONFIDENCE scores (0.0 – 1.0 per field):
- 0.9–1.0: explicitly stated on the page, zero ambiguity
- 0.7–0.9: reasonably inferred, likely correct
- 0.5–0.7: educated guess — flag for human review
- < 0.5:   do not know — use null for that field value

Return this exact JSON shape (no markdown, no extra text):
{
  "name": "...",
  "tagline": "...",
  "short_description": "...",
  "long_description": "...",
  "category": "...",
  "pricing_type": "free|freemium|paid|contact",
  "pricing_starts_at": <number or null>,
  "target_audience": "...",
  "key_features": ["...", "..."],
  "integrations": ["...", "..."],
  "logo_url": "...",
  "website_url": "...",
  "founded_year": <number or null>,
  "confidence": {
    "name": 0.0,
    "description": 0.0,
    "category": 0.0,
    "pricing": 0.0,
    "features": 0.0,
    "overall": 0.0
  }
}`

export async function extractWithAI(pageText: string, websiteUrl: string): Promise<ExtractedListing> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...(process.env.OPENAI_ORG_ID ? { 'OpenAI-Organization': process.env.OPENAI_ORG_ID } : {})
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',            // fast + cheap: ~$0.0002 per page
      response_format: { type: 'json_object' },
      temperature: 0,                  // deterministic extraction
      max_tokens: 800,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Extract product data from this page:\n\n${pageText}` }
      ]
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${err}`)
  }

  const json = await res.json() as { choices: Array<{ message: { content: string } }> }
  const raw = json.choices?.[0]?.message?.content

  if (!raw) throw new Error('Empty response from OpenAI')

  let parsed: Partial<ExtractedListing>
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`OpenAI returned invalid JSON: ${raw.slice(0, 200)}`)
  }

  return normalise(parsed, websiteUrl)
}

/** Ensures the parsed object matches ExtractedListing, filling safe defaults. */
function normalise(raw: Partial<ExtractedListing>, websiteUrl: string): ExtractedListing {
  const confidence: FieldConfidence = {
    name:        clamp(raw.confidence?.name        ?? 0.5),
    description: clamp(raw.confidence?.description ?? 0.5),
    category:    clamp(raw.confidence?.category    ?? 0.5),
    pricing:     clamp(raw.confidence?.pricing     ?? 0.5),
    features:    clamp(raw.confidence?.features    ?? 0.5),
    overall:     clamp(raw.confidence?.overall     ?? 0.5)
  }

  return {
    name:              sanitise(raw.name)              || extractDomainName(websiteUrl),
    tagline:           sanitise(raw.tagline)           || '',
    short_description: sanitise(raw.short_description) || '',
    long_description:  sanitise(raw.long_description)  || '',
    category:          SAAS_CATEGORIES.includes(raw.category as SaasCategory)
                         ? (raw.category as SaasCategory) : 'Other',
    pricing_type:      (['free','freemium','paid','contact'] as const).includes(raw.pricing_type as PricingType)
                         ? (raw.pricing_type as PricingType) : 'contact',
    pricing_starts_at: typeof raw.pricing_starts_at === 'number' ? raw.pricing_starts_at : null,
    target_audience:   sanitise(raw.target_audience)   || '',
    key_features:      (raw.key_features ?? []).filter(f => typeof f === 'string').slice(0, 10),
    integrations:      (raw.integrations  ?? []).filter(i => typeof i === 'string').slice(0, 20),
    logo_url:          sanitise(raw.logo_url)           || null,
    website_url:       sanitise(raw.website_url)        || websiteUrl,
    founded_year:      typeof raw.founded_year === 'number' ? raw.founded_year : null,
    confidence
  }
}

// ─── Confidence Scorer ────────────────────────────────────────────────────────

/**
 * Weighted confidence score for routing decisions.
 * Returns 0.0–1.0 where >= 0.92 = auto-submit, 0.70-0.91 = review queue.
 */
export function computeScore(confidence: FieldConfidence): number {
  return (
    confidence.name        * 0.25 +
    confidence.description * 0.25 +
    confidence.category    * 0.20 +
    confidence.pricing     * 0.15 +
    confidence.features    * 0.15
  )
}

export function routeByScore(score: number): 'auto_submit' | 'review' | 'discard' {
  if (score >= 0.92) return 'auto_submit'
  if (score >= 0.70) return 'review'
  return 'discard'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(n: number): number {
  return Math.min(1, Math.max(0, Number(n) || 0))
}

function sanitise(v: unknown): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : ''
}

function extractDomainName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').split('.')[0] || url
  } catch {
    return url
  }
}
