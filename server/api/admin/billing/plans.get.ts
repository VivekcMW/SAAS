// Admin: list all billing plans (all statuses)
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()
  const rows = db.prepare(`SELECT * FROM billing_plans ORDER BY audience, sort_order`).all()
  return rows.map((r: any) => ({
    ...r,
    features: JSON.parse(r.features ?? '[]')
  }))
})
