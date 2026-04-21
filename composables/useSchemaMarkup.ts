/**
 * Schema Markup Composable
 * Generates structured data for rich snippets and better SEO
 */

export const useSchemaMarkup = () => {
  // Organization schema
  const generateOrganizationSchema = () => {
    return {
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
      ]
    }
  }

  // Website schema with search action
  const generateWebsiteSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SaaSWorld',
      url: 'https://saasworld.com',
      description: 'Global software marketplace for business solutions',
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
  }

  // Software application schema
  const generateSoftwareSchema = (app: {
    name: string
    description: string
    category: string
    url: string
    rating?: number
    ratingCount?: number
    price?: string
    currency?: string
    screenshots?: string[]
    features?: string[]
  }) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: app.name,
      description: app.description,
      url: app.url,
      category: app.category,
      operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
      applicationCategory: 'BusinessApplication',
      aggregateRating: app.rating ? {
        '@type': 'AggregateRating',
        ratingValue: app.rating.toString(),
        ratingCount: app.ratingCount?.toString() || '100',
        bestRating: '5',
        worstRating: '1'
      } : undefined,
      offers: {
        '@type': 'Offer',
        price: app.price || '0',
        priceCurrency: app.currency || 'USD',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock'
      },
      screenshot: app.screenshots?.map(screenshot => ({
        '@type': 'ImageObject',
        url: screenshot
      })),
      featureList: app.features,
      publisher: {
        '@type': 'Organization',
        name: 'SaaSWorld',
        url: 'https://saasworld.com'
      }
    }
  }

  // FAQ schema
  const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  }

  // Product comparison schema
  const generateComparisonSchema = (products: Array<{
    name: string
    description: string
    url: string
    rating?: number
    price?: string
  }>) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Software Comparison',
      description: 'Compare the best software solutions',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: product.name,
          description: product.description,
          url: product.url,
          aggregateRating: product.rating ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating.toString(),
            bestRating: '5'
          } : undefined,
          offers: product.price ? {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD'
          } : undefined
        }
      }))
    }
  }

  // Collection page schema
  const generateCollectionSchema = (collection: {
    name: string
    description: string
    url: string
    items: Array<{ name: string; url: string }>
  }) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.name,
      description: collection.description,
      url: collection.url,
      mainEntity: {
        '@type': 'ItemList',
        name: collection.name,
        numberOfItems: collection.items.length,
        itemListElement: collection.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Thing',
            name: item.name,
            url: item.url
          }
        }))
      }
    }
  }

  // Blog post schema
  const generateBlogPostSchema = (post: {
    title: string
    description: string
    url: string
    datePublished: string
    dateModified?: string
    author: string
    image?: string
  }) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url: post.url,
      datePublished: post.datePublished,
      dateModified: post.dateModified || post.datePublished,
      author: {
        '@type': 'Person',
        name: post.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'SaaSWorld',
        logo: {
          '@type': 'ImageObject',
          url: 'https://saasworld.com/assets/images/logo.png'
        }
      },
      image: post.image ? {
        '@type': 'ImageObject',
        url: post.image
      } : undefined,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': post.url
      }
    }
  }

  // Apply schema markup to page
  const applySchema = (schema: Record<string, any> | Array<Record<string, any>>) => {
    const schemas = Array.isArray(schema) ? schema : [schema]
    
    useHead({
      script: schemas.map(s => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(s)
      }))
    })
  }

  return {
    generateOrganizationSchema,
    generateWebsiteSchema,
    generateSoftwareSchema,
    generateFAQSchema,
    generateComparisonSchema,
    generateCollectionSchema,
    generateBlogPostSchema,
    applySchema
  }
}
