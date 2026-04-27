/**
 * POST /api/ai/negotiation
 * Returns negotiation intelligence for a specific SaaS tool.
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { getMarketplaceAppByIdOrSlug } from '~/server/utils/apps'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  if (!checkRateLimit(getClientIp(event), { limit: 20, windowMs: 24 * 60 * 60 * 1000, prefix: 'ai-neg' })) {
    throw createError({ statusCode: 429, statusMessage: 'Rate limit reached.' })
  }

  const body = await readBody<{ appId?: string }>(event)
  const appId = body?.appId
  if (!appId) throw createError({ statusCode: 400, statusMessage: 'appId is required' })

  const app = getMarketplaceAppByIdOrSlug(appId)
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const db = getDb()

  // Check cache (negotiation briefs are per-app, reuse if recent)
  const cached = db.prepare(
    "SELECT * FROM negotiation_briefs WHERE app_id = ? ORDER BY created_at DESC LIMIT 1"
  ).get(appId) as {
    id: string; brief_content: string; list_price: number | null
    typical_discount_pct: number | null; best_quarter: string | null; tips: string
    created_at: string
  } | undefined

  // Cache for 7 days
  if (cached && new Date(cached.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
    return {
      appId,
      appName: app.name,
      listPrice: cached.list_price,
      typicalDiscountPct: cached.typical_discount_pct,
      bestQuarter: cached.best_quarter,
      tips: JSON.parse(cached.tips),
      briefContent: cached.brief_content,
      cachedAt: cached.created_at
    }
  }

  const listPrice = app.pricing.value ?? null
  let tips: string[] = []
  let briefContent = ''
  let typicalDiscountPct = 15
  let bestQuarter = 'Q4'

  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a SaaS procurement negotiation expert. Provide negotiation intelligence as JSON with:
- typical_discount_pct: number (realistic % discount achievable)
- best_quarter: "Q1"|"Q2"|"Q3"|"Q4" (when vendors are most likely to offer discounts)
- tips: string[] (5 actionable negotiation tips specific to this tool/category)
- brief_content: string (2-3 paragraph negotiation guide in plain text)`
            },
            {
              role: 'user',
              content: `Tool: ${app.name}
Category: ${app.category}
Published price: ${listPrice ? `$${listPrice}/month` : 'not listed'}
Rating: ${app.rating}/5 (${app.reviewCount} reviews)
Description: ${app.description}`
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 600,
          temperature: 0.3
        })
      })

      if (res.ok) {
        const data = await res.json() as { choices: Array<{ message: { content: string } }> }
        const parsed = JSON.parse(data.choices[0].message.content)
        tips = Array.isArray(parsed.tips) ? parsed.tips : []
        briefContent = parsed.brief_content || ''
        typicalDiscountPct = Number(parsed.typical_discount_pct) || 15
        bestQuarter = ['Q1','Q2','Q3','Q4'].includes(parsed.best_quarter) ? parsed.best_quarter : 'Q4'
      }
    }
    catch (err) {
      console.error('[ai/negotiation] OpenAI failed:', err)
    }
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  if (!briefContent) {
    tips = [
      `Ask for a multi-year commitment discount — most ${app.category} vendors offer 15–25% off for 2+ year contracts.`,
      `Request a free pilot for 30–60 days before committing. ${app.name} typically accommodates this for teams of 20+.`,
      `Q4 (October–December) is historically the best time to negotiate — vendors are closing annual quotas.`,
      `Mention you are evaluating competitors. Even naming one alternative can unlock 10–15% off list price.`,
      `Ask for free implementation support or onboarding credits — often easier to get than a direct discount.`
    ]
    briefContent = `${app.name} is a well-reviewed ${app.category} tool with ${app.reviewCount} reviews. Vendors in this category typically offer discounts of 15–25% for annual prepayment. Your strongest negotiation leverage points are multi-year commitment, team size, and competing offers.`
    typicalDiscountPct = 20
    bestQuarter = 'Q4'
  }

  // Persist
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO negotiation_briefs (id, user_id, app_id, brief_content, list_price, typical_discount_pct, best_quarter, tips, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(makeId('ngb'), user.id, appId, briefContent, listPrice, typicalDiscountPct, bestQuarter, JSON.stringify(tips), now)

  return {
    appId,
    appName: app.name,
    listPrice,
    typicalDiscountPct,
    bestQuarter,
    tips,
    briefContent,
    cachedAt: null
  }
})
