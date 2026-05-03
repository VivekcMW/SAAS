/**
 * POST /api/user/privacy-opt-out
 * Records a user's privacy opt-out (e.g. triggered by GPC signal).
 * Works for both authenticated and anonymous visitors.
 */
import { getDb } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({})) as { signal?: string }
  const signal = (body?.signal || 'manual').slice(0, 50)

  const db = getDb()

  // Ensure privacy_opt_outs table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS privacy_opt_outs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      signal TEXT NOT NULL,
      ip TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_poo_user ON privacy_opt_outs(user_id);
  `)

  const user = await getSessionUser(event).catch(() => null)
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const id = `poo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  db.prepare(`
    INSERT INTO privacy_opt_outs (id, user_id, signal, ip, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, user?.id ?? null, signal, ip.slice(0, 64), new Date().toISOString())

  // Set a persistent opt-out cookie in the response too
  setCookie(event, 'privacy_opt_out', '1', {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'strict',
    httpOnly: false, // readable by client JS as well
  })

  return { ok: true }
})
