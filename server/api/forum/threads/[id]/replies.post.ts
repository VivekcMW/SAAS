/**
 * POST /api/forum/threads/:id/replies
 * Add a reply to a thread.
 */
import { getDb, makeId } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const threadId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { body: replyBody, author_name, author_email } = body || {}

  if (!replyBody?.trim()) throw createError({ statusCode: 400, statusMessage: 'body is required' })

  const db = getDb()
  const thread = db.prepare(`SELECT id, locked FROM forum_threads WHERE id = ?`).get(threadId) as { id: string; locked: number } | undefined
  if (!thread) throw createError({ statusCode: 404, statusMessage: 'Thread not found' })
  if (thread.locked) throw createError({ statusCode: 403, statusMessage: 'Thread is locked' })

  const user = await getSessionUser(event).catch(() => null)
  const now = new Date().toISOString()
  const id = makeId('rep')

  db.prepare(`
    INSERT INTO forum_replies (id, thread_id, user_id, author_name, author_email, body, is_accepted, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    id, threadId,
    user?.id || null,
    user ? `${user.first_name} ${user.last_name}`.trim() : (author_name?.trim() || 'Anonymous'),
    user?.email || (author_email?.trim() || null),
    replyBody.trim(),
    now
  )

  // Update reply count + last_reply_at on thread
  db.prepare(`
    UPDATE forum_threads SET reply_count = reply_count + 1, last_reply_at = ?, updated_at = ? WHERE id = ?
  `).run(now, now, threadId)

  return { id, message: 'Reply added' }
})
