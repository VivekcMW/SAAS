/**
 * GET /api/v1/keys
 * Returns all active API keys for the authenticated user (prefix only, never raw key).
 *
 * DELETE /api/v1/keys?id=<key_id>
 * Revokes (soft-deletes) an API key.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()
  const method = event.method

  if (method === 'GET') {
    const keys = db.prepare(`
      SELECT id, key_prefix, name, tier, requests_today, requests_total, last_used_at, status, created_at
      FROM api_keys
      WHERE user_id = ? AND status = 'active'
      ORDER BY created_at DESC
    `).all(user.id)

    return { keys }
  }

  if (method === 'DELETE') {
    const q = getQuery(event)
    const keyId = typeof q.id === 'string' ? q.id : null
    if (!keyId) throw createError({ statusCode: 400, statusMessage: 'id query param required' })

    const result = db.prepare(`UPDATE api_keys SET status = 'revoked' WHERE id = ? AND user_id = ?`).run(keyId, user.id)
    if (result.changes === 0) throw createError({ statusCode: 404, statusMessage: 'Key not found' })

    return { revoked: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
