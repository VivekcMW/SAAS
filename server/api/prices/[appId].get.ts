/**
 * GET /api/prices/:appId
 * Community-sourced price aggregates for all plans of an app.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const appId = getRouterParam(event, 'appId')
  const db = getDb()

  const app = db.prepare('SELECT id, name, pricing_type, pricing_value, pricing_period FROM app_listings WHERE id = ?').get(appId) as any
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const aggregates = db.prepare(`
    SELECT plan_name, min_price, max_price, avg_price, median_price, sample_count, last_updated
    FROM price_aggregates WHERE app_id = ?
    ORDER BY avg_price ASC
  `).all(appId) as any[]

  // Recent raw reports (last 10) for transparency
  const recent = db.prepare(`
    SELECT plan_name, price_usd, billing_period, currency, created_at
    FROM price_reports WHERE app_id = ?
    ORDER BY created_at DESC LIMIT 10
  `).all(appId) as any[]

  return {
    app: { id: app.id, name: app.name, official_price: app.pricing_value, official_period: app.pricing_period },
    aggregates,
    recent_reports: recent
  }
})
