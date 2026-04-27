/**
 * DELETE /api/contracts/:id
 * Delete a contract.
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

  db.prepare('DELETE FROM contracts WHERE id = ?').run(id)
  return { message: 'Contract deleted' }
})
