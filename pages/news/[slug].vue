<template>
  <div class="news-article">
    <!-- Loading -->
    <div v-if="pending" class="na-loading">
      <div class="na-spinner" aria-label="Loading…"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error || !post" class="na-error">
      <h1>Post not found</h1>
      <p>This article may have been removed or is not yet published.</p>
      <NuxtLink to="/news" class="na-back">Browse all news</NuxtLink>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Back link -->
      <div class="na-wrap na-back-row">
        <NuxtLink to="/news" class="na-back">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          All news
        </NuxtLink>
      </div>

      <article class="na-wrap na-article">
        <!-- Header -->
        <header class="na-head">
          <div class="na-head__top">
            <span class="na-badge" :data-type="post.postType">{{ typeLabel(post.postType) }}</span>
            <span v-if="post.app" class="na-head__app">
              <img v-if="post.app.logo" :src="post.app.logo" :alt="post.app.name" width="16" height="16" class="na-head__app-logo" />
              {{ post.app.name }}
            </span>
          </div>

          <h1 class="na-title">{{ post.title }}</h1>
          <p class="na-excerpt">{{ post.excerpt }}</p>

          <div class="na-head__meta">
            <NuxtLink :to="`/vendor/${post.vendor.slug}`" class="na-vendor">
              <span class="na-vendor__dot" aria-hidden="true"></span>
              {{ post.vendor.name }}
            </NuxtLink>
            <span class="na-sep" aria-hidden="true">·</span>
            <time :datetime="post.publishedAt ?? undefined">{{ fmtDate(post.publishedAt) }}</time>
            <span class="na-sep" aria-hidden="true">·</span>
            <span>{{ readTime }} min read</span>
            <span class="na-sep" aria-hidden="true">·</span>
            <span class="na-views">
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              {{ post.viewCount }}
            </span>
          </div>
        </header>

        <!-- Cover -->
        <figure v-if="post.coverImage" class="na-cover">
          <img :src="post.coverImage" :alt="post.title" class="na-cover__img" loading="eager" />
        </figure>

        <!-- Body -->
        <div class="na-layout">
          <!-- Article body -->
          <div class="na-body-col">
            <div class="na-body">
              <div class="na-body__content prose" v-html="bodyHtml"></div>

              <!-- AI Insight: what this means for buyers -->
              <NewsAIInsight :slug="slug" />
            </div>

            <!-- Tags -->
            <div v-if="post.tags.length" class="na-tags">
              <span v-for="tag in post.tags" :key="tag" class="na-tag">{{ tag }}</span>
            </div>

            <!-- Upvote -->
            <div class="na-react">
              <button class="na-react__btn" :class="{ 'na-react__btn--voted': voted }" :disabled="voted" @click="react">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20.9l-7.7-8.1a5.5 5.5 0 0 1 7.7-7.8 5.5 5.5 0 0 1 7.7 7.8z" fill="currentColor"/></svg>
                {{ voted ? 'Upvoted' : 'Upvote' }}
                <span class="na-react__count">{{ upvoteCount }}</span>
              </button>
              <span v-if="voted" class="na-react__thanks">Thanks for the support!</span>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="na-sidebar">
            <!-- Vendor card -->
            <div class="na-vendor-card">
              <p class="na-sidebar__label">Written by</p>
              <NuxtLink :to="`/vendor/${post.vendor.slug}`" class="na-vendor-card__link">
                <div class="na-vendor-card__name">{{ post.vendor.name }}</div>
                <p class="na-vendor-card__author">{{ post.authorName }}</p>
              </NuxtLink>
            </div>

            <!-- Related posts -->
            <div v-if="post.related.length" class="na-related">
              <p class="na-sidebar__label">More from {{ post.vendor.name }}</p>
              <ul class="na-related__list">
                <li v-for="rel in post.related" :key="rel.id">
                  <NuxtLink :to="`/news/${rel.slug}`" class="na-related__item">
                    <span class="na-related__badge" :data-type="rel.post_type">{{ typeLabel(rel.post_type) }}</span>
                    <span class="na-related__title">{{ rel.title }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </template>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
const route = useRoute()
const slug = computed(() => route.params.slug as string)

interface PostDetail {
  id: string
  postType: string
  title: string
  slug: string
  excerpt: string
  bodyMarkdown: string
  coverImage: string | null
  featured: boolean
  upvoteCount: number
  viewCount: number
  publishedAt: string | null
  tags: string[]
  vendor: { id: string; name: string; slug: string }
  authorName: string
  app: { id: string; name: string; slug: string; logo: string | null } | null
  related: { id: string; title: string; slug: string; post_type: string; excerpt: string; cover_image: string | null; published_at: string | null; upvote_count: number }[]
}

const { data, pending, error } = await useFetch<{ success: boolean; post: PostDetail }>(`/api/news/${slug.value}`, {
  key: `news-post-${slug.value}`,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
})

const post = computed(() => data.value?.post || null)

const TYPE_LABELS: Record<string, string> = {
  'product-update': 'Product Update',
  'feature': 'Feature',
  'case-study': 'Case Study',
  'culture': 'Culture',
  'announcement': 'Announcement'
}

function typeLabel(t: string) { return TYPE_LABELS[t] || t }
function fmtDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const bodyHtml = computed(() => {
  if (!post.value?.bodyMarkdown) return ''
  return marked.parse(post.value.bodyMarkdown) as string
})

const readTime = computed(() => {
  if (!post.value?.bodyMarkdown) return 1
  const words = post.value.bodyMarkdown.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
})

// Head / SEO
watchEffect(() => {
  if (!post.value) return
  useHead({
    title: `${post.value.title} — Moonmart News`,
    meta: [
      { name: 'description', content: post.value.excerpt },
      { property: 'og:title', content: post.value.title },
      { property: 'og:description', content: post.value.excerpt },
      ...(post.value.coverImage ? [{ property: 'og:image', content: post.value.coverImage }] : [])
    ],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.value.title,
        description: post.value.excerpt,
        datePublished: post.value.publishedAt,
        author: { '@type': 'Organization', name: post.value.vendor.name },
        image: post.value.coverImage || undefined
      })
    }]
  })
})

// Upvote
const voted = ref(false)
const upvoteCount = ref(0)

onMounted(() => {
  if (post.value) upvoteCount.value = post.value.upvoteCount
})

async function react() {
  if (voted.value || !post.value) return
  try {
    const res = await $fetch<{ success: boolean; alreadyVoted: boolean; upvoteCount: number }>(
      `/api/news/${post.value.id}/react`, { method: 'POST' }
    )
    voted.value = true
    upvoteCount.value = res.upvoteCount
  } catch { /* ignore */ }
}
</script>

<style scoped>
.news-article { background: var(--mm-bg); color: var(--mm-pearl); min-height: 100vh; padding-bottom: 80px; }
.na-wrap { max-width: 1040px; margin: 0 auto; padding: 0 24px; }

/* Loading / Error */
.na-loading { display: flex; justify-content: center; padding: 80px; }
.na-spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid var(--b1); border-top-color: var(--mm-gold);
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.na-error { text-align: center; padding: 80px 24px; }
.na-error h1 { font-size: 24px; color: var(--mm-pearl); margin: 0 0 12px; }
.na-error p { color: var(--mm-silver); }

/* Back link */
.na-back-row { padding: 28px 0 0; }
.na-back {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--mm-slate); text-decoration: none;
  transition: color var(--transition-fast);
}
.na-back:hover { color: var(--mm-pearl); }

/* Article */
.na-article { padding-top: 32px; }

/* Head */
.na-head { margin-bottom: 32px; }
.na-head__top { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.na-head__app {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--mm-slate);
}
.na-head__app-logo { border-radius: var(--r-xs); }

/* Badge */
.na-badge {
  display: inline-block; padding: 4px 10px; border-radius: var(--r-full);
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
}
.na-badge[data-type="product-update"] { background: rgba(74,128,212,0.18); color: #6fa0e8; }
.na-badge[data-type="feature"]        { background: rgba(212,168,67,0.18);  color: var(--mm-goldl); }
.na-badge[data-type="case-study"]     { background: rgba(42,157,143,0.18);  color: var(--mm-sea); }
.na-badge[data-type="culture"]        { background: rgba(148,103,189,0.18); color: #c39de0; }
.na-badge[data-type="announcement"]   { background: rgba(229,101,74,0.18);  color: #f08070; }

.na-title {
  font-size: clamp(24px, 4vw, 40px); font-weight: 700; line-height: 1.15;
  letter-spacing: -0.01em; margin: 0 0 16px; color: var(--mm-pearl);
}
.na-excerpt {
  font-size: 18px; line-height: 1.65; color: var(--mm-silver); margin: 0 0 24px;
  border-left: 3px solid var(--mm-gold); padding-left: 16px;
}
.na-head__meta {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  font-size: 13px; color: var(--mm-slate);
}
.na-vendor {
  display: flex; align-items: center; gap: 6px;
  text-decoration: none; color: var(--mm-sea); font-weight: 600;
}
.na-vendor:hover { text-decoration: underline; }
.na-vendor__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--mm-sea); flex-shrink: 0; }
.na-sep { color: var(--mm-s3); }
.na-views { display: flex; align-items: center; gap: 4px; }

/* Cover */
.na-cover { margin: 0 0 40px; border-radius: var(--r-xl); overflow: hidden; }
.na-cover__img { width: 100%; max-height: 480px; object-fit: cover; display: block; }

/* Layout */
.na-layout { display: grid; grid-template-columns: 1fr 280px; gap: 48px; align-items: start; }

/* Body */
.na-body {
  background: var(--mm-s1); border: 0.5px solid var(--b1);
  border-radius: var(--r-lg); padding: 36px 40px; overflow: hidden;
}
.na-body__content {
  font-size: var(--t-base); line-height: 1.8; color: var(--mm-silver);
  max-width: 100%;
}

/* Prose styles */
.na-body__content :deep(h1),
.na-body__content :deep(h2),
.na-body__content :deep(h3),
.na-body__content :deep(h4) {
  font-family: var(--f-ui);
  color: var(--mm-pearl);
  margin: 1.8em 0 0.6em;
  line-height: 1.3;
}
.na-body__content :deep(h1) { font-size: var(--t-xl); }
.na-body__content :deep(h2) { font-size: var(--t-lg); }
.na-body__content :deep(h3) { font-size: var(--t-md); }
.na-body__content :deep(h4) { font-size: var(--t-base); }
.na-body__content :deep(p) {
  margin: 0 0 1.2em;
  color: var(--mm-silver);
}
.na-body__content :deep(strong) { color: var(--mm-pearl); font-weight: 600; }
.na-body__content :deep(em) { color: var(--mm-silver); font-style: italic; }
.na-body__content :deep(a) {
  color: var(--mm-gold);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.na-body__content :deep(a:hover) { color: var(--mm-gold-l); }
.na-body__content :deep(ul),
.na-body__content :deep(ol) {
  margin: 0 0 1.2em 1.4em;
  color: var(--mm-silver);
}
.na-body__content :deep(li) { margin-bottom: 0.4em; line-height: 1.7; }
.na-body__content :deep(li strong) { color: var(--mm-pearl); }
.na-body__content :deep(blockquote) {
  margin: 1.6em 0;
  padding: 16px 20px;
  border-left: 3px solid var(--mm-gold);
  background: var(--mm-gold-soft);
  border-radius: 0 var(--r-md) var(--r-md) 0;
  color: var(--mm-pearl);
  font-style: italic;
}
.na-body__content :deep(blockquote p) { margin: 0; color: var(--mm-pearl); }
.na-body__content :deep(code) {
  font-family: var(--f-mono);
  font-size: 0.875em;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-xs);
  padding: 2px 6px;
  color: var(--mm-sea);
}
.na-body__content :deep(pre) {
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-md);
  padding: 20px 24px;
  overflow-x: auto;
  margin: 1.2em 0;
}
.na-body__content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  color: var(--mm-silver);
}
.na-body__content :deep(hr) {
  border: none;
  border-top: 0.5px solid var(--b2);
  margin: 2em 0;
}
.na-body__content :deep(img) {
  max-width: 100%;
  border-radius: var(--r-md);
  margin: 1em 0;
}

/* Tags */
.na-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.na-tag {
  padding: 4px 12px; border-radius: var(--r-full);
  background: var(--mm-s2); border: 0.5px solid var(--b1);
  font-size: 12px; color: var(--mm-slate);
}

/* Upvote */
.na-react { display: flex; align-items: center; gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 0.5px solid var(--b1); }
.na-react__btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: var(--r-md);
  background: var(--mm-s1); border: 0.5px solid var(--b1);
  color: var(--mm-silver); font-size: 14px; font-weight: 600;
  cursor: pointer; transition: border-color var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
}
.na-react__btn:hover:not(:disabled) { border-color: var(--mm-gold); color: var(--mm-gold); }
.na-react__btn--voted { border-color: var(--mm-gold); color: var(--mm-gold); background: var(--mm-gold-soft); cursor: default; }
.na-react__btn svg { color: inherit; }
.na-react__count {
  background: var(--mm-s2); padding: 1px 7px; border-radius: var(--r-full); font-size: 12px;
}
.na-react__thanks { font-size: 13px; color: var(--mm-gold); }

/* Sidebar */
.na-sidebar { display: flex; flex-direction: column; gap: 24px; }
.na-sidebar__label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--mm-slate); margin: 0 0 12px; }

.na-vendor-card {
  background: var(--mm-s1); border: 0.5px solid var(--b1);
  border-radius: var(--r-lg); padding: 20px;
}
.na-vendor-card__link { text-decoration: none; display: block; }
.na-vendor-card__name { font-size: 15px; font-weight: 700; color: var(--mm-pearl); margin-bottom: 4px; }
.na-vendor-card__name:hover { color: var(--mm-sea); }
.na-vendor-card__author { font-size: 12px; color: var(--mm-slate); margin: 0; }

.na-related { background: var(--mm-s1); border: 0.5px solid var(--b1); border-radius: var(--r-lg); padding: 20px; }
.na-related__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.na-related__item {
  display: flex; flex-direction: column; gap: 4px;
  text-decoration: none; padding: 10px; border-radius: var(--r-sm);
  background: var(--mm-s2); border: 0.5px solid var(--b1);
  transition: border-color var(--transition-fast);
}
.na-related__item:hover { border-color: var(--b2); }
.na-related__badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  padding: 2px 7px; border-radius: var(--r-full); width: fit-content;
}
.na-related__badge[data-type="product-update"] { background: rgba(74,128,212,0.18); color: #6fa0e8; }
.na-related__badge[data-type="feature"]        { background: rgba(212,168,67,0.18);  color: var(--mm-goldl); }
.na-related__badge[data-type="case-study"]     { background: rgba(42,157,143,0.18);  color: var(--mm-sea); }
.na-related__badge[data-type="culture"]        { background: rgba(148,103,189,0.18); color: #c39de0; }
.na-related__badge[data-type="announcement"]   { background: rgba(229,101,74,0.18);  color: #f08070; }
.na-related__title { font-size: 13px; color: var(--mm-pearl); line-height: 1.4; }

/* Responsive */
@media (max-width: 840px) {
  .na-layout { grid-template-columns: 1fr; }
  .na-sidebar { order: -1; }
}
@media (max-width: 560px) {
  .na-title { font-size: 22px; }
  .na-body { padding: 20px; }
}
</style>
