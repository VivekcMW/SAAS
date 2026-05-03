/**
 * POST /api/vendor/win-loss
 * Analyse buyer intent events for vendor's listings to derive win/loss signals.
 * Requires vendor auth + Professional plan. Rate limit 20/hr.
 */
import { getDb } from '~/server/utils/database'
import { requireVendor, getVendorProfileForUser, requirePlan } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { aiChat } from '~/server/utils/aiProvider'

interface IntentRow {
  app_id: string
  app_name: string
  event_type: string
  created_at: string
  user_id: string | null
  session_id: string | null
  user_company: string | null
  user_role: string | null
}

interface WinRow { app_id: string; app_name: string; date: string; company: string | null }
interface LossRow { app_id: string; app_name: string; date: string; company: string | null; last_event: string }

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  requirePlan(event, 'professional')

  if (!checkRateLimit(getClientIp(event), { limit: 20, windowMs: 60 * 60 * 1000, prefix: 'vendor-winloss' })) {
    throw createError({ statusCode: 429, statusMessage: 'Rate limit reached. Try again later.' })
  }

  const vendor = getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })

  const db = getDb()
  const vendorId = vendor.id

  // Fetch all comparison events for vendor listings in last 90 days
  const events = db.prepare(`
    SELECT b.app_id, a.name AS app_name, b.event_type, b.created_at, b.user_id, b.session_id, b.user_company, b.user_role
    FROM buyer_intent_events b
    JOIN app_listings a ON a.id = b.app_id
    WHERE b.vendor_id = ? AND b.created_at >= datetime('now', '-90 days')
    ORDER BY b.created_at DESC
  `).all(vendorId) as IntentRow[]

  if (events.length === 0) {
    return {
      winRate: 0,
      totalComparisons: 0,
      wins: [],
      losses: [],
      insights: ['Not enough data yet — intent signals will appear as buyers interact with your listings.'],
      tippingFactors: []
    }
  }

  // Group by session_id or user_id — each "session" that included 'compare' is a comparison event
  type SessionMap = Map<string, { appId: string; appName: string; company: string | null; role: string | null; events: { type: string; date: string }[] }>
  const sessionMap: SessionMap = new Map()

  for (const e of events) {
    const key = e.session_id ?? e.user_id ?? `anon-${e.app_id}-${e.created_at}`
    if (!sessionMap.has(key)) {
      sessionMap.set(key, { appId: e.app_id, appName: e.app_name, company: e.user_company, role: e.user_role, events: [] })
    }
    sessionMap.get(key)!.events.push({ type: e.event_type, date: e.created_at })
  }

  const WIN_EVENTS = new Set(['demo_request', 'purchase', 'trial_start', 'enquiry'])
  const COMPARE_EVENTS = new Set(['compare', 'pricing_view', 'feature_compare'])
  const LOSS_ONLY_EVENTS = new Set(['compare', 'pricing_view', 'feature_compare', 'page_view'])

  const wins: WinRow[] = []
  const losses: LossRow[] = []

  for (const [, session] of sessionMap) {
    const types = new Set(session.events.map(e => e.type))
    const hasCompare = [...types].some(t => COMPARE_EVENTS.has(t))
    const hasWin = [...types].some(t => WIN_EVENTS.has(t))
    const sortedEvents = [...session.events].sort((a, b) => a.date.localeCompare(b.date))
    const latestDate = sortedEvents[sortedEvents.length - 1].date

    if (!hasCompare) continue

    if (hasWin) {
      wins.push({ app_id: session.appId, app_name: session.appName, date: latestDate, company: session.company })
    } else {
      const allLoss = [...types].every(t => LOSS_ONLY_EVENTS.has(t))
      if (allLoss) {
        losses.push({ app_id: session.appId, app_name: session.appName, date: latestDate, company: session.company, last_event: sortedEvents[sortedEvents.length - 1].type })
      }
    }
  }

  const totalComparisons = wins.length + losses.length
  const winRate = totalComparisons > 0 ? Math.round((wins.length / totalComparisons) * 100) : 0

  // Aggregate by app for tipping factors
  const appWins: Record<string, number> = {}
  const appLosses: Record<string, number> = {}
  for (const w of wins) { appWins[w.app_name] = (appWins[w.app_name] ?? 0) + 1 }
  for (const l of losses) { appLosses[l.app_name] = (appLosses[l.app_name] ?? 0) + 1 }

  const tippingFactors = Object.entries(appWins)
    .map(([name, w]) => ({
      app: name,
      wins: w,
      losses: appLosses[name] ?? 0,
      rate: Math.round((w / (w + (appLosses[name] ?? 0))) * 100)
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5)

  // Derive insights with AI (Anthropic or OpenAI)
  let insights: string[] = []

  if ((process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) && totalComparisons >= 5) {
    try {
      const prompt = `You are a SaaS sales analyst. Analyse these win/loss signals for a vendor:
- Win rate: ${winRate}%
- Total comparisons: ${totalComparisons}
- Wins: ${wins.length} (buyers who compared then took a high-intent action)
- Losses: ${losses.length} (buyers who compared but took no further action)
- Top app win rates: ${tippingFactors.map(t => `${t.app} ${t.rate}% (${t.wins}W/${t.losses}L)`).join(', ')}

Generate 3-5 short, specific, actionable insights for the vendor. Each insight should be 1 sentence, plain text, no bullet symbols.`

      const { text } = await aiChat({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 300,
        temperature: 0.5,
        quality: 'fast'
      })

      if (text) {
        insights = text
          .split('\n')
          .map(l => l.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim())
          .filter(l => l.length > 20)
          .slice(0, 5)
      }
    } catch (err) {
      console.error('[vendor/win-loss] AI call failed:', err)
    }
  }

  if (insights.length === 0) {
    if (winRate >= 60) {
      insights = [
        `Strong win rate of ${winRate}% — your listings convert well during comparison.`,
        'Focus on maintaining your demo request flow, which is your top conversion driver.',
        'Consider requesting reviews from recent wins to amplify social proof.'
      ]
    } else if (winRate >= 40) {
      insights = [
        `Win rate of ${winRate}% is near market average — there is clear room to improve.`,
        'Buyers who compare your pricing view but do not convert may need a clearer value prop.',
        'Adding a free trial or demo CTA could convert more comparison-stage buyers.'
      ]
    } else {
      insights = [
        `Win rate of ${winRate}% is below average — buyers are comparing but not converting.`,
        'Review your pricing page — complex or opaque pricing is the most common comparison drop-off.',
        'Adding customer case studies to your listing could address buyer hesitation.'
      ]
    }
  }

  return {
    winRate,
    totalComparisons,
    wins: wins.slice(0, 20),
    losses: losses.slice(0, 20),
    insights,
    tippingFactors
  }
})
