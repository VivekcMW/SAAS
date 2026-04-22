<script setup lang="ts">
import { ref } from 'vue'

export interface Toast {
  id: number
  variant: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  message: string
  duration: number
}

const toasts = ref<Toast[]>([])
let uid = 0

const remove = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const push = (t: Partial<Toast> & { message: string }) => {
  const id = ++uid
  const toast: Toast = {
    id,
    variant: t.variant || 'info',
    title: t.title,
    message: t.message,
    duration: t.duration ?? 4000
  }
  toasts.value.push(toast)
  if (toast.duration > 0) {
    setTimeout(() => remove(id), toast.duration)
  }
}

defineExpose({ push, remove })
</script>

<template>
  <Teleport to="body">
    <div class="toaster" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['toast', `toast-${t.variant}`]"
        >
          <div class="toast-body">
            <p v-if="t.title" class="toast-title">{{ t.title }}</p>
            <p class="toast-message">{{ t.message }}</p>
          </div>
          <button class="toast-close" aria-label="Close" @click="remove(t.id)">
            <svg viewBox="0 0 20 20" fill="none" width="12" height="12">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toaster {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10000;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 260px;
  max-width: 360px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px 12px;
  pointer-events: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.toast-info    { border-left: 3px solid #0284c7; }
.toast-success { border-left: 3px solid #16a34a; }
.toast-warning { border-left: 3px solid #d97706; }
.toast-danger  { border-left: 3px solid #dc2626; }

.toast-body { flex: 1; min-width: 0; }
.toast-title { margin: 0 0 2px; font-size: 13px; font-weight: 600; color: #1f2937; }
.toast-message { margin: 0; font-size: 13px; color: #4b5563; line-height: 1.4; }

.toast-close {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 2px;
  display: flex;
  transition: color 150ms ease;
}
.toast-close:hover { color: #1f2937; }

.toast-enter-from { opacity: 0; transform: translateX(10px); }
.toast-leave-to { opacity: 0; transform: translateX(10px); }
.toast-enter-active, .toast-leave-active { transition: opacity 150ms ease, transform 150ms ease; }
</style>
