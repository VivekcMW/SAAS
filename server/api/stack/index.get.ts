/**
 * GET /api/stack
 * Returns the current user's stack (keyed by anonymised user_key via cookie).
 */
import { getDb } from '~/server/utils/database'
import { createHash } from 'node:crypto'

function getUserKey(event: any): string {
  const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0].trim()
    || getRequestHeader(event, 'x-real-ip')
    || '0.0.0.0'
  // Use a session cookie if present, else fall back to IP-based key
  const cookie = getCookie(event, 'sw_stack_key')
  if (cookie) return cookie
  const key = createHash('sha256').update(ip).digest('hex').slice(0, 24)
  setCookie(event, 'sw_stack_key', key, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  return key
}

export { getUserKey }

export default defineEventHandler(async (event) => {
  const userKey = getUserKey(event)
  const db = getDb()

  const items = db.prepare(`
    SELECT id, app_id, app_name, app_logo, category, price_usd, billing_period, seats, renewal_date, notes, added_at
    FROM user_stacks WHERE user_key = ? ORDER BY added_at DESC
  `).all(userKey) as any[]

  const totalMonthly = items.reduce((sum: number, item: any) => {
    if (!item.price_usd) return sum
    const monthly = item.billing_period === 'year' ? item.price_usd / 12 : item.price_usd
    return sum + monthly * (item.seats || 1)
  }, 0)

  return { items, total_monthly_usd: totalMonthly, count: items.length }
})
