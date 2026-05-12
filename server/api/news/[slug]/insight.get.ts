/**
 * GET /api/news/[slug]/insight
 * Generate AI "what this means for buyers" summary for a news post.
 * Cached 24h in admin_settings KV store.
 * No auth required (public endpoint, rate-limited by IP).
 */
import { getDb } from '~/server/utils/database'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { aiChat } from '~/server/utils/aiProvider'

interface AdminSettingRow { value: string }
interface NewsRow { id: string; title: string; body_markdown: string; published_at: string }

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug is required' })

  if (!checkRateLimit(getClientIp(event), { limit: 30, windowMs: 60 * 60 * 1000, prefix: 'news-insight' })) {
    throw createError({ statusCode: 429, statusMessage: 'Rate limit reached. Try again later.' })
  }

  const db = getDb()
  const cacheKey = `news_insight_${slug}`

  // Check cache
  const cached = db.prepare(`SELECT value FROM admin_settings WHERE key = ? LIMIT 1`).get(cacheKey) as AdminSettingRow | undefined
  if (cached) {
    try {
      const parsed = JSON.parse(cached.value) as { summary: string; implications: string[]; cachedAt: string }
      // Validate cache age
      if (Date.now() - new Date(parsed.cachedAt).getTime() < CACHE_TTL_MS) {
        return { slug, ...parsed }
      }
    } catch {
      // Invalid cache — regenerate
    }
  }

  // Fetch news post
  const post = db.prepare(`SELECT id, title, body_markdown, published_at FROM news_posts WHERE slug = ? AND status = 'published' LIMIT 1`).get(slug) as NewsRow | undefined
  if (!post) throw createError({ statusCode: 404, statusMessage: 'News post not found' })

  // Truncate body to ~3000 chars to stay within token budget
  const bodySnippet = post.body_markdown.slice(0, 3000)

  let summary = ''
  let implications: string[] = []

  if (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
    try {
      const { text } = await aiChat({
        system: `You are a SaaS industry analyst helping software buyers understand news. 
Given a news article, produce:
1. A 2-sentence plain-text summary titled "summary" — what changed and why it matters to buyers
2. A JSON array of 2-4 brief implication strings titled "implications" — practical takeaways for a software buyer
Respond ONLY with valid JSON: { "summary": "...", "implications": ["...", "..."] }`,
        messages: [{ role: 'user', content: `Title: ${post.title}\n\n${bodySnippet}` }],
        maxTokens: 400,
        temperature: 0.4,
        task: 'insight'
      })

      if (text) {
        const jsonStr = text.replace(/^```(?:json)?\n?|\n?```$/g, '').trim()
        const parsed = JSON.parse(jsonStr) as { summary?: string; implications?: string[] }
        summary = parsed.summary ?? ''
        implications = parsed.implications ?? []
      }
    } catch (err) {
      console.error('[news/insight] AI call failed:', err)
    }
  }

  // Fallback if no AI key or failure
  if (!summary) {
    summary = `${post.title} — this development may affect how buyers evaluate solutions in this space. Review the full article for details.`
    implications = ['Evaluate how this change affects your current or prospective vendors.', 'Monitor vendor response and product roadmap updates.']
  }

  const cachedAt = new Date().toISOString()
  const payload = JSON.stringify({ summary, implications, cachedAt })

  // Upsert cache
  db.prepare(`INSERT INTO admin_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(cacheKey, payload)

  return { slug, summary, implications, cachedAt }
})
