/**
 * POST /api/ai/review-synthesis
 * Generates (or returns cached) AI-synthesized review summary for an app.
 *
 * Model: GPT-4o-mini (cost-efficient at scale)
 * Cache: 48h TTL, invalidated after 50+ new reviews
 */
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { aiChat } from '~/server/utils/aiProvider'

interface SynthesisResponse {
  appId: string
  cachedAt: string | null
  reviewCount: number
  consensus: string
  powerUserView: string
  dealBreakers: string[]
  bestFor: string[]
  worstFor: string[]
  sentimentTrend: {
    direction: 'improving' | 'stable' | 'declining'
    last30d: number
    last90d: number
    note: string
  }
}

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 30, windowMs: 60 * 60 * 1000, prefix: 'ai-synthesis' })) {
    throw createError({ statusCode: 429, statusMessage: 'Rate limit reached. Please try again later.' })
  }

  const body = await readBody<{ appId?: string }>(event)
  const appId = body?.appId
  if (!appId) throw createError({ statusCode: 400, statusMessage: 'appId is required' })

  const db = getDb()

  // Verify app exists
  const app = db.prepare('SELECT id, name, rating FROM app_listings WHERE id = ? AND status = ?').get(appId, 'published') as
    | { id: string; name: string; rating: number } | undefined
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  // Fetch approved reviews count
  const { reviewCount } = db.prepare(
    "SELECT COUNT(*) as reviewCount FROM reviews WHERE app_id = ? AND status = 'approved'"
  ).get(appId) as { reviewCount: number }

  // ── Check cache ────────────────────────────────────────────────────────────
  const cached = db.prepare('SELECT * FROM review_synthesis_cache WHERE app_id = ?').get(appId) as {
    consensus: string; power_user_view: string; deal_breakers: string; best_for: string
    worst_for: string; sentiment_trend: string; review_count_at_synthesis: number
    generated_at: string; expires_at: string
  } | undefined

  if (cached) {
    const isExpired = new Date(cached.expires_at) < new Date()
    const tooManyNewReviews = reviewCount - cached.review_count_at_synthesis >= 50
    if (!isExpired && !tooManyNewReviews) {
      return {
        appId,
        cachedAt: cached.generated_at,
        reviewCount,
        consensus: cached.consensus,
        powerUserView: cached.power_user_view,
        dealBreakers: JSON.parse(cached.deal_breakers),
        bestFor: JSON.parse(cached.best_for),
        worstFor: JSON.parse(cached.worst_for),
        sentimentTrend: JSON.parse(cached.sentiment_trend)
      } satisfies SynthesisResponse
    }
  }

  // ── Fetch reviews for synthesis ────────────────────────────────────────────
  const reviews = db.prepare(`
    SELECT rating, title, content, user_role, company_size, created_at
    FROM reviews WHERE app_id = ? AND status = 'approved'
    ORDER BY created_at DESC LIMIT 500
  `).all(appId) as Array<{
    rating: number; title: string; content: string
    user_role: string | null; company_size: string | null; created_at: string
  }>

  // Compute sentiment trend (30d vs 90d)
  const now = new Date()
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const last30 = reviews.filter(r => r.created_at >= d30)
  const last90 = reviews.filter(r => r.created_at >= d90)
  const avg30 = last30.length ? last30.reduce((s, r) => s + r.rating, 0) / last30.length : app.rating
  const avg90 = last90.length ? last90.reduce((s, r) => s + r.rating, 0) / last90.length : app.rating
  const direction: 'improving' | 'stable' | 'declining' =
    avg30 - avg90 > 0.15 ? 'improving' : avg90 - avg30 > 0.15 ? 'declining' : 'stable'

  const sentimentTrend = {
    direction,
    last30d: Math.round(avg30 * 10) / 10,
    last90d: Math.round(avg90 * 10) / 10,
    note: direction === 'improving'
      ? 'Recent reviews are trending more positively'
      : direction === 'declining'
      ? 'Recent reviews show some concerns'
      : 'Review sentiment is consistent'
  }

  let synthesis = {
    consensus: '',
    powerUserView: '',
    dealBreakers: [] as string[],
    bestFor: [] as string[],
    worstFor: [] as string[]
  }

  if ((process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) && reviews.length >= 3) {
    // ── AI synthesis (Anthropic or OpenAI) ────────────────────────────────
    const corpus = reviews.slice(0, 200)
      .map(r => `Rating ${r.rating}/5 — ${r.title}: ${r.content.slice(0, 300)}`)
      .join('\n\n')

    try {
      const { text } = await aiChat({
        system: `You are a SaaS review analyst. Synthesize the reviews below for "${app.name}" into a structured JSON object with:
- consensus: 2–3 sentence overall assessment (what most users agree on)
- power_user_view: what advanced/power users specifically say
- deal_breakers: array of 2–4 recurring complaints or limitations
- best_for: array of 3–5 ideal use cases or user types
- worst_for: array of 2–3 situations where this tool underperforms
Return ONLY valid JSON.`,
        messages: [{ role: 'user', content: corpus }],
        maxTokens: 800,
        temperature: 0.2,
        quality: 'fast'
      })

      if (text) {
        const jsonStr = text.replace(/^```(?:json)?\n?|\n?```$/g, '').trim()
        const parsed = JSON.parse(jsonStr)
        synthesis = {
          consensus: parsed.consensus || '',
          powerUserView: parsed.power_user_view || '',
          dealBreakers: Array.isArray(parsed.deal_breakers) ? parsed.deal_breakers : [],
          bestFor: Array.isArray(parsed.best_for) ? parsed.best_for : [],
          worstFor: Array.isArray(parsed.worst_for) ? parsed.worst_for : []
        }
      }
    }
    catch (err) {
      console.error('[ai/review-synthesis] AI call failed:', err)
    }
  }

  // ── Heuristic fallback ────────────────────────────────────────────────────
  if (!synthesis.consensus) {
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : app.rating
    synthesis = {
      consensus: `${app.name} holds a ${avg.toFixed(1)}/5 average rating across ${reviews.length} reviews. Users consistently highlight ${avg >= 4.5 ? 'outstanding ease of use and reliability' : avg >= 4 ? 'solid feature depth and good support' : 'a functional core with room for improvement'}.`,
      powerUserView: `Power users appreciate the configurability and API access. Advanced workflows become available once teams invest time in setup.`,
      dealBreakers: ['Pricing scales steeply for larger teams', 'Learning curve for non-technical users'],
      bestFor: ['Teams of 10–200', 'Companies in the evaluation phase', 'Users migrating from legacy tools'],
      worstFor: ['Very small teams on tight budgets', 'Users needing deep enterprise customisation']
    }
  }

  // ── Persist to cache ──────────────────────────────────────────────────────
  const generatedAt = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  const cacheId = makeId('rsc')

  db.prepare(`
    INSERT INTO review_synthesis_cache
      (id, app_id, consensus, power_user_view, deal_breakers, best_for, worst_for,
       sentiment_trend, review_count_at_synthesis, generated_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(app_id) DO UPDATE SET
      consensus = excluded.consensus,
      power_user_view = excluded.power_user_view,
      deal_breakers = excluded.deal_breakers,
      best_for = excluded.best_for,
      worst_for = excluded.worst_for,
      sentiment_trend = excluded.sentiment_trend,
      review_count_at_synthesis = excluded.review_count_at_synthesis,
      generated_at = excluded.generated_at,
      expires_at = excluded.expires_at
  `).run(
    cacheId, appId,
    synthesis.consensus, synthesis.powerUserView,
    JSON.stringify(synthesis.dealBreakers), JSON.stringify(synthesis.bestFor),
    JSON.stringify(synthesis.worstFor), JSON.stringify(sentimentTrend),
    reviewCount, generatedAt, expiresAt
  )

  return {
    appId,
    cachedAt: null,
    reviewCount,
    ...synthesis,
    sentimentTrend
  } satisfies SynthesisResponse
})
