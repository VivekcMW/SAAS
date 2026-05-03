/**
 * GET /api/stack/benchmark
 *
 * SaaS Spend Benchmark — Pillar 2.3 of the moonmart.ai World #1 plan.
 *
 * Returns anonymized aggregate spend data for a category, so buyers can see
 * what companies of their size are paying.
 *
 * Query params:
 *   category     string   required — e.g. "CRM", "Project Management"
 *   company_size string   optional — '1-10' | '11-50' | '51-200' | '201-500' | '500+'
 *
 * Data sources (layered, most specific first):
 *   1. price_reports table (community-submitted)
 *   2. app_listings published pricing (fallback)
 *
 * Minimum sample: 3 submissions — otherwise bucket is suppressed to prevent
 * re-identification (k-anonymity floor).
 */
import { getDb } from '~/server/utils/database'

const K_ANON_FLOOR = 3  // minimum reports before we reveal aggregate stats

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const category    = typeof q.category    === 'string' ? q.category.trim()    : ''
  const companySize = typeof q.company_size === 'string' ? q.company_size.trim() : ''

  if (!category) throw createError({ statusCode: 400, statusMessage: 'category is required' })

  const db = getDb()

  // ── Get all apps in this category ─────────────────────────────────────────
  const apps = db.prepare(`
    SELECT id, name, slug, pricing_type, pricing_value, pricing_period
    FROM app_listings
    WHERE category = ? AND status = 'published'
    ORDER BY rating DESC
    LIMIT 20
  `).all(category) as Array<{
    id: string; name: string; slug: string
    pricing_type: string; pricing_value: number | null; pricing_period: string | null
  }>

  if (!apps.length) {
    throw createError({ statusCode: 404, statusMessage: `No apps found in category: ${category}` })
  }

  const appIds = apps.map((a) => a.id)

  // ── Aggregate community price reports ─────────────────────────────────────
  // Pull grouped aggregates; apply company_size filter if provided
  const sizeClause = companySize ? `AND r.seats BETWEEN ? AND ?` : ''
  const sizeRange  = parseSizeRange(companySize)

  const reportsSql = `
    SELECT
      r.app_id,
      COUNT(*)                          AS sample_count,
      MIN(r.price_usd)                  AS min_price,
      MAX(r.price_usd)                  AS max_price,
      AVG(r.price_usd)                  AS avg_price,
      AVG(CASE WHEN r.seats > 0 THEN r.price_usd / r.seats ELSE NULL END) AS avg_per_seat
    FROM price_reports r
    WHERE r.app_id IN (${appIds.map(() => '?').join(',')})
      AND r.billing_period = 'month'
      ${sizeClause}
    GROUP BY r.app_id
  `

  const reportArgs: unknown[] = [...appIds, ...(sizeRange ? [sizeRange[0], sizeRange[1]] : [])]
  const reports = db.prepare(reportsSql).all(...reportArgs) as Array<{
    app_id: string; sample_count: number
    min_price: number; max_price: number; avg_price: number; avg_per_seat: number | null
  }>

  const reportMap = new Map(reports.map((r) => [r.app_id, r]))

  // ── Build category-level stats ─────────────────────────────────────────────
  // Summarise across all apps with enough samples
  type ReportRow = { app_id: string; sample_count: number; min_price: number; max_price: number; avg_price: number; avg_per_seat: number | null }
  const appsWithData = appIds
    .map((id) => reportMap.get(id))
    .filter((r): r is ReportRow => !!r && r.sample_count >= K_ANON_FLOOR)

  let categoryAvg: number | null = null
  let categoryMin: number | null = null
  let categoryMax: number | null = null
  let totalSamples = 0

  if (appsWithData.length > 0) {
    totalSamples = appsWithData.reduce((s, r) => s + r.sample_count, 0)
    const allAvgs = appsWithData.map((r) => r.avg_price)
    categoryAvg = Math.round(allAvgs.reduce((s, v) => s + v, 0) / allAvgs.length)
    categoryMin = Math.round(Math.min(...appsWithData.map((r) => r.min_price)))
    categoryMax = Math.round(Math.max(...appsWithData.map((r) => r.max_price)))
  }

  // ── Per-app breakdown ──────────────────────────────────────────────────────
  const breakdown = apps.map((app) => {
    const r = reportMap.get(app.id) as ReportRow | undefined
    const hasData = r && r.sample_count >= K_ANON_FLOOR

    // List price from listings table
    let listMonthly: number | null = null
    if (app.pricing_value && app.pricing_type !== 'free') {
      listMonthly = app.pricing_period === 'year'
        ? Math.round(app.pricing_value / 12)
        : app.pricing_value
    }

    let communityData = null
    if (hasData && r) {
      const perSeat = r.avg_per_seat ? Math.round(r.avg_per_seat) : null
      const discount = (listMonthly && r.avg_price < listMonthly)
        ? Math.round(((listMonthly - r.avg_price) / listMonthly) * 100)
        : null
      communityData = {
        sample_count:         r.sample_count,
        avg_paid_monthly:     Math.round(r.avg_price),
        min_paid_monthly:     Math.round(r.min_price),
        max_paid_monthly:     Math.round(r.max_price),
        avg_per_seat_monthly: perSeat,
        discount_vs_list:     discount,
      }
    }

    return {
      app_id:    app.id,
      app_name:  app.name,
      app_slug:  app.slug,
      pricing_type: app.pricing_type,
      list_price_monthly_usd: listMonthly,
      community_data: communityData,
      moonmart_url: `https://moonmart.ai/marketplace/app/${app.slug}`,
    }
  })

  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  const sizeSuffix = companySize ? ` (${companySize} employees)` : ''
  const summaryMsg = `Companies${sizeSuffix} in the ${category} category pay on average $${categoryAvg}/month`

  return {
    category,
    company_size:     companySize || null,
    total_samples:    totalSamples,
    category_summary: categoryAvg === null ? {
      message: 'Not enough community price reports yet to show benchmarks. Submit yours!',
      submit_url: 'https://moonmart.ai/marketplace',
    } : {
      avg_monthly_usd: categoryAvg,
      min_monthly_usd: categoryMin,
      max_monthly_usd: categoryMax,
      message: summaryMsg,
    },
    apps: breakdown,
    data_note: `Aggregates require a minimum of ${K_ANON_FLOOR} reports per tool. Pricing shown is monthly USD. Community data is anonymous.`,
  }
})

function parseSizeRange(size: string): [number, number] | null {
  const map: Record<string, [number, number]> = {
    '1-10':    [1, 10],
    '11-50':   [11, 50],
    '51-200':  [51, 200],
    '201-500': [201, 500],
    '500+':    [501, 999999],
  }
  return map[size] ?? null
}
