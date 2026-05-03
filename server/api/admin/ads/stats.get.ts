import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

/**
 * GET /api/admin/ads/stats
 * Returns per-app impression and click counts for sponsored listings.
 * Query: ?days=7 (default 30)
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const q = getQuery(event)
  const days = Math.min(Number(q.days) || 30, 365)

  const db = getDb()

  const rows = db.prepare(`
    SELECT
      e.app_id,
      l.name AS app_name,
      SUM(CASE WHEN e.event_type = 'impression' THEN 1 ELSE 0 END) AS impressions,
      SUM(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END) AS clicks
    FROM ad_events e
    LEFT JOIN app_listings l ON l.id = e.app_id
    WHERE e.created_at >= datetime('now', '-' || ? || ' days')
    GROUP BY e.app_id, l.name
    ORDER BY impressions DESC
  `).all(days) as Array<{ app_id: string; app_name: string | null; impressions: number; clicks: number }>

  return {
    days,
    stats: rows.map(r => ({
      appId: r.app_id,
      appName: r.app_name ?? r.app_id,
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: r.impressions > 0 ? ((r.clicks / r.impressions) * 100).toFixed(1) + '%' : '0%',
    })),
  }
})
