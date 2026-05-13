<template>
  <div class="pi">
    <div class="pi-head">
      <div>
        <h3 class="pi-title">Community Pricing Intelligence</h3>
        <p class="pi-sub">Real prices paid by verified buyers — sourced anonymously from the Moonmart community.</p>
      </div>
      <button class="pi-report-btn" @click="showForm = !showForm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Report your price
      </button>
    </div>

    <!-- Report form -->
    <form v-if="showForm" class="pi-form" @submit.prevent="submitReport">
      <div class="pi-form-row">
        <div class="pi-field">
          <label class="pi-label">Plan name</label>
          <input v-model="form.planName" class="pi-input" placeholder="e.g. Pro, Business, Enterprise" required >
        </div>
        <div class="pi-field">
          <label class="pi-label">Price (USD/mo)</label>
          <input v-model.number="form.price" type="number" min="0" step="0.01" class="pi-input" placeholder="99" required >
        </div>
        <div class="pi-field">
          <label class="pi-label">Seats</label>
          <input v-model.number="form.seats" type="number" min="1" class="pi-input" placeholder="10" >
        </div>
        <div class="pi-field">
          <label class="pi-label">Billing</label>
          <select v-model="form.billing" class="pi-input">
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
            <option value="custom">Custom / Enterprise</option>
          </select>
        </div>
      </div>
      <div class="pi-form-actions">
        <button type="submit" class="pi-btn pi-btn--primary" :disabled="submitting">
          {{ submitting ? 'Submitting…' : 'Submit anonymously' }}
        </button>
        <button type="button" class="pi-btn pi-btn--ghost" @click="showForm = false">Cancel</button>
        <span v-if="submitMsg" class="pi-submit-msg" :class="submitOk ? 'pi-ok' : 'pi-err'">{{ submitMsg }}</span>
      </div>
    </form>

    <!-- Loading skeleton -->
    <div v-if="loading" class="pi-skeleton-wrap">
      <div v-for="i in 3" :key="i" class="pi-skeleton" />
    </div>

    <!-- No data yet -->
    <div v-else-if="!loading && aggregates.length === 0" class="pi-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      <p>No community pricing data yet. Be the first to report your price.</p>
    </div>

    <!-- Aggregates table -->
    <div v-else class="pi-table-wrap">
      <table class="pi-table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Min</th>
            <th>Median</th>
            <th>Max</th>
            <th>Avg</th>
            <th>Samples</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in aggregates" :key="row.plan_name">
            <td class="pi-plan">{{ row.plan_name }}</td>
            <td>${{ fmt(row.min_price) }}</td>
            <td class="pi-median">${{ fmt(row.median_price) }}</td>
            <td>${{ fmt(row.max_price) }}</td>
            <td>${{ fmt(row.avg_price) }}</td>
            <td>
              <span class="pi-sample">{{ row.sample_count }}</span>
            </td>
            <td class="pi-date">{{ relDate(row.last_updated) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Recent raw reports -->
    <details v-if="recentReports.length" class="pi-details">
      <summary class="pi-details-summary">{{ recentReports.length }} recent reports</summary>
      <ul class="pi-reports">
        <li v-for="(rep, i) in recentReports" :key="i" class="pi-report-row">
          <span class="pi-plan">{{ rep.plan_name }}</span>
          <span class="pi-amt">${{ fmt(rep.price_usd) }}/{{ rep.billing_period }}</span>
          <span v-if="rep.seats" class="pi-seats">{{ rep.seats }} seats</span>
          <span class="pi-date">{{ relDate(rep.created_at) }}</span>
        </li>
      </ul>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ appId: string }>()

interface Aggregate {
  plan_name: string
  min_price: number
  max_price: number
  avg_price: number
  median_price: number
  sample_count: number
  last_updated: string
}
interface RecentReport {
  plan_name: string
  price_usd: number
  billing_period: string
  seats: number | null
  created_at: string
}

const loading = ref(true)
const aggregates = ref<Aggregate[]>([])
const recentReports = ref<RecentReport[]>([])
const showForm = ref(false)
const submitting = ref(false)
const submitMsg = ref('')
const submitOk = ref(false)

const form = ref({ planName: '', price: null as number | null, seats: null as number | null, billing: 'monthly' })

onMounted(async () => {
  try {
    const data = await $fetch<{ aggregates: Aggregate[]; recent_reports: RecentReport[] }>(`/api/prices/${props.appId}`)
    aggregates.value = data.aggregates
    recentReports.value = data.recent_reports
  } catch {
    // App not in DB or no data — silently stay empty
  } finally {
    loading.value = false
  }
})

async function submitReport() {
  if (!form.value.price || !form.value.planName.trim()) return
  submitting.value = true
  submitMsg.value = ''
  try {
    await $fetch('/api/prices/report', {
      method: 'POST',
      body: {
        appId: props.appId,
        planName: form.value.planName,
        priceUsd: form.value.price,
        seats: form.value.seats,
        billingPeriod: form.value.billing
      }
    })
    submitMsg.value = 'Thank you — your report has been recorded.'
    submitOk.value = true
    form.value = { planName: '', price: null, seats: null, billing: 'monthly' }
    showForm.value = false
    // Refresh aggregates
    const data = await $fetch<{ aggregates: Aggregate[]; recent_reports: RecentReport[] }>(`/api/prices/${props.appId}`)
    aggregates.value = data.aggregates
    recentReports.value = data.recent_reports
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    submitMsg.value = err?.data?.statusMessage ?? 'Submission failed. Please try again.'
    submitOk.value = false
  } finally {
    submitting.value = false
  }
}

function fmt(n: number | null) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function relDate(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}
</script>

<style scoped>
.pi {
  background: var(--mm-s1, #0F1220);
  border: 0.5px solid var(--b2, rgba(255,255,255,0.08));
  border-radius: 14px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.pi-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.pi-title { font-size: 1rem; font-weight: 700; margin: 0 0 4px; }
.pi-sub { font-size: 0.82rem; color: var(--mm-text-muted, rgba(255,255,255,0.5)); margin: 0; }

.pi-report-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 8px; font-size: 0.82rem;
  background: transparent; border: 0.5px solid var(--b2, rgba(255,255,255,0.12));
  color: inherit; cursor: pointer; white-space: nowrap;
  transition: background 0.15s;
}
.pi-report-btn:hover { background: rgba(255,255,255,0.05); }

.pi-form {
  background: var(--mm-s2, #161B2E);
  border: 0.5px solid var(--b2, rgba(255,255,255,0.08));
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pi-form-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.pi-field { display: flex; flex-direction: column; gap: 4px; }
.pi-label { font-size: 0.78rem; color: var(--mm-text-muted, rgba(255,255,255,0.5)); }
.pi-input {
  background: var(--mm-s3, #1F2742);
  border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
  border-radius: 7px;
  color: inherit;
  font-size: 0.85rem;
  padding: 7px 10px;
  font-family: var(--f-ui);
}
.pi-input:focus { outline: none; border-color: var(--mm-blue, #4A80D4); }
.pi-form-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.pi-btn {
  padding: 7px 16px; border-radius: 8px; font-size: 0.84rem;
  cursor: pointer; font-family: var(--f-ui); border: none;
  transition: opacity 0.15s;
}
.pi-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pi-btn--primary { background: var(--mm-blue, #4A80D4); color: #fff; }
.pi-btn--primary:hover:not(:disabled) { opacity: 0.85; }
.pi-btn--ghost { background: transparent; border: 0.5px solid var(--b2, rgba(255,255,255,0.1)); color: inherit; }
.pi-btn--ghost:hover { background: rgba(255,255,255,0.04); }
.pi-submit-msg { font-size: 0.8rem; }
.pi-ok { color: #34d399; }
.pi-err { color: #f87171; }

.pi-skeleton-wrap { display: flex; flex-direction: column; gap: 8px; }
.pi-skeleton { height: 36px; border-radius: 8px; background: rgba(255,255,255,0.05); animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }

.pi-empty {
  display: flex; align-items: center; gap: 12px;
  color: var(--mm-text-muted, rgba(255,255,255,0.4));
  font-size: 0.85rem;
  padding: 12px 0;
}

.pi-table-wrap { overflow-x: auto; }
.pi-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.pi-table th {
  text-align: left; padding: 6px 10px;
  font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--mm-text-muted, rgba(255,255,255,0.4));
  border-bottom: 0.5px solid var(--b2, rgba(255,255,255,0.08));
}
.pi-table td {
  padding: 10px 10px;
  border-bottom: 0.5px solid var(--b1, rgba(255,255,255,0.05));
  color: var(--mm-text, rgba(255,255,255,0.85));
}
.pi-plan { font-weight: 600; }
.pi-median { font-weight: 700; color: var(--mm-gold, #D4A843); }
.pi-sample {
  display: inline-block; padding: 2px 8px; border-radius: 10px;
  background: rgba(255,255,255,0.06); font-size: 0.78rem;
}
.pi-date { color: var(--mm-text-muted, rgba(255,255,255,0.4)); font-size: 0.78rem; }

.pi-details { margin-top: -4px; }
.pi-details-summary {
  font-size: 0.8rem; color: var(--mm-text-muted, rgba(255,255,255,0.4));
  cursor: pointer; list-style: none; padding: 4px 0;
}
.pi-details-summary:hover { color: var(--mm-text, rgba(255,255,255,0.7)); }
.pi-reports { list-style: none; padding: 8px 0 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.pi-report-row { display: flex; gap: 12px; align-items: center; font-size: 0.82rem; }
.pi-amt { color: var(--mm-gold, #D4A843); }
.pi-seats { color: var(--mm-text-muted, rgba(255,255,255,0.5)); }
</style>
