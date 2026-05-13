/**
 * GET /api/seo/features/[slug]
 *
 * Returns apps that include a given feature tag (e.g. sso, api, mobile-app).
 * Used by /features/[slug] programmatic SEO pages.
 */
import { getDb } from '~/server/utils/database'

const KNOWN_FEATURES: Record<string, string> = {
  'sso': 'SSO (Single Sign-On)',
  'api': 'API Access',
  'mobile-app': 'Mobile App',
  'free-trial': 'Free Trial',
  'gdpr-compliant': 'GDPR Compliant',
  'two-factor-auth': 'Two-Factor Authentication',
  'custom-reporting': 'Custom Reporting',
  'data-export': 'Data Export',
  'white-label': 'White Label',
  'zapier-integration': 'Zapier Integration',
  'open-source': 'Open Source',
  'self-hosted': 'Self-Hosted',
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const limit = Math.min(Number(getQuery(event).limit) || 20, 50)

  // The feature search term: "sso" → "SSO", "mobile-app" → "mobile"
  const searchTerm = slug.replace(/-/g, ' ')
  const featureLabel = KNOWN_FEATURES[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const db = getDb()

  // Search in both tags JSON and key_features JSON using LIKE for broad match
  const apps = db.prepare(`
    SELECT id, slug, name, provider, logo, short_description, category,
           rating, review_count, pricing_type, pricing_value, pricing_period,
           tags, key_features
    FROM app_listings
    WHERE status = 'published'
      AND (
        lower(tags) LIKE lower(?) OR
        lower(key_features) LIKE lower(?) OR
        lower(short_description) LIKE lower(?) OR
        lower(long_description) LIKE lower(?)
      )
    ORDER BY rating DESC, review_count DESC
    LIMIT ?
  `).all(
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    limit
  ) as Array<{
    id: string
    slug: string
    name: string
    provider: string | null
    logo: string | null
    short_description: string
    category: string
    rating: number
    review_count: number
    pricing_type: string | null
    pricing_value: number | null
    pricing_period: string | null
    tags: string
    key_features: string
  }>

  if (!apps.length) {
    throw createError({ statusCode: 404, statusMessage: 'No apps found for this feature' })
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=7200')

  return {
    slug,
    featureLabel,
    apps
  }
})
