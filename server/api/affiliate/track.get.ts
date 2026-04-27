/**
 * GET /api/affiliate/track?ref=REFERRAL_CODE
 * Track a referral click (no auth required).
 */
import { getDb, makeId } from '~/server/utils/database'
import { getHeader } from 'h3'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ref = (query.ref as string)?.toUpperCase()
  const redirectTo = (query.to as string) || '/'

  if (!ref) return sendRedirect(event, redirectTo)

  const db = getDb()
  const account = db.prepare(`SELECT id FROM affiliate_accounts WHERE referral_code = ? AND status = 'active'`).get(ref) as { id: string } | undefined

  if (account) {
    const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
    const ua = getHeader(event, 'user-agent') || ''
    // Anonymize visitor fingerprint
    const visitorKey = createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 16)
    const now = new Date().toISOString()

    // Deduplicate by visitor+affiliate within 24h
    const exists = db.prepare(`
      SELECT id FROM affiliate_clicks
      WHERE affiliate_id = ? AND visitor_key = ? AND created_at > datetime('now', '-1 day')
    `).get(account.id, visitorKey)

    if (!exists) {
      db.prepare(`
        INSERT INTO affiliate_clicks (id, affiliate_id, visitor_key, ref_url, converted, created_at)
        VALUES (?, ?, ?, ?, 0, ?)
      `).run(makeId('clk'), account.id, visitorKey, redirectTo, now)

      db.prepare(`UPDATE affiliate_accounts SET total_clicks = total_clicks + 1, updated_at = ? WHERE id = ?`)
        .run(now, account.id)
    }
  }

  return sendRedirect(event, redirectTo)
})
