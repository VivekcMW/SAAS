/**
 * Enhanced SEO Meta Generation Composable
 * Advanced meta tag optimization for search engines and LLMs
 */

import type { CategoryKeywords } from '~/seo/keywords/types'

interface EnhancedSEOOptions {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  articleSection?: string
  publishedDate?: string
  modifiedDate?: string
  author?: string
  locale?: string
  alternateLocales?: string[]
  schema?: object
  breadcrumbs?: Array<{ name: string; url: string }>
  appData?: {
    name: string
    category: string
    pricing: string
    rating: number
    reviews: number
    features: string[]
  }
}

export const useEnhancedSEO = () => {
  const { $i18n } = useNuxtApp()
  const route = useRoute()
  
  /**
   * Generate comprehensive meta tags for enhanced SEO and LLM understanding
   */
  const generateEnhancedSEO = (options: EnhancedSEOOptions) => {
    const {
      title,
      description,
      keywords = [],
      canonicalUrl,
      ogImage = '/images/saasworld-og-default.jpg',
      ogType = 'website',
      twitterCard = 'summary_large_image',
      articleSection,
      publishedDate,
      modifiedDate,
      author = 'Moonmart Team',
      locale = 'en_US',
      alternateLocales = ['en_US', 'es_ES', 'fr_FR', 'de_DE', 'pt_BR'],
      schema,
      breadcrumbs = [],
      appData
    } = options

    const baseUrl = 'https://moonmart.ai'
    const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : `${baseUrl}${route.path}`
    
    // Enhanced meta tags for better LLM understanding
    const metaTags = [
      // Basic SEO
      { hid: 'description', name: 'description', content: description },
      { hid: 'keywords', name: 'keywords', content: keywords.join(', ') },
      { hid: 'author', name: 'author', content: author },
      { hid: 'robots', name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { hid: 'googlebot', name: 'googlebot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      
      // Enhanced semantic meta tags for LLMs
      { hid: 'application-name', name: 'application-name', content: 'Moonmart' },
      { hid: 'category', name: 'category', content: 'Software Marketplace' },
      { hid: 'classification', name: 'classification', content: 'Business Software Directory' },
      { hid: 'coverage', name: 'coverage', content: 'Worldwide' },
      { hid: 'distribution', name: 'distribution', content: 'Global' },
      { hid: 'rating', name: 'rating', content: 'General' },
      { hid: 'revisit-after', name: 'revisit-after', content: '7 days' },
      
      // Open Graph - Enhanced
      { hid: 'og:type', property: 'og:type', content: ogType },
      { hid: 'og:site_name', property: 'og:site_name', content: 'Moonmart' },
      { hid: 'og:title', property: 'og:title', content: title },
      { hid: 'og:description', property: 'og:description', content: description },
      { hid: 'og:image', property: 'og:image', content: `${baseUrl}${ogImage}` },
      { hid: 'og:image:width', property: 'og:image:width', content: '1200' },
      { hid: 'og:image:height', property: 'og:image:height', content: '630' },
      { hid: 'og:image:alt', property: 'og:image:alt', content: title },
      { hid: 'og:url', property: 'og:url', content: fullCanonicalUrl },
      { hid: 'og:locale', property: 'og:locale', content: locale },
      
      // Twitter Cards - Enhanced
      { hid: 'twitter:card', name: 'twitter:card', content: twitterCard },
      { hid: 'twitter:site', name: 'twitter:site', content: '@Moonmart' },
      { hid: 'twitter:creator', name: 'twitter:creator', content: '@Moonmart' },
      { hid: 'twitter:title', name: 'twitter:title', content: title },
      { hid: 'twitter:description', name: 'twitter:description', content: description },
      { hid: 'twitter:image', name: 'twitter:image', content: `${baseUrl}${ogImage}` },
      { hid: 'twitter:image:alt', name: 'twitter:image:alt', content: title },
      
      // LinkedIn specific
      { hid: 'linkedin:owner', name: 'linkedin:owner', content: 'Moonmart' },
      
      // Additional semantic markup for LLMs
      { hid: 'theme-color', name: 'theme-color', content: '#2563eb' },
      { hid: 'color-scheme', name: 'color-scheme', content: 'dark' },
      
      // Mobile optimization
      { hid: 'viewport', name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
      { hid: 'mobile-web-app-capable', name: 'mobile-web-app-capable', content: 'yes' },
      { hid: 'apple-mobile-web-app-capable', name: 'apple-mobile-web-app-capable', content: 'yes' },
      { hid: 'apple-mobile-web-app-status-bar-style', name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
    ]

    // Add alternate locales
    alternateLocales.forEach(altLocale => {
      if (altLocale !== locale) {
        metaTags.push({
          hid: `og:locale:alternate:${altLocale}`,
          property: 'og:locale:alternate',
          content: altLocale
        })
      }
    })

    // Add article-specific meta tags
    if (articleSection) {
      metaTags.push(
        { hid: 'article:section', property: 'article:section', content: articleSection },
        { hid: 'article:author', property: 'article:author', content: author }
      )
      
      if (publishedDate) {
        metaTags.push({ hid: 'article:published_time', property: 'article:published_time', content: publishedDate })
      }
      
      if (modifiedDate) {
        metaTags.push({ hid: 'article:modified_time', property: 'article:modified_time', content: modifiedDate })
      }
    }

    // Add app-specific meta tags for marketplace listings
    if (appData) {
      metaTags.push(
        { hid: 'software:name', name: 'software:name', content: appData.name },
        { hid: 'software:category', name: 'software:category', content: appData.category },
        { hid: 'software:pricing', name: 'software:pricing', content: appData.pricing },
        { hid: 'software:rating', name: 'software:rating', content: appData.rating.toString() },
        { hid: 'software:reviews', name: 'software:reviews', content: appData.reviews.toString() },
        { hid: 'software:features', name: 'software:features', content: appData.features.join(', ') }
      )
    }

    // Link tags
    const linkTags = [
      { hid: 'canonical', rel: 'canonical', href: fullCanonicalUrl },
      { hid: 'alternate-home', rel: 'alternate', href: baseUrl, hreflang: 'x-default' }
    ]

    // Add alternate language links
    alternateLocales.forEach(altLocale => {
      const locale_code = altLocale.split('_')[0]
      const localePath = locale_code === 'en' ? route.path : `/${locale_code}${route.path}`
      linkTags.push({
        hid: `alternate-${locale_code}`,
        rel: 'alternate',
        href: `${baseUrl}${localePath}`,
        hreflang: locale_code
      })
    })

    // Preconnect to important domains for performance
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'https://api.moonmart.ai'
    ]

    preconnectDomains.forEach(domain => {
      linkTags.push({
        hid: `preconnect-${domain.replace(/[^a-zA-Z0-9]/g, '')}`,
        rel: 'preconnect',
        href: domain
      } as any)
    })

    return {
      title,
      meta: metaTags,
      link: linkTags,
      script: schema ? [{
        hid: 'structured-data',
        type: 'application/ld+json',
        children: JSON.stringify(schema)
      }] : []
    }
  }

  /**
   * Generate SEO-friendly slugs for LLM understanding
   */
  const generateSEOSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  /**
   * Generate FAQ schema for better LLM understanding
   */
  const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    }
  }

  /**
   * Generate How-To schema for guides and documentation
   */
  const generateHowToSchema = (title: string, steps: Array<{ name: string; text: string; image?: string }>) => {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": title,
      "description": `Learn how to ${title.toLowerCase()}`,
      "step": steps.map((step, index) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "name": step.name,
        "text": step.text,
        ...(step.image && { "image": `https://moonmart.ai${step.image}` })
      }))
    }
  }

  return {
    generateEnhancedSEO,
    generateSEOSlug,
    generateFAQSchema,
    generateHowToSchema
  }
}
