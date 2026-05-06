/**
 * AlternativeTo Crawler
 * Source: https://alternativeto.net (public HTML pages)
 * Schedule: Weekly (Saturday 4am UTC)
 * Auth: None
 * Est. apps: 30,000+ software products
 *
 * AlternativeTo is one of the largest software directories with category
 * tags, platform info, and user-generated alternatives — great breadth.
 *
 * Crawl strategy: Paginate /software?page=N sorted by likes.
 * Each page returns ~24 products. Target: top 2,000 most-liked.
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore } from '~/server/utils/ai-extractor'

const AT_BASE = 'https://alternativeto.net'

interface ATProduct {
  name: string
  tagline: string
  website: string
  atUrl: string
  categories: string[]
  likesCount: number
}

function parseAlternativeToPage(html: string): ATProduct[] {
  const products: ATProduct[] = []

  // AlternativeTo app cards
  const cardRegex = /<article[^>]*data-application-slug="([^"]*)"[^>]*>([\s\S]*?)<\/article>/gi
  let cardMatch: RegExpExecArray | null

  while ((cardMatch = cardRegex.exec(html)) !== null) {
    const slug = cardMatch[1]
    const card = cardMatch[2]

    // Name
    const nameMatch = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(card)
    const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : slug

    // Tagline / description
    const taglineMatch = /<p[^>]*class="[^"]*(?:description|tagline)[^"]*"[^>]*>([\s\S]*?)<\/p>/.exec(card)
    const tagline = taglineMatch ? taglineMatch[1].replace(/<[^>]+>/g, '').trim() : ''

    // Official website link
    const websiteMatch = /href="(https?:\/\/(?!alternativeto)[^"]+)"[^>]*(?:rel="nofollow"|class="[^"]*official[^"]*")/.exec(card)
    const website = websiteMatch ? websiteMatch[1] : ''

    // Like count for sorting signal
    const likesMatch = /(\d[\d,]*)\s*(?:likes|Likes)/.exec(card)
    const likesCount = likesMatch ? parseInt(likesMatch[1].replace(/,/g, ''), 10) : 0

    // Categories
    const catMatches = card.matchAll(/href="\/tag\/([^"]+)"[^>]*>([^<]+)<\/a>/gi)
    const categories = Array.from(catMatches).map(m => m[2].trim())

    if (!name || !slug) continue

    products.push({
      name,
      tagline,
      website,
      atUrl: `${AT_BASE}/software/${slug}`,
      categories,
      likesCount
    })
  }

  return products.sort((a, b) => b.likesCount - a.likesCount)
}

/** Fetch an AlternativeTo detail page to get the real website URL */
async function fetchATDetailPage(atUrl: string): Promise<string | null> {
  try {
    const res = await fetch(atUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)',
        'Accept': 'text/html'
      },
      signal: AbortSignal.timeout(15_000)
    })
    if (!res.ok) return null
    const html = await res.text()

    // AlternativeTo "Official Website" link
    const officialMatch = /href="(https?:\/\/(?!alternativeto)[^"]+)"[^>]*(?:id="officialWebsite"|class="[^"]*official[^"]*")/.exec(html)
    if (officialMatch) return officialMatch[1]

    // Fallback: og:url
    const ogMatch = /<meta[^>]+property="og:url"[^>]+content="(https?:\/\/[^"]+)"/.exec(html)
    if (ogMatch && !ogMatch[1].includes('alternativeto')) return ogMatch[1]

    return null
  }
  catch { return null }
}

async function fetchATPage(page: number): Promise<ATProduct[]> {
  const url = `${AT_BASE}/software/?sort=likes&platform=web&page=${page}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)',
      'Accept': 'text/html,application/xhtml+xml'
    },
    signal: AbortSignal.timeout(20_000)
  })

  if (res.status === 429) {
    console.warn('[alternativeto] Rate limited — waiting 90s')
    await new Promise(r => setTimeout(r, 90_000))
    return []
  }
  if (!res.ok) throw new Error(`AlternativeTo page ${page} → ${res.status}`)

  const html = await res.text()
  return parseAlternativeToPage(html)
}

export async function runAlternativeToCrawler(
  limit = 150
): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'alternativeto', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allProducts: ATProduct[] = []
    let page = 1

    while (allProducts.length < limit * 2 && page <= 30) {
      try {
        const products = await fetchATPage(page)
        if (products.length === 0) break
        allProducts.push(...products)
        page++
        await new Promise(r => setTimeout(r, 2500))
      }
      catch (err) {
        console.error(`[alternativeto] Page ${page} failed:`, err)
        break
      }
    }

    found = allProducts.length

    // Resolve websites for products missing them
    const withWebsites: ATProduct[] = []
    for (const product of allProducts.slice(0, limit * 2)) {
      if (product.website) {
        withWebsites.push(product)
      }
      else {
        const website = await fetchATDetailPage(product.atUrl)
        if (website) withWebsites.push({ ...product, website })
        await new Promise(r => setTimeout(r, 1000))
      }
    }

    const newUrls = filterNew(withWebsites.map(p => p.website))
    const newSet = new Set(newUrls)
    const toProcess = withWebsites.filter(p => newSet.has(p.website)).slice(0, limit)

    const now = new Date().toISOString()

    for (const product of toProcess) {
      try {
        let extracted = {
          name: product.name,
          tagline: product.tagline || product.name,
          short_description: product.tagline || '',
          long_description: product.tagline || '',
          category: mapATCategoryToSaas(product.categories[0] || ''),
          pricing_type: 'contact' as const,
          pricing_starts_at: null as number | null,
          target_audience: '',
          key_features: [] as string[],
          integrations: [] as string[],
          logo_url: null as string | null,
          website_url: product.website,
          founded_year: null as number | null,
          confidence: {
            name: 0.9,
            description: product.tagline ? 0.6 : 0.1,
            category: product.categories.length > 0 ? 0.55 : 0.1,
            pricing: 0.1,
            features: 0.1,
            overall: product.tagline ? 0.44 : 0.28
          }
        }

        try {
          const pageText = await fetchPageText(product.website)
          const aiResult = await extractWithAI(pageText, product.website)
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
          VALUES (?, 'alternativeto', ?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          itemId,
          product.atUrl,
          product.website,
          JSON.stringify({ ...extracted, at_categories: product.categories, at_likes: product.likesCount }),
          score,
          status,
          now,
          now
        )

        added++
      }
      catch (err) {
        console.error('[alternativeto] Failed for', product.website, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 1500))
    }

    db.prepare(
      `UPDATE agent_runs SET status = 'done', finished_at = ?, items_found = ?, items_added = ?, items_failed = ? WHERE id = ?`
    ).run(new Date().toISOString(), found, added, failed, runId)
  }
  catch (err) {
    console.error('[alternativeto] Fatal error:', err)
    db.prepare(`UPDATE agent_runs SET status = 'error', finished_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), runId)
    throw err
  }

  return { found, added, failed }
}

/** Map AlternativeTo category tags to our SaaS category taxonomy */
function mapATCategoryToSaas(atCategory: string): string {
  const map: Record<string, string> = {
    'crm': 'CRM',
    'project-management': 'Project Management',
    'analytics': 'Analytics',
    'email-marketing': 'Marketing',
    'hr': 'HR & Recruitment',
    'accounting': 'Finance & Accounting',
    'developer-tools': 'Developer Tools',
    'security': 'Security',
    'communication': 'Communication',
    'customer-support': 'Customer Support',
    'ecommerce': 'E-Commerce',
    'design': 'Design',
    'productivity': 'Productivity',
    'business-intelligence': 'Data & BI',
    'it-management': 'IT Management',
    'sales': 'Sales',
    'education': 'Education',
  }
  const key = atCategory.toLowerCase().replace(/\s+/g, '-')
  return map[key] || 'Other'
}
