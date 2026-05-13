/**
 * POST /api/auth/magic-link
 * Generates a single-use magic-link token and emails it to the user.
 * Creates an account (buyer, free plan) if no user exists with that email.
 */
import { randomBytes, createHash } from 'node:crypto'
import { getDb, makeId } from '~/server/utils/database'
import { findUserByEmail } from '~/server/utils/auth'
import { sendEmail } from '~/server/utils/email'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

const TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutes

function ensureMagicLinkTable(db: ReturnType<typeof getDb>) {
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
}

export default defineEventHandler(async (event) => {
  // 5 requests per 15 minutes per IP (prevents email bombing)
  if (!checkRateLimit(getClientIp(event), { limit: 5, windowMs: 15 * 60 * 1000, prefix: 'magic-link-req' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please wait before trying again.' })
  }

  const body = await readBody(event)
  const email = (body?.email as string | undefined)?.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid email address is required.' })
  }

  const db = getDb()
  ensureMagicLinkTable(db)

  // Find or create user
  let user = findUserByEmail(email)
  if (!user) {
    const userId = makeId('user')
    const now = new Date().toISOString()
    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, full_name,
        role, plan, email_verified, created_at, updated_at)
      VALUES (?, ?, '', 'User', '', 'User', 'buyer', 'free', 1, ?, ?)
    `).run(userId, email, now, now)
    user = findUserByEmail(email)
  }

  if (!user) throw createError({ statusCode: 500, statusMessage: 'Could not create user.' })

  // Invalidate any previous unused tokens for this user
  db.prepare(`UPDATE magic_link_tokens SET used = 1 WHERE user_id = ? AND used = 0`).run(user.id)

  // Generate token
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const tokenId = makeId('mlt')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString()

  db.prepare(`
    INSERT INTO magic_link_tokens (id, user_id, token_hash, expires_at, used, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(tokenId, user.id, tokenHash, expiresAt, new Date().toISOString())

  const config = useRuntimeConfig(event)
  const baseUrl = (config.public?.siteUrl as string | undefined) || process.env.SITE_URL || 'http://localhost:3000'
  const magicUrl = `${baseUrl}/api/auth/magic-link-verify?token=${rawToken}`

  await sendEmail({
    to: email,
    subject: 'Your Moonmart sign-in link',
    text: `Hi,\n\nClick the link below to sign in to Moonmart. This link expires in 15 minutes and can only be used once.\n\n${magicUrl}\n\nIf you did not request this, you can safely ignore this email.\n\n— The Moonmart Team`,
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#07090F;color:#e8eaf6;padding:40px 20px;margin:0">
<div style="max-width:480px;margin:0 auto;background:#10141e;border-radius:12px;padding:40px;border:1px solid rgba(255,255,255,0.08)">
  <div style="text-align:center;margin-bottom:32px">
    <span style="font-size:1.5rem;font-weight:700;color:#FFC850">Moonmart</span>
  </div>
  <h2 style="margin:0 0 8px;color:#fff;font-size:1.25rem">Sign in to Moonmart</h2>
  <p style="color:rgba(255,255,255,0.6);margin:0 0 28px;line-height:1.6">Click the button below to sign in. This link expires in <strong style="color:#fff">15 minutes</strong> and can only be used once.</p>
  <a href="${magicUrl}" style="display:block;text-align:center;background:#FFC850;color:#0A0700;font-weight:700;font-size:0.9rem;padding:14px 24px;border-radius:8px;text-decoration:none">Sign in to Moonmart →</a>
  <p style="color:rgba(255,255,255,0.3);font-size:0.75rem;margin:24px 0 0;text-align:center">If you didn't request this, you can safely ignore this email.</p>
</div>
</body></html>`,
  })

  // Always return success to avoid email enumeration
  return { success: true, message: 'Check your email for a sign-in link.' }
})
