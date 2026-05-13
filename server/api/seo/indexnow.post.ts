/**
 * POST /api/seo/indexnow
 *
 * Internal webhook: submit app URLs to IndexNow for instant indexing.
 * Called by app create/update/review endpoints.
 *
 * Body: { appId?: string; slugOrId?: string; urls?: string[] }
 *
 * This endpoint is internal — requires admin auth or a shared secret.
 */
import { indexNowApp, submitToIndexNow } from '~/server/utils/seoEngine'

const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET || ''

export default defineEventHandler(async (event) => {
  // Allow internal server-to-server calls with a shared secret header
  const authHeader = getHeader(event, 'x-internal-secret') || ''
  if (INTERNAL_SECRET && authHeader !== INTERNAL_SECRET) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody(event) as { slugOrId?: string; urls?: string[] }

  if (body.slugOrId) {
    await indexNowApp(body.slugOrId)
    return { ok: true, submitted: 'app', slugOrId: body.slugOrId }
  }

  if (body.urls?.length) {
    await submitToIndexNow(body.urls)
    return { ok: true, submitted: 'urls', count: body.urls.length }
  }

  throw createError({ statusCode: 400, statusMessage: 'Provide slugOrId or urls' })
})
