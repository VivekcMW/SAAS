/**
 * Y Combinator Crawler
 * Source: https://www.ycombinator.com/companies (public JSON API)
 * Schedule: Weekly (Sunday 2am UTC)
 * Auth: None
 * Est. apps: 4,000+
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore, type ExtractedListing } from '~/server/utils/ai-extractor'

export interface YCCompany {
  id: number
  name: string
  slug: string
  website: string
  one_liner: string
  long_description: string
  batch: string
  tags: string[]
  status: string
  country: string
  team_size: number
  app_video_public: boolean
  small_logo_thumb_url: string
}

const YC_API = 'https://www.ycombinator.com/companies'

async function fetchYCPage(page: number): Promise<YCCompany[]> {
  const url = `${YC_API}?page=${page}&batch=&tags=saas&status=`
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; SaasWorldBot/1.0)'
    },
    signal: AbortSignal.timeout(20_000)
  })

  if (!res.ok) throw new Error(`YC API ${res.status}`)

  const text = await res.text()
  // YC returns HTML with embedded JSON in a <script id="__NEXT_DATA__"> tag
  const match = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(text)
  if (!match) return []

  try {
    const data = JSON.parse(match[1])
    const companies: YCCompany[] = data?.props?.pageProps?.companies ?? []
    return companies
  }
  catch {
    return []
  }
}

export async function runYCCrawler(limit = 200): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'yc', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allCompanies: YCCompany[] = []
    let page = 1

    // Paginate until we have enough or run out
    while (allCompanies.length < limit) {
      const companies = await fetchYCPage(page)
      if (companies.length === 0) break
      allCompanies.push(...companies)
      page++
      // Polite delay
      await new Promise(r => setTimeout(r, 1500))
    }

    found = allCompanies.length

    // Filter to only companies with a website
    const withSite = allCompanies.filter(c => c.website?.startsWith('http')).slice(0, limit)

    // Deduplicate against DB
    const newUrls = filterNew(withSite.map(c => c.website))
    const newSet = new Set(newUrls)
    const toProcess = withSite.filter(c => newSet.has(c.website))

    const now = new Date().toISOString()

    for (const company of toProcess) {
      try {
        // Use YC data directly — high confidence, skip AI for basic fields
        const extracted: ExtractedListing = {
          name: company.name,
          tagline: company.one_liner,
          short_description: company.one_liner,
          long_description: company.long_description || company.one_liner,
          category: 'Other',
          pricing_type: 'contact',
          pricing_starts_at: null,
          target_audience: '',
          key_features: [],
          integrations: [],
          logo_url: company.small_logo_thumb_url || null,
          website_url: company.website,
          founded_year: null,
          confidence: {
            name: 1, description: 0.7, category: 0.3,
            pricing: 0.2, features: 0.2, overall: 0.48
          }
        }

        // Try AI enrichment for category + features (best-effort)
        try {
          const pageText = await fetchPageText(company.website)
          const aiResult = await extractWithAI(pageText, company.website)
          // Merge: keep YC name/description, use AI for category/features
          extracted.category = aiResult.category
          extracted.pricing_type = aiResult.pricing_type
          extracted.pricing_starts_at = aiResult.pricing_starts_at
          extracted.key_features = aiResult.key_features
          extracted.target_audience = aiResult.target_audience
          extracted.confidence = aiResult.confidence
        }
        catch { /* AI enrichment optional */ }

        const score = computeScore(extracted.confidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, founder_email, processed_at, created_at)
          VALUES (?, 'yc', ?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          itemId,
          `https://www.ycombinator.com/companies/${company.slug}`,
          company.website,
          JSON.stringify(extracted),
          score,
          status,
          now,
          now
        )

        added++
      }
      catch (err) {
        console.error('[yc-crawler] Failed for', company.website, err)
        failed++
      }

      // Polite delay between AI calls
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  catch (err) {
    console.error('[yc-crawler] Fatal error', err)
    db.prepare(
      `UPDATE agent_runs SET status='error', finished_at=? WHERE id=?`
    ).run(new Date().toISOString(), runId)
    throw err
  }

  db.prepare(
    `UPDATE agent_runs
     SET status='done', finished_at=?, urls_found=?, urls_new=?, urls_failed=?
     WHERE id=?`
  ).run(new Date().toISOString(), found, added, failed, runId)

  console.log(`[yc-crawler] Done — found:${found} added:${added} failed:${failed}`)
  return { found, added, failed }
}
