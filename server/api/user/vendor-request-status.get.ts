/**
 * GET /api/user/vendor-request-status
 * Returns the current user's vendor upgrade request status.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS vendor_role_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      website_url TEXT,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      admin_note TEXT,
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_vrr_user ON vendor_role_requests(user_id);
  `)

  const row = db.prepare(
    `SELECT status, admin_note, reviewed_at, created_at FROM vendor_role_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
  ).get(user.id) as { status: string; admin_note: string | null; reviewed_at: string | null; created_at: string } | undefined

  return {
    status: row?.status ?? null,
    adminNote: row?.admin_note ?? null,
    reviewedAt: row?.reviewed_at ?? null,
    createdAt: row?.created_at ?? null,
  }
})
