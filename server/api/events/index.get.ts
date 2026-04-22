import type { DbEvent } from '~/server/utils/database'
import { getDb } from '~/server/utils/database'

interface EventListItem {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  eventType: DbEvent['event_type']
  location: string
  isOnline: boolean
  startsAt: string
  endsAt: string | null
  timezone: string
  coverImage: string | null
  registerUrl: string | null
  hostName: string | null
  featured: boolean
}

interface EventListResponse {
  upcoming: EventListItem[]
  past: EventListItem[]
  featured: EventListItem | null
}

function toPublicItem(row: DbEvent): EventListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
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
    featured: !!row.featured
  }
}

export default defineEventHandler((event): EventListResponse => {
  const db = getDb()
  const now = new Date().toISOString()

  const upcoming = db
    .prepare(
      `SELECT * FROM events
       WHERE status = 'approved' AND starts_at >= ?
       ORDER BY starts_at ASC
       LIMIT 50`
    )
    .all(now) as DbEvent[]

  const past = db
    .prepare(
      `SELECT * FROM events
       WHERE status = 'approved' AND starts_at < ?
       ORDER BY starts_at DESC
       LIMIT 20`
    )
    .all(now) as DbEvent[]

  const featured = upcoming.find((e) => e.featured) || upcoming[0] || null

  setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300')

  return {
    upcoming: upcoming.map(toPublicItem),
    past: past.map(toPublicItem),
    featured: featured ? toPublicItem(featured) : null
  }
})
