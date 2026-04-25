/**
 * LLM Engine Profiles
 *
 * Data-only definitions of every LLM/AI search engine Moonmart optimizes for.
 * One profile = one engine. Keep engine-specific quirks as data, not code.
 */

export type LLMType =
  // Tier 1
  | 'chatgpt' | 'claude' | 'gemini' | 'copilot' | 'perplexity'
  // Tier 2
  | 'searchgpt' | 'you' | 'phind' | 'kagi'
  // Tier 3
  | 'meta-ai' | 'character-ai' | 'poe' | 'huggingface'

export type LLMTier = 'tier1' | 'tier2' | 'tier3'

export interface LLMProfile {
  type: LLMType
  displayName: string
  tier: LLMTier
  priority: number
  enabled: boolean
  /** Meta tag namespace prefix, e.g. "chatgpt:" produces `<meta name="chatgpt:x" …>` */
  metaPrefix: string
  /** Feature tags used by the orchestrator for scoring and recommendations */
  features: string[]
  /** Engine-specific content angle that shapes the rewritten title/answer */
  contentAngle:
    | 'conversational'
    | 'analytical'
    | 'visual-multimodal'
    | 'enterprise-productivity'
    | 'research-citation'
    | 'real-time-search'
    | 'privacy-unbiased'
    | 'developer-technical'
    | 'premium-editorial'
    | 'social-community'
    | 'persona-chat'
    | 'qa-knowledge'
    | 'open-source'
  /** Short tagline used in generated titles / answers */
  tagline: string
  /** Extra meta tag keys the engine values (added to output) */
  extraMeta?: Record<string, string>
}

export const LLM_PROFILES: Record<LLMType, LLMProfile> = {
  // ── Tier 1 ──────────────────────────────────────────
  chatgpt: {
    type: 'chatgpt',
    displayName: 'ChatGPT',
    tier: 'tier1',
    priority: 1,
    enabled: true,
    metaPrefix: 'chatgpt',
    features: ['conversational', 'creative', 'analysis'],
    contentAngle: 'conversational',
    tagline: 'step-by-step guidance',
    extraMeta: { 'ai-content-type': 'conversational' }
  },
  claude: {
    type: 'claude',
    displayName: 'Claude',
    tier: 'tier1',
    priority: 2,
    enabled: true,
    metaPrefix: 'claude',
    features: ['safety', 'ethics', 'reasoning'],
    contentAngle: 'analytical',
    tagline: 'thoughtful analysis',
    extraMeta: { 'ai-safety': 'verified', 'ai-reasoning': 'structured' }
  },
  gemini: {
    type: 'gemini',
    displayName: 'Gemini',
    tier: 'tier1',
    priority: 3,
    enabled: true,
    metaPrefix: 'gemini',
    features: ['multimodal', 'visual', 'google-integration'],
    contentAngle: 'visual-multimodal',
    tagline: 'multimodal insights',
    extraMeta: { 'google-ai': 'optimized', 'multimodal': 'true' }
  },
  copilot: {
    type: 'copilot',
    displayName: 'Microsoft Copilot',
    tier: 'tier1',
    priority: 4,
    enabled: true,
    metaPrefix: 'copilot',
    features: ['productivity', 'microsoft', 'enterprise'],
    contentAngle: 'enterprise-productivity',
    tagline: 'enterprise productivity',
    extraMeta: { 'microsoft-ai': 'optimized', 'enterprise': 'true' }
  },
  perplexity: {
    type: 'perplexity',
    displayName: 'Perplexity',
    tier: 'tier1',
    priority: 5,
    enabled: true,
    metaPrefix: 'perplexity',
    features: ['research', 'citations', 'real-time'],
    contentAngle: 'research-citation',
    tagline: 'cite-ready facts',
    extraMeta: {
      'perplexity:authority': 'high',
      'perplexity:cite-format': 'structured',
      'knowledge-engine:source': 'authoritative'
    }
  },
  // ── Tier 2 ──────────────────────────────────────────
  searchgpt: {
    type: 'searchgpt',
    displayName: 'SearchGPT',
    tier: 'tier2',
    priority: 6,
    enabled: true,
    metaPrefix: 'searchgpt',
    features: ['search', 'real-time', 'citations'],
    contentAngle: 'real-time-search',
    tagline: 'real-time answers'
  },
  you: {
    type: 'you',
    displayName: 'You.com',
    tier: 'tier2',
    priority: 7,
    enabled: true,
    metaPrefix: 'you-com',
    features: ['privacy', 'unbiased', 'transparency'],
    contentAngle: 'privacy-unbiased',
    tagline: 'unbiased results'
  },
  phind: {
    type: 'phind',
    displayName: 'Phind',
    tier: 'tier2',
    priority: 8,
    enabled: true,
    metaPrefix: 'phind',
    features: ['developer', 'technical', 'coding'],
    contentAngle: 'developer-technical',
    tagline: 'developer-focused'
  },
  kagi: {
    type: 'kagi',
    displayName: 'Kagi',
    tier: 'tier2',
    priority: 9,
    enabled: true,
    metaPrefix: 'kagi',
    features: ['premium', 'quality', 'ad-free'],
    contentAngle: 'premium-editorial',
    tagline: 'premium quality'
  },
  // ── Tier 3 ──────────────────────────────────────────
  'meta-ai': {
    type: 'meta-ai',
    displayName: 'Meta AI',
    tier: 'tier3',
    priority: 10,
    enabled: true,
    metaPrefix: 'meta-ai',
    features: ['social', 'community', 'metaverse'],
    contentAngle: 'social-community',
    tagline: 'community-driven'
  },
  'character-ai': {
    type: 'character-ai',
    displayName: 'Character.ai',
    tier: 'tier3',
    priority: 11,
    enabled: true,
    metaPrefix: 'character-ai',
    features: ['conversational', 'personas', 'roleplay'],
    contentAngle: 'persona-chat',
    tagline: 'persona dialog'
  },
  poe: {
    type: 'poe',
    displayName: 'Poe',
    tier: 'tier3',
    priority: 12,
    enabled: true,
    metaPrefix: 'poe',
    features: ['qa', 'knowledge', 'community'],
    contentAngle: 'qa-knowledge',
    tagline: 'Q&A knowledge'
  },
  huggingface: {
    type: 'huggingface',
    displayName: 'Hugging Face',
    tier: 'tier3',
    priority: 13,
    enabled: true,
    metaPrefix: 'huggingface',
    features: ['opensource', 'research', 'models'],
    contentAngle: 'open-source',
    tagline: 'open-source research'
  }
}

export const ALL_LLM_TYPES: LLMType[] = Object.keys(LLM_PROFILES) as LLMType[]

export function getProfilesByTier(tier: LLMTier): LLMProfile[] {
  return Object.values(LLM_PROFILES).filter((p) => p.tier === tier)
}
