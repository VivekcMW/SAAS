/**
 * GET /api/buyer/reviews
 * Returns reviews written by the authenticated user.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

interface ReviewRow {
  id: string
  app_id: string
  app_name: string
  app_slug: string
  rating: number
  title: string
  content: string
  helpful_votes: number
  status: string
  created_at: string
  vendor_reply: string | null
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const rows = db.prepare(`
    SELECT
      r.id,
      r.app_id,
      COALESCE(a.name, '') AS app_name,
      COALESCE(a.slug, '') AS app_slug,
      r.rating,
      r.title,
      r.content,
      r.helpful_votes,
      r.status,
      r.created_at,
      (SELECT body FROM review_replies rr WHERE rr.review_id = r.id LIMIT 1) AS vendor_reply
    FROM reviews r
    LEFT JOIN app_listings a ON a.id = r.app_id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `).all(user.id) as ReviewRow[]

  return {
    reviews: rows.map(r => ({
      id: r.id,
      product: r.app_name,
      productSlug: r.app_slug,
      rating: r.rating,
      title: r.title,
      body: r.content,
      createdAt: r.created_at.slice(0, 10),
      helpful: r.helpful_votes,
      vendorReplied: !!r.vendor_reply,
      status: r.status,
    })),
  }
})
