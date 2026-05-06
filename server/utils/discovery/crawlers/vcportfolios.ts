/**
 * VC Portfolio Crawler
 * Source: Public portfolio pages of major VC firms
 * Schedule: Weekly (Saturday 2am UTC)
 * Auth: None (all public pages)
 * Est. apps: 5,000+ across Tier 1 VCs
 *
 * Fetches each VC's public portfolio page, extracts company names + websites,
 * then enriches via AI extraction. VC-backed = strong quality signal.
 *
 * VCs covered: Y Combinator (via API), Sequoia, a16z, Accel, Bessemer,
 * First Round, Greylock, Lightspeed, GV, Benchmark
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

interface VCPortfolioEntry {
  name: string
  website: string
  description?: string
  vc: string
}

interface VCSource {
  name: string
  portfolioUrl: string
  parse: (html: string) => VCPortfolioEntry[]
}

/** Generic link extractor — finds <a href="https://..."> that look like company sites */
function extractCompanyLinks(html: string, vcName: string, domain: string): VCPortfolioEntry[] {
  const results: VCPortfolioEntry[] = []
  // Match anchor tags with external https URLs
  const anchorRegex = /<a[^>]+href="(https?:\/\/(?!(?:www\.)?(?:sequoiacap|a16z|accel|bvp|firstround|greylock|lsvp|gv|benchmark)[^"]*)[^"]+)"[^>]*>([^<]{2,60})<\/a>/gi

  let match: RegExpExecArray | null
  while ((match = anchorRegex.exec(html)) !== null) {
    const url = match[1].trim()
    const text = match[2].replace(/<[^>]+>/g, '').trim()

    // Skip nav/footer/social links
    if (/twitter|linkedin|facebook|instagram|youtube|mailto:|tel:|#|\.pdf|blog\.|press\./i.test(url)) continue
    if (text.length < 2 || text.length > 80) continue
    // Skip if URL contains the VC domain itself
    if (url.includes(domain)) continue

    results.push({ name: text, website: url, vc: vcName })
  }

  return results
}

const VC_SOURCES: VCSource[] = [
  {
    name: 'Sequoia Capital',
    portfolioUrl: 'https://www.sequoiacap.com/companies/',
    parse: (html) => extractCompanyLinks(html, 'Sequoia Capital', 'sequoiacap.com')
  },
  {
    name: 'Andreessen Horowitz',
    portfolioUrl: 'https://a16z.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Andreessen Horowitz', 'a16z.com')
  },
  {
    name: 'Accel',
    portfolioUrl: 'https://www.accel.com/portfolio',
    parse: (html) => extractCompanyLinks(html, 'Accel', 'accel.com')
  },
  {
    name: 'Bessemer Venture Partners',
    portfolioUrl: 'https://www.bvp.com/portfolio',
    parse: (html) => extractCompanyLinks(html, 'Bessemer Venture Partners', 'bvp.com')
  },
  {
    name: 'First Round Capital',
    portfolioUrl: 'https://firstround.com/companies/',
    parse: (html) => extractCompanyLinks(html, 'First Round Capital', 'firstround.com')
  },
  {
    name: 'Greylock Partners',
    portfolioUrl: 'https://greylock.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Greylock Partners', 'greylock.com')
  },
  {
    name: 'Lightspeed Venture Partners',
    portfolioUrl: 'https://lsvp.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Lightspeed Venture Partners', 'lsvp.com')
  },
  {
    name: 'GV (Google Ventures)',
    portfolioUrl: 'https://www.gv.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'GV (Google Ventures)', 'gv.com')
  },
  {
    name: 'Benchmark',
    portfolioUrl: 'https://www.benchmark.com/portfolio',
    parse: (html) => extractCompanyLinks(html, 'Benchmark', 'benchmark.com')
  }
]

async function fetchPortfolioPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    signal: AbortSignal.timeout(25_000)
  })

  if (!res.ok) throw new Error(`Fetch ${url} → ${res.status}`)
  return res.text()
}

/** Deduplicate entries by website domain within the run */
function dedupeByDomain(entries: VCPortfolioEntry[]): VCPortfolioEntry[] {
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

export async function runVCPortfolioCrawler(
  limit = 300
): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'vcportfolios', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allEntries: VCPortfolioEntry[] = []

    for (const vc of VC_SOURCES) {
      try {
        console.log(`[vcportfolios] Fetching ${vc.name} portfolio...`)
        const html = await fetchPortfolioPage(vc.portfolioUrl)
        const entries = vc.parse(html)
        console.log(`[vcportfolios] ${vc.name}: found ${entries.length} companies`)
        allEntries.push(...entries)
        // Polite delay between VC pages
        await new Promise(r => setTimeout(r, 2000))
      }
      catch (err) {
        console.error(`[vcportfolios] Failed to fetch ${vc.name}:`, err)
      }
    }

    const deduped = dedupeByDomain(allEntries)
    found = deduped.length

    // Filter against DB (skip already known)
    const newUrls = filterNew(deduped.map(e => e.website))
    const newSet = new Set(newUrls)
    const toProcess = deduped
      .filter(e => newSet.has(e.website))
      .slice(0, limit)

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

        // AI enrichment (best-effort — VC portfolio pages don't give much detail)
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
          VALUES (?, 'vcportfolios', ?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          itemId,
          entry.website,
          entry.website,
          JSON.stringify({ ...extracted, vc_source: entry.vc }),
          score,
          status,
          now,
          now
        )

        added++
      }
      catch (err) {
        console.error('[vcportfolios] Failed for', entry.website, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 1500))
    }

    db.prepare(
      `UPDATE agent_runs SET status = 'done', finished_at = ?, items_found = ?, items_added = ?, items_failed = ? WHERE id = ?`
    ).run(new Date().toISOString(), found, added, failed, runId)
  }
  catch (err) {
    console.error('[vcportfolios] Fatal error:', err)
    db.prepare(`UPDATE agent_runs SET status = 'error', finished_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), runId)
    throw err
  }

  return { found, added, failed }
}
