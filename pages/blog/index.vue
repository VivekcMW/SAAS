<template>
  <div class="blog-feed">
    <!-- Header -->
    <header class="bf-header">
      <div class="bf-wrap">
        <span class="bf-eyebrow">Editorial</span>
        <h1 class="bf-headline">The Software Insider.</h1>
        <p class="bf-lede">
          Plain-spoken guides, honest comparisons, and practical playbooks for
          choosing software that actually fits your business.
        </p>
      </div>
    </header>

    <!-- Featured hero -->
    <section v-if="!pending && featuredPost" class="bf-hero">
      <div class="bf-wrap">
        <NuxtLink :to="`/blog/${featuredPost.slug}`" class="bf-hero__card">
          <div class="bf-hero__media">
            <img :src="getThumbnail(featuredPost.slug) || FALLBACK" :alt="featuredPost.title" loading="eager" class="bf-hero__img" @error="onImgError">
          </div>
          <div class="bf-hero__body">
            <div class="bf-hero__top">
              <span class="bf-badge">{{ featuredPost.category }}</span>
              <span class="bf-hero__author">{{ featuredPost.author }}</span>
            </div>
            <h2 class="bf-hero__title">{{ featuredPost.title }}</h2>
            <p class="bf-hero__excerpt">{{ featuredPost.excerpt }}</p>
            <div class="bf-hero__footer">
              <time :datetime="featuredPost.date">{{ fmtDate(featuredPost.date) }}</time>
              <span v-if="featuredPost.readMinutes">{{ featuredPost.readMinutes }} min read</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Filter bar -->
    <div class="bf-bar">
      <div class="bf-wrap bf-bar__inner">
        <div class="bf-bar__cats" role="tablist" aria-label="Filter by topic">
          <button type="button" role="tab" class="bf-cat" :class="{ 'bf-cat--on': activeCategory === 'all' }" :aria-selected="activeCategory === 'all'" @click="setCategory('all')">All</button>
          <button v-for="cat in categories" :key="cat" type="button" role="tab" class="bf-cat" :class="{ 'bf-cat--on': activeCategory === cat }" :aria-selected="activeCategory === cat" @click="setCategory(cat)">{{ cat }}</button>
        </div>
        <label class="bf-search">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Search articles…" aria-label="Search articles">
        </label>
        <p class="bf-bar__count">{{ filteredPosts.length }} article{{ filteredPosts.length !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- Grid section -->
    <section class="bf-grid-section">
      <div class="bf-wrap">
        <!-- Skeleton -->
        <div v-if="pending" class="bf-skeleton-grid">
          <div v-for="n in 6" :key="n" class="bf-skeleton" />
        </div>
        <!-- Empty -->
        <div v-else-if="displayedPosts.length === 0" class="bf-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>
          <p>No articles match your search.</p>
          <button type="button" class="bf-empty__btn" @click="resetFilters">Browse all</button>
        </div>
        <!-- Card grid -->
        <div v-else class="bf-grid">
          <article v-for="post in displayedPosts" :key="post.slug" class="bf-card">
            <NuxtLink :to="`/blog/${post.slug}`" class="bf-card__link">
              <div class="bf-card__cover">
                <img :src="getThumbnail(post.slug) || FALLBACK" :alt="post.title" loading="lazy" class="bf-card__img" @error="onImgError">
                <span class="bf-badge bf-badge--abs">{{ post.category }}</span>
              </div>
              <div class="bf-card__body">
                <div class="bf-card__meta">
                  <time :datetime="post.date" class="bf-card__date">{{ fmtDate(post.date) }}</time>
                  <span v-if="post.readMinutes" class="bf-card__read">· {{ post.readMinutes }} min</span>
                </div>
                <h3 class="bf-card__title">{{ post.title }}</h3>
                <p class="bf-card__excerpt">{{ post.excerpt }}</p>
                <span class="bf-card__cta">
                  Read article
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
                </span>
              </div>
            </NuxtLink>
          </article>
        </div>
        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="bf-pagination" aria-label="Pagination">
          <button class="bf-page-btn" :disabled="currentPage <= 1" aria-label="Previous page" @click="setPage(currentPage - 1)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span class="bf-page-info">Page <strong>{{ currentPage }}</strong> of {{ totalPages }}</span>
          <button class="bf-page-btn" :disabled="currentPage >= totalPages" aria-label="Next page" @click="setPage(currentPage + 1)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </nav>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { blogPosts as staticBlogPosts } from '~/utils/blogPosts'

useHead({
  title: 'Blog — The Software Insider | Moonmart',
  meta: [{ name: 'description', content: 'Plain-spoken guides, honest comparisons, and practical playbooks for choosing software that actually fits your business.' }]
})

const FALLBACK = '/assets/images/hero-dashboard.png'
const PER_PAGE = 6

const { getThumbnail } = useStaticThumbnails()
const { fmtDate } = useFmt()

const onImgError = (e: Event) => {
  const img = e.target as HTMLImageElement | null
  if (img && img.src && !img.src.endsWith(FALLBACK)) img.src = FALLBACK
}

interface BlogPost {
  id?: string; slug: string; title: string; excerpt: string
  category: string; author: string; readMinutes?: number
  date: string; image?: string; tags?: string[]
}

const activeCategory = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)

const { data, pending } = await useFetch<{ posts: any[]; total: number }>('/api/blog', {
  query: { limit: 100 },
  key: 'blog-index'
})

const allPosts = computed<BlogPost[]>(() => {
  const api = (data.value?.posts ?? []).map(p => ({
    ...p,
    date: p.published_at ?? p.date ?? '',
    readMinutes: p.read_minutes ?? p.readMinutes
  }))
  if (api.length > 0) return api
  return staticBlogPosts.map(p => ({ ...p }))
})

const featuredPost = computed(() => allPosts.value[0] ?? null)
const categories = computed(() => [...new Set(allPosts.value.map(p => p.category))])

const filteredPosts = computed(() => {
  let list = allPosts.value
  if (activeCategory.value !== 'all') list = list.filter(p => p.category === activeCategory.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / PER_PAGE)))
const displayedPosts = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE
  return filteredPosts.value.slice(start, start + PER_PAGE)
})

watch([activeCategory, searchQuery], () => { currentPage.value = 1 })

function setCategory(cat: string) { activeCategory.value = cat }
function setPage(p: number) {
  currentPage.value = Math.max(1, Math.min(p, totalPages.value))
  globalThis.window?.scrollTo({ top: 0, behavior: 'smooth' })
}
function resetFilters() { activeCategory.value = 'all'; searchQuery.value = ''; currentPage.value = 1 }
</script>

<style scoped>
.blog-feed { background: var(--mm-bg); color: var(--mm-pearl); min-height: 100vh; }
.bf-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

.bf-header { padding: 64px 0 40px; border-bottom: 0.5px solid var(--b1); }
.bf-eyebrow { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mm-gold); margin-bottom: 16px; }
.bf-headline { font-size: clamp(2rem, 4.5vw, 3rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.01em; margin: 0 0 16px; color: var(--mm-pearl); max-width: 700px; }
.bf-lede { font-size: 16px; line-height: 1.65; color: var(--mm-silver); margin: 0; max-width: 580px; }

.bf-hero { padding: 40px 0; border-bottom: 0.5px solid var(--b1); }
.bf-hero__card { display: grid; grid-template-columns: 1.05fr 1fr; gap: 40px; text-decoration: none; border-radius: 16px; background: var(--mm-s1); border: 0.5px solid var(--b1); overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
.bf-hero__card:hover { border-color: var(--b2); box-shadow: 0 20px 60px -20px rgba(0,0,0,0.5); }
.bf-hero__media { aspect-ratio: 16/9; overflow: hidden; background: var(--mm-s2); }
.bf-hero__img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
.bf-hero__card:hover .bf-hero__img { transform: scale(1.03); }
.bf-hero__body { padding: 32px 32px 32px 0; display: flex; flex-direction: column; gap: 12px; justify-content: center; }
.bf-hero__top { display: flex; align-items: center; gap: 10px; }
.bf-hero__author { font-size: 13px; color: var(--mm-slate); }
.bf-hero__title { font-size: clamp(18px, 2.5vw, 26px); font-weight: 700; color: var(--mm-pearl); line-height: 1.3; margin: 0; }
.bf-hero__excerpt { font-size: 14px; line-height: 1.65; color: var(--mm-silver); margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.bf-hero__footer { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--mm-slate); margin-top: auto; }
@media (max-width: 720px) { .bf-hero__card { grid-template-columns: 1fr; } .bf-hero__body { padding: 20px; } }

.bf-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: var(--mm-gold-soft, rgba(212,168,67,0.15)); color: var(--mm-goldl, #EEC563); }

.bf-bar { position: sticky; top: 0; z-index: 20; background: rgba(7,9,15,0.92); backdrop-filter: blur(10px); border-bottom: 0.5px solid var(--b1); }
.bf-bar__inner { display: flex; align-items: center; gap: 12px; padding: 12px 0; flex-wrap: wrap; }
.bf-bar__cats { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; min-width: 0; }
.bf-cat { padding: 5px 14px; border-radius: 999px; font-size: 13px; font-weight: 500; background: transparent; border: 0.5px solid var(--b1); color: var(--mm-silver); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.bf-cat:hover { border-color: var(--b2); color: var(--mm-pearl); }
.bf-cat--on { background: var(--mm-gold-soft, rgba(212,168,67,0.15)); border-color: var(--mm-gold); color: var(--mm-goldl, #EEC563); font-weight: 600; }
.bf-search { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px; background: var(--mm-s1); border: 0.5px solid var(--b1); color: var(--mm-slate); transition: border-color 0.15s; }
.bf-search:focus-within { border-color: var(--mm-gold); color: var(--mm-pearl); }
.bf-search input { background: none; border: none; outline: none; font: inherit; font-size: 13px; color: var(--mm-silver); width: 160px; }
.bf-search input::placeholder { color: var(--mm-slate); }
.bf-bar__count { font-size: 12px; color: var(--mm-slate); white-space: nowrap; margin: 0; }

.bf-grid-section { padding: 40px 0 80px; }
.bf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

.bf-card { background: var(--mm-s1); border: 0.5px solid var(--b1); border-radius: 14px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
.bf-card:hover { border-color: var(--b2); box-shadow: 0 16px 48px -16px rgba(0,0,0,0.5); transform: translateY(-2px); }
.bf-card__link { display: flex; flex-direction: column; height: 100%; text-decoration: none; }
.bf-card__cover { position: relative; aspect-ratio: 16/9; overflow: hidden; background: var(--mm-s2); }
.bf-card__img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
.bf-card:hover .bf-card__img { transform: scale(1.04); }
.bf-badge--abs { position: absolute; top: 10px; left: 10px; }
.bf-card__body { padding: 20px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.bf-card__meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--mm-slate); }
.bf-card__title { font-size: 16px; font-weight: 700; color: var(--mm-pearl); line-height: 1.4; margin: 0; }
.bf-card__excerpt { font-size: 13px; line-height: 1.6; color: var(--mm-silver); margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.bf-card__cta { display: inline-flex; align-items: center; gap: 5px; margin-top: auto; padding-top: 8px; font-size: 12px; font-weight: 600; color: var(--mm-gold); }

.bf-skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.bf-skeleton { height: 340px; border-radius: 14px; background: linear-gradient(90deg, var(--mm-s1) 0%, var(--mm-s2) 50%, var(--mm-s1) 100%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.bf-empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 72px 24px; color: var(--mm-slate); text-align: center; }
.bf-empty p { margin: 0; font-size: 15px; }
.bf-empty__btn { padding: 8px 22px; border-radius: 8px; font: inherit; font-size: 13px; font-weight: 600; background: var(--mm-gold-soft, rgba(212,168,67,0.15)); border: 0.5px solid var(--mm-gold); color: var(--mm-goldl); cursor: pointer; transition: background 0.15s; }
.bf-empty__btn:hover { background: rgba(212,168,67,0.25); }

.bf-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding-top: 40px; }
.bf-page-btn { width: 36px; height: 36px; border-radius: 8px; border: 0.5px solid var(--b1); background: var(--mm-s1); color: var(--mm-silver); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
.bf-page-btn:hover:not(:disabled) { border-color: var(--b2); color: var(--mm-pearl); }
.bf-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.bf-page-info { font-size: 13px; color: var(--mm-slate); }
.bf-page-info strong { color: var(--mm-pearl); }

@media (max-width: 600px) {
  .bf-header { padding: 40px 0 28px; }
  .bf-bar__inner { gap: 8px; }
  .bf-search input { width: 110px; }
}
</style>
