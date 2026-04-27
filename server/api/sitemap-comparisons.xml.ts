import { getDb } from '../utils/database'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  const db = getDb()

  // Top 60 apps by review count for comparison pages
  const apps = db.prepare(`
    SELECT slug FROM app_listings
    WHERE status = 'published' AND slug IS NOT NULL AND slug != ''
    ORDER BY review_count DESC
    LIMIT 60
  `).all() as Array<{ slug: string }>

  const slugs = apps.map((a) => a.slug)
  const today = new Date().toISOString().split('T')[0]

  const urls: string[] = []

  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      urls.push(
        `  <url>\n    <loc>https://moonmart.ai/compare/${slugs[i]}-vs-${slugs[j]}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      )
      // Stop at 5000 to keep sitemap manageable
      if (urls.length >= 5000) break
    }
    if (urls.length >= 5000) break
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return xml
})
