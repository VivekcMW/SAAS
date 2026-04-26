import { getMarketplaceApps } from '~/server/utils/apps'

export default defineEventHandler((event) => {
  const query = getQuery(event)

  const result = getMarketplaceApps({
    search: typeof query.search === 'string' ? query.search : undefined,
    category: typeof query.category === 'string' ? query.category : undefined,
    pricingType: typeof query.pricing_type === 'string' ? query.pricing_type : undefined,
    sortBy: typeof query.sort === 'string' ? query.sort : undefined,
    featured: query.featured === 'true' ? true : undefined,
    trending: query.trending === 'true' ? true : undefined,
    page: typeof query.page === 'string' ? Number(query.page) : undefined,
    perPage: typeof query.per_page === 'string' ? Number(query.per_page) : undefined,
    limit: typeof query.limit === 'string' ? Number(query.limit) : undefined
  })

  return {
    success: true,
    total: result.total,
    page: result.page,
    perPage: result.perPage,
    totalPages: result.totalPages,
    apps: result.apps
  }
})
