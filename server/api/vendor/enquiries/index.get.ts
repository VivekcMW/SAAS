import { requireVendor } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()

  const vendorRow = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as { id: string } | undefined
  if (!vendorRow) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  const enquiries = db.prepare(`
    SELECT e.id, e.subject, e.buyer_email, e.buyer_name, e.status, e.created_at, e.updated_at,
           al.name as app_name,
           (SELECT body FROM enquiry_messages WHERE enquiry_id = e.id ORDER BY created_at DESC LIMIT 1) as last_message,
           (SELECT COUNT(*) FROM enquiry_messages WHERE enquiry_id = e.id) as message_count
    FROM enquiries e
    JOIN app_listings al ON al.id = e.app_id
    WHERE e.vendor_id = ?
    ORDER BY e.updated_at DESC
    LIMIT 50
  `).all(vendorRow.id) as any[]

  return { enquiries }
})
