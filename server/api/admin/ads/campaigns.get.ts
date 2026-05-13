/**
 * GET /api/admin/ads/campaigns
 * Returns all SEM campaigns across all vendors/apps for admin review.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()

  const campaigns = db.prepare(`
    SELECT
      sc.id, sc.app_id, sc.vendor_id,
      sc.platform, sc.campaign_type, sc.status,
      sc.daily_budget, sc.keywords, sc.ad_headlines, sc.ad_descriptions,
      sc.created_at, sc.updated_at,
      al.name as app_name, al.slug as app_slug
    FROM sem_campaigns sc
    LEFT JOIN app_listings al ON al.id = sc.app_id
    ORDER BY CASE sc.status
      WHEN 'draft' THEN 0
      WHEN 'active' THEN 1
      WHEN 'paused' THEN 2
      ELSE 3
    END, sc.created_at DESC
    LIMIT 200
  `).all()

  return { campaigns }
})
