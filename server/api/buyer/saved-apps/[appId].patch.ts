/**
 * PATCH /api/buyer/saved-apps/[appId]
 * Updates evaluation metadata (status, note) for a saved app.
 * Creates or updates the buyer_saved_app_metadata row.
 * Body: { status?: BuyerStatus, note?: string }
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

const VALID_STATUSES = new Set(['shortlisted', 'evaluating', 'demo-booked', 'decided', 'rejected'])

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const appId = getRouterParam(event, 'appId')

  if (!appId || !/^[a-zA-Z0-9_-]{1,128}$/.test(appId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid appId' })
  }

  const body = await readBody<{ status?: string; note?: string }>(event)

  if (body.status !== undefined && !VALID_STATUSES.has(body.status)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid status. Must be one of: ${[...VALID_STATUSES].join(', ')}` })
  }

  const db = getDb()
  const now = new Date().toISOString()

  // Check that the app is actually in the user's favorites
  const favorite = db.prepare('SELECT 1 FROM user_favorites WHERE user_id = ? AND app_id = ?').get(user.id, appId)
  if (!favorite) {
    throw createError({ statusCode: 404, statusMessage: 'App not found in your saved list' })
  }

  // Upsert metadata
  const existing = db.prepare('SELECT status, note FROM buyer_saved_app_metadata WHERE user_id = ? AND app_id = ?').get(user.id, appId) as { status: string; note: string } | undefined

  const newStatus = body.status ?? existing?.status ?? 'shortlisted'
  const newNote = body.note !== undefined ? body.note : (existing?.note ?? '')

  db.prepare(`
    INSERT INTO buyer_saved_app_metadata (user_id, app_id, status, note, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, app_id) DO UPDATE SET
      status = excluded.status,
      note = excluded.note,
      updated_at = excluded.updated_at
  `).run(user.id, appId, newStatus, newNote, now)

  return { success: true, appId, status: newStatus, note: newNote }
})
