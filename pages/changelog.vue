<template>
  <div class="changelog-page">
    <div class="page-hero">
      <h1>Changelog</h1>
      <p>Stay updated with every new feature, fix, and improvement</p>
    </div>

    <div class="filters">
      <button
        v-for="t in types"
        :key="t.value"
        :class="['filter-btn', activeType === t.value && 'active']"
        @click="setType(t.value)"
      >
        {{ t.label }}
      </button>
    </div>

    <div v-if="pending" class="loading-state">
      <div v-for="i in 3" :key="i" class="skeleton-entry" />
    </div>
    <div v-else-if="error" class="empty-state">
      <p>Unable to load changelog. Please try again.</p>
    </div>
    <div v-else-if="!entries.length" class="empty-state">
      <p>No changelog entries yet. Check back soon!</p>
    </div>
    <div v-else class="entries">
      <div v-for="(group, year) in groupedByYear" :key="year" class="year-group">
        <h2 class="year-label">{{ year }}</h2>
        <div class="entry-list">
          <article v-for="entry in group" :key="entry.id" class="entry-card">
            <div class="entry-meta">
              <span :class="['type-badge', `type-${entry.type}`]">{{ entry.type }}</span>
              <span class="entry-version">v{{ entry.version }}</span>
              <time class="entry-date">{{ formatDate(entry.published_at) }}</time>
            </div>
            <h3 class="entry-title">{{ entry.title }}</h3>
            <p class="entry-summary">{{ entry.summary }}</p>
            <button v-if="entry.body_markdown" class="expand-btn" @click="toggle(entry.id)">
              {{ expanded.has(entry.id) ? 'Show less' : 'Read more' }}
            </button>
            <div v-if="expanded.has(entry.id) && entry.body_markdown" class="entry-body">
              <pre class="markdown-body">{{ entry.body_markdown }}</pre>
            </div>
          </article>
        </div>
      </div>
    </div>

    <div v-if="pagination && pagination.pages > 1" class="pagination">
      <button :disabled="page === 1" class="page-btn" @click="page--">Previous</button>
      <span class="page-info">Page {{ page }} of {{ pagination.pages }}</span>
      <button :disabled="page >= pagination.pages" class="page-btn" @click="page++">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChangelogEntry {
  id: string
  version: string
  title: string
  summary: string
  body_markdown: string
  type: string
  published_at: string
  created_at: string
}

interface ChangelogResponse {
  entries: ChangelogEntry[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

const page = ref(1)
const activeType = ref('')

const types = [
  { value: '', label: 'All' },
  { value: 'feature', label: 'Feature' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'fix', label: 'Fix' },
  { value: 'security', label: 'Security' },
  { value: 'breaking', label: 'Breaking' }
]

const url = computed(() => {
  const params = new URLSearchParams({ page: String(page.value), limit: '20' })
  if (activeType.value) params.set('type', activeType.value)
  return `/api/changelog?${params}`
})

const { data, pending, error } = await useFetch<ChangelogResponse>(url)

const entries = computed(() => data.value?.entries ?? [])
const pagination = computed(() => data.value?.pagination)

const groupedByYear = computed(() => {
  const map: Record<string, ChangelogEntry[]> = {}
  for (const entry of entries.value) {
    const year = new Date(entry.published_at).getFullYear().toString()
    if (!map[year]) map[year] = []
    map[year].push(entry)
  }
  return Object.fromEntries(
    Object.entries(map).sort(([a], [b]) => Number(b) - Number(a))
  )
})

const expanded = ref(new Set<string>())

function toggle(id: string) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
}

function setType(t: string) {
  activeType.value = t
  page.value = 1
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

useHead({
  title: 'Changelog — Moonmart',
  meta: [{ name: 'description', content: 'Follow every update, fix, and new feature shipped on Moonmart.' }]
})
</script>

<style scoped>
.changelog-page { max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.page-hero { text-align: center; margin-bottom: 2.5rem; }
.page-hero h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.75rem; }
.page-hero p { color: var(--mm-muted); font-size: 1.1rem; }
.filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; }
.filter-btn { padding: 0.35rem 0.85rem; border-radius: 999px; border: 1px solid var(--b1); background: transparent; cursor: pointer; font-size: 0.875rem; transition: all 0.15s; }
.filter-btn:hover, .filter-btn.active { background: var(--mm-gold); border-color: var(--mm-gold); color: #000; }
.loading-state { display: flex; flex-direction: column; gap: 1rem; }
.skeleton-entry { height: 120px; border-radius: var(--r-sm); background: var(--mm-s2); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.empty-state { text-align: center; padding: 3rem; color: var(--mm-muted); }
.year-group { margin-bottom: 2.5rem; }
.year-label { font-size: 1.5rem; font-weight: 700; color: var(--mm-muted); border-bottom: 1px solid var(--b1); padding-bottom: 0.5rem; margin-bottom: 1rem; }
.entry-list { display: flex; flex-direction: column; gap: 1rem; }
.entry-card { padding: 1.5rem; border: 1px solid var(--b1); border-radius: var(--r-sm); background: var(--mm-s2); }
.entry-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.type-badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.type-badge.type-feature { background: #d1fae5; color: #065f46; }
.type-badge.type-improvement { background: #dbeafe; color: #1e40af; }
.type-badge.type-fix { background: #fef3c7; color: #92400e; }
.type-badge.type-security { background: #fde8e8; color: #9b1c1c; }
.type-badge.type-breaking { background: #fce7f3; color: #9d174d; }
.entry-version { font-size: 0.8rem; font-weight: 600; color: var(--mm-muted); }
.entry-date { font-size: 0.8rem; color: var(--mm-muted); margin-left: auto; }
.entry-title { font-size: 1.15rem; font-weight: 600; margin-bottom: 0.5rem; }
.entry-summary { color: var(--mm-muted); font-size: 0.95rem; line-height: 1.6; }
.expand-btn { margin-top: 0.75rem; background: none; border: none; color: var(--mm-gold); cursor: pointer; font-size: 0.875rem; padding: 0; }
.markdown-body { margin-top: 1rem; padding: 1rem; background: var(--mm-bg); border-radius: var(--r-sm); font-size: 0.9rem; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 2.5rem; }
.page-btn { padding: 0.5rem 1.25rem; border: 1px solid var(--b1); border-radius: var(--r-sm); background: transparent; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { color: var(--mm-muted); font-size: 0.9rem; }
</style>
