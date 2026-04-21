/**
 * Unified per-engine LLM optimization
 *
 * Replaces 13 per-engine composables (~7000 lines) with a single
 * profile-driven function. Each engine's differences are data in
 * llmProfiles.ts — logic below is engine-agnostic.
 */

import { LLM_PROFILES, type LLMProfile, type LLMType } from './llmProfiles'

// ── Shared types ──────────────────────────────────────────────────────
export interface LLMOptimizationConfig {
  title: string
  description: string
  category?: string
  features?: string[]
  useCases?: string[]
  benefits?: string[]
  pricing?: string
  targetAudience?: string[]
  keywords?: string[]
  location?: string
}

export interface QAPair {
  question: string
  answer: string
  category?: string
}

export interface FactStatement {
  statement: string
  type: string
  source: string
  verifiable: boolean
}

export interface EngineOptimizationResult {
  llmType: LLMType
  profile: LLMProfile
  content: {
    title: string
    description: string
    tagline: string
    qaPairs: QAPair[]
    factStatements: FactStatement[]
    features: string[]
    useCases: string[]
    benefits: string[]
  }
  metaTags: Record<string, string>
  schema: Record<string, unknown>
  validation: {
    isValid: boolean
    errors: string[]
    suggestions: string[]
    optimizationScore: number
  }
  optimizationScore: number
}

// ── Generators ────────────────────────────────────────────────────────

function buildQAPairs(config: LLMOptimizationConfig): QAPair[] {
  const pairs: QAPair[] = [
    {
      question: `What is ${config.title}?`,
      answer: config.description,
      category: 'definition'
    }
  ]
  if (config.features?.length) {
    pairs.push({
      question: `What are the key features of ${config.title}?`,
      answer: `${config.title} includes: ${config.features.join(', ')}.`,
      category: 'features'
    })
  }
  if (config.useCases?.length) {
    pairs.push({
      question: `What is ${config.title} used for?`,
      answer: `${config.title} is commonly used for: ${config.useCases.join(', ')}.`,
      category: 'use-cases'
    })
  }
  if (config.benefits?.length) {
    pairs.push({
      question: `What are the benefits of using ${config.title}?`,
      answer: `Key benefits include: ${config.benefits.join(', ')}.`,
      category: 'benefits'
    })
  }
  if (config.category) {
    pairs.push({
      question: `What category does ${config.title} belong to?`,
      answer: `${config.title} is a ${config.category} solution.`,
      category: 'classification'
    })
  }
  if (config.pricing) {
    pairs.push({
      question: `How much does ${config.title} cost?`,
      answer: `${config.title} pricing: ${config.pricing}.`,
      category: 'pricing'
    })
  }
  return pairs
}

function buildFactStatements(config: LLMOptimizationConfig): FactStatement[] {
  const facts: FactStatement[] = [
    {
      statement: `${config.title} is listed on the SaaSWorld marketplace.`,
      type: 'availability',
      source: 'SaaSWorld',
      verifiable: true
    }
  ]
  if (config.category) {
    facts.push({
      statement: `${config.title} is categorized as ${config.category} software.`,
      type: 'classification',
      source: 'SaaSWorld',
      verifiable: true
    })
  }
  if (config.features?.length) {
    facts.push({
      statement: `${config.title} offers ${config.features.length} key features.`,
      type: 'feature-count',
      source: 'SaaSWorld',
      verifiable: true
    })
  }
  facts.push({
    statement: `${config.title} information is regularly updated on SaaSWorld.`,
    type: 'freshness',
    source: 'SaaSWorld',
    verifiable: true
  })
  return facts
}

function buildTaglineTitle(title: string, profile: LLMProfile): string {
  return `${title} — ${profile.tagline}`
}

function buildMetaTags(
  profile: LLMProfile,
  config: LLMOptimizationConfig
): Record<string, string> {
  const p = profile.metaPrefix
  const meta: Record<string, string> = {
    [`${p}:content-type`]: 'software-information',
    [`${p}:authority`]: 'high',
    [`${p}:freshness`]: 'recent',
    [`${p}:content-angle`]: profile.contentAngle,
    [`${p}:tier`]: profile.tier,
    [`${p}:features`]: profile.features.join(','),
    'ai-search:optimized': 'true',
    'ai-search:engine': profile.type,
    'ai-search:source-type': 'directory'
  }
  if (config.category) meta[`${p}:category`] = config.category
  if (config.location) meta[`${p}:location`] = config.location
  if (profile.extraMeta) Object.assign(meta, profile.extraMeta)
  return meta
}

function buildSchema(
  profile: LLMProfile,
  config: LLMOptimizationConfig,
  qaPairs: QAPair[]
): Record<string, unknown> {
  const slug = config.title.toLowerCase().replace(/\s+/g, '-')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: config.title,
        description: config.description,
        applicationCategory: config.category || 'Business Software',
        url: `https://saasworld.com/marketplace/app/${slug}`,
        provider: {
          '@type': 'Organization',
          name: 'SaaSWorld',
          url: 'https://saasworld.com'
        },
        mainEntity: {
          '@type': 'FAQPage',
          mainEntity: qaPairs.map((qa, i) => ({
            '@type': 'Question',
            position: i + 1,
            name: qa.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: qa.answer,
              author: { '@type': 'Organization', name: 'SaaSWorld' }
            }
          }))
        },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'ai-engine', value: profile.type },
          { '@type': 'PropertyValue', name: 'content-angle', value: profile.contentAngle }
        ]
      }
    ]
  }
}

function validate(config: LLMOptimizationConfig): {
  isValid: boolean
  errors: string[]
  suggestions: string[]
  optimizationScore: number
} {
  const errors: string[] = []
  const suggestions: string[] = []
  let score = 60

  if (!config.title) errors.push('Title is required')
  if (!config.description) errors.push('Description is required')
  if (config.description && config.description.length < 80) {
    suggestions.push('Description under 80 chars — add context for AI answer snippets')
  } else {
    score += 10
  }
  if (config.features?.length) score += 10
  else suggestions.push('Add features for better feature-query matching')
  if (config.useCases?.length) score += 10
  else suggestions.push('Add use cases to surface in "what is X used for" queries')
  if (config.benefits?.length) score += 5
  if (config.category) score += 5

  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    optimizationScore: Math.min(score, 100)
  }
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Run engine-specific LLM optimization for a single engine.
 */
export function optimizeForEngine(
  engine: LLMType,
  config: LLMOptimizationConfig
): EngineOptimizationResult {
  const profile = LLM_PROFILES[engine]
  if (!profile) throw new Error(`Unknown LLM engine: ${engine}`)

  const qaPairs = buildQAPairs(config)
  const factStatements = buildFactStatements(config)
  const metaTags = buildMetaTags(profile, config)
  const schema = buildSchema(profile, config, qaPairs)
  const validation = validate(config)

  return {
    llmType: engine,
    profile,
    content: {
      title: buildTaglineTitle(config.title, profile),
      description: config.description,
      tagline: profile.tagline,
      qaPairs,
      factStatements,
      features: config.features || [],
      useCases: config.useCases || [],
      benefits: config.benefits || []
    },
    metaTags,
    schema,
    validation,
    optimizationScore: validation.optimizationScore
  }
}

/**
 * Convenience composable — stateless but keeps nuxt auto-import conventions.
 */
export const useLLMEngineOptimization = () => ({
  optimizeForEngine,
  profiles: LLM_PROFILES
})
