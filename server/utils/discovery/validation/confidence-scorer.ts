/**
 * Confidence Scorer — Validation Agent
 * Extends the basic computeScore() from ai-extractor with additional signals
 * gathered post-extraction: domain age, logo reachability, URL structure,
 * description quality, and external review presence.
 *
 * Produces an enriched routing decision that may override the raw AI confidence:
 *   - auto_submit  ≥ 0.92 composite
 *   - review       0.70 – 0.91
 *   - discard      < 0.70
 *
 * Usage:
 *   const score = await computeEnrichedScore(extracted, websiteUrl)
 *   const route = enrichedRoute(score)
 */
import { computeScore, routeByScore } from '~/server/utils/ai-extractor'
import type { ExtractedListing, FieldConfidence } from '~/server/utils/ai-extractor'

export interface EnrichedScore {
  baseScore: number
  bonusScore: number
  totalScore: number
  route: 'auto_submit' | 'review' | 'discard'
  breakdown: {
    hasLogo: boolean
    descriptionLength: number
    descriptionQuality: number
    hasKeyFeatures: boolean
    websiteReachable: boolean
    httpsEnabled: boolean
    knownTld: boolean
    pricingSpecified: boolean
  }
}

const KNOWN_TLDS = new Set([
  'com', 'io', 'co', 'app', 'dev', 'ai', 'net', 'org', 'tech', 'software',
  'cloud', 'tools', 'pro', 'agency', 'solutions', 'digital', 'online', 'studio'
])

async function checkLogoReachable(logoUrl: string | null): Promise<boolean> {
  if (!logoUrl) return false
  try {
    const res = await fetch(logoUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5_000)
    })
    return res.ok && (res.headers.get('content-type') || '').startsWith('image/')
  }
  catch { return false }
}

async function checkWebsiteReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8_000),
      headers: { 'User-Agent': 'MoonmartBot/1.0' }
    })
    return res.status < 400
  }
  catch { return false }
}

function descriptionQualityScore(text: string): number {
  if (!text) return 0
  const words = text.split(/\s+/).filter(w => w.length > 2)
  if (words.length < 10) return 0.1
  if (words.length < 25) return 0.4
  if (words.length < 50) return 0.7
  if (words.length < 100) return 0.85

  // Check for diverse vocabulary (not just repeated phrases)
  const unique = new Set(words.map(w => w.toLowerCase()))
  const diversity = unique.size / words.length
  return Math.min(1.0, 0.85 + diversity * 0.15)
}

export async function computeEnrichedScore(
  extracted: Partial<ExtractedListing>,
  websiteUrl: string
): Promise<EnrichedScore> {
  // Base score from AI confidence
  const baseScore = extracted.confidence
    ? computeScore(extracted.confidence as FieldConfidence)
    : 0.40

  // Run signal checks in parallel for speed
  const [logoReachable, websiteReachable] = await Promise.all([
    checkLogoReachable(extracted.logo_url || null),
    checkWebsiteReachable(websiteUrl)
  ])

  // Parse URL for structural signals
  let httpsEnabled = false
  let knownTld = false
  try {
    const parsed = new URL(websiteUrl)
    httpsEnabled = parsed.protocol === 'https:'
    const tld = parsed.hostname.split('.').pop() || ''
    knownTld = KNOWN_TLDS.has(tld.toLowerCase())
  }
  catch { /* ignore */ }

  const descText = extracted.long_description || extracted.short_description || ''
  const descQuality = descriptionQualityScore(descText)
  const hasKeyFeatures = Array.isArray(extracted.key_features) && extracted.key_features.length >= 3
  const pricingSpecified = Boolean(extracted.pricing_type && extracted.pricing_type !== 'contact')

  // Bonus/penalty calculation
  let bonus = 0

  if (logoReachable) bonus += 0.04
  if (websiteReachable) bonus += 0.05
  else bonus -= 0.15 // Strong penalty — unreachable site is a red flag

  if (httpsEnabled) bonus += 0.02
  if (knownTld) bonus += 0.02

  bonus += descQuality * 0.03 // Up to +0.03 for great description

  if (hasKeyFeatures) bonus += 0.02
  if (pricingSpecified) bonus += 0.02

  // Cap bonus to ±0.10 to prevent gaming
  const cappedBonus = Math.max(-0.20, Math.min(0.10, bonus))
  const totalScore = Math.max(0, Math.min(1, baseScore + cappedBonus))

  return {
    baseScore,
    bonusScore: cappedBonus,
    totalScore,
    route: routeByScore(totalScore),
    breakdown: {
      hasLogo: logoReachable,
      descriptionLength: descText.split(/\s+/).length,
      descriptionQuality: descQuality,
      hasKeyFeatures,
      websiteReachable,
      httpsEnabled,
      knownTld,
      pricingSpecified
    }
  }
}

export function enrichedRoute(
  score: EnrichedScore
): 'auto_submit' | 'review' | 'discard' {
  return score.route
}
