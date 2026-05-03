/**
 * POST /api/ai/copilot
 * Mira — Moonmart's conversational AI buying advisor.
 *
 * Model: GPT-4o (multi-turn reasoning)
 * Session: ai_match_sessions table keyed by session_id
 * Max turns per session: 20
 */
import { getDb, makeId } from '~/server/utils/database'
import { getSessionUser, requirePlan } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { getMarketplaceApps } from '~/server/utils/apps'
import { aiChat, activeProviderName } from '~/server/utils/aiProvider'

interface CopilotRequest {
  sessionId?: string
  message: string
  context?: {
    previousMatches?: string[]
    [key: string]: unknown
  }
}

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)

  // Require auth for copilot (buyer feature)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required to use AI Copilot.' })
  }

  // Require at least Starter plan for AI Copilot access
  await requirePlan(event, 'Starter')

  if (!checkRateLimit(getClientIp(event), { limit: 60, windowMs: 60 * 60 * 1000, prefix: 'ai-copilot' })) {
    throw createError({ statusCode: 429, statusMessage: 'Copilot rate limit reached. Please try again later.' })
  }

  const body = await readBody<CopilotRequest>(event)
  if (!body?.message?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'message is required' })
  }

  const db = getDb()

  // ── Load or create session ────────────────────────────────────────────────
  let session: {
    id: string; messages: string; matched_apps: string; context: string; lead_score: number
  } | undefined

  if (body.sessionId) {
    session = db.prepare(
      'SELECT * FROM ai_match_sessions WHERE id = ? AND (user_id = ? OR user_id IS NULL)'
    ).get(body.sessionId, user.id) as typeof session
  }

  const now = new Date().toISOString()
  const messages: Array<{ role: string; content: string }> = session
    ? JSON.parse(session.messages)
    : []

  // Limit to 20 turns
  if (messages.filter(m => m.role === 'user').length >= 20) {
    throw createError({ statusCode: 429, statusMessage: 'Session limit reached. Please start a new conversation.' })
  }

  // Build catalogue summary (top 50 by rating, grouped by category)
  const { apps } = getMarketplaceApps({ sortBy: 'rating', perPage: 50 })
  const catalogueSummary = apps
    .map(a => `[${a.id}] ${a.name} (${a.category}) — ${a.description.slice(0, 120)} — ${a.pricing.type === 'free' ? 'Free' : a.pricing.value ? `From $${a.pricing.value}/mo` : 'Contact for pricing'} — Rating: ${a.rating}/5`)
    .join('\n')

  const systemPrompt = `You are Mira, Moonmart's AI buying advisor. You help buyers find the right SaaS tools through conversation.

Rules:
- Ask at most ONE clarifying question per turn
- Always give a concrete recommendation within 3 turns  
- Be specific about WHY a tool fits THEIR situation
- Acknowledge tradeoffs honestly — don't oversell
- When recommending, always mention pricing clearly
- Keep replies concise (3–5 sentences max unless doing a comparison)
- When you recommend a tool, include its ID in brackets like [app_id] so the UI can link it

Current user: ${user.fullName} (${user.role}) at ${user.companyName || 'unknown company'}

Available tools catalogue:
${catalogueSummary}`

  // Append the new user message
  messages.push({ role: 'user', content: body.message })

  let reply = ''
  let suggestedApps: string[] = []

  const { text: aiReply } = await aiChat({
    system: systemPrompt,
    messages: messages.slice(-10) as Array<{ role: 'user' | 'assistant'; content: string }>,
    maxTokens: 600,
    temperature: 0.7,
    quality: 'smart'
  })

  if (aiReply) {
    reply = aiReply
    // Extract app IDs mentioned by the AI
    const appIdMatches = reply.match(/\[(app[-_][^\]]+)\]/g) || []
    suggestedApps = [...new Set(appIdMatches.map(m => m.slice(1, -1)))]
      .filter(id => apps.some(a => a.id === id))
  }

  // ── Heuristic fallback ────────────────────────────────────────────────────
  if (!reply) {
    const keywords = body.message.toLowerCase()
    const matchedApps = apps
      .filter(a =>
        keywords.includes(a.category.toLowerCase()) ||
        a.tags.some(t => keywords.includes(t.toLowerCase()))
      )
      .slice(0, 3)

    if (matchedApps.length > 0) {
      suggestedApps = matchedApps.map(a => a.id)
      reply = `Based on what you've told me, I'd look at: ${matchedApps.map(a => `**${a.name}** (${a.pricing.type === 'free' ? 'free' : `from $${a.pricing.value}/mo`})`).join(', ')}. What's your team size and monthly budget? That'll help me narrow this down.`
    } else {
      reply = `Thanks for sharing that. To give you the best recommendation, could you tell me your team size and a rough monthly budget? That helps me cut through the noise and surface tools that'll actually fit.`
    }
  }

  // Append AI reply to history
  messages.push({ role: 'assistant', content: reply })

  // ── Persist/update session ────────────────────────────────────────────────
  const sessionId = session?.id || makeId('ams')
  const sessionContext = body.context ? JSON.stringify(body.context) : (session?.context || '{}')

  if (session) {
    db.prepare(`
      UPDATE ai_match_sessions SET messages = ?, matched_apps = ?, updated_at = ? WHERE id = ?
    `).run(JSON.stringify(messages), JSON.stringify(suggestedApps), now, sessionId)
  } else {
    db.prepare(`
      INSERT INTO ai_match_sessions (id, user_id, session_key, messages, matched_apps, context, lead_score, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId, user.id, `copilot_${Date.now()}`,
      JSON.stringify(messages), JSON.stringify(suggestedApps),
      sessionContext, 0, now, now
    )
  }

  return {
    sessionId,
    reply,
    suggestedApps
  }
})
