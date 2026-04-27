/**
 * moonmart Score™ — composite quality metric (shared util, works in browser + server)
 * Re-exported from server/utils/moonmartScore.ts logic for use in Vue pages.
 */

export interface MoonmartScoreInput {
  rating: number
  reviewCount: number
  authenticityScore?: number
  integrationCount?: number
  verified?: boolean
  pricingType?: string
  pricingValue?: number
  certifications?: string[]
  featured?: boolean
}

export function computeMoonmartScore(input: MoonmartScoreInput): number {
  const ratingNorm = Math.min(input.rating / 5, 1)
  const volumeBonus = Math.min(input.reviewCount / 500, 1) * 0.2
  const authBonus = (input.authenticityScore ?? 0.7) * 0.1
  const reviewQuality = Math.min(ratingNorm * 0.7 + volumeBonus + authBonus, 1)

  const integCount = input.integrationCount ?? 0
  const integScore = Math.min(integCount / 50, 1)

  const verifiedBonus = input.verified ? 0.3 : 0
  const reviewActivityBonus = Math.min(input.reviewCount / 200, 0.7)
  const supportScore = Math.min(verifiedBonus + reviewActivityBonus, 1)

  let priceValue = 0.6
  if (input.pricingType === 'free') {
    priceValue = 0.9
  } else if (input.pricingValue != null) {
    const ratingFactor = input.rating / 5
    const priceNorm = input.pricingValue <= 50 ? 0.9 : input.pricingValue <= 200 ? 0.65 : 0.4
    priceValue = ratingFactor * 0.6 + priceNorm * 0.4
  } else if (input.pricingType === 'contact') {
    priceValue = input.rating >= 4 ? 0.7 : 0.5
  }

  const certCount = input.certifications?.length ?? 0
  const securityScore = Math.min(certCount / 5, 1)

  const raw =
    reviewQuality * 0.30 +
    integScore    * 0.20 +
    supportScore  * 0.20 +
    priceValue    * 0.20 +
    securityScore * 0.10

  return Math.round(Math.max(3, raw * 10) * 10) / 10
}

export function getMoonmartScoreLabel(score: number): string {
  if (score >= 9) return 'Exceptional'
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Very Good'
  if (score >= 6) return 'Good'
  if (score >= 5) return 'Average'
  return 'Below Average'
}
