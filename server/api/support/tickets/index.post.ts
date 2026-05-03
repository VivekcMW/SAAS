/**
 * POST /api/support/tickets
 * Create a support ticket. Available to authenticated and guest users.
 */
import { getDb, makeId } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { ADMIN_EMAIL, sendEmail } from '~/server/utils/email'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

const VALID_CATEGORIES = new Set(['general', 'billing', 'technical', 'account', 'listing', 'review', 'other'])

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { prefix: 'support-ticket', limit: 5, windowMs: 60 * 60 * 1000 })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }

  const user = await getSessionUser(event).catch(() => null)
  const body = await readBody<{
    subject?: string
    body?: string
    category?: string
    guestEmail?: string
    guestName?: string
  }>(event)

  const subject = body?.subject?.trim()
  const ticketBody = body?.body?.trim()
  const category = VALID_CATEGORIES.has(body?.category ?? '') ? body!.category! : 'general'

  if (!subject || subject.length < 5) {
    throw createError({ statusCode: 400, statusMessage: 'Subject must be at least 5 characters.' })
  }
  if (!ticketBody || ticketBody.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Description must be at least 10 characters.' })
  }

  const userEmail = user?.email ?? body?.guestEmail?.trim().toLowerCase()
  const userName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : body?.guestName?.trim()

  if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email is required.' })
  }
  if (!userName) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required.' })
  }

  const db = getDb()
  const now = new Date().toISOString()
  const ticketId = makeId('tkt')

  db.prepare(`
    INSERT INTO support_tickets (id, user_id, user_email, user_name, subject, body, category, status, priority, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 'normal', ?, ?)
  `).run(ticketId, user?.id ?? null, userEmail, userName, subject.slice(0, 200), ticketBody.slice(0, 5000), category, now, now)

  // Notify support team
  sendEmail({
    to: ADMIN_EMAIL,
    replyTo: userEmail,
    subject: `[Support] ${subject} [${ticketId}]`,
    text: `New support ticket from ${userName} <${userEmail}>

Ticket ID: ${ticketId}
Category:  ${category}

${ticketBody}
`
  }).catch(err => console.error('[support] admin notification failed:', err))

  // Confirmation to submitter
  sendEmail({
    to: userEmail,
    subject: `Your support request [${ticketId}] has been received`,
    text: `Hi ${userName},

We've received your support request (reference: ${ticketId}).

Subject: ${subject}

Our team typically responds within 1 business day. We'll email you at ${userEmail}.

— The Moonmart Support Team
`
  }).catch(err => console.error('[support] confirmation email failed:', err))

  return { success: true, ticketId }
})
