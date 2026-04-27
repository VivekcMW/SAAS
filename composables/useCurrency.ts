/**
 * useCurrency — Multi-currency formatting composable
 * Reads from the global-market plugin and converts/formats prices.
 * Exchange rates are baked-in; in production, fetch from an exchange rates API.
 */
import { computed } from 'vue'
import { useNuxtApp, useCookie } from '#app'

// Static exchange rates (USD base). Update via /api/exchange-rates in production.
const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  BRL: 5.05,
  JPY: 149,
  CNY: 7.24,
  INR: 83.5,
  SAR: 3.75,
  AUD: 1.52,
  CAD: 1.36,
  AED: 3.67,
  SGD: 1.34
}

const SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  BRL: 'R$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  SAR: '﷼',
  AUD: 'A$',
  CAD: 'C$',
  AED: 'د.إ',
  SGD: 'S$'
}

// Map locale codes to preferred currencies
const LOCALE_CURRENCY: Record<string, string> = {
  'en': 'USD',
  'en-US': 'USD',
  'en-GB': 'GBP',
  'en-AU': 'AUD',
  'en-CA': 'CAD',
  'de': 'EUR',
  'fr': 'EUR',
  'es': 'EUR',
  'pt': 'BRL',
  'ja': 'JPY',
  'zh': 'CNY',
  'ar': 'SAR'
}

export function useCurrency() {
  const nuxtApp = useNuxtApp()
  const globalMarket = (nuxtApp.$globalMarket as any) || null

  // Resolve active currency
  const currency = computed<string>(() => {
    if (globalMarket?.currentRegionSettings?.value?.currency) {
      return globalMarket.currentRegionSettings.value.currency
    }
    // Fall back to locale cookie
    const localeCookie = useCookie('i18n_redirected').value as string | undefined
    return LOCALE_CURRENCY[localeCookie || 'en'] || 'USD'
  })

  const rate = computed<number>(() => RATES[currency.value] ?? 1)

  /**
   * Convert a USD price to the active currency and format it.
   */
  function formatPrice(usdAmount: number, opts?: { period?: string }): string {
    const converted = usdAmount * rate.value
    const sym = SYMBOLS[currency.value] || currency.value
    const curr = currency.value

    // Use Intl formatter for proper decimal handling
    let formatted: string
    try {
      formatted = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: curr,
        maximumFractionDigits: curr === 'JPY' || curr === 'INR' ? 0 : 2,
        minimumFractionDigits: 0
      }).format(converted)
    } catch {
      formatted = `${sym}${converted.toFixed(curr === 'JPY' ? 0 : 2)}`
    }
    return opts?.period ? `${formatted}/${opts.period}` : formatted
  }

  /**
   * Format any amount already in the target currency.
   */
  function formatAmount(amount: number): string {
    return formatPrice(amount / (RATES['USD'] ?? 1))
  }

  return { currency, rate, formatPrice, formatAmount, RATES, SYMBOLS }
}
