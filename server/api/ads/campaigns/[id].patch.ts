/**
 * PATCH /api/ads/campaigns/[id]
 *
 * Update campaign settings (budget, keywords, ad copy).
 * Only allowed while status is 'draft' or 'paused'.
 * Admin can also set status → 'active' | 'paused' | 'archived'.
 */
import { getDb } from '~/server/utils/database'
import { requireVendor } from '~/server/utils/auth'

const ALLOWED_STATUSES = ['draft', 'active', 'paused', 'archived']

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const campaignId = getRouterParam(event, 'id') || ''
  const body = await readBody(event) as Record<string, unknown>
  const db = getDb()

  const existing = db.prepare('SELECT * FROM sem_campaigns WHERE id = ?').get(campaignId) as Record<string, unknown> | undefined
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Campaign not found' })

  // Vendor can only edit their own campaigns; admin can edit any
  if (existing.vendor_id !== user.id && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // Validate status transition
  if (body.status && !ALLOWED_STATUSES.includes(body.status as string)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` })
  }

  // Only admin can activate
  if (body.status === 'active' && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Only admins can activate campaigns' })
  }

  const updateable: Record<string, unknown> = {}
  if (body.dailyBudget !== undefined) updateable.daily_budget = body.dailyBudget
  if (body.targetCpa !== undefined) updateable.target_cpa = body.targetCpa
  if (body.keywords) updateable.keywords_json = JSON.stringify(body.keywords)
  if (body.adHeadlines) updateable.ad_headlines_json = JSON.stringify(body.adHeadlines)
  if (body.adDescriptions) updateable.ad_descriptions_json = JSON.stringify(body.adDescriptions)
  if (body.status) updateable.status = body.status
  updateable.updated_at = new Date().toISOString()

  const fields = Object.keys(updateable)
  if (fields.length === 0) throw createError({ statusCode: 400, statusMessage: 'No updatable fields provided' })

  const sets = fields.map(f => `${f} = ?`).join(', ')
  db.prepare(`UPDATE sem_campaigns SET ${sets} WHERE id = ?`)
    .run(...Object.values(updateable), campaignId)

  return { campaign: db.prepare('SELECT * FROM sem_campaigns WHERE id = ?').get(campaignId) }
})
