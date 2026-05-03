<template>
  <div class="roadmap-page">
    <div class="page-hero">
      <h1>Roadmap</h1>
      <p>See what we're building next — and vote for what matters to you</p>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label>Status</label>
        <div class="filter-pills">
          <button
            v-for="s in statuses"
            :key="s.value"
            :class="['filter-btn', activeStatus === s.value && 'active']"
            @click="setStatus(s.value)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <label>Category</label>
        <div class="filter-pills">
          <button
            v-for="c in categories"
            :key="c.value"
            :class="['filter-btn', activeCategory === c.value && 'active']"
            @click="setCategory(c.value)"
          >
            {{ c.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="pending" class="loading-state">
      <div v-for="i in 4" :key="i" class="skeleton-item" />
    </div>
    <div v-else-if="error" class="empty-state">
      <p>Unable to load roadmap. Please try again.</p>
    </div>
    <div v-else-if="!groups.length" class="empty-state">
      <p>No roadmap items yet. Check back soon!</p>
    </div>
    <div v-else class="groups">
      <section v-for="group in groups" :key="group.quarter" class="quarter-section">
        <h2 class="quarter-title">{{ group.quarter }}</h2>
        <div class="items-grid">
          <article v-for="item in group.items" :key="item.id" class="roadmap-card">
            <div class="card-header">
              <span :class="['status-badge', `status-${item.status}`]">{{ formatStatus(item.status) }}</span>
              <span class="category-tag">{{ item.category }}</span>
            </div>
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-desc">{{ item.description }}</p>
            <div class="card-footer">
              <button
                :class="['vote-btn', votedItems.has(item.id) && 'voted']"
                :disabled="voting === item.id"
                @click="vote(item.id)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                {{ localVotes[item.id] ?? item.votes }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RoadmapItem {
  id: string
  title: string
  description: string
  category: string
  status: string
  quarter: string
  votes: number
}

interface RoadmapGroup {
  quarter: string
  items: RoadmapItem[]
}

interface RoadmapResponse {
  groups: RoadmapGroup[]
  total: number
}

const activeStatus = ref('')
const activeCategory = ref('')

const statuses = [
  { value: '', label: 'All' },
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
]

const categories = [
  { value: '', label: 'All' },
  { value: 'product', label: 'Product' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'community', label: 'Community' },
  { value: 'api', label: 'API' }
]

const url = computed(() => {
  const params = new URLSearchParams()
  if (activeStatus.value) params.set('status', activeStatus.value)
  if (activeCategory.value) params.set('category', activeCategory.value)
  return `/api/roadmap?${params}`
})

const { data, pending, error } = await useFetch<RoadmapResponse>(url)
const groups = computed(() => data.value?.groups ?? [])

const votedItems = ref(new Set<string>())
const localVotes = ref<Record<string, number>>({})
const voting = ref<string | null>(null)

function setStatus(s: string) { activeStatus.value = s }
function setCategory(c: string) { activeCategory.value = c }

function formatStatus(s: string) {
  const map: Record<string, string> = {
    planned: 'Planned',
    'in-progress': 'In Progress',
    done: 'Done',
    cancelled: 'Cancelled'
  }
  return map[s] ?? s
}

async function vote(itemId: string) {
  if (votedItems.value.has(itemId) || voting.value) return
  voting.value = itemId
  try {
    const res = await $fetch<{ voted: boolean; votes: number }>('/api/roadmap/vote', {
      method: 'POST',
      body: { item_id: itemId }
    })
    if (res.voted) {
      votedItems.value.add(itemId)
      localVotes.value[itemId] = res.votes
    }
  } catch {
    // silently ignore vote errors
  } finally {
    voting.value = null
  }
}

useHead({
  title: 'Roadmap — Moonmart',
  meta: [{ name: 'description', content: "Vote for upcoming features and follow Moonmart's development roadmap." }]
})
</script>

<style scoped>
.roadmap-page { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.page-hero { text-align: center; margin-bottom: 2.5rem; }
.page-hero h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.75rem; }
.page-hero p { color: var(--mm-muted); font-size: 1.1rem; }
.filters { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem; }
.filter-group label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mm-muted); display: block; margin-bottom: 0.4rem; }
.filter-pills { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.filter-btn { padding: 0.3rem 0.75rem; border-radius: 999px; border: 1px solid var(--b1); background: transparent; cursor: pointer; font-size: 0.8rem; transition: all 0.15s; }
.filter-btn:hover, .filter-btn.active { background: var(--mm-gold); border-color: var(--mm-gold); color: #000; }
.loading-state { display: flex; flex-direction: column; gap: 1rem; }
.skeleton-item { height: 140px; border-radius: var(--r-sm); background: var(--mm-s2); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.empty-state { text-align: center; padding: 3rem; color: var(--mm-muted); }
.quarter-section { margin-bottom: 3rem; }
.quarter-title { font-size: 1.35rem; font-weight: 700; color: var(--mm-gold); margin-bottom: 1rem; border-bottom: 1px solid var(--b1); padding-bottom: 0.5rem; }
.items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.roadmap-card { padding: 1.25rem; border: 1px solid var(--b1); border-radius: var(--r-sm); background: var(--mm-s2); display: flex; flex-direction: column; gap: 0.6rem; }
.card-header { display: flex; align-items: center; gap: 0.5rem; }
.status-badge { padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600; }
.status-badge.status-planned { background: #e0f2fe; color: #0369a1; }
.status-badge.status-in-progress { background: #fef9c3; color: #92400e; }
.status-badge.status-done { background: #dcfce7; color: #15803d; }
.status-badge.status-cancelled { background: #f3f4f6; color: #6b7280; }
.category-tag { font-size: 0.75rem; color: var(--mm-muted); text-transform: capitalize; }
.item-title { font-size: 1rem; font-weight: 600; line-height: 1.4; }
.item-desc { font-size: 0.875rem; color: var(--mm-muted); line-height: 1.55; flex: 1; }
.card-footer { margin-top: auto; padding-top: 0.5rem; }
.vote-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: var(--r-sm); border: 1px solid var(--b1); background: transparent; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.15s; }
.vote-btn:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
.vote-btn.voted { background: var(--mm-gold); border-color: var(--mm-gold); color: #000; }
.vote-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
