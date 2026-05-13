/**
 * POST /api/vendor/ai/generate
 * Generates listing copy with plan-based token limits.
 */
import { requireVendor, getVendorProfileForUser } from '~/server/utils/auth'
import { getDb, makeId } from '~/server/utils/database'

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 10,
  growth: 30,
  scale: Infinity,
  enterprise: Infinity,
}

function getPlanLimit(plan: string): number {
  return PLAN_LIMITS[plan.toLowerCase()] ?? PLAN_LIMITS.free
}

// Optionally use real AI if available, otherwise template
async function generateCopy(product: string, audience: string, integrations: string): Promise<{
  title: string; description: string; bullets: string[]
}> {
  // Try real AI first
  try {
    const { aiChat } = await import('~/server/utils/aiProvider')
    const prompt = `You are a SaaS product copywriter. Generate compelling listing copy for:
Product: ${product}
Target audience: ${audience || 'business professionals'}
Key integrations: ${integrations || 'major productivity tools'}

Return JSON with: title (max 80 chars), description (3-4 sentences, ~150 words), bullets (array of 3 key benefits, each max 100 chars).
Only output valid JSON, no markdown.`

    const response = await aiChat([{ role: 'user', content: prompt }], { maxTokens: 400 })
    const cleaned = response.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed.title && parsed.description && Array.isArray(parsed.bullets)) {
      return { title: parsed.title, description: parsed.description, bullets: parsed.bullets }
    }
  } catch {
    // Fall through to template
  }

  // Template fallback
  const title = `${product} — built for ${audience || 'modern teams'}`
  const description = `${product} helps ${audience || 'teams'} move faster without stitching together five tools. With native integrations for ${integrations || 'your existing stack'}, teams get up and running in a day — not a quarter.\n\nYou get a clean workspace, smart automations, and responsive support. Priced to scale with your team.`
  const bullets = [
    `Ready for ${audience || 'your team'} on day one — no consultant required`,
    `Works with the tools you already use (${integrations || 'Slack, Google, Jira, and more'})`,
    'Enterprise-grade security with SOC 2 Type II and SSO included',
  ]
  return { title, description, bullets }
}

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)
  if (!vendor) throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })

  const body = await readBody(event)
  const product = String(body?.product ?? '').trim()
  const audience = String(body?.audience ?? '').trim()
  const integrations = String(body?.integrations ?? '').trim()

  if (!product || product.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'product name is required (min 3 chars)' })
  }

  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendor_ai_usage (
      id         TEXT PRIMARY KEY,
      vendor_id  TEXT NOT NULL,
      type       TEXT NOT NULL DEFAULT 'listing_copy',
      month      TEXT NOT NULL,
      count      INTEGER NOT NULL DEFAULT 0,
      UNIQUE(vendor_id, type, month)
    );
  `)

  const month = new Date().toISOString().slice(0, 7)

  // Get plan
  const sub = db.prepare(`
    SELECT plan FROM user_subscriptions WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1
  `).get(user.id) as { plan: string } | undefined
  const plan = sub?.plan ?? 'free'
  const limit = getPlanLimit(plan)

  // Check current usage
  const row = db.prepare('SELECT count FROM vendor_ai_usage WHERE vendor_id = ? AND type = ? AND month = ?')
    .get(vendor.id, 'listing_copy', month) as { count: number } | undefined
  const used = row?.count ?? 0

  if (used >= limit) {
    throw createError({
      statusCode: 402,
      statusMessage: `Monthly generation limit reached (${limit} on ${plan} plan). Upgrade to generate more.`,
    })
  }

  // Generate content
  const result = await generateCopy(product, audience, integrations)

  // Track usage (INSERT OR REPLACE to increment atomically)
  db.prepare(`
    INSERT INTO vendor_ai_usage (id, vendor_id, type, month, count)
    VALUES (?, ?, 'listing_copy', ?, 1)
    ON CONFLICT(vendor_id, type, month) DO UPDATE SET count = count + 1
  `).run(makeId('aiu'), vendor.id, month)

  const newUsed = used + 1
  return {
    ...result,
    usage: {
      used: newUsed,
      limit: limit === Infinity ? null : limit,
      remaining: limit === Infinity ? null : limit - newUsed,
    },
  }
})
