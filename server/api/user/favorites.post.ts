/**
 * POST /api/user/favorites
 * Body: { appId: string }
 * Adds an app to the authenticated user's favorites.
 * Idempotent — silently succeeds if already saved.
 */
import { getSessionUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in required' })

  const body = await readBody<{ appId?: string }>(event)
  if (!body?.appId || typeof body.appId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'appId is required' })
  }
  // Sanitize appId: alphanumeric, dashes and underscores only
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(body.appId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid appId format' })
  }

  try {
    getDb()
      .prepare('INSERT OR IGNORE INTO user_favorites (id, user_id, app_id, created_at) VALUES (lower(hex(randomblob(16))), ?, ?, unixepoch())')
      .run(user.id, body.appId)
  } catch (err) {
    console.error('[favorites POST]', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to save favorite' })
  }

  return { success: true, appId: body.appId }
})
