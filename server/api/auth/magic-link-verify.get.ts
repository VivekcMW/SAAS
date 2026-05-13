/**
 * GET /api/auth/magic-link-verify?token=...
 * Validates a magic-link token, starts a session, and redirects to the dashboard.
 */
import { createHash } from 'node:crypto'
import { getDb, logActivity } from '~/server/utils/database'
import { createSession } from '~/server/utils/auth'
import { logGeoEvent } from '~/server/utils/geoTracker'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawToken = query.token as string | undefined

  if (!rawToken || typeof rawToken !== 'string' || rawToken.length < 10) {
    return sendRedirect(event, '/login?error=invalid_magic_link')
  }

  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const db = getDb()

  // Ensure table exists (in case the verify request arrives before the request endpoint has run)
  db.exec(`
    CREATE TABLE IF NOT EXISTS magic_link_tokens (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_mlt_hash ON magic_link_tokens(token_hash);
  `)

  const tokenRow = db.prepare(`
    SELECT id, user_id, expires_at, used
    FROM magic_link_tokens
    WHERE token_hash = ?
  `).get(tokenHash) as { id: string; user_id: string; expires_at: string; used: number } | undefined

  if (!tokenRow) return sendRedirect(event, '/login?error=invalid_magic_link')
  if (tokenRow.used) return sendRedirect(event, '/login?error=magic_link_already_used')
  if (new Date(tokenRow.expires_at) < new Date()) return sendRedirect(event, '/login?error=magic_link_expired')

  // Mark as used
  db.prepare(`UPDATE magic_link_tokens SET used = 1 WHERE id = ?`).run(tokenRow.id)

  const user = db.prepare(`SELECT id, email FROM users WHERE id = ?`).get(tokenRow.user_id) as
    | { id: string; email: string }
    | undefined

  if (!user) return sendRedirect(event, '/login?error=user_not_found')

  await createSession(event, user.id)

  logActivity({
    actorId: user.id,
    actorEmail: user.email,
    action: 'magic_link_login',
    entityType: 'user',
    entityId: user.id,
  })
  logGeoEvent(event, { userId: user.id, eventType: 'magic_link_login' })

  return sendRedirect(event, '/dashboard')
})
