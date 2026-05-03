/**
 * GET /api/vendor/listings
 * Returns all listings owned by the authenticated vendor.
 */
import { getDb } from '~/server/utils/database'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()

  const vendor = await getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 403, statusMessage: 'Vendor profile not found' })

  const listings = db.prepare(`
    SELECT id, slug, name, category, status, rating, review_count, featured, created_at, updated_at
    FROM app_listings WHERE vendor_id = ? ORDER BY created_at DESC
  `).all(vendor.id)

  return { listings }
})
