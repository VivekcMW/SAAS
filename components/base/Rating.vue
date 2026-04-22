<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
  showValue?: boolean
  precision?: 0.5 | 1
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  max: 5,
  size: 'md',
  readonly: false,
  showValue: false,
  precision: 0.5
})

const emit = defineEmits<{ 'update:modelValue': [number] }>()

const stars = computed(() => {
  return Array.from({ length: props.max }, (_, i) => {
    const v = props.modelValue - i
    if (v >= 1) return 'full'
    if (v >= 0.5) return 'half'
    return 'empty'
  })
})

const click = (i: number, e: MouseEvent) => {
  if (props.readonly) return
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const half = (e.clientX - rect.left) < rect.width / 2 && props.precision === 0.5
  emit('update:modelValue', half ? i + 0.5 : i + 1)
}
</script>

<template>
  <span :class="['rating', `r-${size}`, { readonly }]">
    <button
      v-for="(state, i) in stars"
      :key="i"
      type="button"
      :class="['star', `star-${state}`]"
      :disabled="readonly"
      :aria-label="`${i + 1} star${i ? 's' : ''}`"
      @click="click(i, $event)"
    >
      <svg viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient :id="`half-${i}`" x1="0" x2="100%" y1="0" y2="0">
            <stop offset="50%" stop-color="#f59e0b" />
            <stop offset="50%" stop-color="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          :fill="state === 'full' ? '#f59e0b' : state === 'half' ? `url(#half-${i})` : '#e5e7eb'"
        />
      </svg>
    </button>
    <span v-if="showValue" class="rating-value">{{ modelValue.toFixed(1) }}</span>
  </span>
</template>

<style scoped>
.rating { display: inline-flex; align-items: center; gap: 2px; }
.readonly .star { cursor: default; }

.star {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  line-height: 0;
  transition: transform 120ms ease;
}
.star:hover:not(:disabled) { transform: scale(1.08); }

.r-sm svg { width: 14px; height: 14px; }
.r-md svg { width: 18px; height: 18px; }
.r-lg svg { width: 24px; height: 24px; }

.rating-value { margin-left: 6px; font-size: 13px; font-weight: 600; color: #1f2937; }
</style>
