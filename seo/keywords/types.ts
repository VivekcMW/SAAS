/**
 * SEO Keywords Type Definitions
 * Shared TypeScript interfaces for SEO keyword management
 */

export interface CategoryKeywords {
  category: string
  categoryId: string
  primaryKeywords: string[]
  secondaryKeywords: string[]
  longTailKeywords: string[]
  brandKeywords: string[]
  locationKeywords: string[]
  subcategories: {
    [key: string]: {
      name: string
      path: string
      keywords: string[]
      longTail: string[]
      searchVolume: 'high' | 'medium' | 'low'
      competition: 'high' | 'medium' | 'low'
    }
  }
}

export interface GlobalKeywords {
  platformKeywords: string[]
  businessTypes: string[]
  solutions: string[]
  features: string[]
  targetAudience: string[]
  actionKeywords: string[]
  comparisonKeywords: string[]
  locationModifiers: string[]
  industryModifiers: string[]
  // Perplexity.ai and conversational search optimization
  conversationalKeywords: string[]
  questionPatterns: string[]
}
