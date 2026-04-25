<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Promotions</h1>
        <p class="bw-head__sub">Discounts, featured placements, and extended trials — with AI pricing suggestions.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--primary" @click="openNew = true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New promotion
        </button>
      </div>
    </header>

    <div class="bw-kpis">
      <div class="bw-kpi">
        <div class="bw-kpi__label">Active promotions</div>
        <div class="bw-kpi__value">{{ active.length }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Total spend (month)</div>
        <div class="bw-kpi__value">${{ fmt(totalSpend) }}</div>
        <div class="bw-kpi__foot">of ${{ fmt(totalBudget) }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Leads from promos</div>
        <div class="bw-kpi__value">{{ totalLeads }}</div>
        <div class="bw-kpi__foot">CPL ${{ cpl }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Click-through</div>
        <div class="bw-kpi__value">{{ totalClicks.toLocaleString() }}</div>
      </div>
    </div>

    <ul class="promo-list">
      <li v-for="p in promotions" :key="p.id" class="bw-card promo">
        <div class="promo-head">
          <div>
            <div class="promo-listing">{{ p.listingName }}</div>
            <h3 class="promo-label">{{ p.label }}</h3>
          </div>
          <span class="bw-chip" :class="statusChip(p.status)">{{ p.status }}</span>
        </div>
        <div class="promo-stats">
          <div class="promo-stat"><span class="promo-stat__n">${{ fmt(p.spend) }}</span><span class="promo-stat__l">Spent / ${{ fmt(p.budget) }}</span></div>
          <div class="promo-stat"><span class="promo-stat__n">{{ fmt(p.clicks) }}</span><span class="promo-stat__l">Clicks</span></div>
          <div class="promo-stat"><span class="promo-stat__n">{{ p.leads }}</span><span class="promo-stat__l">Leads</span></div>
          <div class="promo-stat"><span class="promo-stat__n">{{ p.endsAt }}</span><span class="promo-stat__l">Ends</span></div>
        </div>
        <div class="vw-health-bar" style="margin: 6px 0 10px;">
          <div class="vw-health-bar__fill vw-health-bar__fill--good" :style="{ width: (p.spend / p.budget * 100) + '%' }" />
        </div>
        <div v-if="p.aiSuggestion" class="vw-ai-card">
          <div class="vw-ai-card__title">
            <span class="vw-ai-chip">AI</span>
            Suggested tweak
          </div>
          <p class="promo-ai">{{ p.aiSuggestion }}</p>
        </div>
        <div class="promo-actions">
          <button class="bw-btn bw-btn--ghost bw-btn--sm">Edit</button>
          <button v-if="p.status === 'active'" class="bw-btn bw-btn--subtle bw-btn--sm">Pause</button>
          <button v-else-if="p.status === 'scheduled'" class="bw-btn bw-btn--subtle bw-btn--sm">Activate now</button>
        </div>
      </li>
    </ul>

    <div v-if="openNew" class="new-modal" @click.self="openNew = false">
      <div class="new-modal__card bw-card">
        <h3 style="font-family: 'Syne'; margin: 0 0 12px;">New promotion</h3>
        <p style="color: var(--vw-text-muted); font-size: 0.88rem; margin: 0 0 14px;">AI will suggest a discount % based on your conversion rate and competitor offers.</p>
        <label class="bw-label">Listing</label>
        <select class="bw-select" style="margin-bottom: 10px;">
          <option>Acme CRM</option>
          <option>Acme Inbox</option>
        </select>
        <label class="bw-label">Type</label>
        <select class="bw-select" style="margin-bottom: 10px;">
          <option>Discount</option>
          <option>Featured placement</option>
          <option>Extended trial</option>
        </select>
        <div class="vw-ai-card" style="margin-bottom: 12px;">
          <div class="vw-ai-card__title"><span class="vw-ai-chip">AI</span> Recommendation</div>
          <p style="margin: 0; font-size: 0.85rem;">For a 30-day window, a <strong>22% discount</strong> maximises leads without eroding margin. Competitors are at 20–25%.</p>
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="bw-btn bw-btn--subtle" @click="openNew = false">Cancel</button>
          <button class="bw-btn bw-btn--primary" @click="openNew = false">Schedule</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { promotions } = useVendorData()

const openNew = ref(false)
const active = computed(() => promotions.value.filter(p => p.status === 'active'))
const totalSpend = computed(() => promotions.value.reduce((s, p) => s + p.spend, 0))
const totalBudget = computed(() => promotions.value.reduce((s, p) => s + p.budget, 0))
const totalClicks = computed(() => promotions.value.reduce((s, p) => s + p.clicks, 0))
const totalLeads = computed(() => promotions.value.reduce((s, p) => s + p.leads, 0))
const cpl = computed(() => totalLeads.value ? (totalSpend.value / totalLeads.value).toFixed(0) : '—')

function fmt(n: number) { return n.toLocaleString() }
function statusChip(s: string) {
  if (s === 'active') return 'bw-chip--success'
  if (s === 'scheduled') return 'bw-chip--info'
  return 'bw-chip--neutral'
}
</script>

<style scoped>
.promo-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
.promo { display: flex; flex-direction: column; gap: 10px; }
.promo-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.promo-listing { font-size: 0.78rem; color: var(--vw-text-subtle); }
.promo-label { font-family: 'Syne'; font-size: 1rem; margin: 2px 0 0; }
.promo-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 10px; background: var(--vw-surface-2); border-radius: 10px; }
.promo-stat { display: flex; flex-direction: column; text-align: center; }
.promo-stat__n { font-weight: 700; font-size: 0.95rem; }
.promo-stat__l { font-size: 0.7rem; color: var(--vw-text-subtle); margin-top: 2px; }
.promo-ai { font-size: 0.84rem; margin: 0; line-height: 1.5; }
.promo-actions { display: flex; gap: 8px; margin-top: 4px; }

.new-modal { position: fixed; inset: 0; background: rgba(17, 24, 39, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.new-modal__card { width: 100%; max-width: 440px; background: white; }
</style>
