/**
 * LLM Orchestrator Composable
 *
 * Coordinates optimization across all supported LLM engines using
 * data-driven profiles (see llmProfiles.ts) and a single shared
 * optimization function (useLLMEngineOptimization.ts).
 *
 * Public API preserved so existing consumers keep working:
 *   - useLLMOrchestrator, orchestrateLLMOptimization,
 *     generateOptimizationReport, optimizeForLLM,
 *     optimizeChatGPT / Claude / … convenience helpers,
 *     getLLMOptimizationStatus, generateLLMAnalytics,
 *     getLLMsByTier, getRecommendedLLMs, llmConfigs,
 *     types: LLMType, LLMTier, LLMOptimizationConfig,
 *             LLMOrchestrationResult, LLMOptimizationResult,
 *             LLMConfig.
 */

import {
  LLM_PROFILES,
  ALL_LLM_TYPES,
  type LLMProfile,
  type LLMTier,
  type LLMType
} from './llmProfiles'
import {
  optimizeForEngine,
  type EngineOptimizationResult,
  type LLMOptimizationConfig as EngineConfig
} from './useLLMEngineOptimization'

// Re-export core types used by downstream composables
export type { LLMType, LLMTier, LLMProfile }

export interface LLMOptimizationConfig extends EngineConfig {
  enabledLLMs?: LLMType[]
  priority?: 'high' | 'medium' | 'low'
  tier2Config?: {
    searchOptimization?: boolean
    privacyFocus?: boolean
    developerTargeted?: boolean
    premiumQuality?: boolean
  }
  tier3Config?: {
    socialIntegration?: boolean
    conversationalMode?: boolean
    qaFormat?: boolean
    openSourceFocus?: boolean
  }
}

export interface LLMConfig {
  type: LLMType
  tier: LLMTier
  priority: number
  enabled: boolean
  features: string[]
}

export interface LLMOptimizationResult {
  llmType: LLMType
  content: EngineOptimizationResult['content']
  validation: EngineOptimizationResult['validation']
  metaTags: Record<string, string>
  schema: Record<string, unknown>
  optimizationScore: number
}

export interface LLMOrchestrationResult {
  results: LLMOptimizationResult[]
  aggregatedMetaTags: Record<string, string>
  combinedSchema: Record<string, unknown>[]
  overallScore: number
  recommendations: string[]
  implementationPlan: {
    phase1: LLMType[]
    phase2: LLMType[]
    phase3: LLMType[]
  }
  tierAnalysis: {
    tier1Score: number
    tier2Score: number
    tier3Score: number
  }
  analytics: {
    totalOptimizations: number
    successfulOptimizations: number
    averageScore: number
    topPerforming: LLMType[]
    needsImprovement: LLMType[]
  }
}

// Flat record matching the old shape (type → LLMConfig)
const llmConfigs: Record<LLMType, LLMConfig> = Object.fromEntries(
  ALL_LLM_TYPES.map((t) => {
    const p = LLM_PROFILES[t]
    return [
      t,
      {
        type: p.type,
        tier: p.tier,
        priority: p.priority,
        enabled: p.enabled,
        features: p.features
      }
    ]
  })
) as Record<LLMType, LLMConfig>

// ── Helpers ────────────────────────────────────────────────────────────
function toLLMResult(r: EngineOptimizationResult): LLMOptimizationResult {
  return {
    llmType: r.llmType,
    content: r.content,
    validation: r.validation,
    metaTags: r.metaTags,
    schema: r.schema,
    optimizationScore: r.optimizationScore
  }
}

function aggregateMetaTags(
  results: LLMOptimizationResult[]
): Record<string, string> {
  const merged: Record<string, string> = {}
  for (const r of results) Object.assign(merged, r.metaTags)
  merged['ai-search:engines-optimized'] = results.map((r) => r.llmType).join(',')
  return merged
}

function combineSchemata(
  results: LLMOptimizationResult[]
): Record<string, unknown>[] {
  return results.map((r) => r.schema)
}

function calculateOverallScore(results: LLMOptimizationResult[]): number {
  if (!results.length) return 0
  const total = results.reduce((s, r) => s + r.optimizationScore, 0)
  return Math.round(total / results.length)
}

function calculateTierAnalysis(results: LLMOptimizationResult[]) {
  const buckets: Record<LLMTier, number[]> = {
    tier1: [],
    tier2: [],
    tier3: []
  }
  for (const r of results) {
    buckets[LLM_PROFILES[r.llmType].tier].push(r.optimizationScore)
  }
  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  return {
    tier1Score: avg(buckets.tier1),
    tier2Score: avg(buckets.tier2),
    tier3Score: avg(buckets.tier3)
  }
}

function calculateAnalytics(results: LLMOptimizationResult[]) {
  const sorted = [...results].sort(
    (a, b) => b.optimizationScore - a.optimizationScore
  )
  return {
    totalOptimizations: results.length,
    successfulOptimizations: results.filter((r) => r.validation.isValid).length,
    averageScore: calculateOverallScore(results),
    topPerforming: sorted.slice(0, 3).map((r) => r.llmType),
    needsImprovement: results
      .filter((r) => r.optimizationScore < 70)
      .map((r) => r.llmType)
  }
}

function generateRecommendations(
  results: LLMOptimizationResult[],
  config: LLMOptimizationConfig
): string[] {
  const recs: string[] = []
  const scores = results.map((r) => r.optimizationScore)
  const avg = scores.length
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0

  if (avg < 70) {
    recs.push('Overall optimization score is below 70 — enrich descriptions, features, and use cases.')
  }
  if (!config.features?.length) {
    recs.push('Add a `features` list so engines can answer feature-specific queries.')
  }
  if (!config.useCases?.length) {
    recs.push('Add `useCases` so engines can answer "what is X used for" queries.')
  }
  if (!config.category) {
    recs.push('Add `category` so engines can classify and compare the tool.')
  }
  if ((config.description || '').length < 80) {
    recs.push('Description is short — expand past 80 chars for better AI snippet extraction.')
  }
  for (const r of results.filter((r) => r.optimizationScore < 70)) {
    recs.push(`Engine "${r.llmType}" scored ${r.optimizationScore} — ${r.validation.suggestions[0] || 'review content'}.`)
  }
  return recs
}

function createImplementationPlan(
  results: LLMOptimizationResult[],
  priority: 'high' | 'medium' | 'low'
) {
  const byTier: Record<LLMTier, LLMType[]> = {
    tier1: [],
    tier2: [],
    tier3: []
  }
  for (const r of results) byTier[LLM_PROFILES[r.llmType].tier].push(r.llmType)

  if (priority === 'high') {
    return {
      phase1: [...byTier.tier1, ...byTier.tier2],
      phase2: byTier.tier3,
      phase3: [] as LLMType[]
    }
  }
  return {
    phase1: byTier.tier1,
    phase2: byTier.tier2,
    phase3: byTier.tier3
  }
}

// ── Composable ─────────────────────────────────────────────────────────
export const useLLMOrchestrator = () => {
  /** Optimize content for a single LLM engine. */
  const optimizeForLLM = (
    llmType: LLMType,
    config: LLMOptimizationConfig
  ): LLMOptimizationResult => toLLMResult(optimizeForEngine(llmType, config))

  /** Run optimization across all enabled engines + aggregate. */
  const orchestrateLLMOptimization = (
    config: LLMOptimizationConfig
  ): LLMOrchestrationResult => {
    const defaultLLMs: LLMType[] = ['chatgpt', 'claude', 'gemini', 'copilot', 'perplexity']
    const enabled = config.enabledLLMs ?? defaultLLMs
    const results: LLMOptimizationResult[] = []

    for (const engine of enabled) {
      try {
        results.push(optimizeForLLM(engine, config))
      } catch (err) {
        console.warn(`Failed to optimize for ${engine}:`, err)
      }
    }

    return {
      results,
      aggregatedMetaTags: aggregateMetaTags(results),
      combinedSchema: combineSchemata(results),
      overallScore: calculateOverallScore(results),
      recommendations: generateRecommendations(results, config),
      implementationPlan: createImplementationPlan(results, config.priority || 'medium'),
      tierAnalysis: calculateTierAnalysis(results),
      analytics: calculateAnalytics(results)
    }
  }

  // ── Backward-compat convenience wrappers (per-engine) ────────────────
  const optimizeChatGPT = (c: LLMOptimizationConfig) => optimizeForLLM('chatgpt', c)
  const optimizeClaude = (c: LLMOptimizationConfig) => optimizeForLLM('claude', c)
  const optimizeGemini = (c: LLMOptimizationConfig) => optimizeForLLM('gemini', c)
  const optimizeCopilot = (c: LLMOptimizationConfig) => optimizeForLLM('copilot', c)
  const optimizePerplexity = (c: LLMOptimizationConfig) => optimizeForLLM('perplexity', c)
  const optimizeSearchGPT = (c: LLMOptimizationConfig) => optimizeForLLM('searchgpt', c)
  const optimizeYou = (c: LLMOptimizationConfig) => optimizeForLLM('you', c)
  const optimizePhind = (c: LLMOptimizationConfig) => optimizeForLLM('phind', c)
  const optimizeKagi = (c: LLMOptimizationConfig) => optimizeForLLM('kagi', c)
  const optimizeMetaAI = (c: LLMOptimizationConfig) => optimizeForLLM('meta-ai', c)
  const optimizeCharacterAI = (c: LLMOptimizationConfig) => optimizeForLLM('character-ai', c)
  const optimizePoe = (c: LLMOptimizationConfig) => optimizeForLLM('poe', c)
  const optimizeHuggingFace = (c: LLMOptimizationConfig) => optimizeForLLM('huggingface', c)

  // Convenience wrappers for Perplexity used by pages/index.vue
  const optimizeForPerplexity = (c: LLMOptimizationConfig) => {
    const r = optimizeForLLM('perplexity', c)
    return {
      qaPairs: r.content.qaPairs,
      factStatements: r.content.factStatements,
      sourceOptimization: {
        authorityDomain: 'moonmart.ai',
        contentType: 'software-directory',
        lastUpdated: new Date().toISOString()
      },
      perplexityMeta: Object.entries(r.metaTags).map(([name, content]) => ({
        name,
        content
      }))
    }
  }
  const generateConversationalSchema = (c: LLMOptimizationConfig) =>
    optimizeForLLM('perplexity', c).schema

  // ── Status / analytics helpers ───────────────────────────────────────
  const getLLMOptimizationStatus = (config: LLMOptimizationConfig) => {
    const enabled = config.enabledLLMs ?? (['chatgpt', 'claude', 'gemini', 'copilot', 'perplexity'] as LLMType[])
    const status = {
      total: enabled.length,
      configured: 0,
      optimized: 0,
      needsImprovement: 0,
      byTier: {
        tier1: { total: 0, optimized: 0 },
        tier2: { total: 0, optimized: 0 },
        tier3: { total: 0, optimized: 0 }
      } as Record<LLMTier, { total: number; optimized: number }>
    }

    try {
      const res = orchestrateLLMOptimization(config)
      status.configured = res.results.length
      status.optimized = res.results.filter((r) => r.optimizationScore >= 80).length
      status.needsImprovement = res.results.filter((r) => r.optimizationScore < 70).length

      for (const t of enabled) {
        const p = LLM_PROFILES[t]
        if (p) {
          status.byTier[p.tier].total++
          const r = res.results.find((x) => x.llmType === t)
          if (r && r.optimizationScore >= 80) status.byTier[p.tier].optimized++
        }
      }
    } catch (err) {
      console.warn('Error computing LLM optimization status:', err)
    }

    return status
  }

  const generateOptimizationReport = (config: LLMOptimizationConfig) => {
    const res = orchestrateLLMOptimization(config)
    const status = getLLMOptimizationStatus(config)
    return {
      summary: {
        overallScore: res.overallScore,
        optimizedLLMs: res.results.length,
        topPerforming: res.results
          .slice()
          .sort((a, b) => b.optimizationScore - a.optimizationScore)
          .slice(0, 3)
          .map((r) => ({ llm: r.llmType, score: r.optimizationScore })),
        needsAttention: res.results
          .filter((r) => r.optimizationScore < 70)
          .map((r) => ({ llm: r.llmType, score: r.optimizationScore }))
      },
      details: res,
      status,
      recommendations: res.recommendations,
      implementationPlan: res.implementationPlan
    }
  }

  const generateLLMAnalytics = (config: LLMOptimizationConfig) => {
    const res = orchestrateLLMOptimization(config)
    const status = getLLMOptimizationStatus(config)
    return {
      overview: {
        totalLLMs: ALL_LLM_TYPES.length,
        enabledLLMs: config.enabledLLMs?.length ?? 5,
        overallScore: res.overallScore,
        tierAnalysis: res.tierAnalysis
      },
      performance: {
        topPerformers: res.analytics.topPerforming,
        needsImprovement: res.analytics.needsImprovement,
        averageScore: res.analytics.averageScore,
        successRate:
          res.analytics.totalOptimizations === 0
            ? 0
            : (res.analytics.successfulOptimizations /
                res.analytics.totalOptimizations) *
              100
      },
      recommendations: res.recommendations,
      implementationPlan: res.implementationPlan,
      status
    }
  }

  const getLLMsByTier = (tier?: LLMTier): LLMType[] =>
    tier
      ? ALL_LLM_TYPES.filter((t) => LLM_PROFILES[t].tier === tier)
      : [...ALL_LLM_TYPES]

  const getRecommendedLLMs = (useCase: string): LLMType[] => {
    const map: Record<string, LLMType[]> = {
      research: ['perplexity', 'claude', 'searchgpt'],
      conversational: ['chatgpt', 'character-ai', 'poe'],
      developer: ['phind', 'copilot', 'huggingface'],
      enterprise: ['copilot', 'claude', 'kagi'],
      privacy: ['you', 'kagi', 'claude'],
      multimodal: ['gemini', 'chatgpt', 'meta-ai'],
      opensource: ['huggingface', 'phind', 'poe']
    }
    return map[useCase] ?? ['chatgpt', 'claude', 'gemini']
  }

  return {
    // Core
    orchestrateLLMOptimization,
    optimizeForLLM,

    // Tier 1
    optimizeChatGPT,
    optimizeClaude,
    optimizeGemini,
    optimizeCopilot,
    optimizePerplexity,
    // Tier 2
    optimizeSearchGPT,
    optimizeYou,
    optimizePhind,
    optimizeKagi,
    // Tier 3
    optimizeMetaAI,
    optimizeCharacterAI,
    optimizePoe,
    optimizeHuggingFace,

    // Perplexity legacy helpers
    optimizeForPerplexity,
    generateConversationalSchema,

    // Utilities
    aggregateMetaTags,
    combineSchemata,
    calculateOverallScore,
    calculateTierAnalysis,
    calculateAnalytics,
    generateRecommendations,
    createImplementationPlan,
    getLLMOptimizationStatus,
    generateOptimizationReport,
    generateLLMAnalytics,
    getLLMsByTier,
    getRecommendedLLMs,

    // Config
    llmConfigs,
    llmProfiles: LLM_PROFILES
  }
}
