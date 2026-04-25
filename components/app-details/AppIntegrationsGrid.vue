<script setup lang="ts">
import { ref, computed } from 'vue'

interface Integration {
  name: string
  logo?: string
  type?: 'native' | 'zapier' | 'api' | 'webhook'
  category?: string
}

interface Props {
  integrations: Integration[]
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 18
})

const search = ref('')
const activeType = ref<string>('all')

const types = computed(() => {
  const set = new Set<string>()
  for (const i of props.integrations) if (i.type) set.add(i.type)
  return ['all', ...Array.from(set)]
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.integrations.filter(i => {
    if (activeType.value !== 'all' && i.type !== activeType.value) return false
    if (q && !i.name.toLowerCase().includes(q)) return false
    return true
  })
})

const showAll = ref(false)
const visible = computed(() =>
  showAll.value ? filtered.value : filtered.value.slice(0, props.maxVisible)
)
</script>

<template>
  <div class="integrations-grid">
    <div class="int-controls">
      <div class="int-filters">
        <button
          v-for="t in types"
          :key="t"
          type="button"
          :class="['int-chip', { active: activeType === t }]"
          @click="activeType = t"
        >
          {{ t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) }}
        </button>
      </div>
      <div class="int-search">
        <Icon name="heroicons:magnifying-glass" class="int-search-icon" />
        <input
          v-model="search"
          type="search"
          placeholder="Search integrations..."
          class="int-search-input"
        />
      </div>
    </div>

    <div v-if="visible.length > 0" class="int-grid">
      <div v-for="i in visible" :key="i.name" class="int-item">
        <div class="int-logo">
          <img v-if="i.logo" :src="i.logo" :alt="`${i.name} logo`" />
          <span v-else class="int-initial">{{ i.name.charAt(0) }}</span>
        </div>
        <span class="int-name">{{ i.name }}</span>
        <span v-if="i.type" :class="['int-type', `t-${i.type}`]">{{ i.type }}</span>
      </div>
    </div>
    <p v-else class="int-empty">No integrations match your filter.</p>

    <button
      v-if="filtered.length > maxVisible"
      type="button"
      class="int-toggle"
      @click="showAll = !showAll"
    >
      {{ showAll ? 'Show less' : `Show all ${filtered.length}` }}
    </button>
  </div>
</template>

<style scoped>
.int-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.int-filters { display: flex; gap: 4px; flex-wrap: wrap; }
.int-chip {
  padding: 5px 12px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-full);
  font-family: var(--f-ui);
  font-size: 12px;
  color: var(--mm-silver);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}
.int-chip:hover { background: var(--mm-s3); color: var(--mm-pearl); }
.int-chip.active { background: var(--mm-gold-soft); color: var(--mm-gold); border-color: var(--mm-gold); }

.int-search { position: relative; }
.int-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: var(--mm-slate);
}
.int-search-input {
  padding: 6px 10px 6px 30px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-family: var(--f-ui);
  font-size: 13px;
  color: var(--mm-pearl);
  width: 200px;
  transition: border-color 150ms ease;
}
.int-search-input::placeholder { color: var(--mm-silver); }
.int-search-input:focus { outline: none; border-color: var(--mm-gold); box-shadow: 0 0 0 3px var(--mm-gold-soft); }

.int-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
.int-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
  transition: border-color 150ms ease, background-color 150ms ease;
}
.int-item:hover { border-color: var(--b2); background: var(--mm-s3); }

.int-logo {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--mm-s3);
  border-radius: var(--r-sm);
  overflow: hidden;
}
.int-logo img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
.int-initial {
  font-size: 14px;
  font-weight: 600;
  color: var(--mm-silver);
}

.int-name {
  font-size: 12px;
  color: var(--mm-silver);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.int-type {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 1px 5px;
  font-size: 9px;
  font-weight: 600;
  border-radius: var(--r-xs);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.int-type.t-native { background: var(--mm-gold-soft); color: var(--mm-gold); }
.int-type.t-zapier { background: var(--mm-gold-soft); color: var(--mm-goldl); }
.int-type.t-api { background: var(--mm-blue-soft); color: var(--mm-bluel); }
.int-type.t-webhook { background: var(--mm-sea-soft); color: var(--mm-seal); }

.int-empty { text-align: center; font-size: 14px; color: var(--mm-slate); padding: 20px; }

.int-toggle {
  margin-top: 12px;
  padding: 6px 12px;
  background: transparent;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-family: var(--f-ui);
  font-size: 13px;
  color: var(--mm-silver);
  cursor: pointer;
  transition: background-color 150ms ease;
}
.int-toggle:hover { background: var(--mm-s3); }

@media (max-width: 900px) {
  .int-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 500px) {
  .int-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
