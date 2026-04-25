<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  closeOnSelect?: boolean
}

withDefaults(defineProps<Props>(), {
  placement: 'bottom-start',
  closeOnSelect: true
})

const open = ref(false)
const root = ref<HTMLElement>()

const toggle = () => { open.value = !open.value }
const close = () => { open.value = false }

const onDocClick = (e: MouseEvent) => {
  if (!root.value) return
  if (!root.value.contains(e.target as Node)) close()
}

onMounted(() => { if (import.meta.client) document.addEventListener('click', onDocClick) })
onBeforeUnmount(() => { if (import.meta.client) document.removeEventListener('click', onDocClick) })

defineExpose({ close })
</script>

<template>
  <div ref="root" class="dropdown">
    <div class="dropdown-trigger" @click="toggle">
      <slot name="trigger" :open="open" />
    </div>
    <div
      v-if="open"
      :class="['dropdown-menu', `place-${placement}`]"
      @click="closeOnSelect && close()"
    >
      <slot :close="close" />
    </div>
  </div>
</template>

<style scoped>
.dropdown { position: relative; display: inline-block; }
.dropdown-trigger { cursor: pointer; }

.dropdown-menu {
  position: absolute;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  min-width: 160px;
  z-index: 1000;
  padding: 4px;
  box-shadow: var(--shadow-lg);
}

.place-bottom-start { top: calc(100% + 4px); left: 0; }
.place-bottom-end   { top: calc(100% + 4px); right: 0; }
.place-top-start    { bottom: calc(100% + 4px); left: 0; }
.place-top-end      { bottom: calc(100% + 4px); right: 0; }

.dropdown-menu :deep(.dropdown-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  background: transparent;
  border: none;
  color: var(--mm-silver);
  font-size: var(--t-base);
  text-align: left;
  cursor: pointer;
  border-radius: var(--r-sm);
  text-decoration: none;
  font-family: var(--f-ui);
  transition: background-color 150ms ease;
}
.dropdown-menu :deep(.dropdown-item:hover) { background: var(--mm-s3); color: var(--mm-pearl); }
.dropdown-menu :deep(.dropdown-item[disabled]) { opacity: 0.5; cursor: not-allowed; }
.dropdown-menu :deep(.dropdown-divider) {
  height: 0.5px;
  background: var(--b1);
  margin: 4px 0;
}
</style>
