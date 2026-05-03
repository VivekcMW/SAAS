/**
 * GET /api/buyer/deals
 * Returns active discount promotions from vendors as buyer-visible deals.
 * Only 'active' promotions with type='discount' are returned.
 */
import { getDb } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

interface DealRow {
  id: string
  label: string
  promo_code: string | null
  percent_off: number | null
  ends_at: string | null
  app_name: string
  app_id: string
  app_slug: string
  category: string
}

export default defineEventHandler((event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 60, windowMs: 60 * 1000, prefix: 'buyer-deals' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests.' })
  }

  const db = getDb()
  const rows = db.prepare(`
    SELECT
      p.id, p.label, p.promo_code, p.percent_off, p.ends_at,
      al.name AS app_name, al.id AS app_id, al.slug AS app_slug, al.category
    FROM vendor_promotions p
    JOIN app_listings al ON al.id = p.app_id AND al.status = 'published'
    WHERE p.type = 'discount'
      AND p.status = 'active'
      AND (p.ends_at IS NULL OR p.ends_at > datetime('now'))
    ORDER BY p.percent_off DESC NULLS LAST, p.created_at DESC
    LIMIT 50
  `).all() as DealRow[]

  return {
    deals: rows.map(r => ({
      id: r.id,
      product: r.app_name,
      productSlug: r.app_slug,
      title: r.label,
      percentOff: r.percent_off ?? 0,
      code: r.promo_code ?? '',
      expiresAt: r.ends_at ? r.ends_at.slice(0, 10) : null,
      category: r.category,
    }))
  }
})
