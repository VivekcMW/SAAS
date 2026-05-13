/**
 * SEO Utility Functions
 * Helper functions for SEO optimization and content generation
 */

import { allCategoryKeywords, globalKeywords } from '~/seo/keywords/index'

// Generate slug from text
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Generate meta description with proper length
export const generateMetaDescription = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text
  
  const truncated = text.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

// Generate keywords string from array
export const generateKeywordsString = (keywords: string[], maxLength: number = 250): string => {
  let result = ''
  const uniqueKeywords = [...new Set(keywords)]
  
  for (const keyword of uniqueKeywords) {
    if ((result + keyword).length > maxLength) break
    result += (result ? ', ' : '') + keyword
  }
  
  return result
}

// Extract keywords from content
export const extractKeywordsFromContent = (content: string, minLength: number = 3): string[] => {
  const commonWords = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'shall', 'this', 'that', 'these', 'those'
  ]
  
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= minLength && !commonWords.includes(word))
  
  const frequency: Record<string, number> = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)
}

// Generate hreflang tags for international SEO
export const generateHreflangTags = (path: string, locales: string[] = ['en', 'es', 'fr', 'de', 'pt']) => {
  const tags: Array<{ rel: string; hreflang: string; href: string }> = []
  
  locales.forEach(locale => {
    tags.push({
      rel: 'alternate',
      hreflang: locale,
      href: `https://moonmart.ai${locale === 'en' ? '' : `/${locale}`}${path}`
    })
  })
  
  // Add x-default for default language
  tags.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: `https://moonmart.ai${path}`
  })
  
  return tags
}

// Generate Open Graph image URL
export const generateOGImage = (title: string, category?: string): string => {
  const baseUrl = 'https://moonmart.ai/api/og'
  const params = new URLSearchParams({
    title: title.substring(0, 100),
    ...(category && { category })
  })
  
  return `${baseUrl}?${params.toString()}`
}

// Check if URL is optimized for SEO
export const isUrlSEOFriendly = (url: string): boolean => {
  const seoChecks = [
    url.length <= 100, // URL length
    !/[A-Z]/.test(url), // No uppercase
    !/\s/.test(url), // No spaces
    !url.includes('_'), // No underscores
    /^[a-z0-9\-/]+$/.test(url), // Only lowercase, numbers, hyphens, slashes
    !url.includes('//'), // No double slashes (except protocol)
    !url.endsWith('/') || url === '/' // No trailing slash except root
  ]
  
  return seoChecks.every(check => check)
}

// Generate canonical URL
export const generateCanonicalUrl = (path: string): string => {
  const baseUrl = 'https://moonmart.ai'
  const cleanPath = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  return `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`
}

// Generate page title with brand
export const generatePageTitle = (title: string, category?: string, includeYear: boolean = false): string => {
  const brand = 'Moonmart'
  const year = includeYear ? ` ${new Date().getFullYear()}` : ''
  
  if (category) {
    return `${title} | ${category} Software${year} | ${brand}`
  }
  
  return `${title}${year} | ${brand}`
}

// Generate social media optimized title
export const generateSocialTitle = (title: string, maxLength: number = 60): string => {
  if (title.length <= maxLength) return title
  
  const truncated = title.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

// Get related keywords for content
export const getRelatedKeywords = (categoryId: string, count: number = 10): string[] => {
  const category = allCategoryKeywords[categoryId as keyof typeof allCategoryKeywords]
  if (!category) return []
  
  const allKeywords = [
    ...category.primaryKeywords,
    ...category.secondaryKeywords,
    ...globalKeywords.platformKeywords.slice(0, 3),
    ...globalKeywords.solutions.slice(0, 3)
  ]
  
  return allKeywords.slice(0, count)
}

// Generate robots meta content
export const generateRobotsContent = (options: {
  index?: boolean
  follow?: boolean
  noarchive?: boolean
  nosnippet?: boolean
  noimageindex?: boolean
  maxSnippet?: number
  maxImagePreview?: 'none' | 'standard' | 'large'
  maxVideoPreview?: number
} = {}): string => {
  const {
    index = true,
    follow = true,
    noarchive = false,
    nosnippet = false,
    noimageindex = false,
    maxSnippet = -1,
    maxImagePreview = 'large',
    maxVideoPreview = -1
  } = options
  
  const directives = []
  
  directives.push(index ? 'index' : 'noindex')
  directives.push(follow ? 'follow' : 'nofollow')
  
  if (noarchive) directives.push('noarchive')
  if (nosnippet) directives.push('nosnippet')
  if (noimageindex) directives.push('noimageindex')
  
  if (maxSnippet !== -1) directives.push(`max-snippet:${maxSnippet}`)
  if (maxImagePreview !== 'large') directives.push(`max-image-preview:${maxImagePreview}`)
  if (maxVideoPreview !== -1) directives.push(`max-video-preview:${maxVideoPreview}`)
  
  return directives.join(', ')
}

// Validate SEO configuration
export const validateSEOConfig = (config: {
  title?: string
  description?: string
  keywords?: string
  url?: string
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!config.title) {
    errors.push('Title is required')
  } else if (config.title.length > 60) {
    errors.push('Title should be under 60 characters')
  } else if (config.title.length < 10) {
    errors.push('Title should be at least 10 characters')
  }
  
  if (!config.description) {
    errors.push('Description is required')
  } else if (config.description.length > 160) {
    errors.push('Description should be under 160 characters')
  } else if (config.description.length < 50) {
    errors.push('Description should be at least 50 characters')
  }
  
  if (config.keywords && config.keywords.length > 250) {
    errors.push('Keywords should be under 250 characters')
  }
  
  if (config.url && !isUrlSEOFriendly(config.url)) {
    errors.push('URL is not SEO-friendly')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
