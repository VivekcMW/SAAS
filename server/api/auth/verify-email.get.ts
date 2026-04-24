import { verifyEmailToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string | undefined

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Verification token is required' })
  }

  const ok = verifyEmailToken(token)

  if (!ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This verification link is invalid or has expired. Please request a new one.'
    })
  }

  // Redirect to login with success flag
  return sendRedirect(event, '/login?verified=1', 302)
})
