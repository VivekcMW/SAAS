import { getMarketplaceAppByIdOrSlug } from '~/server/utils/apps'

/**
 * GET /api/apps/compare?ids=app-001,app-002,app-003
 *
 * Returns the requested apps in the same order they were passed.
 * Missing apps are returned as null entries (so the UI can show "not found").
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const raw = (query.ids as string | undefined) || ''
  const ids = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 4)

  if (ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'ids query parameter is required' })
  }

  const apps = ids.map(id => {
    const app = getMarketplaceAppByIdOrSlug(id)
    return app ? { requestedId: id, app } : { requestedId: id, app: null }
  })

  return { count: apps.length, apps }
})
