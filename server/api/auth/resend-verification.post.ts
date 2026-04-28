/**
 * POST /api/auth/resend-verification
 * Resends the email verification link to the authenticated (but unverified) user.
 * Also accepts { email } for unauthenticated callers (e.g. login error page).
 */
import { createEmailVerificationToken, findUserByEmail, getSessionUser } from '~/server/utils/auth'
import { buildWelcomeEmail, sendEmail } from '~/server/utils/email'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  // 3 attempts per hour per IP to prevent abuse
  if (!checkRateLimit(getClientIp(event), { limit: 3, windowMs: 60 * 60 * 1000, prefix: 'resend-verify' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }

  const sessionUser = await getSessionUser(event)
  const body = await readBody(event).catch(() => ({})) as { email?: string }

  const email = (sessionUser?.email || body?.email || '').trim().toLowerCase()
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  // Always return 200 to avoid email enumeration
  const user = findUserByEmail(email)
  if (user) {
    const db = getDb()
    const row = db.prepare('SELECT email_verified FROM users WHERE id = ?').get(user.id) as { email_verified: number }
    if (!row.email_verified) {
      try {
        const rawToken = createEmailVerificationToken(user.id)
        const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
        const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${rawToken}`
        await sendEmail(buildWelcomeEmail({
          to: user.email,
          firstName: user.first_name,
          role: user.role as 'buyer' | 'vendor' | 'admin',
          verifyUrl
        }))
      } catch (err) {
        console.error('[resend-verification] failed:', err)
      }
    }
  }

  return { success: true, message: 'If your account exists and is unverified, a new link has been sent.' }
})
