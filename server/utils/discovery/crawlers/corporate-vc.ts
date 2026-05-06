/**
 * Corporate VC Crawler
 * Source: Public portfolio pages of corporate venture arms.
 * Corporate VCs focus on strategic investments in their ecosystem —
 * so their portfolios are highly relevant SaaS/software products.
 *
 * Firms covered (30):
 *   - Salesforce Ventures     - Microsoft M12
 *   - Google Ventures (GV)    - Intel Capital
 *   - Qualcomm Ventures       - Cisco Investments
 *   - Dell Technologies Capital - ServiceNow Ventures
 *   - Workday Ventures        - Slack Fund (now Salesforce)
 *   - HubSpot Ventures        - Okta Ventures
 *   - Zoom Ventures           - Adobe Ventures (Spark Fund)
 *   - SAP.iO                  - AWS (Amazon Alexa Fund)
 *   - Stripe Capital          - Atlassian Ventures
 *   - Shopify Fund            - Twilio Fund
 *   - Box.com Ventures        - Oracle for Startups
 *   - IBM Ventures            - Nvidia Inception
 *   - Databricks Ventures     - Snowflake Ventures
 *   - Datadog Ventures        - Cloudflare Workers Fund
 *   - Notion Capital          - Figma Ventures
 *
 * Schedule: Weekly (Saturday 6am UTC)
 * Est. apps: 3,000+ companies
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

interface CVCEntry {
  name: string
  website: string
  description?: string
  cvc: string // parent corporate
}

interface CVCSource {
  name: string
  portfolioUrl: string
  domain: string
}

/** Generic company link extractor — reused across all CVC pages */
function extractLinks(html: string, cvcName: string, skipDomain: string): CVCEntry[] {
  const results: CVCEntry[] = []
  const re = /<a[^>]+href="(https?:\/\/(?!(?:www\.)?(?:twitter|linkedin|facebook|instagram|youtube|t\.co|bit\.ly)[^"]*)[^"]+)"[^>]*>([^<]{2,80})<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const url = m[1].trim()
    const text = m[2].replace(/<[^>]+>/g, '').trim()
    if (url.includes(skipDomain)) continue
    if (/\.(pdf|png|jpg|gif|svg|zip)$/i.test(url)) continue
    if (/mailto:|tel:|javascript:|#/i.test(url)) continue
    if (text.length < 2 || text.length > 80) continue
    results.push({ name: text, website: url, cvc: cvcName })
  }
  return results
}

const CVC_SOURCES: CVCSource[] = [
  // ── Major Tech CVC ──────────────────────────────────────────────────────────
  { name: 'Salesforce Ventures', portfolioUrl: 'https://www.salesforceventures.com/portfolio/', domain: 'salesforceventures.com' },
  { name: 'Microsoft M12', portfolioUrl: 'https://m12.vc/portfolio/', domain: 'm12.vc' },
  { name: 'Intel Capital', portfolioUrl: 'https://www.intel.com/content/www/us/en/intel-capital/portfolio.html', domain: 'intel.com' },
  { name: 'Qualcomm Ventures', portfolioUrl: 'https://www.qualcommventures.com/portfolio/', domain: 'qualcommventures.com' },
  { name: 'Cisco Investments', portfolioUrl: 'https://www.cisco.com/c/en/us/solutions/cisco-investments/portfolio.html', domain: 'cisco.com' },
  { name: 'Dell Technologies Capital', portfolioUrl: 'https://www.delltechnologiescapital.com/portfolio/', domain: 'delltechnologiescapital.com' },
  { name: 'IBM Ventures', portfolioUrl: 'https://ibm.com/ventures', domain: 'ibm.com' },
  { name: 'Nvidia Inception', portfolioUrl: 'https://www.nvidia.com/en-us/startups/', domain: 'nvidia.com' },
  // ── SaaS CVC ────────────────────────────────────────────────────────────────
  { name: 'ServiceNow Ventures', portfolioUrl: 'https://www.servicenow.com/company/ventures/portfolio.html', domain: 'servicenow.com' },
  { name: 'Workday Ventures', portfolioUrl: 'https://www.workday.com/en-us/company/ventures/portfolio.html', domain: 'workday.com' },
  { name: 'HubSpot Ventures', portfolioUrl: 'https://www.hubspot.com/startups/portfolio', domain: 'hubspot.com' },
  { name: 'Okta Ventures', portfolioUrl: 'https://www.okta.com/okta-ventures/portfolio/', domain: 'okta.com' },
  { name: 'Zoom Ventures', portfolioUrl: 'https://zoom.us/en/zoom-ventures/', domain: 'zoom.us' },
  { name: 'SAP.iO', portfolioUrl: 'https://sap.io/portfolio/', domain: 'sap.io' },
  { name: 'Atlassian Ventures', portfolioUrl: 'https://www.atlassian.com/ventures/portfolio', domain: 'atlassian.com' },
  { name: 'Twilio Fund', portfolioUrl: 'https://www.twilio.org/en-us/fund/portfolio', domain: 'twilio.org' },
  { name: 'Snowflake Ventures', portfolioUrl: 'https://www.snowflake.com/snowflake-ventures/portfolio/', domain: 'snowflake.com' },
  { name: 'Datadog Ventures', portfolioUrl: 'https://www.datadoghq.com/ventures/', domain: 'datadoghq.com' },
  { name: 'Databricks Ventures', portfolioUrl: 'https://www.databricks.com/company/ventures', domain: 'databricks.com' },
  // ── E-Commerce / Fintech CVC ─────────────────────────────────────────────────
  { name: 'Shopify Fund', portfolioUrl: 'https://www.shopify.com/fund', domain: 'shopify.com' },
  { name: 'Stripe Capital', portfolioUrl: 'https://stripe.com/capital/portfolio', domain: 'stripe.com' },
  { name: 'AWS (Amazon Alexa Fund)', portfolioUrl: 'https://developer.amazon.com/alexafund/portfolio', domain: 'amazon.com' },
  // ── Cloud / Infrastructure ───────────────────────────────────────────────────
  { name: 'Cloudflare Workers Fund', portfolioUrl: 'https://www.cloudflare.com/funds/', domain: 'cloudflare.com' },
  { name: 'Adobe Venture Fund', portfolioUrl: 'https://www.adobe.com/ventures/portfolio.html', domain: 'adobe.com' },
  // ── Productivity / Design ────────────────────────────────────────────────────
  { name: 'Box Ventures', portfolioUrl: 'https://www.box.com/en-us/ventures', domain: 'box.com' },
  { name: 'Notion Capital Portfolio', portfolioUrl: 'https://notion.vc/portfolio/', domain: 'notion.vc' },
  { name: 'Figma Ventures', portfolioUrl: 'https://www.figma.com/ventures/', domain: 'figma.com' },
  // ── Oracle ───────────────────────────────────────────────────────────────────
  { name: 'Oracle for Startups', portfolioUrl: 'https://www.oracle.com/startup/portfolio/', domain: 'oracle.com' },
  // ── Slack / Messaging ────────────────────────────────────────────────────────
  { name: 'Slack Fund (Salesforce)', portfolioUrl: 'https://slack.com/fund/portfolio', domain: 'slack.com' }
]

async function fetchPortfolioPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    signal: AbortSignal.timeout(20_000)
  })
  if (!res.ok) throw new Error(`Fetch ${url} → ${res.status}`)
  return res.text()
}

function dedupeByDomain(entries: CVCEntry[]): CVCEntry[] {
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

export async function runCorporateVCCrawler(
  limit = 300
): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'corporate_vc', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allEntries: CVCEntry[] = []

    for (const cvc of CVC_SOURCES) {
      try {
        console.log(`[corporate-vc] Fetching ${cvc.name}...`)
        const html = await fetchPortfolioPage(cvc.portfolioUrl)
        const entries = extractLinks(html, cvc.name, cvc.domain)
        console.log(`[corporate-vc] ${cvc.name}: ${entries.length} companies`)
        allEntries.push(...entries)
        await new Promise(r => setTimeout(r, 2000))
      }
      catch (err) {
        console.warn(`[corporate-vc] Failed ${cvc.name}:`, err)
      }
    }

    const deduped = dedupeByDomain(allEntries)
    found = deduped.length

    const newUrls = filterNew(deduped.map(e => e.website))
    const newSet = new Set(newUrls)
    const toProcess = deduped.filter(e => newSet.has(e.website)).slice(0, limit)

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
          VALUES (?, 'corporate_vc', ?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          itemId,
          entry.website,
          entry.website,
          JSON.stringify({ ...extracted, cvc_source: entry.cvc }),
          score,
          status,
          now,
          now
        )
        added++
      }
      catch (err) {
        console.error('[corporate-vc] Failed for', entry.website, err)
        failed++
      }
      await new Promise(r => setTimeout(r, 1500))
    }

    db.prepare(
      `UPDATE agent_runs SET status = 'done', finished_at = ?, items_found = ?, items_added = ?, items_failed = ? WHERE id = ?`
    ).run(new Date().toISOString(), found, added, failed, runId)
  }
  catch (err) {
    console.error('[corporate-vc] Fatal error:', err)
    db.prepare(`UPDATE agent_runs SET status = 'error', finished_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), runId)
    throw err
  }

  return { found, added, failed }
}
