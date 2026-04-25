<script setup lang="ts">
interface Props {
  variant?: 'default' | 'filled' | 'outline'
  size?: 'sm' | 'md'
  removable?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
  removable: false
})

defineEmits<{ remove: [] }>()
</script>

<template>
  <span :class="['tag', `tag-${variant}`, `tag-${size}`]">
    <slot />
    <button
      v-if="removable"
      type="button"
      class="tag-remove"
      aria-label="Remove"
      @click.stop="$emit('remove')"
    >
      <svg viewBox="0 0 20 20" fill="none" width="10" height="10">
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </span>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--r-sm);
  line-height: 1;
  font-weight: 500;
  white-space: nowrap;
}

.tag-sm { padding: 3px 8px; font-size: 11px; }
.tag-md { padding: 5px 10px; font-size: 12px; }

.tag-default { background: var(--mm-s3); color: var(--mm-silver); }
.tag-filled  { background: var(--mm-s1); color: var(--mm-pearl); }
.tag-outline { background: transparent; color: var(--mm-silver); border: 0.5px solid var(--b2); }

.tag-remove {
  background: transparent;
  border: none;
  color: currentColor;
  opacity: 0.6;
  cursor: pointer;
  padding: 0;
  display: flex;
  margin-left: 2px;
  transition: opacity 150ms ease;
}
.tag-remove:hover { opacity: 1; }
</style>
