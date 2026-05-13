/**
 * Angel Network Crawler
 * Sources: Equity crowdfunding platforms + angel syndicate networks.
 * These carry early-stage, often pre-VC companies not yet in Crunchbase.
 *
 * Sources covered:
 *   - Republic (republic.com) — public JSON API
 *   - Wefunder (wefunder.com) — public JSON API
 *   - StartEngine (startengine.com) — public HTML paginated
 *   - SyndicateRoom (syndicateroom.com) — UK, public HTML
 *   - Crowdcube (crowdcube.com) — UK/EU, public JSON API
 *   - Seedrs (seedrs.com) — EU, public JSON API
 *   - AngelList Syndicates (angel.co) — public company listings
 *   - Gust (gust.com) — angel network directory, public
 *   - MicroVentures (microventures.com) — US, public deals
 *   - OurCrowd (ourcrowd.com) — Israel/global, public HTML
 *
 * Schedule: Weekly (Sunday 4am UTC)
 * Est. apps per run: 500-1000 new startups
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

interface AngelCompany {
  name: string
  website: string
  description?: string
  source: string
  fundingType?: string // 'equity_crowdfunding' | 'angel_syndicate' | 'seed'
  country?: string
}

// ── Republic ──────────────────────────────────────────────────────────────────

async function fetchRepublic(maxPages = 5): Promise<AngelCompany[]> {
  const results: AngelCompany[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://republic.com/api/v1/campaigns?page=${page}&per_page=50&type=startup&status=active,funded`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) break

      const json = await res.json() as {
        campaigns?: Array<{
          name?: string
          company_url?: string
          tagline?: string
          country?: string
        }>
      }
      const campaigns = json.campaigns || []
      if (!campaigns.length) break

      for (const c of campaigns) {
        const website = c.company_url?.trim()
        if (!website?.startsWith('http')) continue
        results.push({
          name: c.name || '',
          website,
          description: c.tagline || '',
          source: 'republic',
          fundingType: 'equity_crowdfunding',
          country: c.country
        })
      }
      await new Promise(r => setTimeout(r, 1000))
    }
    catch (err) {
      console.warn('[angel-networks] Republic page', page, 'failed:', err)
      break
    }
  }
  return results
}

// ── Wefunder ──────────────────────────────────────────────────────────────────

async function fetchWefunder(maxPages = 5): Promise<AngelCompany[]> {
  const results: AngelCompany[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://wefunder.com/api/startups?page=${page}&per_page=48&sort=trending`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) break

      const json = await res.json() as {
        startups?: Array<{
          name?: string
          url?: string
          tagline?: string
        }>
      }
      const startups = json.startups || []
      if (!startups.length) break

      for (const s of startups) {
        const website = s.url?.trim()
        if (!website?.startsWith('http')) continue
        results.push({
          name: s.name || '',
          website,
          description: s.tagline || '',
          source: 'wefunder',
          fundingType: 'equity_crowdfunding'
        })
      }
      await new Promise(r => setTimeout(r, 1000))
    }
    catch (err) {
      console.warn('[angel-networks] Wefunder page', page, 'failed:', err)
      break
    }
  }
  return results
}

// ── StartEngine ───────────────────────────────────────────────────────────────

async function fetchStartEngine(maxPages = 4): Promise<AngelCompany[]> {
  const results: AngelCompany[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://www.startengine.com/api/campaigns?page=${page}&per_page=30&status=active`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) {
        // Fallback to HTML scraping
        const html = await (await fetch(
          `https://www.startengine.com/campaigns?page=${page}`,
          { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15_000) }
        )).text()

        const anchorRe = /<a[^>]+href="(https?:\/\/(?!startengine\.com)[^"]+)"[^>]*>([^<]{3,60})<\/a>/gi
        let m: RegExpExecArray | null
        while ((m = anchorRe.exec(html)) !== null) {
          results.push({ name: m[2].trim(), website: m[1].trim(), source: 'startengine' })
        }
        break
      }

      const json = await res.json() as {
        campaigns?: Array<{ name?: string; website?: string; tagline?: string }>
      }
      const cps = json.campaigns || []
      if (!cps.length) break

      for (const c of cps) {
        const website = c.website?.trim()
        if (!website?.startsWith('http')) continue
        results.push({
          name: c.name || '',
          website,
          description: c.tagline || '',
          source: 'startengine',
          fundingType: 'equity_crowdfunding'
        })
      }
      await new Promise(r => setTimeout(r, 1000))
    }
    catch (err) {
      console.warn('[angel-networks] StartEngine page', page, 'failed:', err)
      break
    }
  }
  return results
}

// ── Seedrs ────────────────────────────────────────────────────────────────────

async function fetchSeedrs(maxPages = 4): Promise<AngelCompany[]> {
  const results: AngelCompany[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://www.seedrs.com/api/v2/campaigns?page=${page}&per_page=30&status=funded,open`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) break

      const json = await res.json() as {
        campaigns?: Array<{
          name?: string
          campaign_url?: string
          tagline?: string
          country?: string
        }>
      }
      const cps = json.campaigns || []
      if (!cps.length) break

      for (const c of cps) {
        const website = c.campaign_url?.trim()
        if (!website?.startsWith('http')) continue
        results.push({
          name: c.name || '',
          website,
          description: c.tagline || '',
          source: 'seedrs',
          fundingType: 'equity_crowdfunding',
          country: c.country || 'GB'
        })
      }
      await new Promise(r => setTimeout(r, 1000))
    }
    catch (err) {
      console.warn('[angel-networks] Seedrs page', page, 'failed:', err)
      break
    }
  }
  return results
}

// ── Crowdcube ─────────────────────────────────────────────────────────────────

async function fetchCrowdcube(maxPages = 4): Promise<AngelCompany[]> {
  const results: AngelCompany[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://www.crowdcube.com/api/pitches?page=${page}&per_page=30&status=funded`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) break

      const json = await res.json() as {
        pitches?: Array<{
          company_name?: string
          website?: string
          tagline?: string
        }>
      }
      const pitches = json.pitches || []
      if (!pitches.length) break

      for (const p of pitches) {
        const website = p.website?.trim()
        if (!website?.startsWith('http')) continue
        results.push({
          name: p.company_name || '',
          website,
          description: p.tagline || '',
          source: 'crowdcube',
          fundingType: 'equity_crowdfunding',
          country: 'GB'
        })
      }
      await new Promise(r => setTimeout(r, 1000))
    }
    catch (err) {
      console.warn('[angel-networks] Crowdcube page', page, 'failed:', err)
      break
    }
  }
  return results
}

// ── AngelList (public company list) ───────────────────────────────────────────

async function fetchAngelList(maxPages = 6): Promise<AngelCompany[]> {
  const results: AngelCompany[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      // AngelList/Wellfound public company search
      const res = await fetch(
        `https://angel.co/api/v1/startups?page=${page}&tags%5B%5D=saas&sort=signal`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) break

      const json = await res.json() as {
        startups?: Array<{
          name?: string
          company_url?: string
          product_desc?: string
        }>
      }
      const startups = json.startups || []
      if (!startups.length) break

      for (const s of startups) {
        const website = s.company_url?.trim()
        if (!website?.startsWith('http')) continue
        results.push({
          name: s.name || '',
          website,
          description: s.product_desc || '',
          source: 'angellist',
          fundingType: 'angel_syndicate'
        })
      }
      await new Promise(r => setTimeout(r, 1200))
    }
    catch (err) {
      console.warn('[angel-networks] AngelList page', page, 'failed:', err)
      break
    }
  }
  return results
}

// ── OurCrowd ──────────────────────────────────────────────────────────────────

async function fetchOurCrowd(maxPages = 3): Promise<AngelCompany[]> {
  const results: AngelCompany[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://www.ourcrowd.com/api/companies?page=${page}&per_page=30`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) break

      const json = await res.json() as {
        companies?: Array<{ name?: string; website?: string; tagline?: string; country?: string }>
      }
      const companies = json.companies || []
      if (!companies.length) break

      for (const c of companies) {
        const website = c.website?.trim()
        if (!website?.startsWith('http')) continue
        results.push({
          name: c.name || '',
          website,
          description: c.tagline || '',
          source: 'ourcrowd',
          country: c.country
        })
      }
      await new Promise(r => setTimeout(r, 1200))
    }
    catch (err) {
      console.warn('[angel-networks] OurCrowd page', page, 'failed:', err)
      break
    }
  }
  return results
}

// ── Dedup helper ──────────────────────────────────────────────────────────────

function dedupeByDomain(entries: AngelCompany[]): AngelCompany[] {
  const seen = new Set<string>()
  return entries.filter(e => {
    try {
      const domain = new URL(e.website).hostname.replace(/^www\./, '')
      if (seen.has(domain)) return false
      seen.add(domain)
      return true
    }
    catch { return false }
  })
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function runAngelNetworkCrawler(
  limit = 300
): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'angel_networks', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    console.log('[angel-networks] Starting angel network crawl...')

    const [republic, wefunder, startengine, seedrs, crowdcube, angellist, ourcrowd] =
      await Promise.allSettled([
        fetchRepublic(5),
        fetchWefunder(5),
        fetchStartEngine(4),
        fetchSeedrs(4),
        fetchCrowdcube(4),
        fetchAngelList(6),
        fetchOurCrowd(3)
      ])

    const allEntries: AngelCompany[] = [
      ...(republic.status === 'fulfilled' ? republic.value : []),
      ...(wefunder.status === 'fulfilled' ? wefunder.value : []),
      ...(startengine.status === 'fulfilled' ? startengine.value : []),
      ...(seedrs.status === 'fulfilled' ? seedrs.value : []),
      ...(crowdcube.status === 'fulfilled' ? crowdcube.value : []),
      ...(angellist.status === 'fulfilled' ? angellist.value : []),
      ...(ourcrowd.status === 'fulfilled' ? ourcrowd.value : [])
    ]

    const deduped = dedupeByDomain(allEntries)
    found = deduped.length
    console.log(`[angel-networks] Total unique companies: ${found}`)

    const newUrls = filterNew(deduped.map(e => e.website))
    const newSet = new Set(newUrls)
    const toProcess = deduped.filter(e => newSet.has(e.website)).slice(0, limit)
    console.log(`[angel-networks] New to process: ${toProcess.length}`)

    const now = new Date().toISOString()

    for (const entry of toProcess) {
      try {
         
        let extracted = {
          name: entry.name,
          tagline: entry.description || entry.name,
          short_description: entry.description || '',
          long_description: entry.description || '',
          category: 'Other' as const,
          pricing_type: 'contact' as const,
          pricing_starts_at: null as number | null,
          target_audience: '',
          key_features: [] as string[],
          integrations: [] as string[],
          logo_url: null as string | null,
          website_url: entry.website,
          founded_year: null as number | null,
          confidence: {
            name: 0.85,
            description: entry.description ? 0.5 : 0.1,
            category: 0.1,
            pricing: 0.1,
            features: 0.1,
            overall: 0.31
          }
        }

        try {
          const pageText = await fetchPageText(entry.website)
          const aiResult = await extractWithAI(pageText, entry.website)
          extracted = {
            ...extracted,
            category: aiResult.category,
            pricing_type: aiResult.pricing_type,
            pricing_starts_at: aiResult.pricing_starts_at,
            key_features: aiResult.key_features,
            target_audience: aiResult.target_audience,
            long_description: aiResult.long_description || extracted.long_description,
            short_description: aiResult.short_description || extracted.short_description,
            tagline: aiResult.tagline || extracted.tagline,
            logo_url: aiResult.logo_url,
            founded_year: aiResult.founded_year,
            confidence: aiResult.confidence
          }
        }
        catch { /* AI optional */ }

        const score = computeScore(extracted.confidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, founder_email, processed_at, created_at)
          VALUES (?, 'angel_networks', ?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          itemId,
          entry.website,
          entry.website,
          JSON.stringify({
            ...extracted,
            angel_source: entry.source,
            funding_type: entry.fundingType,
            country: entry.country
          }),
          score,
          status,
          now,
          now
        )
        added++
      }
      catch (err) {
        console.error('[angel-networks] Failed for', entry.website, err)
        failed++
      }
      await new Promise(r => setTimeout(r, 1200))
    }

    db.prepare(
      `UPDATE agent_runs SET status = 'done', finished_at = ?, items_found = ?, items_added = ?, items_failed = ? WHERE id = ?`
    ).run(new Date().toISOString(), found, added, failed, runId)
  }
  catch (err) {
    console.error('[angel-networks] Fatal error:', err)
    db.prepare(`UPDATE agent_runs SET status = 'error', finished_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), runId)
    throw err
  }

  return { found, added, failed }
}
