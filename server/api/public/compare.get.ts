import { getMarketplaceAppByIdOrSlug } from '../../utils/apps'
import { checkRateLimit, getClientIp } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  const rl = checkRateLimit(ip, { limit: 100, windowMs: 60_000, prefix: 'pub-compare' })
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    return { error: 'Rate limit exceeded.', retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) }
  }

  const query = getQuery(event)
  const appsParam = typeof query.apps === 'string' ? query.apps : ''
  const slugs = appsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5)

  if (slugs.length < 2) {
    setResponseStatus(event, 400)
    return { error: 'Provide at least 2 app slugs in ?apps=slug1,slug2' }
  }

  const results = slugs.map((slug) => getMarketplaceAppByIdOrSlug(slug))
  const notFound = slugs.filter((_, i) => !results[i])

  if (notFound.length) {
    setResponseStatus(event, 404)
    return { error: `Apps not found: ${notFound.join(', ')}` }
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=300')

  return {
    data: results.map((app) => ({
      id: app!.id,
      slug: app!.slug,
      name: app!.name,
      category: app!.category,
      pricing: { type: app!.pricing.type, value: app!.pricing.value },
      rating: app!.rating,
      reviewCount: app!.reviewCount,
      logo: app!.logo,
      url: `https://moonmart.ai/marketplace/app/${app!.slug}`
    })),
    compareUrl: `https://moonmart.ai/compare/${slugs[0]}-vs-${slugs[1]}`
  }
})
