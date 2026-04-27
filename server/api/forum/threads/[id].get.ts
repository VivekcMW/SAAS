/**
 * GET /api/forum/threads/:id
 * Returns a single thread + its replies.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = getDb()

  const thread = db.prepare(`SELECT * FROM forum_threads WHERE id = ?`).get(id)
  if (!thread) throw createError({ statusCode: 404, statusMessage: 'Thread not found' })

  // Increment view count
  db.prepare(`UPDATE forum_threads SET view_count = view_count + 1 WHERE id = ?`).run(id)

  const replies = db.prepare(`
    SELECT id, author_name, body, is_accepted, created_at
    FROM forum_replies WHERE thread_id = ? ORDER BY created_at ASC
  `).all(id)

  return { thread, replies }
})
