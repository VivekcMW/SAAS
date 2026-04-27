/**
 * GET /api/affiliate/dashboard
 * Returns affiliate stats for the current user.
 */
import { getDb } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const account = db.prepare(`SELECT * FROM affiliate_accounts WHERE user_id = ?`).get(user.id) as Record<string, unknown> | undefined
  if (!account) throw createError({ statusCode: 404, statusMessage: 'No affiliate account. POST /api/affiliate/join first.' })

  const recentClicks = db.prepare(`
    SELECT id, ref_url, converted, converted_at, created_at
    FROM affiliate_clicks WHERE affiliate_id = ? ORDER BY created_at DESC LIMIT 20
  `).all(account.id as string)

  return { account, recent_clicks: recentClicks }
})
