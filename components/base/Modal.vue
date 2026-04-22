<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  hideClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  closeOnBackdrop: true,
  closeOnEsc: true,
  hideClose: false
})

const emit = defineEmits<{
  'update:modelValue': [boolean]
  close: []
}>()

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onBackdrop = () => { if (props.closeOnBackdrop) close() }
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && props.closeOnEsc) close() }

watch(() => props.modelValue, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})

onMounted(() => { if (import.meta.client) document.addEventListener('keydown', onKey) })
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', onKey)
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="onBackdrop">
      <div :class="['modal', `modal-${size}`]" aria-modal="true">
        <header v-if="title || !hideClose" class="modal-header">
          <h3 v-if="title" class="modal-title">{{ title }}</h3>
          <button v-if="!hideClose" class="modal-close" aria-label="Close" @click="close">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <div class="modal-body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal {
  background: #ffffff;
  border-radius: 8px;
  border: 0.5px solid #e5e7eb;
  width: 100%;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-sm { max-width: 400px; }
.modal-md { max-width: 560px; }
.modal-lg { max-width: 760px; }
.modal-xl { max-width: 960px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 0.5px solid #e5e7eb;
}
.modal-title { margin: 0; font-size: 16px; font-weight: 600; color: #1f2937; }

.modal-close {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  transition: background-color 150ms ease;
}
.modal-close:hover { background: #f3f4f6; color: #1f2937; }

.modal-body {
  padding: 18px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 0.5px solid #e5e7eb;
}
</style>
