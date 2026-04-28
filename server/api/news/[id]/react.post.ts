/**
 * POST /api/news/:id/react
 * Upvote a published news post. Idempotent — one per user/IP.
 */
import { createError, defineEventHandler, getRouterParams } from 'h3'
import { getDb } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing post id' })

  const db = getDb()
  const post = db.prepare("SELECT id, upvote_count FROM news_posts WHERE id = ? AND status = 'published'").get(id) as
    { id: string; upvote_count: number } | undefined

  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  const user = await getSessionUser(event)
  const ip = (event.node.req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
    || event.node.req.socket?.remoteAddress || 'unknown'
  const voterKey = user
    ? `user:${user.id}`
    : `ip:${createHash('sha256').update(ip).digest('hex').slice(0, 16)}`

  const now = new Date().toISOString()
  const result = db.prepare(
    "INSERT OR IGNORE INTO news_post_reactions (post_id, voter_key, reaction, created_at) VALUES (?, ?, 'upvote', ?)"
  ).run(id, voterKey, now)

  let upvoteCount = post.upvote_count
  if (result.changes > 0) {
    db.prepare('UPDATE news_posts SET upvote_count = upvote_count + 1 WHERE id = ?').run(id)
    upvoteCount += 1
  }

  return { success: true, alreadyVoted: result.changes === 0, upvoteCount }
})
