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
  body_markdown: string
  related_app_ids: string
  status: string
  published_at: string
  updated_at: string
}

function safeParseJson(value: string, fallback: unknown) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(ip, { limit: 120, windowMs: 60_000, prefix: 'guides-detail' }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  const slug = getRouterParam(event, 'slug') ?? ''
  if (!slug || !/^[\w-]+$/.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })
  }

  const db = getDb()
  const row = db
    .prepare("SELECT * FROM guide_articles WHERE slug = ? AND status = 'published'")
    .get(slug) as GuideRow | undefined

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Guide not found' })
  }

  return {
    ...row,
    tags: safeParseJson(row.tags, []),
    related_app_ids: safeParseJson(row.related_app_ids, [])
  }
})
