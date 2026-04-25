<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  defaultOpen?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  disabled: false
})

const open = ref(props.defaultOpen)
const toggle = () => { if (!props.disabled) open.value = !open.value }
</script>

<template>
  <div :class="['accordion', { open, disabled }]">
    <button
      type="button"
      class="accordion-header"
      :aria-expanded="open"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="accordion-title">{{ title }}</span>
      <svg :class="['accordion-icon', { rotated: open }]" viewBox="0 0 20 20" fill="none" width="16" height="16">
        <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <div v-show="open" class="accordion-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.accordion {
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  background: var(--mm-s2);
}

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  padding: 12px 14px;
  font-family: var(--f-ui);
  font-size: var(--t-base);
  font-weight: 500;
  color: var(--mm-pearl);
  cursor: pointer;
  text-align: left;
  transition: background-color 150ms ease;
}
.accordion-header:hover:not(:disabled) { background: var(--mm-s3); }
.accordion-header:disabled { opacity: 0.6; cursor: not-allowed; }

.accordion-title { flex: 1; }

.accordion-icon {
  color: var(--mm-slate);
  flex-shrink: 0;
  transition: transform 150ms ease;
}
.accordion-icon.rotated { transform: rotate(180deg); }

.accordion-body {
  padding: 12px 14px;
  border-top: 0.5px solid var(--b1);
  font-size: var(--t-base);
  color: var(--mm-silver);
  line-height: 1.5;
}
</style>
