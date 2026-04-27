/**
 * GET /api/user/favorites
 * Returns the list of app IDs saved by the authenticated user.
 */
import { getSessionUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  const userId = user.id

  const rows = getDb()
    .prepare('SELECT app_id FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Array<{ app_id: string }>

  return { favorites: rows.map(r => r.app_id) }
})
