import { getMarketplaceApps } from '~/server/utils/apps'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const apps = getMarketplaceApps({
    search: typeof query.search === 'string' ? query.search : undefined,
    category: typeof query.category === 'string' ? query.category : undefined,
    limit: typeof query.limit === 'string' ? Number(query.limit) : undefined
  })

  return {
    success: true,
    total: apps.length,
    apps
  }
})
