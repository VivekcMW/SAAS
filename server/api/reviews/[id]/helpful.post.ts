/**
 * POST /api/reviews/[id]/helpful
 * Toggle helpful vote on a review. Uses IP + user-id as voter_key.
 * One vote per visitor per review (idempotent).
 */
import { getDb } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { getClientIp } from '~/server/utils/rateLimit'
import { checkRateLimit } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Review id is required' })

  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'helpful', limit: 30, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests.' })
  }

  const db = getDb()
  const review = db.prepare(
    `SELECT id, helpful_votes FROM reviews WHERE id = ? AND status = 'published'`
  ).get(id) as { id: string; helpful_votes: number } | undefined
  if (!review) throw createError({ statusCode: 404, statusMessage: 'Review not found' })

  const user = await getSessionUser(event).catch(() => null)
  const voterKey = user ? `user:${user.id}` : `ip:${ip}`

  const existing = db.prepare(
    `SELECT review_id FROM review_votes WHERE review_id = ? AND voter_key = ?`
  ).get(id, voterKey)

  if (existing) {
    // Toggle off (un-vote)
    db.prepare(`DELETE FROM review_votes WHERE review_id = ? AND voter_key = ?`).run(id, voterKey)
    const newCount = Math.max(0, review.helpful_votes - 1)
    db.prepare(`UPDATE reviews SET helpful_votes = ? WHERE id = ?`).run(newCount, id)
    return { voted: false, helpfulVotes: newCount }
  } else {
    // Vote
    db.prepare(
      `INSERT INTO review_votes (review_id, voter_key, created_at) VALUES (?, ?, ?)`
    ).run(id, voterKey, new Date().toISOString())
    const newCount = review.helpful_votes + 1
    db.prepare(`UPDATE reviews SET helpful_votes = ? WHERE id = ?`).run(newCount, id)
    return { voted: true, helpfulVotes: newCount }
  }
})
