/**
 * GET /api/qa/questions
 * Paginated list of Q&A questions.
 * Query: ?app=appId  ?tag=slug  ?solved=1|0  ?q=search  ?page=  ?limit=  ?sort=recent|votes|unanswered
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const appId = query.app as string || ''
  const tag = query.tag as string || ''
  const search = query.q as string || ''
  const solved = query.solved !== undefined ? (query.solved === '1' || query.solved === 'true' ? 1 : 0) : null
  const sort = (query.sort as string) || 'recent'
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, parseInt(query.limit as string) || 20)
  const offset = (page - 1) * limit

  const db = getDb()

  const conditions: string[] = []
  const params: unknown[] = []

  if (appId) { conditions.push('app_id = ?'); params.push(appId) }
  if (solved !== null) { conditions.push('solved = ?'); params.push(solved) }
  if (search) { conditions.push("(title LIKE ? OR body LIKE ?)"); params.push(`%${search}%`, `%${search}%`) }
  if (tag) { conditions.push("tags LIKE ?"); params.push(`%"${tag}"%`) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const orderMap: Record<string, string> = {
    recent: 'created_at DESC',
    votes: 'vote_score DESC, created_at DESC',
    unanswered: 'answer_count ASC, created_at DESC',
    active: 'updated_at DESC'
  }
  const orderBy = orderMap[sort] || orderMap.recent

  const questions = db.prepare(`
    SELECT id, title, slug, author_name, app_id, tags, view_count, answer_count, vote_score, solved, created_at
    FROM questions
    ${where}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as any[]

  const { total } = db.prepare(`SELECT COUNT(*) as total FROM questions ${where}`).get(...params) as { total: number }

  return {
    questions: questions.map(q => ({ ...q, tags: safeJson(q.tags, []) })),
    total, page, pages: Math.ceil(total / limit)
  }
})

function safeJson(v: unknown, fb: unknown) {
  if (!v) return fb; try { return JSON.parse(v as string) } catch { return fb }
}
