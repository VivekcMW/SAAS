/**
 * GET /api/admin/listings
 * List all app listings with filters for moderation.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()

  const q = getQuery(event)
  const status = typeof q.status === 'string' ? q.status : ''
  const search = typeof q.search === 'string' ? q.search.trim() : ''
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(100, Number(q.limit) || 20)
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: unknown[] = []

  if (status) { conditions.push('al.status = ?'); params.push(status) }
  if (search) {
    conditions.push('(al.name LIKE ? OR al.provider LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { total } = db.prepare(`SELECT COUNT(*) as total FROM app_listings al ${where}`).get(...params) as { total: number }

  const rows = db.prepare(`
    SELECT al.id, al.slug, al.name, al.provider, al.category, al.status,
           al.rating, al.review_count, al.featured, al.auto_discovered,
           al.created_at, al.updated_at,
           vp.company_name as vendor_company
    FROM app_listings al
    LEFT JOIN vendor_profiles vp ON vp.id = al.vendor_id
    ${where}
    ORDER BY al.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as Array<{
    id: string; slug: string; name: string; provider: string; category: string
    status: string; rating: number; review_count: number; featured: number
    auto_discovered: number; created_at: string; updated_at: string; vendor_company: string | null
  }>

  return {
    listings: rows.map(r => ({
      id: r.id, slug: r.slug, name: r.name, provider: r.provider,
      category: r.category, status: r.status, rating: r.rating,
      reviewCount: r.review_count, featured: Boolean(r.featured),
      autoDiscovered: Boolean(r.auto_discovered),
      vendorCompany: r.vendor_company,
      createdAt: r.created_at, updatedAt: r.updated_at
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  }
})
