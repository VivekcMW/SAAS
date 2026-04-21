/**
 * Server-side Product Data Transformation Utilities
 * These functions can be used in server API routes
 */

import type { FundingPreferences } from '~/types/funding';

// OnboardingFormData interface - duplicated here for server-side use
export interface OnboardingFormData {
  // Basic Info
  productName: string;
  productWebsite: string;
  shortDescription: string;
  category: string | string[];
  searchKeywords: string;
  
  // Company Info
  companyName: string;
  companyWebsite: string;
  companySize: string;
  companyLocation: string;
  founded: string;
  industries: string[];
  
  // Social Links
  socialLinks: Record<string, string>;
  
  // Product Details
  fullDescription: string;
  features: Array<{ title: string; description: string }> | string[];
  pricingModels: string[];
  pricingDetails: string;
  targetAudience: string;
  
  // Platform Support & Application Stage
  platformSupport: string[];
  applicationStage: string;
  developmentStage: string;
  businessModel: string;
  
  // App-Specific Information
  appVersion: string;
  supportedLanguages: string[];
  integrations: string[];
  apiAvailable: boolean;
  webhookSupport: boolean;
  
  // App Store Links & Distribution
  appStoreLinks: Record<string, string>;
  
  // Features & Support Information
  includedFeatures: string[];
  supportChannels: string[];
  documentationUrl: string;
  helpCenterUrl: string;
  
  // Media Assets
  logoUrl: string;
  screenshots: Array<{ url: string; caption: string }>;
  videos: Array<{ url: string; title: string }>;
  
  // Testimonials
  testimonials: Array<{
    author: string;
    company: string;
    role: string;
    content: string;
  }>;
  
  // Team Information
  founder: {
    name: string;
    title: string;
    bio: string;
    profilePicture: string;
  };
  
  teamMembers: Array<{
    name: string;
    role: string;
    bio: string;
    profilePicture: string;
  }>;
  
  // Contact Information
  contact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  
  // Funding Preferences (new)
  fundingPreferences?: FundingPreferences;
}

// Application interface for transformed data
export interface Application {
  id: string;
  name: string;
  logo: string;
  provider: string;
  description: string;
  longDescription: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  pricing: {
    type: 'free' | 'trial' | 'paid' | 'contact';
    value?: number;
    period?: string;
  };
  category: string;
  featured: boolean;
  trending: boolean;
  screenshots: Array<{ url: string; caption: string }>;
  features: string[];
  included: string[];
  pricingFeatures: string[];
  integrations: string[];
  lastUpdated: string;
  version: string;
  languages: string[];
  website: string;
  companyInfo: {
    size: string;
    location: string;
    founded: string;
    industries: string[];
    socialLinks: Record<string, string>;
  };
  platformSupport: string[];
  developmentStage: string;
  businessModel: string;
  apiAvailable: boolean;
  webhookSupport: boolean;
  downloadLinks: Record<string, string>;
  supportChannels: string[];
  documentation: string;
  helpCenter: string;
  videos: Array<{ url: string; title: string }>;
  testimonials: Array<{
    author: string;
    company: string;
    role: string;
    content: string;
  }>;
  founder: {
    name: string;
    title: string;
    bio: string;
    profilePicture: string;
  };
  team: Array<{
    name: string;
    role: string;
    bio: string;
    profilePicture: string;
  }>;
  contact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  submissionDate: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'published' | 'rejected';
  
  // Funding information (new)
  fundingInfo?: FundingPreferences;
}

/**
 * Transform onboarding form data to application format
 */
export function transformOnboardingToApp(formData: OnboardingFormData): Application {
  const currentDate = new Date().toISOString();
  
  return {
    id: '', // Will be set by the calling function
    name: formData.productName || '',
    logo: formData.logoUrl || '/assets/images/placeholder-app-logo.svg',
    provider: formData.companyName || '',
    description: formData.shortDescription || '',
    longDescription: formData.fullDescription || formData.shortDescription || '',
    rating: 0, // New apps start with no rating
    reviewCount: 0,
    tags: generateTags(formData),
    pricing: transformPricingData(formData),
    category: Array.isArray(formData.category) ? formData.category[0] || 'other' : formData.category || 'other',
    featured: false, // Admin decision
    trending: false, // Based on analytics
    screenshots: formData.screenshots || [],
    features: formData.features?.map(f => typeof f === 'string' ? f : f.title).filter(Boolean) || [],
    included: formData.includedFeatures || [],
    pricingFeatures: formData.pricingDetails ? [formData.pricingDetails] : [],
    integrations: formData.integrations || [],
    lastUpdated: currentDate,
    version: formData.appVersion || '1.0.0',
    languages: formData.supportedLanguages || ['English'],
    website: formData.productWebsite || formData.companyWebsite || '',
    companyInfo: {
      size: formData.companySize || '',
      location: formData.companyLocation || '',
      founded: formData.founded || '',
      industries: formData.industries || [],
      socialLinks: formData.socialLinks || {}
    },
    platformSupport: formData.platformSupport || [],
    developmentStage: formData.applicationStage || formData.developmentStage || 'live',
    businessModel: formData.businessModel || 'subscription',
    apiAvailable: formData.apiAvailable || false,
    webhookSupport: formData.webhookSupport || false,
    downloadLinks: formData.appStoreLinks || {},
    supportChannels: formData.supportChannels || [],
    documentation: formData.documentationUrl || '',
    helpCenter: formData.helpCenterUrl || '',
    videos: formData.videos || [],
    testimonials: formData.testimonials || [],
    founder: formData.founder || {
      name: '',
      title: '',
      bio: '',
      profilePicture: ''
    },
    team: formData.teamMembers || [],
    contact: formData.contact || {
      name: '',
      email: '',
      phone: '',
      role: ''
    },
    submissionDate: currentDate,
    status: 'submitted',
    fundingInfo: formData.fundingPreferences
  };
}

/**
 * Generate SEO-friendly tags from form data
 */
function generateTags(formData: OnboardingFormData): string[] {
  const tags: string[] = [];
  
  // Add categories as tags
  if (formData.category) {
    if (Array.isArray(formData.category)) {
      tags.push(...formData.category);
    } else {
      tags.push(formData.category);
    }
  }
  
  // Add industries as tags
  if (formData.industries) {
    tags.push(...formData.industries);
  }
  
  // Add business model as tag
  if (formData.businessModel) {
    tags.push(formData.businessModel);
  }
  
  // Add platform support as tags
  if (formData.platformSupport) {
    tags.push(...formData.platformSupport);
  }
  
  // Add keywords from search keywords field
  if (formData.searchKeywords) {
    const keywords = formData.searchKeywords.split(',').map(k => k.trim()).filter(Boolean);
    tags.push(...keywords);
  }
  
  // Remove duplicates and convert to lowercase
  const uniqueTags = [...new Set(tags.map(tag => tag.toLowerCase()))];
  
  return uniqueTags.slice(0, 10); // Limit to 10 tags
}

/**
 * Transform pricing data from form to display format
 */
function transformPricingData(formData: OnboardingFormData): {
  type: 'free' | 'trial' | 'paid' | 'contact';
  value?: number;
  period?: string;
} {
  if (!formData.pricingModels || formData.pricingModels.length === 0) {
    return { type: 'contact' };
  }
  
  const primaryPricing = formData.pricingModels[0].toLowerCase();
  
  if (primaryPricing.includes('free')) {
    return { type: 'free' };
  }
  
  if (primaryPricing.includes('trial') || primaryPricing.includes('freemium')) {
    return { type: 'trial' };
  }
  
  if (primaryPricing.includes('subscription') || primaryPricing.includes('monthly')) {
    // Try to extract price from pricing details
    const priceMatch = formData.pricingDetails?.match(/\$?(\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1]) : undefined;
    
    return {
      type: 'paid',
      value: price,
      period: 'month'
    };
  }
  
  return { type: 'contact' };
}

/**
 * Generate a unique ID for the application
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  return `app-${timestamp}-${randomPart}`;
}

/**
 * Validate that required fields are present
 */
export function validateOnboardingData(formData: OnboardingFormData): boolean {
  const requiredFields = ['productName', 'companyName', 'shortDescription'];
  return requiredFields.every(field => formData[field as keyof OnboardingFormData]);
}
