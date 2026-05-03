/**
 * POST /api/prices/report
 * Community price report for an app plan.
 */
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'price_report', limit: 5, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many price reports. Try again later.' })
  }

  const body = await readBody(event)
  const { app_id, plan_name, price_usd, billing_period = 'month', seats, currency = 'USD' } = body || {}

  if (!app_id) throw createError({ statusCode: 400, statusMessage: 'app_id is required' })
  if (!plan_name?.trim()) throw createError({ statusCode: 400, statusMessage: 'plan_name is required' })
  if (typeof price_usd !== 'number' || price_usd < 0 || price_usd > 100000) {
    throw createError({ statusCode: 400, statusMessage: 'price_usd must be a number between 0 and 100000' })
  }
  if (!['month', 'year', 'one-time', 'user/month'].includes(billing_period)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid billing_period' })
  }

  const db = getDb()
  const app = db.prepare('SELECT id FROM app_listings WHERE id = ?').get(app_id) as { id: string } | undefined
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const reporterKey = createHash('sha256').update(`${ip}:${app_id}`).digest('hex').slice(0, 20)
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO price_reports (id, app_id, reporter_key, plan_name, price_usd, billing_period, seats, currency, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'community', ?)
  `).run(makeId('pr'), app_id, reporterKey, plan_name.trim(), price_usd, billing_period, seats || null, currency, now)

  // Recompute aggregate for this app + plan
  const reports = db.prepare(`
    SELECT price_usd FROM price_reports WHERE app_id = ? AND plan_name = ?
    ORDER BY created_at DESC LIMIT 100
  `).all(app_id, plan_name.trim()) as { price_usd: number }[]

  if (reports.length > 0) {
    const prices = reports.map(r => r.price_usd).sort((a, b) => a - b)
    const mid = Math.floor(prices.length / 2)
    const median = prices.length % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid]
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length

    const existing = db.prepare('SELECT id FROM price_aggregates WHERE app_id = ? AND plan_name = ?').get(app_id, plan_name.trim()) as { id: string } | undefined
    if (existing) {
      db.prepare(`UPDATE price_aggregates SET min_price=?, max_price=?, avg_price=?, median_price=?, sample_count=?, last_updated=? WHERE id=?`)
        .run(prices[0], prices[prices.length - 1], avg, median, prices.length, now, existing.id)
    } else {
      db.prepare(`INSERT INTO price_aggregates (id, app_id, plan_name, min_price, max_price, avg_price, median_price, sample_count, last_updated) VALUES (?,?,?,?,?,?,?,?,?)`)
        .run(makeId('pa'), app_id, plan_name.trim(), prices[0], prices[prices.length - 1], avg, median, prices.length, now)
    }
  }

  return { message: 'Price report submitted. Thank you!' }
})
