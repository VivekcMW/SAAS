/**
 * Simplified Global Market Composable
 * Handles currency conversion, regional formatting, and localization
 * Acts as a wrapper around the global-market plugin
 */

import { ref, computed, readonly } from 'vue';
import { useNuxtApp, useRuntimeConfig } from '#app';

export interface CurrencyRate {
  [key: string]: number;
}

export interface RegionalSettings {
  name: string;
  currency: string;
  tax: number;
  locale: string;
  flag: string;
}

/**
 * Global market composable - provides currency, regional settings, and formatting utilities
 * @returns Global market utilities and state
 */
export function useGlobalMarket() {
  const nuxtApp = useNuxtApp();
  
  // Get the globalMarket from the plugin
  const globalMarket = nuxtApp.$globalMarket;
  
  // If the plugin is not available (should never happen), provide a minimal fallback
  if (!globalMarket) {
    console.error('Global market plugin not available');
    
    // Create minimal fallback implementation
    const config = useRuntimeConfig();
    const currentRegion = ref('US');
    const currentRegionSettings = computed(() => {
      const regions = config.public?.regions as Record<string, any> || {};
      return regions[currentRegion.value] || { name: 'United States', currency: 'USD', tax: 8.5, locale: 'en-US', flag: 'us' };
    });
    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
    const getLocalizedPrice = (amount: number) => amount;
    
    return {
      currentRegion: readonly(currentRegion),
      currentRegionSettings,
      formatCurrency,
      getLocalizedPrice,
      isRTL: computed(() => false),
      getComplianceRequirements: () => [],
      switchRegion: (region: string) => { currentRegion.value = region; },
      getAvailableRegions: () => [{ code: 'US', name: 'United States', currency: 'USD', tax: 8.5, locale: 'en-US', flag: 'us' }],
      calculatePriceWithTax: (price: number) => price * 1.085,
      formatNumber: (num: number) => num.toString()
    };
  }
  
  return globalMarket;
}
