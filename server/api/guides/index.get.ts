import { getDb } from '~/server/utils/database'
import { checkRateLimit } from '~/server/utils/rateLimit'

interface GuideRow {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  difficulty: string
  read_minutes: number
  author: string
  tags: string
  related_app_ids: string
  status: string
  published_at: string
}

const VALID_CATEGORIES = ['buyer-tips', 'vendor-guide', 'api-docs', 'getting-started', 'negotiation']
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(ip, { limit: 120, windowMs: 60_000, prefix: 'guides-list' }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
  const offset = (page - 1) * limit
  const category = typeof query.category === 'string' ? query.category : ''
  const difficulty = typeof query.difficulty === 'string' ? query.difficulty : ''

  const conditions: string[] = ["status = 'published'"]
  const params: Record<string, string | number> = { limit, offset }

  if (category && VALID_CATEGORIES.includes(category)) {
    conditions.push('category = @category')
    params.category = category
  }
  if (difficulty && VALID_DIFFICULTIES.includes(difficulty)) {
    conditions.push('difficulty = @difficulty')
    params.difficulty = difficulty
  }

  const whereSql = `WHERE ${conditions.join(' AND ')}`
  const db = getDb()

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM guide_articles ${whereSql}`)
    .get(params) as { count: number }

  const rows = db
    .prepare(
      `SELECT id, slug, title, excerpt, category, difficulty, read_minutes, author, tags, related_app_ids, status, published_at
       FROM guide_articles ${whereSql}
       ORDER BY published_at DESC
       LIMIT @limit OFFSET @offset`
    )
    .all(params) as GuideRow[]

  const guides = rows.map(g => ({
    ...g,
    tags: safeParseJson(g.tags, []),
    related_app_ids: safeParseJson(g.related_app_ids, [])
  }))

  return {
    guides,
    pagination: {
      page,
      limit,
      total: totalRow.count,
      pages: Math.ceil(totalRow.count / limit)
    }
  }
})

function safeParseJson(value: string, fallback: unknown) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
