<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  label?: string
  indeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  size: 'md',
  variant: 'primary',
  showLabel: false,
  label: '',
  indeterminate: false
})

const percent = computed(() => {
  if (props.indeterminate) return 0
  return Math.max(0, Math.min(100, (props.value / props.max) * 100))
})
</script>

<template>
  <div class="progress-wrap">
    <div v-if="showLabel || label" class="progress-label-row">
      <span class="progress-label">{{ label }}</span>
      <span v-if="showLabel && !indeterminate" class="progress-percent">{{ Math.round(percent) }}%</span>
    </div>
    <div :class="['progress-track', `prog-${size}`]" :aria-valuenow="value" :aria-valuemax="max">
      <div
        :class="['progress-bar', `bar-${variant}`, { indeterminate }]"
        :style="indeterminate ? undefined : { width: percent + '%' }"
      />
    </div>
  </div>
</template>

<style scoped>
.progress-wrap { width: 100%; display: flex; flex-direction: column; gap: 4px; }

.progress-label-row { display: flex; justify-content: space-between; font-size: var(--t-xs); color: var(--mm-slate); }
.progress-label { font-weight: 500; color: var(--mm-silver); }

.progress-track {
  width: 100%;
  background: var(--mm-s3);
  border-radius: 999px;
  overflow: hidden;
}

.prog-sm { height: 4px; }
.prog-md { height: 6px; }
.prog-lg { height: 10px; }

.progress-bar {
  height: 100%;
  transition: width 200ms ease;
  border-radius: 999px;
}

.bar-primary { background: var(--mm-gold); }
.bar-success { background: var(--mm-sea); }
.bar-warning { background: var(--mm-goldl); }
.bar-danger  { background: #dc2626; }

.progress-bar.indeterminate {
  width: 40%;
  animation: prog-slide 1.2s ease-in-out infinite;
}
@keyframes prog-slide {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}
</style>
