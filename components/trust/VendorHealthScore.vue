<template>
  <div class="health-score">
    <div class="health-score__ring">
      <svg viewBox="0 0 100 100" width="120" height="120">
        <circle class="ring-track" cx="50" cy="50" r="44" />
        <circle
          class="ring-fill"
          cx="50" cy="50" r="44"
          :style="ringStyle"
          :class="`ring-fill--${labelClass}`"
        />
      </svg>
      <div class="health-score__num">
        <span class="health-score__value">{{ score }}</span>
        <span class="health-score__unit">/100</span>
      </div>
    </div>

    <div class="health-score__meta">
      <p class="health-score__label" :class="`health-score__label--${labelClass}`">{{ label }}</p>

      <ul class="health-score__breakdown" v-if="breakdown">
        <li v-for="item in breakdownItems" :key="item.key">
          <span class="breakdown__name">{{ item.name }}</span>
          <div class="breakdown__bar-wrap">
            <div class="breakdown__bar" :style="{ width: item.pct + '%' }" :class="`ring-fill--${labelClass}`" />
          </div>
          <span class="breakdown__pct">{{ item.pct }}%</span>
        </li>
      </ul>

      <NuxtLink to="/trust/review-algorithm" class="health-score__link">How is this calculated?</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Breakdown {
  verified_pct: number
  response_rate: number
  review_velocity: number
  flagged_count: number
  avg_rating: number
}

const props = defineProps<{ score: number; breakdown?: Breakdown }>()

const label = computed(() => {
  if (props.score >= 85) return 'Excellent'
  if (props.score >= 70) return 'Good'
  if (props.score >= 50) return 'Fair'
  return 'Poor'
})

const labelClass = computed(() => {
  if (props.score >= 85) return 'excellent'
  if (props.score >= 70) return 'good'
  if (props.score >= 50) return 'fair'
  return 'poor'
})

// SVG circumference for r=44 → 2π×44 ≈ 276.46
const CIRC = 2 * Math.PI * 44
const ringStyle = computed(() => ({
  strokeDasharray: CIRC,
  strokeDashoffset: CIRC * (1 - props.score / 100)
}))

const breakdownItems = computed(() => {
  if (!props.breakdown) return []
  return [
    { key: 'verified_pct', name: 'Verified reviews', pct: Math.round(props.breakdown.verified_pct * 100) },
    { key: 'response_rate', name: 'Response rate', pct: Math.round(props.breakdown.response_rate * 100) },
    { key: 'avg_rating', name: 'Avg. rating', pct: Math.round((props.breakdown.avg_rating / 5) * 100) },
    { key: 'review_velocity', name: 'Review recency', pct: Math.min(100, Math.round(props.breakdown.review_velocity * 20)) }
  ]
})
</script>

<style scoped>
.health-score { display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; }
.health-score__ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
.ring-track { fill: none; stroke: #e5e7eb; stroke-width: 10; }
.ring-fill { fill: none; stroke-width: 10; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dashoffset 0.6s ease; }
.ring-fill--excellent { stroke: #16a34a; }
.ring-fill--good      { stroke: #3b82f6; }
.ring-fill--fair      { stroke: #f59e0b; }
.ring-fill--poor      { stroke: #dc2626; }
.health-score__num { position: absolute; text-align: center; }
.health-score__value { display: block; font-size: 1.6rem; font-weight: 700; line-height: 1; }
.health-score__unit  { font-size: 0.7rem; color: #9ca3af; }
.health-score__meta { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 200px; }
.health-score__label { font-size: 1.1rem; font-weight: 700; }
.health-score__label--excellent { color: #16a34a; }
.health-score__label--good      { color: #3b82f6; }
.health-score__label--fair      { color: #f59e0b; }
.health-score__label--poor      { color: #dc2626; }
.health-score__breakdown { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.health-score__breakdown li { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
.breakdown__name { width: 130px; color: #6b7280; flex-shrink: 0; }
.breakdown__bar-wrap { flex: 1; background: #f3f4f6; border-radius: 99px; height: 6px; overflow: hidden; }
.breakdown__bar { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
.breakdown__pct { width: 36px; text-align: right; font-weight: 600; }
.health-score__link { font-size: 0.78rem; color: #6366f1; text-decoration: none; margin-top: 0.25rem; }
.health-score__link:hover { text-decoration: underline; }
</style>
