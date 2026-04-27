/**
 * POST /api/affiliate/join
 * Create an affiliate account for the current authenticated user.
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

function genReferralCode(userId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  // Derive from userId then pad with random chars to 8 chars
  const seed = userId.replace(/[^a-z0-9]/gi, '').toUpperCase()
  for (let i = 0; i < 8; i++) {
    code += seed[i] ? chars[seed.charCodeAt(i) % chars.length] : chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const existing = db.prepare(`SELECT id, referral_code FROM affiliate_accounts WHERE user_id = ?`).get(user.id) as { id: string; referral_code: string } | undefined
  if (existing) {
    return { id: existing.id, referral_code: existing.referral_code, message: 'Already enrolled' }
  }

  const id = makeId('aff')
  const now = new Date().toISOString()
  let referralCode = genReferralCode(user.id)

  // Ensure uniqueness
  let tries = 0
  while (db.prepare(`SELECT id FROM affiliate_accounts WHERE referral_code = ?`).get(referralCode) && tries < 10) {
    referralCode = genReferralCode(user.id + tries++)
  }

  db.prepare(`
    INSERT INTO affiliate_accounts
      (id, user_id, referral_code, commission_rate, status, total_clicks, total_conversions, total_earned, pending_payout, created_at, updated_at)
    VALUES (?, ?, ?, 0.20, 'active', 0, 0, 0, 0, ?, ?)
  `).run(id, user.id, referralCode, now, now)

  return { id, referral_code: referralCode, message: 'Affiliate account created' }
})
