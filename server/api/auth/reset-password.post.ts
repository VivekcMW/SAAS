import { resetPasswordWithToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.token || typeof body.token !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Reset token is required' })
  }
  if (!body?.password || typeof body.password !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'New password is required' })
  }
  if (String(body.password).length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  const ok = await resetPasswordWithToken(body.token, body.password)

  if (!ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This reset link is invalid or has expired. Please request a new one.'
    })
  }

  return { success: true, message: 'Password updated successfully. You can now sign in.' }
})
