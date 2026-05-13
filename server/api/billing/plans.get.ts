// Public endpoint — returns active billing plans, optionally filtered by audience
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const { audience } = getQuery(event) as { audience?: string }
  const db = getDb()

  const rows = audience
    ? db.prepare(`SELECT * FROM billing_plans WHERE status = 'active' AND audience = ? ORDER BY sort_order`).all(audience)
    : db.prepare(`SELECT * FROM billing_plans WHERE status = 'active' ORDER BY audience, sort_order`).all()

  return rows.map((r: any) => ({
    ...r,
    features: JSON.parse(r.features ?? '[]')
  }))
})
