import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

const PLAN_PRICES: Record<string, { name: string; monthly: number }> = {
  starter: { name: 'Starter', monthly: 49 },
  growth: { name: 'Growth', monthly: 149 },
  scale: { name: 'Scale', monthly: 499 },
  enterprise: { name: 'Enterprise', monthly: 0 }
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const sub = db.prepare(`
    SELECT s.*, u.email, u.first_name, u.last_name, u.company_name
    FROM user_subscriptions s
    JOIN users u ON u.id = s.user_id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC LIMIT 1
  `).get(user.id) as any

  if (!sub) throw createError({ statusCode: 404, statusMessage: 'No active subscription found' })

  const plan = PLAN_PRICES[sub.plan] || { name: sub.plan, monthly: 0 }
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'
  const periodStart = sub.current_period_start ? new Date(sub.current_period_start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'
  const invoiceNum = `INV-${sub.stripe_subscription_id?.slice(-8)?.toUpperCase() ?? sub.id.slice(-8).toUpperCase()}`
  const total = plan.monthly
  const tax = Math.round(total * 0.00) // VAT/tax if applicable — 0% for now

  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', `inline; filename="${invoiceNum}.html"`)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Invoice ${invoiceNum} – moonmart.ai</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #f8fafc; color: #0f172a; padding: 40px 20px; }
  .page { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 48px; box-shadow: 0 4px 32px rgba(0,0,0,0.08); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .logo { font-size: 1.5rem; font-weight: 800; color: #2563eb; }
  .invoice-label { text-align: right; }
  .invoice-label h1 { font-size: 2rem; font-weight: 800; color: #0f172a; }
  .invoice-label .num { color: #64748b; font-size: 0.9rem; }
  .divider { border: none; border-top: 2px solid #e2e8f0; margin: 24px 0; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .meta-block h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 8px; }
  .meta-block p { font-size: 0.95rem; line-height: 1.6; }
  .meta-block strong { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead th { text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; padding: 10px 0; border-bottom: 2px solid #e2e8f0; }
  tbody td { padding: 14px 0; font-size: 0.95rem; border-bottom: 1px solid #f1f5f9; }
  .amount-col { text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.95rem; }
  .totals-row.total { font-weight: 700; font-size: 1.1rem; border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 12px; }
  .badge { display: inline-flex; align-items: center; gap: 6px; background: #dcfce7; color: #16a34a; border-radius: 99px; padding: 4px 12px; font-size: 0.8rem; font-weight: 600; }
  .footer { margin-top: 48px; text-align: center; font-size: 0.8rem; color: #94a3b8; }
  @media print { body { background: #fff; padding: 0; } .page { box-shadow: none; border-radius: 0; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">moonmart.ai</div>
      <p style="color:#64748b;font-size:0.85rem;margin-top:4px;">The SaaS Marketplace</p>
    </div>
    <div class="invoice-label">
      <h1>Invoice</h1>
      <p class="num">${invoiceNum}</p>
      <div class="badge" style="margin-top: 8px;">Paid</div>
    </div>
  </div>

  <hr class="divider" />

  <div class="meta">
    <div class="meta-block">
      <h3>Billed to</h3>
      <p>
        <strong>${sub.first_name} ${sub.last_name}</strong><br/>
        ${sub.company_name ? `${sub.company_name}<br/>` : ''}
        ${sub.email}
      </p>
    </div>
    <div class="meta-block" style="text-align: right;">
      <h3>Bill from</h3>
      <p>
        <strong>moonmart.ai</strong><br/>
        billing@moonmart.ai
      </p>
      <div style="margin-top: 16px;">
        <h3>Billing period</h3>
        <p>${periodStart} – ${periodEnd}</p>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Period</th>
        <th class="amount-col">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${plan.name} Plan</strong><br/><span style="color:#64748b;font-size:0.85rem;">Monthly subscription – moonmart.ai vendor listing</span></td>
        <td style="color:#64748b;">${periodStart} – ${periodEnd}</td>
        <td class="amount-col">$${total.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>$${total.toFixed(2)}</span></div>
    <div class="totals-row"><span>Tax (0%)</span><span>$${tax.toFixed(2)}</span></div>
    <div class="totals-row total"><span>Total</span><span>$${(total + tax).toFixed(2)} USD</span></div>
  </div>

  <div class="footer">
    <p>Thank you for using moonmart.ai &bull; Questions? billing@moonmart.ai</p>
    <p style="margin-top: 4px;">Subscription ID: ${sub.stripe_subscription_id}</p>
  </div>
</div>
</body>
</html>`
})
