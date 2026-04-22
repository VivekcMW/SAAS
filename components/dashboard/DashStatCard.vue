<template>
  <div class="dash-stat">
    <div class="dash-stat__row">
      <div class="dash-stat__icon" aria-hidden="true" v-html="icon" />
      <span v-if="delta" class="dash-stat__delta" :class="deltaClass">
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
          <path :d="isNegative ? 'M7 10l5 5 5-5' : 'M7 14l5-5 5 5'" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ delta }}
      </span>
    </div>
    <div class="dash-stat__value">{{ value }}</div>
    <div class="dash-stat__label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  delta?: string
  icon: string
  tone?: 'up' | 'down' | 'neutral'
}>()

const isNegative = computed(() => props.tone === 'down' || (props.delta || '').trim().startsWith('-'))
const deltaClass = computed(() => {
  if (isNegative.value) return 'is-down'
  if (props.tone === 'neutral') return 'is-neutral'
  return 'is-up'
})
</script>

<style scoped>
.dash-stat {
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 14px;
  padding: 1.1rem 1.25rem 1.2rem;
  transition: all 0.15s ease;
}
.dash-stat:hover {
  border-color: #e4e0dc;
  box-shadow: 0 10px 24px -18px rgba(15, 23, 42, 0.15);
}
.dash-stat__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}
.dash-stat__icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dash-stat__delta {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
}
.dash-stat__delta.is-up { color: #15803d; background: #dcfce7; }
.dash-stat__delta.is-down { color: #b91c1c; background: #fee2e2; }
.dash-stat__delta.is-neutral { color: #52525b; background: #f4f4f5; }

.dash-stat__value {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e1e1e;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.dash-stat__label {
  color: #71717a;
  font-size: 0.82rem;
  margin-top: 0.2rem;
}
</style>
