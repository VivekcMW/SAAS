/**
 * GET /api/admin/sponsored/requests
 * Returns all vendor sponsorship requests. Admin-only.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()
  const rows = db.prepare(`
    SELECT
      sr.id,
      sr.app_name         AS appName,
      sr.slot,
      sr.starts_at        AS startsAt,
      sr.ends_at          AS endsAt,
      sr.goal,
      sr.budget,
      sr.tagline,
      sr.notes,
      sr.status,
      sr.rejection_reason AS rejectionReason,
      sr.reviewed_at      AS reviewedAt,
      sr.created_at       AS submittedAt,
      u.full_name         AS vendorName,
      u.email             AS vendorEmail
    FROM sponsored_requests sr
    LEFT JOIN users u ON u.id = sr.vendor_id
    ORDER BY sr.created_at DESC
  `).all()
  return rows
})
