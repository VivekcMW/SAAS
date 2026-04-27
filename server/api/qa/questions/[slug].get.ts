/**
 * GET /api/qa/questions/:slug
 * Fetch a single question with all its answers. Public, SSR-friendly.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const db = getDb()

  const question = db.prepare(`SELECT * FROM questions WHERE slug = ?`).get(slug) as Record<string, unknown> | undefined
  if (!question) throw createError({ statusCode: 404, statusMessage: 'Question not found' })

  // Increment view count
  db.prepare(`UPDATE questions SET view_count = view_count + 1 WHERE id = ?`).run(question.id)

  const answers = db.prepare(`
    SELECT id, author_name, body, is_accepted, vote_score, created_at
    FROM answers WHERE question_id = ?
    ORDER BY is_accepted DESC, vote_score DESC, created_at ASC
  `).all(question.id as string) as any[]

  // Related questions (same app or overlapping tags)
  const related = db.prepare(`
    SELECT id, title, slug, answer_count, vote_score, solved
    FROM questions
    WHERE id != ? AND (app_id = ? OR tags LIKE ?)
    ORDER BY vote_score DESC
    LIMIT 5
  `).all(question.id, question.app_id || '__none__', `%${(question.app_id || '')}%`) as any[]

  return {
    question: { ...question, tags: safeJson(question.tags, []) },
    answers,
    related
  }
})

function safeJson(v: unknown, fb: unknown) {
  if (!v) return fb; try { return JSON.parse(v as string) } catch { return fb }
}
