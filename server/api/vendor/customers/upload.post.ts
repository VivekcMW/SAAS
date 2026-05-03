/**
 * POST /api/vendor/customers/upload
 *
 * Vendor uploads a customer list so that reviews from matching emails
 * are automatically tagged as "Verified Buyer".
 *
 * Body (JSON):
 *   { app_id: string, emails: string[] }
 *
 * Emails are hashed client-independently using SHA-256 server-side.
 * Raw emails are NEVER persisted.
 *
 * Rate-limited: 10 uploads/hour per vendor.
 * Maximum 10,000 emails per request.
 */
import { createHash } from 'node:crypto'
import { requireVendor } from '~/server/utils/auth'
import { getDb, makeId } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

const MAX_EMAILS_PER_REQUEST = 10_000

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  const rl = checkRateLimit(ip, { limit: 10, windowMs: 60 * 60 * 1000, prefix: 'vcl_upload' })
  if (!rl.allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many uploads. Try again in 1 hour.' })
  }

  const user = await requireVendor(event)
  const db = getDb()

  const profile = db.prepare(`SELECT id FROM vendor_profiles WHERE user_id = ?`).get(user.id) as { id: string } | undefined
  if (!profile) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  const body = await readBody(event)
  const { app_id, emails } = body || {}

  if (!app_id || typeof app_id !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'app_id is required' })
  }
  if (!Array.isArray(emails) || emails.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'emails must be a non-empty array' })
  }
  if (emails.length > MAX_EMAILS_PER_REQUEST) {
    throw createError({ statusCode: 400, statusMessage: `Maximum ${MAX_EMAILS_PER_REQUEST} emails per upload` })
  }

  // Verify vendor owns this app
  const app = db.prepare(`
    SELECT id FROM app_listings WHERE id = ? AND vendor_id = ?
  `).get(app_id, profile.id) as { id: string } | undefined
  if (!app) {
    throw createError({ statusCode: 403, statusMessage: 'App not found or does not belong to your account' })
  }

  const now = new Date().toISOString()
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO vendor_customer_lists (id, vendor_id, app_id, email_hash, created_at)
    VALUES (?, ?, ?, ?, ?)
  `)

  let added = 0
  let skipped = 0

  const insertMany = db.transaction((emailList: string[]) => {
    for (const raw of emailList) {
      if (typeof raw !== 'string') { skipped++; continue }
      const trimmed = raw.trim().toLowerCase()
      if (!trimmed || !trimmed.includes('@')) { skipped++; continue }
      // SHA-256 hash — never store raw email
      const hash = createHash('sha256').update(trimmed).digest('hex')
      const result = insertStmt.run(makeId('vcl'), profile.id, app_id, hash, now)
      if (result.changes > 0) { added++ } else { skipped++ }
    }
  })

  insertMany(emails)

  // Retroactively verify existing pending/approved reviews from matching emails.
  // SQLite has no SHA-256 built-in, so we hash in JS and match by hash.
  const existingHashes = (db.prepare(
    `SELECT email_hash FROM vendor_customer_lists WHERE app_id = ?`
  ).all(app_id) as Array<{ email_hash: string }>).map((r) => r.email_hash)

  const hashSet = new Set(existingHashes)

  const pendingReviews = db.prepare(`
    SELECT id, user_email
    FROM reviews
    WHERE app_id = ? AND purchase_verified = 0 AND user_email IS NOT NULL
  `).all(app_id) as Array<{ id: string; user_email: string }>

  let retroVerifiedCount = 0
  const retroUpdate = db.prepare(`
    UPDATE reviews
    SET purchase_verified = 1,
        verification_method = 'vendor_customer_list',
        verification_source = 'csv_upload',
        verified_at = ?
    WHERE id = ?
  `)

  const retroTx = db.transaction(() => {
    for (const row of pendingReviews) {
      const h = createHash('sha256').update(row.user_email.trim().toLowerCase()).digest('hex')
      if (hashSet.has(h)) {
        retroUpdate.run(now, row.id)
        retroVerifiedCount++
      }
    }
  })
  retroTx()

  return {
    added,
    skipped,
    total_in_list: (db.prepare(`SELECT COUNT(*) AS n FROM vendor_customer_lists WHERE app_id = ?`).get(app_id) as { n: number }).n,
    retro_verified: retroVerifiedCount
  }
})
