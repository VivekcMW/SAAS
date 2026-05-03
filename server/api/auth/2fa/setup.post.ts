/**
 * POST /api/auth/2fa/setup
 * Generates a TOTP secret and QR URI for the authenticated user.
 * The 2FA is NOT enabled until the user calls /api/auth/2fa/verify with a valid code.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'
import { generateTotpSecret, getTotpUri } from '~/server/utils/totp'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 10, windowMs: 60 * 60 * 1000, prefix: '2fa-setup' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests.' })
  }

  const user = await requireUser(event)
  const db = getDb()

  // Check if already enabled
  const row = db.prepare('SELECT totp_enabled FROM users WHERE id = ?').get(user.id) as
    | { totp_enabled: number }
    | undefined
  if (row?.totp_enabled) {
    throw createError({ statusCode: 400, statusMessage: '2FA is already enabled on this account.' })
  }

  // Generate and persist a pending secret (not yet active until verified)
  const secret = generateTotpSecret()
  db.prepare('UPDATE users SET totp_secret = ?, updated_at = ? WHERE id = ?').run(
    secret,
    new Date().toISOString(),
    user.id,
  )

  const uri = getTotpUri(secret, user.email)

  return {
    secret,
    uri,
    // QR code can be generated client-side from the URI using a library like qrcode.js
    qrHint: 'Scan the QR code in Google Authenticator, Authy, or 1Password using the uri field.',
  }
})
