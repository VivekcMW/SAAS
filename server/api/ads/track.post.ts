import { getDb } from '~/server/utils/database'

const VALID_TYPES = new Set(['impression', 'click'])
const VALID_PLACEMENTS = new Set(['alternatives', 'grid', 'sidebar', 'compare', 'banner', 'embed'])

/**
 * POST /api/ads/track
 * Body: { appId: string, placement: string, eventType: 'impression' | 'click' }
 *
 * Fire-and-forget endpoint — always returns 204. Validates the app exists and
 * is sponsored before recording, so client cannot inflate arbitrary app stats.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const appId = (body?.appId as string)?.trim() || ''
  const placement = (body?.placement as string)?.trim() || ''
  const eventType = (body?.eventType as string)?.trim() || ''

  // Validate inputs
  if (!appId || !VALID_TYPES.has(eventType) || !VALID_PLACEMENTS.has(placement)) {
    setResponseStatus(event, 204)
    return null
  }

  try {
    const db = getDb()

    // Confirm the app exists and is sponsored — prevents metric inflation
    const app = db.prepare(`SELECT id FROM app_listings WHERE (id = ? OR slug = ?) AND sponsored = 1`).get(appId, appId)
    if (!app) {
      setResponseStatus(event, 204)
      return null
    }

    const id = `adev_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
    db.prepare(`INSERT INTO ad_events (id, app_id, placement, event_type) VALUES (?, ?, ?, ?)`).run(id, appId, placement, eventType)
  } catch {
    // Silently absorb — tracking errors must never impact page loads
  }

  setResponseStatus(event, 204)
  return null
})
