/**
 * useCurrency — Multi-currency formatting composable
 * Reads from the global-market plugin and converts/formats prices.
 * Exchange rates are fetched from /api/exchange-rates (open.er-api.com free tier)
 * and cached module-level with 1-hour TTL. Falls back to static rates if unavailable.
 */
import { ref, computed } from 'vue'
import { useNuxtApp, useCookie } from '#app'

// Static fallback rates (USD base)
const STATIC_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, BRL: 5.05, JPY: 149,
  CNY: 7.24, INR: 83.5, SAR: 3.75, AUD: 1.52, CAD: 1.36,
  AED: 3.67, SGD: 1.34, MXN: 17.2, CHF: 0.9, KRW: 1340,
}

const SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', BRL: 'R$', JPY: '¥', CNY: '¥',
  INR: '₹', SAR: '﷼', AUD: 'A$', CAD: 'C$', AED: 'د.إ', SGD: 'S$',
  MXN: '$', CHF: 'Fr', KRW: '₩',
}

// Map locale codes to preferred currencies
const LOCALE_CURRENCY: Record<string, string> = {
  'en': 'USD', 'en-US': 'USD', 'en-GB': 'GBP', 'en-AU': 'AUD', 'en-CA': 'CAD',
  'de': 'EUR', 'fr': 'EUR', 'es': 'EUR', 'pt': 'BRL', 'ja': 'JPY', 'zh': 'CNY', 'ar': 'SAR',
}

// Module-level reactive state — shared across all component instances
const _liveRates = ref<Record<string, number>>(STATIC_RATES)
const _ratesLoaded = ref(false)
const _ratesFetching = ref(false)
const _ratesFetchedAt = ref(0)
const CACHE_TTL_MS = 60 * 60 * 1000

async function refreshRates() {
  if (_ratesFetching.value) return
  if (_ratesLoaded.value && Date.now() - _ratesFetchedAt.value < CACHE_TTL_MS) return
  _ratesFetching.value = true
  try {
    const data = await $fetch<{ rates: Record<string, number> }>('/api/exchange-rates')
    if (data?.rates) {
      _liveRates.value = data.rates
      _ratesLoaded.value = true
      _ratesFetchedAt.value = Date.now()
    }
  } catch {
    // Silently keep static rates
  } finally {
    _ratesFetching.value = false
  }
}

export function useCurrency() {
  const nuxtApp = useNuxtApp()
  const globalMarket = (nuxtApp.$globalMarket as any) || null

  // Trigger a background rate refresh (non-blocking)
  if (import.meta.client) {
    refreshRates()
  }

  // Resolve active currency
  const currency = computed<string>(() => {
    if (globalMarket?.currentRegionSettings?.value?.currency) {
      return globalMarket.currentRegionSettings.value.currency
    }
    const localeCookie = useCookie('i18n_redirected').value as string | undefined
    return LOCALE_CURRENCY[localeCookie || 'en'] || 'USD'
  })

  const rate = computed<number>(() => _liveRates.value[currency.value] ?? 1)

  function formatPrice(usdAmount: number, opts?: { period?: string }): string {
    const converted = usdAmount * rate.value
    const sym = SYMBOLS[currency.value] || currency.value
    const curr = currency.value

    let formatted: string
    try {
      formatted = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: curr,
        maximumFractionDigits: curr === 'JPY' || curr === 'KRW' ? 0 : 2,
        minimumFractionDigits: 0,
      }).format(converted)
    } catch {
      formatted = `${sym}${converted.toFixed(curr === 'JPY' || curr === 'KRW' ? 0 : 2)}`
    }
    return opts?.period ? `${formatted}/${opts.period}` : formatted
  }

  function formatAmount(amount: number): string {
    return formatPrice(amount / (_liveRates.value['USD'] ?? 1))
  }

  return { currency, rate, formatPrice, formatAmount, RATES: _liveRates, SYMBOLS }
}

