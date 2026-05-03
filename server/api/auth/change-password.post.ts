/**
 * POST /api/auth/change-password
 * Allows an authenticated user to change their password.
 * Invalidates all existing sessions after a successful change.
 */
import { requireUser, verifyPassword, hashPassword } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'
import { isRedisEnabled, redisDestroyUserSessions } from '~/server/utils/redis'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  // 5 attempts per 15 minutes per IP
  if (!checkRateLimit(getClientIp(event), { limit: 5, windowMs: 15 * 60 * 1000, prefix: 'change-pw' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again in 15 minutes.' })
  }

  const user = await requireUser(event)

  const body = await readBody<{ currentPassword?: string; newPassword?: string }>(event)

  if (!body?.currentPassword || !body?.newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'currentPassword and newPassword are required' })
  }

  if (typeof body.newPassword !== 'string' || body.newPassword.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'New password must be at least 8 characters' })
  }

  if (body.newPassword.length > 128) {
    throw createError({ statusCode: 400, statusMessage: 'New password is too long (max 128 characters)' })
  }

  const db = getDb()
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id) as { password_hash: string } | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  if (!verifyPassword(body.currentPassword, row.password_hash)) {
    throw createError({ statusCode: 401, statusMessage: 'Current password is incorrect' })
  }

  const newHash = hashPassword(body.newPassword)
  const now = new Date().toISOString()
  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, now, user.id)

  // Invalidate all existing sessions so other devices are logged out
  if (isRedisEnabled()) {
    await redisDestroyUserSessions(user.id)
  } else {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id)
  }

  return { ok: true, message: 'Password updated. Please log in again on other devices.' }
})
