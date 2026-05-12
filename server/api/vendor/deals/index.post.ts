/**
 * POST /api/vendor/deals
 * Creates a new deal for the authenticated vendor.
 */
import { requireVendor } from '~/server/utils/auth'
import { getDb, makeId } from '~/server/utils/database'
import { logActivity } from '~/server/utils/activityLog'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const body = await readBody<{
    app_id?: string
    title?: string
    description?: string
    discount_pct?: number
    promo_code?: string
    deal_type?: string
    starts_at?: string
    expires_at?: string
    max_claims?: number
  }>(event)

  if (!body?.title?.trim()) throw createError({ statusCode: 400, statusMessage: 'title is required' })
  if (!body.starts_at || !body.expires_at) throw createError({ statusCode: 400, statusMessage: 'starts_at and expires_at are required' })
  if (new Date(body.expires_at) <= new Date(body.starts_at)) {
    throw createError({ statusCode: 400, statusMessage: 'expires_at must be after starts_at' })
  }

  const validTypes = ['percent', 'flat', 'trial', 'free']
  const dealType = body.deal_type && validTypes.includes(body.deal_type) ? body.deal_type : 'percent'

  const db = getDb()
  const id = makeId('deal')
  db.prepare(`
    INSERT INTO vendor_deals (id, vendor_id, app_id, title, description, discount_pct, promo_code, deal_type, starts_at, expires_at, max_claims, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    id, user.id, body.app_id ?? null, body.title.trim(),
    body.description ?? null, body.discount_pct ?? null,
    body.promo_code ?? null, dealType,
    body.starts_at, body.expires_at, body.max_claims ?? null
  )

  logActivity({ actorId: user.id, action: 'deal_created', entityType: 'vendor_deal', entityId: id })

  return { ok: true, id }
})
