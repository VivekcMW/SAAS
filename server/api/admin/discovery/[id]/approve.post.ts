/**
 * POST /api/admin/discovery/[id]/approve
 * Approves a discovery queue item and creates an app listing.
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

interface ApproveBody {
  overrides?: {
    name?: string
    category?: string
    pricingType?: string
    pricingValue?: number
    shortDescription?: string
    longDescription?: string
    tags?: string[]
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const db = getDb()
  const item = db.prepare('SELECT * FROM discovery_queue WHERE id = ?').get(id) as {
    id: string; website_url: string; extracted_data: string; status: string; listing_id: string | null
  } | undefined

  if (!item) throw createError({ statusCode: 404, statusMessage: 'Discovery item not found' })
  if (item.status === 'approved') throw createError({ statusCode: 409, statusMessage: 'Already approved' })

  const body = await readBody<ApproveBody>(event)
  const extracted = (() => { try { return JSON.parse(item.extracted_data) } catch { return {} } })()
  const overrides = body?.overrides ?? {}

  // Merge extracted data with admin overrides
  const name = (overrides.name || extracted.name || 'Untitled Tool').trim()
  const category = (overrides.category || extracted.category || 'Other').trim()
  const pricingType = overrides.pricingType || extracted.pricing_type || 'contact'
  const pricingValue = overrides.pricingValue ?? extracted.pricing_starts_at ?? null
  const shortDesc = (overrides.shortDescription || extracted.short_description || name).slice(0, 300)
  const longDesc = overrides.longDescription || extracted.long_description || shortDesc
  const tags = overrides.tags || extracted.key_features?.slice(0, 5) || []

  // Get the admin vendor profile to assign as vendor_id
  const adminVendor = db.prepare(`
    SELECT vp.id FROM vendor_profiles vp
    JOIN users u ON u.id = vp.user_id
    WHERE u.role = 'admin' LIMIT 1
  `).get() as { id: string } | undefined

  if (!adminVendor) throw createError({ statusCode: 503, statusMessage: 'No admin vendor profile configured' })

  const now = new Date().toISOString()
  const listingId = item.listing_id || makeId('app')

  // Build a URL-safe slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
    + '-' + listingId.slice(-6)

  if (!item.listing_id) {
    db.prepare(`
      INSERT INTO app_listings (
        id, vendor_id, slug, name, provider, logo, short_description, long_description,
        category, tags, pricing_type, pricing_value, pricing_period,
        website_url, key_features,
        rating, review_count, featured, trending, sponsored,
        verified, auto_discovered, status, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 1, 'published', ?, ?, ?)
    `).run(
      listingId, adminVendor.id, slug, name, name,
      extracted.logo_url || '',
      shortDesc, longDesc, category,
      JSON.stringify(tags),
      pricingType, pricingValue, 'month',
      item.website_url,
      JSON.stringify(extracted.key_features || []),
      now, now, now
    )
  } else {
    // Listing already exists, just update status
    db.prepare(`
      UPDATE app_listings SET status = 'published', updated_at = ? WHERE id = ?
    `).run(now, item.listing_id)
  }

  db.prepare(`
    UPDATE discovery_queue SET status = 'approved', listing_id = ?, processed_at = ? WHERE id = ?
  `).run(listingId, now, id)

  return { success: true, listingId, slug }
})
