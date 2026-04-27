/**
 * GET /api/apps/[id]/similar
 * Returns similar apps based on category + tags overlap.
 */
import { getDb } from '~/server/utils/database'
import { getMarketplaceApps } from '~/server/utils/apps'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const db = getDb()
  const app = db.prepare(
    "SELECT id, category, tags FROM app_listings WHERE (id = ? OR slug = ?) AND status = 'published'"
  ).get(id, id) as { id: string; category: string; tags: string } | undefined

  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const tags: string[] = (() => { try { return JSON.parse(app.tags) } catch { return [] } })()

  // Fetch apps in same category, excluding self
  const { apps } = getMarketplaceApps({ category: app.category, sortBy: 'rating', perPage: 20 })
  const filtered = apps
    .filter(a => a.id !== app.id)
    .map(a => {
      const appTags = a.tags
      const overlap = tags.filter(t => appTags.includes(t)).length
      return { app: a, overlap }
    })
    .sort((a, b) => b.overlap - a.overlap || b.app.rating - a.app.rating)
    .slice(0, 6)
    .map(({ app: a }) => ({
      id: a.id, slug: a.slug, name: a.name, logo: a.logo,
      category: a.category, rating: a.rating, reviewCount: a.reviewCount,
      pricingType: a.pricing.type, pricingValue: a.pricing.value ?? null,
      description: a.description
    }))

  return { similar: filtered }
})
