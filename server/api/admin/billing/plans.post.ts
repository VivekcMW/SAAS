// Admin: create a new billing plan
import { requireAdmin } from '~/server/utils/auth'
import { getDb, makeId } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)

  const {
    plan_key, display_name, audience, price_monthly = 0, price_annual = 0,
    features = [], stripe_price_id_monthly = null, stripe_price_id_annual = null,
    status = 'active', sort_order = 0
  } = body

  if (!plan_key || !display_name || !audience) {
    throw createError({ statusCode: 400, message: 'plan_key, display_name and audience are required' })
  }
  if (!['buyer', 'vendor'].includes(audience)) {
    throw createError({ statusCode: 400, message: 'audience must be buyer or vendor' })
  }

  const db = getDb()
  const now = new Date().toISOString()
  const id = makeId('bplan')

  db.prepare(`
    INSERT INTO billing_plans
      (id, plan_key, display_name, audience, price_monthly, price_annual, features,
       stripe_price_id_monthly, stripe_price_id_annual, status, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, plan_key, display_name, audience, price_monthly, price_annual,
    JSON.stringify(features), stripe_price_id_monthly, stripe_price_id_annual,
    status, sort_order, now, now
  )

  const plan = db.prepare('SELECT * FROM billing_plans WHERE id = ?').get(id) as any
  return { ...plan, features: JSON.parse(plan.features ?? '[]') }
})
