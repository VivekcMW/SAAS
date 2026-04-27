/**
 * PUT /api/admin/listings/[id]/status
 * Approve, reject, or archive a listing.
 */
import { getDb } from '~/server/utils/database'
import { requireAdmin } from '~/server/utils/auth'

const VALID_STATUSES = ['published', 'draft', 'submitted', 'archived']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const body = await readBody<{ status?: string; adminNote?: string; featured?: boolean }>(event)
  if (!body?.status || !VALID_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: `status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  const db = getDb()
  const existing = db.prepare('SELECT id FROM app_listings WHERE id = ?').get(id) as { id: string } | undefined
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Listing not found' })

  const now = new Date().toISOString()
  const updates: Record<string, unknown> = { status: body.status, updated_at: now }
  if (body.status === 'published') updates.published_at = now
  if (typeof body.featured === 'boolean') updates.featured = body.featured ? 1 : 0

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ')
  db.prepare(`UPDATE app_listings SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), id)

  return { success: true, status: body.status }
})
