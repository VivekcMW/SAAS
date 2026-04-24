/**
 * DELETE /api/user/favorites
 * Body: { appId: string }
 * Removes an app from the authenticated user's favorites.
 */
import { getSessionUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = getSessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in required' })

  const body = await readBody<{ appId?: string }>(event)
  if (!body?.appId || typeof body.appId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'appId is required' })
  }

  getDb()
    .prepare('DELETE FROM user_favorites WHERE user_id = ? AND app_id = ?')
    .run(user.id, body.appId)

  return { success: true, appId: body.appId }
})
