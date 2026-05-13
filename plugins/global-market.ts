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

export default defineNuxtPlugin((_nuxtApp) => {
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
    } catch (_error) {
      // Fallback formatting
      const symbol = getCurrencySymbol(targetCurrency);
      return `${symbol}${amount.toFixed(2)}`;
    }
  };

  // Format number based on locale
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    try {
      return new Intl.NumberFormat(currentRegionSettings.value.locale, options).format(number);
    } catch (_error) {
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
      
      if (import.meta.client) {
        // Explicit user choice — store as preference and remove auto-detected value
        localStorage.setItem('preferred-region', newRegion);
        localStorage.removeItem('geo-detected');
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
  if (import.meta.client) {
    const savedRegion = localStorage.getItem('preferred-region');
    if (savedRegion && regionalConfigs.value[savedRegion]) {
      // User explicitly picked a region before — respect that choice
      currentRegion.value = savedRegion;
    } else {
      const prevDetected = localStorage.getItem('geo-detected');
      if (prevDetected && regionalConfigs.value[prevDetected]) {
        // We detected on a previous visit but user never manually changed — reuse it
        currentRegion.value = prevDetected;
      } else {
        // First visit with no preference: auto-detect country via server API
        fetch('/api/geo')
          .then(r => r.ok ? r.json() : null)
          .then((data: { regionKey?: string } | null) => {
            if (data?.regionKey && regionalConfigs.value[data.regionKey]) {
              currentRegion.value = data.regionKey;
              localStorage.setItem('geo-detected', data.regionKey);
            }
          })
          .catch(() => { /* keep default US */ });
      }
    }

    // Fetch live exchange rates (1h cached on server) and merge into local store
    fetch('/api/exchange-rates')
      .then(r => r.ok ? r.json() : null)
      .then((data: { rates?: Record<string, number> } | null) => {
        if (data?.rates) {
          exchangeRates.value = { ...exchangeRates.value, ...data.rates };
        }
      })
      .catch(() => { /* keep static fallback rates */ });
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
