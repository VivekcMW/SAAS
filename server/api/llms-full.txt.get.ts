/**
 * GET /llms-full.txt
 * Complete plain-text dump of all published apps for AI crawler ingestion.
 * Regenerated dynamically — always fresh.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400') // 24h cache

  const db = getDb()
  const apps = db.prepare(`
    SELECT name, slug, provider, category, short_description, description,
           pricing_type, pricing_value, rating, review_count, tags, target_audience,
           verified, featured, updated_at
    FROM app_listings
    WHERE status = 'published'
    ORDER BY featured DESC, rating DESC
    LIMIT 5000
  `).all() as Array<{
    name: string; slug: string; provider: string; category: string
    short_description: string | null; description: string; pricing_type: string | null
    pricing_value: number | null; rating: number; review_count: number
    tags: string | null; target_audience: string | null; verified: number
    featured: number; updated_at: string
  }>

  const lines: string[] = [
    '# moonmart.ai — Complete App Directory',
    `# Generated: ${new Date().toISOString()}`,
    `# Total apps: ${apps.length}`,
    '# Format: Name | Category | Provider | Pricing | Rating | Description',
    '',
    '---',
    ''
  ]

  for (const app of apps) {
    const pricingStr = app.pricing_type === 'free'
      ? 'Free'
      : app.pricing_value
        ? `From $${app.pricing_value}/month`
        : app.pricing_type === 'contact'
          ? 'Contact for pricing'
          : 'Paid'

    let tags: string[] = []
    try { tags = JSON.parse(app.tags || '[]') } catch { /* ignore */ }

    lines.push(`## ${app.name}`)
    lines.push(`URL: https://moonmart.ai/marketplace/app/${app.slug}`)
    lines.push(`Category: ${app.category}`)
    lines.push(`Provider: ${app.provider}`)
    lines.push(`Pricing: ${pricingStr}`)
    lines.push(`Rating: ${app.rating}/5 (${app.review_count} verified reviews)`)
    if (app.verified) lines.push('Verified: Yes')
    if (tags.length) lines.push(`Tags: ${tags.join(', ')}`)
    lines.push(`Description: ${app.short_description || app.description}`)
    lines.push(`Last updated: ${app.updated_at}`)
    lines.push('')
  }

  return lines.join('\n')
})
