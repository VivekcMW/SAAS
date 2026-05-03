<template>
  <div class="guide-detail">
    <div v-if="pending" class="loading-state">
      <div class="skeleton-hero" />
      <div class="skeleton-body" />
    </div>
    <div v-else-if="error" class="empty-state">
      <p>Guide not found.</p>
      <NuxtLink to="/guides" class="back-link">Back to Guides</NuxtLink>
    </div>
    <article v-else-if="guide" class="content">
      <div class="breadcrumb">
        <NuxtLink to="/guides">Guides</NuxtLink>
        <span>/</span>
        <span>{{ guide.title }}</span>
      </div>
      <div class="guide-header">
        <div class="header-meta">
          <span :class="['diff-badge', `diff-${guide.difficulty}`]">{{ guide.difficulty }}</span>
          <span class="read-time">{{ guide.read_minutes }} min read</span>
          <span class="category">{{ guide.category }}</span>
        </div>
        <h1>{{ guide.title }}</h1>
        <p class="excerpt">{{ guide.excerpt }}</p>
        <div class="author-row">
          <span>By {{ guide.author }}</span>
          <span>·</span>
          <time>{{ formatDate(guide.published_at) }}</time>
        </div>
      </div>
      <div class="guide-body">
        <pre class="markdown-body">{{ guide.body_markdown }}</pre>
      </div>
      <div v-if="guide.tags?.length" class="guide-tags">
        <span v-for="tag in guide.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="back-row">
        <NuxtLink to="/guides" class="back-link">← Back to all guides</NuxtLink>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
interface GuideDetail {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  difficulty: string
  read_minutes: number
  author: string
  tags: string[]
  body_markdown: string
  related_app_ids: string[]
  published_at: string
  updated_at: string
}

const route = useRoute()
const slug = route.params.slug as string

const { data: guide, pending, error } = await useFetch<GuideDetail>(`/api/guides/${slug}`)

function formatDate(iso: string) {
  return useFmt().fmtDate(iso, { month: 'long', day: 'numeric', year: 'numeric' })
}

useHead({
  title: computed(() => guide.value ? `${guide.value.title} — Moonmart Guides` : 'Guide — Moonmart'),
  meta: computed(() => [
    { name: 'description', content: guide.value?.excerpt ?? '' }
  ])
})
</script>

<style scoped>
.guide-detail { max-width: 760px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.loading-state { display: flex; flex-direction: column; gap: 1.5rem; }
.skeleton-hero { height: 180px; border-radius: var(--r-sm); background: var(--mm-s2); animation: pulse 1.5s ease-in-out infinite; }
.skeleton-body { height: 400px; border-radius: var(--r-sm); background: var(--mm-s2); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.empty-state { text-align: center; padding: 3rem; color: var(--mm-muted); }
.breadcrumb { display: flex; gap: 0.5rem; font-size: 0.85rem; color: var(--mm-muted); margin-bottom: 1.5rem; }
.breadcrumb a { color: var(--mm-gold); text-decoration: none; }
.guide-header { margin-bottom: 2rem; }
.header-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.diff-badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.diff-badge.diff-beginner { background: #dcfce7; color: #15803d; }
.diff-badge.diff-intermediate { background: #dbeafe; color: #1e40af; }
.diff-badge.diff-advanced { background: #fde8e8; color: #9b1c1c; }
.read-time, .category { font-size: 0.8rem; color: var(--mm-muted); }
h1 { font-size: 2rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.75rem; }
.excerpt { font-size: 1.05rem; color: var(--mm-muted); line-height: 1.6; margin-bottom: 0.75rem; }
.author-row { font-size: 0.85rem; color: var(--mm-muted); display: flex; gap: 0.4rem; }
.guide-body { margin-bottom: 2rem; }
.markdown-body { font-size: 0.95rem; line-height: 1.8; white-space: pre-wrap; word-break: break-word; padding: 1.5rem; background: var(--mm-s2); border-radius: var(--r-sm); }
.guide-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 2rem; }
.tag { padding: 0.2rem 0.55rem; border-radius: 999px; border: 1px solid var(--b1); font-size: 0.75rem; }
.back-row { margin-top: 1rem; }
.back-link { color: var(--mm-gold); text-decoration: none; font-size: 0.9rem; }
</style>
