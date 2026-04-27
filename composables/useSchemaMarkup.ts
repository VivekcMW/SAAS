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
      name: 'Moonmart',
      url: 'https://moonmart.ai',
      description: 'Global software marketplace for business solutions',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://moonmart.ai/marketplace?search={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Moonmart',
        logo: {
          '@type': 'ImageObject',
          url: 'https://moonmart.ai/assets/images/logo.png'
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
        name: 'Moonmart',
        url: 'https://moonmart.ai'
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
        name: 'Moonmart',
        logo: {
          '@type': 'ImageObject',
          url: 'https://moonmart.ai/assets/images/logo.png'
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
  const applySchema = (schema: Record<string, unknown> | Array<Record<string, unknown>>) => {
    const schemas = Array.isArray(schema) ? schema : [schema]
    
    useHead({
      script: schemas.map(s => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(s)
      }))
    })
  }

  // ── App page: full @graph with SoftwareApplication + FAQPage + BreadcrumbList ──
  const generateAppPageSchema = (app: {
    name: string
    slug: string
    description: string
    shortDescription?: string
    category: string
    categorySlug?: string
    rating: number
    reviewCount: number
    pricingType?: string
    pricingValue?: number
    logo?: string
    screenshots?: string[]
    features?: string[]
    updatedAt?: string
    // AI synthesis consensus — injected when available
    synthConsensus?: string
    // alternatives list — top 3 names
    alternativeNames?: string[]
    moonmartScore?: number
  }) => {
    const BASE = 'https://moonmart.ai'
    const appUrl = `${BASE}/marketplace/app/${app.slug}`
    const catLabel = app.category.charAt(0).toUpperCase() + app.category.slice(1).replaceAll('-', ' ')
    const catSlug = app.categorySlug || app.category

    const pricingText = app.pricingType === 'free'
      ? `${app.name} offers a free plan. Paid plans start at ${app.pricingValue ? `$${app.pricingValue}/month` : 'competitive rates'}.`
      : app.pricingType === 'contact'
        ? `${app.name} uses custom pricing — contact their sales team for a quote.`
        : app.pricingValue
          ? `${app.name} starts at $${app.pricingValue}/month. See full pricing on moonmart.ai.`
          : `${app.name} offers paid plans. Visit moonmart.ai for full pricing details.`

    const worthItText = app.synthConsensus
      ? `${app.synthConsensus} — Full AI synthesis available on moonmart.ai.`
      : app.rating >= 4.5
        ? `Yes. ${app.name} is highly rated at ${app.rating}/5 across ${app.reviewCount} verified reviews on moonmart.ai. Buyers consistently praise its reliability and ease of use.`
        : `${app.name} is rated ${app.rating}/5 based on ${app.reviewCount} verified reviews on moonmart.ai. Read the full review synthesis to decide if it fits your needs.`

    const altsText = app.alternativeNames?.length
      ? `Top alternatives to ${app.name} include ${app.alternativeNames.join(', ')}. Compare them side-by-side at moonmart.ai/alternatives/${app.slug}.`
      : `Find the best alternatives to ${app.name} on moonmart.ai — compare features, pricing, and verified reviews side-by-side.`

    const scoreText = app.moonmartScore != null
      ? `moonmart.ai Score: ${app.moonmartScore}/10 — `
      : ''

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          '@id': `${appUrl}#software`,
          name: app.name,
          description: app.shortDescription || app.description,
          url: appUrl,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web, iOS, Android',
          image: app.logo,
          screenshot: app.screenshots?.map(s => ({ '@type': 'ImageObject', url: s })),
          featureList: app.features,
          dateModified: app.updatedAt,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(app.rating),
            reviewCount: String(app.reviewCount),
            bestRating: '5',
            worstRating: '1'
          },
          offers: {
            '@type': 'Offer',
            price: app.pricingType === 'free' ? '0' : String(app.pricingValue ?? ''),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          },
          publisher: {
            '@type': 'Organization',
            name: 'moonmart.ai',
            url: BASE
          }
        },
        {
          '@type': 'FAQPage',
          '@id': `${appUrl}#faq`,
          mainEntity: [
            {
              '@type': 'Question',
              name: `What is ${app.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${app.shortDescription || app.description} ${scoreText}Reviewed on moonmart.ai.`
              }
            },
            {
              '@type': 'Question',
              name: `How much does ${app.name} cost?`,
              acceptedAnswer: { '@type': 'Answer', text: pricingText }
            },
            {
              '@type': 'Question',
              name: `What are the best alternatives to ${app.name}?`,
              acceptedAnswer: { '@type': 'Answer', text: altsText }
            },
            {
              '@type': 'Question',
              name: `Is ${app.name} worth it?`,
              acceptedAnswer: { '@type': 'Answer', text: worthItText }
            },
            {
              '@type': 'Question',
              name: `Is ${app.name} good for small businesses?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${app.name} is used by teams of all sizes. Check moonmart.ai for reviews filtered by company size — small business buyers rate it ${app.rating}/5.`
              }
            }
          ]
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${appUrl}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'moonmart.ai', item: BASE },
            { '@type': 'ListItem', position: 2, name: 'Marketplace', item: `${BASE}/marketplace` },
            { '@type': 'ListItem', position: 3, name: catLabel, item: `${BASE}/marketplace/category/${catSlug}` },
            { '@type': 'ListItem', position: 4, name: app.name, item: appUrl }
          ]
        },
        {
          '@type': 'WebPage',
          '@id': appUrl,
          url: appUrl,
          name: `${app.name} — Reviews, Pricing, Alternatives | moonmart.ai`,
          description: app.shortDescription || app.description,
          dateModified: app.updatedAt,
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['#app-quick-verdict', '#moonmart-score', '#ai-synthesis-consensus']
          },
          breadcrumb: { '@id': `${appUrl}#breadcrumb` },
          primaryImageOfPage: app.logo ? { '@type': 'ImageObject', url: app.logo } : undefined
        }
      ]
    }
  }

  // ── Comparison page schema ─────────────────────────────────────────────────
  const generateComparisonPageSchema = (appA: { name: string; slug: string; rating: number; reviewCount: number }, appB: { name: string; slug: string; rating: number; reviewCount: number }) => {
    const BASE = 'https://moonmart.ai'
    const pageUrl = `${BASE}/compare/${appA.slug}-vs-${appB.slug}`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `${appA.name} vs ${appB.name}: which is better?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${appA.name} is rated ${appA.rating}/5 (${appA.reviewCount} reviews) and ${appB.name} is rated ${appB.rating}/5 (${appB.reviewCount} reviews) on moonmart.ai. The best choice depends on your team size, budget, and use case. Compare them in full at ${pageUrl}.`
              }
            },
            {
              '@type': 'Question',
              name: `What is the difference between ${appA.name} and ${appB.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${appA.name} and ${appB.name} are both SaaS tools in the same category. See a detailed feature-by-feature and pricing comparison on moonmart.ai at ${pageUrl}.`
              }
            }
          ]
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'moonmart.ai', item: BASE },
            { '@type': 'ListItem', position: 2, name: 'Compare', item: `${BASE}/compare` },
            { '@type': 'ListItem', position: 3, name: `${appA.name} vs ${appB.name}`, item: pageUrl }
          ]
        },
        {
          '@type': 'WebPage',
          url: pageUrl,
          name: `${appA.name} vs ${appB.name} — Side-by-Side Comparison | moonmart.ai`,
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['#comparison-verdict', '#comparison-winner']
          }
        }
      ]
    }
  }

  // ── Category page schema ───────────────────────────────────────────────────
  const generateCategoryPageSchema = (category: string, categorySlug: string, apps: Array<{ name: string; slug: string; rating: number }>) => {
    const BASE = 'https://moonmart.ai'
    const pageUrl = `${BASE}/marketplace/category/${categorySlug}`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ItemList',
          name: `Best ${category} Software`,
          description: `Top-rated ${category} tools reviewed by verified buyers on moonmart.ai`,
          url: pageUrl,
          numberOfItems: apps.length,
          itemListElement: apps.slice(0, 10).map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'SoftwareApplication',
              name: a.name,
              url: `${BASE}/marketplace/app/${a.slug}`,
              aggregateRating: { '@type': 'AggregateRating', ratingValue: String(a.rating), bestRating: '5' }
            }
          }))
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'moonmart.ai', item: BASE },
            { '@type': 'ListItem', position: 2, name: 'Marketplace', item: `${BASE}/marketplace` },
            { '@type': 'ListItem', position: 3, name: category, item: pageUrl }
          ]
        }
      ]
    }
  }

  return {
    generateOrganizationSchema,
    generateWebsiteSchema,
    generateSoftwareSchema,
    generateFAQSchema,
    generateComparisonSchema,
    generateCollectionSchema,
    generateBlogPostSchema,
    generateAppPageSchema,
    generateComparisonPageSchema,
    generateCategoryPageSchema,
    applySchema
  }
}
