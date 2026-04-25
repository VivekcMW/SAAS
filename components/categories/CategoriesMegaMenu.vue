<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { allCategories, categoryGroups, getCategoriesByGroup, type Category } from '~/utils/categories'

interface Props {
  open: boolean
  triggerRef?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  triggerRef: null
})

const emit = defineEmits<{ close: [] }>()

const search = ref('')
const activeGroup = ref<string>(categoryGroups[1]?.id ?? 'productivity')
const panelRef = ref<HTMLElement>()
const panelStyle = ref<Record<string, string>>({})

const groups = computed(() => categoryGroups.filter(g => g.id !== 'all'))

const filteredCategories = computed<Category[]>(() => {
  const q = search.value.trim().toLowerCase()
  if (q) {
    return allCategories.filter(c =>
      c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    )
  }
  return getCategoriesByGroup(activeGroup.value)
})

// Featured picks per group (first 3 from each)
const featuredPicks = computed(() => getCategoriesByGroup(activeGroup.value).slice(0, 3))

const close = () => emit('close')

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

const onDocClick = (e: MouseEvent) => {
  if (!panelRef.value) return
  const target = e.target as Node
  if (panelRef.value.contains(target)) return
  if (props.triggerRef && props.triggerRef.contains(target)) return
  close()
}

const positionPanel = () => {
  if (!import.meta.client || !props.triggerRef) return
  const rect = props.triggerRef.getBoundingClientRect()
  const gutter = 16
  const vw = globalThis.innerWidth
  const desired = Math.min(1000, vw - gutter * 2)
  // Prefer anchoring the panel's left edge to the trigger, but clamp inside viewport
  let left = rect.left
  if (left + desired > vw - gutter) left = Math.max(gutter, vw - gutter - desired)
  panelStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${left}px`,
    width: `${desired}px`,
  }
}

watch(() => props.open, (o) => {
  if (o && import.meta.client) {
    positionPanel()
    document.addEventListener('keydown', onKey)
    globalThis.addEventListener('resize', positionPanel)
    globalThis.addEventListener('scroll', positionPanel, true)
    // defer click listener so the opening click doesn't immediately close
    setTimeout(() => document.addEventListener('click', onDocClick), 0)
  } else if (import.meta.client) {
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('click', onDocClick)
    globalThis.removeEventListener('resize', positionPanel)
    globalThis.removeEventListener('scroll', positionPanel, true)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('click', onDocClick)
    globalThis.removeEventListener('resize', positionPanel)
    globalThis.removeEventListener('scroll', positionPanel, true)
  }
})

onMounted(() => {
  // preselect first non-all group
  if (!activeGroup.value) activeGroup.value = groups.value[0]?.id ?? ''
})
</script>

<template>
  <Transition name="mm">
    <div v-if="open" ref="panelRef" class="mega-menu" role="menu" aria-label="Browse categories" :style="panelStyle">
      <div class="mm-search">
        <SearchBar
          v-model="search"
          placeholder="Search 200+ categories..."
          size="md"
        />
      </div>

      <div class="mm-body">
        <!-- Left rail: category groups -->
        <aside class="mm-rail" aria-label="Category groups">
          <button
            v-for="g in groups"
            :key="g.id"
            type="button"
            :class="['rail-item', { active: g.id === activeGroup && !search }]"
            :aria-current="g.id === activeGroup ? 'true' : undefined"
            @mouseenter="!search && (activeGroup = g.id)"
            @focus="!search && (activeGroup = g.id)"
            @click="activeGroup = g.id; search = ''"
          >
            <Icon :name="g.icon" class="rail-icon" />
            <span class="rail-label">{{ g.name }}</span>
            <span class="rail-count">{{ g.count }}</span>
          </button>
        </aside>

        <!-- Middle: categories in active group -->
        <div class="mm-list">
          <div class="mm-list-head">
            <h3 class="mm-list-title">
              {{ search ? `Search results (${filteredCategories.length})` : groups.find(g => g.id === activeGroup)?.name }}
            </h3>
            <NuxtLink
              v-if="!search"
              :to="`/marketplace?group=${activeGroup}`"
              class="mm-view-all"
              @click="close"
            >
              View all →
            </NuxtLink>
          </div>
          <ul class="mm-grid">
            <li v-for="cat in filteredCategories.slice(0, 24)" :key="cat.id">
              <NuxtLink
                :to="`/marketplace?category=${cat.id}`"
                class="mm-cat"
                @click="close"
              >
                <Icon :name="cat.icon" class="mm-cat-icon" />
                <span class="mm-cat-name">{{ cat.name }}</span>
              </NuxtLink>
            </li>
          </ul>
          <EmptyState
            v-if="filteredCategories.length === 0"
            title="No categories match"
            :description="`Try different keywords for &quot;${search}&quot;`"
          />
        </div>

        <!-- Right: featured picks -->
        <aside v-if="!search && featuredPicks.length" class="mm-featured" aria-label="Featured in this group">
          <h4 class="mm-featured-title">Popular in this group</h4>
          <NuxtLink
            v-for="cat in featuredPicks"
            :key="cat.id"
            :to="`/marketplace?category=${cat.id}`"
            class="mm-featured-item"
            @click="close"
          >
            <span class="mm-featured-icon">
              <Icon :name="cat.icon" />
            </span>
            <span class="mm-featured-text">
              <span class="mm-featured-name">{{ cat.name }}</span>
              <span class="mm-featured-hint">Explore tools →</span>
            </span>
          </NuxtLink>
        </aside>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.mega-menu {
  position: fixed;
  top: 64px;
  left: 16px;
  width: min(1000px, calc(100vw - 32px));
  background: var(--mm-s1);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  z-index: 1000;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.mm-search {
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--b1);
  background: var(--mm-bg);
}

.mm-body {
  display: grid;
  grid-template-columns: 240px 1fr 260px;
  min-height: 420px;
  max-height: 520px;
}

/* Left rail */
.mm-rail {
  border-right: 0.5px solid var(--b1);
  padding: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: var(--r-sm);
  cursor: pointer;
  text-align: left;
  font-family: var(--f-ui);
  font-size: 13px;
  color: var(--mm-silver);
  transition: background-color 150ms ease, color 150ms ease;
}
.rail-item:hover { background: var(--mm-s3); color: var(--mm-pearl); }
.rail-item.active { background: var(--mm-gold-soft); color: var(--mm-gold); }
.rail-icon { width: 16px; height: 16px; flex-shrink: 0; }
.rail-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rail-count { font-size: 11px; color: var(--mm-slate); font-weight: 500; }
.rail-item.active .rail-count { color: var(--mm-goldl); }

/* Middle list */
.mm-list {
  padding: 16px;
  overflow-y: auto;
}
.mm-list-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.mm-list-title {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--mm-slate);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.mm-view-all {
  font-size: 12px;
  color: var(--mm-gold);
  text-decoration: none;
  font-weight: 500;
}
.mm-view-all:hover { text-decoration: underline; }

.mm-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.mm-grid li { margin: 0; }
.mm-cat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--r-sm);
  text-decoration: none;
  color: var(--mm-silver);
  font-size: 13px;
  transition: background-color 150ms ease, color 150ms ease;
}
.mm-cat:hover { background: var(--mm-s3); color: var(--mm-gold); }
.mm-cat-icon { width: 16px; height: 16px; color: var(--mm-slate); flex-shrink: 0; }
.mm-cat:hover .mm-cat-icon { color: var(--mm-gold); }
.mm-cat-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Right featured */
.mm-featured {
  background: var(--mm-bg);
  border-left: 0.5px solid var(--b1);
  padding: 16px;
  overflow-y: auto;
}
.mm-featured-title {
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--mm-slate);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.mm-featured-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
  text-decoration: none;
  margin-bottom: 8px;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.mm-featured-item:hover { background: var(--mm-gold-soft); border-color: var(--mm-gold); }
.mm-featured-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--mm-s3);
  border-radius: var(--r-sm);
  color: var(--mm-gold);
  flex-shrink: 0;
}
.mm-featured-icon :deep(svg) { width: 16px; height: 16px; }
.mm-featured-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.mm-featured-name { font-size: 13px; font-weight: 500; color: var(--mm-pearl); }
.mm-featured-hint { font-size: 11px; color: var(--mm-slate); }

/* Transition */
.mm-enter-from, .mm-leave-to { opacity: 0; transform: translateY(-4px); }
.mm-enter-active, .mm-leave-active { transition: opacity 150ms ease, transform 150ms ease; }

/* Responsive guard — hide on mobile, Bottom Sheet takes over */
@media (max-width: 900px) {
  .mega-menu { display: none; }
}

@media (max-width: 1100px) {
  .mm-body { grid-template-columns: 220px 1fr; }
  .mm-featured { display: none; }
}
</style>
