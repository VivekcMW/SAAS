/**
 * GET /api/admin/reviews
 * Returns paginated list of all reviews for admin moderation.
 * Query params: status (pending|approved|rejected|all), page, limit, appId
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const status = String(query.status ?? 'pending')
  const page = Math.max(1, Number(query.page ?? 1))
  const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)))
  const appId = query.appId ? String(query.appId) : null
  const offset = (page - 1) * limit

  const db = getDb()

  const conditions: string[] = []
  const params: unknown[] = []

  if (status !== 'all') { conditions.push('r.status = ?'); params.push(status) }
  if (appId) { conditions.push('r.app_id = ?'); params.push(appId) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const total = (db.prepare(`SELECT COUNT(*) as n FROM reviews r ${where}`).get(...params) as { n: number }).n

  const rows = db.prepare(`
    SELECT
      r.*,
      a.name  AS app_name,
      a.slug  AS app_slug,
      u.email AS user_email
    FROM reviews r
    LEFT JOIN app_listings a ON a.id = r.app_id
    LEFT JOIN users        u ON u.id = r.user_id
    ${where}
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset)

  return {
    reviews: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
})
