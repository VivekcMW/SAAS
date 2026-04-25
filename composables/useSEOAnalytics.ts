/**
 * SEO Analytics and Keyword Tracking Composable
 * Provides advanced SEO analytics, keyword tracking, and search engine optimization utilities
 */

import { ref, computed, watch, onMounted } from 'vue'
import { allCategoryKeywords, globalKeywords, getKeywordsForCategory } from '~/seo/keywords'
import { getCategoryKeywords, isValidCategory } from '~/utils/categoryMapping'
import type { CategoryName } from '~/utils/categoryMapping'

export interface SEOAnalytics {
  pageviews: number
  searchImpressions: number
  clickThroughRate: number
  averagePosition: number
  topKeywords: string[]
  conversionRate: number
  organicTraffic: number
  bounceRate: number
  timeOnPage: number
  coreWebVitals: {
    lcp: number
    fid: number
    cls: number
  }
  llmCrawlerActivity: {
    gptBot: number
    claudeBot: number
    bingBot: number
    anthropicAI: number
  }
}

export interface KeywordData {
  keyword: string
  searchVolume: number
  competition: 'low' | 'medium' | 'high'
  difficulty: number
  cpc: number
  trends: number[]
}

export function useSEOAnalytics() {
  const currentPage = ref<string>('')
  const currentCategory = ref<string>('')
  const keywordPerformance = ref<Map<string, KeywordData>>(new Map())
  const analytics = ref<SEOAnalytics>({
    pageviews: 0,
    searchImpressions: 0,
    clickThroughRate: 0,
    averagePosition: 0,
    topKeywords: [],
    conversionRate: 0,
    organicTraffic: 0,
    bounceRate: 0,
    timeOnPage: 0,
    coreWebVitals: {
      lcp: 0,
      fid: 0,
      cls: 0
    },
    llmCrawlerActivity: {
      gptBot: 0,
      claudeBot: 0,
      bingBot: 0,
      anthropicAI: 0
    }
  })

  // Get comprehensive keyword data for a category
  const getCategoryKeywordData = (categoryName: string) => {
    if (!isValidCategory(categoryName)) {
      return null
    }

    const seoCategory = getCategoryKeywords(categoryName)
    const categoryKeywords = getKeywordsForCategory(seoCategory)
    
    if (!categoryKeywords) {
      return null
    }

    return {
      category: categoryKeywords.category,
      primaryKeywords: categoryKeywords.primaryKeywords,
      secondaryKeywords: categoryKeywords.secondaryKeywords,
      longTailKeywords: categoryKeywords.longTailKeywords,
      brandKeywords: categoryKeywords.brandKeywords,
      locationKeywords: categoryKeywords.locationKeywords,
      subcategories: categoryKeywords.subcategories,
      totalKeywords: categoryKeywords.primaryKeywords.length + 
                    categoryKeywords.secondaryKeywords.length + 
                    categoryKeywords.longTailKeywords.length
    }
  }

  // Generate keyword variations for better SEO coverage
  const generateKeywordVariations = (baseKeyword: string, category?: string) => {
    const variations = []
    const modifiers = globalKeywords.actionKeywords
    const qualifiers = globalKeywords.comparisonKeywords
    const businessTypes = globalKeywords.businessTypes
    const yearModifiers = ['2024', '2025', 'latest', 'new', 'best']
    
    // Basic variations
    variations.push(baseKeyword)
    variations.push(`${baseKeyword} software`)
    variations.push(`${baseKeyword} tool`)
    variations.push(`${baseKeyword} platform`)
    variations.push(`${baseKeyword} solution`)
    
    // Action-based variations
    modifiers.slice(0, 5).forEach(modifier => {
      variations.push(`${modifier} ${baseKeyword}`)
      variations.push(`${modifier} ${baseKeyword} software`)
    })
    
    // Comparison variations
    qualifiers.slice(0, 3).forEach(qualifier => {
      variations.push(`${qualifier} ${baseKeyword}`)
      variations.push(`${qualifier} ${baseKeyword} software`)
    })
    
    // Business type variations
    businessTypes.slice(0, 3).forEach(businessType => {
      variations.push(`${baseKeyword} for ${businessType}`)
      variations.push(`${baseKeyword} software for ${businessType}`)
    })
    
    // Year variations
    yearModifiers.slice(0, 3).forEach(year => {
      variations.push(`${baseKeyword} ${year}`)
      variations.push(`best ${baseKeyword} ${year}`)
    })
    
    // Category-specific variations
    if (category && isValidCategory(category)) {
      variations.push(`${category.toLowerCase()} ${baseKeyword}`)
      variations.push(`${baseKeyword} for ${category.toLowerCase()}`)
    }
    
    return [...new Set(variations)] // Remove duplicates
  }

  // Track keyword performance
  const trackKeywordPerformance = async (keyword: string, data: Partial<KeywordData>) => {
    const existingData = keywordPerformance.value.get(keyword)
    const updatedData: KeywordData = {
      keyword,
      searchVolume: data.searchVolume ?? existingData?.searchVolume ?? 0,
      competition: data.competition ?? existingData?.competition ?? 'medium',
      difficulty: data.difficulty ?? existingData?.difficulty ?? 50,
      cpc: data.cpc ?? existingData?.cpc ?? 0,
      trends: data.trends ?? existingData?.trends ?? []
    }
    
    keywordPerformance.value.set(keyword, updatedData)
    
    // In a real application, this would send data to analytics service
    if (process.client) {
      console.log(`Tracking keyword performance for: ${keyword}`, updatedData)
    }
  }

  // Generate category-specific schema markup
  const generateCategorySchema = (categoryName: string, subcategory?: string) => {
    if (!isValidCategory(categoryName)) {
      return null
    }

    const seoCategory = getCategoryKeywords(categoryName)
    const categoryKeywords = getKeywordsForCategory(seoCategory)
    
    if (!categoryKeywords) {
      return null
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: subcategory ? `${subcategory} - ${categoryName}` : categoryName,
      description: `Discover the best ${categoryName.toLowerCase()} software and tools on Moonmart marketplace.`,
      url: `https://moonmart.ai/${seoCategory}${subcategory ? `/${subcategory.toLowerCase().replace(/\s+/g, '-')}` : ''}`,
      mainEntity: {
        '@type': 'ItemList',
        name: `${categoryName} Software Directory`,
        description: `Comprehensive list of ${categoryName.toLowerCase()} software solutions`,
        numberOfItems: Object.keys(categoryKeywords.subcategories).length,
        itemListElement: Object.entries(categoryKeywords.subcategories).map(([key, sub], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: sub.name,
            url: `https://moonmart.ai${sub.path}`,
            applicationCategory: categoryName,
            operatingSystem: 'Web, iOS, Android, Windows, macOS',
            keywords: sub.keywords.join(', ')
          }
        }))
      },
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
            name: 'Categories',
            item: 'https://moonmart.ai/categories'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: categoryName,
            item: `https://moonmart.ai/${seoCategory}`
          }
        ]
      }
    }

    if (subcategory) {
      schema.breadcrumb.itemListElement.push({
        '@type': 'ListItem',
        position: 4,
        name: subcategory,
        item: `https://moonmart.ai/${seoCategory}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`
      })
    }

    return schema
  }

  // Get top performing keywords for a category
  const getTopKeywords = (categoryName: string, limit = 10) => {
    const categoryData = getCategoryKeywordData(categoryName)
    if (!categoryData) {
      return []
    }

    // Combine and rank keywords by importance
    const allKeywords = [
      ...categoryData.primaryKeywords.map(k => ({ keyword: k, weight: 3 })),
      ...categoryData.secondaryKeywords.map(k => ({ keyword: k, weight: 2 })),
      ...categoryData.longTailKeywords.slice(0, 15).map(k => ({ keyword: k, weight: 1 }))
    ]

    return allKeywords
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit)
      .map(item => item.keyword)
  }

  // Generate meta keywords for different page types
  const generateMetaKeywords = (type: 'category' | 'product' | 'listing', data: any) => {
    let keywords: string[] = []

    switch (type) {
      case 'category':
        if (data.categoryName && isValidCategory(data.categoryName)) {
          const topKeywords = getTopKeywords(data.categoryName, 8)
          keywords = [...topKeywords, ...globalKeywords.platformKeywords.slice(0, 3)]
        }
        break

      case 'product':
        keywords = [
          data.productName || '',
          data.category ? `${data.category.toLowerCase()} software` : '',
          ...globalKeywords.features.slice(0, 5),
          ...globalKeywords.businessTypes.slice(0, 3)
        ].filter(Boolean)
        break

      case 'listing':
        keywords = [
          'submit software',
          'list software',
          'software directory',
          'SaaS marketplace',
          ...(data.category ? getTopKeywords(data.category, 5) : [])
        ]
        break
    }

    return keywords.filter(Boolean).join(', ')
  }

  // Track page performance metrics
  const trackPageMetrics = (pageType: string, category?: string) => {
    if (process.client) {
      // Simulate analytics tracking
      analytics.value.pageviews++
      
      // In a real application, this would integrate with Google Analytics, etc.
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          category: category || 'general',
          page_type: pageType
        })
      }
    }
  }

  // Computed properties for reactive data
  const topPerformingKeywords = computed(() => {
    return Array.from(keywordPerformance.value.values())
      .sort((a, b) => b.searchVolume - a.searchVolume)
      .slice(0, 10)
  })

  const categoryKeywordStats = computed(() => {
    if (!currentCategory.value) return null
    return getCategoryKeywordData(currentCategory.value)
  })

  // Set current context for tracking
  const setContext = (page: string, category?: string) => {
    currentPage.value = page
    currentCategory.value = category || ''
  }

  // LLM and Advanced SEO Monitoring Functions
  
  /**
   * Track Core Web Vitals for SEO performance
   */
  const trackCoreWebVitals = () => {
    if (process.client) {
      // Track Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            analytics.value.coreWebVitals.lcp = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'first-input') {
            analytics.value.coreWebVitals.fid = (entry as any).processingStart - entry.startTime;
          }
        }
      }).observe({ entryTypes: ['first-input'] });

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        analytics.value.coreWebVitals.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    }
  };

  /**
   * Monitor LLM crawler activity
   */
  const trackLLMCrawlers = async () => {
    if (process.server) {
      // This would typically be done on the server-side
      // Monitor server logs for LLM bot activity
      const userAgent = useRequestHeaders(['user-agent'])['user-agent'] || '';
      
      if (userAgent.includes('GPTBot') || userAgent.includes('ChatGPT')) {
        analytics.value.llmCrawlerActivity.gptBot++;
      } else if (userAgent.includes('Claude') || userAgent.includes('anthropic')) {
        analytics.value.llmCrawlerActivity.claudeBot++;
        analytics.value.llmCrawlerActivity.anthropicAI++;
      } else if (userAgent.includes('bingbot') || userAgent.includes('Bing')) {
        analytics.value.llmCrawlerActivity.bingBot++;
      }
    }
  };

  /**
   * Generate LLM-optimized content structure
   */
  const generateLLMContentStructure = (content: string, metadata: any) => {
    const { optimizeContentForLLM } = useLLMOptimization();
    return optimizeContentForLLM(content, metadata);
  };

  /**
   * Track search queries for keyword analysis
   */
  const trackSearchQuery = async (query: string, results: number, category?: string) => {
    // Update keyword performance tracking
    await trackKeywordPerformance(query, {
      searchVolume: (keywordPerformance.value.get(query)?.searchVolume || 0) + 1
    });

    // Track in analytics
    analytics.value.searchImpressions++;
    
    if (process.client) {
      // Send to analytics service
      console.log(`Search tracked: ${query} (${results} results)`);
    }
  };

  /**
   * Monitor page performance metrics
   */
  const trackAdvancedPageMetrics = () => {
    if (process.client) {
      let startTime = Date.now();
      let scrollDepth = 0;
      
      // Track time on page
      const trackTimeOnPage = () => {
        analytics.value.timeOnPage = Date.now() - startTime;
      };
      
      // Track scroll depth for engagement
      const trackScrollDepth = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const currentScrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
        
        if (currentScrollDepth > scrollDepth) {
          scrollDepth = currentScrollDepth;
        }
      };
      
      // Event listeners
      window.addEventListener('scroll', trackScrollDepth);
      window.addEventListener('beforeunload', trackTimeOnPage);
      
      // Track bounce rate (if user leaves quickly)
      setTimeout(() => {
        if (analytics.value.timeOnPage < 10000) { // Less than 10 seconds
          analytics.value.bounceRate = (analytics.value.bounceRate + 1) / analytics.value.pageviews;
        }
      }, 10000);
    }
  };

  /**
   * Generate comprehensive SEO report
   */
  const generateSEOReport = () => {
    return {
      performance: {
        coreWebVitals: analytics.value.coreWebVitals,
        timeOnPage: analytics.value.timeOnPage,
        bounceRate: analytics.value.bounceRate
      },
      traffic: {
        pageviews: analytics.value.pageviews,
        organicTraffic: analytics.value.organicTraffic,
        searchImpressions: analytics.value.searchImpressions,
        clickThroughRate: analytics.value.clickThroughRate
      },
      keywords: {
        topKeywords: analytics.value.topKeywords,
        totalTracked: keywordPerformance.value.size,
        topPerforming: topPerformingKeywords.value
      },
      llmOptimization: {
        crawlerActivity: analytics.value.llmCrawlerActivity,
        schemaMarkupPresent: !!document.querySelector('script[type="application/ld+json"]'),
        metaTagsOptimized: document.querySelectorAll('meta[name*="ai-"], meta[name*="semantic-"]').length > 0
      }
    };
  };

  /**
   * Initialize comprehensive SEO tracking
   */
  const initializeSEOTracking = () => {
    if (process.client) {
      trackCoreWebVitals();
      trackAdvancedPageMetrics();
      
      // Track initial page view
      analytics.value.pageviews++;
      
      // Initialize LLM content optimization
      const route = useRoute();
      setContext(route.path, route.params.category as string);
    }
    
    if (process.server) {
      trackLLMCrawlers();
    }
  };

  return {
    // State
    analytics: readonly(analytics),
    keywordPerformance: readonly(keywordPerformance),
    topPerformingKeywords,
    categoryKeywordStats,

    // Core Methods
    getCategoryKeywordData,
    generateKeywordVariations,
    trackKeywordPerformance,
    generateCategorySchema,
    getTopKeywords,
    generateMetaKeywords,
    trackPageMetrics,
    setContext,

    // Advanced SEO & LLM Methods
    trackCoreWebVitals,
    trackLLMCrawlers,
    generateLLMContentStructure,
    trackSearchQuery,
    trackAdvancedPageMetrics,
    generateSEOReport,
    initializeSEOTracking,

    // Direct access to keyword data
    allCategoryKeywords,
    globalKeywords
  }
}
