/**
 * GET /api/vendor/intelligence
 * Returns competitive intelligence for the vendor's listings.
 * Requires a paid plan.
 */
import { getDb } from '~/server/utils/database'
import { requireVendor } from '~/server/utils/auth'

const PAID_PLANS = ['growth', 'scale', 'professional', 'enterprise', 'pro']

export default defineEventHandler((event) => {
  const user = await requireVendor(event)
  const db = getDb()

  const vendor = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as
    | { id: string } | undefined
  if (!vendor) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  const planName = user.plan?.toLowerCase() ?? 'free'
  const hasPaidPlan = PAID_PLANS.some(p => planName.includes(p))

  if (!hasPaidPlan && user.role !== 'admin') {
    return { upgradeRequired: true, plan: planName }
  }

  // Get vendor's listings
  const listings = db.prepare(`
    SELECT id, name, rating, review_count, category FROM app_listings WHERE vendor_id = ? AND status = 'published'
  `).all(vendor.id) as Array<{ id: string; name: string; rating: number; review_count: number; category: string }>

  if (listings.length === 0) {
    return { upgradeRequired: false, plan: planName, noListings: true }
  }

  const mainListing = listings[0]
  const category = mainListing.category

  // Category average rating
  const { categoryAvg } = db.prepare(`
    SELECT AVG(rating) as categoryAvg FROM app_listings WHERE category = ? AND status = 'published'
  `).get(category) as { categoryAvg: number }

  // Top competitor in same category
  const topCompetitor = db.prepare(`
    SELECT name, rating FROM app_listings
    WHERE category = ? AND status = 'published' AND vendor_id != ? AND review_count > 0
    ORDER BY rating DESC LIMIT 1
  `).get(category, vendor.id) as { name: string; rating: number } | undefined

  // Buyer intent breakdown for this vendor's apps
  const intentBreakdown = db.prepare(`
    SELECT event_type, COUNT(*) as count FROM buyer_intent_events
    WHERE vendor_id = ? GROUP BY event_type ORDER BY count DESC
  `).all(vendor.id) as Array<{ event_type: string; count: number }>

  // Top buyer personas from intent events
  const topRole = db.prepare(`
    SELECT user_role, COUNT(*) as c FROM buyer_intent_events
    WHERE vendor_id = ? AND user_role IS NOT NULL
    GROUP BY user_role ORDER BY c DESC LIMIT 1
  `).get(vendor.id) as { user_role: string } | undefined

  const topCompany = db.prepare(`
    SELECT user_company, COUNT(*) as c FROM buyer_intent_events
    WHERE vendor_id = ? AND user_company IS NOT NULL
    GROUP BY user_company ORDER BY c DESC LIMIT 1
  `).get(vendor.id) as { user_company: string } | undefined

  // Recent reviews pros/cons analysis for content gaps
  const recentReviews = db.prepare(`
    SELECT content, rating FROM reviews
    WHERE app_id IN (SELECT id FROM app_listings WHERE vendor_id = ?) AND status = 'approved'
    ORDER BY created_at DESC LIMIT 50
  `).all(vendor.id) as Array<{ content: string; rating: number }>

  // Simple content gap detection: look for common buyer questions
  const commonTopics = ['gdpr', 'mobile', 'api', 'integration', 'pricing', 'security', 'support', 'onboarding']
  const listingData = db.prepare(`
    SELECT long_description, key_features, integrations FROM app_listings WHERE vendor_id = ? LIMIT 1
  `).get(vendor.id) as { long_description: string; key_features: string; integrations: string } | undefined

  const listingText = [
    listingData?.long_description ?? '',
    listingData?.key_features ?? '',
    listingData?.integrations ?? ''
  ].join(' ').toLowerCase()

  const contentGaps = commonTopics
    .filter(topic => !listingText.includes(topic))
    .slice(0, 3)
    .map(topic => `Your listing doesn't mention "${topic}" — a common buyer search term in ${category}.`)

  return {
    upgradeRequired: false,
    plan: planName,
    competitiveSentimentMap: {
      yourScore: mainListing.rating,
      categoryAvg: Math.round((categoryAvg ?? 0) * 10) / 10,
      topCompetitor: topCompetitor ? { name: topCompetitor.name, score: topCompetitor.rating } : null,
      reviewCount: mainListing.review_count
    },
    contentGaps: contentGaps.length > 0 ? contentGaps : ['Your listing looks comprehensive! Focus on collecting more reviews.'],
    buyerPersonas: {
      topRole: topRole?.user_role ?? 'Unknown',
      topCompany: topCompany?.user_company ?? 'Various',
      topIndustry: 'Software & Technology',
      intentBreakdown: intentBreakdown.slice(0, 5)
    }
  }
})
