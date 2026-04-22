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
  border-radius: 4px;
  line-height: 1;
  white-space: nowrap;
}

.badge-sm { padding: 3px 6px; font-size: 10px; }
.badge-md { padding: 5px 9px; font-size: 11px; }

.badge-default   { background: #f3f4f6; color: #374151; }
.badge-sponsored { background: #fff3e6; color: #b45309; }
.badge-trending  { background: #dbeafe; color: #1d4ed8; }
.badge-new       { background: #dcfce7; color: #166534; }
.badge-success   { background: #dcfce7; color: #166534; }
.badge-warning   { background: #fef3c7; color: #92400e; }
.badge-danger    { background: #fee2e2; color: #991b1b; }
.badge-info      { background: #e0f2fe; color: #075985; }
</style>
