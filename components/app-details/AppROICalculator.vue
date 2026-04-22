<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  appName: string
  pricePerSeat?: number
  pricePeriod?: string
}

const props = withDefaults(defineProps<Props>(), {
  pricePerSeat: 29,
  pricePeriod: 'month'
})

const teamSize = ref(10)
const hoursSavedPerWeek = ref(3)
const hourlyRate = ref(50)

// Annual seat cost
const annualCost = computed(() => {
  const monthly = props.pricePeriod === 'year' ? props.pricePerSeat / 12 : props.pricePerSeat
  return monthly * 12 * teamSize.value
})

// Annual time savings
const annualSavings = computed(() => {
  return hoursSavedPerWeek.value * 52 * hourlyRate.value * teamSize.value
})

const netRoi = computed(() => annualSavings.value - annualCost.value)
const roiMultiplier = computed(() => {
  if (annualCost.value === 0) return 0
  return annualSavings.value / annualCost.value
})

const paybackMonths = computed(() => {
  const monthlySavings = annualSavings.value / 12
  if (monthlySavings === 0) return 0
  const monthlyCost = annualCost.value / 12
  if (monthlySavings <= monthlyCost) return Infinity
  return Math.ceil(monthlyCost / (monthlySavings - monthlyCost) * 1)
})

function formatMoney(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`
  }
  return `$${Math.round(value).toLocaleString()}`
}

function paybackLabel(): string {
  if (paybackMonths.value === Infinity) return '—'
  if (paybackMonths.value <= 1) return '< 1 month'
  return `${paybackMonths.value} months`
}
</script>

<template>
  <div class="roi-calc">
    <header class="roi-header">
      <div>
        <h3 class="roi-title">
          <Icon name="heroicons:calculator" />
          ROI Calculator
        </h3>
        <p class="roi-sub">Estimate the return on investing in {{ appName }}</p>
      </div>
    </header>

    <div class="roi-grid">
      <!-- Inputs -->
      <div class="roi-inputs">
        <div class="input-row">
          <div class="input-meta">
            <span class="input-label">Team size</span>
            <span class="input-val">{{ teamSize }} users</span>
          </div>
          <input v-model.number="teamSize" type="range" min="1" max="500" step="1" class="roi-range" aria-label="Team size" />
        </div>

        <div class="input-row">
          <div class="input-meta">
            <span class="input-label">Hours saved per user / week</span>
            <span class="input-val">{{ hoursSavedPerWeek }}h</span>
          </div>
          <input v-model.number="hoursSavedPerWeek" type="range" min="0" max="20" step="0.5" class="roi-range" aria-label="Hours saved per user per week" />
        </div>

        <div class="input-row">
          <div class="input-meta">
            <span class="input-label">Average hourly rate</span>
            <span class="input-val">${{ hourlyRate }}/hr</span>
          </div>
          <input v-model.number="hourlyRate" type="range" min="10" max="250" step="5" class="roi-range" aria-label="Average hourly rate" />
        </div>
      </div>

      <!-- Results -->
      <div class="roi-results">
        <div class="result-card">
          <span class="result-label">Annual cost</span>
          <span class="result-value cost">{{ formatMoney(annualCost) }}</span>
        </div>
        <div class="result-card">
          <span class="result-label">Annual time savings</span>
          <span class="result-value savings">{{ formatMoney(annualSavings) }}</span>
        </div>
        <div class="result-card highlight">
          <span class="result-label">Net annual ROI</span>
          <span class="result-value" :class="netRoi >= 0 ? 'gain' : 'loss'">
            {{ netRoi >= 0 ? '+' : '' }}{{ formatMoney(netRoi) }}
          </span>
          <span v-if="roiMultiplier > 0" class="result-meta">
            {{ roiMultiplier.toFixed(1) }}× return · payback in {{ paybackLabel() }}
          </span>
        </div>
      </div>
    </div>

    <p class="roi-disclaimer">
      <Icon name="heroicons:information-circle" />
      Estimates only. Actual ROI depends on adoption, workflow fit, and integration depth.
    </p>
  </div>
</template>

<style scoped>
.roi-calc {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.roi-header { margin-bottom: 16px; }
.roi-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
.roi-title :deep(svg) { width: 18px; height: 18px; color: #ff8838; }
.roi-sub { margin: 4px 0 0; font-size: 13px; color: #6b7280; }

.roi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.roi-inputs { display: flex; flex-direction: column; gap: 16px; }

.input-row { display: flex; flex-direction: column; gap: 6px; }
.input-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
}
.input-label { color: #6b7280; }
.input-val { color: #111827; font-weight: 600; font-size: 13px; }

.roi-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.roi-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff8838;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px #ff8838;
}
.roi-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff8838;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px #ff8838;
}

.roi-results { display: flex; flex-direction: column; gap: 8px; }

.result-card {
  background: #f9fafb;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.result-card.highlight {
  background: #fffaf5;
  border-color: #ffedd5;
}
.result-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
.result-value { font-size: 20px; font-weight: 700; color: #111827; }
.result-value.cost { color: #6b7280; font-size: 16px; }
.result-value.savings { color: #047857; font-size: 16px; }
.result-value.gain { color: #047857; }
.result-value.loss { color: #dc2626; }
.result-meta { font-size: 11px; color: #b45309; font-weight: 600; }

.roi-disclaimer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
  margin: 12px 0 0;
}
.roi-disclaimer :deep(svg) { width: 12px; height: 12px; }

@media (max-width: 720px) {
  .roi-grid { grid-template-columns: 1fr; }
}
</style>
