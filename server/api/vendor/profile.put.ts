/**
 * PUT /api/vendor/profile
 * Update the authenticated vendor's profile.
 */
import { getDb, logActivity } from '~/server/utils/database'
import { requireVendor } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()

  const profile = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as
    | { id: string } | undefined
  if (!profile) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  const body = await readBody<{
    companyName?: string; websiteUrl?: string; logoUrl?: string; tagline?: string
    description?: string; foundedYear?: number; companySize?: string; fundingStage?: string
    fundingTotal?: number; headquarters?: string; socialLinks?: Record<string, string>
  }>(event)

  const _allowed = [
    'company_name', 'website_url', 'logo_url', 'tagline', 'description',
    'founded_year', 'company_size', 'funding_stage', 'funding_total', 'headquarters', 'social_links'
  ]

  const updates: Record<string, unknown> = {}
  if (body.companyName?.trim()) updates.company_name = body.companyName.trim().slice(0, 100)
  if (body.websiteUrl?.trim()) updates.website_url = body.websiteUrl.trim().slice(0, 255)
  if (typeof body.logoUrl === 'string') updates.logo_url = body.logoUrl.trim().slice(0, 500)
  if (typeof body.tagline === 'string') updates.tagline = body.tagline.trim().slice(0, 200)
  if (typeof body.description === 'string') updates.description = body.description.trim().slice(0, 2000)
  if (typeof body.foundedYear === 'number') updates.founded_year = body.foundedYear
  if (body.companySize) updates.company_size = body.companySize
  if (body.fundingStage) updates.funding_stage = body.fundingStage
  if (typeof body.fundingTotal === 'number') updates.funding_total = body.fundingTotal
  if (typeof body.headquarters === 'string') updates.headquarters = body.headquarters.trim().slice(0, 100)
  if (body.socialLinks && typeof body.socialLinks === 'object') {
    updates.social_links = JSON.stringify(body.socialLinks)
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  updates.updated_at = new Date().toISOString()

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ')
  db.prepare(`UPDATE vendor_profiles SET ${setClauses} WHERE id = ?`).run(
    ...Object.values(updates), profile.id
  )

  logActivity({ actorId: user.id, actorEmail: user.email, action: 'vendor.profile_updated', entityType: 'vendor_profile', entityId: profile.id as string })
  return { success: true }
})
