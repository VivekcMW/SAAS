/**
 * POST /api/admin/discovery/outreach
 * Send a claim email to a discovered app's founder.
 *
 * Body: { queue_item_id: string, email: string, name?: string }
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'
import { sendClaimOutreach } from '~/server/utils/discovery/outreach'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{ queue_item_id: string; email: string; name?: string }>(event)

  if (!body?.queue_item_id || !body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'queue_item_id and email are required' })
  }

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRx.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' })
  }

  const db = getDb()
  const item = db.prepare(
    `SELECT id, extracted_data, status FROM discovery_queue WHERE id = ?`
  ).get(body.queue_item_id) as {
    id: string; extracted_data: string; status: string
  } | undefined

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Queue item not found' })
  }

  if (!['approved', 'auto_approved', 'needs_review'].includes(item.status)) {
    throw createError({ statusCode: 409, statusMessage: `Cannot outreach item with status "${item.status}"` })
  }

  let appName = 'Your Product'
  try {
    const extracted = JSON.parse(item.extracted_data)
    appName = extracted.name || appName
  }
  catch { /* use default */ }

  const result = await sendClaimOutreach(
    item.id,
    body.email,
    appName,
    body.name ?? null
  )

  return result
})
