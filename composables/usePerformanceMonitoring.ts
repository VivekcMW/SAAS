/**
 * Advanced Performance Monitoring & SEO Analytics
 * Implements Core Web Vitals tracking and SEO performance metrics
 * Based on the Global SEO Strategy requirements
 */

export interface CoreWebVitals {
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
  fcp: number // First Contentful Paint
  inp: number // Interaction to Next Paint
}

export interface SEOMetrics {
  pageLoadTime: number
  timeToInteractive: number
  totalBlockingTime: number
  speedIndex: number
  mobilePageSpeed: number
  desktopPageSpeed: number
}

export interface IndexingMetrics {
  isIndexed: boolean
  lastCrawled?: Date
  indexingStatus: 'indexed' | 'crawled-not-indexed' | 'discovered-not-crawled' | 'error'
  canonicalUrl?: string
  crawlErrors: string[]
}

export const usePerformanceMonitoring = () => {
  // Core Web Vitals measurement
  const measureCoreWebVitals = (): Promise<CoreWebVitals> => {
    return new Promise((resolve) => {
      if (import.meta.server) {
        resolve({
          lcp: 0,
          fid: 0,
          cls: 0,
          ttfb: 0,
          fcp: 0,
          inp: 0
        })
        return
      }

      const vitals: Partial<CoreWebVitals> = {}

      // Measure LCP (Largest Contentful Paint)
      const measureLCP = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
          vitals.lcp = lastEntry.startTime
          observer.disconnect()
        })
        observer.observe({ type: 'largest-contentful-paint', buffered: true })
      }

      // Measure FID (First Input Delay)
      const measureFID = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            vitals.fid = entry.processingStart - entry.startTime
          })
          observer.disconnect()
        })
        observer.observe({ type: 'first-input', buffered: true })
      }

      // Measure CLS (Cumulative Layout Shift)
      const measureCLS = () => {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          vitals.cls = clsValue
        })
        observer.observe({ type: 'layout-shift', buffered: true })
      }

      // Measure TTFB (Time to First Byte)
      const measureTTFB = () => {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigationEntry) {
          vitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
        }
      }

      // Measure FCP (First Contentful Paint)
      const measureFCP = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime
            }
          })
          observer.disconnect()
        })
        observer.observe({ type: 'paint', buffered: true })
      }

      // Measure INP (Interaction to Next Paint)
      const measureINP = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          let maxDelay = 0
          entries.forEach((entry: any) => {
            const delay = entry.processingStart - entry.startTime + entry.duration
            maxDelay = Math.max(maxDelay, delay)
          })
          vitals.inp = maxDelay
        })
        observer.observe({ type: 'event', buffered: true })
      }

      // Start measurements
      measureLCP()
      measureFID()
      measureCLS()
      measureTTFB()
      measureFCP()
      measureINP()

      // Return vitals after 3 seconds or when all metrics are collected
      setTimeout(() => {
        resolve({
          lcp: vitals.lcp || 0,
          fid: vitals.fid || 0,
          cls: vitals.cls || 0,
          ttfb: vitals.ttfb || 0,
          fcp: vitals.fcp || 0,
          inp: vitals.inp || 0
        })
      }, 3000)
    })
  }

  // SEO performance metrics
  const measureSEOMetrics = (): Promise<SEOMetrics> => {
    return new Promise((resolve) => {
      if (import.meta.server) {
        resolve({
          pageLoadTime: 0,
          timeToInteractive: 0,
          totalBlockingTime: 0,
          speedIndex: 0,
          mobilePageSpeed: 0,
          desktopPageSpeed: 0
        })
        return
      }

      const metrics: Partial<SEOMetrics> = {}
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (navigationEntry) {
        // Page Load Time
        metrics.pageLoadTime = navigationEntry.loadEventEnd - navigationEntry.loadEventStart

        // Time to Interactive (approximation)
        metrics.timeToInteractive = navigationEntry.domInteractive - navigationEntry.fetchStart

        // Total Blocking Time (approximation)
        const resourceEntries = performance.getEntriesByType('resource')
        metrics.totalBlockingTime = resourceEntries.reduce((total, entry: any) => {
          const blockingTime = Math.max(0, entry.duration - 50)
          return total + blockingTime
        }, 0)

        // Speed Index (simplified calculation)
        metrics.speedIndex = navigationEntry.loadEventEnd - navigationEntry.fetchStart
      }

      // Mobile and Desktop PageSpeed (would typically be measured via API)
      // For demo purposes, these would be populated from Google PageSpeed Insights API
      metrics.mobilePageSpeed = 0
      metrics.desktopPageSpeed = 0

      resolve(metrics as SEOMetrics)
    })
  }

  // Check indexing status via Search Console API (simulated)
  const checkIndexingStatus = async (url: string): Promise<IndexingMetrics> => {
    // In production, this would call Google Search Console API
    // For now, returning mock data
    return {
      isIndexed: true,
      lastCrawled: new Date(),
      indexingStatus: 'indexed',
      canonicalUrl: url,
      crawlErrors: []
    }
  }

  // Performance budget monitoring
  const performanceBudget = {
    lcp: 2500, // 2.5 seconds
    fid: 100,  // 100 milliseconds
    cls: 0.1,  // 0.1
    ttfb: 800, // 800 milliseconds
    fcp: 1800, // 1.8 seconds
    pageLoadTime: 3000, // 3 seconds
    totalBlockingTime: 200 // 200 milliseconds
  }

  // Check if metrics meet performance budget
  const validatePerformanceBudget = (vitals: CoreWebVitals, seoMetrics: SEOMetrics) => {
    const results = {
      lcp: vitals.lcp <= performanceBudget.lcp,
      fid: vitals.fid <= performanceBudget.fid,
      cls: vitals.cls <= performanceBudget.cls,
      ttfb: vitals.ttfb <= performanceBudget.ttfb,
      fcp: vitals.fcp <= performanceBudget.fcp,
      pageLoadTime: seoMetrics.pageLoadTime <= performanceBudget.pageLoadTime,
      totalBlockingTime: seoMetrics.totalBlockingTime <= performanceBudget.totalBlockingTime
    }

    const passed = Object.values(results).filter(Boolean).length
    const total = Object.keys(results).length
    const score = (passed / total) * 100

    return {
      score,
      passed,
      total,
      details: results,
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
    }
  }

  // Real User Monitoring (RUM) data collection
  const collectRUMData = (vitals: CoreWebVitals, seoMetrics: SEOMetrics) => {
    const rumData = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      timestamp: new Date().toISOString(),
      vitals,
      seoMetrics,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      referrer: document.referrer,
      loadType: (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type || 'navigate'
    }

    // Send to analytics endpoint
    if (import.meta.client) {
      fetch('/api/analytics/rum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rumData)
      }).catch(console.error)
    }

    return rumData
  }

  // Performance monitoring for different page types
  const monitorPagePerformance = async (pageType: string) => {
    const vitals = await measureCoreWebVitals()
    const seoMetrics = await measureSEOMetrics()
    const budgetCheck = validatePerformanceBudget(vitals, seoMetrics)
    
    // Collect RUM data
    const rumData = collectRUMData(vitals, seoMetrics)

    // Log performance issues
    if (budgetCheck.score < 80) {
      console.warn(`Performance issues detected on ${pageType}:`, {
        score: budgetCheck.score,
        grade: budgetCheck.grade,
        failures: Object.entries(budgetCheck.details)
          .filter(([, passed]) => !passed)
          .map(([metric]) => metric)
      })
    }

    // Track in analytics
    if (import.meta.client && typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag
      gtag('event', 'page_performance', {
        event_category: 'Performance',
        event_label: pageType,
        value: Math.round(budgetCheck.score),
        custom_parameters: {
          lcp: Math.round(vitals.lcp),
          fid: Math.round(vitals.fid),
          cls: Math.round(vitals.cls * 1000) / 1000,
          performance_grade: budgetCheck.grade
        }
      })
    }

    return {
      vitals,
      seoMetrics,
      budgetCheck,
      rumData,
      pageType
    }
  }

  // SEO health monitoring
  const monitorSEOHealth = async () => {
    const route = useRoute()
    const health = {
      url: route.fullPath,
      timestamp: new Date().toISOString(),
      checks: {
        hasTitle: !!document.title,
        hasMetaDescription: !!document.querySelector('meta[name="description"]'),
        hasCanonical: !!document.querySelector('link[rel="canonical"]'),
        hasOgImage: !!document.querySelector('meta[property="og:image"]'),
        hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
        hasHreflang: !!document.querySelector('link[rel="alternate"][hreflang]'),
        hasRobotsMeta: !!document.querySelector('meta[name="robots"]')
      }
    }

    const passedChecks = Object.values(health.checks).filter(Boolean).length
    const totalChecks = Object.keys(health.checks).length
    const seoScore = (passedChecks / totalChecks) * 100

    // Log SEO issues
    if (seoScore < 90) {
      console.warn('SEO issues detected:', {
        url: health.url,
        score: seoScore,
        failed: Object.entries(health.checks)
          .filter(([, passed]) => !passed)
          .map(([check]) => check)
      })
    }

    return {
      ...health,
      score: seoScore,
      grade: seoScore >= 95 ? 'A+' : seoScore >= 90 ? 'A' : seoScore >= 80 ? 'B' : seoScore >= 70 ? 'C' : 'D'
    }
  }

  // Automated performance alerts
  const setupPerformanceAlerts = () => {
    if (import.meta.server) return

    // Monitor for performance regressions
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        // Alert for long tasks (over 50ms)
        if (entry.entryType === 'longtask' && entry.duration > 50) {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          })
        }

        // Alert for layout shifts
        if (entry.entryType === 'layout-shift' && (entry as any).value > 0.1) {
          console.warn('Large layout shift detected:', {
            value: (entry as any).value,
            hadRecentInput: (entry as any).hadRecentInput
          })
        }
      })
    })

    // Observe long tasks and layout shifts
    try {
      performanceObserver.observe({ entryTypes: ['longtask', 'layout-shift'] })
    } catch (_e) {
      console.warn('Performance Observer not supported')
    }
  }

  return {
    measureCoreWebVitals,
    measureSEOMetrics,
    checkIndexingStatus,
    validatePerformanceBudget,
    monitorPagePerformance,
    monitorSEOHealth,
    setupPerformanceAlerts,
    performanceBudget
  }
}
