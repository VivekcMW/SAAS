/**
 * GET /api/admin/seo/search-console
 * Returns GSC keyword/ranking data for admin dashboard.
 * Supports ?appId= filter and ?limit=
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()

  const query = getQuery(event)
  const appId = typeof query.appId === 'string' ? query.appId : null
  const limit = Math.min(Number(query.limit) || 100, 500)

  const rows = appId
    ? db.prepare(`
        SELECT g.id, g.app_id, al.name as app_name, al.slug as app_slug,
          g.url, g.query, g.impressions, g.clicks, g.ctr, g.position, g.date
        FROM seo_search_console g
        LEFT JOIN app_listings al ON al.id = g.app_id
        WHERE g.app_id = ?
        ORDER BY g.date DESC, g.impressions DESC
        LIMIT ?
      `).all(appId, limit)
    : db.prepare(`
        SELECT g.id, g.app_id, al.name as app_name, al.slug as app_slug,
          g.url, g.query, g.impressions, g.clicks, g.ctr, g.position, g.date
        FROM seo_search_console g
        LEFT JOIN app_listings al ON al.id = g.app_id
        ORDER BY g.date DESC, g.impressions DESC
        LIMIT ?
      `).all(limit)

  // Aggregate: top queries by total impressions
  const topQueries = db.prepare(`
    SELECT query, SUM(impressions) as total_impressions, SUM(clicks) as total_clicks,
      AVG(position) as avg_position, COUNT(DISTINCT url) as url_count
    FROM seo_search_console
    ${appId ? 'WHERE app_id = ?' : ''}
    GROUP BY query
    ORDER BY total_impressions DESC
    LIMIT 20
  `).all(...(appId ? [appId] : []))

  return { rows, topQueries }
})
