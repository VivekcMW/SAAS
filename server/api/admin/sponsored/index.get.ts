/**
 * GET /api/admin/sponsored
 * Returns all sponsorship records. Admin-only.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()
  try {
    const rows = db.prepare(`
      SELECT * FROM sponsored_slots
      ORDER BY starts_at DESC
    `).all()
    return rows
  } catch {
    // Table not yet migrated — return empty list gracefully
    return []
  }
})
