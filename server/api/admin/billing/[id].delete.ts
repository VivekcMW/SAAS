// Admin: soft-delete (deprecate) a billing plan
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  const db = getDb()
  const existing = db.prepare('SELECT id FROM billing_plans WHERE id = ?').get(id)
  if (!existing) throw createError({ statusCode: 404, message: 'Plan not found' })

  db.prepare(`UPDATE billing_plans SET status = 'deprecated', updated_at = ? WHERE id = ?`)
    .run(new Date().toISOString(), id)

  return { success: true }
})
