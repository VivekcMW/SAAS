/**
 * VC-Focused SEO Composable
 * Implements SEO optimizations specifically for targeting Venture Capitalists
 */

export const useVCSEO = () => {
  
  /**
   * Generate VC-optimized meta tags for any page
   */
  const generateVCMeta = (config: {
    title: string;
    description: string;
    keywords?: string[];
    page?: string;
    hasInvestmentOpportunities?: boolean;
    companyStage?: 'startup' | 'growth' | 'enterprise';
    marketSize?: string;
  }) => {
    const vcKeywords = [
      'venture capital',
      'investment opportunities',
      'saas startups',
      'emerging companies',
      'funding rounds',
      'market intelligence',
      'startup discovery',
      'investment analysis',
      'growth companies',
      'saas investment'
    ];

    const combinedKeywords = [
      ...(config.keywords || []),
      ...vcKeywords
    ].join(', ');

    // Add VC-specific language to descriptions
    const vcDescription = config.hasInvestmentOpportunities 
      ? `${config.description} Discover investment-ready startups and emerging market opportunities for venture capital.`
      : `${config.description} Essential platform for VCs and investors to research market trends and discover high-growth SaaS companies.`;

    return {
      title: config.title,
      meta: [
        { name: 'description', content: vcDescription },
        { name: 'keywords', content: combinedKeywords },
        
        // VC-specific meta tags
        { name: 'investment-focus', content: 'saas, technology, venture capital' },
        { name: 'target-audience', content: 'venture capitalists, investors, fund managers' },
        { name: 'market-intelligence', content: 'true' },
        
        // Open Graph for VC sharing
        { property: 'og:title', content: config.title },
        { property: 'og:description', content: vcDescription },
        { property: 'og:type', content: 'website' },
        
        // Twitter cards for VC engagement
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: config.title },
        { name: 'twitter:description', content: vcDescription },
        
        // Investment-specific tags
        ...(config.hasInvestmentOpportunities ? [
          { name: 'investment-opportunities', content: 'available' },
          { name: 'funding-stage', content: config.companyStage || 'various' }
        ] : []),
        
        ...(config.marketSize ? [
          { name: 'market-size', content: config.marketSize }
        ] : [])
      ]
    };
  };

  /**
   * Generate investment-focused structured data
   */
  const generateInvestmentSchema = (config: {
    type: 'marketplace' | 'company' | 'category' | 'article';
    name: string;
    description: string;
    url: string;
    fundingStatus?: 'seeking' | 'funded' | 'bootstrap';
    marketCategory?: string;
    growthMetrics?: {
      userGrowth?: string;
      revenueGrowth?: string;
      marketShare?: string;
    };
    investmentHighlights?: string[];
  }) => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": config.type === 'company' ? 'Organization' : 'WebPage',
      "name": config.name,
      "description": config.description,
      "url": config.url
    };

    // Add investment-specific properties
    if (config.type === 'company') {
      return {
        ...baseSchema,
        "@type": "Organization",
        "foundingDate": new Date().getFullYear() - 2, // Placeholder
        "industry": config.marketCategory || "Software",
        "investmentOpportunity": config.fundingStatus === 'seeking',
        "additionalProperty": [
          ...(config.investmentHighlights?.map(highlight => ({
            "@type": "PropertyValue",
            "name": "Investment Highlight",
            "value": highlight
          })) || []),
          ...(config.growthMetrics ? Object.entries(config.growthMetrics).map(([key, value]) => ({
            "@type": "PropertyValue", 
            "name": key.replace(/([A-Z])/g, ' $1').toLowerCase(),
            "value": value
          })) : [])
        ]
      };
    }

    return baseSchema;
  };

  /**
   * Add VC-focused internal linking suggestions
   */
  const generateVCInternalLinks = (currentPage: string, _availablePages: string[]) => {
    const vcLinkingStrategy = {
      homepage: [
        { text: "emerging startups", url: "/marketplace?filter=seeking-funding" },
        { text: "investment opportunities", url: "/marketplace?filter=high-growth" },
        { text: "market leaders", url: "/marketplace?filter=top-performing" }
      ],
      marketplace: [
        { text: "investment-ready companies", url: "/marketplace?filter=seeking-funding" },
        { text: "high-growth potential", url: "/marketplace?filter=growth-stage" },
        { text: "market intelligence", url: "/insights" }
      ],
      company: [
        { text: "similar investment opportunities", url: "/marketplace?category={category}" },
        { text: "market analysis", url: "/insights/{category}" },
        { text: "competitive landscape", url: "/marketplace?category={category}&sort=funding" }
      ]
    };

    return vcLinkingStrategy[currentPage as keyof typeof vcLinkingStrategy] || [];
  };

  /**
   * Generate VC-optimized search suggestions
   */
  const generateVCSearchSuggestions = (category?: string) => {
    const baseVCSuggestions = [
      "startups seeking funding",
      "high-growth saas companies", 
      "emerging market leaders",
      "venture capital opportunities",
      "scalable saas solutions",
      "investment-ready startups",
      "fastest growing companies",
      "market disruption opportunities"
    ];

    const categorySuggestions = category ? [
      `${category} startups seeking funding`,
      `emerging ${category} companies`,
      `${category} market leaders`,
      `${category} investment opportunities`
    ] : [];

    return [...categorySuggestions, ...baseVCSuggestions];
  };

  /**
   * Add investment status badges to company listings
   */
  const addInvestmentBadges = (companies: any[]) => {
    return companies.map(company => ({
      ...company,
      investmentBadges: generateInvestmentBadges(company)
    }));
  };

  /**
   * Generate investment-focused badges
   */
  const generateInvestmentBadges = (company: any) => {
    const badges = [];

    // Funding status badges
    if (company.fundingStatus === 'seeking') {
      badges.push({
        type: 'seeking-funding',
        label: 'Seeking Investment',
        color: 'blue',
        priority: 1
      });
    }

    if (company.fundingStatus === 'recently-funded') {
      badges.push({
        type: 'recently-funded',
        label: 'Recently Funded',
        color: 'green',
        priority: 2
      });
    }

    // Growth indicators
    if (company.growthRate && parseFloat(company.growthRate) > 100) {
      badges.push({
        type: 'high-growth',
        label: 'High Growth',
        color: 'orange',
        priority: 3
      });
    }

    // Market position
    if (company.marketPosition === 'leader') {
      badges.push({
        type: 'market-leader',
        label: 'Market Leader',
        color: 'purple',
        priority: 4
      });
    }

    if (company.isEmerging) {
      badges.push({
        type: 'emerging',
        label: 'Emerging Leader',
        color: 'yellow',
        priority: 5
      });
    }

    return badges.sort((a, b) => a.priority - b.priority);
  };

  /**
   * Generate VC-focused content enhancements
   */
  const enhanceContentForVCs = (content: string, context: {
    type: 'description' | 'features' | 'benefits';
    hasInvestmentPotential?: boolean;
    marketSize?: string;
    growthRate?: string;
  }) => {
    const vcEnhancements = {
      description: [
        context.hasInvestmentPotential ? "High-growth potential with scalable business model." : "",
        context.marketSize ? `Addressing the ${context.marketSize} market opportunity.` : "",
        context.growthRate ? `Demonstrating ${context.growthRate} growth trajectory.` : ""
      ].filter(Boolean),
      
      features: [
        "Scalable technology infrastructure",
        "Strong competitive moat",
        "Proven market traction",
        "Enterprise-ready solution"
      ],
      
      benefits: [
        "Market disruption potential",
        "Strong unit economics",
        "Defensible market position", 
        "Clear path to profitability"
      ]
    };

    const enhancements = vcEnhancements[context.type] || [];
    return enhancements.length > 0 ? `${content} ${enhancements.join(' ')}` : content;
  };

  /**
   * Track VC-specific analytics events
   */
  const trackVCEngagement = (event: {
    type: 'page_view' | 'company_view' | 'contact_form' | 'report_download';
    page: string;
    companyId?: string;
    category?: string;
    isVCReferral?: boolean;
  }) => {
    // This would integrate with your analytics platform
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `vc_${event.type}`, {
        page_location: event.page,
        company_id: event.companyId,
        category: event.category,
        is_vc_referral: event.isVCReferral
      });
    }
  };

  return {
    generateVCMeta,
    generateInvestmentSchema,
    generateVCInternalLinks,
    generateVCSearchSuggestions,
    addInvestmentBadges,
    generateInvestmentBadges,
    enhanceContentForVCs,
    trackVCEngagement
  };
};

// Types for TypeScript support
export interface VCOptimizationConfig {
  title: string;
  description: string;
  keywords?: string[];
  page?: string;
  hasInvestmentOpportunities?: boolean;
  companyStage?: 'startup' | 'growth' | 'enterprise';
  marketSize?: string;
}

export interface InvestmentSchemaConfig {
  type: 'marketplace' | 'company' | 'category' | 'article';
  name: string;
  description: string;
  url: string;
  fundingStatus?: 'seeking' | 'funded' | 'bootstrap';
  marketCategory?: string;
  growthMetrics?: {
    userGrowth?: string;
    revenueGrowth?: string;
    marketShare?: string;
  };
  investmentHighlights?: string[];
}
