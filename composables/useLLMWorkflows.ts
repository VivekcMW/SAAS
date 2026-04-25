/**
 * LLM Automation Workflow System
 * Automated workflows for LLM optimization, testing, and monitoring
 */

import { useLLMOrchestrator } from './useLLMOrchestrator'
import { useLLMTesting } from './useLLMTesting'
import { useLLMAnalytics } from './useLLMAnalytics'
import type { LLMOptimizationConfig, LLMType } from './useLLMOrchestrator'

export interface WorkflowStep {
  id: string
  name: string
  type: 'optimization' | 'testing' | 'validation' | 'analytics' | 'notification'
  config: any
  dependencies?: string[]
  retryCount?: number
  timeout?: number
}

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  trigger: 'manual' | 'scheduled' | 'event'
  schedule?: string // Cron expression for scheduled workflows
  steps: WorkflowStep[]
  onSuccess?: string[] // Notification targets
  onFailure?: string[] // Notification targets
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: Date
  endTime?: Date
  currentStep?: string
  results: Record<string, any>
  errors: string[]
  logs: WorkflowLog[]
}

export interface WorkflowLog {
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  step: string
  message: string
  data?: any
}

export interface AutomatedOptimizationConfig {
  targetAudience: string
  businessType: 'startup' | 'enterprise' | 'agency' | 'freelancer'
  priority: 'speed' | 'quality' | 'comprehensive'
  enableTier2: boolean
  enableTier3: boolean
  customRules?: {
    minScore?: number
    maxExecutionTime?: number
    requiredLLMs?: LLMType[]
  }
}

export const useLLMWorkflows = () => {
  const orchestrator = useLLMOrchestrator()
  const testing = useLLMTesting()
  const analytics = useLLMAnalytics()

  // Active workflow executions
  const activeExecutions = new Map<string, WorkflowExecution>()
  
  // Workflow execution history
  const executionHistory: WorkflowExecution[] = []

  /**
   * Predefined workflow definitions
   */
  const workflowDefinitions: Record<string, WorkflowDefinition> = {
    'complete-optimization': {
      id: 'complete-optimization',
      name: 'Complete LLM Optimization',
      description: 'Full optimization workflow including all tiers, testing, and analytics',
      trigger: 'manual',
      steps: [
        {
          id: 'validate-config',
          name: 'Validate Configuration',
          type: 'validation',
          config: { strict: true }
        },
        {
          id: 'tier1-optimization',
          name: 'Optimize Tier 1 LLMs',
          type: 'optimization',
          config: { tier: 'tier1' },
          dependencies: ['validate-config']
        },
        {
          id: 'tier2-optimization',
          name: 'Optimize Tier 2 LLMs',
          type: 'optimization',
          config: { tier: 'tier2' },
          dependencies: ['tier1-optimization']
        },
        {
          id: 'tier3-optimization',
          name: 'Optimize Tier 3 LLMs',
          type: 'optimization',
          config: { tier: 'tier3' },
          dependencies: ['tier2-optimization']
        },
        {
          id: 'run-tests',
          name: 'Run Comprehensive Tests',
          type: 'testing',
          config: { suites: ['basic', 'comprehensive'] },
          dependencies: ['tier3-optimization']
        },
        {
          id: 'analyze-results',
          name: 'Analyze Results',
          type: 'analytics',
          config: { generateReport: true },
          dependencies: ['run-tests']
        },
        {
          id: 'notify-completion',
          name: 'Send Completion Notification',
          type: 'notification',
          config: { type: 'success' },
          dependencies: ['analyze-results']
        }
      ],
      onSuccess: ['admin@moonmart.ai'],
      onFailure: ['admin@moonmart.ai', 'dev@moonmart.ai']
    },
    
    'quick-optimization': {
      id: 'quick-optimization',
      name: 'Quick LLM Optimization',
      description: 'Fast optimization focusing on Tier 1 LLMs only',
      trigger: 'manual',
      steps: [
        {
          id: 'tier1-optimization',
          name: 'Optimize Core LLMs',
          type: 'optimization',
          config: { tier: 'tier1', timeout: 30000 }
        },
        {
          id: 'quick-validation',
          name: 'Quick Validation',
          type: 'testing',
          config: { suites: ['basic'] },
          dependencies: ['tier1-optimization']
        },
        {
          id: 'track-metrics',
          name: 'Track Performance Metrics',
          type: 'analytics',
          config: { lightweight: true },
          dependencies: ['quick-validation']
        }
      ]
    },

    'scheduled-monitoring': {
      id: 'scheduled-monitoring',
      name: 'Scheduled System Monitoring',
      description: 'Regular monitoring and health checks',
      trigger: 'scheduled',
      schedule: '0 */6 * * *', // Every 6 hours
      steps: [
        {
          id: 'health-check',
          name: 'System Health Check',
          type: 'analytics',
          config: { healthCheck: true }
        },
        {
          id: 'performance-test',
          name: 'Performance Test',
          type: 'testing',
          config: { suites: ['performance'] },
          dependencies: ['health-check']
        },
        {
          id: 'alert-check',
          name: 'Check for Alerts',
          type: 'analytics',
          config: { checkAlerts: true },
          dependencies: ['performance-test']
        }
      ]
    },

    'quality-assurance': {
      id: 'quality-assurance',
      name: 'Quality Assurance Workflow',
      description: 'Comprehensive quality testing and validation',
      trigger: 'manual',
      steps: [
        {
          id: 'full-test-suite',
          name: 'Run All Test Suites',
          type: 'testing',
          config: { suites: ['basic', 'comprehensive', 'performance', 'specialized'] }
        },
        {
          id: 'quality-analysis',
          name: 'Quality Analysis',
          type: 'analytics',
          config: { qualityFocus: true },
          dependencies: ['full-test-suite']
        },
        {
          id: 'generate-qa-report',
          name: 'Generate QA Report',
          type: 'analytics',
          config: { reportType: 'quality' },
          dependencies: ['quality-analysis']
        }
      ]
    }
  }

  /**
   * Execute a workflow
   */
  const executeWorkflow = async (
    workflowId: string,
    config: LLMOptimizationConfig,
    customSteps?: WorkflowStep[]
  ): Promise<WorkflowExecution> => {
    const workflow = workflowDefinitions[workflowId]
    if (!workflow) {
      throw new Error(`Workflow '${workflowId}' not found`)
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'pending',
      startTime: new Date(),
      results: {},
      errors: [],
      logs: []
    }

    activeExecutions.set(executionId, execution)

    try {
      execution.status = 'running'
      logWorkflowStep(execution, 'info', 'workflow', `Starting workflow: ${workflow.name}`)

      const steps = customSteps || workflow.steps
      const completedSteps = new Set<string>()

      // Execute steps in dependency order
      while (completedSteps.size < steps.length) {
        const readySteps = steps.filter(step => 
          !completedSteps.has(step.id) &&
          (step.dependencies?.every(dep => completedSteps.has(dep)) ?? true)
        )

        if (readySteps.length === 0) {
          throw new Error('Circular dependency detected in workflow steps')
        }

        // Execute ready steps (can be parallel)
        await Promise.all(readySteps.map(async (step) => {
          try {
            execution.currentStep = step.id
            logWorkflowStep(execution, 'info', step.id, `Executing step: ${step.name}`)

            const result = await executeWorkflowStep(step, config, execution)
            execution.results[step.id] = result
            completedSteps.add(step.id)

            logWorkflowStep(execution, 'info', step.id, `Step completed successfully`)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            execution.errors.push(`Step ${step.id}: ${errorMessage}`)
            logWorkflowStep(execution, 'error', step.id, `Step failed: ${errorMessage}`)
            
            // Retry logic
            if (step.retryCount && step.retryCount > 0) {
              logWorkflowStep(execution, 'info', step.id, `Retrying step (${step.retryCount} attempts remaining)`)
              step.retryCount--
              // Don't mark as completed, will retry in next iteration
            } else {
              throw error // Propagate error to fail the workflow
            }
          }
        }))
      }

      execution.status = 'completed'
      execution.endTime = new Date()
      logWorkflowStep(execution, 'info', 'workflow', 'Workflow completed successfully')

      // Send success notifications
      if (workflow.onSuccess) {
        await sendNotifications(workflow.onSuccess, 'success', execution)
      }

    } catch (error) {
      execution.status = 'failed'
      execution.endTime = new Date()
      const errorMessage = error instanceof Error ? error.message : String(error)
      execution.errors.push(errorMessage)
      logWorkflowStep(execution, 'error', 'workflow', `Workflow failed: ${errorMessage}`)

      // Send failure notifications
      if (workflow.onFailure) {
        await sendNotifications(workflow.onFailure, 'failure', execution)
      }
    } finally {
      activeExecutions.delete(executionId)
      executionHistory.push({ ...execution })
      
      // Keep only last 100 executions in history
      if (executionHistory.length > 100) {
        executionHistory.splice(0, executionHistory.length - 100)
      }
    }

    return execution
  }

  /**
   * Execute a single workflow step
   */
  const executeWorkflowStep = async (
    step: WorkflowStep,
    config: LLMOptimizationConfig,
    execution: WorkflowExecution
  ): Promise<any> => {
    switch (step.type) {
      case 'optimization':
        return await executeOptimizationStep(step, config)
      
      case 'testing':
        return await executeTestingStep(step, config)
      
      case 'validation':
        return await executeValidationStep(step, config)
      
      case 'analytics':
        return await executeAnalyticsStep(step, config, execution)
      
      case 'notification':
        return await executeNotificationStep(step, execution)
      
      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  }

  /**
   * Execute optimization step
   */
  const executeOptimizationStep = async (
    step: WorkflowStep,
    config: LLMOptimizationConfig
  ) => {
    const { tier } = step.config
    
    let enabledLLMs: LLMType[]
    if (tier === 'tier1') {
      enabledLLMs = ['chatgpt', 'claude', 'gemini', 'copilot', 'perplexity']
    } else if (tier === 'tier2') {
      enabledLLMs = ['searchgpt', 'you', 'phind', 'kagi']
    } else if (tier === 'tier3') {
      enabledLLMs = ['meta-ai', 'character-ai', 'poe', 'huggingface']
    } else {
      enabledLLMs = config.enabledLLMs || ['chatgpt', 'claude', 'gemini']
    }

    const optimizationConfig = {
      ...config,
      enabledLLMs
    }

    const startTime = Date.now()
    const result = orchestrator.orchestrateLLMOptimization(optimizationConfig)
    const executionTime = Date.now() - startTime

    // Track optimization metrics
    for (const llmResult of result.results) {
      analytics.trackOptimization(
        llmResult.llmType,
        llmResult,
        optimizationConfig,
        executionTime / result.results.length
      )
    }

    return {
      tier,
      results: result,
      executionTime,
      llmCount: result.results.length,
      averageScore: result.overallScore
    }
  }

  /**
   * Execute testing step
   */
  const executeTestingStep = async (
    step: WorkflowStep,
    config: LLMOptimizationConfig
  ) => {
    const { suites } = step.config
    const results: Record<string, any> = {}

    for (const suiteName of suites) {
      try {
        const benchmarkResult = await testing.runTestSuite(suiteName)
        results[suiteName] = benchmarkResult
      } catch (error) {
        results[suiteName] = {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }

    return {
      suites,
      results,
      summary: {
        totalSuites: suites.length,
        successfulSuites: Object.values(results).filter(r => !r.error).length
      }
    }
  }

  /**
   * Execute validation step
   */
  const executeValidationStep = async (
    step: WorkflowStep,
    config: LLMOptimizationConfig
  ) => {
    const { strict } = step.config
    const errors: string[] = []
    const warnings: string[] = []

    // Validate required fields
    if (!config.title) errors.push('Title is required')
    if (!config.description) errors.push('Description is required')
    if (!config.category) warnings.push('Category not specified')

    // Validate arrays
    if (!config.features || config.features.length === 0) {
      warnings.push('No features specified')
    }
    if (!config.targetAudience || config.targetAudience.length === 0) {
      warnings.push('No target audience specified')
    }

    // Validate LLM configuration
    if (config.enabledLLMs && config.enabledLLMs.length === 0) {
      errors.push('At least one LLM must be enabled')
    }

    // Strict validation
    if (strict) {
      if (!config.useCases || config.useCases.length < 2) {
        errors.push('At least 2 use cases required in strict mode')
      }
      if (!config.benefits || config.benefits.length < 3) {
        errors.push('At least 3 benefits required in strict mode')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      strictMode: strict
    }
  }

  /**
   * Execute analytics step
   */
  const executeAnalyticsStep = async (
    step: WorkflowStep,
    config: LLMOptimizationConfig,
    execution: WorkflowExecution
  ) => {
    const { generateReport, healthCheck, checkAlerts, lightweight, qualityFocus, reportType } = step.config

    const result: any = {}

    if (healthCheck) {
      result.healthCheck = analytics.generateDashboardData().realtimeMetrics
    }

    if (checkAlerts) {
      const alerts = analytics.getAlerts()
      result.alerts = {
        total: alerts.length,
        unresolved: alerts.filter(a => !a.resolved).length,
        critical: alerts.filter(a => a.severity === 'critical').length
      }
    }

    if (generateReport || reportType) {
      const analyticsData = analytics.getAnalyticsData('daily')
      result.analyticsData = analyticsData
      
      if (reportType === 'quality') {
        result.qualityReport = {
          overallScore: analyticsData.overallPerformance.averageScore,
          successRate: analyticsData.overallPerformance.successRate,
          tierAnalysis: analyticsData.tierPerformance,
          recommendations: []
        }
      }
    }

    if (!lightweight) {
      result.dashboardData = analytics.generateDashboardData()
    }

    return result
  }

  /**
   * Execute notification step
   */
  const executeNotificationStep = async (
    step: WorkflowStep,
    execution: WorkflowExecution
  ) => {
    const { type } = step.config
    
    // In a real implementation, this would send actual notifications
    const notification = {
      type,
      workflowId: execution.workflowId,
      executionId: execution.id,
      status: execution.status,
      timestamp: new Date(),
      summary: generateExecutionSummary(execution)
    }

    // Simulate notification sending
    console.log('Notification sent:', notification)

    return notification
  }

  /**
   * Send notifications
   */
  const sendNotifications = async (
    targets: string[],
    type: 'success' | 'failure',
    execution: WorkflowExecution
  ) => {
    const notifications = targets.map(target => ({
      target,
      type,
      execution: execution.id,
      timestamp: new Date()
    }))

    // In a real implementation, this would send actual notifications
    console.log('Sending notifications:', notifications)
    
    return notifications
  }

  /**
   * Log workflow step
   */
  const logWorkflowStep = (
    execution: WorkflowExecution,
    level: 'info' | 'warn' | 'error' | 'debug',
    step: string,
    message: string,
    data?: any
  ) => {
    const log: WorkflowLog = {
      timestamp: new Date(),
      level,
      step,
      message,
      data
    }
    
    execution.logs.push(log)
    console.log(`[${level.toUpperCase()}] ${step}: ${message}`, data)
  }

  /**
   * Generate execution summary
   */
  const generateExecutionSummary = (execution: WorkflowExecution) => {
    const duration = execution.endTime 
      ? execution.endTime.getTime() - execution.startTime.getTime()
      : Date.now() - execution.startTime.getTime()

    return {
      workflowId: execution.workflowId,
      status: execution.status,
      duration: `${Math.round(duration / 1000)}s`,
      stepsCompleted: Object.keys(execution.results).length,
      errors: execution.errors.length,
      logs: execution.logs.length
    }
  }

  /**
   * Create automated optimization workflow
   */
  const createAutomatedOptimization = (
    config: LLMOptimizationConfig,
    automationConfig: AutomatedOptimizationConfig
  ): WorkflowDefinition => {
    const steps: WorkflowStep[] = []
    
    // Always start with validation
    steps.push({
      id: 'validate-config',
      name: 'Validate Configuration',
      type: 'validation',
      config: { strict: automationConfig.priority === 'quality' }
    })

    // Tier 1 is always included
    steps.push({
      id: 'tier1-optimization',
      name: 'Optimize Core LLMs (Tier 1)',
      type: 'optimization',
      config: { 
        tier: 'tier1',
        timeout: automationConfig.priority === 'speed' ? 30000 : 60000
      },
      dependencies: ['validate-config']
    })

    let lastStepId = 'tier1-optimization'

    // Add Tier 2 if enabled
    if (automationConfig.enableTier2) {
      steps.push({
        id: 'tier2-optimization',
        name: 'Optimize Medium Priority LLMs (Tier 2)',
        type: 'optimization',
        config: { tier: 'tier2' },
        dependencies: [lastStepId]
      })
      lastStepId = 'tier2-optimization'
    }

    // Add Tier 3 if enabled
    if (automationConfig.enableTier3) {
      steps.push({
        id: 'tier3-optimization',
        name: 'Optimize Emerging LLMs (Tier 3)',
        type: 'optimization',
        config: { tier: 'tier3' },
        dependencies: [lastStepId]
      })
      lastStepId = 'tier3-optimization'
    }

    // Add testing based on priority
    if (automationConfig.priority === 'comprehensive' || automationConfig.priority === 'quality') {
      steps.push({
        id: 'comprehensive-testing',
        name: 'Run Comprehensive Tests',
        type: 'testing',
        config: { suites: ['basic', 'comprehensive', 'performance'] },
        dependencies: [lastStepId]
      })
      lastStepId = 'comprehensive-testing'
    } else {
      steps.push({
        id: 'basic-testing',
        name: 'Run Basic Tests',
        type: 'testing',
        config: { suites: ['basic'] },
        dependencies: [lastStepId]
      })
      lastStepId = 'basic-testing'
    }

    // Always add analytics
    steps.push({
      id: 'analyze-results',
      name: 'Analyze Results',
      type: 'analytics',
      config: { 
        generateReport: true,
        lightweight: automationConfig.priority === 'speed'
      },
      dependencies: [lastStepId]
    })

    return {
      id: `auto-optimization-${Date.now()}`,
      name: `Automated Optimization (${automationConfig.targetAudience})`,
      description: `Automated workflow for ${automationConfig.businessType} targeting ${automationConfig.targetAudience}`,
      trigger: 'manual',
      steps
    }
  }

  /**
   * Get workflow status
   */
  const getWorkflowStatus = (executionId: string) => {
    const active = activeExecutions.get(executionId)
    if (active) return active

    return executionHistory.find(e => e.id === executionId)
  }

  /**
   * Cancel workflow execution
   */
  const cancelWorkflow = (executionId: string) => {
    const execution = activeExecutions.get(executionId)
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled'
      execution.endTime = new Date()
      logWorkflowStep(execution, 'info', 'workflow', 'Workflow cancelled by user')
      activeExecutions.delete(executionId)
      executionHistory.push({ ...execution })
      return true
    }
    return false
  }

  /**
   * Get workflow execution history
   */
  const getExecutionHistory = (limit: number = 50) => {
    return executionHistory
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit)
  }

  return {
    // Workflow execution
    executeWorkflow,
    createAutomatedOptimization,
    
    // Workflow management
    getWorkflowStatus,
    cancelWorkflow,
    getExecutionHistory,
    
    // Utilities
    generateExecutionSummary,
    
    // Configuration
    workflowDefinitions,
    
    // Active state
    getActiveExecutions: () => new Map(activeExecutions)
  }
}
