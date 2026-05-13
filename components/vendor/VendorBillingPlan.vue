<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Billing &amp; plan</h1>
        <p class="bw-head__sub">Your subscription, invoices, and payment method.</p>
      </div>
    </header>

    <div v-if="subPending" class="bw-card" style="padding: 2rem; color: var(--vw-text-muted);">Loading billing data…</div>
    <div v-else-if="subError" class="bw-card" style="padding: 2rem; color: #e53e3e;">Could not load subscription data. Please refresh.</div>
    <template v-else>
      <div class="bw-card bp-plan">
        <div>
          <div class="bp-plan__tag">Current plan</div>
          <h2 class="bp-plan__name">{{ sub?.planName ?? 'Free' }}</h2>
          <p class="bp-plan__price">
            {{ sub?.planPrice ?? '$0' }} / month
            <template v-if="sub?.currentPeriodEnd">
              · {{ sub.cancelAtPeriodEnd ? 'cancels on' : 'renews on' }} {{ formatDate(sub.currentPeriodEnd) }}
            </template>
          </p>
          <ul class="bp-feats">
            <li>Unlimited listings</li>
            <li>AI copilot + content assistant</li>
            <li>Promotions &amp; featured placements</li>
            <li>Priority support</li>
          </ul>
        </div>
        <div class="bp-plan__actions">
          <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="openPortal">Change plan</button>
          <button v-if="sub?.active && !sub?.cancelAtPeriodEnd" class="bw-btn bw-btn--subtle bw-btn--sm" :disabled="cancelling" @click="cancelPlan">
            {{ cancelling ? 'Cancelling…' : 'Cancel' }}
          </button>
          <span v-else-if="sub?.cancelAtPeriodEnd" style="font-size: 0.8rem; color: var(--vw-text-muted);">Cancellation pending</span>
        </div>
      </div>

      <div class="bw-grid bw-grid--main-aside">
        <section class="bw-card">
          <h2 class="bw-card__title">Invoices</h2>
          <div v-if="!sub?.invoices?.length" style="color: var(--vw-text-muted); font-size: 0.9rem; padding: 8px 0;">No invoices yet.</div>
          <table v-else class="bw-table">
            <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th/></tr></thead>
            <tbody>
              <tr v-for="i in sub.invoices" :key="i.id">
                <td>{{ i.date }}</td>
                <td>{{ i.description }}</td>
                <td>${{ i.amount.toFixed(2) }}</td>
                <td><span class="bw-chip bw-chip--success">paid</span></td>
                <td>
                  <a v-if="i.invoiceUrl" :href="i.invoiceUrl" target="_blank" rel="noopener" class="bw-link">Download</a>
                  <a v-else href="/api/billing/invoice" target="_blank" rel="noopener" class="bw-link">View</a>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <aside class="bw-card">
          <h2 class="bw-card__title">Payment method</h2>
          <div v-if="pmPending" style="color: var(--vw-text-muted); font-size: 0.87rem;">Loading…</div>
          <div v-else-if="pm?.card" class="bp-card">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            <div>
              <div>{{ pm.card.brand.charAt(0).toUpperCase() + pm.card.brand.slice(1) }} ending in {{ pm.card.last4 }}</div>
              <div class="bp-card__sub">Expires {{ pm.card.expMonth.toString().padStart(2, '0') }}/{{ pm.card.expYear }}</div>
            </div>
          </div>
          <div v-else class="bp-card" style="color: var(--vw-text-muted); font-size: 0.87rem;">No payment method on file.</div>
          <button class="bw-btn bw-btn--subtle bw-btn--sm" style="margin-top: 10px;" @click="openPortal">Update card</button>
        </aside>
      </div>
    </template>

    <div v-if="toast" class="bw-toast-fixed">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { data: sub, pending: subPending, error: subError } = await useFetch<{
  planName: string
  planPrice: string
  status: string
  active: boolean
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  invoices: Array<{ id: string; date: string; description: string; amount: number; invoiceUrl: string | null }>
}>('/api/billing/subscription')

const { data: pm, pending: pmPending } = await useFetch<{
  card: { brand: string; last4: string; expMonth: number; expYear: number } | null
}>('/api/billing/payment-method')

const cancelling = ref(false)
const toast = ref('')

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function openPortal() {
  window.location.href = '/api/billing/portal'
}

async function cancelPlan() {
  if (!confirm(`Cancel your ${sub.value?.planName ?? ''} plan? You will keep access until the end of this billing period.`)) return
  cancelling.value = true
  try {
    await $fetch('/api/billing/cancel', { method: 'POST' })
    toast.value = 'Subscription cancelled. You have access until the end of the billing period.'
  } catch (err: any) {
    toast.value = err?.data?.statusMessage || 'Failed to cancel. Please contact support.'
  } finally {
    cancelling.value = false
    setTimeout(() => toast.value = '', 4000)
  }
}
</script>

<style scoped>
.bp-plan { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
.bp-plan__tag { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--vw-text-subtle); font-weight: 600; }
.bp-plan__name { font-family: var(--f-ui); font-size: 1.5rem; margin: 4px 0; }
.bp-plan__price { color: var(--vw-text-muted); margin: 0 0 12px; font-size: 0.9rem; }
.bp-feats { margin: 0; padding-left: 20px; font-size: 0.88rem; }
.bp-feats li { margin-bottom: 4px; }
.bp-plan__actions { display: flex; gap: 8px; }
.bp-card { display: flex; gap: 10px; align-items: center; font-size: 0.9rem; font-weight: 500; }
.bp-card__sub { color: var(--vw-text-subtle); font-size: 0.78rem; font-weight: 400; }
</style>
