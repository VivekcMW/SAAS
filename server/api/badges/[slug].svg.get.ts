import { getMarketplaceAppByIdOrSlug } from '../../../utils/apps'
import { computeMoonmartScore } from '../../../utils/moonmartScore'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug as string
  const app = getMarketplaceAppByIdOrSlug(slug)

  if (!app) {
    setResponseStatus(event, 404)
    setResponseHeader(event, 'Content-Type', 'text/plain')
    return 'Not found'
  }

  const score = computeMoonmartScore({
    reviewCount: app.reviewCount,
    rating: app.rating,
    integrationCount: (app.integrations || []).length,
    pricingType: app.pricing.type as 'free' | 'paid' | 'contact' | 'trial',
    hasSecurityBadge: false
  })

  const label = score >= 9 ? 'Outstanding' : score >= 8 ? 'Excellent' : score >= 7 ? 'Great' : score >= 6 ? 'Good' : 'Listed'

  setResponseHeader(event, 'Content-Type', 'image/svg+xml')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  const appUrl = `https://moonmart.ai/marketplace/app/${app.slug}`

  const svg = `<svg width="200" height="56" viewBox="0 0 200 56" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <a href="${appUrl}" target="_blank">
    <rect width="200" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
    <!-- Blue left accent -->
    <rect width="6" height="56" rx="10 0 0 10" fill="#2563eb"/>
    <!-- moonmart.ai text -->
    <text x="18" y="19" font-size="9" font-weight="700" fill="#2563eb">moonmart.ai</text>
    <text x="18" y="31" font-size="8" fill="#64748b">Verified ${label}</text>
    <!-- Score badge -->
    <rect x="144" y="10" width="46" height="36" rx="8" fill="#eff6ff"/>
    <text x="167" y="27" font-size="16" font-weight="800" fill="#2563eb" text-anchor="middle">${score.toFixed(1)}</text>
    <text x="167" y="38" font-size="7" fill="#64748b" text-anchor="middle">/10 Score</text>
    <!-- Stars -->
    <text x="18" y="46" font-size="8" fill="#f59e0b">★★★★★</text>
    <text x="57" y="46" font-size="7.5" fill="#64748b">${app.rating.toFixed(1)} (${app.reviewCount})</text>
  </a>
</svg>`

  return svg
})
