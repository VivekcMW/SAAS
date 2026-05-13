/**
 * SEO Composable for Moonmart
 * Provides comprehensive SEO management including meta tags, structured data, and Open Graph
 */

import type { CategoryKeywords } from '~/seo/keywords/types'
import { allCategoryKeywords, globalKeywords, generateMetaKeywords, generatePageTitle, generateMetaDescription, getKeywordsForCategory } from '~/seo/keywords/index'
import { getCategoryKeywords, isValidCategory } from '~/utils/categoryMapping'

export interface SEOConfig {
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
}

export const useSEO = (routeContext?: { path: string }) => {
  // Get route either from parameter (middleware) or useRoute (component)
  let route: { path: string }
  if (routeContext) {
    route = routeContext
  } else if (import.meta.client) {
    route = useRoute()
  } else {
    route = { path: '' }
  }
  
  const { $i18n } = useNuxtApp()
  
  // Base SEO configuration
  const baseSEO = {
    title: 'Moonmart - Global Software Marketplace for Business Solutions',
    description: 'Discover and compare the best business software solutions worldwide. Find SaaS tools, enterprise software, and digital solutions for your business needs with expert reviews and comparisons.',
    keywords: 'saas marketplace, business software, enterprise solutions, software directory, digital tools, cloud applications, business applications, software comparison, saas platform, global software marketplace',
    ogImage: '/assets/images/og-image.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow'
  }

  // Generate category-specific SEO
  const generateCategorySEO = (categoryId: string, subcategoryName?: string): SEOConfig => {
    const categoryKeywords = allCategoryKeywords[categoryId as keyof typeof allCategoryKeywords]
    
    if (!categoryKeywords) {
      return baseSEO
    }

    const title = generatePageTitle(categoryKeywords.category, subcategoryName)
    const description = generateMetaDescription(categoryKeywords.category, subcategoryName)
    const keywords = generateMetaKeywords(categoryId)

    return {
      title,
      description,
      keywords,
      ogImage: `/assets/images/categories/${categoryId}-og.jpg`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      robots: 'index, follow',
      canonical: `https://moonmart.ai${route.path}`,
      jsonLd: generateCategoryJsonLd(categoryKeywords, subcategoryName)
    }
  }

  // Generate structured data for categories
  const generateCategoryJsonLd = (categoryKeywords: CategoryKeywords, subcategoryName?: string) => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: subcategoryName ? `${subcategoryName} - ${categoryKeywords.category}` : categoryKeywords.category,
      description: generateMetaDescription(categoryKeywords.category, subcategoryName),
      url: `https://moonmart.ai${route.path}`,
      mainEntity: {
        '@type': 'ItemList',
        name: `${categoryKeywords.category} Software Solutions`,
        description: `Comprehensive directory of ${categoryKeywords.category.toLowerCase()} software and tools`,
        numberOfItems: Object.keys(categoryKeywords.subcategories).length,
        itemListElement: Object.entries(categoryKeywords.subcategories).map(([_key, subcategory], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: subcategory.name,
            url: `https://moonmart.ai${subcategory.path}`,
            description: `${subcategory.name} software and tools for businesses`,
            category: categoryKeywords.category,
            operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
            applicationCategory: 'BusinessApplication'
          }
        }))
      }
    }

    return baseData
  }

  // Generate listing page SEO (for AI onboarding, submission forms, etc.)
  const generateListingSEO = (category?: string, productName?: string): SEOConfig => {
    const baseTitle = 'Submit Your Software to Moonmart Marketplace'
    const baseDescription = 'List your software on Moonmart to reach thousands of potential customers. Submit your SaaS tool, get featured, and grow your business with our global marketplace.'
    
    if (category && isValidCategory(category)) {
      const seoCategory = getCategoryKeywords(category)
      const categoryKeywords = getKeywordsForCategory(seoCategory)
      
      const title = productName 
        ? `Submit ${productName} - ${category} Software | Moonmart`
        : `Submit ${category} Software to Moonmart Marketplace`
      
      const description = `Submit your ${category.toLowerCase()} software to Moonmart marketplace. Join hundreds of ${category.toLowerCase()} tools and reach customers looking for ${category.toLowerCase()} solutions.`
      
      const keywords = [
        'submit software',
        'list software',
        'software submission',
        'SaaS marketplace',
        ...(categoryKeywords?.primaryKeywords.slice(0, 5) || [])
      ].join(', ')

      return {
        title,
        description,
        keywords,
        ogImage: `/assets/images/categories/${seoCategory}-submission-og.jpg`,
        ogType: 'website',
        twitterCard: 'summary_large_image',
        robots: 'index, follow',
        canonical: `https://moonmart.ai${route.path}`,
        jsonLd: generateListingJsonLd(category, productName)
      }
    }

    return {
      title: baseTitle,
      description: baseDescription,
      keywords: 'submit software, list software, software submission, SaaS marketplace, software directory, add software',
      ogImage: '/assets/images/submit-software-og.jpg',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      robots: 'index, follow',
      canonical: `https://moonmart.ai${route.path}`,
      jsonLd: generateListingJsonLd()
    }
  }

  // Generate structured data for listing pages
  const generateListingJsonLd = (category?: string, productName?: string) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: productName ? `Submit ${productName} to Moonmart` : 'Submit Your Software to Moonmart',
      description: category 
        ? `Submit your ${category.toLowerCase()} software to Moonmart marketplace and reach thousands of potential customers.`
        : 'Submit your software to Moonmart marketplace and reach thousands of potential customers.',
      url: `https://moonmart.ai${route.path}`,
      mainEntity: {
        '@type': 'Service',
        name: 'Software Submission Service',
        description: 'Submit and list your software on Moonmart marketplace',
        provider: {
          '@type': 'Organization',
          name: 'Moonmart',
          url: 'https://moonmart.ai'
        },
        serviceType: 'Software Directory Listing',
        areaServed: 'Worldwide'
      }
    }
  }

  // Enhanced category SEO with better keyword integration
  const generateEnhancedCategorySEO = (categoryName: string, subcategoryName?: string): SEOConfig => {
    if (!isValidCategory(categoryName)) {
      return baseSEO
    }

    const seoCategory = getCategoryKeywords(categoryName)
    const categoryKeywords = getKeywordsForCategory(seoCategory)
    
    if (!categoryKeywords) {
      return baseSEO
    }

    const title = generatePageTitle(categoryKeywords.category, subcategoryName)
    const description = generateMetaDescription(categoryKeywords.category, subcategoryName)
    const keywords = generateMetaKeywords(seoCategory)

    return {
      title,
      description,
      keywords,
      ogImage: `/assets/images/categories/${seoCategory}-og.jpg`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      robots: 'index, follow',
      canonical: `https://moonmart.ai${route.path}`,
      jsonLd: generateCategoryJsonLd(categoryKeywords, subcategoryName)
    }
  }

  // Generate app-specific SEO
  const generateAppSEO = (appName: string, appDescription: string, categoryId: string): SEOConfig => {
    const categoryKeywords = allCategoryKeywords[categoryId as keyof typeof allCategoryKeywords]
    const categoryDisplayName = categoryKeywords?.category || 'Software'

    return {
      title: `${appName} - ${categoryDisplayName} Software | Moonmart`,
      description: `${appDescription} Compare features, pricing, and reviews for ${appName} and similar ${categoryDisplayName.toLowerCase()} solutions on Moonmart.`,
      keywords: `${appName}, ${categoryDisplayName.toLowerCase()} software, ${categoryKeywords?.primaryKeywords.slice(0, 5).join(', ') || 'business software'}`,
      ogImage: `/assets/images/apps/${appName.toLowerCase().replace(/\s+/g, '-')}-og.jpg`,
      ogType: 'article',
      twitterCard: 'summary_large_image',
      robots: 'index, follow',
      canonical: `https://moonmart.ai${route.path}`,
      jsonLd: generateAppJsonLd(appName, appDescription, categoryDisplayName)
    }
  }

  // Generate structured data for individual apps
  const generateAppJsonLd = (appName: string, appDescription: string, categoryName: string) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: appName,
      description: appDescription,
      url: `https://moonmart.ai${route.path}`,
      category: categoryName,
      operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
      applicationCategory: 'BusinessApplication',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        ratingCount: '100',
        bestRating: '5',
        worstRating: '1'
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Moonmart',
        url: 'https://moonmart.ai',
        logo: {
          '@type': 'ImageObject',
          url: 'https://moonmart.ai/assets/images/logo.png'
        }
      }
    }
  }

  // Apply SEO configuration
  const applySEO = (config: SEOConfig) => {
    // Set page title
    useHead({
      title: config.title,
      meta: [
        { name: 'description', content: config.description },
        { name: 'keywords', content: config.keywords },
        { name: 'robots', content: config.robots || 'index, follow' },
        { name: 'author', content: 'Moonmart' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        
        // Open Graph tags
        { property: 'og:title', content: config.title },
        { property: 'og:description', content: config.description },
        { property: 'og:type', content: config.ogType || 'website' },
        { property: 'og:url', content: config.canonical || `https://moonmart.ai${route.path}` },
        { property: 'og:image', content: config.ogImage || '/assets/images/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'Moonmart' },
        { property: 'og:locale', content: $i18n.locale.value },
        
        // Twitter Card tags
        { name: 'twitter:card', content: config.twitterCard || 'summary_large_image' },
        { name: 'twitter:title', content: config.title },
        { name: 'twitter:description', content: config.description },
        { name: 'twitter:image', content: config.ogImage || '/assets/images/og-image.jpg' },
        { name: 'twitter:site', content: '@Moonmart' },
        
        // Additional SEO tags
        { name: 'theme-color', content: '#1a73e8' },
        { name: 'msapplication-TileColor', content: '#1a73e8' },
        { name: 'application-name', content: 'Moonmart' },
        { name: 'apple-mobile-web-app-title', content: 'Moonmart' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ],
      link: [
        { rel: 'canonical', href: config.canonical || `https://moonmart.ai${route.path}` },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      script: config.jsonLd ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(config.jsonLd)
        }
      ] : []
    })

    // Set hreflang tags for international SEO
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
  }

  // Generate international hreflang tags
  const generateHreflangTags = (basePath: string) => {
    const locales = ['en', 'es', 'fr', 'de', 'pt']
    const hreflang: Record<string, string> = {}
    
    locales.forEach(locale => {
      hreflang[locale] = `https://moonmart.ai/${locale}${basePath}`
    })
    
    hreflang['x-default'] = `https://moonmart.ai${basePath}`
    
    return hreflang
  }

  return {
    baseSEO,
    generateCategorySEO,
    generateEnhancedCategorySEO,
    generateAppSEO,
    generateListingSEO,
    applySEO,
    generateHreflangTags,
    globalKeywords,
    allCategoryKeywords
  }
}
