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
  color: var(--mm-slate);
  cursor: pointer;
  border-radius: var(--r-md);
  padding: 0;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}

.ib-sm { width: 28px; height: 28px; }
.ib-md { width: 34px; height: 34px; }
.ib-lg { width: 40px; height: 40px; }

.ib-ghost:hover { background: var(--mm-s3); color: var(--mm-pearl); }

.ib-outline { border-color: var(--b2); }
.ib-outline:hover { background: var(--mm-s3); color: var(--mm-pearl); }

.ib-solid { background: var(--mm-gold); color: #0A0700; border-color: var(--mm-gold); }
.ib-solid:hover { background: var(--mm-goldl); border-color: var(--mm-goldl); }

.icon-btn.active { color: var(--mm-gold); }

.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.icon-btn :deep(svg) { width: 60%; height: 60%; }
</style>
