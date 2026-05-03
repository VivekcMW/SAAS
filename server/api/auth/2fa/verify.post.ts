/**
 * POST /api/auth/2fa/verify
 * Confirms the TOTP setup with a live code from the authenticator app,
 * activates 2FA, and returns one-time backup codes.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'
import { verifyTotp, generateBackupCodes } from '~/server/utils/totp'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const body = await readBody<{ code?: string }>(event)
  if (!body?.code) throw createError({ statusCode: 400, statusMessage: 'code is required' })

  const db = getDb()
  const row = db.prepare('SELECT totp_secret, totp_enabled FROM users WHERE id = ?').get(user.id) as
    | { totp_secret: string | null; totp_enabled: number }
    | undefined

  if (!row?.totp_secret) {
    throw createError({ statusCode: 400, statusMessage: 'Run /api/auth/2fa/setup first to generate a secret.' })
  }
  if (row.totp_enabled) {
    throw createError({ statusCode: 400, statusMessage: '2FA is already enabled.' })
  }

  if (!verifyTotp(row.totp_secret, body.code)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid code. Check your authenticator app and try again.' })
  }

  const backupCodes = generateBackupCodes(8)
  // Store hashed backup codes (SHA-256) so originals aren't exposed if DB is leaked
  const hashedCodes = backupCodes.map(c => createHash('sha256').update(c).digest('hex'))

  db.prepare(
    'UPDATE users SET totp_enabled = 1, totp_backup_codes = ?, updated_at = ? WHERE id = ?',
  ).run(JSON.stringify(hashedCodes), new Date().toISOString(), user.id)

  return {
    ok: true,
    backupCodes, // Show ONCE — user must save these
    message: '2FA enabled successfully. Save your backup codes in a secure location.',
  }
})
