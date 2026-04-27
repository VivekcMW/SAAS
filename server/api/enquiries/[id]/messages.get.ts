import { getDb } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  const db = getDb()
  const enquiryId = event.context.params?.id as string

  const enquiry = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(enquiryId) as any
  if (!enquiry) throw createError({ statusCode: 404, statusMessage: 'Enquiry not found' })

  // Access control: buyer (by email) or vendor
  const vendorRow = user ? db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as { id: string } | undefined : undefined
  const isVendor = vendorRow?.id === enquiry.vendor_id
  const isBuyer = user?.id === enquiry.buyer_id || user?.email === enquiry.buyer_email

  if (!isVendor && !isBuyer) throw createError({ statusCode: 403, statusMessage: 'Access denied' })

  const messages = db.prepare(`
    SELECT id, sender_id, sender_email, body, created_at
    FROM enquiry_messages
    WHERE enquiry_id = ?
    ORDER BY created_at ASC
  `).all(enquiryId)

  return { enquiry, messages }
})
