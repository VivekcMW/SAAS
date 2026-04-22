<template>
  <main class="mk-page bp">
    <!-- Breadcrumb -->
    <nav class="bp-crumbs" aria-label="Breadcrumb">
      <div class="bp-crumbs__inner">
        <NuxtLink to="/">Home</NuxtLink>
        <span class="bp-crumbs__sep" aria-hidden="true">/</span>
        <NuxtLink to="/blog">Blog</NuxtLink>
        <span class="bp-crumbs__sep" aria-hidden="true">/</span>
        <span class="bp-crumbs__current">{{ post ? post.category : 'Article' }}</span>
      </div>
    </nav>

    <!-- Not found -->
    <section v-if="!post" class="mk-section">
      <div class="mk-section__inner bp-missing">
        <h1 class="bp-missing__title">Article not found</h1>
        <p class="bp-missing__lede">
          We couldn't find that article. It may have been renamed or retired.
        </p>
        <NuxtLink to="/blog" class="mk-btn mk-btn--primary">Back to the blog</NuxtLink>
      </div>
    </section>

    <template v-else>
      <!-- Hero -->
      <header class="bp-hero">
        <div class="bp-hero__inner">
          <span class="mk-eyebrow bp-hero__cat">{{ post.category }}</span>
          <h1 class="bp-hero__title">{{ post.title }}</h1>
          <p class="bp-hero__lede">{{ post.excerpt }}</p>

          <div class="bp-meta">
            <div class="bp-meta__author">
              <div class="bp-meta__avatar" aria-hidden="true">{{ authorInitials }}</div>
              <div class="bp-meta__author-text">
                <span class="bp-meta__author-name">{{ post.author }}</span>
                <span v-if="post.authorTitle" class="bp-meta__author-title">{{ post.authorTitle }}</span>
              </div>
            </div>
            <div class="bp-meta__divider" aria-hidden="true"></div>
            <div class="bp-meta__facts">
              <span>{{ formattedDate }}</span>
              <span class="bp-meta__dot" aria-hidden="true">·</span>
              <span>{{ post.readMinutes }} min read</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Decorative cover -->
      <section class="bp-cover-wrap">
        <div class="bp-cover" aria-hidden="true">
          <div class="bp-cover__pattern"></div>
          <div class="bp-cover__badge">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 5h16v3H4zM4 10.5h16v3H4zM4 16h10v3H4z" fill="currentColor"/></svg>
            <span>{{ post.category }}</span>
          </div>
          <div class="bp-cover__stats">
            <div><strong>{{ post.readMinutes }}</strong><span>min read</span></div>
            <div><strong>{{ post.toc.length }}</strong><span>sections</span></div>
            <div><strong>{{ post.tags.length }}</strong><span>topics</span></div>
          </div>
        </div>
      </section>

      <!-- Article + Sidebar -->
      <section class="mk-section bp-article-section">
        <div class="mk-section__inner bp-layout">
          <article class="bp-body">
            <div v-html="post.content" />

            <!-- Tags -->
            <div class="bp-tags" aria-label="Tags">
              <NuxtLink
                v-for="tag in post.tags"
                :key="tag"
                :to="`/blog?tag=${encodeURIComponent(tag)}`"
                class="bp-tag"
              >
                {{ tag }}
              </NuxtLink>
            </div>

            <!-- Share -->
            <div class="bp-share">
              <span class="bp-share__label">Share this article</span>
              <div class="bp-share__buttons">
                <a :href="twitterUrl" target="_blank" rel="noopener" class="bp-share__btn" aria-label="Share on X/Twitter">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M17.53 3H20.5l-6.48 7.41L22 21h-6.17l-4.82-6.3L5.5 21H2.5l6.94-7.94L2 3h6.33l4.37 5.78z" fill="currentColor"/></svg>
                </a>
                <a :href="linkedinUrl" target="_blank" rel="noopener" class="bp-share__btn" aria-label="Share on LinkedIn">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.35V9h3.42v1.56h.05c.48-.9 1.65-1.85 3.39-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45z" fill="currentColor"/></svg>
                </a>
                <a :href="facebookUrl" target="_blank" rel="noopener" class="bp-share__btn" aria-label="Share on Facebook">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M13.5 21v-7.5H16l.45-3h-3V8.6c0-.86.26-1.45 1.5-1.45H16.6V4.44A23 23 0 0 0 14.3 4.3c-2.3 0-3.8 1.38-3.8 3.9v2.3H8v3h2.5V21h3z" fill="currentColor"/></svg>
                </a>
                <button type="button" class="bp-share__btn" :aria-label="copied ? 'Link copied' : 'Copy link'" @click="copyLink">
                  <svg v-if="!copied" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5 M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </div>
          </article>

          <aside class="bp-side">
            <!-- Sticky TOC -->
            <div v-if="post.toc.length" class="bp-side__card bp-toc" aria-label="Table of contents">
              <h3 class="bp-side__title">On this page</h3>
              <ul>
                <li v-for="item in post.toc" :key="item.id" :class="{ 'is-active': activeId === item.id }">
                  <a :href="`#${item.id}`" @click.prevent="scrollTo(item.id)">{{ item.title }}</a>
                </li>
              </ul>
            </div>

            <!-- Newsletter -->
            <div class="bp-side__card bp-newsletter">
              <h3 class="bp-side__title">Weekly software memo</h3>
              <p>One short email. Real buyer insights, zero vendor fluff.</p>
              <form @submit.prevent="subscribe">
                <input v-model="newsletterEmail" type="email" required placeholder="you@company.com" aria-label="Email address" />
                <button type="submit" class="mk-btn mk-btn--primary" :disabled="subscribed">
                  {{ subscribed ? 'Subscribed' : 'Subscribe' }}
                </button>
              </form>
              <small>We'll never share your email.</small>
            </div>
          </aside>
        </div>
      </section>

      <!-- Prev / Next -->
      <section v-if="prev || next" class="mk-section mk-section--soft bp-nav-section">
        <div class="mk-section__inner bp-nav">
          <NuxtLink v-if="prev" :to="`/blog/${prev.slug}`" class="bp-nav__card bp-nav__card--prev">
            <span class="bp-nav__dir">&larr; Previous</span>
            <span class="bp-nav__title">{{ prev.title }}</span>
          </NuxtLink>
          <span v-else></span>
          <NuxtLink v-if="next" :to="`/blog/${next.slug}`" class="bp-nav__card bp-nav__card--next">
            <span class="bp-nav__dir">Next &rarr;</span>
            <span class="bp-nav__title">{{ next.title }}</span>
          </NuxtLink>
          <span v-else></span>
        </div>
      </section>

      <!-- Related -->
      <section v-if="related.length" class="mk-section">
        <div class="mk-section__inner">
          <h2 class="mk-section__title">More reading</h2>
          <p class="mk-section__lede">Hand-picked articles from the same category.</p>
          <div class="bp-related">
            <NuxtLink
              v-for="r in related"
              :key="r.slug"
              :to="`/blog/${r.slug}`"
              class="bp-related__card"
            >
              <div class="bp-related__thumb">
                <img :src="r.image" :alt="r.title" loading="lazy" />
              </div>
              <div class="bp-related__text">
                <span class="bp-related__cat">{{ r.category }}</span>
                <h3 class="bp-related__title">{{ r.title }}</h3>
                <span class="bp-related__meta">{{ r.readMinutes }} min read</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPostBySlug, getRelatedPosts, getAdjacentPosts } from '~/utils/blogPosts'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const post = computed(() => getPostBySlug(slug.value))
const related = computed(() => getRelatedPosts(slug.value, 3))
const { prev, next } = getAdjacentPosts(slug.value)

const { applySEO } = useSEO()
if (post.value) {
  applySEO({
    title: `${post.value.title} | SaaSWorld`,
    description: post.value.excerpt,
    canonical: `/blog/${post.value.slug}`,
    ogType: 'article'
  })
} else {
  applySEO({
    title: 'Article not found | SaaSWorld',
    description: 'The requested article is not available.',
    canonical: `/blog/${slug.value}`,
    ogType: 'article'
  })
}

const formattedDate = computed(() => {
  if (!post.value) return ''
  return new Date(post.value.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const authorInitials = computed(() => {
  if (!post.value) return ''
  return post.value.author
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

// Share URLs
const shareUrl = computed(() => {
  if (globalThis.window === undefined) return `https://saasworld.com/blog/${slug.value}`
  return globalThis.window.location.href
})
const shareText = computed(() => (post.value ? post.value.title : 'SaaSWorld'))
const twitterUrl = computed(
  () => `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareText.value)}`
)
const linkedinUrl = computed(
  () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`
)
const facebookUrl = computed(
  () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
)

const copied = ref(false)
async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    copied.value = false
  }
}

// Newsletter (mock)
const newsletterEmail = ref('')
const subscribed = ref(false)
function subscribe() {
  // NOTE: replace with real POST /api/subscribe when backend ready
  subscribed.value = true
  newsletterEmail.value = ''
}

// Scroll-spy active TOC item
const activeId = ref<string | null>(null)
let observer: IntersectionObserver | null = null

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + globalThis.window.scrollY - 90
  globalThis.window.scrollTo({ top, behavior: 'smooth' })
  activeId.value = id
}

onMounted(() => {
  if (!post.value) return
  const ids = post.value.toc.map((t) => t.id)
  const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
  if (!elements.length) return
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible.length) activeId.value = visible[0].target.id
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  )
  elements.forEach((el) => observer!.observe(el))
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.bp { background: #fff; }

/* Breadcrumb */
.bp-crumbs {
  background: #fbfaf8;
  border-bottom: 1px solid #f0efec;
  padding: 0.75rem 1.5rem;
  font-size: 0.82rem;
  color: #71717a;
}
.bp-crumbs__inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.bp-crumbs a { color: #52525b; text-decoration: none; }
.bp-crumbs a:hover { color: var(--sw-primary, #ff8838); }
.bp-crumbs__sep { color: #cbd0d6; }
.bp-crumbs__current { color: #1e1e1e; font-weight: 500; }

/* Hero */
.bp-hero {
  background: var(--sw-primary-soft, #fff1e6);
  padding: 3.5rem 1.5rem 2.5rem;
  text-align: center;
}
.bp-hero__inner { max-width: 820px; margin: 0 auto; }
.bp-hero__cat { display: inline-block; margin-bottom: 1rem; }
.bp-hero__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  line-height: 1.2;
  font-weight: 800;
  color: #1e1e1e;
  margin: 0 0 1rem;
  letter-spacing: -0.01em;
}
.bp-hero__lede {
  color: #52525b;
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0 auto;
  max-width: 680px;
}

/* Meta */
.bp-meta {
  display: inline-flex;
  align-items: center;
  gap: 1.25rem;
  margin-top: 1.75rem;
  padding: 0.75rem 1.25rem;
  background: #fff;
  border: 1px solid #f0d9bf;
  border-radius: 999px;
  font-size: 0.88rem;
  flex-wrap: wrap;
  justify-content: center;
}
.bp-meta__author { display: inline-flex; align-items: center; gap: 0.6rem; }
.bp-meta__avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--sw-primary, #ff8838);
  color: #fff;
  font-weight: 700;
  font-size: 0.82rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.02em;
}
.bp-meta__author-text { display: flex; flex-direction: column; text-align: left; }
.bp-meta__author-name { color: #1e1e1e; font-weight: 600; font-size: 0.88rem; }
.bp-meta__author-title { color: #71717a; font-size: 0.74rem; }
.bp-meta__divider { width: 1px; height: 20px; background: #f0d9bf; }
.bp-meta__facts { color: #52525b; display: inline-flex; align-items: center; gap: 0.5rem; }
.bp-meta__dot { color: #cbd0d6; }

/* Cover */
.bp-cover-wrap { padding: 0 1.5rem; }
.bp-cover {
  position: relative;
  max-width: 960px;
  margin: 2.5rem auto 0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 60px -30px rgba(15, 23, 42, 0.25);
  border: 1px solid #f0d9bf;
  background: var(--sw-primary-soft, #fff1e6);
  padding: 2.5rem 2rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
}
.bp-cover__pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(255, 136, 56, 0.18) 1px, transparent 0);
  background-size: 22px 22px;
  opacity: 0.65;
  pointer-events: none;
}
.bp-cover__badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: #fff;
  border: 1px solid #f0d9bf;
  border-radius: 999px;
  color: var(--sw-primary, #ff8838);
  font-weight: 600;
  font-size: 0.84rem;
  width: fit-content;
}
.bp-cover__stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 520px;
}
.bp-cover__stats > div {
  background: #fff;
  border: 1px solid #f0d9bf;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.bp-cover__stats strong {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.4rem;
  color: #1e1e1e;
  line-height: 1;
}
.bp-cover__stats span {
  color: #71717a;
  font-size: 0.78rem;
}
@media (max-width: 600px) {
  .bp-cover { padding: 2rem 1.25rem; }
  .bp-cover__stats { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
  .bp-cover__stats > div { padding: 0.6rem 0.7rem; }
  .bp-cover__stats strong { font-size: 1.15rem; }
}

/* Layout */
.bp-article-section { padding-top: 3rem; }
.bp-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 3rem;
  align-items: start;
}
@media (max-width: 960px) {
  .bp-layout { grid-template-columns: 1fr; gap: 2.5rem; }
}

/* Body */
.bp-body { max-width: 760px; font-size: 1.02rem; line-height: 1.75; color: #3f3f46; }
.bp-body :deep(h2) {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.55rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 2.5rem 0 1rem;
  scroll-margin-top: 90px;
  line-height: 1.3;
}
.bp-body :deep(h3) {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 2rem 0 0.75rem;
  scroll-margin-top: 90px;
}
.bp-body :deep(p) { margin: 0 0 1.2rem; }
.bp-body :deep(ul),
.bp-body :deep(ol) { margin: 0 0 1.2rem; padding-left: 1.25rem; }
.bp-body :deep(li) { margin-bottom: 0.4rem; }
.bp-body :deep(strong) { color: #1e1e1e; font-weight: 600; }
.bp-body :deep(a) { color: var(--sw-primary, #ff8838); text-decoration: underline; text-underline-offset: 3px; }
.bp-body :deep(blockquote) {
  border-left: 3px solid var(--sw-primary, #ff8838);
  margin: 1.5rem 0;
  padding: 0.5rem 1.25rem;
  color: #1e1e1e;
  font-style: italic;
  background: var(--sw-primary-soft, #fff1e6);
  border-radius: 0 10px 10px 0;
}
.bp-body :deep(code) {
  background: #f4f3f0;
  padding: 0.15rem 0.4rem;
  border-radius: 5px;
  font-size: 0.9em;
  color: #1e1e1e;
}
.bp-body :deep(pre) {
  background: #1e1e1e;
  color: #fbfaf8;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  overflow-x: auto;
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 1.5rem 0;
}
.bp-body :deep(img) { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; }

/* Tags */
.bp-tags { margin-top: 2.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.bp-tag {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  background: #fbfaf8;
  border: 1px solid #f0efec;
  border-radius: 999px;
  color: #52525b;
  font-size: 0.82rem;
  text-decoration: none;
  transition: all 0.15s ease;
}
.bp-tag:hover {
  background: var(--sw-primary-soft, #fff1e6);
  border-color: #f0d9bf;
  color: var(--sw-primary, #ff8838);
}

/* Share */
.bp-share {
  margin-top: 2.5rem;
  padding: 1.25rem 1.5rem;
  background: #fbfaf8;
  border: 1px solid #f0efec;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.bp-share__label { font-weight: 600; color: #1e1e1e; font-size: 0.94rem; }
.bp-share__buttons { display: flex; gap: 0.5rem; }
.bp-share__btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e4e0dc;
  color: #52525b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}
.bp-share__btn:hover {
  background: var(--sw-primary, #ff8838);
  color: #fff;
  border-color: var(--sw-primary, #ff8838);
}

/* Sidebar */
.bp-side { display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 90px; }
@media (max-width: 960px) { .bp-side { position: static; } }
.bp-side__card { background: #fff; border: 1px solid #f0efec; border-radius: 14px; padding: 1.25rem 1.4rem; }
.bp-side__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #71717a;
  margin: 0 0 0.9rem;
}

/* TOC */
.bp-toc ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.15rem; }
.bp-toc li a {
  display: block;
  padding: 0.4rem 0.6rem;
  color: #52525b;
  font-size: 0.88rem;
  line-height: 1.5;
  border-radius: 6px;
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: all 0.12s ease;
}
.bp-toc li a:hover { background: #fbfaf8; color: #1e1e1e; }
.bp-toc li.is-active a {
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
  border-left-color: var(--sw-primary, #ff8838);
  font-weight: 600;
}

/* Newsletter */
.bp-newsletter p { color: #52525b; font-size: 0.88rem; line-height: 1.5; margin: 0 0 0.9rem; }
.bp-newsletter form { display: flex; flex-direction: column; gap: 0.5rem; }
.bp-newsletter input {
  font: inherit;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e4e0dc;
  border-radius: 8px;
  background: #fff;
  color: #1e1e1e;
  width: 100%;
}
.bp-newsletter input:focus {
  outline: none;
  border-color: var(--sw-primary, #ff8838);
  box-shadow: 0 0 0 3px rgba(255, 136, 56, 0.15);
}
.bp-newsletter small { color: #a1a1aa; font-size: 0.72rem; margin-top: 0.25rem; }

/* Prev / Next */
.bp-nav-section { padding-top: 3rem; padding-bottom: 3rem; }
.bp-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 700px) { .bp-nav { grid-template-columns: 1fr; } }
.bp-nav__card {
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-decoration: none;
  transition: all 0.15s ease;
}
.bp-nav__card:hover {
  border-color: var(--sw-primary, #ff8838);
  box-shadow: 0 10px 30px -20px rgba(255, 136, 56, 0.45);
}
.bp-nav__card--next { text-align: right; }
.bp-nav__dir { font-size: 0.76rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--sw-primary, #ff8838); }
.bp-nav__title { color: #1e1e1e; font-weight: 600; font-size: 0.96rem; line-height: 1.4; }

/* Related */
.bp-related {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-top: 2rem;
}
.bp-related__card {
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition: all 0.15s ease;
}
.bp-related__card:hover {
  transform: translateY(-2px);
  border-color: var(--sw-primary, #ff8838);
  box-shadow: 0 14px 36px -22px rgba(255, 136, 56, 0.45);
}
.bp-related__thumb { aspect-ratio: 16 / 9; background: #fbfaf8; overflow: hidden; }
.bp-related__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bp-related__text { padding: 1.1rem 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
.bp-related__cat {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sw-primary, #ff8838);
}
.bp-related__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0;
  line-height: 1.4;
}
.bp-related__meta { color: #71717a; font-size: 0.8rem; margin-top: auto; }

/* Missing state */
.bp-missing { text-align: center; padding: 2.5rem 1rem; }
.bp-missing__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0 0 0.75rem;
}
.bp-missing__lede { color: #52525b; margin: 0 auto 1.5rem; max-width: 460px; }
</style>
