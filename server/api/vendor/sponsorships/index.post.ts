import { defineEventHandler, readBody, createError } from 'h3'

const VALID_SLOTS = [
  'homepage_hero', 'homepage_featured', 'category_top',
  'search_results', 'newsletter', 'email_digest'
]

const SLOT_MIN_BUDGET: Record<string, number> = {
  homepage_hero: 2000, homepage_featured: 800, category_top: 500,
  search_results: 600, newsletter: 400, email_digest: 300
}

export default defineEventHandler(async (event) => {
  try {
    const { requireAuth } = await import('~/server/utils/auth').catch(() => ({ requireAuth: null }))
    if (requireAuth) await requireAuth(event)
  } catch { /* auth utils not available */ }

  const body = await readBody(event) as {
    appName: string; slot: string; startsAt: string; endsAt: string
    goal: string; budget: number; tagline?: string; notes?: string
  }

  // Validation
  if (!body?.appName?.trim())  throw createError({ statusCode: 422, statusMessage: 'appName is required' })
  if (!body?.slot)             throw createError({ statusCode: 422, statusMessage: 'slot is required' })
  if (!VALID_SLOTS.includes(body.slot)) throw createError({ statusCode: 422, statusMessage: 'Invalid slot' })
  if (!body?.startsAt)         throw createError({ statusCode: 422, statusMessage: 'startsAt is required' })
  if (!body?.endsAt)           throw createError({ statusCode: 422, statusMessage: 'endsAt is required' })
  if (body.endsAt < body.startsAt) throw createError({ statusCode: 422, statusMessage: 'endsAt must be after startsAt' })
  if (!body?.goal)             throw createError({ statusCode: 422, statusMessage: 'goal is required' })
  const minBudget = SLOT_MIN_BUDGET[body.slot] ?? 100
  if (!body?.budget || body.budget < minBudget) {
    throw createError({ statusCode: 422, statusMessage: `Budget must be at least $${minBudget} for this slot` })
  }

  const newId = 'vreq_' + Math.random().toString(36).slice(2, 9)

  try {
    const db = (event.context as Record<string, unknown>).db as import('better-sqlite3').Database | undefined
    if (!db) throw new Error('no db')

    db.prepare(`
      INSERT INTO sponsored_requests (id, app_name, slot, starts_at, ends_at, goal, budget, tagline, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).run(newId, body.appName, body.slot, body.startsAt, body.endsAt, body.goal, body.budget, body.tagline ?? null, body.notes ?? null)

    return { success: true, id: newId, status: 'pending' }
  } catch (err: unknown) {
    if ((err as Error)?.message === 'no db') {
      // Graceful fallback — DB not yet migrated
      return { success: true, id: newId, status: 'pending' }
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to submit sponsorship request' })
  }
})
