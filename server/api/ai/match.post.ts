/**
 * POST /api/ai/match
 * AI Match Engine — ranked SaaS recommendations based on buyer context.
 *
 * Model: GPT-4o (reasoning quality)
 * Rate limit: 3 for anonymous, unlimited for authenticated
 */
import { getDb, makeId } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { getMarketplaceApps } from '~/server/utils/apps'
import { aiChat, activeProviderName } from '~/server/utils/aiProvider'

interface MatchRequest {
  companySize?: string
  industry?: string
  budget?: number
  currentStack?: string[]
  painPoint?: string
  techLevel?: string
  category?: string
  sessionId?: string
}

interface MatchResult {
  app: {
    id: string
    name: string
    logo: string
    rating: number
    pricingType: string
    pricingValue: number | null
    category: string
    slug: string
  }
  score: number
  reasoning: string
  tradeoff: string
  rank: number
}

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  const user = await getSessionUser(event)

  // Anonymous: 3 req/hour. Authenticated: 30 req/hour.
  const limit = user ? 30 : 3
  if (!checkRateLimit(ip, { limit, windowMs: 60 * 60 * 1000, prefix: 'ai-match' }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'AI match rate limit reached. Sign in for unlimited access.' })
  }

  const body = await readBody<MatchRequest>(event)

  if (!body?.painPoint && !body?.category) {
    throw createError({ statusCode: 400, statusMessage: 'Provide at least a painPoint or category.' })
  }

  // Fetch top apps in the requested category (up to 40 by rating)
  const { apps } = getMarketplaceApps({
    category: body.category,
    sortBy: 'rating',
    perPage: 40
  })

  if (apps.length === 0) {
    // Fall back to all published apps if no category match
    const fallback = getMarketplaceApps({ sortBy: 'rating', perPage: 40 })
    apps.push(...fallback.apps)
  }

  // Build a compact catalogue for the prompt
  const catalogue = apps.slice(0, 40).map(a => ({
    id: a.id,
    name: a.name,
    category: a.category,
    description: a.description,
    pricingType: a.pricing.type,
    pricingValue: a.pricing.value ?? null,
    rating: a.rating,
    reviewCount: a.reviewCount,
    tags: a.tags.slice(0, 5).join(', ')
  }))

  const openaiKey = process.env.OPENAI_API_KEY
  let matches: MatchResult[] = []

  if (openaiKey || process.env.ANTHROPIC_API_KEY) {
    // ── AI call (Anthropic or OpenAI) ────────────────────────────────────────
    const systemPrompt = `You are a SaaS procurement advisor on Moonmart, an AI-powered software discovery platform.

Given a buyer's context and a catalogue of software tools, return the top 5 ranked matches as JSON.

Rank by: fit to pain point (40%) + stack compatibility (25%) + budget alignment (20%) + company size fit (15%)

For each match provide:
- appId: the exact id from the catalogue
- score: 0.0–1.0 (overall fit)
- reasoning: 2–3 sentences explaining the specific fit for THIS buyer
- tradeoff: one honest drawback

Return ONLY valid JSON: { "matches": [...] }`

    const userMessage = `Buyer context:
- Company size: ${body.companySize || 'unknown'}
- Industry: ${body.industry || 'general'}
- Monthly budget: ${body.budget ? `$${body.budget}` : 'flexible'}
- Current stack: ${body.currentStack?.join(', ') || 'none specified'}
- Pain point: ${body.painPoint || 'general productivity improvement'}
- Tech level: ${body.techLevel || 'medium'}
- Preferred category: ${body.category || 'any'}

App catalogue (${catalogue.length} tools):
${JSON.stringify(catalogue, null, 2)}`

    try {
      const { text } = await aiChat({
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 1500,
        temperature: 0.3,
        quality: 'smart'
      })

      if (text) {
        // Strip markdown code fences if present
        const jsonStr = text.replace(/^```(?:json)?\n?|\n?```$/g, '').trim()
        const parsed = JSON.parse(jsonStr) as {
          matches: Array<{ appId: string; score: number; reasoning: string; tradeoff: string }>
        }

        matches = parsed.matches
          .slice(0, 5)
          .map((m, i) => {
            const app = apps.find(a => a.id === m.appId)
            if (!app) return null
            return {
              app: {
                id: app.id,
                name: app.name,
                logo: app.logo,
                rating: app.rating,
                pricingType: app.pricing.type,
                pricingValue: app.pricing.value ?? null,
                category: app.category,
                slug: app.slug
              },
              score: m.score,
              reasoning: m.reasoning,
              tradeoff: m.tradeoff,
              rank: i + 1
            }
          })
          .filter(Boolean) as MatchResult[]
      }
    }
    catch (err) {
      console.error('[ai/match] AI call failed:', err)
      // fall through to heuristic fallback
    }
  }

  // ── Heuristic fallback (no API key or OpenAI failure) ──────────────────────
  if (matches.length === 0) {
    const budget = body.budget ?? Infinity
    const scored = apps.map(app => {
      let score = app.rating / 5 * 0.5 + Math.min(app.reviewCount, 500) / 500 * 0.3

      // Budget alignment
      const price = app.pricing.value ?? 0
      if (price === 0 || app.pricing.type === 'free') score += 0.15
      else if (price <= budget) score += 0.1

      // Category match
      if (body.category && app.category.toLowerCase() === body.category.toLowerCase()) score += 0.1

      return { app, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

    matches = scored.map(({ app, score }, i) => ({
      app: {
        id: app.id,
        name: app.name,
        logo: app.logo,
        rating: app.rating,
        pricingType: app.pricing.type,
        pricingValue: app.pricing.value ?? null,
        category: app.category,
        slug: app.slug
      },
      score: Math.round(score * 100) / 100,
      reasoning: `${app.name} is a highly-rated ${app.category} tool with ${app.reviewCount} reviews and a ${app.rating}/5 rating — a strong fit for teams looking to ${body.painPoint || 'improve productivity'}.`,
      tradeoff: 'Evaluate pricing and integration requirements against your specific stack.',
      rank: i + 1
    }))
  }

  // ── Persist session ────────────────────────────────────────────────────────
  const db = getDb()
  const sessionKey = body.sessionId || `anon_${Date.now()}`
  const sessionId = makeId('ams')
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO ai_match_sessions (id, user_id, session_key, messages, matched_apps, context, lead_score, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    user?.id ?? null,
    sessionKey,
    JSON.stringify([{ role: 'user', content: body.painPoint || '' }]),
    JSON.stringify(matches.map(m => m.app.id)),
    JSON.stringify({ companySize: body.companySize, industry: body.industry, budget: body.budget, category: body.category }),
    matches.length > 0 ? matches[0].score : 0,
    now,
    now
  )

  return {
    sessionId,
    matches,
    generatedAt: now,
    powered_by: activeProviderName()
  }
})
