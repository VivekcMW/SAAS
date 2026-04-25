<script setup lang="ts">
interface Props {
  variant?: 'default' | 'sponsored' | 'trending' | 'new' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm'
})
</script>

<template>
  <span :class="['badge', `badge-${variant}`, `badge-${size}`]">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-radius: var(--r-full);
  line-height: 1;
  white-space: nowrap;
}

.badge-sm { padding: 3px 6px; font-size: 10px; }
.badge-md { padding: 5px 9px; font-size: 11px; }

.badge-default   { background: var(--mm-s3); color: var(--mm-silver); }
.badge-sponsored { background: var(--mm-gold-soft); color: var(--mm-goldl); }
.badge-trending  { background: var(--mm-blue-soft); color: var(--mm-bluel); }
.badge-new       { background: var(--mm-sea-soft); color: var(--mm-seal); }
.badge-success   { background: var(--mm-sea-soft); color: var(--mm-seal); }
.badge-warning   { background: var(--mm-gold-soft); color: var(--mm-goldl); }
.badge-danger    { background: rgba(220,38,38,.15); color: #fca5a5; }
.badge-info      { background: var(--mm-blue-soft); color: var(--mm-bluel); }
</style>
