import { authenticateUser, createSession } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

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
  await createSession(event, user.id, body.rememberMe !== false)

  return {
    success: true,
    user
  }
})
