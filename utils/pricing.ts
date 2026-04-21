// Unified pricing utility for consistent price formatting across the platform
// This solves the critical inconsistency between MarketplaceGrid.vue and CategoryApplications.vue

export interface AppPricing {
  type: 'free' | 'trial' | 'paid';
  value?: number;
  period?: string;
}

export interface GlobalMarketSettings {
  currency: string;
  locale: string;
  formatCurrency: (amount: number) => string;
  getLocalizedPrice: (amount: number, period?: string) => string;
}

/**
 * Standard price formatting function
 * Ensures consistent pricing display across all application cards
 */
export const standardFormatPrice = (
  pricing: AppPricing, 
  globalMarket?: GlobalMarketSettings
): string => {
  // Handle free applications
  if (pricing.type === 'free') {
    return 'Free';
  }
  
  // Handle trial applications
  if (pricing.type === 'trial') {
    return 'Free Trial';
  }
  
  // Handle paid applications
  if (pricing.type === 'paid' && pricing.value !== undefined) {
    // Use global market formatting if available
    if (globalMarket?.getLocalizedPrice) {
      return globalMarket.getLocalizedPrice(pricing.value, pricing.period);
    }
    
    // Fallback to standard formatting
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: pricing.value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
    
    const formattedAmount = formatter.format(pricing.value);
    
    if (pricing.period) {
      return `${formattedAmount}/${pricing.period}`;
    }
    
    return formattedAmount;
  }
  
  // Fallback for edge cases
  return 'Contact for pricing';
};

/**
 * Pricing display variants for different contexts
 */
export const formatPriceCompact = (pricing: AppPricing): string => {
  if (pricing.type === 'free') return 'Free';
  if (pricing.type === 'trial') return 'Trial';
  if (pricing.type === 'paid' && pricing.value !== undefined) {
    return `$${pricing.value}${pricing.period ? `/${pricing.period}` : ''}`;
  }
  return 'Custom';
};

/**
 * Get pricing color class based on pricing type
 */
export const getPricingColorClass = (pricing: AppPricing): string => {
  switch (pricing.type) {
    case 'free':
      return 'text-green-600 bg-green-50';
    case 'trial':
      return 'text-blue-600 bg-blue-50';
    case 'paid':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-500 bg-gray-100';
  }
};

/**
 * Validate pricing data
 */
export const isValidPricing = (pricing: AppPricing): boolean => {
  if (!pricing || !pricing.type) return false;
  
  if (pricing.type === 'paid') {
    return typeof pricing.value === 'number' && pricing.value > 0;
  }
  
  return ['free', 'trial'].includes(pricing.type);
};

/**
 * Sort applications by pricing (free first, then by price)
 */
export const sortByPricing = (apps: Array<{pricing: AppPricing}>): Array<{pricing: AppPricing}> => {
  return [...apps].sort((a, b) => {
    // Free apps first
    if (a.pricing.type === 'free' && b.pricing.type !== 'free') return -1;
    if (b.pricing.type === 'free' && a.pricing.type !== 'free') return 1;
    
    // Trial apps second
    if (a.pricing.type === 'trial' && b.pricing.type === 'paid') return -1;
    if (b.pricing.type === 'trial' && a.pricing.type === 'paid') return 1;
    
    // Sort paid apps by price
    if (a.pricing.type === 'paid' && b.pricing.type === 'paid') {
      const priceA = a.pricing.value || 0;
      const priceB = b.pricing.value || 0;
      return priceA - priceB;
    }
    
    return 0;
  });
};
