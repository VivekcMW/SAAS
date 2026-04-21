/**
 * Content & User Experience SEO Optimization
 * Enhances content quality and user experience for better search rankings
 */

export const useContentSEO = () => {
  // Content readability analysis
  const analyzeReadability = (content: string) => {
    // Simple readability metrics
    const words = content.split(/\s+/).length
    const sentences = content.split(/[.!?]+/).length
    const syllables = content.match(/[aeiouyAEIOUY]+/g)?.length || 0
    
    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
    
    let readabilityLevel = 'Graduate'
    if (fleschScore >= 90) readabilityLevel = 'Very Easy'
    else if (fleschScore >= 80) readabilityLevel = 'Easy'
    else if (fleschScore >= 70) readabilityLevel = 'Fairly Easy'
    else if (fleschScore >= 60) readabilityLevel = 'Standard'
    else if (fleschScore >= 50) readabilityLevel = 'Fairly Difficult'
    else if (fleschScore >= 30) readabilityLevel = 'Difficult'
    
    return {
      score: Math.round(fleschScore),
      level: readabilityLevel,
      words,
      sentences,
      avgWordsPerSentence: Math.round(words / sentences)
    }
  }

  // Keyword density optimization
  const analyzeKeywordDensity = (content: string, targetKeywords: string[]) => {
    const contentLower = content.toLowerCase()
    const words = contentLower.split(/\s+/)
    const totalWords = words.length
    
    const keywordAnalysis = targetKeywords.map(keyword => {
      const keywordLower = keyword.toLowerCase()
      const occurrences = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length
      const density = (occurrences / totalWords) * 100
      
      return {
        keyword,
        occurrences,
        density: Math.round(density * 100) / 100,
        optimal: density >= 1 && density <= 3,
        status: density < 1 ? 'under-optimized' : density > 3 ? 'over-optimized' : 'optimal'
      }
    })

    return {
      totalWords,
      keywords: keywordAnalysis,
      overallDensity: keywordAnalysis.reduce((sum, k) => sum + k.density, 0)
    }
  }

  // Content structure optimization
  const analyzeContentStructure = (content: string) => {
    const headings = {
      h1: (content.match(/<h1[^>]*>.*?<\/h1>/gi) || []).length,
      h2: (content.match(/<h2[^>]*>.*?<\/h2>/gi) || []).length,
      h3: (content.match(/<h3[^>]*>.*?<\/h3>/gi) || []).length,
      h4: (content.match(/<h4[^>]*>.*?<\/h4>/gi) || []).length,
      h5: (content.match(/<h5[^>]*>.*?<\/h5>/gi) || []).length,
      h6: (content.match(/<h6[^>]*>.*?<\/h6>/gi) || []).length
    }

    const lists = (content.match(/<[uo]l[^>]*>.*?<\/[uo]l>/gi) || []).length
    const images = (content.match(/<img[^>]*>/gi) || []).length
    const links = (content.match(/<a[^>]*href[^>]*>.*?<\/a>/gi) || []).length
    const internalLinks = (content.match(/<a[^>]*href="\/[^"]*"[^>]*>.*?<\/a>/gi) || []).length
    const externalLinks = links - internalLinks

    return {
      headings,
      hasProperH1: headings.h1 === 1,
      hasH2Structure: headings.h2 > 0,
      lists,
      images,
      links: {
        total: links,
        internal: internalLinks,
        external: externalLinks,
        ratio: internalLinks / (externalLinks || 1)
      },
      recommendations: generateStructureRecommendations(headings, lists, images, { total: links, internal: internalLinks, external: externalLinks })
    }
  }

  // Generate content recommendations
  const generateStructureRecommendations = (
    headings: Record<string, number>, 
    lists: number, 
    images: number, 
    links: { total: number; internal: number; external: number }
  ) => {
    const recommendations = []

    if (headings.h1 !== 1) {
      recommendations.push('Use exactly one H1 tag per page')
    }
    if (headings.h2 === 0) {
      recommendations.push('Add H2 headings to improve content structure')
    }
    if (lists === 0) {
      recommendations.push('Consider adding bullet points or numbered lists for better readability')
    }
    if (images === 0) {
      recommendations.push('Add relevant images to enhance user engagement')
    }
    if (links.internal < 2) {
      recommendations.push('Add more internal links to improve site navigation')
    }
    if (links.external === 0) {
      recommendations.push('Consider adding authoritative external links to support claims')
    }

    return recommendations
  }

  // Generate content topics for AI optimization
  const generateContentTopics = (category: string, subcategory?: string) => {
    const topicTemplates = {
      'project-management': [
        'project planning and execution',
        'team collaboration and communication',
        'task management and tracking',
        'resource allocation and scheduling',
        'project reporting and analytics',
        'agile and scrum methodologies',
        'project budget management',
        'risk management and mitigation'
      ],
      'crm': [
        'customer relationship management',
        'sales pipeline management',
        'lead generation and nurturing',
        'customer support and service',
        'contact management and organization',
        'sales automation and workflows',
        'customer analytics and insights',
        'marketing automation integration'
      ],
      'accounting': [
        'financial reporting and analysis',
        'bookkeeping and transaction management',
        'tax preparation and compliance',
        'invoicing and billing automation',
        'expense tracking and management',
        'payroll processing and management',
        'budgeting and forecasting',
        'audit preparation and compliance'
      ],
      'marketing': [
        'digital marketing strategies',
        'content marketing and creation',
        'social media management',
        'email marketing campaigns',
        'SEO and search optimization',
        'paid advertising and PPC',
        'marketing analytics and ROI',
        'lead generation and conversion'
      ]
    }

    const baseTopics = topicTemplates[category as keyof typeof topicTemplates] || [
      'business automation and efficiency',
      'data analytics and reporting',
      'user experience and interface',
      'integration and connectivity',
      'security and compliance',
      'scalability and performance'
    ]

    if (subcategory) {
      return baseTopics.map(topic => `${subcategory} ${topic}`)
    }

    return baseTopics
  }

  // Semantic content optimization
  const optimizeSemanticContent = (content: string, primaryKeyword: string) => {
    // Generate semantic keywords and related terms
    const semanticKeywords = generateSemanticKeywords(primaryKeyword)
    
    // Analyze current semantic coverage
    const semanticCoverage = semanticKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    )

    const missingSemantic = semanticKeywords.filter(keyword => 
      !content.toLowerCase().includes(keyword.toLowerCase())
    )

    return {
      semanticKeywords,
      coverage: {
        covered: semanticCoverage,
        missing: missingSemantic,
        percentage: Math.round((semanticCoverage.length / semanticKeywords.length) * 100)
      },
      recommendations: missingSemantic.slice(0, 5).map(keyword => 
        `Consider adding "${keyword}" to improve semantic relevance`
      )
    }
  }

  // Generate semantic keywords
  const generateSemanticKeywords = (primaryKeyword: string) => {
    const semanticMappings: Record<string, string[]> = {
      'project management': [
        'task management', 'team collaboration', 'project planning', 'workflow automation',
        'gantt charts', 'milestone tracking', 'resource management', 'time tracking',
        'project dashboard', 'team productivity', 'project templates', 'project reporting'
      ],
      'crm software': [
        'customer management', 'sales tracking', 'lead management', 'contact database',
        'sales pipeline', 'customer support', 'sales automation', 'customer analytics',
        'deal tracking', 'sales forecasting', 'customer segmentation', 'sales reporting'
      ],
      'accounting software': [
        'financial management', 'bookkeeping', 'invoice management', 'expense tracking',
        'financial reporting', 'tax management', 'payroll processing', 'budget planning',
        'cash flow management', 'financial analytics', 'audit trails', 'compliance tracking'
      ]
    }

    return semanticMappings[primaryKeyword.toLowerCase()] || [
      'business software', 'enterprise solution', 'digital tools', 'productivity software',
      'business automation', 'cloud application', 'SaaS platform', 'business intelligence'
    ]
  }

  // FAQ generation for voice search optimization
  const generateFAQContent = (category: string, appName?: string) => {
    const faqTemplates = {
      general: [
        {
          question: `What is ${appName || category} software?`,
          answer: `${appName || category} software is a digital solution designed to help businesses ${category === 'project-management' ? 'manage projects and collaborate effectively' : 'streamline their operations and improve efficiency'}.`
        },
        {
          question: `How much does ${appName || category} software cost?`,
          answer: `${appName || category} software pricing varies depending on features and team size, typically ranging from $10-100+ per user per month. Many solutions offer free trials to test functionality.`
        },
        {
          question: `What are the key features of ${appName || category} software?`,
          answer: `Key features include ${category === 'project-management' ? 'task management, team collaboration, project tracking, and reporting capabilities' : 'core functionality, integrations, analytics, and user management tools'}.`
        },
        {
          question: `Is ${appName || category} software suitable for small businesses?`,
          answer: `Yes, many ${appName || category} solutions are designed to scale from small businesses to enterprises, with flexible pricing and feature sets to match different needs.`
        },
        {
          question: `How do I choose the best ${appName || category} software?`,
          answer: `Consider your specific needs, budget, team size, required integrations, and growth plans. Take advantage of free trials to test usability and features before committing.`
        }
      ]
    }

    return faqTemplates.general.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return {
    analyzeReadability,
    analyzeKeywordDensity,
    analyzeContentStructure,
    generateContentTopics,
    optimizeSemanticContent,
    generateFAQContent,
    generateSemanticKeywords
  }
}
