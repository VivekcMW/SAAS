/**
 * GET /api/admin/seo/indexnow-log
 * Returns the 50 most recent IndexNow submissions.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()

  const logs = db.prepare(`
    SELECT id, url, engine, status, submitted_at
    FROM indexnow_log
    ORDER BY submitted_at DESC
    LIMIT 50
  `).all()

  return { logs }
})
