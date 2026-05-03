/**
 * DELETE /api/vendor/listings/[id]
 * Soft-deletes (archives) a vendor's own listing.
 */
import { getDb, logActivity } from '~/server/utils/database'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const listingId = getRouterParam(event, 'id')
  if (!listingId) throw createError({ statusCode: 400, statusMessage: 'Listing id is required' })

  const db = getDb()
  const vendor = await getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 403, statusMessage: 'Vendor profile not found' })

  const listing = db.prepare(
    `SELECT id FROM app_listings WHERE id = ? AND vendor_id = ?`
  ).get(listingId, vendor.id) as { id: string } | undefined
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found or not owned by you' })

  // Soft-delete: set status to 'archived' rather than hard-deleting rows with FK dependencies
  db.prepare(`UPDATE app_listings SET status = 'archived', updated_at = ? WHERE id = ?`)
    .run(new Date().toISOString(), listingId)

  logActivity({ actorId: user.id, actorEmail: user.email, action: 'listing.deleted', entityType: 'listing', entityId: listingId })

  return { success: true, id: listingId }
})
