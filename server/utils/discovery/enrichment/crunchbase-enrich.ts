/**
 * Crunchbase Enrichment Agent
 * Enriches existing app_listings with company intelligence from Crunchbase:
 *   - Funding stage (seed, series A/B/C…)
 *   - Total funding raised
 *   - Employee count range
 *   - Founded year (if missing)
 *   - HQ city + country
 *   - Crunchbase permalink (for linking)
 *
 * Requires: CRUNCHBASE_API_KEY (Basic tier — 200 calls/month free)
 * Schedule: Weekly (Friday 2am UTC) — batch of 30 to stay in free tier
 *
 * Only enriches apps where crunchbase data is missing/stale.
 */
import { getDb } from '~/server/utils/database'

const CB_API = 'https://api.crunchbase.com/api/v4'

interface CBCompanyData {
  permalink: string
  funding_stage: string | null
  total_funding_usd: number | null
  num_employees_enum: string | null
  founded_on: string | null
  hq_city: string | null
  hq_country: string | null
  short_description: string | null
}

interface CBSearchResult {
  entities: Array<{
    properties: {
      identifier: { value: string; permalink: string }
      funding_stage?: string
      funding_total?: { value_usd: number }
      num_employees_enum?: string
      founded_on?: { value: string }
      location_identifiers?: Array<{ value: string; location_type: string }>
      short_description?: string
    }
  }>
}

async function lookupCrunchbaseByDomain(domain: string): Promise<CBCompanyData | null> {
  const apiKey = process.env.CRUNCHBASE_API_KEY
  if (!apiKey) throw new Error('CRUNCHBASE_API_KEY not set')

  const body = {
    field_ids: [
      'identifier', 'funding_stage', 'funding_total',
      'num_employees_enum', 'founded_on', 'location_identifiers',
      'short_description'
    ],
    query: [
      {
        type: 'predicate',
        field_id: 'website_url',
        operator_id: 'domain_eq',
        values: [domain]
      }
    ],
    limit: 1
  }

  const res = await fetch(`${CB_API}/searches/organizations?user_key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'MoonmartBot/1.0'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000)
  })

  if (res.status === 429) {
    console.warn('[crunchbase-enrich] Rate limited — sleeping 60s')
    await new Promise(r => setTimeout(r, 60_000))
    return null
  }
  if (!res.ok) return null

  const json = await res.json() as CBSearchResult
  const entity = json.entities?.[0]?.properties
  if (!entity) return null

  const locations = entity.location_identifiers || []
  const city = locations.find(l => l.location_type === 'city')?.value || null
  const country = locations.find(l => l.location_type === 'country')?.value || null

  return {
    permalink: entity.identifier.permalink,
    funding_stage: entity.funding_stage || null,
    total_funding_usd: entity.funding_total?.value_usd || null,
    num_employees_enum: entity.num_employees_enum || null,
    founded_on: entity.founded_on?.value || null,
    hq_city: city,
    hq_country: country,
    short_description: entity.short_description || null
  }
}

function employeeEnumToRange(enumVal: string | null): string | null {
  if (!enumVal) return null
  const map: Record<string, string> = {
    'c_00001_00010': '1-10',
    'c_00011_00050': '11-50',
    'c_00051_00100': '51-100',
    'c_00101_00250': '101-250',
    'c_00251_00500': '251-500',
    'c_00501_01000': '501-1000',
    'c_01001_05000': '1001-5000',
    'c_05001_10000': '5001-10000',
    'c_10001_max': '10001+'
  }
  return map[enumVal] || null
}

export interface CrunchbaseEnrichResult {
  processed: number
  enriched: number
  notFound: number
  failed: number
}

export async function runCrunchbaseEnrichmentBatch(
  batchSize = 30
): Promise<CrunchbaseEnrichResult> {
  const db = getDb()

  if (!process.env.CRUNCHBASE_API_KEY) {
    console.warn('[crunchbase-enrich] CRUNCHBASE_API_KEY not set — skipping')
    return { processed: 0, enriched: 0, notFound: 0, failed: 0 }
  }

  // Find apps missing CB data, not checked in 30 days
  const apps = db.prepare(`
    SELECT id, name, website, founded_year
    FROM app_listings
    WHERE status = 'published'
      AND (
        crunchbase_permalink IS NULL
        OR crunchbase_checked_at < datetime('now', '-30 days')
      )
    ORDER BY crunchbase_checked_at ASC NULLS FIRST
    LIMIT ?
  `).all(batchSize) as Array<{
    id: string
    name: string
    website: string
    founded_year: number | null
  }>

  const result: CrunchbaseEnrichResult = {
    processed: 0,
    enriched: 0,
    notFound: 0,
    failed: 0
  }

  for (const app of apps) {
    result.processed++
    try {
      let domain = ''
      try {
        domain = new URL(app.website).hostname.replace(/^www\./, '')
      }
      catch {
        result.failed++
        continue
      }

      const data = await lookupCrunchbaseByDomain(domain)
      const now = new Date().toISOString()

      if (!data) {
        db.prepare(
          `UPDATE app_listings SET crunchbase_checked_at = ? WHERE id = ?`
        ).run(now, app.id)
        result.notFound++
        continue
      }

      const foundedYear = data.founded_on
        ? parseInt(data.founded_on.split('-')[0], 10)
        : null

      db.prepare(`
        UPDATE app_listings
        SET
          crunchbase_permalink = ?,
          funding_stage = ?,
          total_funding_usd = ?,
          employee_range = ?,
          founded_year = COALESCE(founded_year, ?),
          hq_city = COALESCE(hq_city, ?),
          hq_country = COALESCE(hq_country, ?),
          crunchbase_checked_at = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        data.permalink,
        data.funding_stage,
        data.total_funding_usd,
        employeeEnumToRange(data.num_employees_enum),
        foundedYear,
        data.hq_city,
        data.hq_country,
        now,
        now,
        app.id
      )

      console.log(
        `[crunchbase-enrich] Enriched ${app.name}: ` +
        `${data.funding_stage || 'no stage'}, ` +
        `$${data.total_funding_usd ? (data.total_funding_usd / 1_000_000).toFixed(1) + 'M' : '?'} raised`
      )
      result.enriched++
    }
    catch (err) {
      console.error(`[crunchbase-enrich] Failed for ${app.name}:`, err)
      result.failed++
    }

    // 1 call/s to stay within rate limit
    await new Promise(r => setTimeout(r, 1100))
  }

  return result
}
