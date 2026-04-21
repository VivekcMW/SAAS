/**
 * Advanced Robots.txt Generation for SaasWorld
 * Implements strategic crawling directives for optimal indexing
 * Based on the Global SEO Strategy guidelines
 */

export default defineEventHandler(async (event) => {
  const baseUrl = 'https://saasworld.com'
  
  const robotsTxt = `# SaaSWorld Robots.txt - Optimized for Global SEO Strategy
# Generated: ${new Date().toISOString()}

# Allow all crawlers by default
User-agent: *
Allow: /

# Strategic disallows for optimal crawling budget
Disallow: /admin/
Disallow: /api/private/
Disallow: /dashboard/
Disallow: /_nuxt/
Disallow: /.*$

# Prevent crawling of filtered and search URLs to avoid duplicate content
Disallow: /*?utm_*
Disallow: /*?ref=*
Disallow: /*?source=*
Disallow: /*?campaign=*
Disallow: /search?*
Disallow: /filter?*
Disallow: /*?sort=*
Disallow: /*?page=*
Disallow: /*?limit=*

# Block internal tracking and session URLs
Disallow: /*?sessionId=*
Disallow: /*?token=*
Disallow: /*?auth=*
Disallow: /*?preview=*
Disallow: /*?draft=*

# Priority crawling for high-value content
Allow: /marketplace/
Allow: /category/
Allow: /app/
Allow: /comparison/
Allow: /alternatives/
Allow: /insights/
Allow: /reports/
Allow: /guides/

# Optimize crawl budget for international content
Allow: /en/
Allow: /es/
Allow: /fr/
Allow: /de/
Allow: /pt/

# General crawl rate optimization (1 second delay)
Crawl-delay: 1

# Google-specific optimizations
User-agent: Googlebot
Allow: /api/public/
Allow: /api/sitemap*
Crawl-delay: 0

# Bing optimizations
User-agent: Bingbot
Allow: /api/public/
Allow: /api/sitemap*
Crawl-delay: 1

# Yandex optimizations (for international markets)
User-agent: Yandex
Allow: /api/public/
Crawl-delay: 2

# Baidu optimizations (for potential Asian expansion)
User-agent: Baiduspider
Allow: /api/public/
Crawl-delay: 3

# LLM and AI Crawlers - Strategic for AI training and visibility
User-agent: GPTBot
Allow: /
Crawl-delay: 1

User-agent: ChatGPT-User
Allow: /
Crawl-delay: 1

User-agent: CCBot
Allow: /
Crawl-delay: 1

User-agent: anthropic-ai
Allow: /
Crawl-delay: 1

User-agent: Claude-Web
Allow: /
Crawl-delay: 1

User-agent: PerplexityBot
Allow: /
Crawl-delay: 1

User-agent: YouBot
Allow: /
Crawl-delay: 1

# Block aggressive crawlers that don't provide value
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# Block social media bots from private areas but allow public content
User-agent: facebookexternalhit
Disallow: /admin/
Disallow: /dashboard/
Allow: /

User-agent: Twitterbot
Disallow: /admin/
Disallow: /dashboard/
Allow: /

User-agent: LinkedInBot
Disallow: /admin/
Disallow: /dashboard/
Allow: /

# Allow other legitimate crawlers with restrictions
User-agent: Slurp
Crawl-delay: 2

User-agent: DuckDuckBot
Crawl-delay: 1

# Archive crawlers
User-agent: ia_archiver
Crawl-delay: 5

# Comprehensive sitemap declarations
Sitemap: ${baseUrl}/api/sitemap.xml
Sitemap: ${baseUrl}/api/sitemap-news.xml
Sitemap: ${baseUrl}/api/sitemap-images.xml
Sitemap: ${baseUrl}/api/sitemap-hreflang.xml

# Additional specific sitemaps for different content types
Sitemap: ${baseUrl}/api/sitemap-categories.xml
Sitemap: ${baseUrl}/api/sitemap-comparisons.xml
Sitemap: ${baseUrl}/api/sitemap-alternatives.xml
Sitemap: ${baseUrl}/api/sitemap-apps.xml

# Host directive for canonical domain
Host: ${baseUrl}

# Clean URLs directive
Clean-param: utm_source&utm_medium&utm_campaign&utm_term&utm_content
Clean-param: ref&source&campaign
Clean-param: sessionId&token&preview&draft`

  // Set appropriate headers
  setHeader(event, 'Content-Type', 'text/plain')
  setHeader(event, 'Cache-Control', 'public, max-age=86400') // Cache for 24 hours
  
  return robotsTxt
})
