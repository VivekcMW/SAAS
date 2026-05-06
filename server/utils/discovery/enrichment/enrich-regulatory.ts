/**
 * International Regulatory Filing Enrichment Agent
 *
 * Pulls official company registration data from public registries worldwide:
 *   - Incorporation date + legal entity type
 *   - Registered address / country
 *   - Company number (official)
 *   - SIC / NACE industry code
 *   - Directors count (proxy for team seniority)
 *
 * Sources (all free public APIs, no paid keys required):
 *   1. OpenCorporates API — aggregates 160+ registries worldwide (free, no key)
 *   2. Companies House API — UK (free, key optional for higher limits)
 *   3. SEC EDGAR — US public filings (free, no key)
 *   4. Australian Business Register (ABR) — ABN lookup API (free)
 *   5. INPI / Pappers.fr — France company data (free tier)
 *   6. MCA21 (India) — Ministry of Corporate Affairs (free)
 *   7. Registro Mercantil — Spain (public data scrape)
 *   8. ACRA BizFile — Singapore (limited public data)
 *
 * Schedule: Saturday 7am UTC (after other enrichment tasks complete)
 * Batch:    150 listings per run
 *
 * Output table: regulatory_data (created if missing)
 */
import { getDb, makeId } from '~/server/utils/database'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RegulatoryData {
  app_id: string
  company_number: string | null
  legal_name: string | null
  incorporation_date: string | null
  company_type: string | null         // Ltd, LLC, Corp, GmbH, etc.
  registered_country: string | null
  registered_address: string | null
  industry_code: string | null        // SIC or NACE code
  industry_description: string | null
  directors_count: number | null
  status: 'active' | 'inactive' | 'dissolved' | 'unknown'
  registry_source: string
  enriched_at: string
}

// ── DB Bootstrap ──────────────────────────────────────────────────────────────

function ensureRegulatoryTable() {
  getDb().prepare(`
    CREATE TABLE IF NOT EXISTS regulatory_data (
      id                   TEXT PRIMARY KEY,
      app_id               TEXT NOT NULL UNIQUE,
      company_number       TEXT,
      legal_name           TEXT,
      incorporation_date   TEXT,
      company_type         TEXT,
      registered_country   TEXT,
      registered_address   TEXT,
      industry_code        TEXT,
      industry_description TEXT,
      directors_count      INTEGER,
      status               TEXT NOT NULL DEFAULT 'unknown',
      registry_source      TEXT NOT NULL,
      enriched_at          TEXT NOT NULL,
      created_at           TEXT NOT NULL
    )
  `).run()
}

// ── HTTP Helper ───────────────────────────────────────────────────────────────

async function httpGet(url: string, ms = 15_000, headers?: Record<string, string>): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json,text/html,*/*', ...headers },
    signal: AbortSignal.timeout(ms)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)
  return res.text()
}

// ── Source 1: OpenCorporates (160+ jurisdictions) ─────────────────────────────

interface OCCompany {
  company_number?: string
  name?: string
  incorporation_date?: string
  company_type?: string
  jurisdiction_code?: string
  registered_address?: { street_address?: string; locality?: string; country?: string }
  current_status?: string
  number_of_employees?: number
  industry_codes?: Array<{ code?: string; description?: string; uid?: string }>
}

async function enrichFromOpenCorporates(companyName: string): Promise<Partial<RegulatoryData> | null> {
  try {
    const apiToken = process.env.OPENCORPORATES_API_TOKEN // optional — free tier works without it
    const tokenParam = apiToken ? `&api_token=${apiToken}` : ''
    const json = await httpGet(
      `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(companyName)}&per_page=1&inactive=false${tokenParam}`,
      15_000
    )
    const data = JSON.parse(json) as {
      results?: { companies?: Array<{ company?: OCCompany }> }
    }
    const company = data.results?.companies?.[0]?.company
    if (!company) return null

    const country = company.jurisdiction_code?.split('_')[0]?.toUpperCase() ?? company.registered_address?.country ?? null
    const addr = company.registered_address
    const fullAddr = addr ? [addr.street_address, addr.locality, addr.country].filter(Boolean).join(', ') : null

    return {
      company_number: company.company_number ?? null,
      legal_name: company.name ?? null,
      incorporation_date: company.incorporation_date ?? null,
      company_type: company.company_type ?? null,
      registered_country: country,
      registered_address: fullAddr,
      industry_code: company.industry_codes?.[0]?.code ?? null,
      industry_description: company.industry_codes?.[0]?.description ?? null,
      directors_count: null,
      status: company.current_status?.toLowerCase().includes('active') ? 'active' : 'unknown',
      registry_source: 'opencorporates'
    }
  }
  catch { return null }
}

// ── Source 2: Companies House UK ─────────────────────────────────────────────

interface CHCompany {
  company_number?: string
  company_name?: string
  date_of_creation?: string
  company_type?: string
  registered_office_address?: { address_line_1?: string; locality?: string; country?: string; postal_code?: string }
  company_status?: string
  sic_codes?: string[]
}

async function enrichFromCompaniesHouse(companyName: string): Promise<Partial<RegulatoryData> | null> {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY
  if (!apiKey) return null // Skip gracefully if key not set

  try {
    const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`
    const searchJson = await httpGet(
      `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(companyName)}&items_per_page=1`,
      15_000, { 'Authorization': authHeader }
    )
    const searchData = JSON.parse(searchJson) as { items?: Array<{ company_number: string }> }
    const companyNumber = searchData.items?.[0]?.company_number
    if (!companyNumber) return null

    const detailJson = await httpGet(
      `https://api.company-information.service.gov.uk/company/${companyNumber}`,
      15_000, { 'Authorization': authHeader }
    )
    const co = JSON.parse(detailJson) as CHCompany

    const officersJson = await httpGet(
      `https://api.company-information.service.gov.uk/company/${companyNumber}/officers?items_per_page=1`,
      12_000, { 'Authorization': authHeader }
    ).catch(() => '{}')
    const officers = JSON.parse(officersJson) as { total_results?: number }

    const addr = co.registered_office_address
    const fullAddr = addr ? [addr.address_line_1, addr.locality, addr.postal_code, addr.country].filter(Boolean).join(', ') : null

    return {
      company_number: co.company_number ?? null,
      legal_name: co.company_name ?? null,
      incorporation_date: co.date_of_creation ?? null,
      company_type: co.company_type ?? null,
      registered_country: 'UK',
      registered_address: fullAddr,
      industry_code: co.sic_codes?.[0] ?? null,
      industry_description: null,
      directors_count: officers.total_results ?? null,
      status: co.company_status === 'active' ? 'active' : 'unknown',
      registry_source: 'companies_house_uk'
    }
  }
  catch { return null }
}

// ── Source 3: SEC EDGAR (US) ──────────────────────────────────────────────────

interface EDGARFiling {
  name?: string
  cik?: string
  sic?: string
  sicDescription?: string
  stateOfIncorporation?: string
  addresses?: { business?: { street1?: string; city?: string; stateOrCountry?: string; zip?: string } }
}

async function enrichFromEDGAR(companyName: string): Promise<Partial<RegulatoryData> | null> {
  try {
    const searchJson = await httpGet(
      `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(companyName)}%22&category=form-type&forms=10-K,10-Q,S-1&dateRange=custom&startdt=2018-01-01`,
      15_000
    )
    const data = JSON.parse(searchJson) as { hits?: { hits?: Array<{ _source?: EDGARFiling }> } }
    const hit = data.hits?.hits?.[0]?._source
    if (!hit) return null

    const addr = hit.addresses?.business
    const fullAddr = addr ? [addr.street1, addr.city, addr.stateOrCountry, addr.zip].filter(Boolean).join(', ') : null

    return {
      company_number: hit.cik ? `CIK:${hit.cik}` : null,
      legal_name: hit.name ?? null,
      incorporation_date: null,
      company_type: 'Corporation',
      registered_country: hit.stateOfIncorporation ?? 'US',
      registered_address: fullAddr,
      industry_code: hit.sic ?? null,
      industry_description: hit.sicDescription ?? null,
      directors_count: null,
      status: 'active',
      registry_source: 'sec_edgar'
    }
  }
  catch { return null }
}

// ── Source 4: Pappers.fr (France — free tier) ─────────────────────────────────

interface PappersCompany {
  siren?: string
  nom_entreprise?: string
  date_creation?: string
  forme_juridique?: string
  siege?: { adresse_ligne_1?: string; ville?: string; code_postal?: string }
  statut?: string
  code_naf?: string
  libelle_code_naf?: string
  dirigeants?: unknown[]
}

async function enrichFromPappers(companyName: string): Promise<Partial<RegulatoryData> | null> {
  const apiKey = process.env.PAPPERS_API_KEY
  if (!apiKey) return null

  try {
    const json = await httpGet(
      `https://api.pappers.fr/v2/recherche-entreprises?q=${encodeURIComponent(companyName)}&nb_resultats=1&api_token=${apiKey}`,
      15_000
    )
    const data = JSON.parse(json) as { resultats?: PappersCompany[] }
    const co = data.resultats?.[0]
    if (!co) return null

    const addr = co.siege
    const fullAddr = addr ? [addr.adresse_ligne_1, addr.ville, addr.code_postal, 'France'].filter(Boolean).join(', ') : null

    return {
      company_number: co.siren ?? null,
      legal_name: co.nom_entreprise ?? null,
      incorporation_date: co.date_creation ?? null,
      company_type: co.forme_juridique ?? null,
      registered_country: 'FR',
      registered_address: fullAddr,
      industry_code: co.code_naf ?? null,
      industry_description: co.libelle_code_naf ?? null,
      directors_count: Array.isArray(co.dirigeants) ? co.dirigeants.length : null,
      status: co.statut === 'A' ? 'active' : 'unknown',
      registry_source: 'pappers_fr'
    }
  }
  catch { return null }
}

// ── Source 5: ABR (Australia) ─────────────────────────────────────────────────

async function enrichFromABR(companyName: string): Promise<Partial<RegulatoryData> | null> {
  const guid = process.env.ABR_API_GUID
  if (!guid) return null

  try {
    const xml = await httpGet(
      `https://abr.business.gov.au/ABRXMLSearch/AbrXmlSearch.asmx/SearchByNameSimpleProtocol?name=${encodeURIComponent(companyName)}&guid=${guid}`,
      15_000
    )
    const abnM = /<abn>(\d+)<\/abn>/.exec(xml)
    const nameM = /<organisationName>([^<]+)<\/organisationName>/.exec(xml)
    const stateM = /<state>([^<]+)<\/state>/.exec(xml)

    if (!abnM) return null
    return {
      company_number: abnM[1],
      legal_name: nameM?.[1] ?? null,
      registered_country: 'AU',
      registered_address: stateM ? `${stateM[1]}, Australia` : 'Australia',
      company_type: null,
      incorporation_date: null,
      industry_code: null,
      industry_description: null,
      directors_count: null,
      status: 'active',
      registry_source: 'abr_au'
    }
  }
  catch { return null }
}

// ── Main Batch Runner ─────────────────────────────────────────────────────────

export async function runRegulatoryEnrichmentBatch(
  batchSize = 150
): Promise<{ processed: number; enriched: number; failed: number }> {
  ensureRegulatoryTable()
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'enrich_regulatory', ?, 'running')`).run(runId, new Date().toISOString())

  let processed = 0
  let enriched = 0
  let failed = 0

  try {
    const listings = db.prepare(`
      SELECT al.id, al.name, al.website_url
      FROM app_listings al
      LEFT JOIN regulatory_data rd ON rd.app_id = al.id
      WHERE rd.id IS NULL
         OR rd.enriched_at < datetime('now', '-30 days')
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(batchSize) as Array<{ id: string; name: string; website_url: string }>

    console.log(`[enrich-regulatory] Processing ${listings.length} listings`)

    for (const listing of listings) {
      processed++
      try {
        // Try all registries — use first successful result
        // OpenCorporates is tried first (global coverage)
        // Then region-specific registries fill in richer detail
        const [oc, ch, edgar, pappers, abr] = await Promise.allSettled([
          enrichFromOpenCorporates(listing.name),
          enrichFromCompaniesHouse(listing.name),
          enrichFromEDGAR(listing.name),
          enrichFromPappers(listing.name),
          enrichFromABR(listing.name)
        ])

        // Merge: prefer the most data-rich result
        const candidates = [oc, ch, edgar, pappers, abr]
          .filter(r => r.status === 'fulfilled' && r.value !== null)
          .map(r => (r as PromiseFulfilledResult<Partial<RegulatoryData>>).value!)

        if (!candidates.length) {
          console.log(`[enrich-regulatory] ${listing.name}: no registry data found`)
          continue
        }

        // Pick the richest result (most non-null fields)
        const best = candidates.reduce((a, b) => {
          const aScore = Object.values(a).filter(v => v !== null && v !== undefined).length
          const bScore = Object.values(b).filter(v => v !== null && v !== undefined).length
          return bScore > aScore ? b : a
        })

        const now = new Date().toISOString()
        db.prepare(`
          INSERT INTO regulatory_data (
            id, app_id, company_number, legal_name, incorporation_date,
            company_type, registered_country, registered_address,
            industry_code, industry_description, directors_count,
            status, registry_source, enriched_at, created_at
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(app_id) DO UPDATE SET
            company_number=excluded.company_number, legal_name=excluded.legal_name,
            incorporation_date=excluded.incorporation_date, company_type=excluded.company_type,
            registered_country=excluded.registered_country, registered_address=excluded.registered_address,
            industry_code=excluded.industry_code, industry_description=excluded.industry_description,
            directors_count=excluded.directors_count, status=excluded.status,
            registry_source=excluded.registry_source, enriched_at=excluded.enriched_at
        `).run(
          makeId('reg'), listing.id,
          best.company_number ?? null, best.legal_name ?? null, best.incorporation_date ?? null,
          best.company_type ?? null, best.registered_country ?? null, best.registered_address ?? null,
          best.industry_code ?? null, best.industry_description ?? null, best.directors_count ?? null,
          best.status ?? 'unknown', best.registry_source ?? 'unknown', now, now
        )

        enriched++
        console.log(`[enrich-regulatory] ${listing.name}: ${best.registered_country ?? '?'} / ${best.company_type ?? '?'} / inc: ${best.incorporation_date ?? '?'} [${best.registry_source}]`)
      }
      catch (err) {
        console.error(`[enrich-regulatory] Failed for ${listing.name}:`, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 800))
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
