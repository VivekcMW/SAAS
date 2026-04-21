/**
 * Lead Generation Optimization Composable
 * Implements conversion-focused features from the Global SEO Strategy
 */

export interface LeadMagnet {
  id: string
  title: string
  description: string
  type: 'ebook' | 'calculator' | 'template' | 'report' | 'webinar' | 'assessment'
  category: string
  downloadUrl: string
  formFields: string[]
  conversionRate: number
  priority: 'high' | 'medium' | 'low'
}

export interface ConversionPoint {
  id: string
  type: 'popup' | 'inline' | 'sidebar' | 'footer' | 'exit-intent'
  trigger: 'time' | 'scroll' | 'exit' | 'page-view' | 'interaction'
  timing: number
  targetAudience: string[]
  leadMagnet: LeadMagnet
  abTestVariant?: string
}

export const useLeadGeneration = () => {
  // High-value lead magnets for different audience segments
  const leadMagnets: LeadMagnet[] = [
    {
      id: 'saas-roi-calculator',
      title: 'SaaS ROI Calculator & Analysis Tool',
      description: 'Calculate the ROI of your software investments with our comprehensive analysis tool. Includes benchmarking data and optimization recommendations.',
      type: 'calculator',
      category: 'investment-analysis',
      downloadUrl: '/tools/roi-calculator',
      formFields: ['email', 'company', 'role', 'company-size'],
      conversionRate: 15.8,
      priority: 'high'
    },
    {
      id: 'digital-transformation-roadmap',
      title: '2025 Digital Transformation Roadmap',
      description: 'Step-by-step guide to digital transformation with software selection frameworks, implementation timelines, and ROI measurement strategies.',
      type: 'ebook',
      category: 'digital-transformation',
      downloadUrl: '/downloads/digital-transformation-roadmap-2025.pdf',
      formFields: ['email', 'company', 'role', 'industry'],
      conversionRate: 12.3,
      priority: 'high'
    },
    {
      id: 'saas-security-framework',
      title: 'Enterprise SaaS Security Assessment Framework',
      description: 'Comprehensive security checklist and assessment templates for evaluating SaaS vendors. Includes compliance mapping for GDPR, SOC2, and HIPAA.',
      type: 'template',
      category: 'security-compliance',
      downloadUrl: '/downloads/saas-security-framework.zip',
      formFields: ['email', 'company', 'role', 'company-size', 'compliance-requirements'],
      conversionRate: 18.5,
      priority: 'high'
    },
    {
      id: 'software-vendor-negotiation',
      title: 'Software Vendor Negotiation Tactics Guide',
      description: 'Proven strategies to negotiate better software deals. Includes contract templates, pricing benchmarks, and negotiation scripts.',
      type: 'ebook',
      category: 'procurement',
      downloadUrl: '/downloads/vendor-negotiation-guide.pdf',
      formFields: ['email', 'company', 'role', 'annual-software-budget'],
      conversionRate: 14.2,
      priority: 'high'
    },
    {
      id: 'saas-market-intelligence',
      title: '2025 Global SaaS Market Intelligence Report',
      description: 'Comprehensive analysis of SaaS market trends, funding data, and growth opportunities. 150+ pages of market intelligence and investment insights.',
      type: 'report',
      category: 'market-intelligence',
      downloadUrl: '/downloads/saas-market-report-2025.pdf',
      formFields: ['email', 'company', 'role', 'investment-focus'],
      conversionRate: 22.1,
      priority: 'high'
    },
    {
      id: 'software-stack-optimizer',
      title: 'Software Stack Optimization Assessment',
      description: 'Interactive assessment to identify redundancies, gaps, and optimization opportunities in your software stack. Get personalized recommendations.',
      type: 'assessment',
      category: 'optimization',
      downloadUrl: '/tools/stack-assessment',
      formFields: ['email', 'company', 'role', 'current-tools'],
      conversionRate: 16.7,
      priority: 'medium'
    }
  ]

  // Conversion points optimized for different page types
  const conversionPoints: ConversionPoint[] = [
    {
      id: 'homepage-hero-cta',
      type: 'inline',
      trigger: 'page-view',
      timing: 0,
      targetAudience: ['vc', 'business-leader', 'procurement'],
      leadMagnet: leadMagnets[4] // SaaS Market Intelligence Report
    },
    {
      id: 'comparison-page-exit-intent',
      type: 'popup',
      trigger: 'exit',
      timing: 0,
      targetAudience: ['software-buyer', 'it-manager'],
      leadMagnet: leadMagnets[0] // ROI Calculator
    },
    {
      id: 'category-page-scroll-trigger',
      type: 'sidebar',
      trigger: 'scroll',
      timing: 50, // 50% scroll
      targetAudience: ['business-analyst', 'decision-maker'],
      leadMagnet: leadMagnets[1] // Digital Transformation Roadmap
    },
    {
      id: 'app-page-engagement',
      type: 'inline',
      trigger: 'time',
      timing: 45000, // 45 seconds
      targetAudience: ['software-evaluator'],
      leadMagnet: leadMagnets[3] // Vendor Negotiation Guide
    },
    {
      id: 'enterprise-security-focus',
      type: 'popup',
      trigger: 'interaction',
      timing: 0,
      targetAudience: ['ciso', 'security-manager', 'compliance-officer'],
      leadMagnet: leadMagnets[2] // Security Framework
    }
  ]

  // A/B testing variants for conversion optimization
  const abTestVariants = {
    headlines: [
      'Get Free Market Intelligence Report',
      'Download 2025 SaaS Trends Report',
      'Access Premium Market Analysis',
      'Unlock Investment Insights'
    ],
    descriptions: [
      'Comprehensive analysis of 10,000+ SaaS companies with funding data and growth metrics.',
      'Essential market intelligence for VCs, investors, and business leaders.',
      'Data-driven insights to identify the next unicorn startups.',
      'Strategic market analysis with actionable investment recommendations.'
    ],
    ctaButtons: [
      'Download Free Report',
      'Get Market Intelligence',
      'Access Premium Data',
      'Unlock Insights Now'
    ],
    urgencyMessages: [
      'Limited time: Updated quarterly',
      '5,000+ executives have downloaded',
      'Join 10,000+ industry leaders',
      'Exclusive 2025 market data'
    ]
  }

  // Lead scoring system
  const calculateLeadScore = (data: Record<string, any>): number => {
    let score = 0

    // Company size scoring
    const companySizeScores = {
      '1-10': 10,
      '11-50': 25,
      '51-200': 40,
      '201-1000': 60,
      '1000+': 80
    }
    score += companySizeScores[data.companySize as keyof typeof companySizeScores] || 0

    // Role scoring
    const roleScores = {
      'ceo': 80,
      'cto': 75,
      'vp': 70,
      'director': 60,
      'manager': 40,
      'analyst': 30,
      'other': 10
    }
    score += roleScores[data.role as keyof typeof roleScores] || 0

    // Industry scoring
    const industryScores = {
      'technology': 80,
      'financial-services': 75,
      'healthcare': 70,
      'education': 50,
      'government': 40,
      'non-profit': 20
    }
    score += industryScores[data.industry as keyof typeof industryScores] || 0

    // Budget/investment focus scoring
    if (data.annualSoftwareBudget) {
      const budgetScores = {
        'under-10k': 10,
        '10k-50k': 30,
        '50k-100k': 50,
        '100k-500k': 70,
        'over-500k': 90
      }
      score += budgetScores[data.annualSoftwareBudget as keyof typeof budgetScores] || 0
    }

    return Math.min(score, 100) // Cap at 100
  }

  // Personalized content recommendations
  const getPersonalizedRecommendations = (userData: Record<string, any>) => {
    const { role, industry, companySize, interests } = userData

    const recommendations = []

    // Role-based recommendations
    if (role === 'ceo' || role === 'founder') {
      recommendations.push({
        type: 'content',
        title: 'CEO Guide to Software Investment ROI',
        url: '/guides/ceo-software-investment-roi',
        priority: 'high'
      })
    }

    if (role === 'cto' || role === 'vp-engineering') {
      recommendations.push({
        type: 'content',
        title: 'Technical Leader\'s Software Evaluation Framework',
        url: '/guides/technical-evaluation-framework',
        priority: 'high'
      })
    }

    // Industry-specific recommendations
    if (industry === 'financial-services') {
      recommendations.push({
        type: 'category',
        title: 'Fintech Solutions for Financial Services',
        url: '/category/financial-management',
        priority: 'high'
      })
    }

    if (industry === 'healthcare') {
      recommendations.push({
        type: 'category',
        title: 'Healthcare & Medical Software Solutions',
        url: '/category/healthcare-medical',
        priority: 'high'
      })
    }

    // Company size recommendations
    if (companySize === '1-10' || companySize === '11-50') {
      recommendations.push({
        type: 'collection',
        title: 'Best Software Tools for Startups & SMBs',
        url: '/startup-tools',
        priority: 'medium'
      })
    }

    if (companySize === '1000+') {
      recommendations.push({
        type: 'collection',
        title: 'Enterprise Software Solutions',
        url: '/enterprise',
        priority: 'high'
      })
    }

    return recommendations
  }

  // Email automation sequences
  const emailSequences = {
    'saas-buyer-nurture': [
      {
        day: 0,
        subject: 'Welcome! Your SaaS Market Intelligence Report',
        template: 'welcome-with-report',
        attachment: 'saas-market-report-2025.pdf'
      },
      {
        day: 2,
        subject: 'Top 5 Software Trends Every Leader Should Know',
        template: 'trends-insights',
        cta: 'Explore Trending Software'
      },
      {
        day: 5,
        subject: 'How [Company Name] Can Save 30% on Software Costs',
        template: 'cost-optimization',
        personalized: true,
        cta: 'Get Cost Analysis'
      },
      {
        day: 8,
        subject: 'Case Study: [Similar Company] Achieved 200% ROI',
        template: 'social-proof-case-study',
        cta: 'Read Full Case Study'
      },
      {
        day: 12,
        subject: 'Last Chance: Free Software Stack Audit',
        template: 'urgency-consultation',
        cta: 'Book Free Consultation'
      }
    ],
    'vc-investor-sequence': [
      {
        day: 0,
        subject: 'Your SaaS Investment Intelligence Report',
        template: 'vc-welcome',
        attachment: 'vc-investment-report.pdf'
      },
      {
        day: 3,
        subject: 'Emerging SaaS Unicorns: Q4 2025 Analysis',
        template: 'unicorn-analysis',
        cta: 'View Unicorn Tracker'
      },
      {
        day: 7,
        subject: 'Due Diligence Framework for SaaS Investments',
        template: 'due-diligence',
        cta: 'Download Framework'
      },
      {
        day: 14,
        subject: 'Exclusive: Private Deal Flow Access',
        template: 'vip-access',
        cta: 'Join VIP Network'
      }
    ]
  }

  // Conversion tracking and analytics
  const trackConversion = (conversionData: {
    leadMagnetId: string
    source: string
    variant?: string
    userData: Record<string, any>
  }) => {
    const leadScore = calculateLeadScore(conversionData.userData)
    
    // Track conversion event
    if (process.client && typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag
      gtag('event', 'generate_lead', {
        event_category: 'Lead Generation',
        event_label: conversionData.leadMagnetId,
        value: leadScore,
        custom_parameters: {
          lead_source: conversionData.source,
          ab_variant: conversionData.variant,
          lead_score: leadScore
        }
      })
    }

    // Store lead data for nurturing
    return {
      leadId: generateLeadId(),
      score: leadScore,
      source: conversionData.source,
      timestamp: new Date().toISOString(),
      nurturingSequence: determineNurturingSequence(conversionData.userData)
    }
  }

  const generateLeadId = (): string => {
    return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const determineNurturingSequence = (userData: Record<string, any>): string => {
    if (userData.role === 'vc' || userData.role === 'investor') {
      return 'vc-investor-sequence'
    }
    return 'saas-buyer-nurture'
  }

  // Dynamic content insertion for conversion optimization
  const insertConversionContent = (pageType: string, userSegment?: string) => {
    const contentTemplates = {
      'homepage': {
        'vc': {
          headline: 'Discover Tomorrow\'s Unicorn SaaS Companies',
          subheadline: 'Access exclusive market intelligence and investment data',
          cta: 'Get Investment Report',
          leadMagnet: 'saas-market-intelligence'
        },
        'business-leader': {
          headline: 'Transform Your Business with the Right Software',
          subheadline: 'Find, compare, and implement software solutions that drive growth',
          cta: 'Get Free ROI Calculator',
          leadMagnet: 'saas-roi-calculator'
        },
        'default': {
          headline: 'Find the Perfect Software for Your Business',
          subheadline: 'Compare 10,000+ software solutions with expert insights',
          cta: 'Explore Marketplace',
          leadMagnet: 'digital-transformation-roadmap'
        }
      },
      'comparison': {
        'default': {
          headline: 'Make Confident Software Decisions',
          subheadline: 'Get detailed comparison analysis and ROI calculations',
          cta: 'Download Comparison Report',
          leadMagnet: 'saas-roi-calculator'
        }
      }
    }

    const template = contentTemplates[pageType as keyof typeof contentTemplates]
    if (!template) return null

    const segment = userSegment || 'default'
    return template[segment as keyof typeof template] || template.default
  }

  return {
    leadMagnets,
    conversionPoints,
    abTestVariants,
    calculateLeadScore,
    getPersonalizedRecommendations,
    emailSequences,
    trackConversion,
    insertConversionContent
  }
}
