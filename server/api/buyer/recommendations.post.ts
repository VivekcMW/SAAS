/**
 * POST /api/buyer/recommendations
 * Uses the real app listings DB + AI to generate personalised SaaS recommendations.
 * Rate-limited; no auth required (works for anonymous users too).
 */
import { aiChat } from '~/server/utils/aiProvider'
import { getDb } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

interface RecommendBody {
  category: string
  teamSize: string
  integrations: string[]
  budget: number
}

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (!checkRateLimit(ip, { prefix: 'buyer_recs', limit: 10, windowMs: 60 * 60 * 1000 }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please wait a moment.' })
  }

  const body = await readBody<RecommendBody>(event)
  const { category = '', teamSize = '', integrations = [], budget = 50 } = body || {}

  if (!category) throw createError({ statusCode: 400, statusMessage: 'category is required' })

  const db = getDb()

  // Pull up to 20 real apps in the requested category
  const apps = db.prepare(`
    SELECT id, name, short_description, category, pricing_type, pricing_value, pricing_period,
           rating, review_count, tags
    FROM app_listings
    WHERE status = 'published'
      AND (category = ? OR category LIKE ?)
    ORDER BY rating DESC, review_count DESC
    LIMIT 20
  `).all(category, `%${category}%`) as Array<{
    id: string; name: string; short_description: string; category: string
    pricing_type: string; pricing_value: number | null; pricing_period: string | null
    rating: number; review_count: number; tags: string
  }>

  // Fallback: if no matching category in DB, pull top-rated apps
  const appPool = apps.length >= 3 ? apps : (db.prepare(`
    SELECT id, name, short_description, category, pricing_type, pricing_value, pricing_period,
           rating, review_count, tags
    FROM app_listings WHERE status = 'published'
    ORDER BY rating DESC, review_count DESC LIMIT 15
  `).all() as typeof apps)

  const appContext = appPool.map(a => (
    `${a.name} (${a.category}): ${a.short_description} | ` +
    `Price: ${a.pricing_type === 'free' ? 'Free' : a.pricing_value ? `$${a.pricing_value}/${a.pricing_period || 'mo'}` : 'Contact'} | ` +
    `Rating: ${a.rating ?? 'N/A'}/5 (${a.review_count ?? 0} reviews) | ` +
    `Tags: ${a.tags ? JSON.parse(a.tags).join(', ') : 'none'}`
  )).join('\n')

  const prompt = `You are a SaaS buying advisor. A buyer needs help choosing software.

Buyer profile:
- Category needed: ${category}
- Team size: ${teamSize}
- Current tools to integrate with: ${integrations.length ? integrations.join(', ') : 'none specified'}
- Monthly budget per user: $${budget}

Available products (from our marketplace):
${appContext || 'No specific products in DB for this category. Use your general knowledge.'}

Task: Pick the top 3 products that best fit this buyer. For each, write a concise 1-2 sentence rationale (max 25 words) explaining why it fits this specific buyer. If the product costs more than their budget, mention that briefly.

Respond ONLY with a JSON array, no markdown, no explanation outside JSON:
[
  {"name": "...", "rationale": "..."},
  {"name": "...", "rationale": "..."},
  {"name": "...", "rationale": "..."}
]`

  try {
    const { text } = await aiChat({
      task: 'match',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 400,
    })

    // Parse AI response
    const jsonMatch = (text ?? '').match(/\[[\s\S]*\]/)
    const aiPicks: Array<{ name: string; rationale: string }> = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : []

    // Enrich with real DB data where possible
    const recommendations = aiPicks.slice(0, 3).map(pick => {
      const dbApp = appPool.find(a => a.name.toLowerCase().includes(pick.name.toLowerCase()) || pick.name.toLowerCase().includes(a.name.toLowerCase()))
      const logoLetter = (pick.name || '?').charAt(0).toUpperCase()
      const colors = ['#2563eb', '#1a1a1a', '#7c3aed', '#0891b2', '#065f46', '#ff7a59', '#4338ca']
      const color = colors[(pick.name.charCodeAt(0) || 0) % colors.length]
      return {
        name: pick.name,
        logo: logoLetter,
        color,
        price: dbApp?.pricing_value ?? null,
        pricingType: dbApp?.pricing_type ?? 'contact',
        rating: dbApp?.rating ?? null,
        rationale: pick.rationale,
        slug: dbApp?.id ?? null,
      }
    })

    return { recommendations }
  } catch {
    // AI unavailable — return top DB apps with generic rationale
    const fallback = appPool.slice(0, 3).map(a => ({
      name: a.name,
      logo: a.name.charAt(0).toUpperCase(),
      color: '#2563eb',
      price: a.pricing_value,
      pricingType: a.pricing_type,
      rating: a.rating,
      rationale: `Top-rated ${a.category} tool with ${a.review_count} reviews. ${a.short_description.slice(0, 60)}.`,
      slug: a.id,
    }))
    return { recommendations: fallback }
  }
})
