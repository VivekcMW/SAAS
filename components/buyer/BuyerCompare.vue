<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Compare apps</h1>
        <p class="bw-head__sub">Pick up to 4 apps from your saved list to see them side-by-side.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--ghost" :disabled="picks.length === 0" @click="clearCompare()">Clear</button>
        <button class="bw-btn bw-btn--primary" :disabled="!canCompare" @click="showBriefing = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
          Generate AI Brief
        </button>
      </div>
    </header>

    <!-- Selector -->
    <section class="bw-card">
      <div class="bw-card__head">
        <h2 class="bw-card__title">Select apps to compare</h2>
        <span class="bw-chip bw-chip--neutral">{{ picks.length }} / 4</span>
      </div>
      <div class="picker">
        <label v-for="a in savedApps" :key="a.id" class="picker__chip" :class="{ 'is-on': picks.includes(a.id), 'is-disabled': !picks.includes(a.id) && picks.length >= 4 }">
          <input type="checkbox" :value="a.id" v-model="picks" />
          <span class="picker__logo" :style="{ background: a.color }">{{ a.logo }}</span>
          <span>{{ a.name }}</span>
        </label>
      </div>
    </section>

    <!-- Matrix -->
    <section v-if="picks.length >= 2" class="bw-card bw-section" style="overflow-x: auto;">
      <table class="bw-table compare">
        <thead>
          <tr>
            <th>Feature</th>
            <th v-for="a in selectedApps" :key="a.id">
              <div class="compare__head">
                <div class="compare__logo" :style="{ background: a.color }">{{ a.logo }}</div>
                <div>
                  <div class="compare__name">{{ a.name }}</div>
                  <div class="compare__cat">{{ a.category }}</div>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key">
            <th scope="row" class="compare__row-label">{{ row.label }}</th>
            <td v-for="a in selectedApps" :key="a.id">
              <span v-if="row.render(a) === true" class="bw-chip bw-chip--success">Yes</span>
              <span v-else-if="row.render(a) === false" class="bw-chip bw-chip--neutral">No</span>
              <template v-else>{{ row.render(a) }}</template>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- TCO -->
      <div class="tco">
        <h3 class="tco__title">Total cost estimate</h3>
        <div class="tco__controls">
          <label class="bw-label">Seats
            <input type="number" v-model.number="seats" class="bw-input" min="1" />
          </label>
          <span class="tco__mult">×</span>
          <span class="tco__mult">12 months</span>
        </div>
        <div class="tco__grid">
          <div v-for="a in selectedApps" :key="a.id" class="tco__card">
            <div class="tco__app">{{ a.name }}</div>
            <div class="tco__amount">{{ fmtCurrency(a.priceFrom * seats * 12) }}<span>/year</span></div>
            <div class="tco__detail">${{ a.priceFrom }} × {{ seats }} seats × 12</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Hint -->
    <div v-else class="bw-empty bw-section">
      <div class="bw-empty__icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h6M3 12h6M3 18h6M15 6h6M15 12h6M15 18h6M9 3v18M15 3v18" stroke-linecap="round"/></svg>
      </div>
      <h3 class="bw-empty__title">Pick at least 2 apps</h3>
      <p class="bw-empty__desc">Select 2–4 apps above to see the side-by-side comparison and total-cost estimate.</p>
    </div>
  </div>

  <!-- Briefing modal (mounted outside the scroll container) -->
  <BriefingModal
    v-if="showBriefing"
    :app-ids="picks"
    :app-names="selectedApps.map(a => a.name)"
    @close="showBriefing = false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBuyerData, type SavedApp } from '~/composables/useBuyerData'
import { useCompare } from '~/composables/useCompare'
const { fmtCurrency, fmtNumber } = useFmt()

const { savedApps } = useBuyerData()
const { compareIds, clearCompare, toggleCompare, canCompare } = useCompare()

// picks is a writable computed that reads from the shared compareIds
// For v-model on checkboxes we need a settable array — proxy through toggle
const picks = computed({
  get: () => compareIds.value,
  set: (newVal: string[]) => {
    // Sync: add newly checked items, remove unchecked
    const added = newVal.filter(id => !compareIds.value.includes(id))
    const removed = compareIds.value.filter(id => !newVal.includes(id))
    added.forEach(toggleCompare)
    removed.forEach(toggleCompare)
  }
})

const seats = ref(10)
const showBriefing = ref(false)

const selectedApps = computed(() => savedApps.value.filter(a => compareIds.value.includes(a.id)))

type Row = { key: string; label: string; render: (a: SavedApp) => string | boolean | number }
const rows: Row[] = [
  { key: 'price', label: 'Starting price', render: a => `$${a.priceFrom} / seat / mo` },
  { key: 'trial', label: 'Free trial', render: a => a.trial },
  { key: 'rating', label: 'Rating', render: a => `★ ${a.rating} (${fmtNumber(a.reviews)})` },
  { key: 'soc2', label: 'SOC 2 compliant', render: a => a.soc2 },
  { key: 'integrations', label: 'Key integrations', render: a => a.integrations.slice(0, 3).join(', ') },
  { key: 'status', label: 'Your stage', render: a => a.status.replace('-', ' ') }
]
</script>

<style scoped>
.picker { display: flex; flex-wrap: wrap; gap: 8px; }
.picker__chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px 8px 8px; border: 1px solid var(--bw-border-strong); border-radius: 999px; cursor: pointer; font-size: 0.88rem; font-weight: 500; user-select: none; transition: all .15s ease; }
.picker__chip input { display: none; }
.picker__chip.is-on { background: var(--bw-primary-50); border-color: var(--bw-primary); color: var(--bw-primary-600); }
.picker__chip.is-disabled { opacity: 0.4; pointer-events: none; }
.picker__logo { width: 24px; height: 24px; border-radius: 6px; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-family: var(--f-ui); font-weight: 700; font-size: 0.75rem; }

.compare th, .compare td { min-width: 160px; }
.compare__head { display: flex; align-items: center; gap: 10px; }
.compare__logo { width: 32px; height: 32px; border-radius: 8px; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-family: var(--f-ui); font-weight: 700; font-size: 0.88rem; }
.compare__name { font-weight: 700; color: var(--bw-text); }
.compare__cat { font-size: 0.76rem; color: var(--bw-text-subtle); font-weight: 400; text-transform: none; letter-spacing: 0; }
.compare__row-label { background: var(--bw-surface-2); font-weight: 600; color: var(--bw-text); text-transform: none; font-size: 0.85rem; letter-spacing: 0; }

.tco { margin-top: 24px; padding: 20px; background: var(--bw-surface-2); border-radius: 12px; }
.tco__title { font-family: var(--f-ui); font-weight: 700; font-size: 1rem; margin: 0 0 12px; color: var(--bw-primary); }
.tco__controls { display: flex; align-items: end; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.tco__controls .bw-label { margin: 0; display: flex; flex-direction: column; gap: 4px; }
.tco__controls .bw-input { width: 100px; }
.tco__mult { font-weight: 600; color: var(--bw-text-muted); padding-bottom: 10px; }
.tco__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
.tco__card { background: var(--bw-surface); border: 1px solid var(--bw-border); padding: 14px; border-radius: 10px; }
.tco__app { font-size: 0.8rem; color: var(--bw-text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 4px; }
.tco__amount { font-family: var(--f-ui); font-weight: 700; font-size: 1.4rem; color: var(--bw-text); }
.tco__amount span { font-size: 0.8rem; color: var(--bw-text-muted); font-weight: 500; margin-left: 2px; }
.tco__detail { font-size: 0.78rem; color: var(--bw-text-subtle); margin-top: 2px; }
</style>
