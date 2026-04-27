/**
 * GET /api/vendor/intent-signals
 * Returns buyer intent signals for the authenticated vendor's listings.
 * Requires a paid plan (starter or higher).
 */
import { getDb } from '~/server/utils/database'
import { requireVendor } from '~/server/utils/auth'

const PAID_PLANS = ['starter', 'growth', 'scale', 'professional', 'enterprise', 'pro']

export default defineEventHandler((event) => {
  const user = await requireVendor(event)
  const db = getDb()

  // Get vendor profile
  const vendor = db.prepare('SELECT id, status FROM vendor_profiles WHERE user_id = ?').get(user.id) as
    | { id: string; status: string } | undefined

  if (!vendor) {
    throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })
  }

  // Check plan — intent signals are a paid feature
  const planName = user.plan?.toLowerCase() ?? 'free'
  const hasPaidPlan = PAID_PLANS.some(p => planName.includes(p))

  if (!hasPaidPlan && user.role !== 'admin') {
    return {
      signals: [],
      totalSignals: 0,
      hotSignals: 0,
      plan: planName,
      upgradeRequired: true,
      message: 'Upgrade to a paid plan to unlock buyer intent signals.'
    }
  }

  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(100, Number(q.limit) || 25)
  const offset = (page - 1) * limit

  const signals = db.prepare(`
    SELECT
      bie.id,
      bie.event_type,
      bie.signal_strength,
      bie.user_company,
      bie.user_role,
      bie.user_location,
      bie.metadata,
      bie.created_at,
      al.name AS app_name,
      al.id AS app_id
    FROM buyer_intent_events bie
    JOIN app_listings al ON al.id = bie.app_id
    WHERE bie.vendor_id = ?
    ORDER BY bie.created_at DESC
    LIMIT ? OFFSET ?
  `).all(vendor.id, limit, offset) as Array<{
    id: string; event_type: string; signal_strength: string
    user_company: string | null; user_role: string | null; user_location: string | null
    metadata: string; created_at: string; app_name: string; app_id: string
  }>

  const { totalSignals } = db.prepare(
    'SELECT COUNT(*) as totalSignals FROM buyer_intent_events WHERE vendor_id = ?'
  ).get(vendor.id) as { totalSignals: number }

  const { hotSignals } = db.prepare(
    "SELECT COUNT(*) as hotSignals FROM buyer_intent_events WHERE vendor_id = ? AND signal_strength IN ('hot', 'purchase_proximate')"
  ).get(vendor.id) as { hotSignals: number }

  return {
    signals: signals.map(s => {
      const meta = (() => { try { return JSON.parse(s.metadata) } catch { return {} } })()
      return {
        id: s.id,
        appId: s.app_id,
        appName: s.app_name,
        eventType: s.event_type,
        signalStrength: s.signal_strength,
        userCompany: s.user_company,
        userRole: s.user_role,
        userLocation: s.user_location,
        comparedTo: meta.comparedTo ?? null,
        timeSpentSeconds: meta.timeSpentSeconds ?? null,
        sourcePage: meta.sourcePage ?? null,
        createdAt: s.created_at
      }
    }),
    totalSignals,
    hotSignals,
    plan: planName,
    upgradeRequired: false
  }
})
