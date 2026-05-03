import { getDb } from '~/server/utils/database'
import { checkRateLimit } from '~/server/utils/rateLimit'

interface ChangelogRow {
  id: string
  version: string
  title: string
  summary: string
  body_markdown: string
  type: string
  published_at: string
  created_at: string
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(ip, { limit: 120, windowMs: 60_000, prefix: 'changelog' }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
  const type = typeof query.type === 'string' ? query.type : ''
  const offset = (page - 1) * limit

  const db = getDb()

  let whereSql = ''
  const params: Record<string, string | number> = { limit, offset }

  const validTypes = ['feature', 'fix', 'improvement', 'security', 'breaking']
  if (type && validTypes.includes(type)) {
    whereSql = 'WHERE type = @type'
    params.type = type
  }

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM changelog_entries ${whereSql}`)
    .get(params) as { count: number }

  const rows = db
    .prepare(
      `SELECT * FROM changelog_entries ${whereSql}
       ORDER BY published_at DESC
       LIMIT @limit OFFSET @offset`
    )
    .all(params) as ChangelogRow[]

  return {
    entries: rows,
    pagination: {
      page,
      limit,
      total: totalRow.count,
      pages: Math.ceil(totalRow.count / limit)
    }
  }
})
