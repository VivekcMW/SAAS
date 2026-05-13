/**
 * GET /api/sitemap-features.xml
 *
 * XML sitemap for /features/[slug] pages.
 * Covers known feature slugs.
 */

const BASE = process.env.SITE_URL || 'https://moonmart.ai'

const FEATURE_SLUGS = [
  'sso',
  'api',
  'mobile-app',
  'free-trial',
  'gdpr-compliant',
  'two-factor-auth',
  'custom-reporting',
  'data-export',
  'white-label',
  'zapier-integration',
  'open-source',
  'self-hosted',
  'saml',
  'audit-log',
  'role-based-access',
]

export default defineEventHandler((event) => {
  const now = new Date().toISOString().split('T')[0]

  const urls = FEATURE_SLUGS.map((slug) => `
  <url>
    <loc>${BASE}/features/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  return xml
})
