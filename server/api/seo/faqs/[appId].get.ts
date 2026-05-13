/**
 * GET /api/seo/faqs/[appId]
 * Returns stored AI-generated FAQs for an app, falling back to default FAQs.
 * Public endpoint — used by the app detail page to merge with computed FAQs.
 */
import { getStoredFaqs } from '~/server/utils/seoEngine'

export default defineEventHandler(async (event) => {
  const appId = getRouterParam(event, 'appId')
  if (!appId) throw createError({ statusCode: 400, statusMessage: 'appId required' })

  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=7200')

  const faqs = getStoredFaqs(appId)
  return { faqs }
})
