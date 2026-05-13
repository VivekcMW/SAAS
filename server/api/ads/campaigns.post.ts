/**
 * POST /api/ads/campaigns
 *
 * Create or draft a new SEM campaign for an app.
 * Vendor-facing: creates a `draft` campaign stored in DB.
 * Admin can later approve → status `active` → external API call.
 *
 * Body: {
 *   appId: string
 *   platform?: 'google' | 'bing'          default: 'google'
 *   campaignType?: 'search' | 'dsa'       default: 'search'
 *   dailyBudget?: number                  default: 5 (USD)
 *   targetCpa?: number
 *   keywords?: string[]
 *   adHeadlines?: string[]               max 15 for RSA
 *   adDescriptions?: string[]            max 4 for RSA
 * }
 */
import { getDb, makeId } from '~/server/utils/database'
import { requireVendor } from '~/server/utils/auth'

interface CampaignBody {
  appId: string
  platform?: string
  campaignType?: string
  dailyBudget?: number
  targetCpa?: number
  keywords?: string[]
  adHeadlines?: string[]
  adDescriptions?: string[]
}

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const body = await readBody(event) as CampaignBody

  if (!body.appId) throw createError({ statusCode: 400, statusMessage: 'appId is required' })

  const db = getDb()

  // Verify the vendor owns this app
  const app = db.prepare(`SELECT id, name, slug FROM app_listings WHERE id = ? AND vendor_id = ?`).get(body.appId, user.id) as { id: string; name: string; slug: string } | undefined
  if (!app) throw createError({ statusCode: 403, statusMessage: 'App not found or not owned by this vendor' })

  // Auto-generate keywords if not provided
  const defaultKeywords = [
    app.name,
    `${app.name} alternatives`,
    `${app.name} pricing`,
    `${app.name} reviews`,
    `best ${app.name} alternative`,
  ]

  const id = makeId('sem')
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO sem_campaigns (
      id, app_id, vendor_id, platform, campaign_type, status,
      daily_budget, target_cpa,
      keywords_json, ad_headlines_json, ad_descriptions_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.appId,
    user.id,
    body.platform || 'google',
    body.campaignType || 'search',
    body.dailyBudget || 5,
    body.targetCpa || null,
    JSON.stringify(body.keywords?.length ? body.keywords : defaultKeywords),
    JSON.stringify(body.adHeadlines || []),
    JSON.stringify(body.adDescriptions || []),
    now,
    now
  )

  const campaign = db.prepare('SELECT * FROM sem_campaigns WHERE id = ?').get(id)
  return { campaign, message: 'Campaign draft created. Submit for review to activate.' }
})
