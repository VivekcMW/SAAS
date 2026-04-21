import { createSession, createUser, getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
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

  createSession(event, user.id, true)

  return {
    success: true,
    user: getSessionUser(event),
    redirectTo: '/dashboard'
  }
})
