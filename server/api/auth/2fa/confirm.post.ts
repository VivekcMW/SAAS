/**
 * POST /api/auth/2fa/confirm
 * Step 2 of 2FA login: submit the TOTP code (or backup code) to complete sign-in.
 * Called after /api/auth/login returns { twoFactorRequired: true, twoFactorToken }.
 */
import { getDb, logActivity } from '~/server/utils/database'
import { createSession } from '~/server/utils/auth'
import { verifyTotp, verifyTwoFactorToken } from '~/server/utils/totp'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { createHash } from 'node:crypto'
import type { DbUser } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 10, windowMs: 15 * 60 * 1000, prefix: '2fa-confirm' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again later.' })
  }

  const body = await readBody<{ twoFactorToken?: string; code?: string; rememberMe?: boolean }>(event)

  if (!body?.twoFactorToken || !body?.code) {
    throw createError({ statusCode: 400, statusMessage: 'twoFactorToken and code are required' })
  }

  const userId = verifyTwoFactorToken(body.twoFactorToken)
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Token expired or invalid. Please log in again.' })
  }

  const db = getDb()
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as DbUser & {
    totp_secret: string | null
    totp_backup_codes: string | null
  } | undefined

  if (!row) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  let valid = false

  // Check TOTP
  if (row.totp_secret && verifyTotp(row.totp_secret, body.code)) {
    valid = true
  }

  // Check backup codes (one-time use)
  if (!valid && row.totp_backup_codes) {
    const stored: string[] = JSON.parse(row.totp_backup_codes)
    const hash = createHash('sha256').update(body.code.trim().toUpperCase()).digest('hex')
    const idx = stored.indexOf(hash)
    if (idx !== -1) {
      stored.splice(idx, 1)
      db.prepare('UPDATE users SET totp_backup_codes = ? WHERE id = ?').run(
        JSON.stringify(stored),
        userId,
      )
      valid = true
    }
  }

  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid 2FA code.' })
  }

  await createSession(event, userId, body.rememberMe !== false)
  logActivity({ actorId: userId, actorEmail: row.email, action: 'user.login_2fa', entityType: 'user', entityId: userId })

  return {
    success: true,
    user: {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: row.full_name,
      role: row.role,
      plan: row.plan,
    },
  }
})
