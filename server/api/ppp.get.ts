/**
 * GET /api/ppp?country=IN
 * Returns a Purchasing Power Parity (PPP) multiplier for the given country code.
 * Used to display localised "fair pricing" hints on the pricing page and checkout.
 *
 * The multiplier is applied to USD prices to derive an indicative local price.
 * For Stripe checkout the actual price is set in the Stripe dashboard per region.
 */

interface PppInfo {
  country: string
  name: string
  multiplier: number   // e.g. 0.30 means 30 % of USD price
  currency: string
  symbol: string
  eligible: boolean    // show PPP discount hint
  discountPct: number  // e.g. 70 for "up to 70% off"
}

// PPP multipliers derived from World Bank ICP data (approximate, 2024)
// Values represent cost-of-living relative to USA (1.0)
const PPP_DATA: Record<string, Omit<PppInfo, 'country'>> = {
  // South / Southeast Asia
  IN: { name: 'India',         multiplier: 0.26, currency: 'INR', symbol: '₹',  eligible: true,  discountPct: 74 },
  PK: { name: 'Pakistan',      multiplier: 0.18, currency: 'PKR', symbol: '₨',  eligible: true,  discountPct: 82 },
  BD: { name: 'Bangladesh',    multiplier: 0.19, currency: 'BDT', symbol: '৳',  eligible: true,  discountPct: 81 },
  LK: { name: 'Sri Lanka',     multiplier: 0.24, currency: 'LKR', symbol: '₨',  eligible: true,  discountPct: 76 },
  NP: { name: 'Nepal',         multiplier: 0.22, currency: 'NPR', symbol: 'रू', eligible: true,  discountPct: 78 },
  ID: { name: 'Indonesia',     multiplier: 0.32, currency: 'IDR', symbol: 'Rp', eligible: true,  discountPct: 68 },
  VN: { name: 'Vietnam',       multiplier: 0.28, currency: 'VND', symbol: '₫',  eligible: true,  discountPct: 72 },
  PH: { name: 'Philippines',   multiplier: 0.34, currency: 'PHP', symbol: '₱',  eligible: true,  discountPct: 66 },
  MY: { name: 'Malaysia',      multiplier: 0.48, currency: 'MYR', symbol: 'RM', eligible: true,  discountPct: 52 },
  TH: { name: 'Thailand',      multiplier: 0.42, currency: 'THB', symbol: '฿',  eligible: true,  discountPct: 58 },
  MM: { name: 'Myanmar',       multiplier: 0.17, currency: 'MMK', symbol: 'K',  eligible: true,  discountPct: 83 },
  KH: { name: 'Cambodia',      multiplier: 0.22, currency: 'KHR', symbol: '₭',  eligible: true,  discountPct: 78 },

  // Latin America
  BR: { name: 'Brazil',        multiplier: 0.42, currency: 'BRL', symbol: 'R$', eligible: true,  discountPct: 58 },
  MX: { name: 'Mexico',        multiplier: 0.44, currency: 'MXN', symbol: '$',  eligible: true,  discountPct: 56 },
  AR: { name: 'Argentina',     multiplier: 0.23, currency: 'ARS', symbol: '$',  eligible: true,  discountPct: 77 },
  CO: { name: 'Colombia',      multiplier: 0.30, currency: 'COP', symbol: '$',  eligible: true,  discountPct: 70 },
  CL: { name: 'Chile',         multiplier: 0.48, currency: 'CLP', symbol: '$',  eligible: true,  discountPct: 52 },
  PE: { name: 'Peru',          multiplier: 0.34, currency: 'PEN', symbol: 'S/', eligible: true,  discountPct: 66 },
  EC: { name: 'Ecuador',       multiplier: 0.32, currency: 'USD', symbol: '$',  eligible: true,  discountPct: 68 },

  // Africa
  NG: { name: 'Nigeria',       multiplier: 0.18, currency: 'NGN', symbol: '₦',  eligible: true,  discountPct: 82 },
  ZA: { name: 'South Africa',  multiplier: 0.36, currency: 'ZAR', symbol: 'R',  eligible: true,  discountPct: 64 },
  KE: { name: 'Kenya',         multiplier: 0.24, currency: 'KES', symbol: 'Ksh',eligible: true,  discountPct: 76 },
  GH: { name: 'Ghana',         multiplier: 0.22, currency: 'GHS', symbol: 'GH₵',eligible: true, discountPct: 78 },
  ET: { name: 'Ethiopia',      multiplier: 0.14, currency: 'ETB', symbol: 'Br', eligible: true,  discountPct: 86 },
  TZ: { name: 'Tanzania',      multiplier: 0.16, currency: 'TZS', symbol: 'TSh',eligible: true,  discountPct: 84 },
  EG: { name: 'Egypt',         multiplier: 0.26, currency: 'EGP', symbol: 'E£', eligible: true,  discountPct: 74 },
  MA: { name: 'Morocco',       multiplier: 0.30, currency: 'MAD', symbol: 'MAD',eligible: true,  discountPct: 70 },

  // Eastern Europe / Central Asia
  UA: { name: 'Ukraine',       multiplier: 0.28, currency: 'UAH', symbol: '₴',  eligible: true,  discountPct: 72 },
  RO: { name: 'Romania',       multiplier: 0.52, currency: 'RON', symbol: 'lei',eligible: true,  discountPct: 48 },
  BG: { name: 'Bulgaria',      multiplier: 0.46, currency: 'BGN', symbol: 'лв', eligible: true,  discountPct: 54 },
  RS: { name: 'Serbia',        multiplier: 0.40, currency: 'RSD', symbol: 'дин',eligible: true,  discountPct: 60 },
  KZ: { name: 'Kazakhstan',    multiplier: 0.38, currency: 'KZT', symbol: '₸',  eligible: true,  discountPct: 62 },
  TR: { name: 'Turkey',        multiplier: 0.35, currency: 'TRY', symbol: '₺',  eligible: true,  discountPct: 65 },

  // High-income — PPP similar to or above USA, no discount
  US: { name: 'United States', multiplier: 1.00, currency: 'USD', symbol: '$',  eligible: false, discountPct: 0 },
  GB: { name: 'United Kingdom',multiplier: 0.82, currency: 'GBP', symbol: '£',  eligible: false, discountPct: 0 },
  DE: { name: 'Germany',       multiplier: 0.78, currency: 'EUR', symbol: '€',  eligible: false, discountPct: 0 },
  FR: { name: 'France',        multiplier: 0.77, currency: 'EUR', symbol: '€',  eligible: false, discountPct: 0 },
  AU: { name: 'Australia',     multiplier: 0.82, currency: 'AUD', symbol: 'A$', eligible: false, discountPct: 0 },
  CA: { name: 'Canada',        multiplier: 0.86, currency: 'CAD', symbol: 'CA$',eligible: false, discountPct: 0 },
  JP: { name: 'Japan',         multiplier: 0.72, currency: 'JPY', symbol: '¥',  eligible: false, discountPct: 0 },
  KR: { name: 'South Korea',   multiplier: 0.75, currency: 'KRW', symbol: '₩',  eligible: false, discountPct: 0 },
  SG: { name: 'Singapore',     multiplier: 0.90, currency: 'SGD', symbol: 'S$', eligible: false, discountPct: 0 },
  NZ: { name: 'New Zealand',   multiplier: 0.78, currency: 'NZD', symbol: 'NZ$',eligible: false, discountPct: 0 },
  CH: { name: 'Switzerland',   multiplier: 1.12, currency: 'CHF', symbol: 'Fr', eligible: false, discountPct: 0 },
  AE: { name: 'UAE',           multiplier: 0.78, currency: 'AED', symbol: 'د.إ',eligible: false, discountPct: 0 },
}

const UNKNOWN: Omit<PppInfo, 'country'> = { name: 'Unknown', multiplier: 1.0, currency: 'USD', symbol: '$', eligible: false, discountPct: 0 }

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const country = String(query.country ?? '').toUpperCase().trim()

  if (!country || country.length !== 2) {
    return { country, ...UNKNOWN }
  }

  const info = PPP_DATA[country] ?? UNKNOWN
  return { country, ...info }
})
