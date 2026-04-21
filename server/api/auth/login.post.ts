import { authenticateUser, createSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.email || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required'
    })
  }

  const user = authenticateUser(body.email, body.password)
  createSession(event, user.id, body.rememberMe !== false)

  return {
    success: true,
    user
  }
})
