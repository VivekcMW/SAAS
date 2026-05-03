/**
 * GET /api/support/tickets
 * Returns the authenticated user's own support tickets.
 */
import { getDb } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const tickets = db.prepare(`
    SELECT id, subject, category, status, priority, created_at, updated_at
    FROM support_tickets WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 50
  `).all(user.id)

  return { tickets }
})
