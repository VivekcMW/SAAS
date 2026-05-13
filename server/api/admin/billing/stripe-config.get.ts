// Admin: get Stripe config (masks secret keys)
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

function maskKey(key: string | null | undefined): string {
  if (!key || key.length < 8) return key ?? ''
  return key.slice(0, 7) + '•'.repeat(Math.max(0, key.length - 11)) + key.slice(-4)
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDb()

  const row = db.prepare(`SELECT value FROM admin_settings WHERE key = 'stripe_config'`).get() as { value: string } | undefined
  const config = row ? JSON.parse(row.value) : {}

  return {
    publishableKey: config.publishableKey ?? process.env.STRIPE_PUBLISHABLE_KEY ?? '',
    secretKeyMasked: maskKey(config.secretKey ?? process.env.STRIPE_SECRET_KEY),
    webhookSecretMasked: maskKey(config.webhookSecret ?? process.env.STRIPE_WEBHOOK_SECRET),
    priceVendorGrowthMonthly: config.priceVendorGrowthMonthly ?? process.env.STRIPE_PRICE_VENDOR_GROWTH_MONTHLY ?? '',
    priceVendorGrowthAnnual: config.priceVendorGrowthAnnual ?? process.env.STRIPE_PRICE_VENDOR_GROWTH_ANNUAL ?? '',
    priceBuyerProMonthly: config.priceBuyerProMonthly ?? process.env.STRIPE_PRICE_BUYER_PRO_MONTHLY ?? '',
    priceBuyerProAnnual: config.priceBuyerProAnnual ?? process.env.STRIPE_PRICE_BUYER_PRO_ANNUAL ?? '',
    testMode: config.testMode ?? (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test_'),
    updatedAt: config.updatedAt ?? null
  }
})
