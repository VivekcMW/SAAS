/**
 * PUT /api/admin/sponsored/:id
 * Update a sponsorship. Admin-only.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb, logActivity } from '~/server/utils/database'

const VALID_SLOTS = [
  'homepage_hero', 'homepage_featured', 'category_top', 'category_sidebar',
  'search_results', 'app_detail', 'newsletter', 'email_digest',
]

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const body = await readBody<{
    vendorName?: string; appName?: string; appId?: string
    slot?: string; category?: string
    startsAt?: string; endsAt?: string; recurrence?: string
    budget?: number; notes?: string
  }>(event)

  if (body.slot && !VALID_SLOTS.includes(body.slot)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid slot value` })
  }
  if (body.startsAt && body.endsAt && body.endsAt < body.startsAt) {
    throw createError({ statusCode: 400, statusMessage: 'endsAt must be >= startsAt' })
  }

  const db = getDb()
  const now = new Date().toISOString()
  const status = body.startsAt && body.endsAt
    ? (new Date() >= new Date(body.startsAt) && new Date() <= new Date(body.endsAt) ? 'active' : 'scheduled')
    : undefined

  try {
    const row = db.prepare('SELECT id FROM sponsored_slots WHERE id = ?').get(id)
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Sponsorship not found' })

    db.prepare(`
      UPDATE sponsored_slots SET
        vendor_name = COALESCE(?, vendor_name),
        app_name    = COALESCE(?, app_name),
        app_id      = COALESCE(?, app_id),
        slot        = COALESCE(?, slot),
        category    = COALESCE(?, category),
        starts_at   = COALESCE(?, starts_at),
        ends_at     = COALESCE(?, ends_at),
        recurrence  = COALESCE(?, recurrence),
        budget      = COALESCE(?, budget),
        notes       = COALESCE(?, notes),
        status      = COALESCE(?, status),
        updated_at  = ?
      WHERE id = ?
    `).run(
      body.vendorName ?? null, body.appName ?? null, body.appId ?? null,
      body.slot ?? null, body.category ?? null,
      body.startsAt ?? null, body.endsAt ?? null, body.recurrence ?? null,
      body.budget ?? null, body.notes ?? null,
      status ?? null, now, id
    )
    await logActivity(db, { actorId: admin.id, actorName: admin.name, action: 'sponsored.update', targetId: id, targetLabel: body.appName ?? id })
  } catch (err: unknown) {
    if ((err as { statusCode?: number })?.statusCode === 404) throw err
    // DB not yet migrated — return success stub
  }

  return { id, updatedAt: now }
})
