/**
 * POST /api/auth/2fa/disable
 * Disables 2FA after verifying current TOTP code or a backup code.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'
import { verifyTotp } from '~/server/utils/totp'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const body = await readBody<{ code?: string }>(event)
  if (!body?.code) throw createError({ statusCode: 400, statusMessage: 'code is required' })

  const db = getDb()
  const row = db.prepare('SELECT totp_secret, totp_enabled, totp_backup_codes FROM users WHERE id = ?').get(user.id) as
    | { totp_secret: string | null; totp_enabled: number; totp_backup_codes: string | null }
    | undefined

  if (!row?.totp_enabled) {
    throw createError({ statusCode: 400, statusMessage: '2FA is not enabled on this account.' })
  }

  let valid = false

  // Accept TOTP code
  if (row.totp_secret && verifyTotp(row.totp_secret, body.code)) {
    valid = true
  }

  // Accept backup codes (one-time use)
  if (!valid && row.totp_backup_codes) {
    const stored: string[] = JSON.parse(row.totp_backup_codes)
    const hash = createHash('sha256').update(body.code.trim().toUpperCase()).digest('hex')
    const idx = stored.indexOf(hash)
    if (idx !== -1) {
      // Consume the backup code
      stored.splice(idx, 1)
      db.prepare('UPDATE users SET totp_backup_codes = ? WHERE id = ?').run(
        JSON.stringify(stored),
        user.id,
      )
      valid = true
    }
  }

  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid code.' })
  }

  db.prepare(
    'UPDATE users SET totp_enabled = 0, totp_secret = NULL, totp_backup_codes = NULL, updated_at = ? WHERE id = ?',
  ).run(new Date().toISOString(), user.id)

  return { ok: true, message: '2FA has been disabled.' }
})
