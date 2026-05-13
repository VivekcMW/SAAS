// Admin: save Stripe config
import { requireAdmin } from '~/server/utils/auth'
import { getDb, logActivity } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const allowed = [
    'publishableKey', 'secretKey', 'webhookSecret',
    'priceVendorGrowthMonthly', 'priceVendorGrowthAnnual',
    'priceBuyerProMonthly', 'priceBuyerProAnnual', 'testMode'
  ]

  const db = getDb()
  const row = db.prepare(`SELECT value FROM admin_settings WHERE key = 'stripe_config'`).get() as { value: string } | undefined
  const existing = row ? JSON.parse(row.value) : {}

  // Only overwrite fields that were sent and are non-empty
  // Fields ending in 'Masked' are display-only and should never be saved
  for (const key of allowed) {
    if (key in body && body[key] !== undefined && body[key] !== '') {
      // Reject masked placeholders (contain bullet characters)
      if (typeof body[key] === 'string' && body[key].includes('•')) continue
      existing[key] = body[key]
    }
  }

  const now = new Date().toISOString()
  existing.updatedAt = now

  db.prepare(`
    INSERT INTO admin_settings (key, value, updated_by, updated_at) VALUES ('stripe_config', ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at
  `).run(JSON.stringify(existing), (admin as any).email, now)

  logActivity({
    actorId: (admin as any).id,
    actorEmail: (admin as any).email,
    action: 'admin.stripe_config.updated',
    entityType: 'admin_settings',
    entityId: 'stripe_config'
  })

  return { success: true, updatedAt: now }
})
