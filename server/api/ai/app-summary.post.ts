import { getMarketplaceAppByIdOrSlug } from '~/server/utils/apps'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { aiChat, activeProviderName } from '~/server/utils/aiProvider'
import { redisCacheGet, redisCacheSet } from '~/server/utils/redis'

/**
 * POST /api/ai/app-summary
 *
 * Phase 2 stub: returns a deterministic AI-style summary derived from the
 * app's own data. Replace the body of `buildSummary` with a real LLM call
 * (OpenAI, Anthropic, Gemini) when ready.
 *
 * Body: { appId: string, context?: 'default' | 'sales' | 'engineering' | 'marketing' }
 */
export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 20, windowMs: 60 * 60 * 1000, prefix: 'ai-summary' })) {
    throw createError({ statusCode: 429, statusMessage: 'AI rate limit reached. Please try again later.' })
  }

  const body = await readBody<{ appId?: string; context?: string }>(event)
  const appId = body?.appId

  if (!appId) {
    throw createError({ statusCode: 400, statusMessage: 'appId is required' })
  }

  const app = getMarketplaceAppByIdOrSlug(appId)
  if (!app) {
    throw createError({ statusCode: 404, statusMessage: 'App not found' })
  }

  // Try real AI generation first; fall back to deterministic stub
  const context = body?.context || 'default'
  const cacheKey = `ai:summary:${appId}:${context}`

  // Check Redis cache first (24h TTL — summaries don't change often)
  const cached = await redisCacheGet<object>(cacheKey)
  if (cached) return cached

  if (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY) {
    try {
      const contextAngle: Record<string, string> = {
        sales: 'Focus on pipeline automation, ROI, and sales-ops value.',
        engineering: 'Focus on API coverage, webhooks, audit trail, and developer experience.',
        marketing: 'Focus on campaign tracking, attribution, and marketing ops value.',
        default: 'Provide a balanced overview for a procurement decision-maker.'
      }

      const { text } = await aiChat({
        system: `You are a SaaS product analyst writing concise AI summaries for a software marketplace.
${contextAngle[context] || contextAngle.default}
Return JSON with: { "pitch": string, "pros": string[], "cons": string[], "verdict": string, "idealFor": string[], "notIdealFor": string[], "contextNote": string }
Keep pros/cons arrays to 4-5 items. Be specific and avoid generic filler.`,
        messages: [{
          role: 'user',
          content: `App: ${app.name}
Category: ${app.category}
Rating: ${app.rating}/5 (${app.reviewCount} reviews)
Pricing: ${app.pricing.type === 'free' ? 'Free' : app.pricing.value ? `From $${app.pricing.value}/mo` : 'Contact for pricing'}
Description: ${app.description}
Tags: ${app.tags?.slice(0, 8).join(', ') || 'N/A'}`
        }],
        maxTokens: 700,
        temperature: 0.4,
        task: 'summarise'
      })

      if (text) {
        const jsonStr = text.replace(/^```(?:json)?\n?|\n?```$/g, '').trim()
        const parsed = JSON.parse(jsonStr)
        const result = {
          appId: app.id,
          context,
          generatedAt: new Date().toISOString(),
          pitch: parsed.pitch || '',
          pros: Array.isArray(parsed.pros) ? parsed.pros : [],
          cons: Array.isArray(parsed.cons) ? parsed.cons : [],
          verdict: parsed.verdict || '',
          idealFor: Array.isArray(parsed.idealFor) ? parsed.idealFor : [],
          notIdealFor: Array.isArray(parsed.notIdealFor) ? parsed.notIdealFor : [],
          contextNote: parsed.contextNote || '',
          confidence: 0.92,
          source: activeProviderName()
        }
        // Cache for 24h — summaries are deterministic per app+context
        await redisCacheSet(cacheKey, result, 60 * 60 * 24)
        return result
      }
    } catch (err) {
      console.error('[ai/app-summary] AI call failed:', err)
    }
  }

  // Deterministic fallback
  return buildSummary(app, context)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatPrice(pricing: any): string {
  if (!pricing) return 'Custom pricing'
  if (pricing.type === 'free') return 'Free'
  if (!pricing.value) return 'Custom pricing'
  const period = pricing.period ? `/${pricing.period}` : ''
  return `$${pricing.value}${period}`
}

function buildVerdict(name: string, category: string, rating: number): string {
  if (rating >= 4.6) return `Strong buy — ${name} is a top pick in ${category} and consistently delights users.`
  if (rating >= 4.2) return `Recommended — ${name} is a safe, well-reviewed choice for most ${category} needs.`
  return `Consider carefully — ${name} may fit specific use cases; evaluate against alternatives first.`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSummary(app: any, context: string) {
  const name = app.name as string
  const category = (app.category || 'software').toString().replaceAll('-', ' ')
  const rating = Number(app.rating || 0)
  const reviewCount = Number(app.reviewCount || 0)
  const price = formatPrice(app.pricing)

  const pitch = `${name} is a ${category} platform built for teams that need ${
    rating >= 4.5 ? 'a proven, highly-rated solution' : 'reliable day-to-day execution'
  }. Starting at ${price}, it balances ease of adoption with enterprise-grade capabilities${
    app.security?.certifications?.length ? ` (${app.security.certifications.slice(0, 2).join(', ')} compliant)` : ''
  }.`

  const pros = [
    rating >= 4.5 ? `Loved by users — ${rating.toFixed(1)}★ from ${reviewCount.toLocaleString()} reviews` : `Solid ${rating.toFixed(1)}★ rating across ${reviewCount.toLocaleString()} reviews`,
    app.pricing?.type === 'free' ? 'Generous free tier to start without commitment' : 'Transparent pricing with a free trial',
    app.integrations?.length
      ? `Integrates with ${app.integrations.length}+ tools you likely already use`
      : 'Broad integration ecosystem via API and Zapier',
    app.security?.certifications?.length
      ? `Enterprise-ready (${app.security.certifications[0]})`
      : 'Modern architecture with SSO and role-based access',
    'Active product development with regular feature updates'
  ]

  const cons = [
    rating < 4.3 ? 'Mixed reviews — some users report rough edges' : 'Advanced features have a learning curve for first-time users',
    app.pricing?.type === 'free' ? 'Free tier caps usage; scaling requires a paid plan' : 'No permanent free plan beyond the trial',
    'Mobile experience is less feature-complete than web',
    'Customization may require developer help for edge cases'
  ]

  const verdict = buildVerdict(name, category, rating)

  const idealFor = app.tags?.length
    ? app.tags.slice(0, 4)
    : ['Startups (1–50)', 'Growing teams (50–250)', 'Cross-functional squads']

  const notIdealFor = [
    rating < 4.3 ? 'Teams needing rock-solid UX from day one' : 'Solo users on a tight budget',
    'Organizations requiring fully on-prem deployment',
    'Teams already deeply invested in a competing ecosystem'
  ]

  // Context-aware angle (expandable in the future)
  const contextNote = {
    sales: `From a sales-ops view, ${name}'s pipeline automation and reporting typically pay back in under 90 days.`,
    engineering: `Engineering teams value ${name}'s API, webhook coverage, and audit trail.`,
    marketing: `Marketers choose ${name} for campaign tracking and attribution clarity.`,
    default: `${name} suits most teams looking for a balance of power and simplicity.`
  }[context] || ''

  return {
    appId: app.id,
    context,
    generatedAt: new Date().toISOString(),
    pitch,
    pros,
    cons,
    verdict,
    idealFor,
    notIdealFor,
    contextNote,
    confidence: Math.min(0.95, 0.5 + rating / 10),
    source: 'stub'
  }
}
