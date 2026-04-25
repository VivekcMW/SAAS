import { getMarketplaceAppByIdOrSlug } from '~/server/utils/apps'

/**
 * OG/Twitter social share image for app details page.
 * Phase 1: returns an SVG (served as image) — no external deps.
 * Browsers, Slack, Twitter, LinkedIn, WhatsApp all render SVG in og:image.
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''
  const app = getMarketplaceAppByIdOrSlug(id)

  const name = app?.name || 'Moonmart'
  const provider = app?.provider || ''
  const description = (app?.description || 'Discover the best SaaS tools for your business').slice(0, 140)
  const rating = app?.rating ? app.rating.toFixed(1) : ''
  const reviewCount = app?.reviewCount || 0
  const category = app?.category || 'SaaS'

  const escape = (s: string) =>
    s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff3e6"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="6" fill="#ff8838"/>

  <text x="60" y="90" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="600" fill="#ff8838" letter-spacing="2">
    SAASWORLD · ${escape(category.toUpperCase())}
  </text>

  <text x="60" y="210" font-family="Inter, system-ui, sans-serif" font-size="84" font-weight="800" fill="#1f2937">
    ${escape(name.slice(0, 30))}
  </text>

  ${provider ? `<text x="60" y="260" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="500" fill="#6b7280">by ${escape(provider)}</text>` : ''}

  <foreignObject x="60" y="300" width="1080" height="200">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, system-ui, sans-serif; font-size: 30px; line-height: 1.4; color: #374151; font-weight: 400;">
      ${escape(description)}
    </div>
  </foreignObject>

  ${rating ? `
  <g transform="translate(60, 520)">
    <rect width="180" height="50" rx="8" fill="#ffffff" stroke="#e5e7eb" stroke-width="1"/>
    <text x="20" y="33" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="700" fill="#ff8838">★ ${escape(rating)}</text>
    <text x="75" y="33" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="500" fill="#6b7280">(${reviewCount} reviews)</text>
  </g>` : ''}

  <text x="60" y="598" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="500" fill="#9ca3af">
    moonmart.ai/marketplace/app/${escape(id)}
  </text>

  <g transform="translate(1000, 520)">
    <rect width="140" height="50" rx="8" fill="#ff8838"/>
    <text x="70" y="33" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="600" fill="#ffffff" text-anchor="middle">View Details →</text>
  </g>
</svg>`

  setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')
  return svg
})
