/**
 * GET /api/sitemap-best.xml
 *
 * XML sitemap for all /best/[category]-software pages.
 */
import { getDb } from '~/server/utils/database'

const BASE = process.env.SITE_URL || 'https://moonmart.ai'

export default defineEventHandler(async (event) => {
  const db = getDb()

  const cats = db.prepare(`
    SELECT category, COUNT(*) AS app_count
    FROM app_listings
    WHERE status = 'published'
    GROUP BY category
    ORDER BY app_count DESC
  `).all() as Array<{ category: string; app_count: number }>

  const now = new Date().toISOString().split('T')[0]

  const urls = cats.map((c) => {
    const catSlug = c.category.toLowerCase().replace(/\s+/g, '-')
    return `
  <url>
    <loc>${BASE}/best/${catSlug}-software</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=43200')

  return xml
})
