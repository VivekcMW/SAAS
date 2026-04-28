<template>
  <div class="news-feed">
    <!-- Header -->
    <header class="nf-header">
      <div class="nf-wrap">
        <span class="nf-eyebrow">Vendor News</span>
        <h1 class="nf-headline">From the Moonmart community.</h1>
        <p class="nf-lede">
          Product launches, feature deep-dives, case studies, and culture stories written
          by the vendors building on Moonmart.
        </p>
      </div>
    </header>

    <!-- Featured hero (first featured post) -->
    <section v-if="featuredPost" class="nf-hero">
      <div class="nf-wrap">
        <NuxtLink :to="`/news/${featuredPost.slug}`" class="nf-hero__card">
          <div class="nf-hero__media">
            <img v-if="featuredPost.coverImage" :src="featuredPost.coverImage" :alt="featuredPost.title" loading="eager" class="nf-hero__img" />
            <div v-else class="nf-hero__placeholder" aria-hidden="true"></div>
          </div>
          <div class="nf-hero__body">
            <div class="nf-hero__top">
              <span class="nf-badge" :data-type="featuredPost.postType">{{ typeLabel(featuredPost.postType) }}</span>
              <span class="nf-hero__vendor">{{ featuredPost.vendor.name }}</span>
            </div>
            <h2 class="nf-hero__title">{{ featuredPost.title }}</h2>
            <p class="nf-hero__excerpt">{{ featuredPost.excerpt }}</p>
            <div class="nf-hero__footer">
              <time :datetime="featuredPost.publishedAt">{{ fmtDate(featuredPost.publishedAt) }}</time>
              <span class="nf-hero__upvotes">
                <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M12 20.9l-7.7-8.1a5.5 5.5 0 0 1 7.7-7.8 5.5 5.5 0 0 1 7.7 7.8z" fill="currentColor"/></svg>
                {{ featuredPost.upvoteCount }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Filter bar -->
    <div class="nf-bar">
      <div class="nf-wrap nf-bar__inner">
        <NewsTypeFilter v-model="activeType" />
        <p v-if="total > 0" class="nf-bar__count">{{ total }} post{{ total === 1 ? '' : 's' }}</p>
      </div>
    </div>

    <!-- Grid -->
    <section class="nf-grid-section">
      <div class="nf-wrap">
        <!-- Loading skeleton -->
        <div v-if="pending" class="nf-skeleton-grid">
          <div v-for="n in 6" :key="n" class="nf-skeleton"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="!posts.length" class="nf-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <p>No news posts yet{{ activeType ? ' for this category' : '' }}.</p>
        </div>

        <!-- Cards -->
        <div v-else class="nf-grid">
          <NewsCard v-for="post in posts" :key="post.id" :post="post" />
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="nf-pagination" aria-label="Pagination">
          <button class="nf-page-btn" :disabled="page <= 1" @click="setPage(page - 1)">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <span class="nf-page-info">Page {{ page }} of {{ totalPages }}</span>
          <button class="nf-page-btn" :disabled="page >= totalPages" @click="setPage(page + 1)">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </nav>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Vendor News — Moonmart',
  meta: [
    { name: 'description', content: 'Product launches, feature updates, case studies and culture posts from software vendors on Moonmart.' }
  ]
})

interface NewsPost {
  id: string
  postType: string
  title: string
  slug: string
  excerpt: string
  coverImage: string | null
  featured: boolean
  upvoteCount: number
  viewCount: number
  publishedAt: string | null
  tags: string[]
  vendor: { id: string; name: string; slug: string }
  authorName: string
}

interface NewsResponse {
  success: boolean
  posts: NewsPost[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

const TYPE_LABELS: Record<string, string> = {
  'product-update': 'Product Update',
  'feature': 'Feature',
  'case-study': 'Case Study',
  'culture': 'Culture',
  'announcement': 'Announcement'
}

const route = useRoute()
const router = useRouter()

const activeType = ref<string | null>((route.query.type as string) || null)
const page = ref(Number(route.query.page) || 1)

watch(activeType, () => { page.value = 1; sync() })

const queryParams = computed(() => ({
  page: page.value,
  per_page: 12,
  ...(activeType.value ? { type: activeType.value } : {})
}))

const { data, pending, refresh } = await useFetch<NewsResponse>('/api/news', {
  query: queryParams,
  key: computed(() => `news-feed-${activeType.value ?? 'all'}-p${page.value}`)
})

const posts = computed(() => data.value?.posts || [])
const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => data.value?.totalPages || 1)
const featuredPost = computed(() => posts.value.find(p => p.featured) || (page.value === 1 ? posts.value[0] : null))

function typeLabel(t: string) { return TYPE_LABELS[t] || t }

function fmtDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function setPage(p: number) {
  page.value = p
  sync()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function sync() {
  const q: Record<string, string> = {}
  if (activeType.value) q.type = activeType.value
  if (page.value > 1) q.page = String(page.value)
  router.replace({ query: q })
}
</script>

<style scoped>
.news-feed { background: var(--mm-bg); color: var(--mm-pearl); min-height: 100vh; }
.nf-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

/* Header */
.nf-header { padding: 64px 0 40px; border-bottom: 0.5px solid var(--b1); }
.nf-eyebrow {
  display: inline-block; font-size: 11px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--mm-gold); margin-bottom: 16px;
}
.nf-headline {
  font-size: clamp(2rem, 4.5vw, 3rem); font-weight: 700; line-height: 1.1;
  letter-spacing: -0.01em; margin: 0 0 16px; color: var(--mm-pearl); max-width: 700px;
}
.nf-lede { font-size: 16px; line-height: 1.65; color: var(--mm-silver); margin: 0; max-width: 580px; }

/* Hero */
.nf-hero { padding: 40px 0; border-bottom: 0.5px solid var(--b1); }
.nf-hero__card {
  display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
  text-decoration: none; border-radius: var(--r-xl);
  background: var(--mm-s1); border: 0.5px solid var(--b1);
  overflow: hidden; transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.nf-hero__card:hover { border-color: var(--b2); box-shadow: var(--shadow-lg); }
.nf-hero__media { aspect-ratio: 16/9; overflow: hidden; background: var(--mm-s2); }
.nf-hero__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nf-hero__placeholder { width: 100%; height: 100%; background: var(--mm-s3); }
.nf-hero__body { padding: 32px 32px 32px 0; display: flex; flex-direction: column; gap: 12px; justify-content: center; }
.nf-hero__top { display: flex; align-items: center; gap: 10px; }
.nf-hero__vendor { font-size: 13px; color: var(--mm-slate); }
.nf-hero__title { font-size: clamp(18px, 2.5vw, 26px); font-weight: 700; color: var(--mm-pearl); line-height: 1.3; margin: 0; }
.nf-hero__excerpt { font-size: 14px; line-height: 1.65; color: var(--mm-silver); margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.nf-hero__footer { display: flex; align-items: center; gap: 16px; font-size: 12px; color: var(--mm-slate); margin-top: auto; }
.nf-hero__upvotes { display: flex; align-items: center; gap: 4px; }
.nf-hero__upvotes svg { color: var(--mm-gold); }

/* Badge */
.nf-badge {
  display: inline-block; padding: 3px 9px; border-radius: var(--r-full);
  font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
}
.nf-badge[data-type="product-update"] { background: rgba(74,128,212,0.18); color: #6fa0e8; }
.nf-badge[data-type="feature"]        { background: rgba(212,168,67,0.18);  color: var(--mm-goldl); }
.nf-badge[data-type="case-study"]     { background: rgba(42,157,143,0.18);  color: var(--mm-sea); }
.nf-badge[data-type="culture"]        { background: rgba(148,103,189,0.18); color: #c39de0; }
.nf-badge[data-type="announcement"]   { background: rgba(229,101,74,0.18);  color: #f08070; }

/* Filter bar */
.nf-bar {
  position: sticky; top: 0; z-index: 10;
  background: rgba(7,9,15,0.92); backdrop-filter: blur(8px);
  border-bottom: 0.5px solid var(--b1);
}
.nf-bar__inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 14px; padding-bottom: 14px; }
.nf-bar__count { font-size: 12px; color: var(--mm-slate); white-space: nowrap; margin: 0; }

/* Grid */
.nf-grid-section { padding: 40px 0 72px; }
.nf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* Skeleton */
.nf-skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.nf-skeleton {
  height: 300px; border-radius: var(--r-lg);
  background: linear-gradient(90deg, var(--mm-s1) 0%, var(--mm-s2) 50%, var(--mm-s1) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Empty */
.nf-empty {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 64px 24px; color: var(--mm-slate); text-align: center;
}
.nf-empty p { font-size: 15px; margin: 0; }

/* Pagination */
.nf-pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; margin-top: 40px;
}
.nf-page-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: var(--r-md);
  background: var(--mm-s1); border: 0.5px solid var(--b1); color: var(--mm-silver);
  cursor: pointer; transition: border-color var(--transition-fast), color var(--transition-fast);
}
.nf-page-btn:hover:not(:disabled) { border-color: var(--b2); color: var(--mm-pearl); }
.nf-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.nf-page-info { font-size: 13px; color: var(--mm-slate); }

/* Responsive */
@media (max-width: 720px) {
  .nf-header { padding: 40px 0 28px; }
  .nf-hero__card { grid-template-columns: 1fr; }
  .nf-hero__body { padding: 20px; }
  .nf-bar__inner { flex-wrap: wrap; }
}
</style>
