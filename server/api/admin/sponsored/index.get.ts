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
      SELECT
        id,
        vendor_name  AS vendorName,
        app_name     AS appName,
        app_id       AS appId,
        slot,
        category,
        status,
        starts_at    AS startsAt,
        ends_at      AS endsAt,
        recurrence,
        budget,
        budget_used  AS budgetUsed,
        notes,
        created_at   AS createdAt,
        updated_at   AS updatedAt
      FROM sponsored_slots
      ORDER BY starts_at DESC
    `).all()
    return rows
  } catch {
    // Table not yet migrated — return empty list gracefully
    return []
  }
})
