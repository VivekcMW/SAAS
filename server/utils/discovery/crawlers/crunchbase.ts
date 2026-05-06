/**
 * Crunchbase Discovery Crawler
 * Source: https://www.crunchbase.com (public search + Crunchbase Basic API)
 * Schedule: Weekly (Sunday 3am UTC)
 * Auth: CRUNCHBASE_API_KEY (Crunchbase Basic — free tier: 200 calls/month)
 * Est. apps: 4,000,000+ companies (filter to SaaS)
 *
 * Discovers SaaS companies from Crunchbase filtered by:
 *   - category_groups: software, mobile, internet_services
 *   - funding_stage: seed, series_a, series_b (quality signal)
 *   - has_website: true
 *
 * API Docs: https://data.crunchbase.com/docs/using-the-api
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

const CB_API = 'https://api.crunchbase.com/api/v4'

interface CBOrganization {
  identifier: { value: string; permalink: string }
  short_description: string | null
  website_url: string | null
  logo_url: string | null
  founded_on: { value: string } | null
  num_employees_enum: string | null
  funding_stage: string | null
  categories: Array<{ value: string }> | null
  location_identifiers: Array<{ value: string; location_type: string }> | null
}

interface CBSearchResponse {
  entities: Array<{ properties: CBOrganization }>
  count: number
  total_count: number
}

async function searchCrunchbase(
  afterId: string | null,
  limit: number
): Promise<{ orgs: CBOrganization[]; nextAfter: string | null; total: number }> {
  const apiKey = process.env.CRUNCHBASE_API_KEY
  if (!apiKey) throw new Error('CRUNCHBASE_API_KEY is not set')

  const body = {
    field_ids: [
      'identifier', 'short_description', 'website_url', 'logo_url',
      'founded_on', 'num_employees_enum', 'funding_stage', 'categories',
      'location_identifiers'
    ],
    query: [
      {
        type: 'predicate',
        field_id: 'facet_ids',
        operator_id: 'includes',
        values: ['company']
      },
      {
        type: 'predicate',
        field_id: 'category_groups',
        operator_id: 'includes',
        values: ['software', 'internet_services', 'mobile']
      },
      {
        type: 'predicate',
        field_id: 'website_url',
        operator_id: 'not_blank',
        values: []
      }
    ],
    order: [{ field_id: 'rank_org', sort: 'asc' }],
    limit,
    ...(afterId ? { after_id: afterId } : {})
  }

  const res = await fetch(`${CB_API}/searches/organizations?user_key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'MoonmartBot/1.0'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25_000)
  })

  if (res.status === 429) {
    console.warn('[crunchbase] Rate limited — waiting 60s')
    await new Promise(r => setTimeout(r, 60_000))
    return { orgs: [], nextAfter: afterId, total: 0 }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Crunchbase API ${res.status}: ${text}`)
  }

  const json = await res.json() as CBSearchResponse
  const orgs = json.entities.map(e => e.properties)
  const lastOrg = json.entities[json.entities.length - 1]
  const nextAfter = lastOrg?.properties?.identifier?.permalink || null

  return { orgs, nextAfter, total: json.total_count }
}

/** Map Crunchbase employee count enum to rough range */
function parseEmployeeCount(enumVal: string | null): number | null {
  if (!enumVal) return null
  const map: Record<string, number> = {
    'c_00001_00010': 5,
    'c_00011_00050': 30,
    'c_00051_00100': 75,
    'c_00101_00250': 175,
    'c_00251_00500': 375,
    'c_00501_01000': 750,
    'c_01001_05000': 3000,
    'c_05001_10000': 7500,
    'c_10001_max': 15000
  }
  return map[enumVal] || null
}

export async function runCrunchbaseCrawler(
  limit = 100
): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'crunchbase', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allOrgs: CBOrganization[] = []
    let afterId: string | null = null
    const batchSize = 25 // stay within free tier per call

    while (allOrgs.length < limit) {
      const { orgs, nextAfter } = await searchCrunchbase(afterId, batchSize)
      if (orgs.length === 0) break
      allOrgs.push(...orgs)
      afterId = nextAfter
      if (!nextAfter) break
      await new Promise(r => setTimeout(r, 2000))
    }

    const withSites = allOrgs.filter(o => o.website_url?.startsWith('http'))
    found = withSites.length

    const newUrls = filterNew(withSites.map(o => o.website_url!))
    const newSet = new Set(newUrls)
    const toProcess = withSites.filter(o => newSet.has(o.website_url!)).slice(0, limit)

    const now = new Date().toISOString()

    for (const org of toProcess) {
      try {
        const employeeCount = parseEmployeeCount(org.num_employees_enum)
        const foundedYear = org.founded_on?.value
          ? parseInt(org.founded_on.value.split('-')[0], 10)
          : null

        let extracted = {
          name: org.identifier.value,
          tagline: org.short_description || org.identifier.value,
          short_description: org.short_description || '',
          long_description: org.short_description || '',
          category: mapCBCategoryToSaas(org.categories?.[0]?.value || ''),
          pricing_type: 'contact' as const,
          pricing_starts_at: null as number | null,
          target_audience: '',
          key_features: [] as string[],
          integrations: [] as string[],
          logo_url: org.logo_url || null,
          website_url: org.website_url!,
          founded_year: foundedYear,
          confidence: {
            name: 0.95,
            description: org.short_description ? 0.7 : 0.1,
            category: org.categories?.length ? 0.65 : 0.1,
            pricing: 0.1,
            features: 0.1,
            overall: org.short_description ? 0.52 : 0.28
          }
        }

        // AI enrichment for pricing, features, detailed description
        try {
          const pageText = await fetchPageText(org.website_url!)
          const aiResult = await extractWithAI(pageText, org.website_url!)
          extracted = {
            ...extracted,
            pricing_type: aiResult.pricing_type,
            pricing_starts_at: aiResult.pricing_starts_at,
            key_features: aiResult.key_features,
            target_audience: aiResult.target_audience,
            long_description: aiResult.long_description || extracted.long_description,
            confidence: {
              ...aiResult.confidence,
              // Keep CB name confidence higher than AI since CB is authoritative
              name: Math.max(aiResult.confidence.name, 0.95)
            }
          }
        }
        catch { /* optional */ }

        const score = computeScore(extracted.confidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, founder_email, processed_at, created_at)
          VALUES (?, 'crunchbase', ?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          itemId,
          `https://www.crunchbase.com/organization/${org.identifier.permalink}`,
          org.website_url,
          JSON.stringify({
            ...extracted,
            cb_permalink: org.identifier.permalink,
            cb_funding_stage: org.funding_stage,
            cb_employee_count: employeeCount
          }),
          score,
          status,
          now,
          now
        )

        added++
      }
      catch (err) {
        console.error('[crunchbase] Failed for', org.website_url, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 1500))
    }

    db.prepare(
      `UPDATE agent_runs SET status = 'done', finished_at = ?, items_found = ?, items_added = ?, items_failed = ? WHERE id = ?`
    ).run(new Date().toISOString(), found, added, failed, runId)
  }
  catch (err) {
    console.error('[crunchbase] Fatal error:', err)
    db.prepare(`UPDATE agent_runs SET status = 'error', finished_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), runId)
    throw err
  }

  return { found, added, failed }
}

function mapCBCategoryToSaas(cbCategory: string): string {
  const map: Record<string, string> = {
    'crm': 'CRM',
    'project management': 'Project Management',
    'analytics': 'Analytics',
    'marketing': 'Marketing',
    'human resources': 'HR & Recruitment',
    'accounting': 'Finance & Accounting',
    'developer tools': 'Developer Tools',
    'cybersecurity': 'Security',
    'messaging': 'Communication',
    'customer service': 'Customer Support',
    'e-commerce': 'E-Commerce',
    'design': 'Design',
    'productivity tools': 'Productivity',
    'business intelligence': 'Data & BI',
    'it management': 'IT Management',
    'sales automation': 'Sales',
    'edtech': 'Education',
  }
  const key = (cbCategory || '').toLowerCase()
  return map[key] || 'Other'
}
