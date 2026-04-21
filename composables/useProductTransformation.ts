/**
 * Product Data Transformation Composable
 * Transforms onboarding form data to app landing page format
 */

import type { FundingPreferences } from '~/types/funding';

// Import types from utils to avoid duplication
import type { OnboardingFormData } from '~/utils/productTransformation'

// Types for app landing page
interface AppPricing {
  type: 'free' | 'trial' | 'paid' | 'contact';
  value?: number;
  period?: string;
}

interface Application {
  id: string;
  name: string;
  logo: string;
  provider: string;
  description: string;
  longDescription: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  pricing: AppPricing;
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
  
  // Additional fields from onboarding
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
  
  // Funding information
  fundingInfo?: FundingPreferences;
}

export const useProductTransformation = () => {
  
  /**
   * Generate unique app ID
   */
  const generateAppId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `app-${timestamp}-${randomStr}`;
  };

  /**
   * Transform pricing information from onboarding to app format
   */
  const transformPricing = (formData: OnboardingFormData): AppPricing => {
    const primaryModel = formData.pricingModels?.[0];
    const businessModel = formData.businessModel;
    
    // Use business model as primary source, fallback to pricing models
    const model = businessModel || primaryModel;
    
    switch (model?.toLowerCase()) {
      case 'free':
        return { type: 'free' };
      
      case 'freemium':
        return { type: 'trial' };
      
      case 'subscription':
        const priceMatch = formData.pricingDetails?.match(/\$?(\d+(?:\.\d{2})?)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : undefined;
        const period = formData.pricingDetails?.toLowerCase().includes('year') ? 'year' : 'month';
        return { 
          type: 'paid', 
          value: price, 
          period: period 
        };
      
      case 'one-time':
      case 'one-time purchase':
        const oneTimePrice = formData.pricingDetails?.match(/\$?(\d+(?:\.\d{2})?)/);
        return { 
          type: 'paid', 
          value: oneTimePrice ? parseFloat(oneTimePrice[1]) : undefined 
        };
      
      case 'usage-based':
        return { type: 'paid', period: 'usage' };
      
      case 'enterprise':
      case 'contact-sales':
      case 'contact for pricing':
        return { type: 'contact' };
      
      default:
        return { type: 'contact' };
    }
  };

  /**
   * Extract features list from detailed feature objects
   */
  const transformFeatures = (features: Array<{ title: string; description: string }>): string[] => {
    return features
      .filter(feature => feature.title && feature.title.trim() !== '')
      .map(feature => feature.title.trim());
  };

  /**
   * Transform tags from categories and keywords
   */
  const transformTags = (categories: string[], keywords: string): string[] => {
    const tags = [...categories];
    
    if (keywords && keywords.trim()) {
      const keywordArray = keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);
      tags.push(...keywordArray);
    }
    
    // Remove duplicates and return unique tags
    return [...new Set(tags)];
  };

  /**
   * Transform pricing features from included features
   */
  const transformPricingFeatures = (includedFeatures: string[]): string[] => {
    return includedFeatures
      .filter(feature => feature && feature.trim() !== '')
      .slice(0, 5); // Limit to 5 features for pricing card
  };

  /**
   * Clean and filter included features
   */
  const transformIncludedFeatures = (includedFeatures: string[]): string[] => {
    return includedFeatures
      .filter(feature => feature && feature.trim() !== '')
      .map(feature => feature.trim());
  };

  /**
   * Transform app store links to download links object
   */
  const transformDownloadLinks = (appStoreLinks: OnboardingFormData['appStoreLinks']): Record<string, string> => {
    const links: Record<string, string> = {};
    
    Object.entries(appStoreLinks).forEach(([platform, url]) => {
      if (url && url.trim() !== '') {
        links[platform] = url.trim();
      }
    });
    
    return links;
  };

  /**
   * Transform screenshots with captions
   */
  const transformScreenshots = (screenshots: Array<{ url: string; caption?: string }>): Array<{ url: string; caption: string }> => {
    return screenshots
      .filter(screenshot => screenshot.url && screenshot.url.trim() !== '')
      .map((screenshot, index) => ({
        url: screenshot.url,
        caption: screenshot.caption || `Screenshot ${index + 1}`
      }));
  };

  /**
   * Main transformation function: Onboarding form data → App landing page data
   */
  const transformOnboardingToApp = (formData: OnboardingFormData, appId?: string): Application => {
    const id = appId || generateAppId();
    const currentDate = new Date().toISOString().split('T')[0];
    
    return {
      // Basic App Information
      id,
      name: formData.productName || 'Untitled App',
      logo: formData.logoUrl || '/assets/images/placeholder-app-logo.svg',
      provider: formData.companyName || 'Unknown Company',
      description: formData.shortDescription || '',
      longDescription: formData.fullDescription || formData.shortDescription || '',
      website: formData.productWebsite || '',
      
      // Ratings (start with defaults for new apps)
      rating: 0.0,
      reviewCount: 0,
      
      // Categories and Discovery
      category: Array.isArray(formData.category) ? formData.category[0] || 'other' : formData.category || 'other',
      tags: transformTags(Array.isArray(formData.category) ? formData.category : [formData.category], formData.searchKeywords),
      
      // Status Flags
      featured: false,
      trending: false,
      
      // Pricing Information
      pricing: transformPricing(formData),
      businessModel: formData.businessModel || (formData.pricingModels && formData.pricingModels[0]) || 'contact',
      
      // Features and Benefits
      features: Array.isArray(formData.features) ? 
        formData.features.map(f => typeof f === 'string' ? f : f.title).filter(Boolean) : [],
      included: transformIncludedFeatures(formData.includedFeatures),
      pricingFeatures: transformPricingFeatures(formData.includedFeatures),
      
      // Technical Information
      version: formData.appVersion || '1.0.0',
      lastUpdated: currentDate, // Always use current date since lastUpdated is not in OnboardingFormData
      languages: formData.supportedLanguages || ['English'],
      integrations: formData.integrations || [],
      platformSupport: formData.platformSupport || [],
      developmentStage: formData.applicationStage || 'live',
      
      // API and Technical Features
      apiAvailable: formData.apiAvailable || false,
      webhookSupport: formData.webhookSupport || false,
      
      // Distribution and Downloads
      downloadLinks: transformDownloadLinks(formData.appStoreLinks),
      
      // Support and Documentation
      supportChannels: formData.supportChannels || [],
      documentation: formData.documentationUrl || '',
      helpCenter: formData.helpCenterUrl || '',
      
      // Media Assets
      screenshots: transformScreenshots(formData.screenshots || []),
      videos: formData.videos?.map((video, index) => ({
        url: video.url,
        title: video.title || `Demo Video ${index + 1}`
      })) || [],
      
      // Social Proof
      testimonials: formData.testimonials?.filter(t => t.content && t.content.trim() !== '') || [],
      
      // Company Information
      companyInfo: {
        size: formData.companySize || '',
        location: formData.companyLocation || '',
        founded: formData.founded || '',
        industries: formData.industries || [],
        socialLinks: Object.fromEntries(
          Object.entries(formData.socialLinks || {})
            .filter(([, url]) => url && url.trim() !== '')
        )
      },
      
      // Team Information
      founder: {
        name: formData.founder?.name || '',
        title: formData.founder?.title || '',
        bio: formData.founder?.bio || '',
        profilePicture: formData.founder?.profilePicture || ''
      },
      team: formData.teamMembers?.filter(member => 
        member.name && member.name.trim() !== ''
      ) || [],
      
      // Contact Information
      contact: {
        name: formData.contact?.name || '',
        email: formData.contact?.email || '',
        phone: formData.contact?.phone || '',
        role: formData.contact?.role || ''
      },
      
      // Administrative
      submissionDate: currentDate,
      status: 'submitted',
      
      // Funding information
      fundingInfo: formData.fundingPreferences
    };
  };

  /**
   * Transform app data back to onboarding format (for editing)
   */
  const transformAppToOnboarding = (app: Application): Partial<OnboardingFormData> => {
    return {
      productName: app.name,
      productWebsite: app.website,
      shortDescription: app.description,
      category: [app.category],
      searchKeywords: app.tags.join(', '),
      companyName: app.provider,
      fullDescription: app.longDescription,
      features: app.features.map(title => ({ title, description: '' })),
      pricingModels: [app.businessModel],
      appVersion: app.version,
      supportedLanguages: app.languages,
      integrations: app.integrations,
      businessModel: app.businessModel,
      apiAvailable: app.apiAvailable,
      webhookSupport: app.webhookSupport,
      appStoreLinks: {
        ios: app.downloadLinks.ios || '',
        android: app.downloadLinks.android || '',
        web: app.downloadLinks.web || '',
        desktop: app.downloadLinks.desktop || '',
        chrome: app.downloadLinks.chrome || '',
        firefox: app.downloadLinks.firefox || ''
      },
      includedFeatures: app.included,
      supportChannels: app.supportChannels,
      documentationUrl: app.documentation,
      helpCenterUrl: app.helpCenter,
      logoUrl: app.logo,
      screenshots: app.screenshots,
      videos: app.videos,
      testimonials: app.testimonials,
      contact: {
        name: app.contact.name,
        email: app.contact.email,
        phone: app.contact.phone,
        role: app.contact.role
      },
      founder: {
        name: app.founder.name,
        title: app.founder.title,
        bio: app.founder.bio,
        profilePicture: app.founder.profilePicture
      }
    };
  };

  /**
   * Validate required fields for app publication
   */
  const validateAppData = (app: Application): { isValid: boolean; missingFields: string[] } => {
    const requiredFields = {
      name: app.name,
      provider: app.provider,
      description: app.description,
      category: app.category,
      version: app.version,
      'contact.email': app.contact.email
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value || value.toString().trim() === '')
      .map(([field]) => field);
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  return {
    transformOnboardingToApp,
    transformAppToOnboarding,
    validateAppData,
    generateAppId,
    transformPricing,
    transformFeatures,
    transformTags
  };
};
