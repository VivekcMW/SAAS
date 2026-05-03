/**
 * Proxycurl Enrichment Utility
 * API: https://nubela.co/proxycurl/
 * Requires: PROXYCURL_API_KEY env var
 *
 * Enriches a discovery queue item with:
 *   - Company LinkedIn data (employee count, founding year, industry, logo)
 *   - Founder/CEO name + LinkedIn URL (for personalised outreach)
 *
 * Rate-limited to 1 req/s by default (Proxycurl free tier: 10 credits/min).
 * Each company lookup = 1 credit. Each person lookup = 1 credit.
 *
 * Usage:
 *   import { enrichWithProxycurl } from '~/server/utils/discovery/enrichment/proxycurl'
 *   const enriched = await enrichWithProxycurl('https://example.com')
 */

export interface ProxycurlCompany {
  name: string | null
  description: string | null
  website: string | null
  industry: string | null
  company_size: [number, number] | null   // [min, max] employees
  founded_year: number | null
  hq_city: string | null
  hq_country: string | null
  logo_url: string | null
  linkedin_url: string | null
  specialities: string[]
  ceo_name: string | null
  ceo_linkedin_url: string | null
}

export interface ProxycurlPerson {
  full_name: string | null
  headline: string | null
  email: string | null   // Proxycurl personal email inference (paid add-on)
  linkedin_url: string | null
}

export interface EnrichmentResult {
  company: ProxycurlCompany | null
  founder: ProxycurlPerson | null
  error?: string
}

const PROXYCURL_API = 'https://nubela.co/proxycurl/api'

async function proxycurlGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const apiKey = process.env.PROXYCURL_API_KEY
  if (!apiKey) throw new Error('PROXYCURL_API_KEY is not set')

  const qs = new URLSearchParams(params)
  const res = await fetch(`${PROXYCURL_API}${path}?${qs}`, {
    signal: AbortSignal.timeout(20_000),
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  })

  if (res.status === 404) return null as unknown as T
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Proxycurl ${path} → ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

interface RawCompany {
  name?: string
  description?: string
  website?: string
  industry?: string
  company_size_on_linkedin?: number
  founded_year?: number
  hq?: { city?: string; country?: string }
  profile_pic_url?: string
  url?: string
  specialities?: string[]
  extra?: { ceo_name?: string; ceo_profile_url?: string }
}

interface RawPerson {
  full_name?: string
  headline?: string
  personal_emails?: string[]
  public_identifier?: string
}

/**
 * Look up a company by website URL via Proxycurl.
 * Returns structured company data including potential CEO name.
 */
export async function lookupCompany(websiteUrl: string): Promise<ProxycurlCompany | null> {
  const raw = await proxycurlGet<RawCompany>('/linkedin/company', {
    url: websiteUrl,
    resolve_numeric_id: 'false'
  })

  if (!raw?.name) return null

  const size = raw.company_size_on_linkedin
    ? ([Math.max(0, raw.company_size_on_linkedin - 10), raw.company_size_on_linkedin + 10] as [number, number])
    : null

  return {
    name: raw.name || null,
    description: raw.description || null,
    website: raw.website || null,
    industry: raw.industry || null,
    company_size: size,
    founded_year: raw.founded_year || null,
    hq_city: raw.hq?.city || null,
    hq_country: raw.hq?.country || null,
    logo_url: raw.profile_pic_url || null,
    linkedin_url: raw.url || null,
    specialities: raw.specialities || [],
    ceo_name: raw.extra?.ceo_name || null,
    ceo_linkedin_url: raw.extra?.ceo_profile_url || null
  }
}

/**
 * Look up a founder by their LinkedIn URL via Proxycurl.
 */
export async function lookupPerson(linkedinUrl: string): Promise<ProxycurlPerson | null> {
  const raw = await proxycurlGet<RawPerson>('/linkedin/person', {
    url: linkedinUrl,
    personal_email: 'include',   // may cost extra credit; uses inferred email
    personal_contact_number: 'exclude'
  })

  if (!raw?.full_name) return null

  return {
    full_name: raw.full_name || null,
    headline: raw.headline || null,
    email: raw.personal_emails?.[0] || null,
    linkedin_url: linkedinUrl
  }
}

/**
 * Enrich a discovery queue item given its website URL.
 * Performs: company lookup → CEO LinkedIn lookup (if available) → return merged result.
 *
 * Cost: 1-2 Proxycurl credits per call.
 */
export async function enrichWithProxycurl(websiteUrl: string): Promise<EnrichmentResult> {
  try {
    const company = await lookupCompany(websiteUrl)

    let founder: ProxycurlPerson | null = null
    if (company?.ceo_linkedin_url) {
      try {
        founder = await lookupPerson(company.ceo_linkedin_url)
        // Respect rate limit — 1 req/s
        await new Promise(r => setTimeout(r, 1100))
      }
      catch (err) {
        console.warn('[proxycurl] Person lookup failed:', err)
      }
    }

    return { company, founder }
  }
  catch (err) {
    console.error('[proxycurl] Enrichment failed for', websiteUrl, err)
    return { company: null, founder: null, error: String(err) }
  }
}

/**
 * Batch-enrich all discovery_queue items with status 'needs_review' or 'auto_approved'
 * that have not yet been enriched (no founder_name set).
 *
 * Designed to be called from a Nitro task or admin endpoint.
 */
export async function runProxycurlEnrichmentBatch(limit = 20): Promise<{
  processed: number
  enriched: number
  skipped: number
}> {
  if (!process.env.PROXYCURL_API_KEY) {
    console.warn('[proxycurl] PROXYCURL_API_KEY not set — skipping enrichment batch')
    return { processed: 0, enriched: 0, skipped: 0 }
  }

  const { getDb } = await import('~/server/utils/database')
  const db = getDb()

  const items = db.prepare(`
    SELECT id, website_url, extracted_data
    FROM discovery_queue
    WHERE status IN ('needs_review', 'auto_approved')
      AND (founder_name IS NULL OR founder_name = '')
    ORDER BY confidence_score DESC
    LIMIT ?
  `).all(limit) as Array<{ id: string; website_url: string; extracted_data: string }>

  let enriched = 0
  let skipped = 0

  for (const item of items) {
    const result = await enrichWithProxycurl(item.website_url)

    if (!result.company) {
      skipped++
      // Rate limit pause even on miss
      await new Promise(r => setTimeout(r, 1100))
      continue
    }

    let extracted: Record<string, unknown> = {}
    try { extracted = JSON.parse(item.extracted_data) } catch { /* ok */ }

    // Merge enrichment into extracted_data
    if (result.company.logo_url && !extracted.logo_url) {
      extracted.logo_url = result.company.logo_url
    }
    if (result.company.founded_year && !extracted.founded_year) {
      extracted.founded_year = result.company.founded_year
    }
    if (result.company.description && !extracted.long_description) {
      extracted.long_description = result.company.description
    }

    db.prepare(`
      UPDATE discovery_queue
      SET extracted_data = ?,
          founder_name = ?,
          founder_email = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      JSON.stringify(extracted),
      result.founder?.full_name || result.company.ceo_name || null,
      result.founder?.email || null,
      new Date().toISOString(),
      item.id
    )

    enriched++
    // Rate limit: 1 company + possibly 1 person lookup per iteration
    await new Promise(r => setTimeout(r, 1200))
  }

  console.log(`[proxycurl] Batch done. processed=${items.length} enriched=${enriched} skipped=${skipped}`)
  return { processed: items.length, enriched, skipped }
}
