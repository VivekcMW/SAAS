/**
 * GET /api/admin/seo/scores
 * Returns SEO scores + faq count + indexnow count per published app.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()

  const scores = db.prepare(`
    SELECT
      al.id as app_id,
      al.name as app_name,
      al.slug as app_slug,
      COALESCE(m.seo_score, 0) as seo_score,
      m.last_scored_at,
      COALESCE(json_array_length(m.faq_json), 0) as faq_count,
      COALESCE(idx.cnt, 0) as indexnow_count
    FROM app_listings al
    LEFT JOIN app_seo_meta m ON m.app_id = al.id
    LEFT JOIN (
      SELECT url, COUNT(*) as cnt
      FROM indexnow_log
      GROUP BY url
    ) idx ON idx.url LIKE '%' || al.slug || '%'
    WHERE al.status = 'published'
    ORDER BY seo_score DESC
    LIMIT 200
  `).all()

  return { scores }
})
