/**
 * GET /api/qa/tags
 * Returns top tags for the tag cloud.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (_event) => {
  const db = getDb()
  const tags = db.prepare(`
    SELECT tag, question_count FROM question_tags
    WHERE question_count > 0
    ORDER BY question_count DESC
    LIMIT 50
  `).all() as { tag: string; question_count: number }[]

  return { tags }
})
