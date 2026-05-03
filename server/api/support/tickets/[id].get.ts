/**
 * GET /api/support/tickets/[id]
 * Returns a single ticket with replies. User can only view their own tickets.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin, requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const ticketId = getRouterParam(event, 'id')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Ticket id is required' })

  const db = getDb()

  const ticket = db.prepare(`
    SELECT id, user_id, user_email, subject, body, category, status, priority, created_at, updated_at
    FROM support_tickets WHERE id = ?
  `).get(ticketId) as { id: string; user_id: string | null; user_email: string } & Record<string, unknown> | undefined
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })

  // Only ticket owner or admin can view
  if (ticket.user_id !== user.id && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  const replies = db.prepare(`
    SELECT id, sender_name, is_staff, body, created_at
    FROM support_ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC
  `).all(ticketId)

  return { ticket, replies }
})
