import { getMarketplaceApps } from '../../utils/apps'
import { checkRateLimit, getClientIp } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  const rl = checkRateLimit(ip, { limit: 100, windowMs: 60_000, prefix: 'pub-apps' })
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    return { error: 'Rate limit exceeded. Max 100 requests/minute.', retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) }
  }

  const query = getQuery(event)
  const category = typeof query.category === 'string' ? query.category : undefined
  const search = typeof query.search === 'string' ? query.search : undefined
  const pricing = typeof query.pricing === 'string' ? query.pricing : undefined
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'rating'
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10))
  const page = Math.max(1, Number(query.page) || 1)

  const result = getMarketplaceApps({
    category,
    search,
    pricingType: pricing,
    sortBy,
    perPage: limit,
    page
  })

  setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
  setResponseHeader(event, 'X-RateLimit-Limit', '100')
  setResponseHeader(event, 'X-RateLimit-Remaining', String(rl.remaining))

  return {
    data: result.apps.map((app) => ({
      id: app.id,
      slug: app.slug,
      name: app.name,
      description: app.shortDescription || app.description,
      category: app.category,
      pricing: { type: app.pricing.type, value: app.pricing.value, period: app.pricing.period },
      rating: app.rating,
      reviewCount: app.reviewCount,
      logo: app.logo,
      tags: app.tags,
      url: `https://moonmart.ai/marketplace/app/${app.slug}`
    })),
    meta: {
      total: result.total,
      page: result.page,
      perPage: result.perPage,
      totalPages: result.totalPages
    }
  }
})
