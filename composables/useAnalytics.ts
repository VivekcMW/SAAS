/**
 * Analytics Composable - useAnalytics
 * Handles client-side analytics tracking and event collection
 */

import type { AnalyticsEvent, AnalyticsSummary } from '~/types/enhanced-app'

export const useAnalytics = () => {
  // Generate or retrieve session ID
  const sessionId = ref<string>('')
  
  // Initialize session ID
  const initSession = () => {
    if (process.client) {
      let storedSessionId = sessionStorage.getItem('saas_session_id')
      if (!storedSessionId) {
        storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('saas_session_id', storedSessionId)
      }
      sessionId.value = storedSessionId
    }
  }

  // Track any analytics event
  const trackEvent = async (eventData: Partial<AnalyticsEvent>) => {
    if (!process.client) return

    try {
      await $fetch('/api/analytics/track', {
        method: 'POST',
        body: {
          ...eventData,
          sessionId: sessionId.value,
          timestamp: new Date().toISOString(),
          metadata: {
            ...eventData.metadata,
            userAgent: navigator.userAgent,
            screen: {
              width: window.screen.width,
              height: window.screen.height
            },
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            }
          }
        }
      })
    } catch (error) {
      console.warn('Analytics tracking failed:', error)
    }
  }

  // Track app page view
  const trackAppView = (appId: string, metadata: Record<string, any> = {}) => {
    return trackEvent({
      appId,
      type: 'view',
      metadata: {
        ...metadata,
        page: 'app_landing',
        referrer: document.referrer
      }
    })
  }

  // Track app download/click
  const trackAppDownload = (appId: string, source: string, platform?: string) => {
    return trackEvent({
      appId,
      type: 'download',
      metadata: {
        source,
        platform: platform || 'web',
        downloadType: 'direct'
      }
    })
  }

  // Track trial start
  const trackTrialStart = (appId: string, planType?: string) => {
    return trackEvent({
      appId,
      type: 'trial_start',
      metadata: {
        planType: planType || 'free_trial',
        source: 'landing_page'
      }
    })
  }

  // Track user signup
  const trackSignup = (appId: string, signupMethod: string) => {
    return trackEvent({
      appId,
      type: 'signup',
      metadata: {
        signupMethod,
        source: 'app_landing'
      }
    })
  }

  // Track user purchase/conversion
  const trackPurchase = (appId: string, planType: string, amount?: number) => {
    return trackEvent({
      appId,
      type: 'purchase',
      metadata: {
        planType,
        amount,
        currency: 'USD',
        source: 'pricing_page'
      }
    })
  }

  // Track section view within app page
  const trackSectionView = (appId: string, section: string) => {
    return trackEvent({
      appId,
      type: 'view',
      metadata: {
        section,
        page: 'app_landing',
        interactionType: 'scroll'
      }
    })
  }

  // Track feature interaction
  const trackFeatureClick = (appId: string, feature: string) => {
    return trackEvent({
      appId,
      type: 'click',
      metadata: {
        feature,
        interactionType: 'feature_exploration'
      }
    })
  }

  // Fetch analytics summary for an app
  const getAppMetrics = async (appId: string, timeframe: string = '30d'): Promise<AnalyticsSummary | null> => {
    try {
      return await $fetch(`/api/apps/${appId}/metrics`, {
        query: { timeframe }
      })
    } catch (error) {
      console.error('Failed to fetch app metrics:', error)
      return null
    }
  }

  // Track time spent on page
  const trackTimeSpent = (appId: string) => {
    if (!process.client) return

    const startTime = Date.now()
    
    const sendTimeSpent = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000) // seconds
      if (timeSpent > 5) { // Only track if spent more than 5 seconds
        trackEvent({
          appId,
          type: 'view',
          metadata: {
            timeSpent,
            engagementType: 'time_on_page'
          }
        })
      }
    }

    // Track when user leaves the page
    window.addEventListener('beforeunload', sendTimeSpent)
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        sendTimeSpent()
      }
    })

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', sendTimeSpent)
      sendTimeSpent()
    }
  }

  // Auto-track scroll depth
  const trackScrollDepth = (appId: string) => {
    if (!process.client) return

    let maxScrollDepth = 0
    const milestones = [25, 50, 75, 90, 100]
    const trackedMilestones = new Set<number>()

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent
      }

      // Track milestone achievements
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
          trackedMilestones.add(milestone)
          trackEvent({
            appId,
            type: 'view',
            metadata: {
              scrollDepth: milestone,
              engagementType: 'scroll_milestone'
            }
          })
        }
      })
    }

    const throttledScroll = throttle(handleScroll, 1000)
    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      // Send final scroll depth
      if (maxScrollDepth > 0) {
        trackEvent({
          appId,
          type: 'view',
          metadata: {
            maxScrollDepth,
            engagementType: 'final_scroll_depth'
          }
        })
      }
    }
  }

  // Initialize analytics when composable is used
  onMounted(() => {
    initSession()
  })

  return {
    sessionId: readonly(sessionId),
    trackEvent,
    trackAppView,
    trackAppDownload,
    trackTrialStart,
    trackSignup,
    trackPurchase,
    trackSectionView,
    trackFeatureClick,
    trackTimeSpent,
    trackScrollDepth,
    getAppMetrics
  }
}

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}
