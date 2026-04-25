<script setup lang="ts">
interface Props {
  value: string | number
  label: string
  hint?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  align?: 'left' | 'center'
}

withDefaults(defineProps<Props>(), {
  hint: '',
  trend: 'neutral',
  trendValue: '',
  align: 'left'
})
</script>

<template>
  <div :class="['stat', `align-${align}`]">
    <span class="stat-label">{{ label }}</span>
    <div class="stat-value-row">
      <span class="stat-value">{{ value }}</span>
      <span v-if="trendValue" :class="['stat-trend', `trend-${trend}`]">
        <svg v-if="trend === 'up'" viewBox="0 0 20 20" fill="none" width="12" height="12">
          <path d="M5 12l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else-if="trend === 'down'" viewBox="0 0 20 20" fill="none" width="12" height="12">
          <path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ trendValue }}
      </span>
    </div>
    <span v-if="hint" class="stat-hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.stat { display: flex; flex-direction: column; gap: 4px; }
.align-center { align-items: center; text-align: center; }

.stat-label {
  font-size: var(--t-xs);
  font-weight: 500;
  color: var(--mm-slate);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stat-value-row { display: flex; align-items: baseline; gap: 8px; }

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--mm-pearl);
  line-height: 1.1;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--t-xs);
  font-weight: 600;
}
.trend-up { color: var(--mm-seal); }
.trend-down { color: #fca5a5; }
.trend-neutral { color: var(--mm-slate); }

.stat-hint { font-size: var(--t-xs); color: var(--mm-slate); }
</style>
