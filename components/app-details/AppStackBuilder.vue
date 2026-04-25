<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Props {
  appId: string
  appName: string
  appLogo?: string
}

const props = defineProps<Props>()

const STORAGE_KEY = 'saasworld_stack'

interface StackEntry {
  id: string
  name: string
  logo?: string
  addedAt: string
}

const stack = ref<StackEntry[]>([])
const inStack = computed(() => stack.value.some(x => x.id === props.appId))

function loadStack(): StackEntry[] {
  if (globalThis.window === undefined) return []
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStack() {
  if (globalThis.window === undefined) return
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(stack.value))
}

onMounted(() => {
  stack.value = loadStack()
})

watch(stack, saveStack, { deep: true })

function toggle() {
  if (inStack.value) {
    stack.value = stack.value.filter(x => x.id !== props.appId)
  } else {
    stack.value = [
      ...stack.value,
      { id: props.appId, name: props.appName, logo: props.appLogo, addedAt: new Date().toISOString() }
    ]
  }
}

function remove(id: string) {
  stack.value = stack.value.filter(x => x.id !== id)
}

function clearAll() {
  stack.value = []
}

const showPanel = ref(false)
</script>

<template>
  <div class="stack-builder">
    <div class="stack-actions">
      <button
        class="stack-toggle"
        :class="{ added: inStack }"
        @click="toggle"
      >
        <Icon :name="inStack ? 'heroicons:check' : 'heroicons:squares-plus'" />
        {{ inStack ? 'Added to your stack' : 'Add to my stack' }}
      </button>
      <button v-if="stack.length" class="stack-view" @click="showPanel = !showPanel">
        <Icon name="heroicons:rectangle-stack" />
        My stack ({{ stack.length }})
      </button>
    </div>

    <Transition name="fade">
      <div v-if="showPanel && stack.length" class="stack-panel">
        <header class="panel-head">
          <h4>Your stack</h4>
          <button class="panel-clear" @click="clearAll">Clear all</button>
        </header>
        <ul class="stack-list">
          <li v-for="item in stack" :key="item.id">
            <div class="stack-logo">
              <img v-if="item.logo" :src="item.logo" :alt="`${item.name} logo`" />
              <span v-else>{{ item.name.charAt(0) }}</span>
            </div>
            <NuxtLink :to="`/marketplace/app/${item.id}`" class="stack-name">{{ item.name }}</NuxtLink>
            <button class="stack-remove" @click="remove(item.id)" :aria-label="`Remove ${item.name}`">
              <Icon name="heroicons:x-mark" />
            </button>
          </li>
        </ul>
        <footer class="panel-foot">
          <NuxtLink
            v-if="stack.length >= 2"
            :to="`/marketplace/compare?apps=${stack.map(s => s.id).join(',')}`"
            class="panel-cta"
          >
            <Icon name="heroicons:arrow-right" />
            Compare {{ stack.length }} apps
          </NuxtLink>
          <span v-else class="panel-hint">Add at least 2 apps to compare</span>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.stack-builder { position: relative; }

.stack-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.stack-toggle,
.stack-view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--r-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
  background: var(--mm-s3);
  color: var(--mm-silver);
  border: 0.5px solid var(--b1);
}
.stack-toggle:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
.stack-toggle.added {
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  border-color: var(--mm-gold);
}
.stack-view:hover { background: var(--mm-s2); }
.stack-toggle :deep(svg),
.stack-view :deep(svg) { width: 14px; height: 14px; }

.stack-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  background: var(--mm-s1);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  width: 320px;
  max-width: calc(100vw - 32px);
  padding: 12px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.panel-head h4 { margin: 0; font-size: 13px; font-weight: 700; color: var(--mm-pearl); }
.panel-clear {
  background: transparent;
  border: 0;
  color: var(--mm-slate);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--r-xs);
  transition: color var(--transition-fast);
}
.panel-clear:hover { color: #f87171; }

.stack-list {
  list-style: none;
  padding: 0;
  margin: 0 0 10px;
  max-height: 240px;
  overflow-y: auto;
}
.stack-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 0.5px solid var(--b1);
}
.stack-list li:last-child { border-bottom: 0; }

.stack-logo {
  width: 28px;
  height: 28px;
  border-radius: var(--r-sm);
  background: var(--mm-s3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 12px;
  color: var(--mm-slate);
  font-weight: 700;
  flex-shrink: 0;
}
.stack-logo img { width: 100%; height: 100%; object-fit: cover; }

.stack-name {
  flex: 1;
  font-size: 13px;
  color: var(--mm-silver);
  text-decoration: none;
  font-weight: 500;
}
.stack-name:hover { color: var(--mm-gold); }

.stack-remove {
  background: transparent;
  border: 0;
  color: var(--mm-slate);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--r-xs);
  display: inline-flex;
  align-items: center;
  transition: color var(--transition-fast);
}
.stack-remove:hover { color: #f87171; }
.stack-remove :deep(svg) { width: 14px; height: 14px; }

.panel-foot {
  border-top: 0.5px solid var(--b1);
  padding-top: 10px;
}
.panel-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--mm-gold);
  color: #0A0700;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: var(--r-md);
  text-decoration: none;
  width: 100%;
  justify-content: center;
  transition: background var(--transition-fast);
}
.panel-cta:hover { background: var(--mm-goldl); }
.panel-cta :deep(svg) { width: 14px; height: 14px; }

.panel-hint { font-size: 12px; color: var(--mm-slate); }

.fade-enter-active, .fade-leave-active { transition: opacity var(--transition-fast), transform var(--transition-fast); }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
