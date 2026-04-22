<script setup lang="ts">
interface Tab {
  label: string
  value: string | number
  disabled?: boolean
  count?: number
}

interface Props {
  modelValue: string | number
  tabs: Tab[]
  variant?: 'line' | 'pill'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'line',
  size: 'md'
})

const emit = defineEmits<{ 'update:modelValue': [string | number] }>()

const select = (t: Tab) => {
  if (t.disabled) return
  emit('update:modelValue', t.value)
}
</script>

<template>
  <div :class="['tabs', `tabs-${variant}`, `tabs-${size}`]" role="tablist">
    <button
      v-for="t in tabs"
      :key="t.value"
      role="tab"
      :aria-selected="modelValue === t.value"
      :disabled="t.disabled"
      :class="['tab', { active: modelValue === t.value }]"
      @click="select(t)"
    >
      {{ t.label }}
      <span v-if="typeof t.count === 'number'" class="tab-count">{{ t.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.tabs { display: flex; gap: 4px; }

.tabs-line { border-bottom: 0.5px solid #e5e7eb; gap: 0; }
.tabs-pill { background: #f3f4f6; padding: 3px; border-radius: 6px; gap: 2px; }

.tab {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-family: inherit;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 150ms ease, color 150ms ease;
}

.tabs-sm .tab { padding: 6px 12px; font-size: 13px; }
.tabs-md .tab { padding: 8px 16px; font-size: 14px; }

.tabs-line .tab {
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  border-radius: 0;
}
.tabs-line .tab:hover { color: #1f2937; }
.tabs-line .tab.active { color: #ff8838; border-bottom-color: #ff8838; }

.tabs-pill .tab { border-radius: 4px; }
.tabs-pill .tab:hover { color: #1f2937; }
.tabs-pill .tab.active { background: #ffffff; color: #1f2937; }

.tab:disabled { opacity: 0.5; cursor: not-allowed; }

.tab-count {
  background: #f3f4f6;
  color: #6b7280;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
.tab.active .tab-count { background: #fff3e6; color: #b45309; }
</style>
