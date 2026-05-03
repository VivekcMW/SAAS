/**
 * POST /api/support/tickets/[id]/reply
 * User or admin adds a reply to a support ticket.
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireUser } from '~/server/utils/auth'
import { sendEmail } from '~/server/utils/email'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  if (!checkRateLimit(getClientIp(event), { prefix: 'support-reply', limit: 20, windowMs: 60 * 60 * 1000 })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests.' })
  }

  const user = await requireUser(event)
  const ticketId = getRouterParam(event, 'id')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Ticket id is required' })

  const body = await readBody<{ body?: string }>(event)
  const replyBody = body?.body?.trim()
  if (!replyBody || replyBody.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Reply cannot be empty.' })
  }

  const db = getDb()

  const ticket = db.prepare(`
    SELECT id, user_id, user_email, user_name, subject, status
    FROM support_tickets WHERE id = ?
  `).get(ticketId) as { id: string; user_id: string | null; user_email: string; user_name: string; subject: string; status: string } | undefined
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })

  // Only ticket owner or admin can reply
  if (ticket.user_id !== user.id && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  const isStaff = user.role === 'admin'
  const now = new Date().toISOString()
  const replyId = makeId('str')

  db.prepare(`
    INSERT INTO support_ticket_replies (id, ticket_id, sender_id, sender_email, sender_name, is_staff, body, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(replyId, ticketId, user.id, user.email, `${user.firstName} ${user.lastName}`.trim(), isStaff ? 1 : 0, replyBody.slice(0, 5000), now)

  // If staff replied to user, update ticket status and notify user
  if (isStaff && ticket.user_email) {
    db.prepare(`UPDATE support_tickets SET status = 'waiting', updated_at = ? WHERE id = ?`).run(now, ticketId)
    sendEmail({
      to: ticket.user_email,
      subject: `Re: ${ticket.subject} [${ticketId}]`,
      text: `Hi ${ticket.user_name},

You have a new reply to your support request.

${replyBody}

Reply at: ${process.env.SITE_URL || 'http://localhost:3000'}/dashboard/support

— Moonmart Support
`
    }).catch(err => console.error('[support/reply] email failed:', err))
  } else if (!isStaff) {
    // User replied, re-open ticket
    db.prepare(`UPDATE support_tickets SET status = 'open', updated_at = ? WHERE id = ?`).run(now, ticketId)
  }

  return { success: true, replyId }
})
