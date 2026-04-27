/**
 * DELETE /api/stack/:id
 * Remove an item from the user's stack.
 */
import { getDb } from '~/server/utils/database'
import { getUserKey } from '../index.get'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const userKey = getUserKey(event)
  const db = getDb()

  const item = db.prepare('SELECT id FROM user_stacks WHERE id = ? AND user_key = ?').get(id, userKey) as any
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Stack item not found' })

  db.prepare('DELETE FROM user_stacks WHERE id = ?').run(id)
  return { message: 'Removed from stack' }
})
