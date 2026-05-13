/**
 * GET /api/sitemap-alternatives.xml
 * One <url> per published app's /alternatives/[slug] page.
 */
import { getAllPublishedApps } from '../utils/seoEngine'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=7200, s-maxage=14400')

  const base = 'https://moonmart.ai'
  let apps: Array<{ slug: string; updated_at: string; rating: number }> = []
  try { apps = getAllPublishedApps() } catch { /* cold start */ }

  const escape = (s: string) => s.replace(/&/g, '&amp;')

  const rows = apps.map(app => {
    const lastmod = (app.updated_at || new Date().toISOString()).split('T')[0]
    return `  <url>
    <loc>${base}/alternatives/${escape(app.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  })

  if (rows.length === 0) {
    rows.push(`  <url>\n    <loc>${base}/alternatives</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>0.6</priority>\n  </url>`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join('\n')}
</urlset>`
})
