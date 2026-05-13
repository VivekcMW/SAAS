/**
 * GET /api/vendor/listings/[id]/media
 * Returns all media items for a vendor listing (vendor only).
 */
import { requireVendor, getVendorProfileForUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })

  const listingId = getRouterParam(event, 'id')
  if (!listingId) throw createError({ statusCode: 400, statusMessage: 'Missing listing id' })

  const db = getDb()

  const listing = db.prepare('SELECT id FROM app_listings WHERE (id = ? OR slug = ?) AND vendor_id = ?')
    .get(listingId, listingId, vendor.id) as { id: string } | undefined
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found or access denied' })

  db.exec(`
    CREATE TABLE IF NOT EXISTS listing_media (
      id          TEXT PRIMARY KEY,
      listing_id  TEXT NOT NULL,
      url         TEXT NOT NULL,
      caption     TEXT NOT NULL DEFAULT '',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_lm_listing ON listing_media(listing_id);
  `)

  const media = db.prepare('SELECT * FROM listing_media WHERE listing_id = ? ORDER BY sort_order ASC')
    .all(listing.id)

  return { media }
})
