<template>
  <div class="qa-index">
    <div class="qa-index__hero">
      <div class="qa-index__hero-content">
        <h1>Community Q&amp;A</h1>
        <p>Ask questions, share expertise, and help others choose the right SaaS tools.</p>
        <NuxtLink to="/qa/ask" class="btn-primary">Ask a question</NuxtLink>
      </div>
    </div>

    <div class="qa-index__body container">
      <aside class="qa-index__sidebar">
        <div class="sidebar-card">
          <h3>Popular tags</h3>
          <div v-if="tagsData?.tags?.length" class="tag-cloud">
            <NuxtLink
              v-for="t in tagsData.tags"
              :key="t.tag"
              :to="`/qa?tag=${t.tag}`"
              class="tag"
              :class="{ 'tag--active': filters.tag === t.tag }"
            >
              {{ t.tag }}
              <span class="tag__count">{{ t.question_count }}</span>
            </NuxtLink>
          </div>
          <p v-else class="muted">No tags yet.</p>
        </div>
      </aside>

      <main class="qa-index__main">
        <!-- Filters -->
        <div class="qa-filters">
          <div class="qa-filters__search">
            <input v-model="filters.q" type="search" placeholder="Search questions…" @input="onSearch" />
          </div>
          <div class="qa-filters__sort">
            <button
              v-for="s in SORTS"
              :key="s.value"
              class="sort-btn"
              :class="{ 'sort-btn--active': filters.sort === s.value }"
              @click="setSort(s.value)"
            >{{ s.label }}</button>
          </div>
          <label class="qa-filters__solved">
            <input type="checkbox" v-model="filters.solved" @change="load()" /> Solved only
          </label>
        </div>

        <p v-if="pending" class="muted">Loading…</p>
        <p v-else-if="!data?.questions?.length" class="muted">No questions found. <NuxtLink to="/qa/ask">Be the first to ask!</NuxtLink></p>

        <ul v-else class="question-list">
          <li v-for="q in data.questions" :key="q.id" class="question-list__item">
            <div class="question-list__votes">
              <span>{{ q.vote_score }}</span>
              <small>votes</small>
            </div>
            <div class="question-list__answers" :class="{ 'question-list__answers--solved': q.solved }">
              <span>{{ q.answer_count }}</span>
              <small>{{ q.solved ? 'solved' : 'answers' }}</small>
            </div>
            <div class="question-list__body">
              <NuxtLink :to="`/qa/${q.slug}`" class="question-list__title">{{ q.title }}</NuxtLink>
              <div class="question-list__meta">
                <span>{{ q.author_name }}</span>
                <span class="muted">·</span>
                <time class="muted">{{ relDate(q.created_at) }}</time>
                <template v-if="q.tags?.length">
                  <span class="muted">·</span>
                  <NuxtLink
                    v-for="tag in q.tags.slice(0, 4)"
                    :key="tag"
                    :to="`/qa?tag=${tag}`"
                    class="tag tag--sm"
                  >{{ tag }}</NuxtLink>
                </template>
              </div>
            </div>
          </li>
        </ul>

        <!-- Pagination -->
        <div v-if="(data?.total || 0) > LIMIT" class="qa-index__pager">
          <button :disabled="page <= 1" @click="page--">Previous</button>
          <span>Page {{ page }} / {{ Math.ceil((data?.total || 0) / LIMIT) }}</span>
          <button :disabled="page * LIMIT >= (data?.total || 0)" @click="page++">Next</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Community Q&A — SaasWorld', description: 'Ask questions and get expert answers about SaaS products.' })

const LIMIT = 20
const SORTS = [
  { value: 'recent', label: 'Recent' },
  { value: 'votes', label: 'Most voted' },
  { value: 'unanswered', label: 'Unanswered' }
]

const route = useRoute()
const router = useRouter()

const filters = reactive({
  q: (route.query.q as string) || '',
  tag: (route.query.tag as string) || '',
  sort: (route.query.sort as string) || 'recent',
  solved: route.query.solved === '1'
})
const page = ref(Number(route.query.page) || 1)

const { data, pending, refresh } = await useAsyncData(
  'qa-questions',
  () => $fetch('/api/qa/questions', {
    params: {
      q: filters.q || undefined,
      tag: filters.tag || undefined,
      sort: filters.sort,
      solved: filters.solved ? '1' : undefined,
      page: page.value,
      limit: LIMIT
    }
  }),
  { watch: [page] }
)

const { data: tagsData } = await useAsyncData('qa-tags', () => $fetch('/api/qa/tags'))

function load() { page.value = 1; refresh() }
let searchTimer: ReturnType<typeof setTimeout>
function onSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(load, 350) }
function setSort(s: string) { filters.sort = s; load() }

function relDate(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.qa-index__hero { background: #4f46e5; color: #fff; padding: 3rem 1.5rem; text-align: center; }
.qa-index__hero h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
.qa-index__hero p  { opacity: 0.85; margin-bottom: 1.25rem; }
.btn-primary { display: inline-block; background: #fff; color: #4f46e5; font-weight: 700; padding: 0.625rem 1.5rem; border-radius: 8px; text-decoration: none; }
.btn-primary:hover { background: #e0e7ff; }
.qa-index__body { display: grid; grid-template-columns: 240px 1fr; gap: 2rem; padding: 2rem 1.5rem; }
@media (max-width: 768px) { .qa-index__body { grid-template-columns: 1fr; } .qa-index__sidebar { order: 2; } }
.container { max-width: 1100px; margin: 0 auto; }
.sidebar-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; }
.sidebar-card h3 { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 0.75rem; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { display: inline-flex; align-items: center; gap: 4px; background: #f3f4f6; color: #374151; font-size: 0.78rem; padding: 3px 8px; border-radius: 999px; text-decoration: none; }
.tag:hover, .tag--active { background: #e0e7ff; color: #4f46e5; }
.tag--sm { padding: 2px 6px; font-size: 0.72rem; }
.tag__count { background: #e5e7eb; border-radius: 99px; padding: 0 5px; font-size: 0.68rem; }
.qa-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.qa-filters__search input { border: 1px solid #d1d5db; border-radius: 8px; padding: 0.4rem 0.75rem; font-size: 0.875rem; min-width: 200px; }
.qa-filters__sort { display: flex; gap: 4px; }
.sort-btn { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 12px; font-size: 0.8rem; cursor: pointer; }
.sort-btn--active { background: #4f46e5; color: #fff; border-color: #4f46e5; }
.qa-filters__solved { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; cursor: pointer; }
.question-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0; }
.question-list__item { display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 0; border-bottom: 1px solid #f3f4f6; }
.question-list__votes, .question-list__answers { text-align: center; min-width: 52px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 4px; background: #f9fafb; }
.question-list__votes span, .question-list__answers span { display: block; font-size: 1.1rem; font-weight: 700; }
.question-list__votes small, .question-list__answers small { font-size: 0.65rem; color: #9ca3af; text-transform: uppercase; }
.question-list__answers--solved { background: #d1fae5; border-color: #6ee7b7; }
.question-list__answers--solved small { color: #065f46; }
.question-list__body { flex: 1; }
.question-list__title { font-size: 1rem; font-weight: 600; text-decoration: none; color: #111827; }
.question-list__title:hover { color: #4f46e5; }
.question-list__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 4px; font-size: 0.78rem; }
.muted { color: #9ca3af; }
.qa-index__pager { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1.5rem 0; }
.qa-index__pager button { border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; padding: 6px 16px; cursor: pointer; }
.qa-index__pager button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
