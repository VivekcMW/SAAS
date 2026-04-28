/**
 * GET /api/admin/stats
 * Platform-wide analytics for the admin dashboard.
 * Returns shape matching the LiveStats interface in AdminOverview.vue.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()

  const { totalUsers } = db.prepare('SELECT COUNT(*) as totalUsers FROM users').get() as { totalUsers: number }
  const { totalVendors } = db.prepare("SELECT COUNT(*) as totalVendors FROM users WHERE role = 'vendor'").get() as { totalVendors: number }
  const { totalBuyers } = db.prepare("SELECT COUNT(*) as totalBuyers FROM users WHERE role = 'buyer'").get() as { totalBuyers: number }

  const { totalListings } = db.prepare('SELECT COUNT(*) as totalListings FROM app_listings').get() as { totalListings: number }
  const { publishedListings } = db.prepare("SELECT COUNT(*) as publishedListings FROM app_listings WHERE status = 'published'").get() as { publishedListings: number }
  const { pendingListings } = db.prepare("SELECT COUNT(*) as pendingListings FROM app_listings WHERE status = 'submitted'").get() as { pendingListings: number }
  const { autoDiscovered } = db.prepare("SELECT COUNT(*) as autoDiscovered FROM app_listings WHERE source = 'auto_discovery'").get() as { autoDiscovered: number }

  const { totalReviews } = db.prepare("SELECT COUNT(*) as totalReviews FROM reviews WHERE status = 'approved'").get() as { totalReviews: number }
  const { pendingReviews } = db.prepare("SELECT COUNT(*) as pendingReviews FROM reviews WHERE status = 'pending'").get() as { pendingReviews: number }

  // Discovery queue
  const discoveryCounts = db.prepare(
    'SELECT status, COUNT(*) as c FROM discovery_queue GROUP BY status'
  ).all() as Array<{ status: string; c: number }>
  const discoveryMap: Record<string, number> = {}
  discoveryCounts.forEach(({ status, c }) => { discoveryMap[status] = c })
  const totalDiscovery = discoveryCounts.reduce((sum, r) => sum + r.c, 0)

  // Subscriptions / MRR
  const { activeSubscriptions } = db.prepare(
    "SELECT COUNT(*) as activeSubscriptions FROM user_subscriptions WHERE stripe_status = 'active'"
  ).get() as { activeSubscriptions: number }
  // Estimate MRR: count plan tiers for users
  const planRows = db.prepare(
    "SELECT plan, COUNT(*) as c FROM users WHERE plan != 'Free' GROUP BY plan"
  ).all() as Array<{ plan: string; c: number }>
  const PLAN_PRICE: Record<string, number> = {
    Starter: 29, Professional: 79, Enterprise: 299, 'Vendor Growth': 99, 'Buyer Pro': 49
  }
  const mrr = planRows.reduce((sum, r) => sum + (PLAN_PRICE[r.plan] ?? 0) * r.c, 0)

  // Intent events last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { intentLast30d } = db.prepare(
    'SELECT COUNT(*) as intentLast30d FROM buyer_intent_events WHERE created_at >= ?'
  ).get(thirtyDaysAgo) as { intentLast30d: number }

  // Top categories
  const topCategories = db.prepare(`
    SELECT category, COUNT(*) as count FROM app_listings WHERE status = 'published'
    GROUP BY category ORDER BY count DESC LIMIT 5
  `).all() as Array<{ category: string; count: number }>

  return {
    users: {
      total: totalUsers,
      buyers: totalBuyers,
      vendors: totalVendors
    },
    listings: {
      total: totalListings,
      published: publishedListings,
      pending: pendingListings,
      autoDiscovered: autoDiscovered ?? 0
    },
    reviews: {
      total: totalReviews,
      pending: pendingReviews
    },
    discovery: {
      total: totalDiscovery,
      pending: discoveryMap.pending ?? 0,
      auto_submitted: discoveryMap.auto_submitted ?? 0,
      review: discoveryMap.review ?? 0,
      approved: discoveryMap.approved ?? 0
    },
    subscriptions: {
      active: activeSubscriptions,
      mrr
    },
    intentEvents: {
      last30d: intentLast30d
    },
    topCategories
  }
})
