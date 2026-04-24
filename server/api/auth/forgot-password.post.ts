import { createPasswordResetToken, findUserByEmail } from '~/server/utils/auth'
import { buildPasswordResetEmail, sendEmail } from '~/server/utils/email'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  // 5 attempts per hour per IP
  if (!checkRateLimit(getClientIp(event), { limit: 5, windowMs: 60 * 60 * 1000, prefix: 'forgot' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }

  const body = await readBody(event)

  if (!body?.email || typeof body.email !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  const email = body.email.trim().toLowerCase()
  const rawToken = createPasswordResetToken(email)

  // Always return 200 — do not reveal whether the email exists
  if (rawToken) {
    const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`
    const user = findUserByEmail(email)
    if (user) {
      sendEmail(buildPasswordResetEmail({
        to: user.email,
        firstName: user.first_name,
        resetUrl
      })).catch(err => console.error('[forgot-password] email send failed:', err))
    }
  }

  return { success: true, message: 'If an account exists for that email, a reset link has been sent.' }
})
