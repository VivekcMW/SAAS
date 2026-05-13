/**
 * Advanced Global SEO Composable for Moonmart
 * Implements comprehensive SEO strategy with lead generation focus
 * Based on the Global Indexing & SEO Strategy
 */

export interface AdvancedSEOConfig {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  jsonLd?: Record<string, any>
  robots?: string
  hreflang?: Record<string, string>
  indexNow?: string[]
  priority?: 'high' | 'medium' | 'low'
  leadGeneration?: {
    cta?: string
    offer?: string
    urgency?: string
  }
}

export const useAdvancedSEO = () => {
  const route = useRoute()
  const { $i18n } = useNuxtApp()
  
  // Enhanced base SEO with global optimization
  const globalSEO = {
    title: 'Moonmart - Global Software Marketplace for Investment Opportunities',
    description: 'Discover high-growth SaaS companies and investment opportunities. Compare 10,000+ software solutions, find emerging startups, and analyze market trends for VCs and business leaders.',
    keywords: 'saas marketplace, software investment, venture capital, startup analysis, business software, enterprise solutions, software comparison, investment opportunities, vc deals, software directory',
    ogImage: '/assets/images/saasworld-global-og.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  }

  // Lead generation focused meta optimization
  const generateLeadGenSEO = (page: string, category?: string): AdvancedSEOConfig => {
    const leadGenTemplates = {
      homepage: {
        title: 'Moonmart - Discover Investment-Ready Software Companies | Global Marketplace',
        description: 'Find your next software investment opportunity. Analyze 10,000+ SaaS companies, track funding rounds, and discover emerging market leaders. Free market intelligence reports.',
        keywords: 'software investment, saas funding, venture capital deals, startup analysis, software market intelligence, investment opportunities',
        leadGeneration: {
          cta: 'Get Free Market Intelligence Report',
          offer: 'Download comprehensive SaaS market analysis',
          urgency: '2025 Market Trends Report - Limited Time'
        }
      },
      marketplace: {
        title: 'Software Marketplace - Investment Intelligence & Business Solutions | Moonmart',
        description: 'Explore 10,000+ software solutions with investment data, growth metrics, and funding information. Find high-potential startups and established market leaders.',
        keywords: 'software marketplace, saas investment, business software, startup funding, growth metrics, software analysis',
        leadGeneration: {
          cta: 'Access Premium Investment Data',
          offer: 'Unlock detailed funding and growth analytics',
          urgency: 'Limited time: Free 7-day trial'
        }
      },
      comparison: {
        title: `Compare ${category || 'Software'} Solutions - Investment Analysis & ROI Calculator`,
        description: `In-depth comparison of ${category || 'software'} solutions with pricing, features, and investment potential. Make data-driven decisions with our comprehensive analysis.`,
        keywords: `${category?.toLowerCase() || 'software'} comparison, roi calculator, investment analysis, software evaluation`,
        leadGeneration: {
          cta: 'Download Comparison Report',
          offer: 'Get detailed feature and pricing analysis',
          urgency: 'Updated weekly with latest data'
        }
      },
      alternatives: {
        title: `Best ${category || 'Software'} Alternatives - 2025 Market Analysis & Reviews`,
        description: `Discover the top ${category || 'software'} alternatives with detailed reviews, pricing comparisons, and investment insights. Find the perfect solution for your business needs.`,
        keywords: `${category?.toLowerCase() || 'software'} alternatives, software reviews, market analysis, business solutions`,
        leadGeneration: {
          cta: 'Get Personalized Recommendations',
          offer: 'Custom software selection based on your needs',
          urgency: 'Free consultation - Book now'
        }
      }
    }

    return leadGenTemplates[page as keyof typeof leadGenTemplates] || globalSEO
  }

  // International SEO with hreflang optimization
  const generateInternationalSEO = (basePath: string, locale: string = 'en'): AdvancedSEOConfig => {
    const locales = ['en', 'es', 'fr', 'de', 'pt']
    const hreflang: Record<string, string> = {}
    
    locales.forEach(loc => {
      hreflang[loc] = `https://moonmart.ai/${loc === 'en' ? '' : `${loc}/`}${basePath.replace(/^\//, '')}`
    })
    
    hreflang['x-default'] = `https://moonmart.ai/${basePath.replace(/^\//, '')}`
    
    // Localized content based on region
    const localizedContent = {
      en: {
        title: 'Global Software Marketplace for Investment Opportunities',
        description: 'Discover high-growth SaaS companies and investment opportunities worldwide.',
        market: 'North America & Global Markets'
      },
      es: {
        title: 'Mercado Global de Software para Oportunidades de Inversión',
        description: 'Descubre empresas SaaS de alto crecimiento y oportunidades de inversión.',
        market: 'América Latina & España'
      },
      fr: {
        title: 'Marché Mondial de Logiciels pour Opportunités d\'Investissement',
        description: 'Découvrez des entreprises SaaS à forte croissance et des opportunités d\'investissement.',
        market: 'France & Marchés Francophones'
      },
      de: {
        title: 'Globaler Software-Marktplatz für Investitionsmöglichkeiten',
        description: 'Entdecken Sie wachstumsstarke SaaS-Unternehmen und Investitionsmöglichkeiten.',
        market: 'Deutschland & DACH-Region'
      },
      pt: {
        title: 'Mercado Global de Software para Oportunidades de Investimento',
        description: 'Descubra empresas SaaS de alto crescimento e oportunidades de investimento.',
        market: 'Brasil & Portugal'
      }
    }

    const content = localizedContent[locale as keyof typeof localizedContent] || localizedContent.en

    return {
      ...globalSEO,
      title: `Moonmart - ${content.title}`,
      description: content.description,
      hreflang,
      canonical: hreflang[locale],
      jsonLd: generateInternationalJsonLd(content.market, locale)
    }
  }

  // Enhanced JSON-LD structured data for different page types
  const generateAdvancedJsonLd = (type: string, data: any) => {
    const baseOrganization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Moonmart',
      url: 'https://moonmart.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://moonmart.ai/assets/images/logo.png',
        width: 800,
        height: 200
      },
      sameAs: [
        'https://twitter.com/saasworld',
        'https://linkedin.com/company/saasworld',
        'https://github.com/saasworld'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-SAAS-WORLD',
        contactType: 'customer service',
        availableLanguage: ['English', 'Spanish', 'French', 'German', 'Portuguese']
      }
    }

    const templates = {
      homepage: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Moonmart',
        url: 'https://moonmart.ai',
        description: globalSEO.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://moonmart.ai/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        },
        publisher: baseOrganization,
        inLanguage: ['en', 'es', 'fr', 'de', 'pt'],
        audience: {
          '@type': 'Audience',
          audienceType: 'Venture Capitalists, Business Decision Makers, Software Buyers'
        }
      },
      marketplace: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Global Software Marketplace',
        description: 'Comprehensive directory of software solutions with investment intelligence',
        url: 'https://moonmart.ai/marketplace',
        numberOfItems: 10000,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: data.apps?.map((app: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: app.name,
            url: `https://moonmart.ai/app/${app.slug}`,
            category: app.category,
            operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
            applicationCategory: 'BusinessApplication'
          }
        })) || []
      },
      comparison: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${data.title} - Software Comparison`,
        description: data.description,
        url: `https://moonmart.ai${route.path}`,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://moonmart.ai'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Comparisons',
              item: 'https://moonmart.ai/comparisons'
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: data.title
            }
          ]
        },
        mainEntity: {
          '@type': 'ComparisonTable',
          name: data.title,
          description: data.description
        }
      },
      software: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: data.name,
        description: data.description,
        url: `https://moonmart.ai/app/${data.slug}`,
        category: data.category,
        operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
        applicationCategory: 'BusinessApplication',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.rating || '4.5',
          ratingCount: data.reviewCount || '100',
          bestRating: '5',
          worstRating: '1'
        },
        offers: {
          '@type': 'Offer',
          price: data.price || '0',
          priceCurrency: 'USD',
          priceValidUntil: '2025-12-31',
          availability: 'https://schema.org/InStock',
          category: 'Software'
        },
        publisher: baseOrganization,
        downloadUrl: data.website,
        screenshot: data.screenshot,
        featureList: data.features || []
      }
    }

    return templates[type as keyof typeof templates] || baseOrganization
  }

  // Core Web Vitals optimization tracking
  const trackCoreWebVitals = () => {
    if (import.meta.client) {
      // Track LCP, FID, CLS for performance monitoring
      const vitals = {
        lcp: 0,
        fid: 0,
        cls: 0
      }

      // You can integrate with actual web vitals tracking here
      // This would connect to your analytics platform
      
      return vitals
    }
    return null
  }

  // IndexNow API integration for instant indexing
  const submitToIndexNow = async (urls: string[]) => {
    if (import.meta.server) return

    try {
      const indexNowKey = 'your-indexnow-api-key' // Store in runtime config
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: 'moonmart.ai',
          key: indexNowKey,
          keyLocation: `https://moonmart.ai/${indexNowKey}.txt`,
          urlList: urls
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('IndexNow submission failed:', error)
      return false
    }
  }

  // Apply advanced SEO with performance optimization
  const applyAdvancedSEO = (config: AdvancedSEOConfig) => {
    // Enhanced meta tags with lead generation focus
    useHead({
      title: config.title,
      meta: [
        { name: 'description', content: config.description },
        { name: 'keywords', content: config.keywords },
        { name: 'robots', content: config.robots || 'index, follow, max-image-preview:large' },
        { name: 'author', content: 'Moonmart' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        
        // Enhanced Open Graph for social sharing
        { property: 'og:title', content: config.title },
        { property: 'og:description', content: config.description },
        { property: 'og:type', content: config.ogType || 'website' },
        { property: 'og:url', content: config.canonical || `https://moonmart.ai${route.path}` },
        { property: 'og:image', content: config.ogImage || '/assets/images/og-default.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'Moonmart' },
        { property: 'og:locale', content: $i18n.locale.value },
        
        // Enhanced Twitter Cards
        { name: 'twitter:card', content: config.twitterCard || 'summary_large_image' },
        { name: 'twitter:title', content: config.title },
        { name: 'twitter:description', content: config.description },
        { name: 'twitter:image', content: config.ogImage || '/assets/images/twitter-card.jpg' },
        { name: 'twitter:site', content: '@Moonmart' },
        { name: 'twitter:creator', content: '@Moonmart' },
        
        // Lead generation meta tags
        { name: 'conversion-focus', content: config.leadGeneration?.cta || 'Sign up for insights' },
        { name: 'value-proposition', content: config.leadGeneration?.offer || 'Free market intelligence' },
        
        // Performance and indexing hints
        { name: 'theme-color', content: '#1a73e8' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'referrer', content: 'origin-when-cross-origin' },
        
        // Mobile optimization
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Moonmart' },
        { name: 'application-name', content: 'Moonmart' },
        
        // Microsoft specific
        { name: 'msapplication-TileColor', content: '#1a73e8' },
        { name: 'msapplication-config', content: '/browserconfig.xml' }
      ],
      link: [
        { rel: 'canonical', href: config.canonical || `https://moonmart.ai${route.path}` },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        
        // Performance optimization
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
        { rel: 'dns-prefetch', href: '//www.googletagmanager.com' },
        
        // Security
        { rel: 'prefetch', href: '/api/sitemap.xml' }
      ],
      script: config.jsonLd ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(config.jsonLd)
        }
      ] : []
    })

    // Apply hreflang tags for international SEO
    if (config.hreflang) {
      const hreflangLinks = Object.entries(config.hreflang).map(([locale, url]) => ({
        rel: 'alternate',
        hreflang: locale,
        href: url
      }))
      
      useHead({
        link: hreflangLinks
      })
    }

    // Submit to IndexNow for rapid indexing
    if (config.indexNow && config.indexNow.length > 0) {
      nextTick(() => {
        submitToIndexNow(config.indexNow!)
      })
    }

    // Track performance metrics
    nextTick(() => {
      trackCoreWebVitals()
    })
  }

  const generateInternationalJsonLd = (market: string, locale: string) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Moonmart',
      url: `https://moonmart.ai/${locale === 'en' ? '' : `${locale}/`}`,
      description: `Global software marketplace serving ${market}`,
      areaServed: market,
      availableLanguage: locale.toUpperCase(),
      audience: {
        '@type': 'Audience',
        audienceType: 'Business Decision Makers, Software Buyers, Investors',
        geographicArea: market
      }
    }
  }

  return {
    globalSEO,
    generateLeadGenSEO,
    generateInternationalSEO,
    generateAdvancedJsonLd,
    applyAdvancedSEO,
    trackCoreWebVitals,
    submitToIndexNow
  }
}
