/**
 * POST /api/buyer/intent-event
 * Records a buyer intent signal — used by the vendor intent dashboard.
 * Also fires for anonymous sessions (session_id via cookie).
 * High-intent events (demo_request, pricing_view) email the vendor.
 */
import { getDb, makeId } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { buildNewLeadAlertEmail, sendEmail } from '~/server/utils/email'

const VALID_EVENT_TYPES = [
  'view', 'compare', 'pricing_view', 'bookmark', 'demo_request', 'copilot_mention'
] as const

type EventType = typeof VALID_EVENT_TYPES[number]

function computeSignalStrength(eventType: EventType, metadata: Record<string, unknown>): 'warm' | 'hot' | 'purchase_proximate' {
  if (eventType === 'demo_request') return 'purchase_proximate'
  if (eventType === 'compare' || eventType === 'pricing_view') {
    const timeSpent = Number(metadata.timeSpentSeconds ?? 0)
    return timeSpent > 120 ? 'hot' : 'warm'
  }
  return 'warm'
}

export default defineEventHandler(async (event) => {
  // Fire-and-forget style — rate limit loosely
  if (!checkRateLimit(getClientIp(event), { limit: 200, windowMs: 60 * 60 * 1000, prefix: 'intent' })) {
    return { success: true } // silently drop, don't block UX
  }

  const user = await getSessionUser(event)
  const body = await readBody<{
    appId?: string
    eventType?: string
    metadata?: Record<string, unknown>
    sessionId?: string
  }>(event)

  const appId = body?.appId
  const eventType = body?.eventType as EventType | undefined

  if (!appId || !eventType) return { success: true }
  if (!VALID_EVENT_TYPES.includes(eventType)) return { success: true }

  const db = getDb()

  // Get vendor_id from the app
  const app = db.prepare(`
    SELECT al.id, al.vendor_id FROM app_listings al WHERE al.id = ? AND al.status = 'published'
  `).get(appId) as { id: string; vendor_id: string } | undefined

  if (!app) return { success: true }

  const metadata = body?.metadata ?? {}
  const signalStrength = computeSignalStrength(eventType, metadata)
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO buyer_intent_events
      (id, app_id, vendor_id, user_id, session_id, event_type, signal_strength,
       metadata, user_company, user_role, user_location, notified_vendor, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    makeId('int'),
    appId,
    app.vendor_id,
    user?.id ?? null,
    body?.sessionId ?? null,
    eventType,
    signalStrength,
    JSON.stringify(metadata),
    user?.companyName ?? null,
    user?.jobTitle ?? null,
    null, // location enrichment future phase
    now
  )

  // Notify vendor for high-intent signals (demo_request, pricing_view)
  if (signalStrength === 'purchase_proximate' || (signalStrength === 'hot' && eventType === 'pricing_view')) {
    try {
      const vendorRow = db.prepare(`
        SELECT u.email, u.first_name, a.name AS app_name
        FROM vendor_profiles vp
        JOIN users u ON u.id = vp.user_id
        JOIN app_listings a ON a.vendor_id = vp.id AND a.id = ?
        WHERE vp.id = ?
        LIMIT 1
      `).get(appId, app.vendor_id) as { email: string; first_name: string; app_name: string } | undefined

      if (vendorRow) {
        const eventLabel = eventType === 'demo_request' ? 'a demo request' : 'a pricing page visit'
        sendEmail(buildNewLeadAlertEmail({
          to: vendorRow.email,
          vendorName: vendorRow.first_name || 'there',
          appName: vendorRow.app_name,
          eventType,
          companyName: user?.companyName ?? undefined,
          jobTitle: user?.jobTitle ?? undefined
        })).catch(err => console.error('[intent-event] vendor notify email failed:', err))
        void eventLabel // suppress unused warning
        db.prepare('UPDATE buyer_intent_events SET notified_vendor = 1 WHERE app_id = ? AND created_at = ?').run(appId, now)
      }
    } catch (err) {
      console.error('[intent-event] vendor notify failed:', err)
    }
  }

  return { success: true }
})
