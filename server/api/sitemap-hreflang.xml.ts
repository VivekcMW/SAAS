import { getDb } from '../utils/database'

const LANGS = ['en', 'es', 'fr', 'de', 'pt']
const STATIC_PAGES = [
  '', 'marketplace', 'compare', 'alternatives', 'about', 'methodology', 'press',
  'contact', 'pricing', 'blog', 'features', 'free-tools', 'open-source-alternatives', 'tools-under-50'
]

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  const db = getDb()
  const apps = db.prepare(`
    SELECT slug FROM app_listings
    WHERE status = 'published' AND slug IS NOT NULL
    ORDER BY rating DESC, review_count DESC
    LIMIT 200
  `).all() as Array<{ slug: string }>

  const today = new Date().toISOString().split('T')[0]
  const base = 'https://moonmart.ai'

  const urls: string[] = []

  // Static pages with hreflang
  for (const page of STATIC_PAGES) {
    const pagePath = page ? `/${page}` : '/'
    const links = LANGS.map((lang) => {
      const locPath = lang === 'en' ? pagePath : `/${lang}${pagePath}`
      return `      <xhtml:link rel="alternate" hreflang="${lang}" href="${base}${locPath}"/>`
    }).join('\n')
    urls.push(
      `  <url>\n    <loc>${base}${pagePath}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n${links}\n  </url>`
    )
  }

  // App pages
  for (const app of apps) {
    const path = `/marketplace/app/${app.slug}`
    const links = LANGS.map((lang) => {
      const locPath = lang === 'en' ? path : `/${lang}${path}`
      return `      <xhtml:link rel="alternate" hreflang="${lang}" href="${base}${locPath}"/>`
    }).join('\n')
    urls.push(
      `  <url>\n    <loc>${base}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n${links}\n  </url>`
    )
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`

  return xml
})
