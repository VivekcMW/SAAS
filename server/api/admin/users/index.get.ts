/**
 * GET /api/admin/users
 * List all users with pagination. Admin-only.
 *
 * Query params: page (default 1), limit (default 20), search, role
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler((event) => {
  const admin = requireUser(event)

  if (admin.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 20))
  const offset = (page - 1) * limit
  const search = typeof q.search === 'string' ? q.search.trim() : ''
  const role = typeof q.role === 'string' ? q.role.trim() : ''

  const db = getDb()
  const conditions: string[] = []
  const params: unknown[] = []

  if (search) {
    conditions.push('(email LIKE ? OR full_name LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }
  if (role) {
    conditions.push('role = ?')
    params.push(role)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const total = (db.prepare(`SELECT COUNT(*) as c FROM users ${where}`).get(...params) as { c: number }).c

  const rows = db.prepare(`
    SELECT id, email, first_name, last_name, full_name, role, plan,
           email_verified, created_at, stripe_customer_id IS NOT NULL AS has_billing
    FROM users ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as Array<{
    id: string; email: string; first_name: string; last_name: string
    full_name: string; role: string; plan: string; email_verified: number
    created_at: string; has_billing: number
  }>

  return {
    users: rows.map(r => ({
      id: r.id,
      email: r.email,
      firstName: r.first_name,
      lastName: r.last_name,
      fullName: r.full_name,
      role: r.role,
      plan: r.plan,
      emailVerified: Boolean(r.email_verified),
      hasBilling: Boolean(r.has_billing),
      createdAt: r.created_at
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  }
})
