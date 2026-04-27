/**
 * GET /api/admin/news
 * Admin list of all news posts (all statuses), paginated.
 */
import { defineEventHandler, getQuery } from 'h3'
import { getDb, type DbNewsPost } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const page    = Math.max(1, Number(query.page) || 1)
  const perPage = Math.min(50, Number(query.per_page) || 25)
  const offset  = (page - 1) * perPage
  const status  = typeof query.status === 'string' ? query.status : undefined

  const db = getDb()
  const conditions: string[] = []
  const params: Array<string | number> = []

  if (status && ['draft', 'submitted', 'published', 'rejected'].includes(status)) {
    conditions.push('np.status = ?')
    params.push(status)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const total = (db.prepare(`SELECT COUNT(*) as n FROM news_posts np ${where}`).get(...params) as { n: number }).n

  const rows = db.prepare(`
    SELECT np.*, vp.company_name as vendor_name, u.email as vendor_email
    FROM news_posts np
    JOIN vendor_profiles vp ON vp.id = np.vendor_id
    JOIN users u ON u.id = vp.user_id
    ${where}
    ORDER BY np.updated_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, perPage, offset) as (DbNewsPost & { vendor_name: string; vendor_email: string })[]

  return {
    success: true,
    posts: rows.map(r => ({ ...r, featured: Boolean(r.featured) })),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage))
  }
})
