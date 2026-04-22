<script setup lang="ts">
interface Props {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  dismissible?: boolean
  icon?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'info',
  title: '',
  dismissible: false,
  icon: true
})

defineEmits<{ dismiss: [] }>()
</script>

<template>
  <div :class="['alert', `alert-${variant}`]" role="alert">
    <span v-if="icon" class="alert-icon" aria-hidden="true">
      <svg v-if="variant === 'success'" viewBox="0 0 20 20" fill="none" width="18" height="18">
        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
        <path d="M6 10l3 3 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else-if="variant === 'warning'" viewBox="0 0 20 20" fill="none" width="18" height="18">
        <path d="M10 2l9 16H1L10 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M10 8v4M10 15v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <svg v-else-if="variant === 'danger'" viewBox="0 0 20 20" fill="none" width="18" height="18">
        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
        <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <svg v-else viewBox="0 0 20 20" fill="none" width="18" height="18">
        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
        <path d="M10 9v5M10 6v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </span>
    <div class="alert-body">
      <p v-if="title" class="alert-title">{{ title }}</p>
      <div class="alert-message"><slot /></div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="alert-close"
      aria-label="Dismiss"
      @click="$emit('dismiss')"
    >
      <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 6px;
  border: 0.5px solid;
  font-size: 14px;
  line-height: 1.4;
}

.alert-info    { background: #e0f2fe; border-color: #bae6fd; color: #075985; }
.alert-success { background: #dcfce7; border-color: #bbf7d0; color: #166534; }
.alert-warning { background: #fef3c7; border-color: #fde68a; color: #92400e; }
.alert-danger  { background: #fee2e2; border-color: #fecaca; color: #991b1b; }

.alert-icon { flex-shrink: 0; display: flex; margin-top: 1px; }
.alert-body { flex: 1; min-width: 0; }
.alert-title { margin: 0 0 2px; font-weight: 600; }
.alert-message { margin: 0; }

.alert-close {
  background: transparent;
  border: none;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  padding: 2px;
  display: flex;
  border-radius: 4px;
  flex-shrink: 0;
  transition: opacity 150ms ease;
}
.alert-close:hover { opacity: 1; }
</style>
