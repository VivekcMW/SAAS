/**
 * server/utils/apiKeyAuth.ts
 *
 * Shared helper for API v1 routes.
 * Extracts the API key from the Authorization header or `api_key` query param,
 * validates it against the api_keys table, enforces per-tier rate limits,
 * and returns the resolved key record.
 *
 * Rate limits:
 *   free       →  100 req / day
 *   developer  →  10,000 req / day
 *   business   →  unlimited
 */
import { createHash } from 'node:crypto'
import { getDb } from './database'

interface ApiKeyRecord {
  id: string
  user_id: string
  key_prefix: string
  name: string
  tier: string
  requests_today: number
  window_reset_at: string
  status: string
}

const DAILY_LIMITS: Record<string, number> = {
  free: 100,
  developer: 10_000,
  business: Infinity,
}

export function resolveApiKey(event: ReturnType<typeof useEvent>): ApiKeyRecord {
  // Extract raw key from Authorization header ("Bearer mm_...") or ?api_key=...
  const authHeader = getRequestHeader(event, 'authorization') || ''
  const queryParam = String(getQuery(event).api_key || '')
  const rawKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (queryParam || '')

  if (!rawKey) {
    throw createError({ statusCode: 401, statusMessage: 'API key required. Pass Authorization: Bearer <key> or ?api_key=<key>' })
  }

  const db = getDb()
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const row = db.prepare(`SELECT * FROM api_keys WHERE key_hash = ? AND status = 'active'`).get(keyHash) as ApiKeyRecord | undefined

  if (!row) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or revoked API key' })
  }

  // Rate-limit enforcement
  const limit = DAILY_LIMITS[row.tier] ?? 100
  if (limit !== Infinity) {
    const now = new Date()
    const resetAt = new Date(row.window_reset_at)

    // Reset window if expired (next calendar day UTC)
    if (now >= resetAt) {
      const tomorrow = new Date(now)
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      tomorrow.setUTCHours(0, 0, 0, 0)
      db.prepare(`UPDATE api_keys SET requests_today = 0, window_reset_at = ? WHERE id = ?`).run(tomorrow.toISOString(), row.id)
      row.requests_today = 0
    }

    if (row.requests_today >= limit) {
      throw createError({
        statusCode: 429,
        statusMessage: `Daily rate limit reached (${limit} req/day for ${row.tier} tier). Upgrade at moonmart.ai/developer`
      })
    }
  }

  // Increment counter + last_used_at
  db.prepare(`
    UPDATE api_keys
    SET requests_today = requests_today + 1, requests_total = requests_total + 1, last_used_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), row.id)

  return row
}
