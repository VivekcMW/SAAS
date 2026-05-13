/**
 * GET /api/v1/apps/:slug
 *
 * Full app details including reviews summary.
 * Requires an API key.
 */
import { resolveApiKey } from '~/server/utils/apiKeyAuth'
import { getMarketplaceAppByIdOrSlug } from '~/server/utils/apps'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  resolveApiKey(event)

  const slug = event.context.params?.slug as string
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug is required' })

  const app = getMarketplaceAppByIdOrSlug(slug)
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const db = getDb()

  // Latest 5 approved reviews
  const reviews = db.prepare(`
    SELECT id, user_name, rating, title, content, purchase_verified, created_at
    FROM reviews
    WHERE app_id = ? AND status = 'approved'
    ORDER BY helpful_votes DESC, created_at DESC
    LIMIT 5
  `).all(app.id) as Array<Record<string, unknown>>

  setResponseHeader(event, 'Cache-Control', 'public, max-age=120')

  return {
    data: {
      id: app.id,
      slug: app.slug,
      name: app.name,
      short_description: app.shortDescription || app.description,
      description: app.description,
      category: app.category,
      tags: app.tags,
      pricing: { type: app.pricing.type, value: app.pricing.value, period: app.pricing.period },
      rating: app.rating,
      review_count: app.reviewCount,
      logo: app.logo,
      website_url: app.websiteUrl,
      integrations: app.integrations,
      moonmart_url: `https://moonmart.ai/marketplace/app/${app.slug}`,
      embed_snippet: `<script src="https://moonmart.ai/embed.js" data-app="${app.slug}" async></script>`,
      top_reviews: reviews,
    },
  }
})
