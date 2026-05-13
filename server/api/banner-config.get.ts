// Public: read banner configuration (no auth required — displayed to all visitors)
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async () => {
  const db = getDb()
  const row = db.prepare(`SELECT value FROM admin_settings WHERE key = 'banner_config'`).get() as { value: string } | undefined
  const config = row ? JSON.parse(row.value) : {}
  return {
    enabled: config.enabled ?? true,
    message: config.message ?? 'Welcome to Moonmart — Global SaaS Marketplace with localised pricing in {currency}',
    ctaLabel: config.ctaLabel ?? 'Browse apps',
    ctaUrl: config.ctaUrl ?? '/marketplace',
    showOnHomepage: config.showOnHomepage ?? false,
    bgColor: config.bgColor ?? '#131929',
  }
})
