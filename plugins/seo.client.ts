/**
 * SEO Plugin for automatic SEO optimization
 * Automatically applies SEO best practices across the application
 */

export default defineNuxtPlugin((nuxtApp) => {
  // Add global SEO meta tags
  useHead({
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'msapplication-TileColor', content: '#1a73e8' },
      { name: 'theme-color', content: '#1a73e8' },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'googlebot', content: 'index, follow' },
      { name: 'bingbot', content: 'index, follow' },
      { name: 'slurp', content: 'index, follow' },
      { property: 'og:site_name', content: 'SaaSWorld' },
      { property: 'og:locale', content: 'en_US' },
      { name: 'twitter:site', content: '@SaaSWorld' },
      { name: 'twitter:creator', content: '@SaaSWorld' },
      { name: 'generator', content: 'Nuxt.js' },
      { name: 'referrer', content: 'origin-when-cross-origin' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
    ],
    link: [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
      { rel: 'dns-prefetch', href: '//www.googletagmanager.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/site.webmanifest' }
    ]
  })

  // Add global structured data for organization
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'SaaSWorld',
          url: 'https://saasworld.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://saasworld.com/assets/images/logo.png',
            width: 400,
            height: 400
          },
          description: 'Global software marketplace for business solutions. Discover and compare the best SaaS tools, enterprise software, and digital solutions for your business needs.',
          foundingDate: '2024',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'US'
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'support@saasworld.com',
            url: 'https://saasworld.com/contact'
          },
          sameAs: [
            'https://twitter.com/saasworld',
            'https://linkedin.com/company/saasworld',
            'https://facebook.com/saasworld'
          ],
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://saasworld.com/marketplace?search={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
          }
        })
      }
    ]
  })

  // Router middleware for automatic SEO and analytics tracking
  nuxtApp.hook('page:start', () => {
    // Add page loading performance mark
    if (process.client && typeof performance !== 'undefined') {
      performance.mark('page-start')
    }
  })

  nuxtApp.hook('page:finish', () => {
    // Add page loading performance mark
    if (process.client && typeof performance !== 'undefined') {
      performance.mark('page-end')
      // Guard against missing 'page-start' (happens on initial hydration)
      if (performance.getEntriesByName('page-start').length) {
        performance.measure('page-load', 'page-start', 'page-end')
      }
    }

    // SEO tracking for analytics
    const route = useRoute()
    const currentPath = route.path
    
    // Determine page type and category from route for SEO analytics
    let pageType = 'general'
    let category = ''
    
    if (currentPath.includes('/list-product') || currentPath.includes('/onboarding')) {
      pageType = 'listing'
    } else if (currentPath.includes('/categories/') || currentPath.includes('/marketplace/')) {
      pageType = 'category'
      // Extract category from path
      const pathSegments = currentPath.split('/')
      const categoryIndex = pathSegments.findIndex(segment => 
        segment === 'categories' || segment === 'marketplace'
      )
      if (categoryIndex !== -1 && pathSegments[categoryIndex + 1]) {
        category = pathSegments[categoryIndex + 1]
      }
    } else if (currentPath.includes('/app/')) {
      pageType = 'product'
    }
    
    // Track for SEO analytics (in production, this would send to analytics service)
    console.log('SEO Page Tracking:', {
      path: currentPath,
      pageType,
      category,
      title: document?.title || '',
      timestamp: new Date().toISOString()
    })
  })

  // Provide SEO utilities globally
  return {
    provide: {
      seoTracking: {
        trackEvent: (eventName: string, data: any) => {
          if (process.client) {
            console.log('SEO Event:', eventName, data)
            // In production, this would send to analytics service like Google Analytics
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', eventName, data)
            }
          }
        },
        trackConversion: (type: string, category?: string, value?: number) => {
          if (process.client) {
            const conversionData = {
              conversion_type: type,
              category: category || 'general',
              value: value || 1,
              timestamp: new Date().toISOString()
            }
            console.log('SEO Conversion:', conversionData)
            
            // Track conversion in analytics
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'conversion', conversionData)
            }
          }
        },
        trackKeywordPerformance: (keyword: string, position: number, impressions: number) => {
          if (process.client) {
            const keywordData = {
              keyword,
              position,
              impressions,
              page: window.location.pathname,
              timestamp: new Date().toISOString()
            }
            console.log('SEO Keyword Performance:', keywordData)
            
            // In production, send to SEO analytics service
          }
        }
      }
    }
  }
})
