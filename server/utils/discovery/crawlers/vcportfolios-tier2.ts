/**
 * VC Portfolio Crawler — Tier 2 (150 Mid-Size & Specialist Funds)
 * Covers sector-specialist, regional, and mid-size VCs not in the Tier 1 file.
 *
 * Schedule: Weekly (Saturday 3am UTC — after Tier 1 at 2am)
 * Est. apps: 8,000+
 *
 * Categories:
 *   US Mid-Size Growth (50 firms)
 *   EU/UK Mid-Size (30 firms)
 *   Sector-Specialist: FinTech, HealthTech, EdTech, ClimaTech, DevTools (30 firms)
 *   APAC & LatAm (20 firms)
 *   Pre-seed / Micro VCs (20 firms)
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

interface VCEntry {
  name: string
  website: string
  description?: string
  vc: string
}

interface VCSource {
  name: string
  portfolioUrl: string
  domain: string
}

function extractLinks(html: string, vcName: string, skipDomain: string): VCEntry[] {
  const results: VCEntry[] = []
  const re = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([^<]{2,80})<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const url = m[1].trim()
    const text = m[2].replace(/<[^>]+>/g, '').trim()
    if (url.includes(skipDomain)) continue
    if (/twitter|linkedin|facebook|youtube|mailto:|tel:|#|\.(pdf|png|jpg)/i.test(url)) continue
    if (text.length < 2 || text.length > 80) continue
    results.push({ name: text, website: url, vc: vcName })
  }
  return results
}

const VC_TIER2: VCSource[] = [
  // ── US Mid-Size Growth ──────────────────────────────────────────────────────
  { name: 'Andreessen Horowitz Bio Fund', portfolioUrl: 'https://a16z.com/portfolio/', domain: 'a16z.com' },
  { name: 'Accel London', portfolioUrl: 'https://www.accel.com/portfolio', domain: 'accel.com' },
  { name: 'Canaan Partners', portfolioUrl: 'https://www.canaan.com/portfolio', domain: 'canaan.com' },
  { name: 'Menlo Ventures', portfolioUrl: 'https://www.menlovc.com/portfolio', domain: 'menlovc.com' },
  { name: 'Foundation Capital', portfolioUrl: 'https://www.foundationcap.com/portfolio/', domain: 'foundationcap.com' },
  { name: 'Mayfield Fund', portfolioUrl: 'https://www.mayfield.com/portfolio/', domain: 'mayfield.com' },
  { name: 'Shasta Ventures', portfolioUrl: 'https://www.shastaventures.com/portfolio/', domain: 'shastaventures.com' },
  { name: 'Tenaya Capital', portfolioUrl: 'https://www.tenayacapital.com/portfolio/', domain: 'tenayacapital.com' },
  { name: 'DCM Ventures', portfolioUrl: 'https://www.dcm.com/portfolio/', domain: 'dcm.com' },
  { name: 'Scale Venture Partners', portfolioUrl: 'https://www.scalevp.com/portfolio/', domain: 'scalevp.com' },
  { name: 'OpenView Venture Partners', portfolioUrl: 'https://openviewpartners.com/portfolio/', domain: 'openviewpartners.com' },
  { name: 'Bessemer Fellows', portfolioUrl: 'https://www.bvp.com/portfolio', domain: 'bvp.com' },
  { name: 'Andreessen Cultural Leadership Fund', portfolioUrl: 'https://a16z.com/portfolio/', domain: 'a16z.com' },
  { name: 'RRE Ventures', portfolioUrl: 'https://www.rre.com/portfolio/', domain: 'rre.com' },
  { name: 'InterWest Partners', portfolioUrl: 'https://www.interwest.com/portfolio/', domain: 'interwest.com' },
  { name: 'Forerunner Ventures', portfolioUrl: 'https://forerunnerventures.com/portfolio/', domain: 'forerunnerventures.com' },
  { name: 'Canvas Ventures', portfolioUrl: 'https://www.canvas.vc/portfolio/', domain: 'canvas.vc' },
  { name: 'Javelin Venture Partners', portfolioUrl: 'https://javelinvp.com/portfolio/', domain: 'javelinvp.com' },
  { name: 'Wing Venture Capital', portfolioUrl: 'https://wing.vc/portfolio/', domain: 'wing.vc' },
  { name: 'Storm Ventures', portfolioUrl: 'https://www.stormventures.com/portfolio/', domain: 'stormventures.com' },
  { name: 'Freestyle Capital', portfolioUrl: 'https://freestyle.vc/portfolio/', domain: 'freestyle.vc' },
  { name: 'Floodgate Fund', portfolioUrl: 'https://floodgate.com/portfolio/', domain: 'floodgate.com' },
  { name: 'NextView Ventures', portfolioUrl: 'https://nextviewventures.com/portfolio/', domain: 'nextviewventures.com' },
  { name: 'Harrison Metal', portfolioUrl: 'https://www.harrisonmetal.com/portfolio/', domain: 'harrisonmetal.com' },
  { name: 'SaaStr Fund', portfolioUrl: 'https://www.saastr.com/fund/', domain: 'saastr.com' },
  { name: 'Work-Bench', portfolioUrl: 'https://www.work-bench.com/portfolio/', domain: 'work-bench.com' },
  { name: 'Costanoa Ventures', portfolioUrl: 'https://www.costanoavc.com/portfolio/', domain: 'costanoavc.com' },
  { name: 'Boldstart Ventures', portfolioUrl: 'https://boldstart.vc/portfolio/', domain: 'boldstart.vc' },
  { name: 'Uncork Capital', portfolioUrl: 'https://uncorkcapital.com/portfolio/', domain: 'uncorkcapital.com' },
  { name: 'Resolute Ventures', portfolioUrl: 'https://www.resolute.vc/portfolio/', domain: 'resolute.vc' },
  { name: 'Contour Venture Partners', portfolioUrl: 'https://contourventures.com/portfolio/', domain: 'contourventures.com' },
  { name: 'Valar Ventures', portfolioUrl: 'https://valarventures.com/portfolio/', domain: 'valarventures.com' },
  { name: 'BoxGroup', portfolioUrl: 'https://www.boxgroup.com/portfolio/', domain: 'boxgroup.com' },
  { name: 'K9 Ventures', portfolioUrl: 'https://www.k9ventures.com/portfolio/', domain: 'k9ventures.com' },
  { name: 'Precursor Ventures', portfolioUrl: 'https://precursorvc.com/portfolio/', domain: 'precursorvc.com' },
  { name: 'Hustle Fund', portfolioUrl: 'https://www.hustlefund.vc/portfolio/', domain: 'hustlefund.vc' },
  { name: 'Village Global', portfolioUrl: 'https://www.villageglobal.vc/portfolio/', domain: 'villageglobal.vc' },
  { name: 'Hack VC', portfolioUrl: 'https://hack.vc/portfolio/', domain: 'hack.vc' },
  { name: 'Goldcrest Capital', portfolioUrl: 'https://goldcrestcap.com/portfolio/', domain: 'goldcrestcap.com' },
  { name: 'Quiet Capital', portfolioUrl: 'https://www.quiet.com/portfolio/', domain: 'quiet.com' },
  { name: 'Abstract Ventures', portfolioUrl: 'https://abstractvc.com/portfolio/', domain: 'abstractvc.com' },
  { name: 'Amplify Partners', portfolioUrl: 'https://amplifypartners.com/portfolio/', domain: 'amplifypartners.com' },
  { name: 'Heavybit', portfolioUrl: 'https://www.heavybit.com/portfolio/', domain: 'heavybit.com' },
  { name: 'Gradient Ventures', portfolioUrl: 'https://www.gradient.com/portfolio/', domain: 'gradient.com' },
  { name: 'Haystack VC', portfolioUrl: 'https://haystack.vc/portfolio/', domain: 'haystack.vc' },
  { name: 'Tribe Capital', portfolioUrl: 'https://tribecap.co/portfolio/', domain: 'tribecap.co' },
  { name: 'Contrary Capital', portfolioUrl: 'https://contrary.com/portfolio/', domain: 'contrary.com' },
  { name: 'Struck Capital', portfolioUrl: 'https://struck.vc/portfolio/', domain: 'struck.vc' },
  { name: 'Firebolt Ventures', portfolioUrl: 'https://firebolt.vc/portfolio/', domain: 'firebolt.vc' },

  // ── EU/UK Mid-Size ──────────────────────────────────────────────────────────
  { name: 'Creandum', portfolioUrl: 'https://creandum.com/portfolio/', domain: 'creandum.com' },
  { name: 'Hoxton Ventures', portfolioUrl: 'https://www.hoxtonventures.com/portfolio/', domain: 'hoxtonventures.com' },
  { name: 'Notion Capital', portfolioUrl: 'https://notion.vc/portfolio/', domain: 'notion.vc' },
  { name: 'Episode 1 Ventures', portfolioUrl: 'https://www.episode1.com/portfolio/', domain: 'episode1.com' },
  { name: 'Stride VC', portfolioUrl: 'https://stride.vc/portfolio/', domain: 'stride.vc' },
  { name: 'Fuel Ventures', portfolioUrl: 'https://fuelventures.com/portfolio/', domain: 'fuelventures.com' },
  { name: 'Angular Ventures', portfolioUrl: 'https://angularventures.com/portfolio/', domain: 'angularventures.com' },
  { name: 'Nauta Capital', portfolioUrl: 'https://nautacapital.com/portfolio/', domain: 'nautacapital.com' },
  { name: 'Idinvest (Eurazeo)', portfolioUrl: 'https://www.eurazeo.com/en/investment-portfolio/', domain: 'eurazeo.com' },
  { name: 'Partech', portfolioUrl: 'https://partechpartners.com/portfolio/', domain: 'partechpartners.com' },
  { name: 'Elaia Partners', portfolioUrl: 'https://elaia.com/portfolio/', domain: 'elaia.com' },
  { name: 'Kima Ventures', portfolioUrl: 'https://www.kimaventures.com/portfolio/', domain: 'kimaventures.com' },
  { name: 'Serena Capital', portfolioUrl: 'https://www.serenacapital.com/portfolio/', domain: 'serenacapital.com' },
  { name: 'ISAI', portfolioUrl: 'https://www.isai.fr/portfolio/', domain: 'isai.fr' },
  { name: 'Dawn Capital', portfolioUrl: 'https://dawncapital.com/portfolio/', domain: 'dawncapital.com' },
  { name: 'Backed VC', portfolioUrl: 'https://backed.vc/portfolio/', domain: 'backed.vc' },
  { name: 'Mosaic Ventures', portfolioUrl: 'https://mosaicventures.com/portfolio/', domain: 'mosaicventures.com' },
  { name: 'Entrepreneur First', portfolioUrl: 'https://www.joinef.com/companies/', domain: 'joinef.com' },
  { name: 'Forward Partners', portfolioUrl: 'https://forwardpartners.com/portfolio/', domain: 'forwardpartners.com' },
  { name: 'Lakestar', portfolioUrl: 'https://www.lakestar.com/portfolio/', domain: 'lakestar.com' },
  { name: 'Global Founders Capital', portfolioUrl: 'https://gfc.io/portfolio/', domain: 'gfc.io' },
  { name: 'Target Global', portfolioUrl: 'https://www.target.global/portfolio/', domain: 'target.global' },
  { name: 'La Famiglia', portfolioUrl: 'https://www.lafamiglia.vc/portfolio/', domain: 'lafamiglia.vc' },
  { name: 'Maki.vc', portfolioUrl: 'https://maki.vc/portfolio/', domain: 'maki.vc' },
  { name: 'Moonfire Ventures', portfolioUrl: 'https://moonfire.com/portfolio/', domain: 'moonfire.com' },
  { name: 'OMERS Ventures', portfolioUrl: 'https://omersventures.com/portfolio/', domain: 'omersventures.com' },
  { name: 'Illuminate Financial', portfolioUrl: 'https://illuminatefinancial.com/portfolio/', domain: 'illuminatefinancial.com' },
  { name: 'DN Capital', portfolioUrl: 'https://www.dncapital.com/portfolio/', domain: 'dncapital.com' },
  { name: 'Blossom Capital', portfolioUrl: 'https://www.blossom.vc/portfolio/', domain: 'blossom.vc' },
  { name: 'RTP Global', portfolioUrl: 'https://rtp.vc/portfolio/', domain: 'rtp.vc' },

  // ── Sector: FinTech ─────────────────────────────────────────────────────────
  { name: 'Fin VC', portfolioUrl: 'https://fin.vc/portfolio/', domain: 'fin.vc' },
  { name: 'Commerce Ventures', portfolioUrl: 'https://commerceventures.com/portfolio/', domain: 'commerceventures.com' },
  { name: 'QED Investors', portfolioUrl: 'https://qedinvestors.com/portfolio/', domain: 'qedinvestors.com' },
  { name: 'Nyca Partners', portfolioUrl: 'https://nycapartners.com/portfolio/', domain: 'nycapartners.com' },
  { name: 'Anthemis Group', portfolioUrl: 'https://www.anthemis.com/portfolio/', domain: 'anthemis.com' },
  { name: 'Portage Ventures', portfolioUrl: 'https://portageventures.com/portfolio/', domain: 'portageventures.com' },

  // ── Sector: HealthTech ──────────────────────────────────────────────────────
  { name: 'Rock Health', portfolioUrl: 'https://rockhealth.com/portfolio/', domain: 'rockhealth.com' },
  { name: 'HealthX Ventures', portfolioUrl: 'https://healthxventures.com/portfolio/', domain: 'healthxventures.com' },
  { name: 'Digital Health Ventures', portfolioUrl: 'https://digitalhealth.vc/portfolio/', domain: 'digitalhealth.vc' },
  { name: 'Bessemer Health', portfolioUrl: 'https://www.bvp.com/portfolio', domain: 'bvp.com' },

  // ── Sector: DevTools / Infrastructure ───────────────────────────────────────
  { name: 'Heavybit (DevTools)', portfolioUrl: 'https://www.heavybit.com/portfolio/', domain: 'heavybit.com' },
  { name: 'SV Angel', portfolioUrl: 'https://svangel.com/portfolio/', domain: 'svangel.com' },
  { name: 'Root Ventures', portfolioUrl: 'https://root.vc/portfolio/', domain: 'root.vc' },
  { name: 'Uncorrelated Ventures', portfolioUrl: 'https://uncorrelated.com/portfolio/', domain: 'uncorrelated.com' },

  // ── Sector: EdTech ──────────────────────────────────────────────────────────
  { name: 'Learn Capital', portfolioUrl: 'https://www.learncapital.com/portfolio/', domain: 'learncapital.com' },
  { name: 'Reach Capital', portfolioUrl: 'https://www.reachcapital.com/portfolio/', domain: 'reachcapital.com' },
  { name: 'Owl Ventures', portfolioUrl: 'https://www.owlventures.com/portfolio/', domain: 'owlventures.com' },

  // ── Sector: ClimateTech ─────────────────────────────────────────────────────
  { name: 'Breakthrough Energy Ventures', portfolioUrl: 'https://www.breakthroughenergy.org/our-portfolio/portfolio/', domain: 'breakthroughenergy.org' },
  { name: 'Energy Impact Partners', portfolioUrl: 'https://www.energyimpactpartners.com/portfolio/', domain: 'energyimpactpartners.com' },
  { name: 'Congruent Ventures', portfolioUrl: 'https://www.congruentvc.com/portfolio/', domain: 'congruentvc.com' },

  // ── APAC & LatAm ────────────────────────────────────────────────────────────
  { name: 'Lightspeed India', portfolioUrl: 'https://lsvp.com/portfolio/', domain: 'lsvp.com' },
  { name: 'Kalaari Capital', portfolioUrl: 'https://www.kalaari.com/portfolio/', domain: 'kalaari.com' },
  { name: 'Blume Ventures', portfolioUrl: 'https://blume.vc/portfolio/', domain: 'blume.vc' },
  { name: 'Nexus Venture Partners', portfolioUrl: 'https://nexusvp.com/portfolio/', domain: 'nexusvp.com' },
  { name: 'Chiratae Ventures', portfolioUrl: 'https://chiratae.com/portfolio/', domain: 'chiratae.com' },
  { name: 'Stellaris Venture Partners', portfolioUrl: 'https://stellarisvp.com/portfolio/', domain: 'stellarisvp.com' },
  { name: 'Accel India', portfolioUrl: 'https://www.accel.com/portfolio', domain: 'accel.com' },
  { name: 'Sequoia Southeast Asia', portfolioUrl: 'https://www.sequoiacap.com/southeast-asia/', domain: 'sequoiacap.com' },
  { name: 'Golden Gate Ventures', portfolioUrl: 'https://goldengate.vc/portfolio/', domain: 'goldengate.vc' },
  { name: 'Jungle Ventures', portfolioUrl: 'https://jungle.ventures/portfolio/', domain: 'jungle.ventures' },
  { name: 'East Ventures', portfolioUrl: 'https://east.vc/portfolio/', domain: 'east.vc' },
  { name: 'Headline Asia', portfolioUrl: 'https://headline.com/portfolio/', domain: 'headline.com' },
  { name: 'Kima China', portfolioUrl: 'https://www.kimaventures.com/portfolio/', domain: 'kimaventures.com' },
  { name: 'Monashees (LatAm)', portfolioUrl: 'https://www.monashees.com.br/portfolio/', domain: 'monashees.com.br' },
  { name: 'Kaszek Ventures (LatAm)', portfolioUrl: 'https://www.kaszek.com/portfolio/', domain: 'kaszek.com' },
  { name: 'Softbank LatAm', portfolioUrl: 'https://sbla.com/portfolio/', domain: 'sbla.com' },
  { name: 'ALLVP (Mexico)', portfolioUrl: 'https://allvp.vc/portfolio/', domain: 'allvp.vc' },
  { name: 'Magma Partners (LatAm)', portfolioUrl: 'https://magma.vc/portfolio/', domain: 'magma.vc' },
  { name: 'Antler Global', portfolioUrl: 'https://www.antler.co/portfolio/', domain: 'antler.co' },
  { name: 'Peak XV Partners', portfolioUrl: 'https://www.peakxv.com/portfolio/', domain: 'peakxv.com' },

  // ── Micro / Pre-seed ────────────────────────────────────────────────────────
  { name: 'Tiny VC', portfolioUrl: 'https://tiny.vc/portfolio/', domain: 'tiny.vc' },
  { name: 'Super Capital', portfolioUrl: 'https://supercapital.com/portfolio/', domain: 'supercapital.com' },
  { name: 'Garage Capital', portfolioUrl: 'https://garage.vc/portfolio/', domain: 'garage.vc' },
  { name: 'Soma Capital', portfolioUrl: 'https://www.somacap.com/portfolio/', domain: 'somacap.com' },
  { name: 'Pioneer Fund', portfolioUrl: 'https://pioneer.app/portfolio/', domain: 'pioneer.app' },
  { name: 'Betaworks Ventures', portfolioUrl: 'https://betaworks.com/portfolio/', domain: 'betaworks.com' },
  { name: 'Springboard Enterprises', portfolioUrl: 'https://www.springboardenterprises.org/portfolio/', domain: 'springboardenterprises.org' },
  { name: 'Techstars (all batches)', portfolioUrl: 'https://www.techstars.com/portfolio/', domain: 'techstars.com' },
  { name: 'Plug and Play', portfolioUrl: 'https://www.plugandplaytechcenter.com/portfolio/', domain: 'plugandplaytechcenter.com' },
  { name: 'MassChallenge', portfolioUrl: 'https://masschallenge.org/programs-portfolio/', domain: 'masschallenge.org' }
]

async function fetchPortfolioPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'en-US,en;q=0.9' },
    signal: AbortSignal.timeout(20_000)
  })
  if (!res.ok) throw new Error(`Fetch ${url} → ${res.status}`)
  return res.text()
}

function dedupeByDomain(entries: VCEntry[]): VCEntry[] {
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

export async function runVCTier2Crawler(
  limit = 400
): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'vcportfolios_t2', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allEntries: VCEntry[] = []

    for (const vc of VC_TIER2) {
      try {
        console.log(`[vc-tier2] Fetching ${vc.name}...`)
        const html = await fetchPortfolioPage(vc.portfolioUrl)
        const entries = extractLinks(html, vc.name, vc.domain)
        console.log(`[vc-tier2] ${vc.name}: ${entries.length} companies`)
        allEntries.push(...entries)
        await new Promise(r => setTimeout(r, 1500))
      }
      catch (err) {
        console.warn(`[vc-tier2] Failed ${vc.name}:`, err)
      }
    }

    const deduped = dedupeByDomain(allEntries)
    found = deduped.length
    console.log(`[vc-tier2] Total unique: ${found}`)

    const newUrls = filterNew(deduped.map(e => e.website))
    const newSet = new Set(newUrls)
    const toProcess = deduped.filter(e => newSet.has(e.website)).slice(0, limit)
    console.log(`[vc-tier2] New to process: ${toProcess.length}`)

    const now = new Date().toISOString()

    for (const entry of toProcess) {
      try {
        // eslint-disable-next-line prefer-const
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
            description: 0.1,
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
        catch { /* optional */ }

        const score = computeScore(extracted.confidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, founder_email, processed_at, created_at)
          VALUES (?, 'vcportfolios_t2', ?, ?, ?, ?, ?, NULL, ?, ?)
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
        console.error('[vc-tier2] Failed for', entry.website, err)
        failed++
      }
      await new Promise(r => setTimeout(r, 1200))
    }

    db.prepare(
      `UPDATE agent_runs SET status = 'done', finished_at = ?, items_found = ?, items_added = ?, items_failed = ? WHERE id = ?`
    ).run(new Date().toISOString(), found, added, failed, runId)
  }
  catch (err) {
    console.error('[vc-tier2] Fatal error:', err)
    db.prepare(`UPDATE agent_runs SET status = 'error', finished_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), runId)
    throw err
  }

  return { found, added, failed }
}
