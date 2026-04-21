/**
 * Mock implementation for the global market composable
 * Used for testing purposes only - DO NOT import this directly in components!
 */

import { ref, computed, readonly } from 'vue';

// Make sure we don't export any function called useGlobalMarket to avoid conflicts
export const createMockGlobalMarket = () => {
  const currentRegion = ref<string>('US');
  
  const currentRegionSettings = computed(() => ({
    name: 'United States',
    currency: 'USD',
    tax: 8.5,
    locale: 'en-US',
    flag: 'us'
  }));

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getLocalizedPrice = (basePrice: number) => {
    return basePrice; // No conversion in mock
  };

  const getComplianceRequirements = () => {
    return [];
  };

  const isRTL = computed(() => false);

  return {
    currentRegion: readonly(currentRegion),
    currentRegionSettings: readonly(currentRegionSettings),
    formatCurrency,
    getLocalizedPrice,
    getComplianceRequirements,
    isRTL
  };
}
