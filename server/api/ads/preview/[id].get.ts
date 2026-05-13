/**
 * GET /api/ads/preview/[id]
 *
 * Returns a rendered preview of an ad campaign's copy.
 * Accessible to the campaign owner (vendor) or an admin.
 */
import { requireVendor } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

interface Campaign {
  id: string
  app_id: string
  vendor_id: string
  platform: string
  campaign_type: string
  status: string
  daily_budget: number
  keywords_json: string
  ad_headlines_json: string
  ad_descriptions_json: string
  app_name: string
  app_slug: string
}

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const id = getRouterParam(event, 'id') || ''

  const db = getDb()
  const campaign = db.prepare(`
    SELECT c.*, a.name AS app_name, a.slug AS app_slug
    FROM sem_campaigns c
    JOIN app_listings a ON a.id = c.app_id
    WHERE c.id = ?
  `).get(id) as Campaign | undefined

  if (!campaign) {
    throw createError({ statusCode: 404, statusMessage: 'Campaign not found' })
  }

  // Only the owning vendor or admin can preview
  if (campaign.vendor_id !== user.id && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  const keywords: string[] = JSON.parse(campaign.keywords_json || '[]')
  const headlines: string[] = JSON.parse(campaign.ad_headlines_json || '[]')
  const descriptions: string[] = JSON.parse(campaign.ad_descriptions_json || '[]')

  const BASE_URL = process.env.SITE_URL || 'https://moonmart.ai'
  const displayUrl = `${BASE_URL}/marketplace/app/${campaign.app_slug}`

  return {
    id: campaign.id,
    platform: campaign.platform,
    campaignType: campaign.campaign_type,
    status: campaign.status,
    appName: campaign.app_name,
    appSlug: campaign.app_slug,
    dailyBudget: campaign.daily_budget,
    preview: {
      headlines: headlines.slice(0, 3),
      descriptions: descriptions.slice(0, 2),
      displayUrl,
      keywords: keywords.slice(0, 10),
      // Rendered ad copy: pick first headline + first description for a sample
      adCopy: {
        headline: headlines[0] ?? campaign.app_name,
        description: descriptions[0] ?? '',
        displayUrl
      }
    }
  }
})
