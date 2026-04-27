import { createEmailVerificationToken, createSession, createUser, getSessionUser } from '~/server/utils/auth'
import { buildWelcomeEmail, sendEmail } from '~/server/utils/email'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  // 5 registrations per hour per IP
  if (!checkRateLimit(getClientIp(event), { limit: 5, windowMs: 60 * 60 * 1000, prefix: 'register' })) {
    throw createError({ statusCode: 429, statusMessage: 'Too many registration attempts. Please try again later.' })
  }

  const body = await readBody(event)

  if (!body?.firstName || !body?.lastName || !body?.email || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'First name, last name, email, and password are required'
    })
  }

  if (String(body.password).length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 8 characters long'
    })
  }

  const user = createUser({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    password: body.password,
    companyName: body.companyName,
    companySize: body.companySize,
    jobTitle: body.jobTitle,
    phoneNumber: body.phoneNumber,
    plan: body.planName || body.plan || 'Professional',
    role: body.role || 'vendor'
  })

  if (!user) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create user account'
    })
  }

  await createSession(event, user.id, true)

  // Send welcome + email verification (fire-and-forget)
  try {
    const rawToken = createEmailVerificationToken(user.id)
    const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${rawToken}`
    sendEmail(buildWelcomeEmail({
      to: user.email,
      firstName: user.first_name,
      role: user.role,
      verifyUrl
    })).catch(err => console.error('[register] welcome email failed:', err))
  } catch (err) {
    console.error('[register] failed to create verification token:', err)
  }

  return {
    success: true,
    user: await getSessionUser(event),
    redirectTo: '/dashboard'
  }
})
