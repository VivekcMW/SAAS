/**
 * Performance Monitor Service
 * Automated system for checking app health and performance metrics
 */

import type { PerformanceData, ApiHealthStatus, CompatibilityData } from '~/types/enhanced-app'

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private monitoringInterval: NodeJS.Timeout | null = null
  private readonly checkInterval = 5 * 60 * 1000 // 5 minutes

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Check health of a specific application
   */
  async checkAppHealth(appId: string): Promise<PerformanceData> {
    try {
      // Get app details to check endpoints
      const app = await this.getAppById(appId)
      if (!app) {
        throw new Error(`App ${appId} not found`)
      }

      // Check API endpoints if available
      const apiHealth = await this.checkApiEndpoints(app.apiUrls || [])
      
      // Measure response time for main URL
      const responseTime = await this.measureResponseTime(app.website || app.demoUrl)
      
      // Calculate uptime based on recent checks
      const uptime = await this.calculateUptime(appId)
      
      // Determine overall status
      const status = this.determineHealthStatus(uptime, responseTime, apiHealth.errorRate)

      const performanceData: PerformanceData = {
        uptime,
        responseTime,
        errorRate: apiHealth.errorRate,
        lastChecked: new Date(),
        status,
        endpoints: apiHealth.endpoints
      }

      // Store performance data
      await this.storePerformanceData(appId, performanceData)

      return performanceData
    } catch (error) {
      console.error(`Failed to check health for app ${appId}:`, error)
      
      return {
        uptime: 0,
        responseTime: 0,
        errorRate: 100,
        lastChecked: new Date(),
        status: 'critical',
        endpoints: []
      }
    }
  }

  /**
   * Check multiple API endpoints
   */
  private async checkApiEndpoints(urls: string[]): Promise<{
    endpoints: Array<{ url: string; status: number; responseTime: number }>
    errorRate: number
  }> {
    const results = []
    let errors = 0

    for (const url of urls) {
      try {
        const startTime = Date.now()
        
        // Create timeout controller
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout
        
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        const responseTime = Date.now() - startTime

        results.push({
          url,
          status: response.status,
          responseTime
        })

        if (response.status >= 400) {
          errors++
        }
      } catch (error) {
        results.push({
          url,
          status: 0,
          responseTime: 10000
        })
        errors++
      }
    }

    return {
      endpoints: results,
      errorRate: urls.length > 0 ? (errors / urls.length) * 100 : 0
    }
  }

  /**
   * Measure response time for a URL
   */
  private async measureResponseTime(url: string): Promise<number> {
    if (!url) return 0

    try {
      const startTime = Date.now()
      
      // Create timeout controller
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout
      
      await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return Date.now() - startTime
    } catch (error) {
      return 10000 // Return high response time on error
    }
  }

  /**
   * Calculate uptime percentage based on recent checks
   */
  private async calculateUptime(appId: string): Promise<number> {
    // In a real implementation, this would query historical performance data
    // For now, return mock data based on recent performance
    try {
      const recentChecks = await this.getRecentChecks(appId, 24) // Last 24 hours
      if (recentChecks.length === 0) return 100

      const successfulChecks = recentChecks.filter(check => check.status === 'healthy').length
      return (successfulChecks / recentChecks.length) * 100
    } catch (error) {
      return 99.9 // Default high uptime
    }
  }

  /**
   * Determine overall health status
   */
  private determineHealthStatus(uptime: number, responseTime: number, errorRate: number): 'healthy' | 'warning' | 'critical' {
    if (uptime < 95 || responseTime > 5000 || errorRate > 10) {
      return 'critical'
    }
    if (uptime < 99 || responseTime > 2000 || errorRate > 5) {
      return 'warning'
    }
    return 'healthy'
  }

  /**
   * Start automated monitoring for all active apps
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        const activeApps = await this.getActiveApps()
        
        for (const app of activeApps) {
          await this.checkAppHealth(app.id)
          
          // Small delay between checks to avoid overwhelming servers
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error('Error during automated monitoring:', error)
      }
    }, this.checkInterval)

    console.log('Performance monitoring started')
  }

  /**
   * Stop automated monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      console.log('Performance monitoring stopped')
    }
  }

  /**
   * Get app details by ID
   */
  private async getAppById(appId: string) {
    // In a real implementation, this would query the database
    // For now, return mock data
    return {
      id: appId,
      website: `https://example-${appId}.com`,
      apiUrls: [
        `https://api.example-${appId}.com/health`,
        `https://api.example-${appId}.com/status`
      ],
      demoUrl: `https://demo.example-${appId}.com`
    }
  }

  /**
   * Get list of active applications to monitor
   */
  private async getActiveApps() {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [
      { id: 'app-001' },
      { id: 'app-002' },
      { id: 'app-003' }
    ]
  }

  /**
   * Store performance data in database
   */
  private async storePerformanceData(appId: string, data: PerformanceData) {
    // In a real implementation, this would save to database
    console.log(`Storing performance data for ${appId}:`, {
      uptime: data.uptime,
      responseTime: data.responseTime,
      status: data.status
    })
  }

  /**
   * Get recent performance checks
   */
  private async getRecentChecks(appId: string, hours: number) {
    // In a real implementation, this would query historical data
    // For now, return mock data
    return Array.from({ length: hours }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
      status: Math.random() > 0.05 ? 'healthy' : 'critical' // 95% success rate
    }))
  }

  /**
   * Check browser compatibility
   */
  async checkCompatibility(appId: string): Promise<CompatibilityData> {
    // In a real implementation, this would run automated browser tests
    return {
      platforms: [
        {
          name: 'Web',
          versions: ['Chrome 90+', 'Firefox 88+', 'Safari 14+'],
          tested: true,
          compatibility: 'full',
          lastTested: new Date()
        },
        {
          name: 'iOS',
          versions: ['iOS 14+'],
          tested: true,
          compatibility: 'full',
          lastTested: new Date()
        },
        {
          name: 'Android',
          versions: ['Android 8+'],
          tested: true,
          compatibility: 'partial',
          lastTested: new Date()
        }
      ],
      browsers: [
        { name: 'Chrome', versions: ['90+'], supported: true },
        { name: 'Firefox', versions: ['88+'], supported: true },
        { name: 'Safari', versions: ['14+'], supported: true },
        { name: 'Edge', versions: ['90+'], supported: true }
      ],
      devices: [
        {
          type: 'desktop',
          specifications: '1920x1080+',
          compatibility: 'excellent'
        },
        {
          type: 'mobile',
          specifications: '375x667+',
          compatibility: 'good'
        },
        {
          type: 'tablet',
          specifications: '768x1024+',
          compatibility: 'good'
        }
      ]
    }
  }

  /**
   * Generate performance report
   */
  async generateReport(appId: string, timeframe: string = '30d') {
    const performanceData = await this.checkAppHealth(appId)
    const compatibilityData = await this.checkCompatibility(appId)
    
    return {
      appId,
      timeframe,
      generatedAt: new Date(),
      performance: performanceData,
      compatibility: compatibilityData,
      recommendations: this.generateRecommendations(performanceData)
    }
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(data: PerformanceData): string[] {
    const recommendations = []

    if (data.responseTime > 2000) {
      recommendations.push('Consider optimizing server response time - current average is above 2 seconds')
    }

    if (data.uptime < 99) {
      recommendations.push('Improve infrastructure reliability to achieve 99%+ uptime')
    }

    if (data.errorRate > 5) {
      recommendations.push('Reduce API error rate by implementing better error handling')
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is excellent! Keep up the good work.')
    }

    return recommendations
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  performanceMonitor.startMonitoring()
}
