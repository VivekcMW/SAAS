/**
 * GET /api/v1/apps
 *
 * Paginated list of published apps.
 * Requires an API key (Authorization: Bearer mm_...).
 *
 * Query params:
 *   category   string    filter by category
 *   search     string    full-text search on name/description
 *   pricing    string    free | trial | paid | contact
 *   sort       string    rating (default) | newest | reviews
 *   page       number    default 1
 *   limit      number    default 10, max 100
 */
import { resolveApiKey } from '~/server/utils/apiKeyAuth'
import { getMarketplaceApps } from '~/server/utils/apps'

export default defineEventHandler(async (event) => {
  resolveApiKey(event)

  const q = getQuery(event)
  const category = typeof q.category === 'string' ? q.category : undefined
  const search   = typeof q.search   === 'string' ? q.search   : undefined
  const pricing  = typeof q.pricing  === 'string' ? q.pricing  : undefined
  const sort     = typeof q.sort     === 'string' ? q.sort     : 'rating'
  const limit    = Math.min(100, Math.max(1, Number(q.limit) || 10))
  const page     = Math.max(1, Number(q.page) || 1)

  const result = getMarketplaceApps({ category, search, pricingType: pricing, sortBy: sort, perPage: limit, page })

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60')

  return {
    data: result.apps.map((app) => ({
      id: app.id,
      slug: app.slug,
      name: app.name,
      short_description: app.shortDescription || app.description,
      category: app.category,
      tags: app.tags,
      pricing: { type: app.pricing.type, value: app.pricing.value, period: app.pricing.period },
      rating: app.rating,
      review_count: app.reviewCount,
      logo: app.logo,
      website_url: app.websiteUrl,
      moonmart_url: `https://moonmart.ai/marketplace/app/${app.slug}`,
    })),
    meta: {
      total: result.total,
      page: result.page,
      per_page: result.perPage,
      total_pages: result.totalPages,
    },
  }
})
