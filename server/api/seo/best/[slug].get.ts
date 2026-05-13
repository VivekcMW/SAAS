/**
 * GET /api/seo/best/[slug]
 *
 * Returns top apps for a given category slug (e.g. "crm-software" → category "CRM").
 * Used by /best/[slug] programmatic SEO pages.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const limit = Math.min(Number(getQuery(event).limit) || 15, 50)

  // Convert slug back to category name: "crm-software" → "crm"
  const categoryKey = slug.replace(/-software$/, '').replace(/-/g, ' ')

  const db = getDb()
  const apps = db.prepare(`
    SELECT id, slug, name, provider, logo, short_description, category,
           rating, review_count, pricing_type, pricing_value, pricing_period
    FROM app_listings
    WHERE status = 'published'
      AND lower(category) = lower(?)
    ORDER BY rating DESC, review_count DESC
    LIMIT ?
  `).all(categoryKey, limit) as Array<{
    id: string
    slug: string
    name: string
    provider: string | null
    logo: string | null
    short_description: string
    category: string
    rating: number
    review_count: number
    pricing_type: string | null
    pricing_value: number | null
    pricing_period: string | null
  }>

  if (!apps.length) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=7200')

  return {
    slug,
    categoryKey,
    apps
  }
})
