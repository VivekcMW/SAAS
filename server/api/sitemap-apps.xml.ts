/**
 * Apps Sitemap — DB-driven
 * Generates one <url> entry per published app listing, plus
 * their /pricing and /alternatives sub-pages.
 *
 * Priority tiers:
 *   rating ≥ 4.5  → 0.9
 *   rating ≥ 4.0  → 0.8
 *   else          → 0.6
 */
import { getAllPublishedApps } from '../utils/seoEngine'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=7200, s-maxage=14400')

  const baseUrl = 'https://moonmart.ai'

  let apps: Array<{ slug: string; updated_at: string; rating: number; name: string }> = []
  try {
    apps = getAllPublishedApps()
  } catch { /* DB cold start — fall through to empty sitemap */ }

  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const rows = apps.flatMap(app => {
    const slug = escape(app.slug)
    const lastmod = (app.updated_at || new Date().toISOString()).split('T')[0]
    const priority = app.rating >= 4.5 ? '0.9' : app.rating >= 4.0 ? '0.8' : '0.6'

    return [
      // Main app detail page
      `  <url>
    <loc>${baseUrl}/marketplace/app/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og/app/${slug}</image:loc>
      <image:title>${escape(app.name)}</image:title>
    </image:image>
  </url>`,
      // Pricing sub-page
      `  <url>
    <loc>${baseUrl}/pricing/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
      // Alternatives sub-page
      `  <url>
    <loc>${baseUrl}/alternatives/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
    ]
  })

  // Fallback: if DB empty keep a minimal valid sitemap
  if (rows.length === 0) {
    rows.push(`  <url>\n    <loc>${baseUrl}/marketplace</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>0.8</priority>\n  </url>`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${rows.join('\n')}
</urlset>`
})
