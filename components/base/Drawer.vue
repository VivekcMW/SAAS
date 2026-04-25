<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  placement?: 'left' | 'right' | 'top' | 'bottom'
  size?: string
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  hideClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  placement: 'right',
  size: '380px',
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

watch(() => props.modelValue, (o) => {
  if (import.meta.client) document.body.style.overflow = o ? 'hidden' : ''
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
    <Transition name="drawer">
      <div v-if="modelValue" class="drawer-overlay" @click.self="onBackdrop">
        <aside
          :class="['drawer', `place-${placement}`]"
          :style="placement === 'left' || placement === 'right' ? { width: size } : { height: size }"
        >
          <header v-if="title || !hideClose" class="drawer-header">
            <h3 v-if="title" class="drawer-title">{{ title }}</h3>
            <button v-if="!hideClose" class="drawer-close" aria-label="Close" @click="close">
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </header>
          <div class="drawer-body"><slot /></div>
          <footer v-if="$slots.footer" class="drawer-footer"><slot name="footer" /></footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 9, 15, 0.75);
  z-index: 9999;
  display: flex;
}

.drawer {
  background: var(--mm-s1);
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
}

.place-right  { margin-left: auto; height: 100%; border-left: 0.5px solid var(--b2); }
.place-left   { margin-right: auto; height: 100%; border-right: 0.5px solid var(--b2); }
.place-top    { width: 100%; margin-bottom: auto; border-bottom: 0.5px solid var(--b2); }
.place-bottom { width: 100%; margin-top: auto; border-top: 0.5px solid var(--b2); }

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 0.5px solid var(--b1);
}
.drawer-title { margin: 0; font-size: var(--t-md); font-weight: 600; color: var(--mm-pearl); }

.drawer-close {
  background: transparent;
  border: none;
  color: var(--mm-slate);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--r-sm);
  display: flex;
  transition: background-color 150ms ease;
}
.drawer-close:hover { background: var(--mm-s3); color: var(--mm-pearl); }

.drawer-body { flex: 1; padding: 18px; overflow-y: auto; }
.drawer-footer {
  padding: 12px 18px;
  border-top: 0.5px solid var(--b1);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.drawer-enter-active, .drawer-leave-active { transition: opacity 150ms ease; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform 200ms ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .place-right,  .drawer-leave-to .place-right  { transform: translateX(100%); }
.drawer-enter-from .place-left,   .drawer-leave-to .place-left   { transform: translateX(-100%); }
.drawer-enter-from .place-top,    .drawer-leave-to .place-top    { transform: translateY(-100%); }
.drawer-enter-from .place-bottom, .drawer-leave-to .place-bottom { transform: translateY(100%); }
</style>
