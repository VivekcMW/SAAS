/**
 * PUT /api/vendor/listings/[id]
 * Update a vendor's own app listing (fields, pricing, tags, etc.)
 */
import { getDb, logActivity } from '~/server/utils/database'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

const ALLOWED_PRICING_TYPES = new Set(['free', 'trial', 'paid', 'contact'])

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const listingId = getRouterParam(event, 'id')
  if (!listingId) throw createError({ statusCode: 400, statusMessage: 'Listing id is required' })

  const db = getDb()
  const vendor = await getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 403, statusMessage: 'Vendor profile not found' })

  // Verify ownership
  const listing = db.prepare(
    `SELECT id, status FROM app_listings WHERE id = ? AND vendor_id = ?`
  ).get(listingId, vendor.id) as { id: string; status: string } | undefined
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found or not owned by you' })

  const body = await readBody<Record<string, unknown>>(event)
  const updates: Record<string, unknown> = {}

  const str = (v: unknown, max = 500) =>
    typeof v === 'string' ? v.trim().slice(0, max) : undefined

  const setStr = (field: string, val: unknown, max = 500) => {
    const s = str(val, max)
    if (s !== undefined) updates[field] = s
  }

  setStr('name', body.name, 100)
  setStr('slug', body.slug, 100)
  setStr('short_description', body.shortDescription ?? body.short_description, 300)
  setStr('long_description', body.longDescription ?? body.long_description, 5000)
  setStr('logo', body.logo, 500)
  setStr('website_url', body.websiteUrl ?? body.website_url, 500)
  setStr('support_email', body.supportEmail ?? body.support_email, 255)
  setStr('category', body.category, 100)
  setStr('provider', body.provider, 100)

  if (body.pricingType !== undefined || body.pricing_type !== undefined) {
    const pt = String(body.pricingType ?? body.pricing_type ?? '')
    if (ALLOWED_PRICING_TYPES.has(pt)) updates.pricing_type = pt
  }
  if (typeof body.pricingValue === 'number' || typeof body.pricing_value === 'number') {
    updates.pricing_value = Number(body.pricingValue ?? body.pricing_value)
  }
  if (body.pricingPeriod !== undefined || body.pricing_period !== undefined) {
    setStr('pricing_period', body.pricingPeriod ?? body.pricing_period, 20)
  }

  if (Array.isArray(body.tags)) {
    updates.tags = JSON.stringify(body.tags.map(String).slice(0, 20))
  }
  if (Array.isArray(body.integrations)) {
    updates.integrations = JSON.stringify(body.integrations.map(String).slice(0, 50))
  }
  if (Array.isArray(body.keyFeatures) || Array.isArray(body.key_features)) {
    const arr = (Array.isArray(body.keyFeatures) ? body.keyFeatures : body.key_features) as unknown[]
    updates.key_features = JSON.stringify(arr.map(String).slice(0, 20))
  }
  if (Array.isArray(body.securityCerts) || Array.isArray(body.security_certs)) {
    const arr = (Array.isArray(body.securityCerts) ? body.securityCerts : body.security_certs) as unknown[]
    updates.security_certs = JSON.stringify(arr.map(String).slice(0, 10))
  }
  if (Array.isArray(body.screenshots)) {
    updates.screenshots = JSON.stringify(body.screenshots.map(String).slice(0, 10))
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  updates.updated_at = new Date().toISOString()
  // Re-submit for review if currently published
  if (listing.status === 'published') updates.status = 'submitted'

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ')
  db.prepare(`UPDATE app_listings SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), listingId)

  logActivity({ actorId: user.id, actorEmail: user.email, action: 'listing.updated', entityType: 'listing', entityId: listingId })

  return { success: true, id: listingId, status: updates.status ?? listing.status }
})
