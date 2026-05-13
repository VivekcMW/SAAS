// Admin: read banner configuration
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
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
    updatedAt: config.updatedAt ?? null,
    updatedBy: config.updatedBy ?? null,
  }
})
