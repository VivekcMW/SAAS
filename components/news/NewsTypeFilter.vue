<template>
  <div class="type-filter" aria-label="Filter by post type">
    <button
      v-for="item in items"
      :key="item.value ?? 'all'"
      class="type-filter__pill"
      :class="{ 'type-filter__pill--active': active === item.value }"
      :data-type="item.value || 'all'"
      @click="select(item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const active = computed(() => props.modelValue || null)

const items = [
  { value: null,             label: 'All' },
  { value: 'product-update', label: 'Product Update' },
  { value: 'feature',        label: 'Feature' },
  { value: 'case-study',     label: 'Case Study' },
  { value: 'culture',        label: 'Culture' },
  { value: 'announcement',   label: 'Announcement' }
]

function select(val: string | null) {
  emit('update:modelValue', val)
}
</script>

<style scoped>
.type-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.type-filter__pill {
  padding: 6px 14px;
  border-radius: var(--r-full);
  border: 0.5px solid var(--b1);
  background: var(--mm-s1);
  color: var(--mm-silver);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
  white-space: nowrap;
}
.type-filter__pill:hover {
  border-color: var(--b2);
  color: var(--mm-pearl);
}
.type-filter__pill--active {
  background: var(--mm-s2);
  border-color: var(--b2);
  color: var(--mm-pearl);
}
.type-filter__pill--active[data-type="product-update"] { border-color: #4a80d4; color: #6fa0e8; }
.type-filter__pill--active[data-type="feature"]        { border-color: var(--mm-gold); color: var(--mm-goldl); }
.type-filter__pill--active[data-type="case-study"]     { border-color: var(--mm-sea); color: var(--mm-sea); }
.type-filter__pill--active[data-type="culture"]        { border-color: #9467bd; color: #c39de0; }
.type-filter__pill--active[data-type="announcement"]   { border-color: #e5654a; color: #f08070; }
</style>
