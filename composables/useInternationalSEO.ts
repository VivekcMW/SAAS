/**
 * International SEO Automation System
 * Implements multi-language and multi-region SEO optimization
 * Based on the Global SEO Strategy Phase 3
 */

export interface RegionalMarket {
  code: string
  name: string
  language: string
  currency: string
  timeZone: string
  searchEngine: 'google' | 'baidu' | 'yandex' | 'naver'
  localDomains: string[]
  culturalFactors: {
    businessStyle: string
    communicationPreference: string
    colorPreferences: string[]
    contentLength: 'short' | 'medium' | 'long'
  }
}

export interface LocalizedContent {
  title: string
  description: string
  keywords: string[]
  content: string
  culturalAdaptations: string[]
  localReferences: string[]
}

export const useInternationalSEO = () => {
  // Regional market configurations
  const regionalMarkets: RegionalMarket[] = [
    {
      code: 'us',
      name: 'United States',
      language: 'en-US',
      currency: 'USD',
      timeZone: 'America/New_York',
      searchEngine: 'google',
      localDomains: ['moonmart.ai'],
      culturalFactors: {
        businessStyle: 'direct-aggressive',
        communicationPreference: 'results-focused',
        colorPreferences: ['blue', 'green', 'red'],
        contentLength: 'medium'
      }
    },
    {
      code: 'de',
      name: 'Germany',
      language: 'de-DE',
      currency: 'EUR',
      timeZone: 'Europe/Berlin',
      searchEngine: 'google',
      localDomains: ['saasworld.de'],
      culturalFactors: {
        businessStyle: 'formal-detailed',
        communicationPreference: 'technical-precision',
        colorPreferences: ['blue', 'gray', 'black'],
        contentLength: 'long'
      }
    },
    {
      code: 'fr',
      name: 'France',
      language: 'fr-FR',
      currency: 'EUR',
      timeZone: 'Europe/Paris',
      searchEngine: 'google',
      localDomains: ['saasworld.fr'],
      culturalFactors: {
        businessStyle: 'formal-elegant',
        communicationPreference: 'relationship-focused',
        colorPreferences: ['blue', 'white', 'red'],
        contentLength: 'long'
      }
    },
    {
      code: 'es',
      name: 'Spain',
      language: 'es-ES',
      currency: 'EUR',
      timeZone: 'Europe/Madrid',
      searchEngine: 'google',
      localDomains: ['saasworld.es'],
      culturalFactors: {
        businessStyle: 'relationship-based',
        communicationPreference: 'warm-personal',
        colorPreferences: ['red', 'yellow', 'orange'],
        contentLength: 'medium'
      }
    },
    {
      code: 'pt',
      name: 'Brazil',
      language: 'pt-BR',
      currency: 'BRL',
      timeZone: 'America/Sao_Paulo',
      searchEngine: 'google',
      localDomains: ['moonmart.ai.br'],
      culturalFactors: {
        businessStyle: 'relationship-based',
        communicationPreference: 'enthusiastic-personal',
        colorPreferences: ['green', 'yellow', 'blue'],
        contentLength: 'medium'
      }
    },
    {
      code: 'jp',
      name: 'Japan',
      language: 'ja-JP',
      currency: 'JPY',
      timeZone: 'Asia/Tokyo',
      searchEngine: 'google',
      localDomains: ['saasworld.jp'],
      culturalFactors: {
        businessStyle: 'formal-hierarchical',
        communicationPreference: 'respectful-detailed',
        colorPreferences: ['blue', 'white', 'red'],
        contentLength: 'long'
      }
    },
    {
      code: 'cn',
      name: 'China',
      language: 'zh-CN',
      currency: 'CNY',
      timeZone: 'Asia/Shanghai',
      searchEngine: 'baidu',
      localDomains: ['saasworld.cn'],
      culturalFactors: {
        businessStyle: 'relationship-based',
        communicationPreference: 'harmony-focused',
        colorPreferences: ['red', 'gold', 'yellow'],
        contentLength: 'medium'
      }
    }
  ]

  // Localized keyword research and mapping
  const localKeywordMappings = {
    'software marketplace': {
      'en-US': ['software marketplace', 'business software directory', 'saas platform'],
      'de-DE': ['Software-Marktplatz', 'Business-Software-Verzeichnis', 'SaaS-Plattform'],
      'fr-FR': ['marché de logiciels', 'répertoire de logiciels métier', 'plateforme SaaS'],
      'es-ES': ['mercado de software', 'directorio de software empresarial', 'plataforma SaaS'],
      'pt-BR': ['mercado de software', 'diretório de software empresarial', 'plataforma SaaS'],
      'ja-JP': ['ソフトウェア市場', 'ビジネスソフトウェアディレクトリ', 'SaaSプラットフォーム'],
      'zh-CN': ['软件市场', '商业软件目录', 'SaaS平台']
    },
    'business software': {
      'en-US': ['business software', 'enterprise solutions', 'business tools'],
      'de-DE': ['Unternehmenssoftware', 'Enterprise-Lösungen', 'Business-Tools'],
      'fr-FR': ['logiciels métier', 'solutions d\'entreprise', 'outils métier'],
      'es-ES': ['software empresarial', 'soluciones empresariales', 'herramientas empresariales'],
      'pt-BR': ['software empresarial', 'soluções empresariais', 'ferramentas empresariais'],
      'ja-JP': ['ビジネスソフトウェア', 'エンタープライズソリューション', 'ビジネスツール'],
      'zh-CN': ['商业软件', '企业解决方案', '商业工具']
    },
    'software comparison': {
      'en-US': ['software comparison', 'tool comparison', 'software review'],
      'de-DE': ['Software-Vergleich', 'Tool-Vergleich', 'Software-Bewertung'],
      'fr-FR': ['comparaison de logiciels', 'comparaison d\'outils', 'évaluation de logiciels'],
      'es-ES': ['comparación de software', 'comparación de herramientas', 'revisión de software'],
      'pt-BR': ['comparação de software', 'comparação de ferramentas', 'revisão de software'],
      'ja-JP': ['ソフトウェア比較', 'ツール比較', 'ソフトウェアレビュー'],
      'zh-CN': ['软件比较', '工具比较', '软件评测']
    }
  }

  // Generate hreflang tags for international SEO
  const generateHreflangTags = (basePath: string) => {
    const hreflangTags: Array<{ rel: string; hreflang: string; href: string }> = []
    
    regionalMarkets.forEach(market => {
      const localizedPath = market.code === 'us' ? basePath : `/${market.code}${basePath}`
      hreflangTags.push({
        rel: 'alternate',
        hreflang: market.language,
        href: `https://moonmart.ai${localizedPath}`
      })
    })

    // Add x-default
    hreflangTags.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `https://moonmart.ai${basePath}`
    })

    return hreflangTags
  }

  // Cultural content adaptation
  const adaptContentForCulture = (content: string, marketCode: string): LocalizedContent => {
    const market = regionalMarkets.find(m => m.code === marketCode)
    if (!market) return { title: '', description: '', keywords: [], content, culturalAdaptations: [], localReferences: [] }

    const adaptations = []
    let adaptedContent = content

    // Business style adaptations
    if (market.culturalFactors.businessStyle === 'formal-detailed') {
      adaptations.push('Added formal language and detailed explanations')
      adaptedContent = adaptedContent.replace(/\b(great|awesome|amazing)\b/gi, 'professional')
    }

    if (market.culturalFactors.businessStyle === 'direct-aggressive') {
      adaptations.push('Enhanced direct calls-to-action and results focus')
      adaptedContent = adaptedContent.replace(/\bmight\b/gi, 'will')
    }

    if (market.culturalFactors.businessStyle === 'relationship-based') {
      adaptations.push('Added relationship-building language and community focus')
      adaptedContent = adaptedContent.replace(/\bbuy\b/gi, 'join our community and discover')
    }

    // Communication preference adaptations
    if (market.culturalFactors.communicationPreference === 'technical-precision') {
      adaptations.push('Increased technical detail and precision')
    }

    if (market.culturalFactors.communicationPreference === 'warm-personal') {
      adaptations.push('Added warm, personal tone and community references')
    }

    // Local references based on market
    const localReferences = []
    switch (marketCode) {
      case 'de':
        localReferences.push('GDPR compliance', 'German data protection', 'European standards')
        break
      case 'fr':
        localReferences.push('French business practices', 'European market', 'CNIL compliance')
        break
      case 'es':
        localReferences.push('Spanish business culture', 'EU regulations', 'Spanish market leaders')
        break
      case 'pt':
        localReferences.push('Brazilian market', 'Latin American business', 'Portuguese language support')
        break
      case 'jp':
        localReferences.push('Japanese business practices', 'Asian market', 'Kaizen methodology')
        break
      case 'cn':
        localReferences.push('Chinese market', 'Asian business culture', 'Local compliance')
        break
    }

    return {
      title: adaptedContent.split('\n')[0] || '',
      description: adaptedContent.split('\n')[1] || '',
      keywords: (localKeywordMappings['business software'] as Record<string, string[]>)[market.language] || [],
      content: adaptedContent,
      culturalAdaptations: adaptations,
      localReferences
    }
  }

  // Generate regional schema markup
  const generateRegionalSchema = (marketCode: string, contentType: string, data: any) => {
    const market = regionalMarkets.find(m => m.code === marketCode)
    if (!market) return {}

    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Moonmart',
      url: `https://moonmart.ai/${market.code === 'us' ? '' : `${market.code}/`}`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: market.code.toUpperCase(),
        addressLocality: getLocalAddress(marketCode).city,
        streetAddress: getLocalAddress(marketCode).street
      },
      areaServed: market.name,
      availableLanguage: market.language,
      currenciesAccepted: market.currency,
      priceRange: market.currency === 'USD' ? '$$' : market.currency === 'EUR' ? '€€' : '¥¥'
    }

    // Add content-specific schema
    if (contentType === 'software') {
      return {
        ...baseSchema,
        '@type': 'SoftwareApplication',
        name: data.name,
        description: data.description,
        operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
        applicationCategory: 'BusinessApplication',
        inLanguage: market.language,
        audience: {
          '@type': 'Audience',
          audienceType: 'Business Professionals',
          geographicArea: market.name
        }
      }
    }

    return baseSchema
  }

  // Local address information for each market
  const getLocalAddress = (marketCode: string) => {
    const addresses = {
      us: { city: 'San Francisco', street: '123 Tech Street' },
      de: { city: 'Berlin', street: 'Unter den Linden 1' },
      fr: { city: 'Paris', street: '123 Rue de la Tech' },
      es: { city: 'Madrid', street: 'Calle de la Tecnología 123' },
      pt: { city: 'São Paulo', street: 'Rua da Tecnologia, 123' },
      jp: { city: 'Tokyo', street: '1-2-3 Tech District' },
      cn: { city: 'Shanghai', street: '123 Technology Road' }
    }
    
    return addresses[marketCode as keyof typeof addresses] || addresses.us
  }

  // Regional SEO performance tracking
  const trackRegionalPerformance = (marketCode: string, metrics: any) => {
    const performanceData = {
      market: marketCode,
      timestamp: new Date().toISOString(),
      metrics: {
        organicTraffic: metrics.organicTraffic || 0,
        conversionRate: metrics.conversionRate || 0,
        averageSessionDuration: metrics.averageSessionDuration || 0,
        bounceRate: metrics.bounceRate || 0,
        keywordRankings: metrics.keywordRankings || {},
        localSearchVisibility: metrics.localSearchVisibility || 0
      },
      localFactors: {
        searchEngine: regionalMarkets.find(m => m.code === marketCode)?.searchEngine,
        timeZone: regionalMarkets.find(m => m.code === marketCode)?.timeZone,
        currency: regionalMarkets.find(m => m.code === marketCode)?.currency
      }
    }

    // Track regional performance in analytics
    if (import.meta.client && typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag
      gtag('event', 'regional_performance', {
        event_category: 'International SEO',
        event_label: marketCode,
        value: Math.round(performanceData.metrics.conversionRate * 100),
        custom_parameters: {
          market: marketCode,
          organic_traffic: performanceData.metrics.organicTraffic,
          search_engine: performanceData.localFactors.searchEngine
        }
      })
    }

    return performanceData
  }

  // Automatic translation quality assessment
  const assessTranslationQuality = (originalText: string, translatedText: string, _targetLanguage: string): number => {
    // Simple quality checks (in production, use professional translation APIs)
    let qualityScore = 0.5 // Base score

    // Check for preserved brand names and technical terms
    const brandTerms = ['Moonmart', 'SaaS', 'API', 'CRM', 'ERP']
    const preservedTerms = brandTerms.filter(term => 
      originalText.includes(term) && translatedText.includes(term)
    )
    qualityScore += (preservedTerms.length / brandTerms.length) * 0.2

    // Check length ratio (good translations usually maintain reasonable length)
    const lengthRatio = translatedText.length / originalText.length
    if (lengthRatio >= 0.7 && lengthRatio <= 1.5) {
      qualityScore += 0.2
    }

    // Check for HTML/markdown preservation
    const htmlTags = originalText.match(/<[^>]+>/g) || []
    const preservedHtml = htmlTags.filter(tag => translatedText.includes(tag))
    qualityScore += (preservedHtml.length / Math.max(htmlTags.length, 1)) * 0.1

    return Math.min(qualityScore, 1.0)
  }

  // SEO-optimized URL structure for international markets
  const generateInternationalURL = (basePath: string, marketCode: string, contentType?: string) => {
    const market = regionalMarkets.find(m => m.code === marketCode)
    if (!market) return basePath

    // Different URL strategies based on market
    if (market.code === 'us') {
      return basePath // Default English, no prefix
    }

    // Subdirectory approach for most markets
    let internationalPath = `/${market.code}${basePath}`

    // Add content type localization
    if (contentType) {
      const localizedPaths = {
        'comparison': {
          'de': '/vergleich',
          'fr': '/comparaison',
          'es': '/comparacion',
          'pt': '/comparacao',
          'ja': '/比較',
          'zh': '/比较'
        },
        'alternatives': {
          'de': '/alternativen',
          'fr': '/alternatives',
          'es': '/alternativas',
          'pt': '/alternativas',
          'ja': '/代替',
          'zh': '/替代品'
        }
      }

      const localizedPath = (localizedPaths[contentType as keyof typeof localizedPaths] as Record<string, string>)?.[market.language.split('-')[0]]
      if (localizedPath) {
        internationalPath = internationalPath.replace(`/${contentType}`, localizedPath)
      }
    }

    return internationalPath
  }

  return {
    regionalMarkets,
    localKeywordMappings,
    generateHreflangTags,
    adaptContentForCulture,
    generateRegionalSchema,
    trackRegionalPerformance,
    assessTranslationQuality,
    generateInternationalURL
  }
}
