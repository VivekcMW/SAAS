export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Basic validation
  if (!body?.email || !body?.name) {
    throw createError({ statusCode: 400, statusMessage: 'Name and email are required' })
  }

  // Phase 2: send via email provider / store in DB
  // For now, log and return success
  console.log('[enquiry]', {
    appId: body.appId,
    appName: body.appName,
    type: body.type,
    name: body.name,
    email: body.email,
    company: body.company,
    teamSize: body.teamSize,
    message: body.message,
    ts: new Date().toISOString()
  })

  return { success: true }
})
