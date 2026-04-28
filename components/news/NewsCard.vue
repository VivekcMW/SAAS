<template>
  <NuxtLink :to="`/news/${post.slug}`" class="news-card" :class="{ 'news-card--featured': post.featured }">
    <!-- Cover -->
    <div class="news-card__cover">
      <img v-if="post.coverImage" :src="post.coverImage" :alt="post.title" loading="lazy" class="news-card__img" />
      <div v-else class="news-card__cover-placeholder">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/></svg>
      </div>
      <span class="news-card__badge" :data-type="post.postType">{{ typeLabel }}</span>
    </div>

    <!-- Body -->
    <div class="news-card__body">
      <p class="news-card__vendor">
        <span class="news-card__dot" aria-hidden="true"></span>
        {{ post.vendor.name }}
      </p>
      <h3 class="news-card__title">{{ post.title }}</h3>
      <p class="news-card__excerpt">{{ post.excerpt }}</p>

      <footer class="news-card__footer">
        <time class="news-card__date" :datetime="post.publishedAt">{{ formattedDate }}</time>
        <span class="news-card__meta">
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M12 20.9l-7.7-8.1a5.5 5.5 0 0 1 7.7-7.8 5.5 5.5 0 0 1 7.7 7.8z" fill="currentColor"/></svg>
          {{ post.upvoteCount }}
        </span>
      </footer>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  post: {
    id: string
    postType: string
    title: string
    slug: string
    excerpt: string
    coverImage: string | null
    featured: boolean
    upvoteCount: number
    publishedAt: string | null
    vendor: { id: string; name: string; slug: string }
  }
}>()

const TYPE_LABELS: Record<string, string> = {
  'product-update': 'Product Update',
  'feature': 'Feature',
  'case-study': 'Case Study',
  'culture': 'Culture',
  'announcement': 'Announcement'
}

const typeLabel = computed(() => TYPE_LABELS[props.post.postType] || props.post.postType)

const formattedDate = computed(() => {
  if (!props.post.publishedAt) return ''
  return new Date(props.post.publishedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
})
</script>

<style scoped>
.news-card {
  background: var(--mm-s1);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  display: flex;
  flex-direction: column;
  outline: none;
}
.news-card:hover,
.news-card:focus-visible {
  border-color: var(--b2);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.news-card--featured {
  border-color: var(--mm-gold);
}

/* Cover */
.news-card__cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--mm-s2);
}
.news-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.news-card__cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mm-slate);
}

/* Badge */
.news-card__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 9px;
  border-radius: var(--r-full);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.news-card__badge[data-type="product-update"] { background: rgba(74,128,212,0.18); color: #6fa0e8; }
.news-card__badge[data-type="feature"]        { background: rgba(212,168,67,0.18);  color: var(--mm-goldl); }
.news-card__badge[data-type="case-study"]     { background: rgba(42,157,143,0.18);  color: var(--mm-sea); }
.news-card__badge[data-type="culture"]        { background: rgba(148,103,189,0.18); color: #c39de0; }
.news-card__badge[data-type="announcement"]   { background: rgba(229,101,74,0.18);  color: #f08070; }

/* Body */
.news-card__body {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.news-card__vendor {
  font-size: 12px;
  color: var(--mm-slate);
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}
.news-card__dot {
  width: 5px;
  height: 5px;
  background: var(--mm-sea);
  border-radius: 50%;
  flex-shrink: 0;
}
.news-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--mm-pearl);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.news-card__excerpt {
  font-size: 13px;
  color: var(--mm-silver);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.news-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}
.news-card__date {
  font-size: 12px;
  color: var(--mm-slate);
}
.news-card__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--mm-slate);
}
.news-card__meta svg { color: var(--mm-gold); }
</style>
