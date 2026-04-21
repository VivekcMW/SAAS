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

export function getMarketplaceApps(filters: { search?: string, category?: string, limit?: number } = {}) {
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

  let sql = `
    SELECT *
    FROM app_listings
    WHERE ${conditions.join(' AND ')}
    ORDER BY featured DESC, trending DESC, rating DESC, review_count DESC, name ASC
  `

  if (filters.limit) {
    sql += ' LIMIT ?'
    params.push(filters.limit)
  }

  const rows = db.prepare(sql).all(...params) as DbAppListing[]
  return rows.map(mapListing)
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
