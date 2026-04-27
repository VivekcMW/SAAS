/**
 * POST /api/qa/questions/:id/answers
 * Post an answer to a question.
 */
import { getDb, makeId } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const questionId = getRouterParam(event, 'id')
  const ip = getClientIp(event)

  if (!checkRateLimit(ip, { prefix: 'qa_answer', limit: 10, windowMs: 60 * 60 * 1000 })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many answers. Try again later.' })
  }

  const body = await readBody(event)
  const { body: answerBody, author_name, author_email } = body || {}

  if (!answerBody?.trim() || answerBody.trim().length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Answer body must be at least 10 characters' })
  }

  const db = getDb()
  const question = db.prepare(`SELECT id FROM questions WHERE id = ?`).get(questionId)
  if (!question) throw createError({ statusCode: 404, statusMessage: 'Question not found' })

  const user = await getSessionUser(event).catch(() => null)
  const now = new Date().toISOString()
  const id = makeId('ans')

  db.prepare(`
    INSERT INTO answers (id, question_id, user_id, author_name, author_email, body, is_accepted, vote_score, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
  `).run(
    id, questionId, user?.id || null,
    user ? `${user.first_name} ${user.last_name}`.trim() : (author_name?.trim() || 'Anonymous'),
    user?.email || author_email?.trim() || null,
    answerBody.trim(), now, now
  )

  db.prepare(`UPDATE questions SET answer_count = answer_count + 1, updated_at = ? WHERE id = ?`).run(now, questionId)

  return { id, message: 'Answer posted' }
})
