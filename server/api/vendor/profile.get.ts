/**
 * GET /api/vendor/profile
 * Returns the authenticated vendor's profile.
 */
import { getDb } from '~/server/utils/database'
import { requireVendor } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()

  const profile = db.prepare('SELECT * FROM vendor_profiles WHERE user_id = ?').get(user.id) as Record<string, unknown> | undefined
  if (!profile) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  return {
    id: profile.id,
    userId: profile.user_id,
    companyName: profile.company_name,
    companySlug: profile.company_slug,
    websiteUrl: profile.website_url ?? null,
    logoUrl: profile.logo_url ?? null,
    tagline: profile.tagline ?? null,
    description: profile.description ?? null,
    foundedYear: profile.founded_year ?? null,
    companySize: profile.company_size ?? null,
    fundingStage: profile.funding_stage ?? null,
    fundingTotal: profile.funding_total ?? null,
    headquarters: profile.headquarters ?? null,
    socialLinks: (() => { try { return JSON.parse(String(profile.social_links ?? '{}')) } catch { return {} } })(),
    status: profile.status,
    verified: Boolean(profile.verified),
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  }
})
