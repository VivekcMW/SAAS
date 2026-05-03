/**
 * POST /api/v1/keys
 *
 * Generate a new API key for the authenticated user.
 * Body: { name: string, tier?: 'free' | 'developer' | 'business' }
 *
 * - 'free' keys are available to all logged-in users.
 * - 'developer' and 'business' keys require an active paid plan.
 *
 * Returns: { key, prefix, tier, created_at }
 * The raw key is ONLY returned once — it cannot be retrieved again.
 */
import { randomBytes, createHash } from 'node:crypto'
import { requireUser } from '~/server/utils/auth'
import { getDb, makeId } from '~/server/utils/database'

const PLAN_TIER_GATE: Record<string, string[]> = {
  developer: ['Starter', 'Professional', 'Enterprise'],
  business:  ['Professional', 'Enterprise'],
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const body = await readBody(event)
  const name = (body?.name || '').trim()
  const tier = (body?.tier || 'free').toLowerCase()

  if (!name) throw createError({ statusCode: 400, statusMessage: 'name is required' })
  if (!['free', 'developer', 'business'].includes(tier)) {
    throw createError({ statusCode: 400, statusMessage: "tier must be 'free', 'developer', or 'business'" })
  }

  // Plan gate for paid tiers
  if (tier !== 'free') {
    const requiredPlans = PLAN_TIER_GATE[tier] || []
    if (!requiredPlans.includes(user.plan)) {
      throw createError({
        statusCode: 403,
        statusMessage: `The '${tier}' API tier requires a ${requiredPlans[0]}+ plan. Upgrade at moonmart.ai/pricing`
      })
    }
  }

  // Per-user key limit (max 10 active keys)
  const keyCount = db.prepare(`SELECT COUNT(*) AS n FROM api_keys WHERE user_id = ? AND status = 'active'`).get(user.id) as { n: number }
  if (keyCount.n >= 10) {
    throw createError({ statusCode: 409, statusMessage: 'Maximum of 10 active API keys reached. Revoke unused keys first.' })
  }

  // Generate a secure random key  — format: mm_<prefix><random>
  const rawRandom  = randomBytes(32).toString('base64url')
  const rawKey     = `mm_${rawRandom}`
  const keyHash    = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix  = rawKey.slice(0, 8)  // "mm_xxxxx" — safe to display

  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)

  const id = makeId('apk')
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name, tier, requests_today, requests_total, window_reset_at, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 'active', ?)
  `).run(id, user.id, keyHash, keyPrefix, name, tier, tomorrow.toISOString(), now)

  return {
    id,
    key: rawKey,          // shown ONCE — not stored in plaintext
    prefix: keyPrefix,
    name,
    tier,
    created_at: now,
    note: 'Store this key securely. It will not be shown again.',
  }
})
