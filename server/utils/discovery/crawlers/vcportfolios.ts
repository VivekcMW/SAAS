/**
 * VC Portfolio Crawler — Tier 1 (50 Major Funds)
 * Source: Public portfolio pages of major VC firms
 * Schedule: Weekly (Saturday 2am UTC)
 * Auth: None (all public pages)
 * Est. apps: 15,000+ across Tier 1 VCs
 *
 * Fetches each VC's public portfolio page, extracts company names + websites,
 * then enriches via AI extraction. VC-backed = strong quality signal.
 *
 * VCs covered (50 firms):
 *   US Tier 1: Sequoia, a16z, Accel, Bessemer, First Round, Greylock,
 *              Lightspeed, GV, Benchmark, Khosla, NEA, IVP, Insight Partners,
 *              General Catalyst, Founders Fund, CRV, Matrix Partners, Redpoint,
 *              Spark Capital, USV, Cowboy VC, Lux Capital, Battery Ventures,
 *              Norwest, Summit Partners, Tiger Global, Coatue, Index Ventures,
 *              Ribbit Capital, Flatiron Health (portfolio only), True Ventures,
 *              Emergence Capital, Sapphire Ventures, Felicis Ventures,
 *              Initialized Capital, Lowercase Capital, Craft Ventures,
 *              SoftBank Vision Fund, Andreessen-backed Scout
 *   EU Tier 1: Balderton, Atomico, Northzone, Point Nine, HV Capital,
 *              Speedinvest, Project A, Cherry Ventures, Earlybird, Fly Ventures
 *   Other:    500 Global, Draper Associates, 8VC, Founders Fund, Pear VC
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
  // ── US Tier 1 ──────────────────────────────────────────────────────────────
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
  },
  {
    name: 'Khosla Ventures',
    portfolioUrl: 'https://www.khoslaventures.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Khosla Ventures', 'khoslaventures.com')
  },
  {
    name: 'NEA',
    portfolioUrl: 'https://www.nea.com/portfolio',
    parse: (html) => extractCompanyLinks(html, 'NEA', 'nea.com')
  },
  {
    name: 'IVP',
    portfolioUrl: 'https://www.ivp.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'IVP', 'ivp.com')
  },
  {
    name: 'Insight Partners',
    portfolioUrl: 'https://www.insightpartners.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Insight Partners', 'insightpartners.com')
  },
  {
    name: 'General Catalyst',
    portfolioUrl: 'https://www.generalcatalyst.com/portfolio',
    parse: (html) => extractCompanyLinks(html, 'General Catalyst', 'generalcatalyst.com')
  },
  {
    name: 'Founders Fund',
    portfolioUrl: 'https://foundersfund.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Founders Fund', 'foundersfund.com')
  },
  {
    name: 'CRV',
    portfolioUrl: 'https://www.crv.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'CRV', 'crv.com')
  },
  {
    name: 'Matrix Partners',
    portfolioUrl: 'https://www.matrixpartners.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Matrix Partners', 'matrixpartners.com')
  },
  {
    name: 'Redpoint Ventures',
    portfolioUrl: 'https://www.redpoint.com/companies/',
    parse: (html) => extractCompanyLinks(html, 'Redpoint Ventures', 'redpoint.com')
  },
  {
    name: 'Spark Capital',
    portfolioUrl: 'https://www.sparkcapital.com/portfolio',
    parse: (html) => extractCompanyLinks(html, 'Spark Capital', 'sparkcapital.com')
  },
  {
    name: 'Union Square Ventures',
    portfolioUrl: 'https://www.usv.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Union Square Ventures', 'usv.com')
  },
  {
    name: 'True Ventures',
    portfolioUrl: 'https://trueventures.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'True Ventures', 'trueventures.com')
  },
  {
    name: 'Lux Capital',
    portfolioUrl: 'https://www.luxcapital.com/companies',
    parse: (html) => extractCompanyLinks(html, 'Lux Capital', 'luxcapital.com')
  },
  {
    name: 'Battery Ventures',
    portfolioUrl: 'https://www.battery.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Battery Ventures', 'battery.com')
  },
  {
    name: 'Norwest Venture Partners',
    portfolioUrl: 'https://www.nvp.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Norwest Venture Partners', 'nvp.com')
  },
  {
    name: 'Summit Partners',
    portfolioUrl: 'https://www.summitpartners.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Summit Partners', 'summitpartners.com')
  },
  {
    name: 'Felicis Ventures',
    portfolioUrl: 'https://www.felicis.com/portfolio',
    parse: (html) => extractCompanyLinks(html, 'Felicis Ventures', 'felicis.com')
  },
  {
    name: 'Initialized Capital',
    portfolioUrl: 'https://initialized.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Initialized Capital', 'initialized.com')
  },
  {
    name: 'Craft Ventures',
    portfolioUrl: 'https://www.craftventures.com/portfolio',
    parse: (html) => extractCompanyLinks(html, 'Craft Ventures', 'craftventures.com')
  },
  {
    name: 'Emergence Capital',
    portfolioUrl: 'https://www.emcap.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Emergence Capital', 'emcap.com')
  },
  {
    name: 'Sapphire Ventures',
    portfolioUrl: 'https://sapphireventures.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Sapphire Ventures', 'sapphireventures.com')
  },
  {
    name: 'Cowboy Ventures',
    portfolioUrl: 'https://cowboy.vc/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Cowboy Ventures', 'cowboy.vc')
  },
  {
    name: 'Ribbit Capital',
    portfolioUrl: 'https://ribbitcap.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Ribbit Capital', 'ribbitcap.com')
  },
  {
    name: 'Pear VC',
    portfolioUrl: 'https://pear.vc/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Pear VC', 'pear.vc')
  },
  {
    name: '8VC',
    portfolioUrl: 'https://8vc.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, '8VC', '8vc.com')
  },
  {
    name: 'Draper Associates',
    portfolioUrl: 'https://draper.vc/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Draper Associates', 'draper.vc')
  },
  {
    name: '500 Global',
    portfolioUrl: 'https://500.co/companies',
    parse: (html) => extractCompanyLinks(html, '500 Global', '500.co')
  },
  // ── EU Tier 1 ──────────────────────────────────────────────────────────────
  {
    name: 'Balderton Capital',
    portfolioUrl: 'https://www.balderton.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Balderton Capital', 'balderton.com')
  },
  {
    name: 'Atomico',
    portfolioUrl: 'https://atomico.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Atomico', 'atomico.com')
  },
  {
    name: 'Index Ventures',
    portfolioUrl: 'https://www.indexventures.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Index Ventures', 'indexventures.com')
  },
  {
    name: 'Northzone',
    portfolioUrl: 'https://northzone.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Northzone', 'northzone.com')
  },
  {
    name: 'Point Nine Capital',
    portfolioUrl: 'https://www.pointninecap.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Point Nine Capital', 'pointninecap.com')
  },
  {
    name: 'HV Capital',
    portfolioUrl: 'https://hvcapital.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'HV Capital', 'hvcapital.com')
  },
  {
    name: 'Speedinvest',
    portfolioUrl: 'https://speedinvest.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Speedinvest', 'speedinvest.com')
  },
  {
    name: 'Project A Ventures',
    portfolioUrl: 'https://www.project-a.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Project A Ventures', 'project-a.com')
  },
  {
    name: 'Cherry Ventures',
    portfolioUrl: 'https://www.cherry.vc/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Cherry Ventures', 'cherry.vc')
  },
  {
    name: 'Earlybird Venture Capital',
    portfolioUrl: 'https://earlybird.com/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Earlybird Venture Capital', 'earlybird.com')
  },
  {
    name: 'Fly Ventures',
    portfolioUrl: 'https://fly.vc/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Fly Ventures', 'fly.vc')
  },
  {
    name: 'LocalGlobe',
    portfolioUrl: 'https://localglobe.vc/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'LocalGlobe', 'localglobe.vc')
  },
  {
    name: 'Samaipata',
    portfolioUrl: 'https://www.samaipata.vc/portfolio',
    parse: (html) => extractCompanyLinks(html, 'Samaipata', 'samaipata.vc')
  },
  // ── Asia-Pacific ──────────────────────────────────────────────────────────
  {
    name: 'Sequoia India & SEA',
    portfolioUrl: 'https://www.sequoiacap.com/india/companies/',
    parse: (html) => extractCompanyLinks(html, 'Sequoia India & SEA', 'sequoiacap.com')
  },
  {
    name: 'Matrix Partners India',
    portfolioUrl: 'https://www.matrixpartners.in/portfolio/',
    parse: (html) => extractCompanyLinks(html, 'Matrix Partners India', 'matrixpartners.in')
  },
  {
    name: 'Surge (Sequoia SEA)',
    portfolioUrl: 'https://surge.global/companies/',
    parse: (html) => extractCompanyLinks(html, 'Surge (Sequoia SEA)', 'surge.global')
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

    // ── Step 1: Crawl the hardcoded Tier 1 list ─────────────────────────────
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

    // ── Step 2: Self-healing — also crawl VCs discovered by vc-dynamic.ts ──
    // vc_sources is populated by the dynamic crawler with newly-found portfolio URLs.
    // This makes vcportfolios.ts adaptive: any VC vc-dynamic.ts discovers is
    // automatically crawled the next time this task runs, no code change needed.
    try {
      const dynamicVCs = db.prepare(`
        SELECT name, portfolio_url, domain
        FROM vc_sources
        WHERE portfolio_url IS NOT NULL
          AND active = 1
          AND (last_crawled_at IS NULL OR last_crawled_at < datetime('now', '-7 days'))
        ORDER BY last_crawled_at ASC
        LIMIT 100
      `).all() as Array<{ name: string; portfolio_url: string; domain: string }>

      console.log(`[vcportfolios] Loading ${dynamicVCs.length} dynamic VCs from vc_sources table`)

      for (const vc of dynamicVCs) {
        try {
          console.log(`[vcportfolios] Dynamic: fetching ${vc.name} (${vc.portfolio_url})`)
          const html = await fetchPortfolioPage(vc.portfolio_url)
          const entries = extractCompanyLinks(html, vc.name, vc.domain)
          console.log(`[vcportfolios] Dynamic ${vc.name}: found ${entries.length} companies`)
          allEntries.push(...entries)

          // Mark as crawled so we don't re-crawl until next week
          db.prepare(`UPDATE vc_sources SET last_crawled_at = ? WHERE portfolio_url = ?`)
            .run(new Date().toISOString(), vc.portfolio_url)

          await new Promise(r => setTimeout(r, 2000))
        }
        catch (err) {
          console.error(`[vcportfolios] Dynamic VC failed (${vc.name}):`, err)
        }
      }
    }
    catch (err) {
      // vc_sources table may not exist yet if vc-dynamic hasn't run
      console.warn('[vcportfolios] Could not load dynamic VCs (vc_sources not ready):', (err as Error).message)
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
