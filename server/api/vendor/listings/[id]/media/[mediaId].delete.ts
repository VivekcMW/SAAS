/**
 * DELETE /api/vendor/listings/[id]/media/[mediaId]
 * Remove a screenshot/media item from a vendor listing.
 */
import { requireVendor, getVendorProfileForUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'
import { unlinkSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })

  const listingId = getRouterParam(event, 'id')
  const mediaId = getRouterParam(event, 'mediaId')
  if (!listingId || !mediaId) throw createError({ statusCode: 400, statusMessage: 'Missing ids' })

  const db = getDb()

  // Verify ownership
  const listing = db.prepare('SELECT id FROM app_listings WHERE (id = ? OR slug = ?) AND vendor_id = ?')
    .get(listingId, listingId, vendor.id) as { id: string } | undefined
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found' })

  const media = db.prepare('SELECT id, url FROM listing_media WHERE id = ? AND listing_id = ?')
    .get(mediaId, listing.id) as { id: string; url: string } | undefined
  if (!media) throw createError({ statusCode: 404, statusMessage: 'Media not found' })

  // Delete from disk
  try {
    const diskPath = join(process.cwd(), 'public', media.url)
    unlinkSync(diskPath)
  } catch {
    // File may not exist on disk — continue
  }

  db.prepare('DELETE FROM listing_media WHERE id = ?').run(mediaId)

  return { success: true }
})
