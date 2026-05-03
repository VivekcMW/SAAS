/**
 * GET /api/admin/vendor-requests
 * Lists all pending (and recent) vendor role upgrade requests.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

interface RequestRow {
  id: string
  user_id: string
  company_name: string
  website_url: string | null
  reason: string | null
  status: string
  admin_note: string | null
  reviewed_at: string | null
  created_at: string
  user_email: string
  user_full_name: string
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const status = typeof query.status === 'string' ? query.status : 'pending'

  const db = getDb()
  const rows = db.prepare(`
    SELECT r.*, u.email as user_email, u.full_name as user_full_name
    FROM vendor_role_requests r
    JOIN users u ON u.id = r.user_id
    WHERE r.status = ?
    ORDER BY r.created_at ASC
    LIMIT 100
  `).all(status) as RequestRow[]

  return {
    requests: rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      email: r.user_email,
      fullName: r.user_full_name,
      companyName: r.company_name,
      websiteUrl: r.website_url,
      reason: r.reason,
      status: r.status,
      adminNote: r.admin_note,
      reviewedAt: r.reviewed_at,
      createdAt: r.created_at,
    }))
  }
})
