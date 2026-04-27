import { getDb, makeId, makeSlug } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { sendEmail, ADMIN_EMAIL } from '~/server/utils/email'

interface SubmitEventPayload {
  title?: string
  summary?: string
  description?: string
  category?: string
  eventType?: string
  location?: string
  isOnline?: boolean
  startsAt?: string
  endsAt?: string | null
  timezone?: string
  coverImage?: string | null
  registerUrl?: string | null
  hostName?: string
  hostEmail?: string
}

const ALLOWED_TYPES = new Set(['webinar', 'conference', 'meetup', 'launch', 'workshop', 'other'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<SubmitEventPayload>(event)
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Request body required' })
  }

  const title = (body.title || '').trim()
  const summary = (body.summary || '').trim()
  const startsAt = (body.startsAt || '').trim()
  const hostName = (body.hostName || '').trim()
  const hostEmail = (body.hostEmail || '').trim()

  if (!title || title.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'Title must be at least 3 characters' })
  }
  if (!summary || summary.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Summary must be at least 10 characters' })
  }
  if (!startsAt || Number.isNaN(Date.parse(startsAt))) {
    throw createError({ statusCode: 400, statusMessage: 'Valid start date/time is required' })
  }
  if (!hostName) {
    throw createError({ statusCode: 400, statusMessage: 'Host name is required' })
  }
  if (!hostEmail || !EMAIL_RE.test(hostEmail)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid host email is required' })
  }

  const eventType = ALLOWED_TYPES.has((body.eventType || '').toLowerCase())
    ? (body.eventType as string).toLowerCase()
    : 'webinar'

  const user = await getSessionUser(event)
  const db = getDb()
  const now = new Date().toISOString()
  const id = makeId('evt')

  // Ensure unique slug
  let slug = makeSlug(title) || `event-${id.slice(-6)}`
  const existing = db.prepare('SELECT id FROM events WHERE slug = ?').get(slug)
  if (existing) {
    slug = `${slug}-${id.slice(-6)}`
  }

  db.prepare(
    `INSERT INTO events (
      id, slug, title, summary, description, category, event_type, location,
      is_online, starts_at, ends_at, timezone, cover_image, register_url,
      host_name, host_email, status, featured, created_by, admin_notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, NULL, ?, ?)`
  ).run(
    id,
    slug,
    title,
    summary,
    (body.description || '').trim(),
    (body.category || 'General').trim(),
    eventType,
    (body.location || (body.isOnline ? 'Online' : '')).trim(),
    body.isOnline === false ? 0 : 1,
    new Date(startsAt).toISOString(),
    body.endsAt ? new Date(body.endsAt).toISOString() : null,
    (body.timezone || 'UTC').trim(),
    body.coverImage || null,
    body.registerUrl || null,
    hostName,
    hostEmail,
    user?.id || null,
    now,
    now
  )

  // Notify admin (best-effort)
  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New event submission: ${title}`,
      text: [
        `A new event has been submitted and is awaiting review.`,
        ``,
        `Title: ${title}`,
        `Type: ${eventType}`,
        `Starts: ${startsAt}`,
        `Host: ${hostName} <${hostEmail}>`,
        ``,
        `Summary:`,
        summary
      ].join('\n')
    })
  } catch {
    // ignore email errors
  }

  return { success: true, id, slug, status: 'pending' }
})
