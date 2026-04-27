import { getDb, makeId } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const db = getDb()
  const user = await getSessionUser(event)
  const body = await readBody(event) as { appId: string; subject: string; message: string; buyerEmail?: string; buyerName?: string }

  if (!body.appId || !body.subject || !body.message) {
    throw createError({ statusCode: 400, statusMessage: 'appId, subject, and message are required' })
  }

  const app = db.prepare('SELECT id, vendor_id FROM app_listings WHERE id = ?').get(body.appId) as { id: string; vendor_id: string } | undefined
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

  return { success: true, enquiryId }
})
