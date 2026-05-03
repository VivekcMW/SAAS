/**
 * GET /api/v1/categories
 *
 * Returns the full category taxonomy with app counts.
 * Requires an API key.
 */
import { resolveApiKey } from '~/server/utils/apiKeyAuth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  resolveApiKey(event)

  const db = getDb()
  const cats = db.prepare(`
    SELECT category, COUNT(*) AS app_count
    FROM app_listings
    WHERE status = 'published'
    GROUP BY category
    ORDER BY app_count DESC
  `).all() as Array<{ category: string; app_count: number }>

  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  return {
    data: cats.map((c) => ({
      slug: c.category.toLowerCase().replace(/\s+/g, '-'),
      name: c.category,
      app_count: c.app_count,
      browse_url: `https://moonmart.ai/marketplace?category=${encodeURIComponent(c.category)}`,
    })),
  }
})
