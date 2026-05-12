import { getDb, makeId, logActivity } from '~/server/utils/database'
import { sendEmail, ADMIN_EMAIL } from '~/server/utils/email'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

/**
 * POST /api/integrations/request
 * Saves a user-submitted integration request to the DB and notifies admins.
 */
export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { limit: 3, windowMs: 60 * 60 * 1000, prefix: 'int-req' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }

  const body = await readBody<{
    name?: string
    url?: string
    description?: string
    email?: string
  }>(event)

  if (!body?.name?.trim() || !body?.description?.trim() || !body?.email?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Integration name, description and email are required.' })
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address.' })
  }

  const db = getDb()
  const now = new Date().toISOString()
  const id = makeId('int')

  // Log the request in activity_log for admin visibility
  db.prepare(`
    INSERT INTO activity_log (id, actor_email, action, entity_type, entity_id, meta, created_at)
    VALUES (?, ?, 'integration_request', 'integration', ?, ?, ?)
  `).run(
    makeId('act'),
    body.email,
    id,
    JSON.stringify({
      id,
      name: body.name.trim(),
      url: body.url?.trim() || null,
      description: body.description.trim().slice(0, 2000),
      requester_email: body.email.trim(),
      ip: getClientIp(event)
    }),
    now
  )

  logActivity({
    actorEmail: body.email,
    action: 'integration_request_submitted',
    entityType: 'integration',
    entityId: id,
    meta: { name: body.name.trim() }
  })

  // Notify admins
  await sendEmail({
    to: ADMIN_EMAIL,
    replyTo: body.email,
    subject: `Integration request: ${body.name.trim()}`,
    text: `New integration request submitted.

Integration: ${body.name.trim()}
URL:         ${body.url || '(not provided)'}
Requester:   ${body.email}

Description:
${body.description.trim()}
`
  })

  return { ok: true, id }
})
