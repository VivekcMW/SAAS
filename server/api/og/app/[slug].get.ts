import { getMarketplaceAppByIdOrSlug } from '~/server/utils/apps'
import { computeMoonmartScore } from '~/utils/moonmartScore'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug as string
  const app = getMarketplaceAppByIdOrSlug(slug)

  const name = app?.name || 'App Review'
  const rating = app?.rating ?? 0
  const category = app?.category || ''
  const reviewCount = app?.reviewCount ?? 0

  const score = app
    ? computeMoonmartScore({
        reviewCount: app.reviewCount,
        rating: app.rating,
        integrationCount: 0,
        pricingType: (app.pricing.type || 'paid') as 'free' | 'paid' | 'contact' | 'trial'
      })
    : 0

  const nameLine1 = name.length > 22 ? name.slice(0, 22) + '…' : name
  const catLine = category ? category.charAt(0).toUpperCase() + category.slice(1).replaceAll('-', ' ') : ''

  setResponseHeader(event, 'Content-Type', 'image/svg+xml')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <!-- Background -->
  <rect width="1200" height="630" fill="#f8fafc"/>
  <!-- Left accent bar -->
  <rect width="8" height="630" fill="#2563eb"/>
  <!-- Card -->
  <rect x="40" y="60" width="1120" height="510" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>

  <!-- moonmart.ai brand -->
  <text x="88" y="130" font-size="22" font-weight="700" fill="#2563eb">moonmart.ai</text>
  <text x="88" y="158" font-size="14" fill="#94a3b8">Verified Software Review</text>

  <!-- App name -->
  <text x="88" y="248" font-size="62" font-weight="800" fill="#0f172a">${escapeXml(nameLine1)}</text>

  <!-- Category pill -->
  ${catLine ? `<rect x="88" y="270" width="${catLine.length * 9 + 28}" height="32" rx="16" fill="#eff6ff"/>
  <text x="${88 + (catLine.length * 9 + 28) / 2}" y="291" font-size="13" font-weight="600" fill="#2563eb" text-anchor="middle">${escapeXml(catLine)}</text>` : ''}

  <!-- moonmart Score -->
  <text x="88" y="370" font-size="16" fill="#64748b" font-weight="500">moonmart Score™</text>
  <text x="88" y="430" font-size="88" font-weight="800" fill="#2563eb">${score.toFixed(1)}</text>
  <text x="${88 + score.toFixed(1).length * 52 + 8}" y="430" font-size="40" fill="#94a3b8">/10</text>

  <!-- Star rating -->
  <text x="88" y="490" font-size="20" fill="#f59e0b">★★★★★</text>
  <text x="108" y="516" font-size="16" fill="#64748b">${rating.toFixed(1)} · ${reviewCount.toLocaleString()} verified reviews</text>

  <!-- Right decoration -->
  <circle cx="1020" cy="315" r="180" fill="#eff6ff" opacity="0.6"/>
  <text x="1020" y="350" font-size="120" font-weight="900" fill="#2563eb" text-anchor="middle" opacity="0.15">${score.toFixed(0)}</text>
</svg>`

  return svg
})

function escapeXml(str: string): string {
  return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}
