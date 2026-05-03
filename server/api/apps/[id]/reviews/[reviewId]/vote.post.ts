/**
 * POST /api/apps/:id/reviews/:reviewId/vote
 * Mark a review as helpful. One vote per user (or hashed IP for anon).
 * Returns the updated helpful_votes count.
 */
import { createError, defineEventHandler, getRouterParams } from 'h3'
import { getDb, logActivity } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const { id: appId, reviewId } = getRouterParams(event)

  if (!appId || !reviewId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing app id or review id' })
  }

  const db = getDb()

  // Confirm the review belongs to this app and is approved
  const review = db.prepare(
    "SELECT id, helpful_votes FROM reviews WHERE id = ? AND app_id = ? AND status = 'approved'"
  ).get(reviewId, appId) as { id: string; helpful_votes: number } | undefined

  if (!review) {
    throw createError({ statusCode: 404, statusMessage: 'Review not found' })
  }

  // Determine voter key — authenticated user id or hashed IP
  const user = await getSessionUser(event)
  const ip = (
    event.node.req.headers['x-forwarded-for'] as string | undefined
  )?.split(',')[0]?.trim() || event.node.req.socket?.remoteAddress || 'unknown'

  const voterKey = user
    ? `user:${user.id}`
    : `ip:${createHash('sha256').update(ip).digest('hex').slice(0, 16)}`

  const now = new Date().toISOString()

  // Try to insert the vote; ignore if already voted (PRIMARY KEY constraint)
  const insertResult = db.prepare(
    'INSERT OR IGNORE INTO review_votes (review_id, voter_key, created_at) VALUES (?, ?, ?)'
  ).run(reviewId, voterKey, now)

  let helpfulVotes = review.helpful_votes

  if (insertResult.changes > 0) {
    db.prepare('UPDATE reviews SET helpful_votes = helpful_votes + 1, updated_at = ? WHERE id = ?').run(now, reviewId)
    helpfulVotes += 1
    if (user) logActivity({ actorId: user.id, actorEmail: user.email, action: 'review.voted', entityType: 'review', entityId: reviewId })
  }

  const alreadyVoted = insertResult.changes === 0

  return {
    success: true,
    alreadyVoted,
    helpfulVotes
  }
})
