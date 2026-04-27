/**
 * GET /api/admin/demos
 * Admin-only paginated list of demo booking requests.
 */
import { createError, defineEventHandler, getQuery } from 'h3'
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const page   = Math.max(1, Number(query.page) || 1)
  const limit  = Math.min(100, Math.max(1, Number(query.limit) || 25))
  const offset = (page - 1) * limit
  const status = typeof query.status === 'string' ? query.status : undefined

  const db = getDb()

  const conditions = ['1=1']
  const params: Array<string | number> = []

  if (status && ['new', 'contacted', 'done'].includes(status)) {
    conditions.push('status = ?')
    params.push(status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const total = (db.prepare(`SELECT COUNT(*) as n FROM demo_bookings ${where}`).get(...params) as { n: number }).n
  const rows = db.prepare(`SELECT * FROM demo_bookings ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset)

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    bookings: rows
  }
})
