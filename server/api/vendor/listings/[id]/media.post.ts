/**
 * POST /api/vendor/listings/[id]/media
 * Upload screenshots/media for a vendor listing.
 * Accepts multipart/form-data with files[] field.
 * Uses server/utils/storage.ts — automatically routes to S3 or local disk.
 */
import { requireVendor, getVendorProfileForUser } from '~/server/utils/auth'
import { getDb, makeId } from '~/server/utils/database'
import { readMultipartFormData } from 'h3'
import { extname } from 'node:path'
import { uploadFile } from '~/server/utils/storage'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })

  const listingId = getRouterParam(event, 'id')
  if (!listingId) throw createError({ statusCode: 400, statusMessage: 'Missing listing id' })

  const db = getDb()

  // Verify listing belongs to this vendor
  const listing = db.prepare('SELECT id FROM app_listings WHERE (id = ? OR slug = ?) AND vendor_id = ?')
    .get(listingId, listingId, vendor.id) as { id: string } | undefined
  if (!listing) throw createError({ statusCode: 404, statusMessage: 'Listing not found or access denied' })

  // Ensure media table exists
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

  const formData = await readMultipartFormData(event)
  if (!formData || !formData.length) {
    throw createError({ statusCode: 400, statusMessage: 'No files provided' })
  }

  const uploaded: Array<{ id: string; url: string }> = []
  const now = new Date().toISOString()

  for (const part of formData) {
    if (!part.filename || !part.data) continue
    if (!ALLOWED_TYPES.has(part.type ?? '')) continue
    if (part.data.length > MAX_FILE_SIZE) continue

    const ext = extname(part.filename).toLowerCase() || '.jpg'
    const safe = makeId('img')
    const storageKey = `listings/${listing.id}/${safe}${ext}`

    const { url: publicUrl } = await uploadFile(storageKey, part.data as unknown as Buffer, part.type ?? 'image/jpeg')

    const mediaId = makeId('lm')
    const sortOrder = db.prepare('SELECT COALESCE(MAX(sort_order),0)+1 as n FROM listing_media WHERE listing_id = ?')
      .get(listing.id) as { n: number }

    db.prepare(`
      INSERT INTO listing_media (id, listing_id, url, caption, sort_order, created_at)
      VALUES (?, ?, ?, '', ?, ?)
    `).run(mediaId, listing.id, publicUrl, sortOrder.n, now)

    uploaded.push({ id: mediaId, url: publicUrl })
  }

  if (!uploaded.length) {
    throw createError({ statusCode: 400, statusMessage: 'No valid image files found (max 5MB per file, JPEG/PNG/WebP/GIF only)' })
  }

  return { success: true, uploaded }
})
