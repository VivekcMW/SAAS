export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  const base = 'https://moonmart.ai'
  const today = new Date().toISOString().split('T')[0]

  const sitemaps = [
    // Core pages
    { loc: `${base}/sitemap.xml`, lastmod: today },
    // App listings (DB-driven, updated every 2 h)
    { loc: `${base}/api/sitemap-apps.xml`, lastmod: today },
    // Comparison pages
    { loc: `${base}/api/sitemap-comparisons.xml`, lastmod: today },
    // Alternatives pages
    { loc: `${base}/api/sitemap-alternatives.xml`, lastmod: today },
    // Blog & guides
    { loc: `${base}/api/sitemap-blog.xml`, lastmod: today },
    // Hreflang (i18n)
    { loc: `${base}/api/sitemap-hreflang.xml`, lastmod: today },
    // Best [category]-software pages
    { loc: `${base}/api/sitemap-best.xml`, lastmod: today },
    // Features pages
    { loc: `${base}/api/sitemap-features.xml`, lastmod: today },
  ]

  const entries = sitemaps.map((s) =>
    `  <sitemap>\n    <loc>${s.loc}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`
})
