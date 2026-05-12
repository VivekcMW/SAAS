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
        <div class="bw-kpi__value">{{ fmtNumber(totalClicks) }}</div>
      </div>
    </div>

    <p v-if="promotionsLoading" style="padding: 24px; color: var(--vw-text-subtle);">Loading promotions…</p>

    <ul v-else class="promo-list">
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
        <h3 style="font-family: var(--f-ui); margin: 0 0 12px;">New promotion</h3>
        <p style="color: var(--vw-text-muted); font-size: 0.88rem; margin: 0 0 14px;">AI will suggest a discount % based on your conversion rate and competitor offers.</p>
        <label class="bw-label">App listing</label>
        <select v-model="newForm.appId" class="bw-select" style="margin-bottom: 10px;">
          <option value="">Select a listing…</option>
          <option v-for="l in listings" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
        <label class="bw-label">Type</label>
        <select v-model="newForm.type" class="bw-select" style="margin-bottom: 10px;">
          <option value="discount">Discount</option>
          <option value="featured">Featured placement</option>
          <option value="trial-extend">Extended trial</option>
        </select>
        <label class="bw-label">Label / description</label>
        <input v-model="newForm.label" class="bw-input" placeholder="e.g. 20% off annual plan" style="margin-bottom: 10px;" />
        <label class="bw-label">Budget ($)</label>
        <input v-model.number="newForm.budget" type="number" min="0" class="bw-input" placeholder="0" style="margin-bottom: 10px;" />
        <label class="bw-label">Ends at (optional)</label>
        <input v-model="newForm.endsAt" type="date" class="bw-input" style="margin-bottom: 14px;" />
        <div class="vw-ai-card" style="margin-bottom: 12px;">
          <div class="vw-ai-card__title"><span class="vw-ai-chip">AI</span> Recommendation</div>
          <p style="margin: 0; font-size: 0.85rem;">For a 30-day window, a <strong>22% discount</strong> maximises leads without eroding margin. Competitors are at 20–25%.</p>
        </div>
        <p v-if="newFormError" style="font-size:0.82rem; color:var(--vw-danger,#e53e3e); margin:0 0 8px;">{{ newFormError }}</p>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="bw-btn bw-btn--subtle" @click="openNew = false">Cancel</button>
          <button class="bw-btn bw-btn--primary" :disabled="saving" @click="scheduleNew">
            {{ saving ? 'Saving…' : 'Schedule' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
const { promotions, promotionsLoading, loadPromotions, createPromotion, listings } = useVendorData()
const { fmtNumber } = useFmt()

onMounted(loadPromotions)

const openNew = ref(false)
const saving = ref(false)
const newFormError = ref('')
const newForm = ref({ appId: '', type: 'discount' as 'discount' | 'featured' | 'trial-extend', label: '', budget: 0, endsAt: '' })

const active = computed(() => promotions.value.filter(p => p.status === 'active'))
const totalSpend = computed(() => promotions.value.reduce((s, p) => s + p.spend, 0))
const totalBudget = computed(() => promotions.value.reduce((s, p) => s + p.budget, 0))
const totalClicks = computed(() => promotions.value.reduce((s, p) => s + p.clicks, 0))
const totalLeads = computed(() => promotions.value.reduce((s, p) => s + p.leads, 0))
const cpl = computed(() => totalLeads.value ? (totalSpend.value / totalLeads.value).toFixed(0) : '—')

function fmt(n: number) { return fmtNumber(n) }
function statusChip(s: string) {
  if (s === 'active') return 'bw-chip--success'
  if (s === 'scheduled') return 'bw-chip--info'
  return 'bw-chip--neutral'
}

async function scheduleNew() {
  newFormError.value = ''
  if (!newForm.value.appId || !newForm.value.label.trim()) {
    newFormError.value = 'Listing and label are required.'
    return
  }
  saving.value = true
  try {
    await createPromotion({
      appId: newForm.value.appId,
      type: newForm.value.type,
      label: newForm.value.label,
      budget: newForm.value.budget || 0,
      endsAt: newForm.value.endsAt || undefined
    })
    openNew.value = false
    newForm.value = { appId: '', type: 'discount', label: '', budget: 0, endsAt: '' }
  } catch (err: any) {
    newFormError.value = err?.data?.message || err?.statusMessage || 'Failed to create promotion.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.promo-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
.promo { display: flex; flex-direction: column; gap: 10px; }
.promo-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.promo-listing { font-size: 0.78rem; color: var(--vw-text-subtle); }
.promo-label { font-family: var(--f-ui); font-size: 1rem; margin: 2px 0 0; }
.promo-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 10px; background: var(--vw-surface-2); border-radius: 10px; }
.promo-stat { display: flex; flex-direction: column; text-align: center; }
.promo-stat__n { font-weight: 700; font-size: 0.95rem; }
.promo-stat__l { font-size: 0.7rem; color: var(--vw-text-subtle); margin-top: 2px; }
.promo-ai { font-size: 0.84rem; margin: 0; line-height: 1.5; }
.promo-actions { display: flex; gap: 8px; margin-top: 4px; }

.new-modal { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.new-modal__card { width: 100%; max-width: 440px; background: var(--vw-surface); border: 1px solid var(--vw-border-strong); }
</style>
