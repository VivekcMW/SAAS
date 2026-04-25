<script setup lang="ts">
interface Props {
  text: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  placement: 'top',
  disabled: false
})
</script>

<template>
  <span :class="['tooltip-wrap', { disabled }]">
    <slot />
    <span v-if="text && !disabled" :class="['tooltip', `tip-${placement}`]" role="tooltip">{{ text }}</span>
  </span>
</template>

<style scoped>
.tooltip-wrap { position: relative; display: inline-flex; }

.tooltip {
  position: absolute;
  background: var(--mm-s3);
  color: var(--mm-pearl);
  font-size: var(--t-xs);
  line-height: 1.3;
  padding: 4px 8px;
  border-radius: var(--r-sm);
  border: 0.5px solid var(--b2);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;
  z-index: 100;
}

.tip-top    { bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 6px; }
.tip-bottom { top: 100%;    left: 50%; transform: translateX(-50%); margin-top: 6px; }
.tip-left   { right: 100%;  top: 50%;  transform: translateY(-50%); margin-right: 6px; }
.tip-right  { left: 100%;   top: 50%;  transform: translateY(-50%); margin-left: 6px; }

.tooltip-wrap:hover .tooltip,
.tooltip-wrap:focus-within .tooltip { opacity: 1; }
</style>
