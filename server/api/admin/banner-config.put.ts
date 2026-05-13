// Admin: save banner configuration
import { requireAdmin } from '~/server/utils/auth'
import { getDb, logActivity } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody<{
    enabled?: boolean
    message?: string
    ctaLabel?: string
    ctaUrl?: string
    showOnHomepage?: boolean
    bgColor?: string
  }>(event)

  const db = getDb()
  const existing = db.prepare(`SELECT value FROM admin_settings WHERE key = 'banner_config'`).get() as { value: string } | undefined
  const prev = existing ? JSON.parse(existing.value) : {}

  const next = {
    enabled: typeof body.enabled === 'boolean' ? body.enabled : (prev.enabled ?? true),
    message: typeof body.message === 'string' ? body.message.trim() : (prev.message ?? ''),
    ctaLabel: typeof body.ctaLabel === 'string' ? body.ctaLabel.trim() : (prev.ctaLabel ?? 'Browse apps'),
    ctaUrl: typeof body.ctaUrl === 'string' ? body.ctaUrl.trim() : (prev.ctaUrl ?? '/marketplace'),
    showOnHomepage: typeof body.showOnHomepage === 'boolean' ? body.showOnHomepage : (prev.showOnHomepage ?? false),
    bgColor: typeof body.bgColor === 'string' ? body.bgColor.trim() : (prev.bgColor ?? '#131929'),
    updatedAt: new Date().toISOString(),
    updatedBy: user.email,
  }

  if (existing) {
    db.prepare(`UPDATE admin_settings SET value = ?, updated_by = ?, updated_at = ? WHERE key = 'banner_config'`)
      .run(JSON.stringify(next), user.email, next.updatedAt)
  } else {
    db.prepare(`INSERT INTO admin_settings (key, value, updated_by, updated_at) VALUES ('banner_config', ?, ?, ?)`)
      .run(JSON.stringify(next), user.email, next.updatedAt)
  }

  logActivity({ actorId: user.id, actorEmail: user.email, action: 'admin.banner_config_updated', entityType: 'admin_settings', entityId: 'banner_config' })

  return next
})
