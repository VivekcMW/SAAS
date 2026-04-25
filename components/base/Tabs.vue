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

.tabs-line { border-bottom: 0.5px solid var(--b1); gap: 0; }
.tabs-pill { background: var(--mm-s3); padding: 3px; border-radius: var(--r-md); gap: 2px; }

.tab {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--mm-slate);
  font-family: var(--f-ui);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 150ms ease, color 150ms ease;
}

.tabs-sm .tab { padding: 6px 12px; font-size: var(--t-sm); }
.tabs-md .tab { padding: 8px 16px; font-size: var(--t-base); }

.tabs-line .tab {
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  border-radius: 0;
}
.tabs-line .tab:hover { color: var(--mm-pearl); }
.tabs-line .tab.active { color: var(--mm-gold); border-bottom-color: var(--mm-gold); }

.tabs-pill .tab { border-radius: var(--r-sm); }
.tabs-pill .tab:hover { color: var(--mm-pearl); }
.tabs-pill .tab.active { background: var(--mm-s2); color: var(--mm-pearl); }

.tab:disabled { opacity: 0.5; cursor: not-allowed; }

.tab-count {
  background: var(--mm-s2);
  color: var(--mm-slate);
  padding: 1px 6px;
  border-radius: var(--r-full);
  font-size: var(--t-xs);
  font-weight: 600;
  border: .5px solid var(--b1);
}
.tab.active .tab-count { background: var(--mm-gold-soft); color: var(--mm-goldl); border-color: var(--mm-gold); }
</style>
