import { getDb } from '../../../utils/database'

export default defineEventHandler(async (event) => {
  const userId = event.context.params?.id as string
  if (!userId) {
    setResponseStatus(event, 400)
    return { error: 'id is required' }
  }

  const db = getDb()

  // Reviewer profile — aggregate from reviews by user_id
  const reviews = db.prepare(`
    SELECT r.id, r.rating, r.title, r.content, r.verified, r.helpful_votes, r.created_at,
           al.name as app_name, al.slug as app_slug, al.category as app_category
    FROM reviews r
    JOIN app_listings al ON al.id = r.app_id
    WHERE r.user_id = ? AND r.status = 'published'
    ORDER BY r.created_at DESC
    LIMIT 50
  `).all(userId) as Array<{
    id: string; rating: number; title: string; content: string; verified: number;
    helpful_votes: number; created_at: string; app_name: string; app_slug: string; app_category: string
  }>

  if (!reviews.length) {
    setResponseStatus(event, 404)
    return { error: 'Reviewer not found or no published reviews' }
  }

  // Get display name from most recent review
  const nameRow = db.prepare(`SELECT user_name FROM reviews WHERE user_id = ? LIMIT 1`).get(userId) as { user_name: string } | undefined
  const displayName = nameRow?.user_name || 'Anonymous Reviewer'

  const totalHelpful = reviews.reduce((sum, r) => sum + r.helpful_votes, 0)
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const verifiedCount = reviews.filter((r) => r.verified).length

  const badgeLevel = reviews.length >= 20 ? 'Gold Reviewer' : reviews.length >= 10 ? 'Silver Reviewer' : reviews.length >= 5 ? 'Verified Contributor' : 'Reviewer'

  return {
    profile: {
      userId,
      displayName,
      reviewCount: reviews.length,
      verifiedReviews: verifiedCount,
      averageRating: Math.round(avgRating * 10) / 10,
      helpfulVotes: totalHelpful,
      badgeLevel,
      memberSince: reviews[reviews.length - 1]?.created_at
    },
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content.slice(0, 300) + (r.content.length > 300 ? '…' : ''),
      verified: r.verified === 1,
      helpfulVotes: r.helpful_votes,
      createdAt: r.created_at,
      app: { name: r.app_name, slug: r.app_slug, category: r.app_category }
    }))
  }
})
