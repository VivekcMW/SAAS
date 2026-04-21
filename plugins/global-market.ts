/**
 * Global Market Plugin
 * This plugin provides global market functionality to all components
 */
import { ref, computed, readonly, defineNuxtPlugin } from '#imports';
import { useRuntimeConfig } from '#app';

interface CurrencyRate {
  [key: string]: number;
}

interface RegionalSettings {
  name: string;
  currency: string;
  tax: number;
  locale: string;
  flag: string;
}

export default defineNuxtPlugin((nuxtApp) => {
  // Get config
  const config = useRuntimeConfig();
  
  // Current region state
  const currentRegion = ref<string>('US');
  
  // Currency exchange rates
  const exchangeRates = ref<CurrencyRate>({
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    BRL: 5.20,
    JPY: 110,
    CNY: 6.45,
    INR: 74.5,
    SAR: 3.75,
    AUD: 1.35,
    CAD: 1.25
  });

  // Get regional configurations from runtime config
  const regionalConfigs = computed(() => {
    return config.public.regions as Record<string, RegionalSettings>;
  });

  // Get current regional settings
  const currentRegionSettings = computed(() => {
    return regionalConfigs.value[currentRegion.value] || regionalConfigs.value['US'];
  });

  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      BRL: 'R$',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
      SAR: '﷼',
      AUD: 'A$',
      CAD: 'C$'
    };
    return symbols[currency] || currency;
  };

  // Format currency based on region
  const formatCurrency = (amount: number, currency?: string, targetLocale?: string) => {
    const targetCurrency = currency || currentRegionSettings.value.currency;
    const formatLocale = targetLocale || currentRegionSettings.value.locale;
    
    try {
      return new Intl.NumberFormat(formatLocale, {
        style: 'currency',
        currency: targetCurrency,
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      const symbol = getCurrencySymbol(targetCurrency);
      return `${symbol}${amount.toFixed(2)}`;
    }
  };

  // Format number based on locale
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    try {
      return new Intl.NumberFormat(currentRegionSettings.value.locale, options).format(number);
    } catch (error) {
      return number.toLocaleString();
    }
  };

  // Get localized price with currency conversion
  const getLocalizedPrice = (basePrice: number, fromCurrency: string = 'USD'): number => {
    const targetCurrency = currentRegionSettings.value.currency;
    
    // If the currencies are the same, no conversion needed
    if (fromCurrency === targetCurrency) return basePrice;
    
    // Convert using exchange rates
    const targetRate = exchangeRates.value[targetCurrency] || 1;
    const fromRate = exchangeRates.value[fromCurrency] || 1;
    
    return basePrice * (targetRate / fromRate);
  };
  
  // Calculate price with tax based on region
  const calculatePriceWithTax = (basePrice: number): number => {
    const taxRate = currentRegionSettings.value.tax / 100;
    return basePrice * (1 + taxRate);
  };

  // Switch region
  const switchRegion = (newRegion: string) => {
    if (regionalConfigs.value[newRegion]) {
      currentRegion.value = newRegion;
      
      // Store user preference
      if (process.client) {
        localStorage.setItem('preferred-region', newRegion);
      }
    }
  };

  // Get all available regions
  const getAvailableRegions = () => {
    return Object.keys(regionalConfigs.value).map(key => ({
      code: key,
      ...regionalConfigs.value[key]
    }));
  };

  // Get regional compliance requirements
  const getComplianceRequirements = () => {
    const requirements: Record<string, string[]> = {
      'US': ['CCPA', 'COPPA'],
      'EU': ['GDPR'],
      'BR': ['LGPD'],
      'JP': ['APPI'],
      'CN': ['PIPL'],
      'IN': ['PDPB']
    };
    
    return requirements[currentRegion.value] || [];
  };

  // Detect if current locale is RTL
  const isRTL = computed(() => {
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    const currentLocale = currentRegionSettings.value.locale;
    const langCode = currentLocale.split('-')[0];
    return rtlLocales.includes(langCode);
  });

  // Initialize on plugin creation
  if (process.client) {
    const savedRegion = localStorage.getItem('preferred-region');
    if (savedRegion && regionalConfigs.value[savedRegion]) {
      currentRegion.value = savedRegion;
    }
  }

  // Create the globalMarket object
  const globalMarket = {
    // State
    currentRegion: readonly(currentRegion),
    currentRegionSettings: readonly(currentRegionSettings),
    exchangeRates: readonly(exchangeRates),
    
    // Formatting functions
    formatCurrency,
    formatNumber,
    getCurrencySymbol,
    
    // Price calculations
    calculatePriceWithTax,
    getLocalizedPrice,
    
    // Regional features
    switchRegion,
    getAvailableRegions,
    getComplianceRequirements,
    isRTL
  };

  // Provide the globalMarket to the app
  // Use the standard Nuxt provide pattern (only one method)
  return {
    provide: {
      globalMarket
    }
  };
});
