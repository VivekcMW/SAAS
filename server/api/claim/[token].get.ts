/**
 * GET /api/claim/[token]
 * Validates a claim magic link token and returns the listing preview.
 */
import { validateClaimToken } from '~/server/utils/discovery/claimToken'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') ?? ''

  const result = validateClaimToken(token)

  if (!result.valid) {
    throw createError({
      statusCode: result.reason === 'expired' ? 410 : 404,
      statusMessage: result.reason === 'expired'
        ? 'This claim link has expired. Please contact us for a new one.'
        : result.reason === 'already_claimed'
          ? 'This listing has already been claimed.'
          : 'Invalid or not found claim link.'
    })
  }

  let extracted: Record<string, unknown> = {}
  try {
    extracted = JSON.parse(result.item!.extracted_data)
  }
  catch { /* use empty */ }

  return {
    valid: true,
    app: {
      name: extracted.name ?? '',
      tagline: extracted.tagline ?? '',
      short_description: extracted.short_description ?? '',
      category: extracted.category ?? '',
      pricing_type: extracted.pricing_type ?? 'contact',
      key_features: extracted.key_features ?? [],
      logo_url: extracted.logo_url ?? null,
      website_url: result.item!.website_url
    },
    queueItemId: result.item!.id
  }
})
