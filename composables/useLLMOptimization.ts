/**
 * LLM Content Optimization Composable
 * Enhances content structure for better LLM understanding and indexing
 */

interface ContentStructure {
  heading: string
  level: number
  content: string
  keywords: string[]
  entities?: string[]
  sentiment?: 'positive' | 'neutral' | 'negative'
}

interface LLMOptimizedContent {
  title: string
  description: string
  content: ContentStructure[]
  entities: string[]
  topics: string[]
  readingTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  categories: string[]
  tags: string[]
}

export const useLLMOptimization = () => {
  
  /**
   * Structure content for optimal LLM understanding
   */
  const optimizeContentForLLM = (content: string, metadata: {
    title: string
    category?: string
    type?: 'article' | 'guide' | 'documentation' | 'review' | 'comparison' | 'homepage' | 'marketplace' | 'category'
    targetAudience?: string[]
  }): LLMOptimizedContent => {
    
    // Extract headings and structure
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const headings: ContentStructure[] = []
    let match
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const heading = match[2].trim()
      
      headings.push({
        heading,
        level,
        content: '', // Will be populated with section content
        keywords: extractKeywords(heading),
        entities: extractEntities(heading)
      })
    }
    
    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)
    
    // Extract entities and topics
    const entities = extractEntities(content)
    const topics = extractTopics(content, metadata.category)
    
    // Determine difficulty based on technical terms and complexity
    const difficulty = determineDifficulty(content)
    
    return {
      title: metadata.title,
      description: generateOptimizedDescription(content, metadata),
      content: headings,
      entities,
      topics,
      readingTime,
      difficulty,
      categories: metadata.category ? [metadata.category] : [],
      tags: generateSemanticTags(content, metadata)
    }
  }

  /**
   * Extract relevant keywords from text
   */
  const extractKeywords = (text: string): string[] => {
    // Common SaaS and business keywords
    const saasKeywords = [
      'software', 'application', 'platform', 'tool', 'service', 'solution',
      'productivity', 'automation', 'integration', 'api', 'cloud', 'saas',
      'subscription', 'enterprise', 'business', 'workflow', 'dashboard',
      'analytics', 'reporting', 'collaboration', 'management', 'optimization'
    ]
    
    const words = text.toLowerCase().split(/\s+/)
    return words.filter(word => 
      saasKeywords.includes(word) || 
      (word.length > 4 && !commonWords.includes(word))
    ).slice(0, 10)
  }

  /**
   * Extract named entities (companies, products, technologies)
   */
  const extractEntities = (text: string): string[] => {
    // Common SaaS companies and products
    const entities = [
      'Salesforce', 'HubSpot', 'Slack', 'Microsoft', 'Google', 'Amazon',
      'Shopify', 'Zoom', 'Figma', 'Notion', 'Trello', 'Asana', 'Jira',
      'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP'
    ]
    
    return entities.filter(entity => 
      text.toLowerCase().includes(entity.toLowerCase())
    )
  }

  /**
   * Extract semantic topics based on content and category
   */
  const extractTopics = (content: string, category?: string): string[] => {
    const topicMap: Record<string, string[]> = {
      'ai-machine-learning': [
        'artificial intelligence', 'machine learning', 'deep learning',
        'natural language processing', 'computer vision', 'automation'
      ],
      'design-creative': [
        'user interface', 'user experience', 'graphic design', 'prototyping',
        'wireframing', 'visual design', 'brand identity'
      ],
      'project-management': [
        'task management', 'team collaboration', 'project planning',
        'resource allocation', 'milestone tracking', 'agile methodology'
      ],
      'ecommerce': [
        'online store', 'payment processing', 'inventory management',
        'customer experience', 'conversion optimization', 'digital marketing'
      ],
      'productivity': [
        'time management', 'task automation', 'workflow optimization',
        'document collaboration', 'communication tools', 'efficiency'
      ]
    }
    
    const baseTopics = category ? topicMap[category] || [] : []
    
    // Extract additional topics from content
    const contentTopics = Object.values(topicMap).flat()
      .filter(topic => content.toLowerCase().includes(topic.toLowerCase()))
    
    return [...new Set([...baseTopics, ...contentTopics])].slice(0, 8)
  }

  /**
   * Determine content difficulty level
   */
  const determineDifficulty = (content: string): 'beginner' | 'intermediate' | 'advanced' => {
    const technicalTerms = [
      'api', 'integration', 'webhook', 'oauth', 'authentication', 'encryption',
      'microservices', 'container', 'docker', 'kubernetes', 'devops',
      'machine learning', 'artificial intelligence', 'algorithm', 'neural network'
    ]
    
    const businessTerms = [
      'roi', 'kpi', 'analytics', 'metrics', 'dashboard', 'reporting',
      'conversion', 'optimization', 'automation', 'workflow'
    ]
    
    const technicalCount = technicalTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length
    
    const businessCount = businessTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length
    
    if (technicalCount >= 5) return 'advanced'
    if (technicalCount >= 2 || businessCount >= 4) return 'intermediate'
    return 'beginner'
  }

  /**
   * Generate semantic tags for better categorization
   */
  const generateSemanticTags = (content: string, metadata: any): string[] => {
    const tags: string[] = []
    
    // Add category-based tags
    if (metadata.category) {
      tags.push(metadata.category.replace(/-/g, ' '))
    }
    
    // Add content-type tags
    if (metadata.type) {
      tags.push(metadata.type)
    }
    
    // Add feature-based tags
    const featureTags = [
      'free trial', 'enterprise', 'small business', 'startup',
      'mobile app', 'web app', 'desktop app', 'api access',
      'integration', 'automation', 'analytics', 'reporting'
    ]
    
    featureTags.forEach(tag => {
      if (content.toLowerCase().includes(tag)) {
        tags.push(tag)
      }
    })
    
    return tags.slice(0, 12)
  }

  /**
   * Generate LLM-optimized description
   */
  const generateOptimizedDescription = (content: string, metadata: any): string => {
    // Extract first meaningful paragraph or create from title
    const paragraphMatch = content.match(/^(?!#)(.{50,300}?)(?:\.|!|\?)/m)
    if (paragraphMatch) {
      return paragraphMatch[1].trim()
    }
    
    // Fallback: generate from title and category
    const category = metadata.category ? metadata.category.replace(/-/g, ' ') : 'software'
    return `Discover ${metadata.title} - a powerful ${category} solution that helps businesses improve productivity and streamline operations.`
  }

  /**
   * Generate structured data for rich snippets
   */
  const generateRichSnippets = (content: LLMOptimizedContent, pageType: string) => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": getSchemaType(pageType),
      "name": content.title,
      "description": content.description,
      "keywords": content.topics.join(', '),
      "about": content.categories.map(cat => ({
        "@type": "Thing",
        "name": cat
      }))
    }

    // Add specific properties based on content type
    if (pageType === 'software') {
      return {
        ...baseSchema,
        "@type": "SoftwareApplication",
        "applicationCategory": content.categories[0] || "Business Software",
        "operatingSystem": "Web, iOS, Android",
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock"
        }
      }
    }

    if (pageType === 'article') {
      return {
        ...baseSchema,
        "@type": "Article",
        "headline": content.title,
        "wordCount": content.content.reduce((acc, section) => acc + section.content.split(' ').length, 0),
        "timeRequired": `PT${content.readingTime}M`,
        "educationalLevel": content.difficulty,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://saasworld.com" + useRoute().path
        }
      }
    }

    return baseSchema
  }

  const getSchemaType = (pageType: string): string => {
    const typeMap: Record<string, string> = {
      'software': 'SoftwareApplication',
      'article': 'Article',
      'guide': 'HowTo',
      'review': 'Review',
      'comparison': 'Article',
      'category': 'CollectionPage'
    }
    return typeMap[pageType] || 'WebPage'
  }

  // Common words to filter out
  const commonWords = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
    'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
    'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
    'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
    'one', 'all', 'would', 'there', 'their', 'what', 'so',
    'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
    'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just',
    'him', 'know', 'take', 'people', 'into', 'year', 'your',
    'good', 'some', 'could', 'them', 'see', 'other', 'than',
    'then', 'now', 'look', 'only', 'come', 'its', 'over',
    'think', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'first', 'well', 'way', 'even', 'new',
    'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
  ]

  return {
    optimizeContentForLLM,
    extractKeywords,
    extractEntities,
    extractTopics,
    generateSemanticTags,
    generateRichSnippets
  }
}
