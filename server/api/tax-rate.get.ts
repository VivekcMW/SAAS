/**
 * GET /api/tax-rate
 * Returns the applicable VAT/GST/sales tax rate for a given country code.
 * Used by the checkout flow to display and calculate tax before confirming payment.
 *
 * Query: ?country=US&state=CA (state optional, used for US sales tax lookup)
 */

interface TaxInfo {
  country: string
  rate: number        // decimal fraction e.g. 0.20 for 20%
  label: string       // e.g. "VAT", "GST", "Sales Tax"
  displayRate: string // e.g. "20%"
  applies: boolean    // false for zero-rated / non-taxable territories
}

// Simplified static tax rates — in production connect to TaxJar / Stripe Tax
const VAT_RATES: Record<string, Omit<TaxInfo, 'country'>> = {
  // European Union
  AT: { rate: 0.20, label: 'VAT', displayRate: '20%', applies: true },
  BE: { rate: 0.21, label: 'VAT', displayRate: '21%', applies: true },
  BG: { rate: 0.20, label: 'VAT', displayRate: '20%', applies: true },
  CY: { rate: 0.19, label: 'VAT', displayRate: '19%', applies: true },
  CZ: { rate: 0.21, label: 'VAT', displayRate: '21%', applies: true },
  DE: { rate: 0.19, label: 'VAT', displayRate: '19%', applies: true },
  DK: { rate: 0.25, label: 'VAT (moms)', displayRate: '25%', applies: true },
  EE: { rate: 0.22, label: 'VAT (KM)', displayRate: '22%', applies: true },
  ES: { rate: 0.21, label: 'IVA', displayRate: '21%', applies: true },
  FI: { rate: 0.24, label: 'VAT (ALV)', displayRate: '24%', applies: true },
  FR: { rate: 0.20, label: 'TVA', displayRate: '20%', applies: true },
  GR: { rate: 0.24, label: 'ΦΠΑ', displayRate: '24%', applies: true },
  HR: { rate: 0.25, label: 'PDV', displayRate: '25%', applies: true },
  HU: { rate: 0.27, label: 'ÁFA', displayRate: '27%', applies: true },
  IE: { rate: 0.23, label: 'VAT', displayRate: '23%', applies: true },
  IT: { rate: 0.22, label: 'IVA', displayRate: '22%', applies: true },
  LT: { rate: 0.21, label: 'PVM', displayRate: '21%', applies: true },
  LU: { rate: 0.17, label: 'TVA', displayRate: '17%', applies: true },
  LV: { rate: 0.21, label: 'PVN', displayRate: '21%', applies: true },
  MT: { rate: 0.18, label: 'VAT (TAT)', displayRate: '18%', applies: true },
  NL: { rate: 0.21, label: 'BTW', displayRate: '21%', applies: true },
  PL: { rate: 0.23, label: 'VAT (PTU)', displayRate: '23%', applies: true },
  PT: { rate: 0.23, label: 'IVA', displayRate: '23%', applies: true },
  RO: { rate: 0.19, label: 'TVA', displayRate: '19%', applies: true },
  SE: { rate: 0.25, label: 'Moms', displayRate: '25%', applies: true },
  SI: { rate: 0.22, label: 'DDV', displayRate: '22%', applies: true },
  SK: { rate: 0.20, label: 'DPH', displayRate: '20%', applies: true },
  // UK
  GB: { rate: 0.20, label: 'VAT', displayRate: '20%', applies: true },
  // Australia
  AU: { rate: 0.10, label: 'GST', displayRate: '10%', applies: true },
  // India
  IN: { rate: 0.18, label: 'GST', displayRate: '18%', applies: true },
  // Canada
  CA: { rate: 0.05, label: 'GST', displayRate: '5%', applies: true },
  // New Zealand
  NZ: { rate: 0.15, label: 'GST', displayRate: '15%', applies: true },
  // Switzerland
  CH: { rate: 0.077, label: 'MWST/TVA', displayRate: '7.7%', applies: true },
  // Norway
  NO: { rate: 0.25, label: 'MVA', displayRate: '25%', applies: true },
  // Singapore
  SG: { rate: 0.09, label: 'GST', displayRate: '9%', applies: true },
  // Japan
  JP: { rate: 0.10, label: 'Consumption Tax', displayRate: '10%', applies: true },
  // South Korea
  KR: { rate: 0.10, label: 'VAT (부가세)', displayRate: '10%', applies: true },
  // USA — basic state-level average, Stripe Tax handles exact jurisdiction
  US: { rate: 0.00, label: 'Sales Tax', displayRate: 'Varies by state', applies: false },
}

const ZERO_RATED: TaxInfo = { country: '', rate: 0, label: 'Tax', displayRate: '0%', applies: false }

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const country = String(query.country ?? '').toUpperCase().trim()

  if (!country || country.length !== 2) {
    return { ...ZERO_RATED, country }
  }

  const info = VAT_RATES[country]
  if (!info) return { ...ZERO_RATED, country }

  return { ...info, country }
})
