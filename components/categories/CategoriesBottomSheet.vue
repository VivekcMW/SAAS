<script setup lang="ts">
import { ref, computed } from 'vue'
import { allCategories, categoryGroups, getCategoriesByGroup, type Category } from '~/utils/categories'

interface Props { open: boolean }
defineProps<Props>()
const emit = defineEmits<{
  'update:open': [boolean]
  close: []
}>()

const search = ref('')
const expandedGroup = ref<string>('')

const groups = computed(() => categoryGroups.filter(g => g.id !== 'all'))

const filteredCategories = computed<Category[]>(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return []
  return allCategories.filter(c => c.name.toLowerCase().includes(q))
})

const toggleGroup = (id: string) => {
  expandedGroup.value = expandedGroup.value === id ? '' : id
}

const close = () => {
  emit('update:open', false)
  emit('close')
}
</script>

<template>
  <Drawer
    :model-value="open"
    placement="bottom"
    size="85vh"
    title="Browse Categories"
    @update:model-value="(v: boolean) => emit('update:open', v)"
    @close="close"
  >
    <div class="sheet-search">
      <SearchBar v-model="search" placeholder="Search categories..." size="md" />
    </div>

    <!-- Search results -->
    <div v-if="search" class="sheet-results">
      <p v-if="filteredCategories.length === 0" class="sheet-empty">
        No categories match &ldquo;{{ search }}&rdquo;
      </p>
      <NuxtLink
        v-for="cat in filteredCategories.slice(0, 50)"
        :key="cat.id"
        :to="`/marketplace?category=${cat.id}`"
        class="sheet-cat"
        @click="close"
      >
        <Icon :name="cat.icon" class="sheet-cat-icon" />
        <span class="sheet-cat-name">{{ cat.name }}</span>
        <svg viewBox="0 0 20 20" fill="none" width="14" height="14" class="sheet-chev">
          <path d="M8 4l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </NuxtLink>
    </div>

    <!-- Group accordion list -->
    <div v-else class="sheet-groups">
      <div v-for="g in groups" :key="g.id" class="sheet-group">
        <button
          type="button"
          class="sheet-group-head"
          :aria-expanded="expandedGroup === g.id"
          @click="toggleGroup(g.id)"
        >
          <span class="sheet-group-icon">
            <Icon :name="g.icon" />
          </span>
          <span class="sheet-group-text">
            <span class="sheet-group-name">{{ g.name }}</span>
            <span class="sheet-group-count">{{ g.count }} categories</span>
          </span>
          <svg
            :class="['sheet-group-chev', { open: expandedGroup === g.id }]"
            viewBox="0 0 20 20"
            fill="none"
            width="16"
            height="16"
          >
            <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div v-show="expandedGroup === g.id" class="sheet-group-body">
          <NuxtLink
            v-for="cat in getCategoriesByGroup(g.id)"
            :key="cat.id"
            :to="`/marketplace?category=${cat.id}`"
            class="sheet-cat sheet-cat-sub"
            @click="close"
          >
            <Icon :name="cat.icon" class="sheet-cat-icon" />
            <span class="sheet-cat-name">{{ cat.name }}</span>
          </NuxtLink>
          <NuxtLink
            :to="`/marketplace?group=${g.id}`"
            class="sheet-group-viewall"
            @click="close"
          >
            View all {{ g.name }} →
          </NuxtLink>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<style scoped>
.sheet-search {
  position: sticky;
  top: 0;
  background: #ffffff;
  padding-bottom: 10px;
  margin-bottom: 4px;
  z-index: 1;
}

.sheet-empty {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  padding: 24px 0;
}

.sheet-results,
.sheet-groups {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 12px;
}

.sheet-group { border-bottom: 0.5px solid #e5e7eb; }
.sheet-group:last-child { border-bottom: none; }

.sheet-group-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  background: transparent;
  border: none;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  min-height: 48px;
  transition: background-color 150ms ease;
}
.sheet-group-head:hover { background: #f9fafb; }

.sheet-group-icon {
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}
.sheet-group-icon :deep(svg) { width: 18px; height: 18px; }

.sheet-group-text { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.sheet-group-name { font-size: 14px; font-weight: 500; color: #1f2937; }
.sheet-group-count { font-size: 12px; color: #6b7280; }

.sheet-group-chev {
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 150ms ease;
}
.sheet-group-chev.open { transform: rotate(180deg); }

.sheet-group-body {
  padding: 4px 0 12px 48px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sheet-cat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 6px;
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  min-height: 44px;
  transition: background-color 150ms ease, color 150ms ease;
}
.sheet-cat:hover { background: #f9fafb; color: #ff8838; }
.sheet-cat-sub { padding-left: 4px; }

.sheet-cat-icon { width: 18px; height: 18px; color: #9ca3af; flex-shrink: 0; }
.sheet-cat:hover .sheet-cat-icon { color: #ff8838; }
.sheet-cat-name { flex: 1; min-width: 0; }
.sheet-chev { color: #9ca3af; }

.sheet-group-viewall {
  display: block;
  padding: 10px 8px;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #ff8838;
  text-decoration: none;
  border-top: 0.5px solid #e5e7eb;
}

/* Hide on desktop — MegaMenu takes over */
@media (min-width: 901px) {
  :deep(.drawer-overlay) { display: none; }
}
</style>
