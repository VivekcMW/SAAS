/**
 * BetaList Crawler
 * Source: https://betalist.com (public HTML listing pages)
 * Schedule: Weekly (Saturday 3am UTC)
 * Auth: None
 * Est. apps: 6,000+ early-stage SaaS launches
 *
 * BetaList shows pre-launch and early-stage products before they hit
 * Product Hunt — great for discovering emerging tools early.
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

const BETALIST_BASE = 'https://betalist.com'

interface BetaListProduct {
  name: string
  tagline: string
  url: string
  betaUrl: string
}

/** Parse BetaList page HTML to extract product entries */
function parseBetaListPage(html: string): BetaListProduct[] {
  const products: BetaListProduct[] = []

  // BetaList product cards follow the pattern:
  // <h2 class="startup-name">Name</h2> and <a href="/startups/...">
  // Extract startup slugs first, then map to external URLs
  const cardRegex = /<article[^>]*class="[^"]*startup[^"]*"[^>]*>([\s\S]*?)<\/article>/gi
  let cardMatch: RegExpExecArray | null

  while ((cardMatch = cardRegex.exec(html)) !== null) {
    const card = cardMatch[1]

    // Extract name
    const nameMatch = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(card)
    const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : ''
    if (!name) continue

    // Extract BetaList internal link
    const linkMatch = /href="(\/startups\/[^"]+)"/.exec(card)
    const betaPath = linkMatch ? linkMatch[1] : ''
    if (!betaPath) continue

    // Extract tagline
    const taglineMatch = /<p[^>]*class="[^"]*tagline[^"]*"[^>]*>([\s\S]*?)<\/p>/.exec(card)
    const tagline = taglineMatch ? taglineMatch[1].replace(/<[^>]+>/g, '').trim() : ''

    // External website link (if present in card)
    const externalMatch = /href="(https?:\/\/[^"]+betalist[^"]*)"/.exec(card)
    const externalUrl = externalMatch ? externalMatch[1] : ''

    products.push({
      name,
      tagline,
      url: externalUrl,
      betaUrl: `${BETALIST_BASE}${betaPath}`
    })
  }

  return products
}

/** Fetch a BetaList startup page to get the actual website URL */
async function fetchStartupWebsite(betaUrl: string): Promise<string | null> {
  try {
    const res = await fetch(betaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)',
        'Accept': 'text/html'
      },
      signal: AbortSignal.timeout(15_000)
    })
    if (!res.ok) return null

    const html = await res.text()

    // Look for the "Visit Website" or external link pattern
    const websiteMatch = /href="(https?:\/\/(?!betalist)[^"]+)"[^>]*(?:class="[^"]*(?:website|external|visit)[^"]*"|>[^<]*(?:visit|website)[^<]*<)/i.exec(html)
    if (websiteMatch) return websiteMatch[1]

    // Fallback: look for og:url
    const ogMatch = /<meta[^>]+property="og:url"[^>]+content="(https?:\/\/[^"]+)"/.exec(html)
    if (ogMatch && !ogMatch[1].includes('betalist')) return ogMatch[1]

    return null
  }
  catch { return null }
}

async function fetchBetaListPage(page: number): Promise<BetaListProduct[]> {
  const url = `${BETALIST_BASE}/startups?page=${page}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)',
      'Accept': 'text/html,application/xhtml+xml'
    },
    signal: AbortSignal.timeout(20_000)
  })

  if (res.status === 429) {
    console.warn('[betalist] Rate limited — waiting 60s')
    await new Promise(r => setTimeout(r, 60_000))
    return []
  }
  if (!res.ok) throw new Error(`BetaList page ${page} → ${res.status}`)

  const html = await res.text()
  return parseBetaListPage(html)
}

export async function runBetaListCrawler(
  limit = 100
): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'betalist', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allProducts: BetaListProduct[] = []
    let page = 1

    while (allProducts.length < limit * 2 && page <= 20) {
      try {
        const products = await fetchBetaListPage(page)
        if (products.length === 0) break
        allProducts.push(...products)
        page++
        await new Promise(r => setTimeout(r, 2000))
      }
      catch (err) {
        console.error(`[betalist] Page ${page} failed:`, err)
        break
      }
    }

    found = allProducts.length

    // Resolve external website URLs for products that only have BetaList links
    const withUrls: BetaListProduct[] = []
    for (const product of allProducts.slice(0, limit * 2)) {
      if (product.url) {
        withUrls.push(product)
      }
      else if (product.betaUrl) {
        const website = await fetchStartupWebsite(product.betaUrl)
        if (website) withUrls.push({ ...product, url: website })
        await new Promise(r => setTimeout(r, 800))
      }
    }

    const newUrls = filterNew(withUrls.map(p => p.url))
    const newSet = new Set(newUrls)
    const toProcess = withUrls.filter(p => newSet.has(p.url)).slice(0, limit)

    const now = new Date().toISOString()

    for (const product of toProcess) {
      try {
        let extracted = {
          name: product.name,
          tagline: product.tagline || product.name,
          short_description: product.tagline || '',
          long_description: product.tagline || '',
          category: 'Other' as const,
          pricing_type: 'freemium' as const,
          pricing_starts_at: null as number | null,
          target_audience: '',
          key_features: [] as string[],
          integrations: [] as string[],
          logo_url: null as string | null,
          website_url: product.url,
          founded_year: null as number | null,
          confidence: {
            name: 0.9,
            description: product.tagline ? 0.55 : 0.1,
            category: 0.1,
            pricing: 0.1,
            features: 0.1,
            overall: 0.31
          }
        }

        try {
          const pageText = await fetchPageText(product.url)
          const aiResult = await extractWithAI(pageText, product.url)
          extracted = {
            ...extracted,
            category: aiResult.category,
            pricing_type: aiResult.pricing_type,
            pricing_starts_at: aiResult.pricing_starts_at,
            key_features: aiResult.key_features,
            target_audience: aiResult.target_audience,
            long_description: aiResult.long_description || extracted.long_description,
            short_description: aiResult.short_description || extracted.short_description,
            logo_url: aiResult.logo_url,
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
          VALUES (?, 'betalist', ?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          itemId,
          product.betaUrl || product.url,
          product.url,
          JSON.stringify(extracted),
          score,
          status,
          now,
          now
        )

        added++
      }
      catch (err) {
        console.error('[betalist] Failed for', product.url, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 1500))
    }

    db.prepare(
      `UPDATE agent_runs SET status = 'done', finished_at = ?, items_found = ?, items_added = ?, items_failed = ? WHERE id = ?`
    ).run(new Date().toISOString(), found, added, failed, runId)
  }
  catch (err) {
    console.error('[betalist] Fatal error:', err)
    db.prepare(`UPDATE agent_runs SET status = 'error', finished_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), runId)
    throw err
  }

  return { found, added, failed }
}
