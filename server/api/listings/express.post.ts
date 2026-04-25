/**
 * POST /api/listings/express
 * Body: {
 *   url: string
 *   name: string
 *   tagline: string
 *   category: string
 *   pricingType: 'free' | 'freemium' | 'paid' | 'contact'
 *   pricingValue?: number | null
 *   logo?: string
 *   provider?: string
 *   keywords?: string[]
 *   publish?: boolean   // false = save as draft
 * }
 *
 * Creates a new app listing in one shot from the Express onboarding flow.
 * Listings start as `draft` by default; the vendor can publish later from
 * their dashboard. Designed for the "List in 60 seconds" experience.
 */
import { createVendorApp } from '~/server/utils/apps'
import { getDb } from '~/server/utils/database'

interface ExpressBody {
  url?: string
  name?: string
  tagline?: string
  category?: string
  categories?: string[]
  pricingType?: 'free' | 'freemium' | 'paid' | 'contact'
  pricingValue?: number | null
  contactEmail?: string
  logo?: string
  provider?: string
  keywords?: string[]
  publish?: boolean
}

// Map onboarding pricing model to the DB enum
function mapPricing(t: ExpressBody['pricingType']): 'free' | 'trial' | 'paid' | 'contact' {
  if (t === 'free') return 'free'
  if (t === 'freemium') return 'trial'
  if (t === 'paid') return 'paid'
  return 'contact'
}

/**
 * Lazily provision the anonymous Express user + vendor profile on first use,
 * so FK constraints on app_listings.vendor_id are satisfied without auth.
 */
function ensureExpressVendor(): string {
  const db = getDb()
  const vendorId = 'vendor_express_anonymous'
  const userId = 'user_express_anonymous'
  const now = new Date().toISOString()

  const existing = db.prepare('SELECT id FROM vendor_profiles WHERE id = ?').get(vendorId) as { id: string } | undefined
  if (existing) return vendorId

  const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(userId) as { id: string } | undefined
  if (!userExists) {
    db.prepare(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, full_name, role, plan, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      'express@moonmart.local',
      '!disabled',
      'Express',
      'Listing',
      'Express Listing',
      'vendor',
      'Professional',
      now,
      now
    )
  }

  db.prepare(`
    INSERT INTO vendor_profiles (id, user_id, company_name, company_slug, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(vendorId, userId, 'Express Listings', 'express-listings', 'active', now, now)

  return vendorId
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ExpressBody>(event)

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }
  if (!body?.tagline?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Tagline is required' })
  }

  // Normalize categories: prefer the new array, fall back to legacy single field
  let rawCategoryList: string[] = []
  if (body.categories?.length) rawCategoryList = body.categories
  else if (body.category) rawCategoryList = [body.category]
  const categoryList = rawCategoryList.map(c => c.trim()).filter(Boolean)
  if (categoryList.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'At least one category is required' })
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (body.pricingType === 'contact') {
    if (!body.contactEmail?.trim() || !EMAIL_RE.test(body.contactEmail.trim())) {
      throw createError({ statusCode: 400, statusMessage: 'A valid sales contact email is required for Contact-us pricing' })
    }
  }

  const vendorId = ensureExpressVendor()

  // Combined tag list = user keywords + secondary categories (cat:name)
  const primaryCategory = categoryList[0]
  const secondaryCats = categoryList.slice(1).map(c => `cat:${c}`)
  const combinedTags = [...(body.keywords ?? []), ...secondaryCats].slice(0, 16)

  // Append contact email to description for Contact-us pricing so it surfaces on the listing
  let description = body.tagline.trim()
  if (body.pricingType === 'contact' && body.contactEmail) {
    description = `${description}\n\nContact sales: ${body.contactEmail.trim()}`
  }

  // createVendorApp inserts a draft and tries to fetch via published-only query;
  // we ignore its return value and re-fetch after we (optionally) flip status.
  const created = createVendorApp(vendorId, {
    name: body.name.trim(),
    description,
    category: primaryCategory,
    pricingType: mapPricing(body.pricingType),
    pricingValue: body.pricingValue ?? null,
    pricingPeriod: body.pricingType === 'paid' ? 'month' : null,
    tags: combinedTags,
    logo: body.logo,
    provider: body.provider
  })

  // Locate the row by latest insertion for this vendor (handles draft case where
  // the helper above returned null because it only fetches published rows).
  const db = getDb()
  let row = created as { id: string; slug: string } | null
  if (!row) {
    row = db.prepare(`
      SELECT id, slug FROM app_listings
      WHERE vendor_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(vendorId) as { id: string; slug: string } | undefined ?? null
  }

  if (!row) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create listing' })
  }

  if (body.publish) {
    db.prepare('UPDATE app_listings SET status = ?, updated_at = ? WHERE id = ?')
      .run('published', new Date().toISOString(), row.id)
  }

  return {
    ok: true,
    listing: { id: row.id, slug: row.slug },
    url: `/marketplace/app/${row.slug || row.id}`,
    status: body.publish ? 'published' : 'draft'
  }
})
