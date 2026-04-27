/**
 * GET /api/admin/reviews
 * List reviews pending moderation.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  await requireAdmin(event)
  const db = getDb()

  const q = getQuery(event)
  const status = typeof q.status === 'string' ? q.status : 'pending'
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(100, Number(q.limit) || 20)
  const offset = (page - 1) * limit

  const { total } = db.prepare(
    "SELECT COUNT(*) as total FROM reviews WHERE status = ?"
  ).get(status) as { total: number }

  const rows = db.prepare(`
    SELECT r.id, r.app_id, r.user_name, r.user_email, r.user_role,
           r.rating, r.title, r.content, r.verified, r.status,
           r.authenticity_score, r.created_at,
           al.name as app_name, al.slug as app_slug
    FROM reviews r
    LEFT JOIN app_listings al ON al.id = r.app_id
    WHERE r.status = ?
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `).all(status, limit, offset) as Array<{
    id: string; app_id: string; user_name: string; user_email: string | null
    user_role: string | null; rating: number; title: string; content: string
    verified: number; status: string; authenticity_score: number | null
    created_at: string; app_name: string | null; app_slug: string | null
  }>

  return {
    reviews: rows.map(r => ({
      id: r.id, appId: r.app_id, appName: r.app_name, appSlug: r.app_slug,
      userName: r.user_name, userEmail: r.user_email, userRole: r.user_role,
      rating: r.rating, title: r.title, content: r.content,
      verified: Boolean(r.verified), status: r.status,
      authenticityScore: r.authenticity_score, createdAt: r.created_at
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  }
})
