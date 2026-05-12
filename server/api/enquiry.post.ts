import { getDb, makeId } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Basic validation
  if (!body?.email || !body?.name) {
    throw createError({ statusCode: 400, statusMessage: 'Name and email are required' })
  }
  if (!body?.appId) {
    throw createError({ statusCode: 400, statusMessage: 'appId is required' })
  }

  const db = getDb()
  const now = new Date().toISOString()

  // Resolve vendor_id from the app listing
  const app = db.prepare('SELECT id, vendor_id FROM app_listings WHERE id = ?').get(body.appId) as { id: string; vendor_id: string } | undefined
  if (!app) {
    throw createError({ statusCode: 404, statusMessage: 'App not found' })
  }

  const enquiryId = makeId('enq')
  db.prepare(`
    INSERT INTO enquiries (id, app_id, vendor_id, buyer_id, buyer_email, buyer_name, subject, status, created_at, updated_at)
    VALUES (?, ?, ?, NULL, ?, ?, ?, 'open', ?, ?)
  `).run(
    enquiryId,
    body.appId,
    app.vendor_id,
    body.email,
    body.name,
    body.message ? body.message.slice(0, 200) : `Enquiry from ${body.name}`,
    now,
    now
  )

  return { success: true, enquiryId }
})
