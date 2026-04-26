import type { DbAppListing } from './database'
import { getDb } from './database'

export interface MarketplaceApp {
  id: string
  slug: string
  name: string
  logo: string
  provider: string
  description: string
  longDescription: string
  rating: number
  reviewCount: number
  tags: string[]
  pricing: {
    type: 'free' | 'trial' | 'paid' | 'contact'
    value?: number
    period?: string
  }
  category: string
  featured: boolean
  trending: boolean
  sponsored: boolean
  status: 'draft' | 'submitted' | 'published'
}

function mapListing(app: DbAppListing): MarketplaceApp {
  return {
    id: app.id,
    slug: app.slug,
    name: app.name,
    logo: app.logo,
    provider: app.provider,
    description: app.short_description,
    longDescription: app.long_description,
    rating: Number(app.rating),
    reviewCount: Number(app.review_count),
    tags: JSON.parse(app.tags || '[]'),
    pricing: {
      type: app.pricing_type,
      value: app.pricing_value ?? undefined,
      period: app.pricing_period ?? undefined
    },
    category: app.category,
    featured: Boolean(app.featured),
    trending: Boolean(app.trending),
    sponsored: Boolean(app.sponsored),
    status: app.status
  }
}

export interface MarketplaceAppsResult {
  apps: MarketplaceApp[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export function getMarketplaceApps(filters: {
  search?: string
  category?: string
  pricingType?: string
  sortBy?: string
  featured?: boolean
  trending?: boolean
  page?: number
  perPage?: number
  limit?: number
} = {}): MarketplaceAppsResult {
  const db = getDb()
  const conditions = ['status = ?']
  const params: Array<string | number> = ['published']

  if (filters.search) {
    conditions.push('(name LIKE ? OR provider LIKE ? OR short_description LIKE ? OR tags LIKE ?)')
    const value = `%${filters.search.trim()}%`
    params.push(value, value, value, value)
  }

  if (filters.category) {
    conditions.push('category = ?')
    params.push(filters.category)
  }

  if (filters.pricingType) {
    conditions.push('pricing_type = ?')
    params.push(filters.pricingType)
  }

  if (filters.featured === true) {
    conditions.push('featured = 1')
  }

  if (filters.trending === true) {
    conditions.push('trending = 1')
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  let orderBy: string
  switch (filters.sortBy) {
    case 'rating': orderBy = 'rating DESC, review_count DESC, name ASC'; break
    case 'newest': orderBy = 'created_at DESC'; break
    case 'name_asc': orderBy = 'name ASC'; break
    case 'name_desc': orderBy = 'name DESC'; break
    case 'reviews': orderBy = 'review_count DESC, rating DESC'; break
    default: orderBy = 'featured DESC, trending DESC, rating DESC, review_count DESC, name ASC'
  }

  const total = (db.prepare(`SELECT COUNT(*) as n FROM app_listings ${where}`).get(...params) as { n: number }).n

  // Support legacy `limit` for non-paginated internal callers
  if (filters.limit && !filters.page) {
    const rows = db.prepare(`SELECT * FROM app_listings ${where} ORDER BY ${orderBy} LIMIT ?`).all(...params, filters.limit) as DbAppListing[]
    return { apps: rows.map(mapListing), total, page: 1, perPage: filters.limit, totalPages: 1 }
  }

  const perPage = Math.min(48, Math.max(1, filters.perPage || 12))
  const page = Math.max(1, filters.page || 1)
  const offset = (page - 1) * perPage
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const rows = db.prepare(`SELECT * FROM app_listings ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`).all(...params, perPage, offset) as DbAppListing[]

  return { apps: rows.map(mapListing), total, page, perPage, totalPages }
}

export function getMarketplaceAppByIdOrSlug(identifier: string) {
  const db = getDb()
  const row = db.prepare(`
    SELECT *
    FROM app_listings
    WHERE status = 'published' AND (id = ? OR slug = ?)
    LIMIT 1
  `).get(identifier, identifier) as DbAppListing | undefined

  return row ? mapListing(row) : null
}

export function getVendorApps(vendorId: string) {
  const db = getDb()
  const rows = db.prepare(`
    SELECT *
    FROM app_listings
    WHERE vendor_id = ?
    ORDER BY updated_at DESC
  `).all(vendorId) as DbAppListing[]

  return rows.map(mapListing)
}

export function createVendorApp(vendorId: string, payload: {
  name: string
  description: string
  category: string
  pricingType?: 'free' | 'trial' | 'paid' | 'contact'
  pricingValue?: number | null
  pricingPeriod?: string | null
  tags?: string[]
  logo?: string
  provider?: string
}) {
  const db = getDb()
  const now = new Date().toISOString()
  const slugBase = payload.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`
  const id = `app_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

  db.prepare(`
    INSERT INTO app_listings (
      id, vendor_id, slug, name, provider, logo, short_description, long_description,
      category, tags, pricing_type, pricing_value, pricing_period, rating, review_count,
      featured, trending, sponsored, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 'draft', ?, ?)
  `).run(
    id,
    vendorId,
    slug,
    payload.name.trim(),
    payload.provider?.trim() || 'Independent Vendor',
    payload.logo || '/assets/images/placeholder-app-logo.svg',
    payload.description.trim(),
    payload.description.trim(),
    payload.category.trim(),
    JSON.stringify(payload.tags || []),
    payload.pricingType || 'contact',
    payload.pricingValue ?? null,
    payload.pricingPeriod ?? null,
    now,
    now
  )

  return getMarketplaceAppByIdOrSlug(id)
}

export function updateVendorApp(appId: string, vendorId: string, payload: {
  name?: string
  description?: string
  longDescription?: string
  category?: string
  pricingType?: 'free' | 'trial' | 'paid' | 'contact'
  pricingValue?: number | null
  pricingPeriod?: string | null
  tags?: string[]
  logo?: string
  provider?: string
}) {
  const db = getDb()
  const existing = db.prepare('SELECT id FROM app_listings WHERE id = ? AND vendor_id = ?').get(appId, vendorId) as { id: string } | undefined
  if (!existing) return null

  const now = new Date().toISOString()
  const sets: string[] = ['updated_at = ?']
  const values: Array<string | number | null> = [now]

  if (payload.name !== undefined) { sets.push('name = ?'); values.push(payload.name.trim()) }
  if (payload.description !== undefined) { sets.push('short_description = ?'); values.push(payload.description.trim()) }
  if (payload.longDescription !== undefined) { sets.push('long_description = ?'); values.push(payload.longDescription.trim()) }
  if (payload.category !== undefined) { sets.push('category = ?'); values.push(payload.category.trim()) }
  if (payload.pricingType !== undefined) { sets.push('pricing_type = ?'); values.push(payload.pricingType) }
  if (payload.pricingValue !== undefined) { sets.push('pricing_value = ?'); values.push(payload.pricingValue) }
  if (payload.pricingPeriod !== undefined) { sets.push('pricing_period = ?'); values.push(payload.pricingPeriod) }
  if (payload.tags !== undefined) { sets.push('tags = ?'); values.push(JSON.stringify(payload.tags)) }
  if (payload.logo !== undefined) { sets.push('logo = ?'); values.push(payload.logo) }
  if (payload.provider !== undefined) { sets.push('provider = ?'); values.push(payload.provider.trim()) }

  values.push(appId, vendorId)
  db.prepare(`UPDATE app_listings SET ${sets.join(', ')} WHERE id = ? AND vendor_id = ?`).run(...values)

  return db.prepare('SELECT * FROM app_listings WHERE id = ?').get(appId) as DbAppListing
}

export function deleteVendorApp(appId: string, vendorId: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM app_listings WHERE id = ? AND vendor_id = ?').run(appId, vendorId)
  return result.changes > 0
}
