<script setup lang="ts">
interface Props {
  ariaLabel: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'solid'
  disabled?: boolean
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'ghost',
  disabled: false,
  active: false
})

defineEmits<{ click: [MouseEvent] }>()
</script>

<template>
  <button
    type="button"
    :aria-label="ariaLabel"
    :aria-pressed="active"
    :disabled="disabled"
    :class="['icon-btn', `ib-${size}`, `ib-${variant}`, { active }]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0.5px solid transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  padding: 0;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}

.ib-sm { width: 28px; height: 28px; }
.ib-md { width: 34px; height: 34px; }
.ib-lg { width: 40px; height: 40px; }

.ib-ghost:hover { background: #f3f4f6; color: #1f2937; }

.ib-outline { border-color: #e5e7eb; }
.ib-outline:hover { background: #f9fafb; color: #1f2937; }

.ib-solid { background: #ff8838; color: #ffffff; border-color: #ff8838; }
.ib-solid:hover { background: #e57320; border-color: #e57320; }

.icon-btn.active { color: #ff8838; }

.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.icon-btn :deep(svg) { width: 60%; height: 60%; }
</style>
