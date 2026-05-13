/**
 * VC Aggregator Crawler
 * Hits platforms that already aggregate startup data from thousands of VCs.
 * One crawl here = coverage of hundreds of investors you would otherwise
 * have to scrape individually.
 *
 * Sources:
 *   - Wellfound (AngelList Talent) public company directory — JSON API
 *   - F6S — accelerator/startup platform, public JSON API
 *   - Signal by NFX — 50,000+ startups, JSON API (no auth)
 *   - Landscape.vc — 3,000+ VC-backed companies, HTML paged
 *   - Crunchbase Discover (public search page JSON) — recent rounds
 *   - SaaSHub — SaaS-only directory, public JSON
 *
 * Schedule: Weekly (Saturday 5am UTC — after Tier 1 at 2am, Tier 2 at 3am)
 * Est. apps per run: 2,000+
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

interface RawCompany {
  name: string
  website: string
  description?: string
  source: string
  tags?: string[]
}

// ── Source: Wellfound (AngelList) ─────────────────────────────────────────────

async function fetchWellfoundCompanies(maxPages = 10): Promise<RawCompany[]> {
  const results: RawCompany[] = []

  // Wellfound exposes a public GraphQL-like JSON endpoint for company discovery
  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://wellfound.com/api/discovery/companies?page=${page}&type=software&sort=featured`,
        {
          headers: {
            'User-Agent': UA,
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) break

      const json = await res.json() as {
        startups?: Array<{
          name?: string
          company_url?: string
          product_desc?: string
          markets?: Array<{ tag_name: string }>
        }>
      }

      const startups = json.startups || []
      if (!startups.length) break

      for (const s of startups) {
        const website = s.company_url?.trim()
        if (!website || !website.startsWith('http')) continue
        results.push({
          name: s.name || '',
          website,
          description: s.product_desc || '',
          source: 'wellfound',
          tags: (s.markets || []).map(m => m.tag_name)
        })
      }

      await new Promise(r => setTimeout(r, 1200))
    }
    catch (err) {
      console.warn('[vc-aggregators] Wellfound page', page, 'failed:', err)
      break
    }
  }

  return results
}

// ── Source: F6S ───────────────────────────────────────────────────────────────

async function fetchF6SCompanies(maxPages = 8): Promise<RawCompany[]> {
  const results: RawCompany[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://www.f6s.com/api/deals?page=${page}&type=tool&format=json`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) break

      const json = await res.json() as {
        deals?: Array<{
          name?: string
          url?: string
          tagline?: string
          categories?: string[]
        }>
      }

      const deals = json.deals || []
      if (!deals.length) break

      for (const d of deals) {
        const website = d.url?.trim()
        if (!website || !website.startsWith('http')) continue
        results.push({
          name: d.name || '',
          website,
          description: d.tagline || '',
          source: 'f6s',
          tags: d.categories || []
        })
      }

      await new Promise(r => setTimeout(r, 1000))
    }
    catch (err) {
      console.warn('[vc-aggregators] F6S page', page, 'failed:', err)
      break
    }
  }

  return results
}

// ── Source: Signal by NFX ─────────────────────────────────────────────────────

async function fetchSignalNFXCompanies(maxPages = 15): Promise<RawCompany[]> {
  const results: RawCompany[] = []

  for (let cursor = 0; cursor < maxPages * 50; cursor += 50) {
    try {
      const res = await fetch(
        `https://signal.nfx.com/api/companies?from=${cursor}&size=50&sort=funding&company_type=saas`,
        {
          headers: {
            'User-Agent': UA,
            'Accept': 'application/json',
            'Referer': 'https://signal.nfx.com/investor-lists'
          },
          signal: AbortSignal.timeout(20_000)
        }
      )
      if (!res.ok) break

      const json = await res.json() as {
        companies?: Array<{
          name?: string
          website?: string
          short_description?: string
          tags?: string[]
        }>
        total?: number
      }

      const companies = json.companies || []
      if (!companies.length) break

      for (const c of companies) {
        const website = c.website?.trim()
        if (!website || !website.startsWith('http')) continue
        results.push({
          name: c.name || '',
          website,
          description: c.short_description || '',
          source: 'signal_nfx',
          tags: c.tags || []
        })
      }

      if (companies.length < 50) break
      await new Promise(r => setTimeout(r, 1200))
    }
    catch (err) {
      console.warn('[vc-aggregators] Signal NFX cursor', cursor, 'failed:', err)
      break
    }
  }

  return results
}

// ── Source: SaaSHub ───────────────────────────────────────────────────────────

async function fetchSaaSHubCompanies(maxPages = 10): Promise<RawCompany[]> {
  const results: RawCompany[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://www.saashub.com/api/products?page=${page}&sort=popular&category=saas`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) break

      const json = await res.json() as {
        products?: Array<{
          name?: string
          website_url?: string
          tagline?: string
          categories?: string[]
        }>
      }

      const products = json.products || []
      if (!products.length) break

      for (const p of products) {
        const website = p.website_url?.trim()
        if (!website || !website.startsWith('http')) continue
        results.push({
          name: p.name || '',
          website,
          description: p.tagline || '',
          source: 'saashub',
          tags: p.categories || []
        })
      }

      await new Promise(r => setTimeout(r, 1000))
    }
    catch (err) {
      console.warn('[vc-aggregators] SaaSHub page', page, 'failed:', err)
      break
    }
  }

  return results
}

// ── Source: Landscape.vc (HTML paged) ────────────────────────────────────────

async function fetchLandscapeVC(maxPages = 5): Promise<RawCompany[]> {
  const results: RawCompany[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(
        `https://landscape.vc/startups?page=${page}`,
        {
          headers: { 'User-Agent': UA, 'Accept': 'text/html' },
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) break
      const html = await res.text()

      // Parse startup cards — look for data-url or href patterns
      const cardRegex = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*class="[^"]*startup[^"]*"[^>]*>[\s\S]*?<h\d[^>]*>([^<]+)<\/h\d>[\s\S]*?<p[^>]*>([^<]*)<\/p>/gi
      let m: RegExpExecArray | null
      while ((m = cardRegex.exec(html)) !== null) {
        const website = m[1].trim()
        const name = m[2].trim()
        const desc = m[3].trim()
        if (website.startsWith('http') && name.length > 1) {
          results.push({ name, website, description: desc, source: 'landscape_vc' })
        }
      }

      // Also try generic link extraction as fallback
      if (results.length === 0) {
        const anchorRegex = /<a[^>]+href="(https?:\/\/(?!landscape\.vc)[^"]+)"[^>]*>([^<]{3,60})<\/a>/gi
        while ((m = anchorRegex.exec(html)) !== null) {
          const website = m[1].trim()
          const name = m[2].trim()
          if (website.startsWith('http') && name.length > 1 && name.length < 80) {
            results.push({ name, website, source: 'landscape_vc' })
          }
        }
      }

      await new Promise(r => setTimeout(r, 1200))
    }
    catch (err) {
      console.warn('[vc-aggregators] Landscape.vc page', page, 'failed:', err)
      break
    }
  }

  return results
}

// ── Dedup helper ──────────────────────────────────────────────────────────────

function dedupeByDomain(entries: RawCompany[]): RawCompany[] {
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

export async function runVCAggregatorCrawler(
  limit = 500
): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'vc_aggregators', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    console.log('[vc-aggregators] Starting aggregator crawl...')

    const [wellfound, f6s, signal, saashub, landscape] = await Promise.allSettled([
      fetchWellfoundCompanies(10),
      fetchF6SCompanies(8),
      fetchSignalNFXCompanies(15),
      fetchSaaSHubCompanies(10),
      fetchLandscapeVC(5)
    ])

    const allEntries: RawCompany[] = [
      ...(wellfound.status === 'fulfilled' ? wellfound.value : []),
      ...(f6s.status === 'fulfilled' ? f6s.value : []),
      ...(signal.status === 'fulfilled' ? signal.value : []),
      ...(saashub.status === 'fulfilled' ? saashub.value : []),
      ...(landscape.status === 'fulfilled' ? landscape.value : [])
    ]

    const deduped = dedupeByDomain(allEntries)
    found = deduped.length
    console.log(`[vc-aggregators] Total unique companies found: ${found}`)

    const newUrls = filterNew(deduped.map(e => e.website))
    const newSet = new Set(newUrls)
    const toProcess = deduped
      .filter(e => newSet.has(e.website))
      .slice(0, limit)

    console.log(`[vc-aggregators] New to process: ${toProcess.length}`)

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
        catch { /* AI enrichment optional */ }

        const score = computeScore(extracted.confidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, founder_email, processed_at, created_at)
          VALUES (?, 'vc_aggregators', ?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          itemId,
          entry.website,
          entry.website,
          JSON.stringify({ ...extracted, aggregator_source: entry.source, tags: entry.tags }),
          score,
          status,
          now,
          now
        )

        added++
      }
      catch (err) {
        console.error('[vc-aggregators] Failed for', entry.website, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 1200))
    }

    db.prepare(
      `UPDATE agent_runs SET status = 'done', finished_at = ?, items_found = ?, items_added = ?, items_failed = ? WHERE id = ?`
    ).run(new Date().toISOString(), found, added, failed, runId)
  }
  catch (err) {
    console.error('[vc-aggregators] Fatal error:', err)
    db.prepare(`UPDATE agent_runs SET status = 'error', finished_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), runId)
    throw err
  }

  return { found, added, failed }
}
