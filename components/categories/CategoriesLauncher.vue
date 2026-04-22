<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import CategoriesMegaMenu from './CategoriesMegaMenu.vue'
import CategoriesBottomSheet from './CategoriesBottomSheet.vue'
import { useCategoriesMenu } from '~/composables/useCategoriesMenu'

interface Props {
  triggerLabel?: string
}

withDefaults(defineProps<Props>(), {
  triggerLabel: 'Browse Categories'
})

const { isCategoriesDrawerOpen, openCategoriesDrawer, closeCategoriesDrawer, toggleCategoriesDrawer } = useCategoriesMenu()
const triggerRef = ref<HTMLButtonElement | null>(null)
const open = computed(() => isCategoriesDrawerOpen.value)

const isMobile = ref(false)
let mql: MediaQueryList | null = null
const onMqlChange = (e: MediaQueryListEvent) => { isMobile.value = e.matches }

onMounted(() => {
  mql = window.matchMedia('(max-width: 900px)')
  isMobile.value = mql.matches
  mql.addEventListener('change', onMqlChange)
})
onBeforeUnmount(() => {
  if (mql) mql.removeEventListener('change', onMqlChange)
})
</script>

<template>
  <div class="cat-launcher">
    <button
      ref="triggerRef"
      type="button"
      class="cat-trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggleCategoriesDrawer"
    >
      <svg viewBox="0 0 20 20" fill="none" width="16" height="16" class="cat-trigger-icon">
        <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5" />
      </svg>
      <span>{{ triggerLabel }}</span>
      <svg :class="['cat-trigger-chev', { open }]" viewBox="0 0 20 20" fill="none" width="14" height="14">
        <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <ClientOnly>
      <!-- Desktop: mega menu -->
      <CategoriesMegaMenu
        v-if="!isMobile"
        :open="open"
        :trigger-ref="triggerRef"
        @close="closeCategoriesDrawer"
      />

      <!-- Mobile: bottom sheet -->
      <CategoriesBottomSheet
        v-else
        :open="open"
        @update:open="(v: boolean) => v ? openCategoriesDrawer() : closeCategoriesDrawer()"
        @close="closeCategoriesDrawer"
      />
    </ClientOnly>
  </div>
</template>

<style scoped>
.cat-launcher {
  position: relative;
  display: inline-block;
}

.cat-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}
.cat-trigger:hover { background: #f9fafb; border-color: #d1d5db; color: #1f2937; }
.cat-trigger[aria-expanded="true"] { background: #fff3e6; border-color: #ff8838; color: #b45309; }

.cat-trigger-icon { flex-shrink: 0; }
.cat-trigger-chev {
  color: #9ca3af;
  transition: transform 150ms ease;
}
.cat-trigger-chev.open { transform: rotate(180deg); }
</style>
