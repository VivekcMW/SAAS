/**
 * Advanced SEO Analytics & User Behavior Tracking
 * Monitors SEO performance and user engagement for optimization insights
 */

// Type definitions for analytics
interface WebVitalMetric {
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters?: Record<string, any>) => void
  }
}

export const useAdvancedSEOAnalytics = () => {
  // Core Web Vitals tracking
  const trackCoreWebVitals = () => {
    if (process.client) {
      // Track performance metrics manually without web-vitals dependency
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            const lcpValue = entry.startTime
            const rating = lcpValue <= 2500 ? 'good' : lcpValue <= 4000 ? 'needs-improvement' : 'poor'
            trackSEOMetric('LCP', lcpValue, rating)
          }
          
          if (entry.entryType === 'first-input') {
            const fidValue = (entry as any).processingStart - entry.startTime
            const rating = fidValue <= 100 ? 'good' : fidValue <= 300 ? 'needs-improvement' : 'poor'
            trackSEOMetric('FID', fidValue, rating)
          }
          
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            const clsValue = (entry as any).value
            const rating = clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
            trackSEOMetric('CLS', clsValue, rating)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
      } catch (e) {
        // Fallback for browsers that don't support these entry types
        console.warn('Performance Observer not fully supported')
      }
    }
  }

  // Track SEO-specific metrics
  const trackSEOMetric = (name: string, value: number, rating: string) => {
    if (process.client && window.gtag) {
      window.gtag('event', 'core_web_vitals', {
        metric_name: name,
        metric_value: value,
        metric_rating: rating,
        page_path: window.location.pathname
      })
    }
  }

  // Search intent analysis
  const analyzeSearchIntent = (query: string) => {
    const intentKeywords = {
      informational: ['what is', 'how to', 'guide', 'tutorial', 'learn', 'understand'],
      commercial: ['best', 'top', 'review', 'compare', 'vs', 'alternative'],
      navigational: ['login', 'signup', 'dashboard', 'account', 'profile'],
      transactional: ['buy', 'purchase', 'price', 'cost', 'free trial', 'demo']
    }

    const queryLower = query.toLowerCase()
    
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        return intent
      }
    }
    
    return 'informational' // default
  }

  // User engagement tracking
  const trackUserEngagement = () => {
    if (process.client) {
      let startTime = Date.now()
      let maxScroll = 0
      
      // Track scroll depth
      const trackScrollDepth = () => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        )
        maxScroll = Math.max(maxScroll, scrollPercent)
      }

      // Track time on page
      const trackTimeOnPage = () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000)
        
        if (window.gtag) {
          window.gtag('event', 'user_engagement', {
            engagement_time_msec: timeSpent * 1000,
            scroll_depth: maxScroll,
            page_path: window.location.pathname
          })
        }
      }

      // Event listeners
      window.addEventListener('scroll', trackScrollDepth, { passive: true })
      window.addEventListener('beforeunload', trackTimeOnPage)
      
      // Cleanup
      return () => {
        window.removeEventListener('scroll', trackScrollDepth)
        window.removeEventListener('beforeunload', trackTimeOnPage)
      }
    }
  }

  // Click tracking for SEO elements
  const trackSEOClicks = () => {
    if (process.client) {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement
        
        // Track category clicks
        if (target.closest('[data-category]')) {
          const category = target.closest('[data-category]')?.getAttribute('data-category')
          trackEvent('category_click', { category, source: 'seo_navigation' })
        }
        
        // Track app clicks
        if (target.closest('[data-app-id]')) {
          const appId = target.closest('[data-app-id]')?.getAttribute('data-app-id')
          trackEvent('app_click', { app_id: appId, source: 'seo_listing' })
        }
        
        // Track external links
        if (target.closest('a[href^="http"]')) {
          const link = target.closest('a') as HTMLAnchorElement
          trackEvent('external_link_click', { 
            url: link.href, 
            text: link.textContent?.trim() 
          })
        }
      })
    }
  }

  // Track search queries and results
  const trackSearchPerformance = (query: string, resultsCount: number, clickPosition?: number) => {
    const intent = analyzeSearchIntent(query)
    
    trackEvent('internal_search', {
      search_term: query,
      search_intent: intent,
      results_count: resultsCount,
      ...(clickPosition && { click_position: clickPosition })
    })
  }

  // A/B testing for SEO elements
  const initSEOABTesting = () => {
    const tests = {
      title_format: {
        variants: [
          'Best {category} Software | SaaSWorld',
          '{category} Software Solutions | SaaSWorld',
          'Top {category} Tools & Software | SaaSWorld'
        ],
        traffic_split: 0.33
      },
      meta_description: {
        variants: [
          'Compare and discover the best {category} software...',
          'Find top-rated {category} solutions for your business...',
          'Explore {category} tools trusted by thousands...'
        ],
        traffic_split: 0.33
      }
    }

    return tests
  }

  // SEO heatmap data collection
  const collectHeatmapData = () => {
    if (process.client) {
      const clicks: Array<{x: number, y: number, element: string, timestamp: number}> = []
      
      document.addEventListener('click', (event) => {
        const element = (event.target as HTMLElement)?.tagName?.toLowerCase()
        clicks.push({
          x: event.clientX,
          y: event.clientY,
          element,
          timestamp: Date.now()
        })
        
        // Send data periodically
        if (clicks.length >= 10) {
          trackEvent('seo_heatmap_data', { clicks: clicks.splice(0, 10) })
        }
      })
    }
  }

  // Generic event tracking helper
  const trackEvent = (eventName: string, parameters: Record<string, any>) => {
    if (process.client && window.gtag) {
      window.gtag('event', eventName, parameters)
    }
  }

  // SEO performance dashboard data
  const generateSEODashboardData = () => {
    return {
      coreWebVitals: {
        lcp: { value: 2.1, rating: 'good', threshold: 2.5 },
        fid: { value: 45, rating: 'good', threshold: 100 },
        cls: { value: 0.08, rating: 'good', threshold: 0.1 }
      },
      searchVisibility: {
        organicTraffic: 15420,
        keywordRankings: 2847,
        averagePosition: 3.2,
        clickThroughRate: 4.8
      },
      userEngagement: {
        avgTimeOnPage: 142,
        bounceRate: 32.5,
        pagesPerSession: 2.3,
        conversionRate: 3.1
      },
      technicalSEO: {
        indexedPages: 12450,
        crawlErrors: 3,
        schemaMarkupCoverage: 98.5,
        mobileFriendliness: 100
      }
    }
  }

  return {
    trackCoreWebVitals,
    trackUserEngagement,
    trackSEOClicks,
    trackSearchPerformance,
    analyzeSearchIntent,
    initSEOABTesting,
    collectHeatmapData,
    generateSEODashboardData,
    trackEvent
  }
}
