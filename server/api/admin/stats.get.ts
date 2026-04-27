/**
 * GET /api/admin/stats
 * Platform-wide analytics for the admin dashboard.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  await requireAdmin(event)
  const db = getDb()

  const { totalUsers } = db.prepare('SELECT COUNT(*) as totalUsers FROM users').get() as { totalUsers: number }
  const { totalListings } = db.prepare("SELECT COUNT(*) as totalListings FROM app_listings WHERE status = 'published'").get() as { totalListings: number }
  const { pendingListings } = db.prepare("SELECT COUNT(*) as pendingListings FROM app_listings WHERE status = 'submitted'").get() as { pendingListings: number }
  const { totalReviews } = db.prepare("SELECT COUNT(*) as totalReviews FROM reviews WHERE status = 'approved'").get() as { totalReviews: number }
  const { pendingReviews } = db.prepare("SELECT COUNT(*) as pendingReviews FROM reviews WHERE status = 'pending'").get() as { pendingReviews: number }
  const { totalVendors } = db.prepare("SELECT COUNT(*) as totalVendors FROM users WHERE role = 'vendor'").get() as { totalVendors: number }
  const { totalBuyers } = db.prepare("SELECT COUNT(*) as totalBuyers FROM users WHERE role = 'buyer'").get() as { totalBuyers: number }
  const { totalIntentEvents } = db.prepare('SELECT COUNT(*) as totalIntentEvents FROM buyer_intent_events').get() as { totalIntentEvents: number }
  const { hotSignals } = db.prepare("SELECT COUNT(*) as hotSignals FROM buyer_intent_events WHERE signal_strength IN ('hot','purchase_proximate')").get() as { hotSignals: number }

  // Discovery stats
  const discoveryCounts = db.prepare(
    'SELECT status, COUNT(*) as c FROM discovery_queue GROUP BY status'
  ).all() as Array<{ status: string; c: number }>
  const discoveryMap: Record<string, number> = {}
  discoveryCounts.forEach(({ status, c }) => { discoveryMap[status] = c })

  // User signups last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { recentSignups } = db.prepare(
    'SELECT COUNT(*) as recentSignups FROM users WHERE created_at >= ?'
  ).get(sevenDaysAgo) as { recentSignups: number }

  // Top categories by listing count
  const topCategories = db.prepare(`
    SELECT category, COUNT(*) as count FROM app_listings WHERE status = 'published'
    GROUP BY category ORDER BY count DESC LIMIT 5
  `).all() as Array<{ category: string; count: number }>

  // Active subscriptions
  const { activeSubscriptions } = db.prepare(
    "SELECT COUNT(*) as activeSubscriptions FROM user_subscriptions WHERE stripe_status = 'active'"
  ).get() as { activeSubscriptions: number }

  return {
    overview: {
      totalUsers,
      totalListings,
      pendingListings,
      totalReviews,
      pendingReviews,
      totalVendors,
      totalBuyers,
      totalIntentEvents,
      hotSignals,
      activeSubscriptions,
      recentSignups
    },
    discovery: {
      pending: discoveryMap.pending ?? 0,
      auto_submitted: discoveryMap.auto_submitted ?? 0,
      review: discoveryMap.review ?? 0,
      approved: discoveryMap.approved ?? 0,
      rejected: discoveryMap.rejected ?? 0,
      discarded: discoveryMap.discarded ?? 0
    },
    topCategories
  }
})
