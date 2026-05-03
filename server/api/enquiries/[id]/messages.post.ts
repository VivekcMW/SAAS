import { getDb, makeId, logActivity } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  const db = getDb()
  const enquiryId = event.context.params?.id as string
  const body = await readBody(event) as { message: string }

  if (!body.message?.trim()) throw createError({ statusCode: 400, statusMessage: 'Message required' })

  const enquiry = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(enquiryId) as any
  if (!enquiry) throw createError({ statusCode: 404, statusMessage: 'Enquiry not found' })

  const vendorRow = user ? db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as { id: string } | undefined : undefined
  const isVendor = vendorRow?.id === enquiry.vendor_id
  const isBuyer = user?.id === enquiry.buyer_id || user?.email === enquiry.buyer_email

  if (!isVendor && !isBuyer) throw createError({ statusCode: 403, statusMessage: 'Access denied' })

  const senderEmail = user?.email || enquiry.buyer_email
  const msgId = makeId('emsg')
  db.prepare(`
    INSERT INTO enquiry_messages (id, enquiry_id, sender_id, sender_email, body, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(msgId, enquiryId, user?.id ?? null, senderEmail, body.message.trim())

  db.prepare(`UPDATE enquiries SET updated_at = datetime('now') WHERE id = ?`).run(enquiryId)

  if (user) logActivity({ actorId: user.id, actorEmail: user.email, action: 'enquiry.message_sent', entityType: 'enquiry', entityId: enquiryId })
  return { success: true, id: msgId }
})
