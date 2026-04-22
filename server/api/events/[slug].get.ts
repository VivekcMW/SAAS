import type { DbEvent } from '~/server/utils/database'
import { getDb } from '~/server/utils/database'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Event slug is required' })
  }

  const db = getDb()
  const row = db
    .prepare(
      `SELECT * FROM events WHERE slug = ? AND status = 'approved' LIMIT 1`
    )
    .get(slug) as DbEvent | undefined

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    category: row.category,
    eventType: row.event_type,
    location: row.location,
    isOnline: !!row.is_online,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone,
    coverImage: row.cover_image,
    registerUrl: row.register_url,
    hostName: row.host_name,
    featured: !!row.featured,
    createdAt: row.created_at
  }
})
