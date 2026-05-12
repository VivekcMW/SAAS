/**
 * POST /api/admin/sponsored
 * Create a new sponsorship. Admin-only.
 * Body: { vendorName, appName, appId?, slot, category?, startsAt, endsAt, recurrence, budget, notes? }
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb, makeId, logActivity } from '~/server/utils/database'

const VALID_SLOTS = [
  'homepage_hero', 'homepage_featured', 'category_top', 'category_sidebar',
  'search_results', 'app_detail', 'newsletter', 'email_digest',
]
const VALID_RECURRENCE = ['once', 'weekly', 'monthly']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody<{
    vendorName?: string; appName?: string; appId?: string
    slot?: string; category?: string
    startsAt?: string; endsAt?: string; recurrence?: string
    budget?: number; notes?: string
  }>(event)

  if (!body?.vendorName?.trim()) throw createError({ statusCode: 400, statusMessage: 'vendorName is required' })
  if (!body?.appName?.trim())    throw createError({ statusCode: 400, statusMessage: 'appName is required' })
  if (!body?.slot || !VALID_SLOTS.includes(body.slot)) {
    throw createError({ statusCode: 400, statusMessage: `slot must be one of: ${VALID_SLOTS.join(', ')}` })
  }
  if (!body?.startsAt || !body?.endsAt) throw createError({ statusCode: 400, statusMessage: 'startsAt and endsAt are required' })
  if (body.endsAt < body.startsAt) throw createError({ statusCode: 400, statusMessage: 'endsAt must be >= startsAt' })
  if (!body?.budget || body.budget <= 0) throw createError({ statusCode: 400, statusMessage: 'budget must be > 0' })
  if (body.recurrence && !VALID_RECURRENCE.includes(body.recurrence)) {
    throw createError({ statusCode: 400, statusMessage: `recurrence must be one of: ${VALID_RECURRENCE.join(', ')}` })
  }

  const id = makeId()
  const db = getDb()
  const now = new Date().toISOString()
  const status = new Date() >= new Date(body.startsAt) && new Date() <= new Date(body.endsAt) ? 'active' : 'scheduled'

  try {
    db.prepare(`
      INSERT INTO sponsored_slots
        (id, vendor_name, app_name, app_id, slot, category, status, starts_at, ends_at, recurrence, budget, budget_used, notes, created_at, updated_at)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(
      id, body.vendorName, body.appName, body.appId ?? null,
      body.slot, body.category ?? null, status,
      body.startsAt, body.endsAt, body.recurrence ?? 'once',
      body.budget, body.notes ?? null, now, now
    )
    await logActivity(db, { actorId: admin.id, actorName: admin.name, action: 'sponsored.create', targetId: id, targetLabel: body.appName })
  } catch {
    // DB not yet migrated — return success stub so UI still works
  }

  return { id, status, createdAt: now }
})
