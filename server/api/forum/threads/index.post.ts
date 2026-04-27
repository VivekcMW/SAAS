/**
 * POST /api/forum/threads
 * Create a new forum thread. Auth optional — uses session name or anonymous.
 */
import { getDb, makeId } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'

const VALID_CATEGORIES = ['general', 'product-reviews', 'help', 'announcements', 'show-and-tell']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, body: threadBody, category, author_name, author_email } = body || {}

  if (!title?.trim()) throw createError({ statusCode: 400, statusMessage: 'title is required' })
  if (!threadBody?.trim()) throw createError({ statusCode: 400, statusMessage: 'body is required' })
  if (!VALID_CATEGORIES.includes(category)) {
    throw createError({ statusCode: 400, statusMessage: `category must be one of: ${VALID_CATEGORIES.join(', ')}` })
  }

  const user = await getSessionUser(event).catch(() => null)
  const now = new Date().toISOString()
  const id = makeId('thr')

  const db = getDb()
  db.prepare(`
    INSERT INTO forum_threads
      (id, user_id, author_name, author_email, title, body, category, pinned, locked,
       reply_count, view_count, last_reply_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?)
  `).run(
    id,
    user?.id || null,
    user ? `${user.first_name} ${user.last_name}`.trim() : (author_name?.trim() || 'Anonymous'),
    user?.email || (author_email?.trim() || null),
    title.trim(),
    threadBody.trim(),
    category,
    now, now, now
  )

  return { id, message: 'Thread created' }
})
