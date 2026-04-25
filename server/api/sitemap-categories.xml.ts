/**
 * Categories Sitemap Generation
 * Dedicated sitemap for all marketplace categories
 */

import { allCategoryKeywords } from '~/seo/keywords/index'

export default defineEventHandler(async (event) => {
  const baseUrl = 'https://moonmart.ai'
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Generate all category and subcategory pages
  const categoryPages: Array<{ url: string; priority: string; changefreq: string; lastmod: string }> = []
  
  Object.entries(allCategoryKeywords).forEach(([categoryId, categoryData]) => {
    // Main category page
    categoryPages.push({
      url: `/marketplace/category/${categoryId}`,
      priority: '0.9',
      changefreq: 'daily',
      lastmod: currentDate
    })

    // Subcategory pages
    Object.entries(categoryData.subcategories).forEach(([subcategoryKey, subcategoryData]) => {
      categoryPages.push({
        url: subcategoryData.path,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: currentDate
      })
    })
  })

  // Generate localized category pages
  const locales = ['en', 'es', 'fr', 'de', 'pt']
  const localizedPages: Array<{ url: string; priority: string; changefreq: string; lastmod: string }> = []

  locales.forEach(locale => {
    if (locale !== 'en') {
      categoryPages.forEach(page => {
        localizedPages.push({
          url: `/${locale}${page.url}`,
          priority: page.priority,
          changefreq: page.changefreq,
          lastmod: page.lastmod
        })
      })
    }
  })

  const allPages = [...categoryPages, ...localizedPages]

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(page => {
  const fullUrl = `${baseUrl}${page.url}`
  
  // Generate hreflang alternates for international SEO
  const hreflangAlternates = !page.url.startsWith('/en/') && !page.url.startsWith('/es/') && 
                            !page.url.startsWith('/fr/') && !page.url.startsWith('/de/') && 
                            !page.url.startsWith('/pt/') ? 
    locales.map(locale => 
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${baseUrl}${locale === 'en' ? '' : `/${locale}`}${page.url}" />`
    ).join('\n') : ''

  return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${hreflangAlternates ? '\n' + hreflangAlternates : ''}
  </url>`
}).join('\n')}
</urlset>`

  // Set appropriate headers
  setHeader(event, 'Content-Type', 'application/xml')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  
  return sitemap
})
