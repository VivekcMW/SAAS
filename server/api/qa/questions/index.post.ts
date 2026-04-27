/**
 * POST /api/qa/questions
 * Ask a new question. Auth optional.
 */
import { getDb, makeId, makeSlug } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'qa_ask', limit: 5, windowMs: 60 * 60 * 1000 })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many questions. Try again later.' })
  }

  const body = await readBody(event)
  const { title, body: questionBody, tags, app_id, author_name, author_email } = body || {}

  if (!title?.trim() || title.trim().length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'title must be at least 10 characters' })
  }
  if (!questionBody?.trim() || questionBody.trim().length < 20) {
    throw createError({ statusCode: 400, statusMessage: 'body must be at least 20 characters' })
  }

  const db = getDb()
  const user = await getSessionUser(event).catch(() => null)
  const now = new Date().toISOString()
  const id = makeId('qst')

  // Generate unique slug from title
  const baseSlug = makeSlug(title.trim().slice(0, 80))
  let slug = baseSlug
  let attempt = 0
  while (db.prepare(`SELECT id FROM questions WHERE slug = ?`).get(slug)) {
    slug = `${baseSlug}-${++attempt}`
  }

  const tagsArr = Array.isArray(tags) ? tags.slice(0, 5).map((t: string) => t.toLowerCase().trim()) : []

  db.prepare(`
    INSERT INTO questions (id, user_id, author_name, author_email, title, body, slug, app_id, tags,
                           view_count, answer_count, vote_score, solved, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?)
  `).run(
    id, user?.id || null,
    user ? `${user.first_name} ${user.last_name}`.trim() : (author_name?.trim() || 'Anonymous'),
    user?.email || author_email?.trim() || null,
    title.trim(), questionBody.trim(), slug,
    app_id || null, JSON.stringify(tagsArr), now, now
  )

  // Update tag counts
  for (const tag of tagsArr) {
    db.prepare(`
      INSERT INTO question_tags (tag, question_count) VALUES (?, 1)
      ON CONFLICT(tag) DO UPDATE SET question_count = question_count + 1
    `).run(tag)
  }

  return { id, slug, message: 'Question posted' }
})
