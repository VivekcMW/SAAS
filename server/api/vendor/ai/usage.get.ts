/**
 * GET /api/vendor/ai/usage
 * Returns the current month's AI usage for the authenticated vendor.
 * Enforced limits by plan:
 *   free      → 3 generations/month
 *   growth    → 30 generations/month
 *   scale     → unlimited
 *   enterprise→ unlimited
 */
import { requireVendor, getVendorProfileForUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 10,
  growth: 30,
  scale: Infinity,
  enterprise: Infinity,
}

function getPlanLimit(plan: string | null | undefined): number {
  if (!plan) return PLAN_LIMITS.free
  return PLAN_LIMITS[plan.toLowerCase()] ?? PLAN_LIMITS.free
}

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })

  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS vendor_ai_usage (
      id         TEXT PRIMARY KEY,
      vendor_id  TEXT NOT NULL,
      type       TEXT NOT NULL DEFAULT 'listing_copy',
      month      TEXT NOT NULL,
      count      INTEGER NOT NULL DEFAULT 0,
      UNIQUE(vendor_id, type, month)
    );
  `)

  const month = new Date().toISOString().slice(0, 7) // YYYY-MM

  const row = db.prepare('SELECT count FROM vendor_ai_usage WHERE vendor_id = ? AND type = ? AND month = ?')
    .get(vendor.id, 'listing_copy', month) as { count: number } | undefined

  // Get subscription plan for this vendor's user
  const sub = db.prepare(`
    SELECT plan FROM user_subscriptions WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1
  `).get(user.id) as { plan: string } | undefined

  const plan = sub?.plan ?? 'free'
  const limit = getPlanLimit(plan)
  const used = row?.count ?? 0

  return {
    plan,
    used,
    limit: limit === Infinity ? null : limit,
    remaining: limit === Infinity ? null : Math.max(0, limit - used),
    hasAccess: used < limit,
    month,
  }
})
