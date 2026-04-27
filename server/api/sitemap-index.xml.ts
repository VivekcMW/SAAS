export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  const base = 'https://moonmart.ai'
  const today = new Date().toISOString().split('T')[0]

  const sitemaps = [
    { loc: `${base}/sitemap.xml`, lastmod: today },
    { loc: `${base}/api/sitemap-comparisons.xml`, lastmod: today },
    { loc: `${base}/api/sitemap-hreflang.xml`, lastmod: today }
  ]

  const entries = sitemaps.map((s) =>
    `  <sitemap>\n    <loc>${s.loc}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`
})
