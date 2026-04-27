/**
 * moonmart Score™ — composite quality metric
 *
 * Formula:
 *   Review Quality        30% — rating + authenticity + volume
 *   Integration Ecosystem 20% — integration count
 *   Support Responsiveness 20% — review mentions + verified flag
 *   Price-to-Value Ratio  20% — pricing vs rating correlation
 *   Security & Compliance 10% — certifications count
 *
 * Returns 0–10 (one decimal place).
 */

interface ScoreInput {
  rating: number           // 0-5
  reviewCount: number
  authenticityScore?: number  // 0-1 avg, optional
  integrationCount?: number
  verified?: boolean       // moonmart-verified vendor
  pricingType?: string     // 'free' | 'paid' | 'contact' | 'trial'
  pricingValue?: number    // monthly USD
  certifications?: string[]
  featured?: boolean
}

export function computeMoonmartScore(input: ScoreInput): number {
  // ── 1. Review Quality (30%) ───────────────────────────────────────────────
  const ratingNorm = Math.min(input.rating / 5, 1) // 0-1
  const volumeBonus = Math.min(input.reviewCount / 500, 1) * 0.2 // 0-0.2 bonus
  const authBonus = (input.authenticityScore ?? 0.7) * 0.1
  const reviewQuality = Math.min(ratingNorm * 0.7 + volumeBonus + authBonus, 1)

  // ── 2. Integration Ecosystem (20%) ───────────────────────────────────────
  const integCount = input.integrationCount ?? 0
  const integScore = Math.min(integCount / 50, 1) // 50 integrations = perfect

  // ── 3. Support Responsiveness (20%) ──────────────────────────────────────
  // Proxy: verified flag + high review count signals active vendor
  const verifiedBonus = input.verified ? 0.3 : 0
  const reviewActivityBonus = Math.min(input.reviewCount / 200, 0.7)
  const supportScore = Math.min(verifiedBonus + reviewActivityBonus, 1)

  // ── 4. Price-to-Value Ratio (20%) ─────────────────────────────────────────
  let priceValue = 0.6 // neutral baseline
  if (input.pricingType === 'free') {
    priceValue = 0.9 // free is great value
  } else if (input.pricingValue != null) {
    // High rating + low price = great value
    const ratingFactor = input.rating / 5
    // Normalize price: $0–$50 = good, $50–$200 = medium, $200+ = reduced
    const priceNorm = input.pricingValue <= 50
      ? 0.9
      : input.pricingValue <= 200
        ? 0.65
        : 0.4
    priceValue = ratingFactor * 0.6 + priceNorm * 0.4
  } else if (input.pricingType === 'contact') {
    // Enterprise — assume value if highly rated
    priceValue = input.rating >= 4 ? 0.7 : 0.5
  }

  // ── 5. Security & Compliance (10%) ───────────────────────────────────────
  const certCount = input.certifications?.length ?? 0
  const securityScore = Math.min(certCount / 5, 1) // 5 certs = perfect

  // ── Weighted sum ──────────────────────────────────────────────────────────
  const raw =
    reviewQuality * 0.30 +
    integScore   * 0.20 +
    supportScore * 0.20 +
    priceValue   * 0.20 +
    securityScore * 0.10

  // Scale to 0-10, min floor of 3 for any published app
  const score = Math.max(3, raw * 10)
  return Math.round(score * 10) / 10
}

/**
 * Compute and optionally cache the moonmart Score for a DB app record.
 */
export function getMoonmartScoreLabel(score: number): string {
  if (score >= 9) return 'Exceptional'
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Very Good'
  if (score >= 6) return 'Good'
  if (score >= 5) return 'Average'
  return 'Below Average'
}
