/**
 * Category SEO Mapping Utility
 * Maps frontend category names to SEO keyword category IDs
 */

export const categoryToSeoMapping = {
  'Work & Productivity': 'productivity',
  'Marketing & Sales': 'marketing', 
  'Engineering & Development': 'engineering',
  'Design & Creative': 'design',
  'Finance': 'finance',
  'AI': 'ai',
  'Health & Fitness': 'healthcare',
  'E-commerce': 'ecommerce',
  'Education & Learning': 'education',
  'Social & Community': 'social'
} as const

export const seoToCategoryMapping = {
  'productivity': 'Work & Productivity',
  'marketing': 'Marketing & Sales',
  'engineering': 'Engineering & Development', 
  'design': 'Design & Creative',
  'finance': 'Finance',
  'ai': 'AI',
  'healthcare': 'Health & Fitness',
  'ecommerce': 'E-commerce',
  'education': 'Education & Learning',
  'social': 'Social & Community'
} as const

export type CategoryName = keyof typeof categoryToSeoMapping
export type SeoCategory = keyof typeof seoToCategoryMapping

export function getCategoryKeywords(categoryName: CategoryName) {
  return categoryToSeoMapping[categoryName]
}

export function getCategoryDisplayName(seoCategory: SeoCategory) {
  return seoToCategoryMapping[seoCategory]
}

export function isValidCategory(categoryName: string): categoryName is CategoryName {
  return categoryName in categoryToSeoMapping
}
