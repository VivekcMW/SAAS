/**
 * LLM Analytics and Monitoring System
 * Comprehensive analytics, monitoring, and reporting for LLM optimizations
 */

import { useLLMOrchestrator } from './useLLMOrchestrator'
import { useLLMTesting } from './useLLMTesting'
import type { LLMType, LLMOptimizationConfig, LLMOrchestrationResult } from './useLLMOrchestrator'

export interface LLMUsageMetrics {
  llmType: LLMType
  totalOptimizations: number
  successfulOptimizations: number
  averageScore: number
  totalExecutionTime: number
  averageExecutionTime: number
  errorCount: number
  lastUsed: Date
}

export interface LLMPerformanceMetrics {
  timestamp: Date
  llmType: LLMType
  optimizationScore: number
  executionTime: number
  memoryUsage?: number
  validationErrors: number
  configComplexity: number
}

export interface LLMAnalyticsData {
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  totalOptimizations: number
  uniqueConfigurations: number
  overallPerformance: {
    averageScore: number
    successRate: number
    averageExecutionTime: number
  }
  tierPerformance: {
    tier1: { average: number; count: number }
    tier2: { average: number; count: number }
    tier3: { average: number; count: number }
  }
  llmMetrics: LLMUsageMetrics[]
  trends: {
    scoreImprovement: number
    performanceTrend: 'improving' | 'stable' | 'declining'
    popularLLMs: LLMType[]
    emergingIssues: string[]
  }
}

export interface LLMOptimizationAlert {
  id: string
  type: 'performance' | 'error' | 'usage' | 'quality'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  llmType?: LLMType
  timestamp: Date
  data: any
  resolved: boolean
}

export interface LLMDashboardData {
  overview: {
    totalLLMs: number
    activeLLMs: number
    averageScore: number
    totalOptimizations: number
  }
  realtimeMetrics: {
    currentOptimizations: number
    queuedOptimizations: number
    systemHealth: 'healthy' | 'warning' | 'critical'
    lastUpdate: Date
  }
  performanceChart: {
    labels: string[]
    datasets: {
      name: string
      data: number[]
      color: string
    }[]
  }
  llmStatus: {
    llmType: LLMType
    status: 'active' | 'inactive' | 'error'
    lastOptimization: Date
    averageScore: number
    issues: number
  }[]
  alerts: LLMOptimizationAlert[]
  recommendations: string[]
}

export const useLLMAnalytics = () => {
  const orchestrator = useLLMOrchestrator()
  const testing = useLLMTesting()

  // In-memory storage for demo purposes (in production, use a database)
  const performanceHistory: LLMPerformanceMetrics[] = []
  const usageMetrics: Map<LLMType, LLMUsageMetrics> = new Map()
  const alerts: LLMOptimizationAlert[] = []

  /**
   * Track LLM optimization performance
   */
  const trackOptimization = (
    llmType: LLMType,
    result: any,
    config: LLMOptimizationConfig,
    executionTime: number
  ) => {
    // Record performance metrics
    const metrics: LLMPerformanceMetrics = {
      timestamp: new Date(),
      llmType,
      optimizationScore: result.optimizationScore || 0,
      executionTime,
      validationErrors: result.validation?.errors?.length || 0,
      configComplexity: calculateConfigComplexity(config)
    }
    
    performanceHistory.push(metrics)

    // Update usage metrics
    const existing = usageMetrics.get(llmType) || {
      llmType,
      totalOptimizations: 0,
      successfulOptimizations: 0,
      averageScore: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      errorCount: 0,
      lastUsed: new Date()
    }

    existing.totalOptimizations++
    existing.lastUsed = new Date()
    existing.totalExecutionTime += executionTime
    existing.averageExecutionTime = existing.totalExecutionTime / existing.totalOptimizations

    if (result.optimizationScore >= 70) {
      existing.successfulOptimizations++
    }

    if (result.validation?.errors?.length > 0) {
      existing.errorCount += result.validation.errors.length
    }

    // Recalculate average score
    const recentScores = performanceHistory
      .filter(m => m.llmType === llmType)
      .slice(-10)
      .map(m => m.optimizationScore)
    
    existing.averageScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length

    usageMetrics.set(llmType, existing)

    // Check for alerts
    checkForAlerts(llmType, metrics, existing)
  }

  /**
   * Calculate configuration complexity score
   */
  const calculateConfigComplexity = (config: LLMOptimizationConfig): number => {
    let complexity = 0
    
    if (config.features) complexity += config.features.length
    if (config.useCases) complexity += config.useCases.length * 2
    if (config.benefits) complexity += config.benefits.length
    if (config.keywords) complexity += config.keywords.length * 0.5
    if (config.targetAudience) complexity += config.targetAudience.length * 1.5
    if (config.enabledLLMs) complexity += config.enabledLLMs.length * 3
    if (config.tier2Config) complexity += Object.keys(config.tier2Config).length * 2
    if (config.tier3Config) complexity += Object.keys(config.tier3Config).length * 2

    return Math.round(complexity)
  }

  /**
   * Check for performance alerts
   */
  const checkForAlerts = (
    llmType: LLMType,
    metrics: LLMPerformanceMetrics,
    usage: LLMUsageMetrics
  ) => {
    // Performance degradation alert
    if (metrics.optimizationScore < 50) {
      addAlert({
        type: 'performance',
        severity: 'high',
        message: `${llmType} optimization score critically low: ${metrics.optimizationScore}`,
        llmType,
        data: { score: metrics.optimizationScore, executionTime: metrics.executionTime }
      })
    } else if (metrics.optimizationScore < 70) {
      addAlert({
        type: 'quality',
        severity: 'medium',
        message: `${llmType} optimization score below target: ${metrics.optimizationScore}`,
        llmType,
        data: { score: metrics.optimizationScore }
      })
    }

    // High error rate alert
    const errorRate = usage.errorCount / usage.totalOptimizations
    if (errorRate > 0.3) {
      addAlert({
        type: 'error',
        severity: 'high',
        message: `${llmType} has high error rate: ${Math.round(errorRate * 100)}%`,
        llmType,
        data: { errorRate, totalErrors: usage.errorCount, totalOptimizations: usage.totalOptimizations }
      })
    }

    // Slow performance alert
    if (metrics.executionTime > 5000) {
      addAlert({
        type: 'performance',
        severity: 'medium',
        message: `${llmType} optimization took ${metrics.executionTime}ms (slow performance)`,
        llmType,
        data: { executionTime: metrics.executionTime }
      })
    }

    // High usage alert
    if (usage.totalOptimizations > 1000) {
      addAlert({
        type: 'usage',
        severity: 'low',
        message: `${llmType} has high usage: ${usage.totalOptimizations} optimizations`,
        llmType,
        data: { totalOptimizations: usage.totalOptimizations }
      })
    }
  }

  /**
   * Add a new alert
   */
  const addAlert = (alertData: Omit<LLMOptimizationAlert, 'id' | 'timestamp' | 'resolved'>) => {
    const alert: LLMOptimizationAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alertData
    }
    
    alerts.push(alert)
    
    // Keep only the last 100 alerts
    if (alerts.length > 100) {
      alerts.splice(0, alerts.length - 100)
    }
  }

  /**
   * Get analytics data for a specific period
   */
  const getAnalyticsData = (
    period: 'daily' | 'weekly' | 'monthly',
    startDate?: Date,
    endDate?: Date
  ): LLMAnalyticsData => {
    const now = new Date()
    const start = startDate || new Date(now.getTime() - getPeriodMs(period))
    const end = endDate || now

    // Filter metrics by date range
    const periodMetrics = performanceHistory.filter(
      m => m.timestamp >= start && m.timestamp <= end
    )

    // Calculate overall performance
    const totalOptimizations = periodMetrics.length
    const averageScore = periodMetrics.length > 0 
      ? periodMetrics.reduce((sum, m) => sum + m.optimizationScore, 0) / periodMetrics.length 
      : 0
    const successfulOptimizations = periodMetrics.filter(m => m.optimizationScore >= 70).length
    const successRate = totalOptimizations > 0 ? successfulOptimizations / totalOptimizations : 0
    const averageExecutionTime = periodMetrics.length > 0
      ? periodMetrics.reduce((sum, m) => sum + m.executionTime, 0) / periodMetrics.length
      : 0

    // Calculate tier performance
    const tier1LLMs: LLMType[] = ['chatgpt', 'claude', 'gemini', 'copilot', 'perplexity']
    const tier2LLMs: LLMType[] = ['searchgpt', 'you', 'phind', 'kagi']
    const tier3LLMs: LLMType[] = ['meta-ai', 'character-ai', 'poe', 'huggingface']

    const tier1Metrics = periodMetrics.filter(m => tier1LLMs.includes(m.llmType))
    const tier2Metrics = periodMetrics.filter(m => tier2LLMs.includes(m.llmType))
    const tier3Metrics = periodMetrics.filter(m => tier3LLMs.includes(m.llmType))

    // Get current usage metrics
    const currentUsageMetrics = Array.from(usageMetrics.values())

    // Calculate trends
    const previousPeriodStart = new Date(start.getTime() - getPeriodMs(period))
    const previousPeriodMetrics = performanceHistory.filter(
      m => m.timestamp >= previousPeriodStart && m.timestamp < start
    )
    
    const previousAverageScore = previousPeriodMetrics.length > 0
      ? previousPeriodMetrics.reduce((sum, m) => sum + m.optimizationScore, 0) / previousPeriodMetrics.length
      : 0

    const scoreImprovement = averageScore - previousAverageScore

    // Get popular LLMs
    const llmUsageCount: Record<LLMType, number> = {} as Record<LLMType, number>
    periodMetrics.forEach(m => {
      llmUsageCount[m.llmType] = (llmUsageCount[m.llmType] || 0) + 1
    })
    
    const popularLLMs = Object.entries(llmUsageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([llm]) => llm as LLMType)

    // Identify emerging issues
    const emergingIssues = identifyEmergingIssues(periodMetrics)

    return {
      period,
      startDate: start,
      endDate: end,
      totalOptimizations,
      uniqueConfigurations: new Set(periodMetrics.map(m => m.configComplexity)).size,
      overallPerformance: {
        averageScore: Math.round(averageScore),
        successRate: Math.round(successRate * 100) / 100,
        averageExecutionTime: Math.round(averageExecutionTime)
      },
      tierPerformance: {
        tier1: {
          average: Math.round(tier1Metrics.reduce((sum, m) => sum + m.optimizationScore, 0) / Math.max(tier1Metrics.length, 1)),
          count: tier1Metrics.length
        },
        tier2: {
          average: Math.round(tier2Metrics.reduce((sum, m) => sum + m.optimizationScore, 0) / Math.max(tier2Metrics.length, 1)),
          count: tier2Metrics.length
        },
        tier3: {
          average: Math.round(tier3Metrics.reduce((sum, m) => sum + m.optimizationScore, 0) / Math.max(tier3Metrics.length, 1)),
          count: tier3Metrics.length
        }
      },
      llmMetrics: currentUsageMetrics,
      trends: {
        scoreImprovement: Math.round(scoreImprovement * 10) / 10,
        performanceTrend: scoreImprovement > 2 ? 'improving' : scoreImprovement < -2 ? 'declining' : 'stable',
        popularLLMs,
        emergingIssues
      }
    }
  }

  /**
   * Get period duration in milliseconds
   */
  const getPeriodMs = (period: 'daily' | 'weekly' | 'monthly'): number => {
    switch (period) {
      case 'daily': return 24 * 60 * 60 * 1000
      case 'weekly': return 7 * 24 * 60 * 60 * 1000
      case 'monthly': return 30 * 24 * 60 * 60 * 1000
      default: return 24 * 60 * 60 * 1000
    }
  }

  /**
   * Identify emerging issues from metrics
   */
  const identifyEmergingIssues = (metrics: LLMPerformanceMetrics[]): string[] => {
    const issues: string[] = []
    
    // High validation error rate
    const highErrorMetrics = metrics.filter(m => m.validationErrors > 0)
    if (highErrorMetrics.length / metrics.length > 0.2) {
      issues.push('Increasing validation error rate across LLMs')
    }

    // Slow performance trend
    const recentMetrics = metrics.slice(-10)
    const oldMetrics = metrics.slice(0, 10)
    if (recentMetrics.length > 0 && oldMetrics.length > 0) {
      const recentAvgTime = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length
      const oldAvgTime = oldMetrics.reduce((sum, m) => sum + m.executionTime, 0) / oldMetrics.length
      
      if (recentAvgTime > oldAvgTime * 1.5) {
        issues.push('Performance degradation detected')
      }
    }

    // Low score trend
    const lowScoreMetrics = metrics.filter(m => m.optimizationScore < 60)
    if (lowScoreMetrics.length / metrics.length > 0.15) {
      issues.push('Quality scores trending downward')
    }

    return issues
  }

  /**
   * Generate dashboard data
   */
  const generateDashboardData = (): LLMDashboardData => {
    const analyticsData = getAnalyticsData('daily')
    const llmConfigs = orchestrator.llmConfigs
    
    // Calculate overview
    const totalLLMs = Object.keys(llmConfigs).length
    const activeLLMs = Array.from(usageMetrics.keys()).length
    const recentMetrics = performanceHistory.slice(-50)
    const averageScore = recentMetrics.length > 0
      ? Math.round(recentMetrics.reduce((sum, m) => sum + m.optimizationScore, 0) / recentMetrics.length)
      : 0

    // Generate performance chart data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const chartData = {
      labels: last7Days,
      datasets: [
        {
          name: 'Average Score',
          data: last7Days.map((_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            const dayStart = new Date(date.setHours(0, 0, 0, 0))
            const dayEnd = new Date(date.setHours(23, 59, 59, 999))
            
            const dayMetrics = performanceHistory.filter(
              m => m.timestamp >= dayStart && m.timestamp <= dayEnd
            )
            
            return dayMetrics.length > 0
              ? Math.round(dayMetrics.reduce((sum, m) => sum + m.optimizationScore, 0) / dayMetrics.length)
              : 0
          }),
          color: '#3b82f6'
        }
      ]
    }

    // Generate LLM status
    const llmStatus = Object.entries(llmConfigs).map(([llmType, config]) => {
      const usage = usageMetrics.get(llmType as LLMType)
      const recentAlerts = alerts.filter(a => a.llmType === llmType && !a.resolved)
      
      return {
        llmType: llmType as LLMType,
        status: usage ? (recentAlerts.length > 0 ? 'error' : 'active') : 'inactive',
        lastOptimization: usage?.lastUsed || new Date(0),
        averageScore: Math.round(usage?.averageScore || 0),
        issues: recentAlerts.length
      }
    })

    // Get recent unresolved alerts
    const recentAlerts = alerts
      .filter(a => !a.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)

    // Generate recommendations
    const recommendations = generateDashboardRecommendations(analyticsData, recentAlerts)

    return {
      overview: {
        totalLLMs,
        activeLLMs,
        averageScore,
        totalOptimizations: analyticsData.totalOptimizations
      },
      realtimeMetrics: {
        currentOptimizations: 0, // Would be real-time in production
        queuedOptimizations: 0,
        systemHealth: recentAlerts.filter(a => a.severity === 'critical').length > 0 
          ? 'critical' 
          : recentAlerts.filter(a => a.severity === 'high').length > 0 
            ? 'warning' 
            : 'healthy',
        lastUpdate: new Date()
      },
      performanceChart: chartData,
      llmStatus,
      alerts: recentAlerts,
      recommendations
    }
  }

  /**
   * Generate dashboard recommendations
   */
  const generateDashboardRecommendations = (
    analytics: LLMAnalyticsData,
    recentAlerts: LLMOptimizationAlert[]
  ): string[] => {
    const recommendations: string[] = []

    // Performance recommendations
    if (analytics.overallPerformance.averageScore < 75) {
      recommendations.push('Overall optimization scores are below target - consider tuning algorithms')
    }

    if (analytics.overallPerformance.successRate < 0.8) {
      recommendations.push('Success rate is low - review validation rules and error handling')
    }

    // Tier-specific recommendations
    if (analytics.tierPerformance.tier1.average < 80) {
      recommendations.push('Tier 1 LLMs underperforming - prioritize core platform optimization')
    }

    if (analytics.tierPerformance.tier2.average < 70) {
      recommendations.push('Tier 2 LLMs need improvement - enhance medium priority features')
    }

    if (analytics.tierPerformance.tier3.average < 65) {
      recommendations.push('Tier 3 LLMs require attention - consider disabling or improving emerging features')
    }

    // Alert-based recommendations
    const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical')
    if (criticalAlerts.length > 0) {
      recommendations.push(`${criticalAlerts.length} critical issues require immediate attention`)
    }

    const highAlerts = recentAlerts.filter(a => a.severity === 'high')
    if (highAlerts.length > 3) {
      recommendations.push('Multiple high-severity issues detected - schedule maintenance window')
    }

    // Usage recommendations
    const lowUsageLLMs = analytics.llmMetrics.filter(m => m.totalOptimizations < 10)
    if (lowUsageLLMs.length > 0) {
      recommendations.push(`Consider promoting underutilized LLMs: ${lowUsageLLMs.map(m => m.llmType).join(', ')}`)
    }

    return recommendations.slice(0, 5) // Limit to top 5 recommendations
  }

  /**
   * Resolve an alert
   */
  const resolveAlert = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
    }
  }

  /**
   * Clear old alerts
   */
  const clearOldAlerts = (olderThanDays: number = 7) => {
    const cutoffDate = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000))
    const initialLength = alerts.length
    
    // Remove old resolved alerts
    for (let i = alerts.length - 1; i >= 0; i--) {
      const alert = alerts[i]
      if (alert.resolved && alert.timestamp < cutoffDate) {
        alerts.splice(i, 1)
      }
    }
    
    return initialLength - alerts.length // Return number of alerts cleared
  }

  /**
   * Export analytics data
   */
  const exportAnalyticsData = (format: 'json' | 'csv' = 'json') => {
    const data = {
      exportDate: new Date().toISOString(),
      performanceHistory: performanceHistory.slice(-1000), // Last 1000 records
      usageMetrics: Array.from(usageMetrics.entries()),
      alerts: alerts.filter(a => !a.resolved), // Only unresolved alerts
      analytics: getAnalyticsData('monthly')
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else {
      // Convert to CSV format (simplified)
      const csvLines = [
        'Timestamp,LLM Type,Optimization Score,Execution Time,Validation Errors',
        ...performanceHistory.slice(-1000).map(m => 
          `${m.timestamp.toISOString()},${m.llmType},${m.optimizationScore},${m.executionTime},${m.validationErrors}`
        )
      ]
      return csvLines.join('\n')
    }
  }

  return {
    // Tracking
    trackOptimization,
    
    // Analytics
    getAnalyticsData,
    generateDashboardData,
    
    // Alerts
    addAlert,
    resolveAlert,
    clearOldAlerts,
    
    // Utilities
    calculateConfigComplexity,
    exportAnalyticsData,
    
    // Data access
    getPerformanceHistory: () => [...performanceHistory],
    getUsageMetrics: () => new Map(usageMetrics),
    getAlerts: () => [...alerts]
  }
}
