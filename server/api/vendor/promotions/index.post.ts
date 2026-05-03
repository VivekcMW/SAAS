/**
 * POST /api/vendor/promotions
 * Create a new promotion for the authenticated vendor.
 * Body: { appId, type, label, budget, startsAt?, endsAt? }
 */
import { requireVendor } from '~/server/utils/auth'
import { getDb, makeId } from '~/server/utils/database'

const VALID_TYPES = ['discount', 'featured', 'trial-extend']

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const body = await readBody<{ appId?: string; type?: string; label?: string; budget?: number; startsAt?: string; endsAt?: string }>(event)

  if (!body?.appId || !body?.type || !body?.label) {
    throw createError({ statusCode: 400, statusMessage: 'appId, type, and label are required' })
  }
  if (!VALID_TYPES.includes(body.type)) {
    throw createError({ statusCode: 400, statusMessage: `type must be one of: ${VALID_TYPES.join(', ')}` })
  }

  const db = getDb()
  const vendorRow = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as { id: string } | undefined
  if (!vendorRow) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  // Verify app belongs to this vendor
  const app = db.prepare('SELECT id FROM app_listings WHERE id = ? AND vendor_id = ?').get(body.appId, vendorRow.id) as { id: string } | undefined
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found or not owned by this vendor' })

  const id = makeId('promo')
  const now = new Date().toISOString()

  // Determine initial status
  const startsAt = body.startsAt || now
  const status = new Date(startsAt) <= new Date() ? 'active' : 'scheduled'

  db.prepare(`
    INSERT INTO vendor_promotions (id, vendor_id, app_id, type, label, status, budget, spend, clicks, leads, starts_at, ends_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?)
  `).run(id, vendorRow.id, body.appId, body.type, body.label.trim(), status, body.budget ?? 0, startsAt, body.endsAt ?? null, now, now)

  return { success: true, id, status }
})
