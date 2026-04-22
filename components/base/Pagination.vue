<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  total: number
  perPage?: number
  siblingCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 10,
  siblingCount: 1
})

const emit = defineEmits<{ 'update:modelValue': [number] }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))

const pages = computed<(number | string)[]>(() => {
  const tp = totalPages.value
  const cur = props.modelValue
  const s = props.siblingCount
  const range: (number | string)[] = []
  const start = Math.max(2, cur - s)
  const end = Math.min(tp - 1, cur + s)

  range.push(1)
  if (start > 2) range.push('…')
  for (let i = start; i <= end; i++) range.push(i)
  if (end < tp - 1) range.push('…')
  if (tp > 1) range.push(tp)
  return range
})

const go = (p: number) => {
  if (p < 1 || p > totalPages.value || p === props.modelValue) return
  emit('update:modelValue', p)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="Pagination">
    <button
      class="page-btn"
      :disabled="modelValue <= 1"
      aria-label="Previous"
      @click="go(modelValue - 1)"
    >
      <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
        <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <button
      v-for="(p, idx) in pages"
      :key="idx"
      :class="['page-btn', { active: p === modelValue, ellipsis: typeof p === 'string' }]"
      :disabled="typeof p === 'string'"
      @click="typeof p === 'number' && go(p)"
    >
      {{ p }}
    </button>
    <button
      class="page-btn"
      :disabled="modelValue >= totalPages"
      aria-label="Next"
      @click="go(modelValue + 1)"
    >
      <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
        <path d="M8 4l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </nav>
</template>

<style scoped>
.pagination { display: flex; gap: 4px; align-items: center; }

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}
.page-btn:hover:not(:disabled):not(.active) { background: #f9fafb; }
.page-btn.active { background: #ff8838; border-color: #ff8838; color: #ffffff; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-btn.ellipsis { border: none; background: transparent; cursor: default; }
</style>
