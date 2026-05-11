/**
 * Spam / Gibberish Detector — Validation Agent
 * Checks whether a discovered URL/extracted listing is a real SaaS product
 * or a parked domain, spam page, gibberish submission, or non-SaaS site.
 *
 * Usage: Called during ingestion (before inserting to app_listings).
 *   const { isSpam, reason, confidence } = await detectSpam(extracted, url)
 *   if (isSpam) discard; else proceed.
 *
 * Two-layer detection:
 *   1. Rule-based fast-path (cheap, no AI call needed for obvious cases)
 *   2. LLM verification for borderline cases (requires AI key)
 */
import { aiChat } from '~/server/utils/aiProvider'
import type { ExtractedListing } from '~/server/utils/ai-extractor'

export interface SpamDetectionResult {
  isSpam: boolean
  reason: string
  confidence: number // 0.0 – 1.0
}

const SPAM_DOMAIN_PATTERNS = [
  /\.xyz$/, /\.tk$/, /\.ml$/, /\.ga$/, /\.cf$/, /\.gq$/, /\.loan$/,
  /\.(info|biz)$/, /^(www\.)?ad\d+\./, /click\d+\./,
]

const PARKED_SIGNALS = [
  'this domain is for sale',
  'buy this domain',
  'domain parked',
  'coming soon',
  'under construction',
  'parking service',
  'sedo.com',
  'hugedomains.com',
]

const SPAM_NAME_PATTERNS = [
  /^\d+$/, // all numbers
  /[^\x00-\x7F]{3,}/, // heavy non-ASCII (not legit SaaS name)
  /(.)\1{4,}/, // repeated chars: "aaaaab"
]

const MIN_DESCRIPTION_TOKENS = 8
const MIN_NAME_LENGTH = 2
const MAX_NAME_LENGTH = 80

/** Rule-based fast check — no I/O */
function ruleBasedCheck(
  extracted: Partial<ExtractedListing>,
  url: string
): SpamDetectionResult | null {
  const name = (extracted.name || '').trim()
  const description = (extracted.description || '').trim()
  const lowerDesc = description.toLowerCase()

  // Empty or too-short name
  if (!name || name.length < MIN_NAME_LENGTH) {
    return { isSpam: true, reason: 'missing or too-short product name', confidence: 0.98 }
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { isSpam: true, reason: 'name too long — likely spam title', confidence: 0.90 }
  }

  // Name pattern spam
  for (const pat of SPAM_NAME_PATTERNS) {
    if (pat.test(name)) {
      return { isSpam: true, reason: `suspicious name pattern: ${pat}`, confidence: 0.92 }
    }
  }

  // Spam TLDs
  let domain = ''
  try { domain = new URL(url).hostname.toLowerCase() } catch { /* ignore */ }
  for (const pat of SPAM_DOMAIN_PATTERNS) {
    if (pat.test(domain)) {
      return { isSpam: true, reason: `suspicious TLD or domain pattern: ${domain}`, confidence: 0.85 }
    }
  }

  // Parked domain signals in description
  for (const signal of PARKED_SIGNALS) {
    if (lowerDesc.includes(signal)) {
      return { isSpam: true, reason: `parked domain signal: "${signal}"`, confidence: 0.97 }
    }
  }

  // Gibberish: description too short
  const tokens = description.split(/\s+/).filter(t => t.length > 2)
  if (tokens.length < MIN_DESCRIPTION_TOKENS) {
    return { isSpam: true, reason: 'description too short or missing', confidence: 0.80 }
  }

  // No category
  if (!extracted.category) {
    // Borderline — let LLM decide
    return null
  }

  return null // Passes rule-based check
}

/** LLM-based verification for borderline cases */
async function llmSpamCheck(
  extracted: Partial<ExtractedListing>,
  url: string
): Promise<SpamDetectionResult> {
  const prompt = `You are a SaaS marketplace quality gate. Classify whether the following product entry is a real, legitimate SaaS or software product — or is spam/gibberish/parked domain/irrelevant.

Product URL: ${url}
Product name: ${extracted.name || '(none)'}
Category: ${extracted.category || '(none)'}
Description: ${(extracted.description || '').substring(0, 400)}

Respond with a JSON object only, no explanation:
{
  "isSpam": true/false,
  "reason": "one-line reason",
  "confidence": 0.0-1.0
}`

  try {
    const { text: response } = await aiChat({
      messages: [{ role: 'user', content: prompt }]
    })

    if (!response) throw new Error('No AI response')
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in AI response')

    const parsed = JSON.parse(jsonMatch[0]) as SpamDetectionResult
    return {
      isSpam: Boolean(parsed.isSpam),
      reason: parsed.reason || 'AI determined spam',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.75
    }
  }
  catch {
    // If AI fails, default to accepting (conservative — avoid false positives)
    return { isSpam: false, reason: 'AI check failed — accepted by default', confidence: 0.50 }
  }
}

/**
 * Main exported function.
 * @param extracted - Partial listing from AI extractor
 * @param url - The original source URL
 * @returns SpamDetectionResult
 */
export async function detectSpam(
  extracted: Partial<ExtractedListing>,
  url: string
): Promise<SpamDetectionResult> {
  // 1. Rule-based fast path
  const ruleResult = ruleBasedCheck(extracted, url)
  if (ruleResult?.isSpam) return ruleResult

  // 2. If rule-based passes or is borderline, ask LLM (only if AI key available)
  const hasAIKey = Boolean(
    process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
  )

  if (hasAIKey) {
    return await llmSpamCheck(extracted, url)
  }

  // No AI key — if rules passed, accept
  return { isSpam: false, reason: 'passed rule-based checks', confidence: 0.70 }
}
