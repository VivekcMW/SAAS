import { authenticateUser, createEmailVerificationToken, createSession } from '~/server/utils/auth'
import { buildWelcomeEmail, sendEmail } from '~/server/utils/email'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  // 10 attempts per 15 minutes per IP
  if (!checkRateLimit(getClientIp(event), { limit: 10, windowMs: 15 * 60 * 1000, prefix: 'login' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many login attempts. Please try again in 15 minutes.' })
  }

  const body = await readBody(event)

  if (!body?.email || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required'
    })
  }

  const user = authenticateUser(body.email, body.password)

  // Gate: email must be verified before login is allowed
  const db = getDb()
  const dbUser = db.prepare('SELECT email_verified FROM users WHERE id = ?').get(user.id) as { email_verified: number } | undefined
  if (dbUser && !dbUser.email_verified) {
    // Re-send a fresh verification email so the user isn't stuck
    try {
      const rawToken = createEmailVerificationToken(user.id)
      const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
      const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${rawToken}`
      sendEmail(buildWelcomeEmail({
        to: user.email,
        firstName: user.firstName,
        role: user.role as 'buyer' | 'vendor' | 'admin',
        verifyUrl
      })).catch(err => console.error('[login] resend verification email failed:', err))
    } catch (err) {
      console.error('[login] failed to resend verification:', err)
    }

    throw createError({
      statusCode: 403,
      statusMessage: 'Please verify your email address before logging in. A new verification link has been sent to your inbox.'
    })
  }

  await createSession(event, user.id, body.rememberMe !== false)

  return {
    success: true,
    user
  }
})
