import { getDb, makeId, logActivity } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { buildEnquiryNotificationEmail, sendEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  const db = getDb()
  const user = await getSessionUser(event)
  const body = await readBody(event) as { appId: string; subject: string; message: string; buyerEmail?: string; buyerName?: string }

  if (!body.appId || !body.subject || !body.message) {
    throw createError({ statusCode: 400, statusMessage: 'appId, subject, and message are required' })
  }

  const app = db.prepare('SELECT id, name, vendor_id FROM app_listings WHERE id = ?').get(body.appId) as { id: string; name: string; vendor_id: string } | undefined
  if (!app) throw createError({ statusCode: 404, statusMessage: 'App not found' })

  const buyerEmail = user?.email || body.buyerEmail
  const buyerName = user ? `${user.firstName} ${user.lastName}`.trim() : (body.buyerName || buyerEmail || 'Anonymous')
  if (!buyerEmail) throw createError({ statusCode: 400, statusMessage: 'Buyer email required for unauthenticated enquiries' })

  const enquiryId = makeId('enq')
  db.prepare(`
    INSERT INTO enquiries (id, app_id, vendor_id, buyer_id, buyer_email, buyer_name, subject, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'open', datetime('now'), datetime('now'))
  `).run(enquiryId, body.appId, app.vendor_id, user?.id ?? null, buyerEmail, buyerName, body.subject)

  const msgId = makeId('emsg')
  db.prepare(`
    INSERT INTO enquiry_messages (id, enquiry_id, sender_id, sender_email, body, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(msgId, enquiryId, user?.id ?? null, buyerEmail, body.message)

  // Notify the vendor by email
  const vendorUser = db.prepare(`
    SELECT u.email, u.first_name FROM users u
    INNER JOIN vendor_profiles vp ON vp.user_id = u.id
    WHERE vp.id = ?
  `).get(app.vendor_id) as { email: string; first_name: string } | undefined

  if (vendorUser?.email) {
    sendEmail(buildEnquiryNotificationEmail({
      to: vendorUser.email,
      vendorName: vendorUser.first_name || 'there',
      appName: app.name,
      buyerName,
      buyerEmail,
      message: body.message
    })).catch(err => console.error('[enquiries] vendor notification failed:', err))
  }

  logActivity({ actorId: user?.id ?? null, actorEmail: buyerEmail, action: 'enquiry.created', entityType: 'enquiry', entityId: enquiryId, meta: { appId: body.appId } })

  return { success: true, enquiryId }
})
