// Admin: update a billing plan
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const db = getDb()
  const existing = db.prepare('SELECT id FROM billing_plans WHERE id = ?').get(id)
  if (!existing) throw createError({ statusCode: 404, message: 'Plan not found' })

  const allowed = [
    'plan_key', 'display_name', 'audience', 'price_monthly', 'price_annual',
    'features', 'stripe_price_id_monthly', 'stripe_price_id_annual', 'status', 'sort_order'
  ]
  const updates: string[] = []
  const values: unknown[] = []

  for (const key of allowed) {
    if (key in body) {
      updates.push(`${key} = ?`)
      values.push(key === 'features' ? JSON.stringify(body[key]) : body[key])
    }
  }

  if (updates.length === 0) throw createError({ statusCode: 400, message: 'No fields to update' })

  updates.push('updated_at = ?')
  values.push(new Date().toISOString(), id)

  db.prepare(`UPDATE billing_plans SET ${updates.join(', ')} WHERE id = ?`).run(...values)

  const plan = db.prepare('SELECT * FROM billing_plans WHERE id = ?').get(id) as any
  return { ...plan, features: JSON.parse(plan.features ?? '[]') }
})
