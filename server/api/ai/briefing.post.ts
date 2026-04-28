/**
 * POST /api/ai/briefing
 * Generate an AI evaluation brief comparing 2–4 tools.
 * Requires authentication (Pro feature).
 */
import { getDb, makeId } from '~/server/utils/database'
import { requirePlan } from '~/server/utils/auth'
import { checkRateLimit, getClientIp } from '~/server/utils/rateLimit'
import { getMarketplaceAppByIdOrSlug } from '~/server/utils/apps'
import { randomBytes } from 'node:crypto'

interface BriefingRequest {
  appIds: string[]
  context?: {
    companyName?: string
    teamSize?: number
    decisionDate?: string
    budget?: number
    notes?: string
  }
}

export default defineEventHandler(async (event) => {
  const user = await requirePlan(event, 'Professional')

  if (!checkRateLimit(getClientIp(event), { limit: 10, windowMs: 24 * 60 * 60 * 1000, prefix: 'ai-briefing' })) {
    throw createError({ statusCode: 429, statusMessage: 'Briefing limit reached. Please try again tomorrow.' })
  }

  const body = await readBody<BriefingRequest>(event)
  if (!Array.isArray(body?.appIds) || body.appIds.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Provide 2–4 appIds to compare.' })
  }
  if (body.appIds.length > 4) {
    throw createError({ statusCode: 400, statusMessage: 'Maximum 4 apps per briefing.' })
  }

  // Fetch app details
  const apps = body.appIds
    .map(id => getMarketplaceAppByIdOrSlug(id))
    .filter(Boolean)

  if (apps.length < 2) {
    throw createError({ statusCode: 404, statusMessage: 'Could not find the requested apps.' })
  }

  const companyName = body.context?.companyName || user.companyName || 'Your Organisation'
  const teamSize = body.context?.teamSize ?? null
  const budget = body.context?.budget ?? null

  let contentMd = ''
  const title = `Software Evaluation: ${apps.map(a => a!.name).join(' vs ')} for ${companyName}`

  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const appContexts = apps.map(a => {
      let pricing = 'Contact for pricing'
      if (a!.pricing.type === 'free') pricing = 'Free'
      else if (a!.pricing.value) pricing = `From $${a!.pricing.value}/mo`
      return `**${a!.name}** (${a!.category})
- Rating: ${a!.rating}/5 (${a!.reviewCount} reviews)
- Pricing: ${pricing}
- Description: ${a!.description}
- Tags: ${a!.tags.slice(0, 6).join(', ')}`
    }).join('\n\n')

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `Generate a professional software evaluation brief in Markdown.
Structure: # Executive Summary → ## Feature Comparison → ## Pricing & TCO → ## Risk Assessment → ## Recommendation → ## Appendix
Be specific, concise, and actionable. Write for a procurement decision-maker.`
            },
            {
              role: 'user',
              content: `Company: ${companyName}
Team size: ${teamSize ?? 'unknown'}
Budget: ${budget ? `$${budget}/month` : 'not specified'}
Decision date: ${body.context?.decisionDate ?? 'not set'}

Tools to evaluate:
${appContexts}

Generate the evaluation brief.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.4
        })
      })

      if (res.ok) {
        const data = await res.json() as { choices: Array<{ message: { content: string } }> }
        contentMd = data.choices[0].message.content
      }
    }
    catch (err) {
      console.error('[ai/briefing] OpenAI failed:', err)
    }
  }

  // ── Fallback template ─────────────────────────────────────────────────────
  if (!contentMd) {
    contentMd = `# ${title}

## Executive Summary

This evaluation compares ${apps.map(a => `**${a!.name}**`).join(', ')} to support a software selection decision for ${companyName}${teamSize ? ` (${teamSize} people)` : ''}.

${apps.map(a => `- **${a!.name}**: ${a!.description} — Rated ${a!.rating}/5 by ${a!.reviewCount} verified users.`).join('\n')}

## Feature Comparison

| Feature | ${apps.map(a => a!.name).join(' | ')} |
|---------|${apps.map(() => '---').join('|')}|
| Rating | ${apps.map(a => `${a!.rating}/5`).join(' | ')} |
| Category | ${apps.map(a => a!.category).join(' | ')} |
| Pricing | ${apps.map(a => { if (a!.pricing.type === 'free') return 'Free'; return a!.pricing.value ? `$${a!.pricing.value}/mo` : 'Contact' }).join(' | ')} |

## Pricing & TCO

${apps.map(a => { const pt = a!.pricing.type === 'free' ? 'Free tier available.' : a!.pricing.value ? `Starts at $${ a!.pricing.value}/month.` : 'Contact sales for pricing.'; return `**${a!.name}**: ${pt}` }).join('\n')}

## Recommendation

Based on ratings and user feedback, **${apps.sort((a, b) => b!.rating - a!.rating)[0]!.name}** leads with a ${apps.sort((a, b) => b!.rating - a!.rating)[0]!.rating}/5 rating. Evaluate free trials before committing.

*Generated by Moonmart AI · ${new Date().toLocaleDateString()}*`
  }

  // ── Persist to DB ────────────────────────────────────────────────────────
  const briefId = makeId('evb')
  const shareToken = randomBytes(16).toString('hex')
  const now = new Date().toISOString()
  const db = getDb()

  db.prepare(`
    INSERT INTO evaluation_briefs (id, user_id, app_ids, title, content_md, share_token, views, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(briefId, user.id, JSON.stringify(body.appIds), title, contentMd, shareToken, now)

  const baseUrl = process.env.SITE_URL || 'http://localhost:3000'

  return {
    briefId,
    shareUrl: `${baseUrl}/brief/${shareToken}`,
    title,
    contentMd,
    sections: ['executive_summary', 'feature_comparison', 'pricing_tco', 'risk_assessment', 'recommendation', 'appendix']
  }
})
