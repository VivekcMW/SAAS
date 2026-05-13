/**
 * GET /api/og/page
 * Generic SVG-based OG image for any page.
 * Query params:
 *   title   – page title (required)
 *   sub     – subtitle / description (optional)
 *   label   – top badge label, e.g. "Marketplace" (optional)
 */
export default defineEventHandler((event) => {
  const query = getQuery(event) as Record<string, string>
  const title = (query.title || 'Moonmart').slice(0, 60)
  const sub = (query.sub || 'Discover the best SaaS tools for your business').slice(0, 140)
  const label = (query.label || 'moonmart.ai').slice(0, 30)

  const escape = (s: string) =>
    s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Decorative circle -->
  <circle cx="1050" cy="120" r="240" fill="#f97316" fill-opacity="0.08"/>
  <circle cx="150" cy="500" r="180" fill="#3b82f6" fill-opacity="0.07"/>
  <!-- Brand bar -->
  <rect x="80" y="80" width="160" height="36" rx="8" fill="#f97316" fill-opacity="0.18"/>
  <text x="160" y="104" font-family="system-ui,sans-serif" font-size="15" font-weight="700" fill="#f97316" text-anchor="middle">${escape(label)}</text>
  <!-- Title -->
  <text x="80" y="320" font-family="system-ui,sans-serif" font-size="64" font-weight="800" fill="#f8fafc" dominant-baseline="middle">
    ${escape(title.slice(0, 30))}
  </text>
  ${title.length > 30 ? `<text x="80" y="400" font-family="system-ui,sans-serif" font-size="64" font-weight="800" fill="#f8fafc" dominant-baseline="middle">${escape(title.slice(30, 60))}</text>` : ''}
  <!-- Subtitle -->
  <text x="80" y="490" font-family="system-ui,sans-serif" font-size="26" fill="#94a3b8" dominant-baseline="middle">${escape(sub.slice(0, 70))}</text>
  ${sub.length > 70 ? `<text x="80" y="530" font-family="system-ui,sans-serif" font-size="26" fill="#94a3b8" dominant-baseline="middle">${escape(sub.slice(70, 140))}</text>` : ''}
  <!-- Bottom logo text -->
  <text x="80" y="600" font-family="system-ui,sans-serif" font-size="20" font-weight="700" fill="#f97316">moonmart.ai</text>
</svg>`

  setHeader(event, 'Content-Type', 'image/svg+xml')
  setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')
  return svg
})
