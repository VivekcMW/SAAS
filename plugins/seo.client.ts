/**
 * SEO Plugin for automatic SEO optimization
 * Automatically applies SEO best practices across the application
 */

const CONSENT_KEY = 'mm_consent_v1'

/** Returns true only if the user has explicitly accepted analytics cookies. */
function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.analytics === true
  } catch {
    return false
  }
}

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
      { property: 'og:site_name', content: 'Moonmart' },
      { property: 'og:locale', content: 'en_US' },
      { name: 'twitter:site', content: '@Moonmart' },
      { name: 'twitter:creator', content: '@Moonmart' },
      { name: 'generator', content: 'Nuxt.js' },
      { name: 'referrer', content: 'origin-when-cross-origin' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
    ],
    link: [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
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
          name: 'Moonmart',
          url: 'https://moonmart.ai',
          logo: {
            '@type': 'ImageObject',
            url: 'https://moonmart.ai/assets/images/logo.png',
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
            email: 'support@moonmart.ai',
            url: 'https://moonmart.ai/contact'
          },
          sameAs: [
            'https://twitter.com/moonmart',
            'https://linkedin.com/company/moonmart',
            'https://facebook.com/moonmart'
          ],
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://moonmart.ai/marketplace?search={search_term_string}'
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
    if (import.meta.client && typeof performance !== 'undefined') {
      performance.mark('page-start')
    }
  })

  nuxtApp.hook('page:finish', () => {
    // Add page loading performance mark
    if (import.meta.client && typeof performance !== 'undefined') {
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
    
    // Only send analytics events when the user has consented
    if (hasAnalyticsConsent() && typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'page_view', {
        page_path: currentPath,
        page_type: pageType,
        page_category: category,
        page_title: document?.title || ''
      })
    }
  })

  // Provide SEO utilities globally
  return {
    provide: {
      seoTracking: {
        trackEvent: (eventName: string, data: any) => {
          if (import.meta.client && hasAnalyticsConsent()) {
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', eventName, data)
            }
          }
        },
        trackConversion: (type: string, category?: string, value?: number) => {
          if (import.meta.client && hasAnalyticsConsent()) {
            const conversionData = {
              conversion_type: type,
              category: category || 'general',
              value: value || 1,
              timestamp: new Date().toISOString()
            }
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'conversion', conversionData)
            }
          }
        },
        trackKeywordPerformance: (_keyword: string, _position: number, _impressions: number) => {
          // Internal metric — no external call needed
        }
      }
    }
  }
})
