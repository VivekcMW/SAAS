import type { EnhancedAppData } from '~/types/enhanced-app';

// Simplified enhanced app data with core missing fields
export async function getEnhancedAppData(appId: string): Promise<EnhancedAppData | null> {
  // Simulate database lookup delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Base app lookup from existing mock data
  const baseApps = {
    'app-001': {
      id: 'app-001',
      name: 'SalesForce CRM',
      company_name: 'Salesforce Inc.',
      short_description: 'Complete customer relationship management platform with analytics, automation, and integrations.',
      status: 'published' as const
    },
    'app-002': {
      id: 'app-002', 
      name: 'Asana Tasks',
      company_name: 'Asana Inc.',
      short_description: 'Advanced project management tool with team collaboration features.',
      status: 'published' as const
    }
  };

  const baseApp = baseApps[appId as keyof typeof baseApps];
  if (!baseApp) return null;

  // Add missing fields structure - focusing on key analytics and engagement data
  const enhancedApp: Partial<EnhancedAppData> = {
    ...baseApp,
    // Core missing fields for data collection
    reviews: [
      {
        id: `rev-${appId}-1`,
        userName: 'John Smith',
        rating: 5,
        title: 'Excellent Solution',
        content: 'This app has transformed our workflow. Highly recommended!',
        verified: true,
        helpfulVotes: 15,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        status: 'approved' as const
      }
    ],
    featuredBadges: [
      {
        id: `badge-${appId}-1`,
        name: 'Editor\'s Choice',
        type: 'editor_choice' as const,
        description: 'Selected by our editorial team for excellence',
        iconUrl: '/icons/trophy.svg',
        color: '#FFD700',
        criteria: 'High user satisfaction and innovative features',
        assignedAt: new Date('2024-01-01'),
        assignedBy: 'Editorial Team'
      }
    ],
    usageAnalytics: {
      views: appId === 'app-001' ? 15420 : 8350,
      uniqueVisitors: appId === 'app-001' ? 8945 : 4200,
      downloads: appId === 'app-001' ? 3250 : 1890,
      clickThroughRate: 0.18,
      conversionRate: 0.08,
      averageSessionDuration: 245,
      bounceRate: 0.32,
      traffic: {
        organic: 0.45,
        paid: 0.25,
        direct: 0.20,
        referral: 0.10
      },
      retention: {
        day1: 0.85,
        day7: 0.72,
        day30: 0.68,
        day90: 0.45
      },
      engagement: {
        timeOnPage: 185,
        pagesPerSession: 4.2,
        returnVisitorRate: 0.35
      },
      demographics: {
        countries: [
          { name: 'United States', percentage: 35 },
          { name: 'United Kingdom', percentage: 15 }
        ],
        industries: [
          { name: 'Technology', percentage: 28 },
          { name: 'Finance', percentage: 22 }
        ],
        companySize: {
          'small': 25,
          'medium': 45,
          'large': 30
        }
      },
      trends: {
        weekly: [120, 135, 145, 160, 155, 170, 180],
        monthly: [3200, 3450, 3800, 4100]
      }
    },
    performance: {
      uptime: 99.9,
      responseTime: 150,
      loadTime: 1.2,
      errorRate: 0.001,
      lastChecked: new Date(),
      status: 'operational' as const,
      healthScore: 98
    },
    security: {
      certifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR Compliant'],
      lastAudit: new Date('2023-12-01'),
      vulnerabilities: 0,
      score: 95,
      encryption: true,
      twoFactorAuth: true
    },
    successStories: [
      {
        id: `story-${appId}-1`,
        title: appId === 'app-001' ? '300% Sales Increase' : '50% Faster Delivery',
        company: appId === 'app-001' ? 'TechCorp Solutions' : 'Creative Agency Pro',
        industry: appId === 'app-001' ? 'Technology' : 'Marketing',
        challenge: 'Improving team productivity and workflow management',
        solution: `Implemented ${baseApp.name} with custom workflows and automation`,
        results: [
          appId === 'app-001' ? '300% increase in sales productivity' : '50% faster project delivery',
          'Improved team collaboration',
          'Better workflow visibility'
        ],
        metrics: [
          {
            metric: appId === 'app-001' ? 'Sales Productivity' : 'Project Delivery Speed',
            improvement: appId === 'app-001' ? '300%' : '50%',
            timeframe: '6 months'
          }
        ],
        featured: true,
        publishedAt: new Date('2024-01-01')
      }
    ],
    marketPosition: {
      ranking: {
        category: appId === 'app-001' ? 1 : 3,
        overall: appId === 'app-001' ? 1 : 8,
        trending: appId === 'app-001' ? 2 : 1
      },
      competitors: [
        {
          name: appId === 'app-001' ? 'HubSpot CRM' : 'Monday.com',
          comparison: 'better' as const,
          differentiators: ['Advanced features', 'Better ecosystem']
        }
      ],
      marketShare: appId === 'app-001' ? 23.8 : 12.5,
      industryPosition: appId === 'app-001' ? 'Market Leader' : 'Strong Competitor'
    },
    roi: {
      averageROI: appId === 'app-001' ? 341 : 215,
      paybackPeriod: appId === 'app-001' ? 8 : 6,
      costSavings: appId === 'app-001' ? 25000 : 12000,
      productivityGains: appId === 'app-001' ? 35 : 25,
      timeframe: 'annually' as const
    },
    competitiveAdvantages: [
      appId === 'app-001' ? 'World\'s #1 CRM platform' : 'Intuitive user interface',
      appId === 'app-001' ? 'Extensive ecosystem' : 'Powerful timeline views',
      'Enterprise-grade security'
    ],
    useCases: [
      {
        title: appId === 'app-001' ? 'Sales Management' : 'Project Management',
        description: appId === 'app-001' ? 'Streamline sales processes' : 'Coordinate team projects',
        benefits: ['Improved efficiency', 'Better visibility']
      }
    ],
    roadmap: [
      {
        quarter: 'Q2 2024',
        features: ['Enhanced Analytics', 'Mobile Improvements'],
        status: 'planned' as const
      }
    ],
    compliance: {
      regulations: ['GDPR', 'CCPA'],
      certifications: ['SOC 2 Type II', 'ISO 27001'],
      lastAudit: new Date('2023-12-01'),
      score: 95
    },
    training: {
      available: true,
      formats: ['Online Courses', 'Documentation'],
      certificationProgram: appId === 'app-001',
      cost: 'Free',
      duration: appId === 'app-001' ? '20 hours' : '8 hours'
    }
  };

  return enhancedApp as EnhancedAppData;
}
