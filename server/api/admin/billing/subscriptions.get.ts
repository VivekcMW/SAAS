// Admin: list all user subscriptions with user info
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event) as {
    role?: string; status?: string; plan?: string; page?: string; limit?: string
  }

  const db = getDb()
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10))
  const limit = Math.min(100, Number.parseInt(query.limit ?? '25', 10))
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: unknown[] = []

  if (query.role) {
    conditions.push('u.role = ?')
    params.push(query.role)
  }
  if (query.status) {
    conditions.push('s.stripe_status = ?')
    params.push(query.status)
  }
  if (query.plan) {
    conditions.push('s.plan = ?')
    params.push(query.plan)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const rows = db.prepare(`
    SELECT
      s.id, s.plan, s.stripe_status, s.current_period_start, s.current_period_end,
      s.cancel_at_period_end, s.canceled_at, s.created_at,
      u.id AS user_id, u.full_name, u.email, u.role,
      p.display_name AS plan_display_name, p.price_monthly
    FROM user_subscriptions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN billing_plans p ON p.plan_key = s.plan
    ${where}
    ORDER BY s.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset)

  const totalRow = db.prepare(`
    SELECT COUNT(*) as total
    FROM user_subscriptions s
    JOIN users u ON u.id = s.user_id
    ${where}
  `).get(...params) as { total: number }

  return {
    subscriptions: rows,
    total: totalRow.total,
    page,
    limit,
    pages: Math.ceil(totalRow.total / limit)
  }
})
