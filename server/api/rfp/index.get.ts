/**
 * GET /api/rfp
 * List RFPs for the current user.
 */
import { getDb } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const rfps = db.prepare(`
    SELECT id, title, slug, category, budget_min, budget_max, currency, seats, deadline, status, response_count, created_at
    FROM rfps WHERE user_id = ? ORDER BY created_at DESC
  `).all(user.id) as any[]

  return { rfps }
})
