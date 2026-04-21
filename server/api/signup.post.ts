import { createSession, createUser, getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body?.firstName || !body?.lastName || !body?.email || !body?.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'First name, last name, email, and password are required'
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
      role: 'vendor'
    })

    if (!user) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to create your account'
      })
    }

    createSession(event, user.id, true)

    return {
      success: true,
      message: 'Your account has been created successfully!',
      redirectTo: '/dashboard',
      user: getSessionUser(event)
    }
  } catch (error: any) {
    if (error?.statusCode) {
      throw error
    }

    console.error('Error processing signup:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'There was an error creating your account. Please try again.'
    })
  }
})
