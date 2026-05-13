import { getMarketplaceAppByIdOrSlug } from '~/server/utils/apps'

/**
 * GET /api/og/app/[id]
 *
 * Enhanced SVG OG/Twitter social share image for app detail pages.
 *
 * Visual elements:
 *  - Category accent bar (colour-coded by category)
 *  - App name + provider
 *  - Short description
 *  - Star rating (filled/empty SVG paths)
 *  - Pricing tier pill (Free · Paid · Contact Sales)
 *  - Moonmart score badge (if available)
 *  - Canonical URL line
 */
import { getDb } from '~/server/utils/database'

// Category → accent colour mapping
const CATEGORY_COLOURS: Record<string, string> = {
  crm: '#3b82f6',
  marketing: '#f59e0b',
  analytics: '#8b5cf6',
  productivity: '#10b981',
  collaboration: '#06b6d4',
  design: '#ec4899',
  devtools: '#6366f1',
  hr: '#f97316',
  finance: '#14b8a6',
  security: '#ef4444',
  ai: '#a855f7',
  'e-commerce': '#22c55e',
}
const DEFAULT_ACCENT = '#ff8838'

function categoryAccent(cat: string): string {
  return CATEGORY_COLOURS[cat?.toLowerCase()] || DEFAULT_ACCENT
}

// Pricing label + pill colour
function pricingPill(app: { pricing?: { type?: string; value?: number } | null }): { label: string; bg: string; fg: string } {
  const type = app.pricing?.type
  if (type === 'free') return { label: 'Free', bg: '#dcfce7', fg: '#15803d' }
  if (type === 'contact') return { label: 'Contact Sales', bg: '#fef3c7', fg: '#92400e' }
  if (type === 'freemium') return { label: 'Freemium', bg: '#eff6ff', fg: '#1d4ed8' }
  if (app.pricing?.value) return { label: `From $${app.pricing.value}/mo`, bg: '#f3f4f6', fg: '#374151' }
  return { label: 'Paid', bg: '#f3f4f6', fg: '#374151' }
}

// Build filled/empty star SVG
function starRating(rating: number, cx: number, cy: number): string {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    const x = cx + (i - 1) * 36
    const filled = rating >= i
    const half = !filled && rating >= i - 0.5
    const fill = filled || half ? '#f59e0b' : '#d1d5db'
    stars.push(`<text x="${x}" y="${cy}" font-size="28" fill="${fill}" font-family="Arial Unicode MS, sans-serif">★</text>`)
  }
  return stars.join('\n')
}

const escape = (s: string) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''
  const app = getMarketplaceAppByIdOrSlug(id)

  const name = app?.name || 'Moonmart'
  const provider = app?.provider || ''
  const description = (app?.description || 'Discover the best SaaS tools for your business').slice(0, 130)
  const rating = app?.rating ?? 0
  const ratingDisplay = rating > 0 ? rating.toFixed(1) : ''
  const reviewCount = app?.reviewCount || 0
  const category = app?.category || 'SaaS'
  const accent = categoryAccent(category)
  const pill = pricingPill(app || {})

  // Moonmart SEO score from DB (optional)
  let seoScore: number | null = null
  try {
    const db = getDb()
    const meta = db.prepare('SELECT seo_score FROM app_seo_meta WHERE app_id = ?').get(app?.id || id) as { seo_score: number } | undefined
    seoScore = meta?.seo_score ?? null
  } catch { /* ignore */ }

  const ratingY = 480
  const starsX = 60

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Background -->
  <rect width="1200" height="630" fill="#ffffff"/>
  <!-- Left accent bar (category colour) -->
  <rect x="0" y="0" width="8" height="630" fill="${accent}"/>
  <!-- Top bar (thin) -->
  <rect x="0" y="0" width="1200" height="5" fill="${accent}"/>

  <!-- Category label -->
  <text x="60" y="72" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="700" fill="${accent}" letter-spacing="2">${escape(category.toUpperCase())} · MOONMART.AI</text>

  <!-- App name -->
  <text x="60" y="175" font-family="Inter, system-ui, sans-serif" font-size="${name.length > 20 ? 64 : 80}" font-weight="800" fill="#111827">${escape(name.slice(0, 28))}</text>

  <!-- Provider -->
  ${provider ? `<text x="62" y="222" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="500" fill="#6b7280">by ${escape(provider)}</text>` : ''}

  <!-- Divider -->
  <line x1="60" y1="248" x2="1140" y2="248" stroke="#f3f4f6" stroke-width="1.5"/>

  <!-- Description -->
  <text x="60" y="295" font-family="Inter, system-ui, sans-serif" font-size="26" fill="#374151" font-weight="400">${escape(description.slice(0, 70))}</text>
  ${description.length > 70 ? `<text x="60" y="335" font-family="Inter, system-ui, sans-serif" font-size="26" fill="#374151">${escape(description.slice(70, 140))}</text>` : ''}
  ${description.length > 140 ? `<text x="60" y="375" font-family="Inter, system-ui, sans-serif" font-size="26" fill="#374151">${escape(description.slice(140, 210))}</text>` : ''}

  <!-- Star rating -->
  ${ratingDisplay ? `
  ${starRating(rating, starsX, ratingY)}
  <text x="${starsX + 190}" y="${ratingY}" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="700" fill="#111827">${escape(ratingDisplay)}</text>
  <text x="${starsX + 240}" y="${ratingY}" font-family="Inter, system-ui, sans-serif" font-size="22" fill="#6b7280">(${reviewCount.toLocaleString()} reviews)</text>
  ` : ''}

  <!-- Pricing pill -->
  <rect x="60" y="506" width="${pill.label.length * 11 + 28}" height="38" rx="19" fill="${pill.bg}"/>
  <text x="${60 + (pill.label.length * 11 + 28) / 2}" y="530" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="600" fill="${pill.fg}">${escape(pill.label)}</text>

  <!-- Moonmart score badge (if available) -->
  ${seoScore !== null ? `
  <g transform="translate(900, 490)">
    <rect width="200" height="60" rx="10" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/>
    <text x="100" y="22" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#15803d" font-weight="600">MOONMART SCORE</text>
    <text x="100" y="50" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="26" fill="#15803d" font-weight="800">${Math.round(seoScore)}/100</text>
  </g>` : ''}

  <!-- Canonical URL -->
  <text x="60" y="600" font-family="Inter, system-ui, sans-serif" font-size="18" fill="#9ca3af">moonmart.ai/marketplace/app/${escape(app?.slug || id)}</text>

  <!-- CTA button -->
  <g transform="translate(1020, 556)">
    <rect width="120" height="44" rx="8" fill="${accent}"/>
    <text x="60" y="28" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="17" font-weight="600" fill="#ffffff">View App →</text>
  </g>
</svg>`

  setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')
  return svg
})
