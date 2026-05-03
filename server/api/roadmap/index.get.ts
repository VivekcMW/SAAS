import { getDb } from '~/server/utils/database'
import { checkRateLimit } from '~/server/utils/rateLimit'

interface RoadmapRow {
  id: string
  title: string
  description: string
  category: string
  status: string
  quarter: string
  votes: number
  created_at: string
  updated_at: string
}

interface QuarterGroup {
  quarter: string
  items: RoadmapRow[]
}

const VALID_STATUSES = ['planned', 'in-progress', 'done', 'cancelled']
const VALID_CATEGORIES = ['product', 'infrastructure', 'community', 'api']

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(ip, { limit: 120, windowMs: 60_000, prefix: 'roadmap' }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  const query = getQuery(event)
  const status = typeof query.status === 'string' ? query.status : ''
  const category = typeof query.category === 'string' ? query.category : ''

  const conditions: string[] = []
  const params: Record<string, string> = {}

  if (status && VALID_STATUSES.includes(status)) {
    conditions.push('status = @status')
    params.status = status
  }
  if (category && VALID_CATEGORIES.includes(category)) {
    conditions.push('category = @category')
    params.category = category
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const db = getDb()
  const rows = db
    .prepare(
      `SELECT * FROM roadmap_items ${whereSql}
       ORDER BY quarter ASC, votes DESC, created_at ASC`
    )
    .all(params) as RoadmapRow[]

  // Group by quarter
  const groupMap = new Map<string, RoadmapRow[]>()
  for (const row of rows) {
    const existing = groupMap.get(row.quarter)
    if (existing) {
      existing.push(row)
    } else {
      groupMap.set(row.quarter, [row])
    }
  }

  const grouped: QuarterGroup[] = []
  for (const [quarter, items] of groupMap) {
    grouped.push({ quarter, items })
  }

  return { groups: grouped, total: rows.length }
})
