/**
 * GET /api/contracts
 * List the current user's contracts sorted by end date.
 */
import { getDb } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const contracts = db.prepare(`
    SELECT id, app_id, app_name, vendor_name, price_usd, billing_period, seats, start_date, end_date, auto_renews, notes, status, created_at
    FROM contracts WHERE user_id = ? ORDER BY end_date ASC
  `).all(user.id) as any[]

  const totalAnnualUsd = contracts.reduce((sum: number, c: any) => {
    if (!c.price_usd) return sum
    return sum + (c.billing_period === 'year' ? c.price_usd : c.price_usd * 12)
  }, 0)

  return { contracts, total_annual_usd: totalAnnualUsd }
})
