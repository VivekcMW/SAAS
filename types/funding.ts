/**
 * Funding Preferences Types for Moonmart Onboarding
 * Defines data structures for founder funding preferences
 */

export interface FundingPreferences {
  // Funding Interest
  seekingFunding: boolean;
  fundingStage: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c+' | 'bridge' | 'not-seeking' | '';
  fundingAmount: {
    min: number;
    max: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  };
  
  // Investor Preferences
  investorTypes: ('angel' | 'vc' | 'corporate-vc' | 'accelerator' | 'crowdfunding' | 'government')[];
  geographicPreference: string[];
  industryExpertise: string[];
  
  // Investment Details
  useOfFunds: ('product-development' | 'marketing' | 'hiring' | 'operations' | 'international-expansion' | 'research-development')[];
  currentRevenue: 'pre-revenue' | '0-10k' | '10k-50k' | '50k-100k' | '100k-500k' | '500k-1m' | '1m-5m' | '5m+';
  revenueProjections: {
    year1: number;
    year2: number;
    year3: number;
  };
  
  // Milestones & Traction
  currentTraction: string;
  keyMilestones: string[];
  previousFunding: {
    hasRaised: boolean;
    totalRaised: number;
    lastRound: string;
    lastRoundDate: string;
    investors: string[];
  };
  
  // Business Metrics
  businessMetrics: {
    monthlyActiveUsers: number;
    monthlyRecurringRevenue: number;
    customerCount: number;
    churnRate: number;
    growthRate: number;
  };
  
  // Team & Leadership
  teamStrengths: string[];
  advisors: Array<{
    name: string;
    title: string;
    company: string;
    expertise: string;
  }>;
  
  // Preferences
  preferredMeetingFormat: ('virtual' | 'in-person' | 'hybrid')[];
  timeframe: '1-3-months' | '3-6-months' | '6-12-months' | '12+ months';
  openToAdvice: boolean;
  openToMentorship: boolean;
  
  // Pitch Materials
  pitchDeck: string; // URL to pitch deck
  businessPlan: string; // URL to business plan
  financialProjections: string; // URL to financial projections
  
  // Communication Preferences
  preferredCommunication: ('email' | 'phone' | 'video-call' | 'in-person')[];
  timezone: string;
  availabilityNotes: string;
}

// Quick funding preferences for streamlined flows
export interface QuickFundingPreferences {
  seekingFunding: boolean;
  fundingStage: FundingPreferences['fundingStage'];
  fundingAmount: {
    min: number;
    max: number;
    currency: FundingPreferences['fundingAmount']['currency'];
  };
  investorTypes: FundingPreferences['investorTypes'];
  timeframe: FundingPreferences['timeframe'];
  useOfFunds: FundingPreferences['useOfFunds'];
}

// AI-suggested funding preferences
export interface AIFundingPreferences {
  seekingFunding: boolean;
  suggestedStage: FundingPreferences['fundingStage'];
  suggestedAmount: FundingPreferences['fundingAmount'];
  suggestedInvestorTypes: FundingPreferences['investorTypes'];
  confidence: number; // 0-100 confidence score
  reasoning: string; // AI explanation for suggestions
}

// Funding validation rules
export interface FundingValidationRules {
  required: boolean;
  minAmount: number;
  maxAmount: number;
  allowedStages: FundingPreferences['fundingStage'][];
  allowedCurrencies: FundingPreferences['fundingAmount']['currency'][];
}

// Default funding preferences
export const DEFAULT_FUNDING_PREFERENCES: FundingPreferences = {
  seekingFunding: false,
  fundingStage: '',
  fundingAmount: {
    min: 0,
    max: 0,
    currency: 'USD'
  },
  investorTypes: [],
  geographicPreference: [],
  industryExpertise: [],
  useOfFunds: [],
  currentRevenue: 'pre-revenue',
  revenueProjections: {
    year1: 0,
    year2: 0,
    year3: 0
  },
  currentTraction: '',
  keyMilestones: [],
  previousFunding: {
    hasRaised: false,
    totalRaised: 0,
    lastRound: '',
    lastRoundDate: '',
    investors: []
  },
  businessMetrics: {
    monthlyActiveUsers: 0,
    monthlyRecurringRevenue: 0,
    customerCount: 0,
    churnRate: 0,
    growthRate: 0
  },
  teamStrengths: [],
  advisors: [],
  preferredMeetingFormat: [],
  timeframe: '3-6-months',
  openToAdvice: true,
  openToMentorship: true,
  pitchDeck: '',
  businessPlan: '',
  financialProjections: '',
  preferredCommunication: ['email'],
  timezone: '',
  availabilityNotes: ''
};

// Funding stage definitions with descriptions
export const FUNDING_STAGES = {
  'pre-seed': {
    label: 'Pre-Seed',
    description: 'Very early stage, idea to prototype',
    typicalRange: { min: 10000, max: 500000 }
  },
  'seed': {
    label: 'Seed',
    description: 'Product-market fit, early traction',
    typicalRange: { min: 100000, max: 2000000 }
  },
  'series-a': {
    label: 'Series A',
    description: 'Proven business model, scaling',
    typicalRange: { min: 1000000, max: 15000000 }
  },
  'series-b': {
    label: 'Series B',
    description: 'Expanding market reach',
    typicalRange: { min: 5000000, max: 50000000 }
  },
  'series-c+': {
    label: 'Series C+',
    description: 'International expansion, acquisitions',
    typicalRange: { min: 20000000, max: 200000000 }
  },
  'bridge': {
    label: 'Bridge Round',
    description: 'Between major funding rounds',
    typicalRange: { min: 100000, max: 5000000 }
  },
  'not-seeking': {
    label: 'Not Seeking Funding',
    description: 'Self-funded or not interested in external funding',
    typicalRange: { min: 0, max: 0 }
  }
};

// Investor type definitions
export const INVESTOR_TYPES = {
  'angel': {
    label: 'Angel Investors',
    description: 'Individual high-net-worth investors'
  },
  'vc': {
    label: 'Venture Capital',
    description: 'Professional investment firms'
  },
  'corporate-vc': {
    label: 'Corporate VC',
    description: 'Strategic investors from corporations'
  },
  'accelerator': {
    label: 'Accelerators',
    description: 'Programs providing funding and mentorship'
  },
  'crowdfunding': {
    label: 'Crowdfunding',
    description: 'Public investment platforms'
  },
  'government': {
    label: 'Government Grants',
    description: 'Public sector funding and grants'
  }
};

// Use of funds options
export const USE_OF_FUNDS_OPTIONS = {
  'product-development': 'Product Development',
  'marketing': 'Marketing & Sales',
  'hiring': 'Team Expansion',
  'operations': 'Operations & Infrastructure',
  'international-expansion': 'International Expansion',
  'research-development': 'Research & Development'
};

// Revenue ranges for current revenue
export const REVENUE_RANGES = {
  'pre-revenue': 'Pre-Revenue',
  '0-10k': '$0 - $10K',
  '10k-50k': '$10K - $50K',
  '50k-100k': '$50K - $100K',
  '100k-500k': '$100K - $500K',
  '500k-1m': '$500K - $1M',
  '1m-5m': '$1M - $5M',
  '5m+': '$5M+'
};

// Validation helper functions
export const FundingValidation = {
  /**
   * Validate funding amount range
   */
  validateFundingAmount(min: number, max: number): boolean {
    return min >= 0 && max >= min && max <= 1000000000; // Max $1B
  },

  /**
   * Validate funding stage matches amount
   */
  validateStageAmount(stage: FundingPreferences['fundingStage'], amount: number): boolean {
    if (!stage || stage === 'not-seeking') return true;
    
    const stageInfo = FUNDING_STAGES[stage];
    if (!stageInfo) return false;
    
    return amount >= stageInfo.typicalRange.min && amount <= stageInfo.typicalRange.max * 2; // Allow 2x flexibility
  },

  /**
   * Check if funding preferences are complete
   */
  isComplete(preferences: Partial<FundingPreferences>): boolean {
    if (!preferences.seekingFunding) return true;
    
    return !!(
      preferences.fundingStage &&
      preferences.fundingAmount?.min &&
      preferences.fundingAmount?.max &&
      preferences.investorTypes?.length &&
      preferences.useOfFunds?.length &&
      preferences.timeframe
    );
  },

  /**
   * Calculate funding profile completeness score
   */
  calculateCompleteness(preferences: Partial<FundingPreferences>): number {
    if (!preferences.seekingFunding) return 100;
    
    const fields = [
      'fundingStage',
      'fundingAmount',
      'investorTypes',
      'useOfFunds',
      'currentRevenue',
      'currentTraction',
      'timeframe'
    ];
    
    let completed = 0;
    fields.forEach(field => {
      const value = preferences[field as keyof FundingPreferences];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        completed++;
      }
    });
    
    return Math.round((completed / fields.length) * 100);
  }
};
