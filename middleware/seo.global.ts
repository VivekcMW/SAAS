/**
 * SEO Middleware
 * Automatically applies SEO configuration based on route patterns
 */

export default defineNuxtRouteMiddleware((to, from) => {
  const { applySEO, generateCategorySEO, generateEnhancedCategorySEO, generateAppSEO, generateListingSEO, generateHreflangTags, baseSEO, allCategoryKeywords } = useSEO({ path: to.path })
  
  // Extract route information from the to parameter (not useRoute())
  const path = to.path
  const params = to.params
  
  // Apply SEO based on route patterns
  if (path === '/') {
    // Homepage SEO
    applySEO({
      ...baseSEO,
      canonical: 'https://saasworld.com',
      hreflang: generateHreflangTags(''),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SaaSWorld',
        url: 'https://saasworld.com',
        description: 'Global software marketplace for business solutions. Discover and compare the best SaaS tools, enterprise software, and digital solutions.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://saasworld.com/marketplace?search={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        },
        publisher: {
          '@type': 'Organization',
          name: 'SaaSWorld',
          logo: {
            '@type': 'ImageObject',
            url: 'https://saasworld.com/assets/images/logo.png'
          }
        }
      }
    })
  } else if (path === '/marketplace') {
    // Marketplace homepage SEO
    applySEO({
      title: 'Software Marketplace | SaaSWorld - Discover Business Solutions',
      description: 'Explore our comprehensive software marketplace with thousands of business applications, SaaS tools, and enterprise solutions. Compare features, pricing, and reviews to find the perfect software for your needs.',
      keywords: 'software marketplace, business software, saas tools, enterprise applications, software directory, business solutions, digital tools, cloud software',
      canonical: 'https://saasworld.com/marketplace',
      hreflang: generateHreflangTags('/marketplace'),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Software Marketplace',
        description: 'Comprehensive directory of business software and SaaS applications',
        url: 'https://saasworld.com/marketplace',
        mainEntity: {
          '@type': 'ItemList',
          name: 'Business Software Categories',
          numberOfItems: Object.keys(allCategoryKeywords).length
        }
      }
    })
  } else if (path.startsWith('/marketplace/category/')) {
    // Category page SEO
    const categoryId = params.category as string
    if (categoryId && allCategoryKeywords[categoryId as keyof typeof allCategoryKeywords]) {
      const categorySEO = generateCategorySEO(categoryId)
      applySEO({
        ...categorySEO,
        hreflang: generateHreflangTags(path)
      })
    }
  } else if (path.startsWith('/marketplace/app/')) {
    // App detail page SEO
    const appId = params.id as string
    if (appId) {
      // You can extend this with real app data from your database
      const appSEO = generateAppSEO(
        appId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        `Comprehensive information about ${appId.replace(/-/g, ' ')} software`,
        'productivity' // You would determine this from your app data
      )
      applySEO({
        ...appSEO,
        hreflang: generateHreflangTags(path)
      })
    }
  } else if (path === '/about') {
    applySEO({
      title: 'About SaaSWorld - Global Software Marketplace Platform',
      description: 'Learn about SaaSWorld, the leading global marketplace for business software solutions. Our mission is to help businesses discover and compare the best SaaS tools and enterprise applications.',
      keywords: 'about saasworld, software marketplace platform, business software directory, saas comparison platform',
      canonical: 'https://saasworld.com/about',
      hreflang: generateHreflangTags('/about')
    })
  } else if (path === '/contact') {
    applySEO({
      title: 'Contact SaaSWorld - Get in Touch with Our Team',
      description: 'Contact SaaSWorld for support, partnerships, or general inquiries. We\'re here to help you find the perfect software solutions for your business needs.',
      keywords: 'contact saasworld, customer support, business inquiries, software marketplace contact',
      canonical: 'https://saasworld.com/contact',
      hreflang: generateHreflangTags('/contact'),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact SaaSWorld',
        description: 'Get in touch with SaaSWorld team',
        url: 'https://saasworld.com/contact'
      }
    })
  } else if (path === '/features') {
    applySEO({
      title: 'SaaSWorld Features - Comprehensive Software Discovery Platform',
      description: 'Explore SaaSWorld\'s powerful features for discovering, comparing, and selecting business software. Advanced search, detailed comparisons, expert reviews, and more.',
      keywords: 'saasworld features, software comparison features, business software discovery, saas platform capabilities',
      canonical: 'https://saasworld.com/features',
      hreflang: generateHreflangTags('/features')
    })
  } else if (path.startsWith('/blog')) {
    applySEO({
      title: 'SaaSWorld Blog - Software Insights and Business Tips',
      description: 'Stay updated with the latest software trends, business insights, and technology news on the SaaSWorld blog. Expert articles on business software and SaaS solutions.',
      keywords: 'saasworld blog, software blog, business software insights, saas trends, technology news',
      canonical: `https://saasworld.com${path}`,
      hreflang: generateHreflangTags('/blog'),
      ogType: 'blog'
    })
  } else {
    // Default SEO for other pages
    applySEO({
      ...baseSEO,
      canonical: `https://saasworld.com${path}`,
      hreflang: generateHreflangTags(path)
    })
  }
})
