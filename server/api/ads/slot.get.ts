import { getDb } from '~/server/utils/database'
import type { DbAppListing } from '~/server/utils/database'

/**
 * GET /api/ads/slot
 *   ?placement=alternatives|grid|sidebar|compare|banner|embed
 *   &category=crm
 *   &exclude=app-001
 *
 * Returns one sponsored app suitable for the placement, or null if no
 * inventory matches. Rotates randomly per request so different visitors
 * see different sponsors. Respects category targeting and exclusion.
 *
 * Sponsored apps are simply rows in `app_listings` with `sponsored = 1`.
 * No separate ad inventory table is required for now — this lets vendors
 * upgrade their listing to "sponsored" and get distribution across the site.
 */
export default defineEventHandler((event) => {
  const q = getQuery(event)
  const placement = (q.placement as string) || 'grid'
  const category = (q.category as string) || ''
  const exclude = ((q.exclude as string) || '').split(',').map(s => s.trim()).filter(Boolean)

  const db = getDb()

  const conditions = ["status = 'published'", 'sponsored = 1']
  const params: Array<string | number> = []

  if (category) {
    conditions.push('category = ?')
    params.push(category)
  }

  if (exclude.length) {
    const placeholders = exclude.map(() => '?').join(',')
    conditions.push(`id NOT IN (${placeholders})`, `slug NOT IN (${placeholders})`)
    params.push(...exclude, ...exclude)
  }

  const sql = `
    SELECT * FROM app_listings
    WHERE ${conditions.join(' AND ')}
    ORDER BY RANDOM()
    LIMIT 1
  `

  const stmt = db.prepare(sql)
  const row = stmt.get(...params)
  if (!row) {
    // Fallback 1: any sponsored app NOT in the exclude list (broaden by ignoring category)
    const fallbackConditions = ["status = 'published'", 'sponsored = 1']
    const fallbackParams: Array<string | number> = []
    if (exclude.length) {
      const placeholders = exclude.map(() => '?').join(',')
      fallbackConditions.push(`id NOT IN (${placeholders})`, `slug NOT IN (${placeholders})`)
      fallbackParams.push(...exclude, ...exclude)
    }
    const fallbackSql = `
      SELECT * FROM app_listings
      WHERE ${fallbackConditions.join(' AND ')}
      ORDER BY RANDOM()
      LIMIT 1
    `
    const fallback = db.prepare(fallbackSql).get(...fallbackParams)

    if (fallback) return { ad: mapAd(fallback), placement }

    // Fallback 2: tiny catalog edge case — allow showing a sponsored app already on the page
    // rather than leaving inventory empty. UI still labels it "Sponsored" so it's transparent.
    const lastResort = db.prepare(`
      SELECT * FROM app_listings
      WHERE status = 'published' AND sponsored = 1
      ORDER BY RANDOM()
      LIMIT 1
    `).get()

    if (!lastResort) return { ad: null, placement }
    return { ad: mapAd(lastResort), placement }
  }

  return { ad: mapAd(row), placement }
})

function mapAd(app: DbAppListing) {
  return {
    id: app.id,
    slug: app.slug,
    name: app.name,
    logo: app.logo,
    provider: app.provider,
    description: app.short_description,
    rating: Number(app.rating),
    reviewCount: Number(app.review_count),
    category: app.category,
    pricing: {
      type: app.pricing_type,
      value: app.pricing_value ?? undefined,
      period: app.pricing_period ?? undefined
    },
    href: `/marketplace/app/${app.slug || app.id}?utm_source=saasworld&utm_medium=sponsored&utm_campaign=ads`
  }
}
