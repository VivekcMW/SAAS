/**
 * VAT / GST rate lookup utility.
 *
 * Rates are stored as integers (e.g. 20 = 20%).
 * Sources: EU Commission VAT rates (2024), OECD Consumption Tax Trends (2024).
 */

interface VatEntry {
  rate: number      // percentage integer, e.g. 20
  label: string     // display label, e.g. "VAT" or "GST"
  name: string      // country name for display
}

/** ISO 3166-1 alpha-2 → VAT/GST entry */
const VAT_TABLE: Record<string, VatEntry> = {
  // ── European Union ──────────────────────────────────────────────────────────
  AT: { rate: 20, label: 'VAT', name: 'Austria' },
  BE: { rate: 21, label: 'VAT', name: 'Belgium' },
  BG: { rate: 20, label: 'VAT', name: 'Bulgaria' },
  CY: { rate: 19, label: 'VAT', name: 'Cyprus' },
  CZ: { rate: 21, label: 'VAT', name: 'Czech Republic' },
  DE: { rate: 19, label: 'VAT', name: 'Germany' },
  DK: { rate: 25, label: 'VAT', name: 'Denmark' },
  EE: { rate: 22, label: 'VAT', name: 'Estonia' },
  ES: { rate: 21, label: 'VAT', name: 'Spain' },
  FI: { rate: 25.5, label: 'VAT', name: 'Finland' },
  FR: { rate: 20, label: 'VAT', name: 'France' },
  GR: { rate: 24, label: 'VAT', name: 'Greece' },
  HR: { rate: 25, label: 'VAT', name: 'Croatia' },
  HU: { rate: 27, label: 'VAT', name: 'Hungary' },
  IE: { rate: 23, label: 'VAT', name: 'Ireland' },
  IT: { rate: 22, label: 'VAT', name: 'Italy' },
  LT: { rate: 21, label: 'VAT', name: 'Lithuania' },
  LU: { rate: 17, label: 'VAT', name: 'Luxembourg' },
  LV: { rate: 21, label: 'VAT', name: 'Latvia' },
  MT: { rate: 18, label: 'VAT', name: 'Malta' },
  NL: { rate: 21, label: 'VAT', name: 'Netherlands' },
  PL: { rate: 23, label: 'VAT', name: 'Poland' },
  PT: { rate: 23, label: 'VAT', name: 'Portugal' },
  RO: { rate: 19, label: 'VAT', name: 'Romania' },
  SE: { rate: 25, label: 'VAT', name: 'Sweden' },
  SI: { rate: 22, label: 'VAT', name: 'Slovenia' },
  SK: { rate: 23, label: 'VAT', name: 'Slovakia' },
  // ── Other European ───────────────────────────────────────────────────────────
  GB: { rate: 20, label: 'VAT', name: 'United Kingdom' },
  NO: { rate: 25, label: 'MVA', name: 'Norway' },
  CH: { rate: 8.1, label: 'MWST', name: 'Switzerland' },
  IS: { rate: 24, label: 'VSK', name: 'Iceland' },
  TR: { rate: 20, label: 'KDV', name: 'Turkey' },
  UA: { rate: 20, label: 'VAT', name: 'Ukraine' },
  RS: { rate: 20, label: 'PDV', name: 'Serbia' },
  // ── Americas ─────────────────────────────────────────────────────────────────
  CA: { rate: 5, label: 'GST', name: 'Canada' },        // federal GST only
  MX: { rate: 16, label: 'IVA', name: 'Mexico' },
  BR: { rate: 12, label: 'ICMS', name: 'Brazil' },      // avg state ICMS
  AR: { rate: 21, label: 'IVA', name: 'Argentina' },
  CL: { rate: 19, label: 'IVA', name: 'Chile' },
  CO: { rate: 19, label: 'IVA', name: 'Colombia' },
  PE: { rate: 18, label: 'IGV', name: 'Peru' },
  // ── Asia-Pacific ─────────────────────────────────────────────────────────────
  AU: { rate: 10, label: 'GST', name: 'Australia' },
  NZ: { rate: 15, label: 'GST', name: 'New Zealand' },
  SG: { rate: 9, label: 'GST', name: 'Singapore' },
  JP: { rate: 10, label: 'JCT', name: 'Japan' },
  KR: { rate: 10, label: 'VAT', name: 'South Korea' },
  TW: { rate: 5, label: 'VAT', name: 'Taiwan' },
  MY: { rate: 8, label: 'SST', name: 'Malaysia' },
  TH: { rate: 7, label: 'VAT', name: 'Thailand' },
  PH: { rate: 12, label: 'VAT', name: 'Philippines' },
  ID: { rate: 11, label: 'PPN', name: 'Indonesia' },
  VN: { rate: 10, label: 'VAT', name: 'Vietnam' },
  IN: { rate: 18, label: 'GST', name: 'India' },
  PK: { rate: 17, label: 'GST', name: 'Pakistan' },
  BD: { rate: 15, label: 'VAT', name: 'Bangladesh' },
  CN: { rate: 13, label: 'VAT', name: 'China' },
  HK: { rate: 0, label: '', name: 'Hong Kong' },
  // ── Middle East & Africa ─────────────────────────────────────────────────────
  SA: { rate: 15, label: 'VAT', name: 'Saudi Arabia' },
  AE: { rate: 5, label: 'VAT', name: 'UAE' },
  IL: { rate: 18, label: 'VAT', name: 'Israel' },
  ZA: { rate: 15, label: 'VAT', name: 'South Africa' },
  KE: { rate: 16, label: 'VAT', name: 'Kenya' },
  NG: { rate: 7.5, label: 'VAT', name: 'Nigeria' },
  EG: { rate: 14, label: 'VAT', name: 'Egypt' },
}

export interface VatResult {
  country: string
  countryName: string
  /** The VAT/GST label for this jurisdiction (e.g. "VAT", "GST", "IVA") */
  vatLabel: string
  /** Rate as a percentage integer, e.g. 20 for 20% */
  vatRate: number
  net: number
  vatAmount: number
  gross: number
  /** True if Moonmart is required to collect this tax (approx) */
  taxApplicable: boolean
}

/**
 * Return the VAT/GST rate (as a percentage integer) for a country.
 * Returns 0 for unknown or tax-free countries.
 */
export function getVatRate(countryCode: string): number {
  return VAT_TABLE[countryCode.toUpperCase()]?.rate ?? 0
}

/**
 * Calculate VAT/GST for a given net amount and country.
 */
export function calculateVat(netAmount: number, countryCode: string): VatResult {
  const code = countryCode.toUpperCase()
  const entry = VAT_TABLE[code]
  const vatRate = entry?.rate ?? 0
  const vatLabel = entry?.label || 'Tax'
  const vatAmount = Math.round(netAmount * vatRate) / 100
  const gross = netAmount + vatAmount

  return {
    country: code,
    countryName: entry?.name ?? code,
    vatLabel,
    vatRate,
    net: netAmount,
    vatAmount,
    gross,
    taxApplicable: vatRate > 0,
  }
}
