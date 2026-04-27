/**
 * PATCH /api/contracts/:id
 * Update a contract.
 */
import { getDb } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = await requireUser(event)
  const db = getDb()

  const contract = db.prepare('SELECT id, user_id FROM contracts WHERE id = ?').get(id) as any
  if (!contract) throw createError({ statusCode: 404, statusMessage: 'Contract not found' })
  if (contract.user_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'Access denied' })

  const body = await readBody(event)
  const allowed = ['app_name', 'vendor_name', 'price_usd', 'billing_period', 'seats', 'start_date', 'end_date', 'auto_renews', 'notes', 'status']
  const fields = Object.keys(body || {}).filter(k => allowed.includes(k))
  if (!fields.length) throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })

  const now = new Date().toISOString()
  const setClauses = [...fields.map(f => `${f} = ?`), 'updated_at = ?'].join(', ')
  const values = [...fields.map((f: string) => body[f]), now, id]

  db.prepare(`UPDATE contracts SET ${setClauses} WHERE id = ?`).run(...values)

  return { message: 'Contract updated' }
})
