/**
 * PATCH /api/enquiries/[id]/status
 * Closes (or re-opens) an enquiry thread.
 * Body: { status: 'open' | 'closed' | 'awaiting-reply' }
 */
import { requireUser } from '~/server/utils/auth'
import { getDb, logActivity } from '~/server/utils/database'

const ALLOWED = ['open', 'awaiting-reply', 'closed'] as const

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()
  const enquiryId = event.context.params?.id as string
  const body = await readBody<{ status: string }>(event)

  if (!ALLOWED.includes(body.status as typeof ALLOWED[number])) {
    throw createError({ statusCode: 400, statusMessage: 'status must be open, awaiting-reply, or closed' })
  }

  const enquiry = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(enquiryId) as any
  if (!enquiry) throw createError({ statusCode: 404, statusMessage: 'Enquiry not found' })

  const isBuyer = user.id === enquiry.buyer_id || user.email === enquiry.buyer_email
  const vendorRow = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as { id: string } | undefined
  const isVendor = vendorRow?.id === enquiry.vendor_id

  if (!isBuyer && !isVendor) throw createError({ statusCode: 403, statusMessage: 'Access denied' })

  db.prepare(`UPDATE enquiries SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(body.status, enquiryId)

  logActivity({
    actorId: user.id,
    actorEmail: user.email,
    action: `enquiry.status_changed`,
    entityType: 'enquiry',
    entityId: enquiryId,
    meta: { status: body.status },
  })

  return { success: true }
})
