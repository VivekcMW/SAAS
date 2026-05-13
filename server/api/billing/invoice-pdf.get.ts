/**
 * GET /api/billing/invoice-pdf
 * Downloads the current user's latest subscription invoice as a PDF.
 *
 * Returns: application/pdf binary
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'
import { getStripe } from '~/server/utils/stripe'
import { calculateVat } from '~/server/utils/vatRates'
import { buildPdf, rightAlignX, type PdfDoc, type PdfLine, type PdfHRule, type PdfRect } from '~/server/utils/pdfBuilder'

const PLAN_PRICES: Record<string, { name: string; monthly: number }> = {
  starter: { name: 'Starter', monthly: 49 },
  growth: { name: 'Growth', monthly: 149 },
  scale: { name: 'Scale', monthly: 499 },
  enterprise: { name: 'Enterprise', monthly: 0 },
}

// A4 layout constants (pts, origin bottom-left)
const W = 595
const H = 842
const ML = 56
const MR = 539
const BRAND: [number, number, number] = [0.145, 0.396, 0.686]
const DARK: [number, number, number] = [0.059, 0.09, 0.164]
const MID: [number, number, number] = [0.392, 0.455, 0.545]
const LIGHT: [number, number, number] = [0.882, 0.906, 0.941]

interface TaxInfo { taxAmount: number; taxPercent: number; taxLabel: string }

function buildTaxLabel(tax: TaxInfo): string {
  if (tax.taxAmount <= 0) return 'Tax'
  const label = tax.taxLabel || 'Tax'
  return `${label} (${tax.taxPercent}%)`
}

interface StripeInvoice { subtotal?: number; tax?: number; total_tax_amounts?: Array<{ tax_rate: unknown }> }

async function loadStripeTax(subscriptionId: string): Promise<TaxInfo | null> {
  try {
    const stripe = getStripe()
    const invList = await stripe.invoices.list({ subscription: subscriptionId, limit: 1, status: 'paid' })
    const si = invList.data[0] as unknown as StripeInvoice
    if (!si) return null
    const subtotalCents = si.subtotal ?? 0
    const taxCents = si.tax ?? 0
    const taxAmount = taxCents / 100
    const taxPercent = subtotalCents > 0 && taxCents > 0
      ? Math.round((taxCents / subtotalCents) * 100)
      : 0
    const firstRate = si.total_tax_amounts?.[0]
    let taxLabel = ''
    if (firstRate && typeof firstRate.tax_rate === 'object' && firstRate.tax_rate !== null) {
      taxLabel = (firstRate.tax_rate as Record<string, unknown>).display_name as string ?? ''
    }
    return { taxAmount, taxPercent, taxLabel }
  } catch {
    return null
  }
}

interface SubRecord {
  plan: string; stripe_subscription_id: string | null; country_code: string | null
  current_period_start: string | null; current_period_end: string | null
  email: string; first_name: string | null; last_name: string | null; company_name: string | null
  id: string
}

async function resolveTax(sub: SubRecord, subtotal: number): Promise<TaxInfo> {
  if (sub.stripe_subscription_id) {
    const stripeTax = await loadStripeTax(sub.stripe_subscription_id)
    if (stripeTax) return stripeTax
  }
  if (sub.country_code) {
    const vr = calculateVat(subtotal, sub.country_code)
    if (vr.taxApplicable) {
      return { taxAmount: vr.vatAmount, taxPercent: vr.vatRate, taxLabel: vr.vatLabel }
    }
  }
  return { taxAmount: 0, taxPercent: 0, taxLabel: '' }
}

interface InvoiceData {
  invoiceNum: string; periodStart: string; periodEnd: string; issuedDate: string
  planName: string; subtotal: number; tax: TaxInfo; billedName: string
  companyName: string; email: string; subscriptionId: string
}

function buildInvoiceDoc(d: InvoiceData): PdfDoc {
  const lines: PdfLine[] = []
  const hrules: PdfHRule[] = []
  const rects: PdfRect[] = []
  const fmt$ = (n: number) => `USD ${n.toFixed(2)}`
  const total = d.subtotal + d.tax.taxAmount

  // Header band
  rects.push({ x: 0, y: H - 100, w: W, h: 100, fill: BRAND })
  lines.push(
    { font: 'bold', size: 22, x: ML, y: H - 54, text: 'moonmart.ai', color: [1, 1, 1] },
    { font: 'regular', size: 10, x: ML, y: H - 72, text: 'The SaaS Marketplace', color: [0.8, 0.88, 0.98] },
    { font: 'bold', size: 28, x: rightAlignX('INVOICE', 28, MR), y: H - 50, text: 'INVOICE', color: [1, 1, 1] }
  )

  // Right meta block
  const my = H - 135
  lines.push(
    { font: 'bold', size: 9, x: 360, y: my, text: 'Invoice Number', color: MID },
    { font: 'bold', size: 10, x: 360, y: my - 14, text: d.invoiceNum, color: DARK },
    { font: 'bold', size: 9, x: 360, y: my - 36, text: 'Issue Date', color: MID },
    { font: 'regular', size: 10, x: 360, y: my - 50, text: d.issuedDate, color: DARK },
    { font: 'bold', size: 9, x: 360, y: my - 72, text: 'Billing Period', color: MID },
    { font: 'regular', size: 10, x: 360, y: my - 86, text: d.periodStart, color: DARK },
    { font: 'regular', size: 10, x: 360, y: my - 100, text: `to ${d.periodEnd}`, color: DARK }
  )
  rects.push({ x: 360, y: my - 138, w: 60, h: 20, fill: [0.22, 0.73, 0.29] })
  lines.push({ font: 'bold', size: 9, x: 371, y: my - 128, text: 'PAID', color: [1, 1, 1] })

  // Billed-to block
  lines.push(
    { font: 'bold', size: 9, x: ML, y: my, text: 'BILLED TO', color: MID },
    { font: 'bold', size: 11, x: ML, y: my - 16, text: d.billedName, color: DARK }
  )
  let emailY = my - 30
  if (d.companyName) {
    lines.push({ font: 'regular', size: 10, x: ML, y: my - 30, text: d.companyName, color: DARK })
    emailY = my - 44
  }
  lines.push({ font: 'regular', size: 10, x: ML, y: emailY, text: d.email, color: MID })

  // Table
  const tableTop = my - 160
  hrules.push({ y: tableTop + 4, color: LIGHT })
  rects.push({ x: ML, y: tableTop - 22, w: MR - ML, h: 22, fill: [0.973, 0.976, 0.98] })
  lines.push(
    { font: 'bold', size: 9, x: ML + 6, y: tableTop - 14, text: 'DESCRIPTION', color: MID },
    { font: 'bold', size: 9, x: 370, y: tableTop - 14, text: 'PERIOD', color: MID },
    { font: 'bold', size: 9, x: rightAlignX('AMOUNT', 9, MR - 4), y: tableTop - 14, text: 'AMOUNT', color: MID }
  )
  const rowY = tableTop - 50
  lines.push(
    { font: 'bold', size: 11, x: ML + 6, y: rowY + 8, text: `${d.planName} Plan`, color: DARK },
    { font: 'regular', size: 9, x: ML + 6, y: rowY - 6, text: 'Monthly subscription – moonmart.ai', color: MID },
    { font: 'regular', size: 9, x: 370, y: rowY + 8, text: `${d.periodStart} –`, color: MID },
    { font: 'regular', size: 9, x: 370, y: rowY - 6, text: d.periodEnd, color: MID },
    { font: 'bold', size: 11, x: rightAlignX(fmt$(d.subtotal), 11, MR - 4), y: rowY + 8, text: fmt$(d.subtotal), color: DARK }
  )
  hrules.push({ y: rowY - 22, color: LIGHT })

  // Totals
  const totX = 370
  const totValEnd = MR - 4
  let ty = rowY - 44
  lines.push(
    { font: 'regular', size: 10, x: totX, y: ty, text: 'Subtotal', color: MID },
    { font: 'regular', size: 10, x: rightAlignX(fmt$(d.subtotal), 10, totValEnd), y: ty, text: fmt$(d.subtotal), color: DARK }
  )
  ty -= 18
  const taxRowLabel = buildTaxLabel(d.tax)
  const taxRowAmt = d.tax.taxAmount > 0 ? fmt$(d.tax.taxAmount) : 'USD 0.00'
  const taxColor = d.tax.taxAmount > 0 ? DARK : MID
  lines.push(
    { font: 'regular', size: 10, x: totX, y: ty, text: taxRowLabel, color: MID },
    { font: 'regular', size: 10, x: rightAlignX(taxRowAmt, 10, totValEnd), y: ty, text: taxRowAmt, color: taxColor }
  )
  ty -= 18
  hrules.push({ y: ty + 4, x1: totX, color: DARK })
  ty -= 8
  const totalStr = fmt$(total)
  rects.push({ x: totX - 4, y: ty - 4, w: totValEnd - totX + 8, h: 26, fill: BRAND })
  lines.push(
    { font: 'bold', size: 12, x: totX + 4, y: ty + 4, text: 'Total', color: [1, 1, 1] },
    { font: 'bold', size: 12, x: rightAlignX(totalStr, 12, totValEnd), y: ty + 4, text: totalStr, color: [1, 1, 1] }
  )

  // Footer
  hrules.push({ y: 60, color: LIGHT })
  lines.push(
    { font: 'regular', size: 9, x: ML, y: 44, text: 'Thank you for using moonmart.ai  \u00B7  Questions? billing@moonmart.ai', color: MID },
    { font: 'regular', size: 9, x: rightAlignX('moonmart.ai', 9, MR), y: 44, text: 'moonmart.ai', color: BRAND }
  )
  if (d.subscriptionId) {
    lines.push({ font: 'regular', size: 8, x: ML, y: 30, text: `Subscription: ${d.subscriptionId}`, color: LIGHT })
  }

  return { lines, hrules, rects }
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const sub = db.prepare(`
    SELECT s.*, u.email, u.first_name, u.last_name, u.company_name, u.country_code
    FROM user_subscriptions s
    JOIN users u ON u.id = s.user_id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC LIMIT 1
  `).get(user.id) as SubRecord | undefined

  if (!sub) {
    throw createError({ statusCode: 404, statusMessage: 'No active subscription found' })
  }

  const plan = PLAN_PRICES[sub.plan] || { name: sub.plan, monthly: 0 }
  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'

  const subtotal = plan.monthly
  const tax = await resolveTax(sub, subtotal)
  const invoiceNum = `INV-${sub.stripe_subscription_id?.slice(-8)?.toUpperCase() ?? sub.id.slice(-8).toUpperCase()}`

  const invoiceData: InvoiceData = {
    invoiceNum,
    periodStart: fmtDate(sub.current_period_start),
    periodEnd: fmtDate(sub.current_period_end),
    issuedDate: fmtDate(sub.current_period_end ?? new Date().toISOString()),
    planName: plan.name,
    subtotal,
    tax,
    billedName: [sub.first_name, sub.last_name].filter(Boolean).join(' ') || user.fullName || user.email,
    companyName: sub.company_name ?? '',
    email: sub.email,
    subscriptionId: sub.stripe_subscription_id ?? '',
  }

  const pdfBuffer = buildPdf(buildInvoiceDoc(invoiceData))

  setResponseHeader(event, 'Content-Type', 'application/pdf')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${invoiceNum}.pdf"`)
  setResponseHeader(event, 'Content-Length', String(pdfBuffer.length))

  return pdfBuffer
})
