/**
 * SEO Keywords Master Index
 * Centralized management of all SEO keywords for SaaSWorld marketplace
 * 
 * This file exports all category-specific keyword sets for easy maintenance
 * and provides utility functions for keyword management across the platform.
 */

import type { CategoryKeywords, GlobalKeywords } from './types'
import { designKeywords } from './design-creative'
import { financeKeywords } from './finance-accounting'
import { businessKeywords } from './business-operations'
import { marketingKeywords } from './marketing-sales'
import { productivityKeywords } from './productivity-tools'
import { ecommerceKeywords } from './ecommerce'
import { healthcareKeywords } from './healthcare-medical'
import { educationKeywords } from './education-learning'
import { engineeringKeywords } from './engineering-development'
import { aiKeywords } from './ai-machine-learning'
import { socialKeywords } from './social-community'
// import { communicationKeywords } from './communication-social'
// import { travelKeywords } from './travel-transportation'
// import { entertainmentKeywords } from './entertainment-media'
// import { realestateKeywords } from './realestate-property'
// import { agricultureKeywords } from './agriculture-food'
// import { automotiveKeywords } from './automotive-transportation'
// import { securityKeywords } from './security-privacy'
// import { utilitiesKeywords } from './utilities-tools'
// import { nonprofitKeywords } from './nonprofit-government'

// Re-export types for external use
export type { CategoryKeywords, GlobalKeywords } from './types'

// Global platform keywords that apply across all categories
export const globalKeywords: GlobalKeywords = {
  platformKeywords: [
    'saas platform',
    'software marketplace',
    'business software',
    'cloud solutions',
    'digital tools',
    'online platform',
    'enterprise software',
    'web applications',
    'software directory',
    'business applications'
  ],
  businessTypes: [
    'small business',
    'enterprise',
    'startup',
    'freelancer',
    'agency',
    'corporation',
    'solopreneur',
    'team',
    'organization',
    'company'
  ],
  solutions: [
    'software solution',
    'digital solution',
    'business solution',
    'automated solution',
    'integrated solution',
    'comprehensive solution',
    'scalable solution',
    'affordable solution',
    'professional solution',
    'custom solution'
  ],
  features: [
    'user-friendly',
    'cloud-based',
    'mobile-responsive',
    'secure',
    'scalable',
    'integrated',
    'automated',
    'real-time',
    'analytics',
    'dashboard',
    'reporting',
    'collaboration',
    'workflow',
    'customizable',
    'API integration'
  ],
  targetAudience: [
    'business owners',
    'entrepreneurs',
    'managers',
    'professionals',
    'teams',
    'developers',
    'marketers',
    'designers',
    'analysts',
    'executives'
  ],
  actionKeywords: [
    'find',
    'discover',
    'compare',
    'choose',
    'select',
    'buy',
    'get',
    'try',
    'demo',
    'review',
    'evaluate',
    'implement',
    'integrate',
    'optimize',
    'streamline',
    'search',
    'explore',
    'browse',
    'lookup',
    'research'
  ],
  comparisonKeywords: [
    'vs',
    'versus',
    'alternative',
    'comparison',
    'review',
    'best',
    'top',
    'leading',
    'popular',
    'recommended',
    'rated',
    'featured',
    'what is',
    'which is better',
    'how to choose',
    'explain',
    'difference between'
  ],
  locationModifiers: [
    'USA',
    'United States',
    'Canada',
    'UK',
    'Europe',
    'Australia',
    'global',
    'international',
    'worldwide',
    'local',
    'regional',
    'national'
  ],
  industryModifiers: [
    '2024',
    '2025',
    'modern',
    'latest',
    'advanced',
    'professional',
    'business',
    'commercial',
    'enterprise',
    'premium',
    'industry-leading',
    'cutting-edge',
    'innovative',
    'next-generation',
    'state-of-the-art'
  ],
  // Perplexity.ai and conversational search optimization
  conversationalKeywords: [
    'what is the best',
    'how to find',
    'which software should I use',
    'what are the benefits of',
    'how does it work',
    'explain the difference',
    'recommend software for',
    'help me choose',
    'what is better',
    'why should I use',
    'features and benefits',
    'pros and cons of',
    'suitable for small business',
    'enterprise grade solution',
    'affordable option for',
    'free alternative to'
  ],
  // Natural language patterns for AI search optimization
  questionPatterns: [
    'What is the best [category] software?',
    'How do I choose [category] tools?',
    'Which [software] is better for [use case]?',
    'What are the top [category] solutions?',
    'How much does [software] cost?',
    'Is [software] worth it?',
    'What features does [software] have?',
    'Can [software] integrate with [other software]?',
    'What are alternatives to [software]?',
    'How to implement [category] software?'
  ]
}

// Export all category keywords (only for categories that have been created)
export const allCategoryKeywords = {
  design: designKeywords,
  finance: financeKeywords,
  business: businessKeywords,
  marketing: marketingKeywords,
  productivity: productivityKeywords,
  ecommerce: ecommerceKeywords,
  healthcare: healthcareKeywords,
  education: educationKeywords,
  engineering: engineeringKeywords,
  ai: aiKeywords,
  social: socialKeywords
  // Additional categories will be added as they are created:
  // communication: communicationKeywords,
  // travel: travelKeywords,
  // entertainment: entertainmentKeywords,
  // realestate: realestateKeywords,
  // agriculture: agricultureKeywords,
  // automotive: automotiveKeywords,
  // security: securityKeywords,
  // utilities: utilitiesKeywords,
  // nonprofit: nonprofitKeywords
}

// Utility functions for keyword management
export function getKeywordsForCategory(categoryId: string): CategoryKeywords | null {
  return allCategoryKeywords[categoryId as keyof typeof allCategoryKeywords] || null
}

export function getAllKeywords(): string[] {
  const allKeywords: string[] = []
  
  // Add global keywords
  Object.values(globalKeywords).forEach(keywordArray => {
    allKeywords.push(...keywordArray)
  })
  
  // Add category keywords
  Object.values(allCategoryKeywords).forEach(category => {
    allKeywords.push(...category.primaryKeywords)
    allKeywords.push(...category.secondaryKeywords)
    allKeywords.push(...category.longTailKeywords)
  })
  
  // Remove duplicates and return
  return Array.from(new Set(allKeywords))
}

export function generateMetaKeywords(categoryId?: string, subcategoryPath?: string): string {
  const keywords: string[] = [...globalKeywords.platformKeywords]
  
  if (categoryId) {
    const categoryKeywords = getKeywordsForCategory(categoryId)
    if (categoryKeywords) {
      keywords.push(...categoryKeywords.primaryKeywords.slice(0, 5))
      keywords.push(...categoryKeywords.secondaryKeywords.slice(0, 3))
    }
  }
  
  return keywords.join(', ')
}

export function generatePageTitle(categoryName: string, subcategoryName?: string): string {
  const baseTitle = 'SaaSWorld'
  const platformKeywords = ['Software', 'Tools', 'Solutions', 'Platform']
  
  if (subcategoryName) {
    return `${subcategoryName} | ${categoryName} ${platformKeywords[0]} | ${baseTitle}`
  }
  
  return `${categoryName} ${platformKeywords[1]} | ${baseTitle} - Business Software Marketplace`
}

export function generateMetaDescription(categoryName: string, subcategoryName?: string): string {
  const baseDesc = 'Discover and compare the best'
  const endDesc = 'software solutions on SaaSWorld. Find the perfect tools for your business needs with reviews, comparisons, and expert recommendations.'
  
  if (subcategoryName) {
    return `${baseDesc} ${subcategoryName.toLowerCase()} tools and ${categoryName.toLowerCase()} ${endDesc}`
  }
  
  return `${baseDesc} ${categoryName.toLowerCase()} ${endDesc}`
}
