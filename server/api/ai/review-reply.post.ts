/**
 * POST /api/ai/review-reply
 * Generate an AI-drafted, tone-matched vendor reply to a review.
 * Requires vendor auth. Rate limit 50/hr.
 */
import { getDb } from '~/server/utils/database'
import { requireVendor, getVendorProfileForUser } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'

const TONES = ['professional', 'friendly', 'empathetic'] as const
type Tone = typeof TONES[number]

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)

  if (!checkRateLimit(getClientIp(event), { limit: 50, windowMs: 60 * 60 * 1000, prefix: 'ai-rvreply' })) {
    throw createError({ statusCode: 429, statusMessage: 'Rate limit reached. Try again in an hour.' })
  }

  const body = await readBody<{ reviewId?: string; tone?: string }>(event)
  const reviewId = body?.reviewId
  const tone: Tone = TONES.includes(body?.tone as Tone) ? (body!.tone as Tone) : 'professional'

  if (!reviewId) throw createError({ statusCode: 400, statusMessage: 'reviewId is required' })

  const vendor = getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })

  const db = getDb()

  // Fetch review — must belong to one of the vendor's listings
  const review = db.prepare(`
    SELECT r.id, r.rating, r.title, r.content, r.pros, r.cons, r.user_role, r.company_size,
           a.name AS app_name, a.category
    FROM reviews r
    JOIN app_listings a ON a.id = r.app_id
    WHERE r.id = ? AND a.vendor_id = ? AND r.status = 'approved'
    LIMIT 1
  `).get(reviewId, vendor.id) as {
    id: string; rating: number; title: string; content: string; pros: string | null;
    cons: string | null; user_role: string | null; company_size: string | null;
    app_name: string; category: string
  } | undefined

  if (!review) {
    throw createError({ statusCode: 404, statusMessage: 'Review not found or access denied' })
  }

  const toneGuide: Record<Tone, string> = {
    professional: 'formal, concise, business-appropriate — suitable for enterprise buyers',
    friendly: 'warm, conversational, approachable — like a founder talking to a user',
    empathetic: 'understanding, compassionate — especially for critical or mixed reviews'
  }

  let draft = ''

  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a customer success expert writing vendor replies to SaaS product reviews.
Tone: ${toneGuide[tone]}.
Rules:
- 100–200 words maximum
- Address the reviewer's specific points (pros, cons, rating)
- Thank them genuinely, acknowledge negatives honestly, mention concrete next steps if relevant
- Never be defensive or dismiss criticism
- Do NOT start with "Dear" or end with "Best regards"
- Write as the vendor team, not as a bot`
            },
            {
              role: 'user',
              content: `Product: ${review.app_name} (${review.category})
Reviewer: ${review.user_role ?? 'unknown role'} at a ${review.company_size ?? 'company'}
Rating: ${review.rating}/5
Title: ${review.title}
Review: ${review.content}
${review.pros ? `Pros: ${review.pros}` : ''}
${review.cons ? `Cons: ${review.cons}` : ''}

Write a vendor reply.`
            }
          ],
          max_tokens: 350,
          temperature: 0.65
        })
      })

      if (res.ok) {
        const data = await res.json() as { choices: Array<{ message: { content: string } }> }
        draft = data.choices[0].message.content.trim()
      }
    } catch (err) {
      console.error('[ai/review-reply] OpenAI failed:', err)
    }
  }

  // Fallback
  if (!draft) {
    if (review.rating >= 4) {
      draft = `Thank you so much for this review — hearing that ${review.app_name} made a real difference for your team is exactly why we build this. We'd love to hear more about your setup if you're ever open to sharing. Thanks again for taking the time.`
    } else if (review.rating === 3) {
      draft = `Thank you for the balanced feedback. We take mixed reviews seriously — the points you raised about ${review.cons ?? 'the gaps you mentioned'} are on our radar and actively being addressed. We'd love to win back your full confidence. Feel free to reach out directly to our support team.`
    } else {
      draft = `We're sorry this wasn't the experience you deserved. Your feedback on ${review.cons ?? 'the issues you raised'} is important and has been shared with our product team. We'd like to make this right — please contact us directly and we'll do our best to resolve this promptly.`
    }
  }

  return { reviewId, draft, tone }
})
