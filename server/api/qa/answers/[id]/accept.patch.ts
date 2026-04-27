/**
 * PATCH /api/qa/answers/:id/accept
 * Mark an answer as accepted. Only the question author can do this.
 */
import { getDb } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const answerId = getRouterParam(event, 'id')
  const user = await requireUser(event)
  const db = getDb()

  const answer = db.prepare(`SELECT id, question_id FROM answers WHERE id = ?`).get(answerId) as { id: string; question_id: string } | undefined
  if (!answer) throw createError({ statusCode: 404, statusMessage: 'Answer not found' })

  const question = db.prepare(`SELECT id, user_id FROM questions WHERE id = ?`).get(answer.question_id) as { id: string; user_id: string | null } | undefined
  if (!question) throw createError({ statusCode: 404, statusMessage: 'Question not found' })

  if (question.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Only the question author can accept an answer' })
  }

  const now = new Date().toISOString()
  // Unaccept any previously accepted answer for this question
  db.prepare(`UPDATE answers SET is_accepted = 0 WHERE question_id = ?`).run(answer.question_id)
  // Accept this one
  db.prepare(`UPDATE answers SET is_accepted = 1 WHERE id = ?`).run(answerId)
  // Mark question as solved
  db.prepare(`UPDATE questions SET solved = 1, accepted_answer_id = ?, updated_at = ? WHERE id = ?`)
    .run(answerId, now, answer.question_id)

  return { message: 'Answer accepted' }
})
