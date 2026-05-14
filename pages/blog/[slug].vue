<template>
  <div class="bp">
    <!-- Breadcrumb -->
    <nav class="bp-crumbs" aria-label="Breadcrumb">
      <div class="bp-wrap bp-crumbs__inner">
        <NuxtLink to="/" class="bp-crumbs__link">Home</NuxtLink>
        <svg class="bp-crumbs__sep" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        <NuxtLink to="/blog" class="bp-crumbs__link">Blog</NuxtLink>
        <svg class="bp-crumbs__sep" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        <span class="bp-crumbs__current">{{ post ? post.category : 'Article' }}</span>
      </div>
    </nav>

    <!-- Not found -->
    <section v-if="!post" class="bp-missing-wrap">
      <div class="bp-wrap bp-missing">
        <h1 class="bp-missing__title">Article not found</h1>
        <p class="bp-missing__lede">We couldn't find that article. It may have been renamed or retired.</p>
        <NuxtLink to="/blog" class="bp-btn">Back to the blog</NuxtLink>
      </div>
    </section>

    <template v-else>
      <!-- Hero -->
      <header class="bp-hero">
        <div class="bp-wrap bp-hero__inner">
          <div class="bp-hero__meta-top">
            <span class="bp-badge">{{ post.category }}</span>
          </div>
          <h1 class="bp-hero__title">{{ post.title }}</h1>
          <p class="bp-hero__lede">{{ post.excerpt }}</p>
          <div class="bp-hero__author-row">
            <div class="bp-avatar" aria-hidden="true">{{ authorInitials }}</div>
            <div class="bp-hero__author-info">
              <span class="bp-hero__author-name">{{ post.author }}</span>
              <span v-if="post.authorTitle" class="bp-hero__author-role">{{ post.authorTitle }}</span>
            </div>
            <div class="bp-hero__divider" aria-hidden="true" />
            <div class="bp-hero__facts">
              <time :datetime="post.date">{{ formattedDate }}</time>
              <span>·</span>
              <span>{{ post.readMinutes }} min read</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Cover card -->
      <div class="bp-cover-wrap">
        <div class="bp-wrap">
          <div class="bp-cover" aria-hidden="true">
            <div class="bp-cover__noise" />
            <div class="bp-cover__grid" />
            <div class="bp-cover__badge">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5h16M4 10h16M4 15h10" stroke-linecap="round"/></svg>
              <span>{{ post.category }}</span>
            </div>
            <div class="bp-cover__stats">
              <div class="bp-cover__stat">
                <strong>{{ post.readMinutes }}</strong>
                <span>min read</span>
              </div>
              <div class="bp-cover__stat">
                <strong>{{ post.toc.length }}</strong>
                <span>sections</span>
              </div>
              <div class="bp-cover__stat">
                <strong>{{ post.tags.length }}</strong>
                <span>topics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Article + Sidebar -->
      <section class="bp-article-section">
        <div class="bp-wrap bp-layout">

          <!-- Article body -->
          <article class="bp-body">
            <div class="bp-content" v-html="post.content" />

            <!-- Tags -->
            <div class="bp-tags" aria-label="Tags">
              <NuxtLink v-for="tag in post.tags" :key="tag" :to="`/blog?tag=${encodeURIComponent(tag)}`" class="bp-tag">
                {{ tag }}
              </NuxtLink>
            </div>

            <!-- Share -->
            <div class="bp-share">
              <span class="bp-share__label">Share this article</span>
              <div class="bp-share__buttons">
                <a :href="twitterUrl" target="_blank" rel="noopener" class="bp-share__btn" aria-label="Share on X/Twitter">
                  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M17.53 3H20.5l-6.48 7.41L22 21h-6.17l-4.82-6.3L5.5 21H2.5l6.94-7.94L2 3h6.33l4.37 5.78z" fill="currentColor"/></svg>
                </a>
                <a :href="linkedinUrl" target="_blank" rel="noopener" class="bp-share__btn" aria-label="Share on LinkedIn">
                  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.35V9h3.42v1.56h.05c.48-.9 1.65-1.85 3.39-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45z" fill="currentColor"/></svg>
                </a>
                <a :href="facebookUrl" target="_blank" rel="noopener" class="bp-share__btn" aria-label="Share on Facebook">
                  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M13.5 21v-7.5H16l.45-3h-3V8.6c0-.86.26-1.45 1.5-1.45H16.6V4.44A23 23 0 0 0 14.3 4.3c-2.3 0-3.8 1.38-3.8 3.9v2.3H8v3h2.5V21h3z" fill="currentColor"/></svg>
                </a>
                <button type="button" class="bp-share__btn" :aria-label="copied ? 'Link copied' : 'Copy link'" @click="copyLink">
                  <svg v-if="!copied" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </button>
              </div>
            </div>
          </article>

          <!-- Sidebar -->
          <aside class="bp-side">
            <!-- TOC -->
            <div v-if="post.toc.length" class="bp-side-card" aria-label="Table of contents">
              <h3 class="bp-side-title">On this page</h3>
              <ul class="bp-toc-list">
                <li v-for="item in post.toc" :key="item.id" class="bp-toc-item" :class="{ 'bp-toc-item--active': activeId === item.id }">
                  <a :href="`#${item.id}`" class="bp-toc-link" @click.prevent="scrollTo(item.id)">{{ item.title }}</a>
                </li>
              </ul>
            </div>

            <!-- Newsletter -->
            <div class="bp-side-card bp-newsletter">
              <h3 class="bp-side-title">Weekly software memo</h3>
              <p class="bp-newsletter__desc">One short email. Real buyer insights, zero vendor fluff.</p>
              <form class="bp-newsletter__form" @submit.prevent="subscribe">
                <input v-model="newsletterEmail" type="email" required placeholder="you@company.com" aria-label="Email address" class="bp-newsletter__input">
                <button type="submit" class="bp-btn bp-btn--full" :disabled="subscribed">
                  {{ subscribed ? 'Subscribed ✓' : 'Subscribe' }}
                </button>
              </form>
              <small class="bp-newsletter__fine">We'll never share your email.</small>
            </div>
          </aside>
        </div>
      </section>

      <!-- Prev / Next -->
      <section v-if="prev || next" class="bp-nav-section">
        <div class="bp-wrap bp-nav-grid">
          <NuxtLink v-if="prev" :to="`/blog/${prev.slug}`" class="bp-nav-card bp-nav-card--prev">
            <span class="bp-nav-dir">← Previous</span>
            <span class="bp-nav-title">{{ prev.title }}</span>
          </NuxtLink>
          <span v-else />
          <NuxtLink v-if="next" :to="`/blog/${next.slug}`" class="bp-nav-card bp-nav-card--next">
            <span class="bp-nav-dir">Next →</span>
            <span class="bp-nav-title">{{ next.title }}</span>
          </NuxtLink>
          <span v-else />
        </div>
      </section>

      <!-- Related -->
      <section v-if="related.length" class="bp-related-section">
        <div class="bp-wrap">
          <span class="bp-eyebrow">More reading</span>
          <h2 class="bp-related-title">Hand-picked from the same category</h2>
          <div class="bp-related-grid">
            <NuxtLink v-for="r in related" :key="r.slug" :to="`/blog/${r.slug}`" class="bp-related-card">
              <div class="bp-related-thumb">
                <img v-if="r.image" :src="r.image" :alt="r.title" loading="lazy">
                <div v-else class="bp-related-thumb__placeholder" aria-hidden="true" />
              </div>
              <div class="bp-related-body">
                <span class="bp-badge">{{ r.category }}</span>
                <h3 class="bp-related-card-title">{{ r.title }}</h3>
                <span class="bp-related-meta">{{ r.readMinutes }} min read</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPostBySlug, getRelatedPosts, getAdjacentPosts, type BlogPost } from '~/utils/blogPosts'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

// Fetch from API first (covers DB-seeded and auto-generated posts)
const { data: apiPost } = await useAsyncData(`blog-${slug.value}`, () =>
  $fetch<BlogPost>(`/api/blog/${slug.value}`).catch(() => null)
)

// Fall back to static utility for the 6 hard-coded posts
const post = computed<BlogPost | null>(() => (apiPost.value as BlogPost | null) || getPostBySlug(slug.value) || null)
const related = computed(() => getRelatedPosts(slug.value, 3))
const { prev, next } = getAdjacentPosts(slug.value)

const { applySEO } = useSEO()
if (post.value) {
  applySEO({
    title: `${post.value.title} | Moonmart`,
    description: post.value.excerpt,
    canonical: `/blog/${post.value.slug}`,
    ogType: 'article'
  })
} else {
  applySEO({
    title: 'Article not found | Moonmart',
    description: 'The requested article is not available.',
    canonical: `/blog/${slug.value}`,
    ogType: 'article'
  })
}

// NewsArticle JSON-LD schema
if (post.value) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: post.value.title,
          description: post.value.excerpt,
          url: `https://moonmart.ai/blog/${post.value.slug}`,
          datePublished: post.value.published_at || post.value.date,
          dateModified: (post.value as any).updated_at || post.value.published_at || post.value.date,
          author: { '@type': 'Person', name: post.value.author },
          publisher: {
            '@type': 'Organization',
            name: 'Moonmart',
            logo: { '@type': 'ImageObject', url: 'https://moonmart.ai/assets/images/og-image.jpg' }
          },
          ...(post.value.image ? { image: { '@type': 'ImageObject', url: post.value.image } } : {}),
          articleSection: post.value.category,
          inLanguage: 'en',
          isAccessibleForFree: true
        })
      }
    ]
  })
}

const { fmtDate } = useFmt()

const formattedDate = computed(() => {
  if (!post.value) return ''
  const d = (post.value as any).published_at || post.value.date
  return fmtDate(d, { year: 'numeric', month: 'long', day: 'numeric' })
})

const authorInitials = computed(() => {
  if (!post.value) return ''
  return post.value.author.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
})

// Share URLs
const shareUrl = computed(() => {
  if (typeof globalThis.window === 'undefined') return `https://moonmart.ai/blog/${slug.value}`
  return globalThis.window.location.href
})
const shareText = computed(() => (post.value ? post.value.title : 'Moonmart'))
const twitterUrl = computed(() => `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareText.value)}`)
const linkedinUrl = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`)
const facebookUrl = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`)

const copied = ref(false)
async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch { copied.value = false }
}

// Newsletter (mock)
const newsletterEmail = ref('')
const subscribed = ref(false)
function subscribe() {
  subscribed.value = true
  newsletterEmail.value = ''
}

// Scroll-spy TOC
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
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible.length) activeId.value = visible[0].target.id
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  )
  elements.forEach((el) => observer!.observe(el))
})

onBeforeUnmount(() => { if (observer) observer.disconnect() })
</script>

<style scoped>
/* ── Shell ─────────────────────────────────────────────────────── */
.bp { background: var(--mm-bg); color: var(--mm-pearl); min-height: 100vh; }
.bp-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.bp-eyebrow { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mm-gold); margin-bottom: 14px; }

/* ── Breadcrumb ─────────────────────────────────────────────────── */
.bp-crumbs { padding: 16px 0; border-bottom: 0.5px solid var(--b1); }
.bp-crumbs__inner { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.bp-crumbs__link { font-size: 13px; color: var(--mm-slate); text-decoration: none; transition: color 0.15s; }
.bp-crumbs__link:hover { color: var(--mm-gold); }
.bp-crumbs__sep { color: var(--mm-slate); opacity: 0.5; flex-shrink: 0; }
.bp-crumbs__current { font-size: 13px; color: var(--mm-silver); }

/* ── Hero ──────────────────────────────────────────────────────── */
.bp-hero { padding: 56px 0 40px; border-bottom: 0.5px solid var(--b1); }
.bp-hero__inner { max-width: 800px; }
.bp-hero__meta-top { margin-bottom: 20px; }
.bp-hero__title { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 700; line-height: 1.2; color: var(--mm-pearl); margin: 0 0 16px; letter-spacing: -0.01em; }
.bp-hero__lede { font-size: 16px; line-height: 1.7; color: var(--mm-silver); margin: 0 0 28px; max-width: 680px; }
.bp-hero__author-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.bp-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(212,168,67,0.18); color: var(--mm-goldl, #EEC563); font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; letter-spacing: 0.02em; border: 0.5px solid var(--mm-gold); flex-shrink: 0; }
.bp-hero__author-info { display: flex; flex-direction: column; gap: 2px; }
.bp-hero__author-name { font-size: 14px; font-weight: 600; color: var(--mm-pearl); }
.bp-hero__author-role { font-size: 12px; color: var(--mm-slate); }
.bp-hero__divider { width: 1px; height: 20px; background: var(--b2); margin: 0 4px; }
.bp-hero__facts { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--mm-slate); }

/* ── Badge ─────────────────────────────────────────────────────── */
.bp-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: var(--mm-gold-soft, rgba(212,168,67,0.15)); color: var(--mm-goldl, #EEC563); }

/* ── Cover card ────────────────────────────────────────────────── */
.bp-cover-wrap { padding: 32px 0; }
.bp-cover {
  position: relative; overflow: hidden; border-radius: 16px;
  background: var(--mm-s1); border: 0.5px solid var(--b1);
  padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap;
}
.bp-cover__noise {
  position: absolute; inset: 0; opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}
.bp-cover__grid {
  position: absolute; inset: 0; opacity: 0.06;
  background-image: radial-gradient(circle at 1px 1px, var(--mm-gold) 1px, transparent 0);
  background-size: 24px 24px; pointer-events: none;
}
.bp-cover__badge { position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--mm-s2); border: 0.5px solid var(--b2); border-radius: 10px; color: var(--mm-goldl, #EEC563); font-weight: 600; font-size: 14px; }
.bp-cover__stats { position: relative; display: flex; gap: 16px; }
.bp-cover__stat { background: var(--mm-s2); border: 0.5px solid var(--b1); border-radius: 10px; padding: 12px 20px; display: flex; flex-direction: column; gap: 2px; align-items: center; min-width: 80px; }
.bp-cover__stat strong { font-size: 22px; font-weight: 700; color: var(--mm-pearl); line-height: 1; }
.bp-cover__stat span { font-size: 11px; color: var(--mm-slate); text-transform: uppercase; letter-spacing: 0.06em; }

/* ── Layout ─────────────────────────────────────────────────────── */
.bp-article-section { padding-top: 40px; padding-bottom: 80px; }
.bp-layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 48px; align-items: start; }
@media (max-width: 960px) { .bp-layout { grid-template-columns: 1fr; gap: 32px; } }

/* ── Article body ───────────────────────────────────────────────── */
.bp-content { font-size: 16px; line-height: 1.78; color: var(--mm-silver); }
.bp-content :deep(h2) { font-size: 1.5rem; font-weight: 700; color: var(--mm-pearl); margin: 2.5rem 0 1rem; scroll-margin-top: 90px; line-height: 1.3; border-left: 3px solid var(--mm-gold); padding-left: 12px; }
.bp-content :deep(h3) { font-size: 1.15rem; font-weight: 700; color: var(--mm-pearl); margin: 2rem 0 0.75rem; scroll-margin-top: 90px; }
.bp-content :deep(p) { margin: 0 0 1.25rem; }
.bp-content :deep(ul), .bp-content :deep(ol) { margin: 0 0 1.25rem; padding-left: 1.4rem; }
.bp-content :deep(li) { margin-bottom: 0.4rem; }
.bp-content :deep(strong) { color: var(--mm-pearl); font-weight: 600; }
.bp-content :deep(a) { color: var(--mm-goldl, #EEC563); text-decoration: underline; text-underline-offset: 3px; }
.bp-content :deep(a:hover) { color: var(--mm-gold); }
.bp-content :deep(blockquote) { border-left: 3px solid var(--mm-gold); margin: 1.75rem 0; padding: 0.75rem 1.25rem; color: var(--mm-pearl); font-style: italic; background: rgba(212,168,67,0.06); border-radius: 0 10px 10px 0; }
.bp-content :deep(code) { background: var(--mm-s2); padding: 0.2rem 0.45rem; border-radius: 5px; font-size: 0.88em; color: var(--mm-pearl); font-family: 'JetBrains Mono', monospace; border: 0.5px solid var(--b1); }
.bp-content :deep(pre) { background: var(--mm-s2); border: 0.5px solid var(--b1); padding: 1.25rem; border-radius: 12px; overflow-x: auto; font-size: 0.875rem; line-height: 1.6; margin: 1.5rem 0; }
.bp-content :deep(pre code) { background: none; border: none; padding: 0; font-size: inherit; }
.bp-content :deep(img) { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; border: 0.5px solid var(--b1); }
.bp-content :deep(hr) { border: none; border-top: 0.5px solid var(--b1); margin: 2.5rem 0; }
.bp-content :deep(table) { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
.bp-content :deep(th) { background: var(--mm-s2); color: var(--mm-pearl); font-weight: 600; padding: 10px 14px; border: 0.5px solid var(--b2); text-align: left; }
.bp-content :deep(td) { padding: 10px 14px; border: 0.5px solid var(--b1); color: var(--mm-silver); }

/* ── Tags ───────────────────────────────────────────────────────── */
.bp-tags { margin-top: 2.5rem; display: flex; flex-wrap: wrap; gap: 8px; }
.bp-tag { display: inline-block; padding: 5px 12px; background: var(--mm-s2); border: 0.5px solid var(--b1); border-radius: 999px; color: var(--mm-slate); font-size: 12px; text-decoration: none; transition: all 0.15s; }
.bp-tag:hover { border-color: var(--mm-gold); color: var(--mm-goldl); background: rgba(212,168,67,0.1); }

/* ── Share ──────────────────────────────────────────────────────── */
.bp-share { margin-top: 2.5rem; padding: 16px 20px; background: var(--mm-s1); border: 0.5px solid var(--b1); border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.bp-share__label { font-weight: 600; color: var(--mm-pearl); font-size: 14px; }
.bp-share__buttons { display: flex; gap: 8px; }
.bp-share__btn { width: 36px; height: 36px; border-radius: 8px; background: var(--mm-s2); border: 0.5px solid var(--b1); color: var(--mm-slate); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; text-decoration: none; }
.bp-share__btn:hover { background: rgba(212,168,67,0.15); border-color: var(--mm-gold); color: var(--mm-goldl); }

/* ── Sidebar ─────────────────────────────────────────────────────── */
.bp-side { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 90px; }
@media (max-width: 960px) { .bp-side { position: static; } }
.bp-side-card { background: var(--mm-s1); border: 0.5px solid var(--b1); border-radius: 14px; padding: 20px; }
.bp-side-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--mm-slate); margin: 0 0 14px; }

/* TOC */
.bp-toc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
.bp-toc-item {}
.bp-toc-link { display: block; padding: 6px 10px; color: var(--mm-silver); font-size: 13px; line-height: 1.5; border-radius: 6px; text-decoration: none; border-left: 2px solid transparent; transition: all 0.12s; }
.bp-toc-link:hover { background: var(--mm-s2); color: var(--mm-pearl); }
.bp-toc-item--active .bp-toc-link { background: rgba(212,168,67,0.1); color: var(--mm-goldl, #EEC563); border-left-color: var(--mm-gold); font-weight: 600; }

/* Newsletter */
.bp-newsletter__desc { color: var(--mm-silver); font-size: 13px; line-height: 1.55; margin: 0 0 14px; }
.bp-newsletter__form { display: flex; flex-direction: column; gap: 8px; }
.bp-newsletter__input { font: inherit; padding: 8px 12px; border: 0.5px solid var(--b1); border-radius: 8px; background: var(--mm-s2); color: var(--mm-pearl); width: 100%; font-size: 13px; transition: border-color 0.15s; }
.bp-newsletter__input:focus { outline: none; border-color: var(--mm-gold); }
.bp-newsletter__input::placeholder { color: var(--mm-slate); }
.bp-newsletter__fine { color: var(--mm-slate); font-size: 11px; display: block; margin-top: 6px; }

/* ── Buttons ─────────────────────────────────────────────────────── */
.bp-btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 20px; border-radius: 8px; font: inherit; font-size: 13px; font-weight: 600; background: rgba(212,168,67,0.15); border: 0.5px solid var(--mm-gold); color: var(--mm-goldl, #EEC563); cursor: pointer; transition: background 0.15s; text-decoration: none; }
.bp-btn:hover { background: rgba(212,168,67,0.28); }
.bp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.bp-btn--full { width: 100%; }

/* ── Prev/Next ─────────────────────────────────────────────────── */
.bp-nav-section { padding: 40px 0; border-top: 0.5px solid var(--b1); border-bottom: 0.5px solid var(--b1); }
.bp-nav-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 700px) { .bp-nav-grid { grid-template-columns: 1fr; } }
.bp-nav-card { background: var(--mm-s1); border: 0.5px solid var(--b1); border-radius: 14px; padding: 20px 24px; display: flex; flex-direction: column; gap: 6px; text-decoration: none; transition: all 0.2s; }
.bp-nav-card:hover { border-color: var(--mm-gold); box-shadow: 0 8px 32px -12px rgba(212,168,67,0.2); }
.bp-nav-card--next { text-align: right; }
.bp-nav-dir { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--mm-gold); }
.bp-nav-title { color: var(--mm-pearl); font-weight: 600; font-size: 14px; line-height: 1.4; }

/* ── Related ─────────────────────────────────────────────────────── */
.bp-related-section { padding: 56px 0 80px; }
.bp-related-title { font-size: 1.4rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 32px; }
.bp-related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.bp-related-card { background: var(--mm-s1); border: 0.5px solid var(--b1); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; transition: all 0.2s; }
.bp-related-card:hover { border-color: var(--b2); box-shadow: 0 12px 40px -16px rgba(0,0,0,0.5); transform: translateY(-2px); }
.bp-related-thumb { aspect-ratio: 16/9; background: var(--mm-s2); overflow: hidden; }
.bp-related-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bp-related-thumb__placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, var(--mm-s2) 0%, var(--mm-s3) 100%); }
.bp-related-body { padding: 16px 18px 20px; display: flex; flex-direction: column; gap: 8px; }
.bp-related-card-title { font-size: 15px; font-weight: 700; color: var(--mm-pearl); margin: 0; line-height: 1.4; }
.bp-related-meta { color: var(--mm-slate); font-size: 12px; }

/* ── Not found ─────────────────────────────────────────────────── */
.bp-missing-wrap { padding: 80px 0; }
.bp-missing { text-align: center; }
.bp-missing__title { font-size: 1.75rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 12px; }
.bp-missing__lede { color: var(--mm-silver); margin: 0 auto 24px; max-width: 460px; }

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .bp-hero { padding: 32px 0 24px; }
  .bp-cover { flex-direction: column; align-items: flex-start; }
  .bp-cover__stats { gap: 8px; }
}
</style>
