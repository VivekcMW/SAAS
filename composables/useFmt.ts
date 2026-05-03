/**
 * useFmt — locale-aware number and date formatting via Intl APIs.
 *
 * Usage:
 *   const { fmtCurrency, fmtNumber, fmtDate, fmtRelative } = useFmt()
 *
 *   fmtCurrency(29.99)             // "$29.99" in en-US, "29,99 €" in fr, etc.
 *   fmtCurrency(29.99, 'EUR')      // forces EUR regardless of locale default
 *   fmtNumber(1234567)             // "1,234,567" / "1.234.567" etc.
 *   fmtDate(new Date())            // "Jan 1, 2025" / "1 janv. 2025" etc.
 *   fmtRelative(-3, 'day')         // "3 days ago" / "il y a 3 jours" etc.
 */

// Maps i18n locale codes to BCP-47 tags recognised by Intl
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ar: 'ar-SA',
  hi: 'hi-IN',
  ko: 'ko-KR',
}

// Default currency per locale
const LOCALE_CURRENCY: Record<string, string> = {
  en: 'USD',
  es: 'EUR',
  fr: 'EUR',
  de: 'EUR',
  pt: 'BRL',
  zh: 'CNY',
  ja: 'JPY',
  ar: 'SAR',
  hi: 'INR',
  ko: 'KRW',
}

export function useFmt() {
  const { locale } = useI18n()

  const bcp47 = computed(() => LOCALE_MAP[locale.value] ?? locale.value)
  const defaultCurrency = computed(() => LOCALE_CURRENCY[locale.value] ?? 'USD')

  /**
   * Format a number as currency.
   * @param amount  Numeric value (e.g. 29.99)
   * @param currency  ISO 4217 code — defaults to the locale's home currency
   */
  function fmtCurrency(amount: number, currency?: string): string {
    try {
      return new Intl.NumberFormat(bcp47.value, {
        style: 'currency',
        currency: currency ?? defaultCurrency.value,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `$${amount.toFixed(2)}`
    }
  }

  /**
   * Format a plain number with locale-appropriate thousands separators.
   */
  function fmtNumber(value: number, opts?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(bcp47.value, opts).format(value)
    } catch {
      return String(value)
    }
  }

  /**
   * Format a Date (or ISO string / timestamp) using medium date style.
   */
  const DEFAULT_DATE_OPTS: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }

  function fmtDate(
    date: Date | string | number,
    opts: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTS
  ): string {
    try {
      const d = date instanceof Date ? date : new Date(date)
      return new Intl.DateTimeFormat(bcp47.value, opts).format(d)
    } catch {
      return String(date)
    }
  }

  /**
   * Format a relative time, e.g. fmtRelative(-3, 'day') → "3 days ago"
   */
  function fmtRelative(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    try {
      return new Intl.RelativeTimeFormat(bcp47.value, { numeric: 'auto' }).format(value, unit)
    } catch {
      return `${Math.abs(value)} ${unit}${Math.abs(value) === 1 ? '' : 's'} ago`
    }
  }

  return { fmtCurrency, fmtNumber, fmtDate, fmtRelative, bcp47, defaultCurrency }
}
