import { getMarketplaceAppByIdOrSlug } from '../../../utils/apps'
import { checkRateLimit, getClientIp } from '../../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  const rl = checkRateLimit(ip, { limit: 100, windowMs: 60_000, prefix: 'pub-app-detail' })
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    return { error: 'Rate limit exceeded.', retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) }
  }

  const slug = event.context.params?.slug as string
  if (!slug) {
    setResponseStatus(event, 400)
    return { error: 'slug is required' }
  }

  const app = getMarketplaceAppByIdOrSlug(slug)
  if (!app) {
    setResponseStatus(event, 404)
    return { error: 'App not found' }
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=600')

  return {
    data: {
      id: app.id,
      slug: app.slug,
      name: app.name,
      description: app.description,
      shortDescription: app.shortDescription,
      category: app.category,
      pricing: { type: app.pricing.type, value: app.pricing.value, period: app.pricing.period },
      rating: app.rating,
      reviewCount: app.reviewCount,
      logo: app.logo,
      tags: app.tags,
      integrations: app.integrations,
      url: `https://moonmart.ai/marketplace/app/${app.slug}`
    }
  }
})
