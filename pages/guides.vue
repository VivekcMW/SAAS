<template>
  <div class="guides-page">
    <div class="page-hero">
      <h1>Guides &amp; Resources</h1>
      <p>Expert advice to help you buy smarter, negotiate better, and get the most from your SaaS stack</p>
    </div>

    <div class="layout">
      <!-- Sidebar filters -->
      <aside class="sidebar">
        <div class="filter-section">
          <h3>Category</h3>
          <ul class="filter-list">
            <li
              v-for="c in categories"
              :key="c.value"
              :class="['filter-item', activeCategory === c.value && 'active']"
              @click="setCategory(c.value)"
            >
              {{ c.label }}
            </li>
          </ul>
        </div>
        <div class="filter-section">
          <h3>Difficulty</h3>
          <ul class="filter-list">
            <li
              v-for="d in difficulties"
              :key="d.value"
              :class="['filter-item', activeDifficulty === d.value && 'active']"
              @click="setDifficulty(d.value)"
            >
              {{ d.label }}
            </li>
          </ul>
        </div>
      </aside>

      <!-- Guide cards -->
      <main class="guide-grid">
        <div v-if="pending" class="loading-state">
          <div v-for="i in 6" :key="i" class="skeleton-card" />
        </div>
        <div v-else-if="error" class="empty-state">
          <p>Unable to load guides. Please try again.</p>
        </div>
        <div v-else-if="!guides.length" class="empty-state">
          <p>No guides found. Try a different filter.</p>
        </div>
        <template v-else>
          <article v-for="guide in guides" :key="guide.id" class="guide-card">
            <div class="card-top">
              <span :class="['diff-badge', `diff-${guide.difficulty}`]">{{ guide.difficulty }}</span>
              <span class="read-time">{{ guide.read_minutes }} min read</span>
            </div>
            <h2 class="guide-title">
              <NuxtLink :to="`/guides/${guide.slug}`">{{ guide.title }}</NuxtLink>
            </h2>
            <p class="guide-excerpt">{{ guide.excerpt }}</p>
            <div class="card-footer">
              <span class="guide-author">{{ guide.author }}</span>
              <span class="guide-date">{{ formatDate(guide.published_at) }}</span>
            </div>
            <div v-if="guide.tags?.length" class="guide-tags">
              <span v-for="tag in guide.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </article>
        </template>

        <!-- Pagination -->
        <div v-if="pagination && pagination.pages > 1" class="pagination">
          <button :disabled="page === 1" class="page-btn" @click="page--">Previous</button>
          <span class="page-info">Page {{ page }} of {{ pagination.pages }}</span>
          <button :disabled="page >= pagination.pages" class="page-btn" @click="page++">Next</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Guide {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  difficulty: string
  read_minutes: number
  author: string
  tags: string[]
  published_at: string
}

interface GuidesResponse {
  guides: Guide[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

const page = ref(1)
const activeCategory = ref('')
const activeDifficulty = ref('')

const categories = [
  { value: '', label: 'All Guides' },
  { value: 'buyer-tips', label: 'Buyer Tips' },
  { value: 'vendor-guide', label: 'Vendor Guide' },
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'api-docs', label: 'API Docs' }
]

const difficulties = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

const url = computed(() => {
  const params = new URLSearchParams({ page: String(page.value), limit: '12' })
  if (activeCategory.value) params.set('category', activeCategory.value)
  if (activeDifficulty.value) params.set('difficulty', activeDifficulty.value)
  return `/api/guides?${params}`
})

const { data, pending, error } = await useFetch<GuidesResponse>(url)
const guides = computed(() => data.value?.guides ?? [])
const pagination = computed(() => data.value?.pagination)

function setCategory(v: string) { activeCategory.value = v; page.value = 1 }
function setDifficulty(v: string) { activeDifficulty.value = v; page.value = 1 }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

useHead({
  title: 'Guides & Resources — Moonmart',
  meta: [{ name: 'description', content: 'Expert SaaS buying guides, negotiation tips, and vendor resources from the Moonmart editorial team.' }]
})
</script>

<style scoped>
.guides-page { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.page-hero { text-align: center; margin-bottom: 2.5rem; }
.page-hero h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.75rem; }
.page-hero p { color: var(--mm-muted); font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
.layout { display: flex; gap: 2rem; align-items: flex-start; }
.sidebar { width: 220px; flex-shrink: 0; position: sticky; top: 80px; }
.filter-section { margin-bottom: 1.5rem; }
.filter-section h3 { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mm-muted); margin-bottom: 0.5rem; }
.filter-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.2rem; }
.filter-item { padding: 0.4rem 0.75rem; border-radius: var(--r-sm); cursor: pointer; font-size: 0.9rem; transition: background 0.15s; }
.filter-item:hover, .filter-item.active { background: var(--mm-gold); color: #000; }
.guide-grid { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; align-content: start; }
.loading-state { display: contents; }
.skeleton-card { height: 200px; border-radius: var(--r-sm); background: var(--mm-s2); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.empty-state { grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--mm-muted); }
.guide-card { padding: 1.25rem; border: 1px solid var(--b1); border-radius: var(--r-sm); background: var(--mm-s2); display: flex; flex-direction: column; gap: 0.6rem; }
.card-top { display: flex; align-items: center; justify-content: space-between; }
.diff-badge { padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600; text-transform: capitalize; }
.diff-badge.diff-beginner { background: #dcfce7; color: #15803d; }
.diff-badge.diff-intermediate { background: #dbeafe; color: #1e40af; }
.diff-badge.diff-advanced { background: #fde8e8; color: #9b1c1c; }
.read-time { font-size: 0.75rem; color: var(--mm-muted); }
.guide-title { font-size: 1.05rem; font-weight: 600; line-height: 1.4; }
.guide-title a { color: inherit; text-decoration: none; }
.guide-title a:hover { color: var(--mm-gold); }
.guide-excerpt { font-size: 0.875rem; color: var(--mm-muted); line-height: 1.55; flex: 1; }
.card-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--mm-muted); margin-top: auto; }
.guide-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.tag { padding: 0.15rem 0.5rem; border-radius: 999px; border: 1px solid var(--b1); font-size: 0.7rem; }
.pagination { grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem; }
.page-btn { padding: 0.5rem 1.25rem; border: 1px solid var(--b1); border-radius: var(--r-sm); background: transparent; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { color: var(--mm-muted); font-size: 0.9rem; }
@media (max-width: 700px) { .layout { flex-direction: column; } .sidebar { width: 100%; position: static; } }
</style>
