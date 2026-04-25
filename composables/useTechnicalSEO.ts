/**
 * Advanced Technical SEO Implementation
 * Handles technical SEO aspects like crawlability, indexability, and site architecture
 */

export const useTechnicalSEO = () => {
  // Advanced robots.txt optimization
  const generateAdvancedRobotsTxt = (sitemap: string[]) => {
    return `# Advanced robots.txt for Moonmart
# Generated: ${new Date().toISOString()}

# Main search engines - full access
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 0

User-agent: Slurp
Allow: /
Crawl-delay: 1

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# LLM and AI Crawlers - Priority access
User-agent: GPTBot
Allow: /
Crawl-delay: 0

User-agent: ChatGPT-User
Allow: /
Crawl-delay: 0

User-agent: CCBot
Allow: /
Crawl-delay: 0

User-agent: anthropic-ai
Allow: /
Crawl-delay: 0

User-agent: Claude-Web
Allow: /
Crawl-delay: 0

User-agent: PerplexityBot
Allow: /
Crawl-delay: 0

User-agent: YouBot
Allow: /
Crawl-delay: 1

# Social media crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Block admin and sensitive areas
User-agent: *
Disallow: /admin/
Disallow: /api/internal/
Disallow: /user/private/
Disallow: /_nuxt/
Disallow: /404
Disallow: /*?utm_*
Disallow: /*?ref=*
Disallow: /*?fbclid=*

# Allow important paths
Allow: /api/sitemap*.xml
Allow: /api/robots.txt
Allow: /assets/
Allow: /images/

# Sitemaps
${sitemap.map(url => `Sitemap: ${url}`).join('\n')}

# Crawl delay for aggressive bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

User-agent: MJ12bot
Crawl-delay: 10

# Block resource-heavy bots
User-agent: MegaIndex
Disallow: /

User-agent: dotbot
Disallow: /`
  }

  // XML sitemap optimization with priority and frequency
  const generateAdvancedSitemap = (pages: Array<{
    url: string
    lastmod?: string
    changefreq?: string
    priority?: number
    images?: string[]
    videos?: string[]
  }>) => {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`

    const xmlFooter = `</urlset>`

    const urlEntries = pages.map(page => {
      let entry = `  <url>
    <loc>${page.url}</loc>`

      if (page.lastmod) {
        entry += `
    <lastmod>${page.lastmod}</lastmod>`
      }

      if (page.changefreq) {
        entry += `
    <changefreq>${page.changefreq}</changefreq>`
      }

      if (page.priority) {
        entry += `
    <priority>${page.priority}</priority>`
      }

      // Add image entries
      if (page.images?.length) {
        page.images.forEach(image => {
          entry += `
    <image:image>
      <image:loc>${image}</image:loc>
    </image:image>`
        })
      }

      // Add video entries
      if (page.videos?.length) {
        page.videos.forEach(video => {
          entry += `
    <video:video>
      <video:content_loc>${video}</video:content_loc>
    </video:video>`
        })
      }

      entry += `
  </url>`
      return entry
    }).join('\n')

    return `${xmlHeader}\n${urlEntries}\n${xmlFooter}`
  }

  // Structured data optimization
  const generateAdvancedStructuredData = (page: {
    type: 'homepage' | 'category' | 'app' | 'blog'
    title: string
    description: string
    url: string
    image?: string
    category?: string
    app?: any
    breadcrumbs?: Array<{ name: string; url: string }>
  }) => {
    const baseStructure = {
      '@context': 'https://schema.org',
      '@graph': []
    }

    // Organization markup
    const organization = {
      '@type': 'Organization',
      '@id': 'https://moonmart.ai/#organization',
      name: 'Moonmart',
      url: 'https://moonmart.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://moonmart.ai/assets/images/logo.png',
        width: 200,
        height: 60
      },
      description: 'Global marketplace for business software solutions',
      foundingDate: '2023',
      founder: {
        '@type': 'Person',
        name: 'Moonmart Team'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-SAAS-WORLD',
        contactType: 'customer service',
        availableLanguage: ['English', 'Spanish', 'French', 'German', 'Portuguese']
      },
      sameAs: [
        'https://twitter.com/saasworld',
        'https://linkedin.com/company/saasworld',
        'https://facebook.com/saasworld'
      ]
    }

    // Website markup
    const website = {
      '@type': 'WebSite',
      '@id': 'https://moonmart.ai/#website',
      url: 'https://moonmart.ai',
      name: 'Moonmart',
      publisher: { '@id': 'https://moonmart.ai/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://moonmart.ai/marketplace?search={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }

    // Add base structures
    baseStructure['@graph'].push(organization, website)

    // Page-specific markup
    switch (page.type) {
      case 'homepage':
        baseStructure['@graph'].push({
          '@type': 'WebPage',
          '@id': `${page.url}#webpage`,
          url: page.url,
          name: page.title,
          description: page.description,
          isPartOf: { '@id': 'https://moonmart.ai/#website' },
          about: { '@id': 'https://moonmart.ai/#organization' },
          mainEntity: {
            '@type': 'ItemList',
            name: 'Software Categories',
            numberOfItems: 8,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Project Management' },
              { '@type': 'ListItem', position: 2, name: 'CRM & Sales' },
              { '@type': 'ListItem', position: 3, name: 'Marketing & Advertising' },
              { '@type': 'ListItem', position: 4, name: 'Finance & Accounting' },
              { '@type': 'ListItem', position: 5, name: 'HR & Recruitment' },
              { '@type': 'ListItem', position: 6, name: 'Design & Creative' },
              { '@type': 'ListItem', position: 7, name: 'IT & Development' },
              { '@type': 'ListItem', position: 8, name: 'E-commerce' }
            ]
          }
        })
        break

      case 'app':
        if (page.app) {
          baseStructure['@graph'].push({
            '@type': 'SoftwareApplication',
            '@id': `${page.url}#software`,
            name: page.app.name,
            description: page.app.description,
            url: page.url,
            category: page.category,
            operatingSystem: ['Web Browser', 'Windows', 'macOS', 'Linux', 'iOS', 'Android'],
            applicationCategory: 'BusinessApplication',
            offers: {
              '@type': 'Offer',
              price: page.app.price || '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock'
            },
            aggregateRating: page.app.rating ? {
              '@type': 'AggregateRating',
              ratingValue: page.app.rating,
              ratingCount: page.app.reviewCount || 100,
              bestRating: 5,
              worstRating: 1
            } : undefined,
            featureList: page.app.features || []
          })
        }
        break

      case 'category':
        baseStructure['@graph'].push({
          '@type': 'CollectionPage',
          '@id': `${page.url}#collection`,
          name: page.title,
          description: page.description,
          url: page.url,
          mainEntity: {
            '@type': 'ItemList',
            name: `${page.category} Software Solutions`,
            description: `Comprehensive directory of ${page.category?.toLowerCase()} tools and applications`
          }
        })
        break
    }

    // Breadcrumb markup
    if (page.breadcrumbs?.length) {
      baseStructure['@graph'].push({
        '@type': 'BreadcrumbList',
        itemListElement: page.breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url
        }))
      })
    }

    return baseStructure
  }

  // Internal linking optimization
  const generateInternalLinkSuggestions = (currentPage: string, category?: string) => {
    const linkSuggestions = {
      contextual: [
        {
          anchor: 'project management software',
          url: '/marketplace/project-management',
          relevance: 'high'
        },
        {
          anchor: 'business software solutions',
          url: '/marketplace',
          relevance: 'medium'
        },
        {
          anchor: 'software comparison',
          url: '/compare',
          relevance: 'medium'
        }
      ],
      navigational: [
        {
          anchor: 'Browse all categories',
          url: '/marketplace',
          position: 'content-bottom'
        },
        {
          anchor: 'Submit your software',
          url: '/submit',
          position: 'sidebar'
        },
        {
          anchor: 'Read our guides',
          url: '/guides',
          position: 'footer'
        }
      ],
      related: category ? [
        {
          anchor: `Top ${category} tools`,
          url: `/marketplace/${category}/top-rated`,
          relevance: 'high'
        },
        {
          anchor: `${category} alternatives`,
          url: `/marketplace/${category}/alternatives`,
          relevance: 'medium'
        }
      ] : []
    }

    return linkSuggestions
  }

  // Canonical URL optimization
  const generateCanonicalStrategy = (url: string, params?: Record<string, string>) => {
    // Remove tracking parameters and normalize URL
    const baseUrl = url.split('?')[0].toLowerCase()
    
    // Handle pagination
    if (params?.page && parseInt(params.page) > 1) {
      return `${baseUrl}?page=${params.page}`
    }

    // Handle sorting/filtering that should be indexed
    const indexableParams = ['category', 'sort', 'filter']
    const canonicalParams = Object.entries(params || {})
      .filter(([key]) => indexableParams.includes(key))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    return canonicalParams ? `${baseUrl}?${canonicalParams}` : baseUrl
  }

  // Meta robots optimization
  const generateMetaRobots = (page: {
    type: string
    isPublic: boolean
    hasContent: boolean
    isLatest: boolean
  }) => {
    const directives = []

    // Index/noindex
    if (page.isPublic && page.hasContent) {
      directives.push('index')
    } else {
      directives.push('noindex')
    }

    // Follow/nofollow
    directives.push('follow')

    // Additional directives
    if (page.type === 'archive' || !page.isLatest) {
      directives.push('noarchive')
    }

    if (page.type === 'search-results') {
      directives.push('nosnippet')
    }

    return directives.join(', ')
  }

  // Site architecture optimization
  const generateSiteArchitecture = () => {
    return {
      maxDepth: 3, // No page should be more than 3 clicks from homepage
      categoryStructure: {
        homepage: {
          depth: 0,
          children: ['marketplace', 'about', 'pricing', 'blog']
        },
        marketplace: {
          depth: 1,
          children: ['project-management', 'crm', 'marketing', 'accounting']
        },
        category: {
          depth: 2,
          children: ['subcategories', 'apps', 'comparisons']
        },
        app: {
          depth: 3,
          children: ['reviews', 'alternatives', 'pricing']
        }
      },
      linkingStrategy: {
        homepage: 'hub - links to all main categories',
        category: 'cluster - internal links to related categories and top apps',
        app: 'spoke - links back to category and related apps'
      }
    }
  }

  return {
    generateAdvancedRobotsTxt,
    generateAdvancedSitemap,
    generateAdvancedStructuredData,
    generateInternalLinkSuggestions,
    generateCanonicalStrategy,
    generateMetaRobots,
    generateSiteArchitecture
  }
}
