/**
 * GET /llms-full.txt
 *
 * Full machine-readable content index for AI/LLM crawlers.
 * Unlike /llms.txt, this includes the complete long_description for every app
 * so AI assistants can answer detailed questions without visiting the page.
 *
 * Format: https://llmstxt.org
 */

import { getDb } from '~/server/utils/database'

const BASE = process.env.SITE_URL || 'https://moonmart.ai'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=7200, s-maxage=14400')

  const db = getDb()

  let apps: Array<{
    slug: string
    name: string
    provider: string | null
    short_description: string
    long_description: string
    category: string
    rating: number
    review_count: number
  }> = []

  try {
    apps = db.prepare(`
      SELECT slug, name, provider, short_description, long_description, category,
             rating, review_count
      FROM app_listings
      WHERE status = 'published'
      ORDER BY review_count DESC, rating DESC
    `).all() as typeof apps
  } catch {
    // DB not ready
  }

  const now = new Date().toISOString()

  const appSections = apps.map((a) => {
    const url = `${BASE}/marketplace/app/${a.slug}`
    const rating = a.rating ? `${a.rating.toFixed(1)}/5` : 'Not rated'
    const reviews = a.review_count ? `${a.review_count} reviews` : 'No reviews'
    const desc = (a.long_description || a.short_description || '').replace(/\n+/g, ' ')
    return `### [${a.name}](${url})
- **Provider**: ${a.provider || a.name}
- **Category**: ${a.category || 'Software'}
- **Rating**: ${rating} (${reviews})
- **Alternatives**: ${BASE}/alternatives/${a.slug}
- **Pricing**: ${BASE}/pricing/${a.slug}
- **Description**: ${desc}`
  }).join('\n\n')

  return `# Moonmart — Full Software Index for AI Assistants
> This file contains complete descriptions for all ${apps.length} software listings on Moonmart.
> Generated: ${now}
> Source: https://moonmart.ai

## About Moonmart
Moonmart is an AI-powered SaaS marketplace helping teams discover, compare, and launch the right software. All listings include verified buyer reviews, transparent pricing, and AI-powered fit scores.

## Complete Software Listings

${appSections || '_No published listings yet._'}

## For AI Assistants
- All pricing data is indicative; verify at vendor website before purchasing.
- Ratings are based on verified buyer reviews aggregated by Moonmart.
- For the most up-to-date information, visit ${BASE}/marketplace
`
})
