/**
 * GET /api/vendor/sponsorships
 * Returns the authenticated vendor's own sponsorship requests.
 */
import { requireVendor } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()
  const rows = db.prepare(`
    SELECT
      id,
      app_name         AS appName,
      slot,
      starts_at        AS startsAt,
      ends_at          AS endsAt,
      goal,
      budget,
      tagline,
      notes,
      status,
      rejection_reason AS rejectionReason,
      created_at       AS submittedAt
    FROM sponsored_requests
    WHERE vendor_id = ?
    ORDER BY created_at DESC
  `).all(user.id)
  return rows
})
