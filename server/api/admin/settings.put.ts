/**
 * PUT /api/admin/settings
 * Upserts one or more platform settings. Admin-only.
 *
 * Body: { [key: string]: unknown }
 * All values are JSON-serialised before storage.
 *
 * Allowed key pattern: letters, numbers, dots, underscores, dashes (max 128 chars).
 * Keys prefixed with "stripe_" or "smtp_" are not persisted here — use env vars instead.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

const KEY_RE = /^[a-z0-9._-]{1,128}$/i
const BLOCKED_PREFIXES = ['stripe_', 'smtp_', 'secret_', 'password']

export default defineEventHandler(async (event) => {
  const admin = requireUser(event)
  if (admin.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Body must be a JSON object of key → value pairs' })
  }

  const keys = Object.keys(body)
  if (keys.length === 0) throw createError({ statusCode: 400, statusMessage: 'No settings provided' })
  if (keys.length > 50) throw createError({ statusCode: 400, statusMessage: 'Maximum 50 settings per request' })

  for (const key of keys) {
    if (!KEY_RE.test(key)) throw createError({ statusCode: 400, statusMessage: `Invalid setting key: ${key}` })
    if (BLOCKED_PREFIXES.some(p => key.toLowerCase().startsWith(p))) {
      throw createError({ statusCode: 400, statusMessage: `Key "${key}" is reserved. Use environment variables for secrets.` })
    }
  }

  const db = getDb()
  const upsert = db.prepare(`
    INSERT INTO admin_settings (key, value, updated_by, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at
  `)

  const now = new Date().toISOString()
  const saved: string[] = []

  const upsertMany = db.transaction(() => {
    for (const [key, value] of Object.entries(body)) {
      upsert.run(key, JSON.stringify(value), admin.id, now)
      saved.push(key)
    }
  })
  upsertMany()

  return { success: true, saved }
})
