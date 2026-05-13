<template>
  <div class="blog">
    <!-- Intro -->
    <header class="blog__intro">
      <div class="blog__wrap">
        <span class="blog__label">Journal</span>
        <h1 class="blog__headline">The Software Insider.</h1>
        <p class="blog__lede">
          Plain-spoken guides, honest comparisons, and practical playbooks for choosing
          software that actually fits your business.
        </p>
      </div>
    </header>

    <!-- Featured -->
    <section v-if="featuredPost" class="blog__feature">
      <div class="blog__wrap">
        <NuxtLink :to="`/blog/${featuredPost.slug}`" class="feature">
          <div class="feature__text">
            <span class="feature__kicker">This week’s read</span>
            <h2 class="feature__title">{{ featuredPost.title }}</h2>
            <p class="feature__excerpt">{{ featuredPost.excerpt }}</p>
            <div class="feature__meta">
              <span>{{ featuredPost.category }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ formatDate(featuredPost.date) }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ featuredPost.author }}</span>
            </div>
          </div>
          <div class="feature__media">
            <img :src="getThumbnail(featuredPost.slug)" :alt="featuredPost.title" loading="lazy" @error="onImgError">
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Topics bar -->
    <div class="blog__bar">
      <div class="blog__wrap">
        <div class="topics" role="tablist" aria-label="Filter articles by topic">
          <button
            type="button"
            role="tab"
            class="topic"
            :class="{ 'topic--on': activeCategory === 'all' }"
            :aria-selected="activeCategory === 'all'"
            @click="setCategory('all')"
          >All</button>
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            role="tab"
            class="topic"
            :class="{ 'topic--on': activeCategory === category }"
            :aria-selected="activeCategory === category"
            @click="setCategory(category)"
          >{{ category }}</button>
        </div>

        <label class="find">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search articles"
            aria-label="Search articles"
            @input="filterPosts"
          >
        </label>
      </div>
    </div>

    <!-- List -->
    <section class="blog__list">
      <div class="blog__wrap">
        <div v-if="postsLoading" style="text-align:center;padding:3rem 0;color:#888;">Loading articles…</div>
        <template v-else>
        <div v-if="filteredPosts.length > 0" class="blog__meta-row">
          <span>
            Showing <strong>{{ displayedPosts.length }}</strong>
            of {{ filteredPosts.length }} article<span v-if="filteredPosts.length !== 1">s</span>
          </span>
          <span v-if="activeCategory !== 'all' || searchQuery" class="blog__meta-reset">
            <button type="button" @click="resetFilters">Clear filters</button>
          </span>
        </div>

        <div v-if="filteredPosts.length > 0" class="grid">
          <article
            v-for="post in displayedPosts"
            :key="post.slug"
            class="post"
          >
            <NuxtLink :to="`/blog/${post.slug}`" class="post__link">
              <div class="post__media">
                <img :src="getThumbnail(post.slug)" :alt="post.title" loading="lazy" @error="onImgError">
              </div>
              <div class="post__body">
                <div class="post__meta">
                  <span class="post__tag">{{ post.category }}</span>
                  <span class="post__date">{{ formatDate(post.date) }}</span>
                </div>
                <h3 class="post__title">{{ post.title }}</h3>
                <p class="post__excerpt">{{ post.excerpt }}</p>
                <span class="post__cta">
                  Read article
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Empty -->
        <div v-else class="empty">
          <h3>Nothing matches that search.</h3>
          <p>Try a different keyword, or browse all articles.</p>
          <button type="button" class="empty__btn" @click="resetFilters">Browse all</button>
        </div>

        <!-- Pagination -->
        <nav v-if="filteredPosts.length > 0 && totalPages > 1" class="pager" aria-label="Pagination">
          <button
            type="button"
            class="pager__btn"
            :disabled="currentPage === 1"
            aria-label="Previous page"
            @click="setPage(currentPage - 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="M11 6l-6 6 6 6" />
            </svg>
          </button>
          <span class="pager__info">
            <strong>{{ currentPage }}</strong> / {{ totalPages }}
          </span>
          <button
            type="button"
            class="pager__btn"
            :disabled="currentPage === totalPages"
            aria-label="Next page"
            @click="setPage(currentPage + 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </button>
        </nav>
        </template><!-- /v-else (not loading) -->
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Import the static thumbnails composable
const { getThumbnail } = useStaticThumbnails();

// Graceful fallback when a thumbnail fails to load
const FALLBACK_THUMB = '/assets/images/hero-dashboard.png';
const onImgError = (e: Event) => {
  const img = e.target as HTMLImageElement | null;
  if (img && img.src && !img.src.endsWith(FALLBACK_THUMB)) {
    img.src = FALLBACK_THUMB;
  }
};

// Featured Post
// Blog posts loaded from database via API
interface BlogPost {
  id: string; slug: string; title: string; excerpt: string;
  category: string; author: string; author_title?: string;
  read_minutes?: number; image?: string; tags?: string[];
  date: string; // mapped from published_at
}

const allPosts = ref<BlogPost[]>([])
const featuredPost = computed<BlogPost | null>(() => allPosts.value[0] ?? null)
const postsLoading = ref(false)

async function loadPosts() {
  postsLoading.value = true
  try {
    const res = await $fetch<{ posts: any[]; total: number }>('/api/blog', {
      query: { limit: 100 },
    })
    allPosts.value = (res.posts ?? []).map(p => ({
      ...p,
      date: p.published_at ?? p.date ?? '',
      image: p.image ? getThumbnail(p.slug) || p.image : getThumbnail(p.slug) || FALLBACK_THUMB,
    }))
  } catch {
    // API unavailable — leave allPosts empty, page will show empty state
  } finally {
    postsLoading.value = false
  }
}


// Extract unique categories from posts
const categories = computed(() => {
  const categoriesSet = new Set(allPosts.value.map(post => post.category));
  return Array.from(categoriesSet);
});

// Filtering and pagination state
const activeCategory = ref('all');
const searchQuery = ref('');
const filteredPosts = ref<BlogPost[]>([]);
const currentPage = ref(1);
const postsPerPage = 6;

// Computed total pages
const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / postsPerPage);
});

// Display posts for current page
const displayedPosts = computed(() => {
  const startIndex = (currentPage.value - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  return filteredPosts.value.slice(startIndex, endIndex);
});

// Filter posts based on category and search query
const filterPosts = () => {
  let filtered = [...allPosts.value];
  
  // Filter by category
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(post => post.category === activeCategory.value);
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(query) || 
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query)
    );
  }
  
  // Update filtered posts
  filteredPosts.value = filtered;
  
  // Reset to first page when filters change
  currentPage.value = 1;
};

// Set active category
const setCategory = (category: string | null) => {
  activeCategory.value = category ?? 'all';
  filterPosts();
};

// Reset all filters
const resetFilters = () => {
  activeCategory.value = 'all';
  searchQuery.value = '';
  filterPosts();
};

// Set current page
const setPage = (page: number) => {
  if (page < 1) page = 1;
  if (page > totalPages.value) page = totalPages.value;
  currentPage.value = page;
};

// Format date
const { fmtDate } = useFmt()
const formatDate = (dateStr: string) => fmtDate(dateStr, { year: 'numeric', month: 'long', day: 'numeric' });

// Initialize filtered posts on mount
onMounted(async () => {
  await loadPosts();
  filterPosts();
});
</script>


<style scoped>
/* Shell ---------------------------------------------------------- */
.blog { background: #ffffff; color: #1e1e1e; }
.blog__wrap { max-width: 1160px; margin: 0 auto; padding: 0 1.5rem; }

/* Intro ---------------------------------------------------------- */
.blog__intro {
  padding: 5rem 0 2.75rem;
  border-bottom: 1px solid #f0efec;
}
.blog__label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7C5500;
  margin-bottom: 1rem;
}
.blog__headline {
  font-family: var(--font-heading, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif);
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: #1e1e1e;
  margin: 0 0 1rem;
  max-width: 720px;
}
.blog__lede {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: #52525b;
  margin: 0;
  max-width: 620px;
}

/* Featured ------------------------------------------------------- */
.blog__feature { padding: 3rem 0 1rem; }
.feature {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 3rem;
  align-items: center;
  color: inherit;
  text-decoration: none;
}
.feature__kicker {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7C5500;
  margin-bottom: 1rem;
}
.feature__title {
  font-family: var(--font-heading, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif);
  font-size: clamp(1.625rem, 3vw, 2.25rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.005em;
  color: #1e1e1e;
  margin: 0 0 1rem;
  transition: color 0.2s ease;
}
.feature:hover .feature__title { color: var(--sw-primary, #ff8838); }
.feature__excerpt {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: #3f3f46;
  margin: 0 0 1.25rem;
}
.feature__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #71717a;
}
.feature__meta span:first-child { font-weight: 600; color: #1e1e1e; }
.feature__media {
  aspect-ratio: 4 / 3;
  background: var(--sw-primary-soft, #fff1e6);
  border-radius: 18px;
  overflow: hidden;
  display: grid;
  place-items: center;
}
.feature__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  padding: 1.25rem;
  transition: transform 0.5s ease;
}
.feature:hover .feature__media img { transform: scale(1.03); }

/* Topics bar ----------------------------------------------------- */
.blog__bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(180%) blur(8px);
  border-top: 1px solid #f0efec;
  border-bottom: 1px solid #f0efec;
  margin-top: 2rem;
}
.blog__bar .blog__wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
.topics {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1 1 auto;
  min-width: 0;
}
.topics::-webkit-scrollbar { display: none; }
.topic {
  background: transparent;
  border: none;
  color: #71717a;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 0;
  position: relative;
  font-family: inherit;
  transition: color 0.15s ease;
}
.topic:hover { color: #1e1e1e; }
.topic--on {
  color: #1e1e1e;
  font-weight: 600;
}
.topic--on::after {
  content: '';
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: -0.75rem;
  height: 2px;
  background: var(--sw-primary, #ff8838);
}
.find {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 40px;
  padding: 0 0.85rem;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  transition: border-color 0.15s ease;
  flex-shrink: 0;
  width: 240px;
}
.find:focus-within {
  border-color: var(--sw-primary, #ff8838);
}
.find svg {
  width: 16px;
  height: 16px;
  color: #a1a1aa;
  flex-shrink: 0;
}
.find input {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  font-size: 0.9375rem;
  color: #1e1e1e;
  font-family: inherit;
}
.find input::placeholder { color: #a1a1aa; }

/* List ----------------------------------------------------------- */
.blog__list { padding: 3rem 0 6rem; }
.blog__meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #71717a;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.blog__meta-row strong { color: #1e1e1e; font-weight: 700; }
.blog__meta-reset button {
  background: none;
  border: none;
  padding: 0;
  color: var(--sw-primary, #ff8838);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem 2rem;
}

.post { border: none; background: transparent; }
.post__link {
  display: block;
  color: inherit;
  text-decoration: none;
}
.post__media {
  aspect-ratio: 16 / 10;
  background: var(--sw-primary-soft, #fff1e6);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1rem;
  display: grid;
  place-items: center;
}
.post__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  padding: 0.75rem;
  transition: transform 0.4s ease;
}
.post__link:hover .post__media img { transform: scale(1.04); }
.post__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}
.post__tag {
  font-weight: 700;
  color: #7C5500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.post__date { color: #595959; }
.post__title {
  font-family: var(--font-heading, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif);
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
  color: #1e1e1e;
  margin: 0 0 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s ease;
}
.post__link:hover .post__title { color: var(--sw-primary, #ff8838); }
.post__excerpt {
  font-size: 0.9375rem;
  line-height: 1.55;
  color: #52525b;
  margin: 0 0 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e1e1e;
  transition: color 0.15s ease, gap 0.15s ease;
}
.post__cta svg { width: 14px; height: 14px; }
.post__link:hover .post__cta {
  color: var(--sw-primary, #ff8838);
  gap: 0.55rem;
}

/* Empty ---------------------------------------------------------- */
.empty {
  text-align: center;
  padding: 4.5rem 1.5rem;
  border: 1px dashed #e4e4e7;
  border-radius: 16px;
  background: #fbfaf8;
}
.empty h3 {
  font-family: var(--font-heading, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0 0 0.5rem;
}
.empty p { color: #52525b; margin: 0 0 1.5rem; font-size: 0.9375rem; }
.empty__btn {
  background: #1e1e1e;
  color: #ffffff;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;
}
.empty__btn:hover { background: var(--sw-primary, #ff8838); }

/* Pager ---------------------------------------------------------- */
.pager {
  margin-top: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}
.pager__btn {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid #e4e4e7;
  background: #ffffff;
  color: #1e1e1e;
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}
.pager__btn:hover:not(:disabled) {
  border-color: var(--sw-primary, #ff8838);
  color: var(--sw-primary, #ff8838);
}
.pager__btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pager__btn svg { width: 16px; height: 16px; }
.pager__info {
  font-size: 0.9375rem;
  color: #71717a;
  font-variant-numeric: tabular-nums;
}
.pager__info strong { color: #1e1e1e; font-weight: 700; }

/* Responsive ----------------------------------------------------- */
@media (max-width: 960px) {
  .feature { grid-template-columns: 1fr; gap: 1.75rem; }
  .feature__media { order: -1; aspect-ratio: 16 / 10; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 2rem 1.5rem; }
}
@media (max-width: 640px) {
  .blog__intro { padding: 3.5rem 0 2rem; }
  .blog__feature { padding: 2rem 0 0.5rem; }
  .blog__list { padding: 2.5rem 0 4rem; }
  .blog__bar .blog__wrap { flex-direction: column; align-items: stretch; gap: 0.75rem; }
  .find { width: 100%; }
  .topic--on::after { bottom: -0.5rem; }
  .grid { grid-template-columns: 1fr; gap: 2rem; }
}
</style>
