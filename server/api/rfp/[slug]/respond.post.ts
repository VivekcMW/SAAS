/**
 * POST /api/rfp/:slug/respond
 * Vendor responds to an RFP.
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireVendor } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'rfp_respond', limit: 20, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many responses.' })
  }

  const slug = getRouterParam(event, 'slug')
  const vendor = await requireVendor(event)
  const db = getDb()

  const rfp = db.prepare("SELECT id, status FROM rfps WHERE slug = ?").get(slug) as any
  if (!rfp) throw createError({ statusCode: 404, statusMessage: 'RFP not found' })
  if (rfp.status !== 'open') throw createError({ statusCode: 400, statusMessage: 'This RFP is no longer accepting responses' })

  const body = await readBody(event)
  const { message, price_usd, billing_period, app_id } = body || {}
  if (!message?.trim()) throw createError({ statusCode: 400, statusMessage: 'message is required' })

  const vendorProfile = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(vendor.id) as any
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO rfp_responses (id, rfp_id, vendor_id, app_id, message, price_usd, billing_period, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(makeId('rfpr'), rfp.id, vendorProfile?.id || null, app_id || null, message.trim(), price_usd || null, billing_period || null, now)

  db.prepare('UPDATE rfps SET response_count = response_count + 1, updated_at = ? WHERE id = ?').run(now, rfp.id)

  return { message: 'Response submitted successfully' }
})
