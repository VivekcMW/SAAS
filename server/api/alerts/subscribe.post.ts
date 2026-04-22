interface Body {
  appId?: string
  email?: string
  threshold?: 'any' | 'increase' | 'decrease'
}

// In-memory store; replace with persistent storage in production.
// eslint-disable-next-line sonarjs/no-unused-collection
const subscriptions = new Map<string, Body & { createdAt: string }>()

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)

  if (!body?.appId || !body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'appId and email are required' })
  }

  if (!/.+@.+\..+/.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid email' })
  }

  const key = `${body.appId}:${body.email.toLowerCase()}`
  const record = {
    appId: body.appId,
    email: body.email.toLowerCase(),
    threshold: body.threshold || 'any',
    createdAt: new Date().toISOString()
  }
  subscriptions.set(key, record)

  return {
    ok: true,
    message: `Subscribed ${record.email} to price alerts for ${record.appId}.`,
    subscription: record,
    totalSubscriptions: subscriptions.size
  }
})
