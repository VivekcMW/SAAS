<script setup lang="ts">
/**
 * /best/[slug] — Programmatic SEO page for "Best [Category] Software".
 *
 * Slug format: crm-software, marketing-software, project-management-software
 * SEO target: "Best [Category] Software (2026) — Top N Tools | Moonmart"
 * Generates: ItemList, FAQPage, BreadcrumbList schemas.
 */

const route = useRoute()
const slug = route.params.slug as string
const year = new Date().getFullYear()

interface App {
  id: string
  slug: string
  name: string
  provider: string | null
  logo: string | null
  short_description: string
  category: string
  rating: number
  review_count: number
  pricing_type: string | null
  pricing_value: number | null
  pricing_period: string | null
}

const { data, error } = await useFetch<{ slug: string; categoryKey: string; apps: App[] }>(
  `/api/seo/best/${slug}`,
  { key: `best-${slug}` }
)

useHreflang()

const apps = computed(() => data.value?.apps ?? [])
const categoryKey = computed(() => data.value?.categoryKey ?? slug.replace(/-software$/, '').replace(/-/g, ' '))
const categoryLabel = computed(() => {
  const k = categoryKey.value
  return k.charAt(0).toUpperCase() + k.slice(1)
})
const pageTitle = computed(() => `Best ${categoryLabel.value} Software (${year}) — Top ${apps.value.length} Tools | Moonmart`)
const description = computed(() => `Compare the ${apps.value.length} best ${categoryLabel.value.toLowerCase()} software tools in ${year}. Real user ratings, transparent pricing, and expert analysis — no pay-to-play rankings.`)
const canonical = `https://moonmart.ai/best/${slug}`

useHead(() => ({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: description.value },
    { property: 'og:url', content: canonical },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:image', content: 'https://moonmart.ai/assets/images/og-image.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageTitle.value },
    { name: 'twitter:description', content: description.value },
    { name: 'robots', content: 'index, follow' },
    // LLM meta
    { name: 'chatgpt:entity-type', content: 'SoftwareList' },
    { name: 'chatgpt:category', content: categoryLabel.value },
    { name: 'perplexity:source-type', content: 'software-list' },
    { name: 'ai:content-type', content: 'best-software-list' },
    { name: 'ai:data-freshness', content: new Date().toISOString().split('T')[0] },
  ],
  link: [{ rel: 'canonical', href: canonical }],
  script: apps.value.length ? [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: pageTitle.value,
        description: description.value,
        url: canonical,
        numberOfItems: apps.value.length,
        itemListElement: apps.value.map((app, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: app.name,
          url: `https://moonmart.ai/marketplace/app/${app.slug}`,
          description: app.short_description
        }))
      })
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moonmart.ai' },
          { '@type': 'ListItem', position: 2, name: 'Marketplace', item: 'https://moonmart.ai/marketplace' },
          { '@type': 'ListItem', position: 3, name: `Best ${categoryLabel.value} Software`, item: canonical }
        ]
      })
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is the best ${categoryLabel.value.toLowerCase()} software in ${year}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: apps.value.length
                ? `The top-rated ${categoryLabel.value.toLowerCase()} software tools on Moonmart in ${year} include ${apps.value.slice(0, 3).map(a => a.name).join(', ')} — ranked by verified buyer reviews.`
                : `Moonmart tracks the best ${categoryLabel.value.toLowerCase()} software tools rated by real users.`
            }
          },
          {
            '@type': 'Question',
            name: `How do I choose ${categoryLabel.value.toLowerCase()} software?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `When choosing ${categoryLabel.value.toLowerCase()} software, consider your team size, budget, required integrations, and key features. Use Moonmart's AI-powered fit score to match tools to your specific needs.`
            }
          },
          {
            '@type': 'Question',
            name: `Is there a free ${categoryLabel.value.toLowerCase()} software option?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Many ${categoryLabel.value.toLowerCase()} software tools offer free plans or free trials. Filter by pricing on Moonmart to see which tools have freemium or free-tier options.`
            }
          }
        ]
      })
    }
  ] : []
}))

function priceLabel(app: App): string {
  if (!app.pricing_type) return 'Free'
  if (app.pricing_type === 'free') return 'Free'
  if (app.pricing_type === 'freemium') return 'Freemium'
  if (app.pricing_type === 'paid' && app.pricing_value) {
    return `From $${app.pricing_value}/${app.pricing_period ?? 'mo'}`
  }
  return 'Contact for pricing'
}
</script>

<template>
  <main class="best-page mk-page">
    <!-- 404 -->
    <div v-if="error || (!data && !apps.length)" class="mk-section">
      <div class="mk-section__inner best-page__missing">
        <h1>Category not found</h1>
        <p>We couldn't find software in this category. <NuxtLink to="/marketplace">Browse the marketplace</NuxtLink>.</p>
      </div>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <nav class="best-page__crumbs" aria-label="Breadcrumb">
        <div class="best-page__crumbs-inner">
          <NuxtLink to="/">Home</NuxtLink>
          <span aria-hidden="true">/</span>
          <NuxtLink to="/marketplace">Marketplace</NuxtLink>
          <span aria-hidden="true">/</span>
          <span>Best {{ categoryLabel }} Software</span>
        </div>
      </nav>

      <!-- Hero -->
      <section class="best-page__hero">
        <div class="best-page__hero-inner">
          <span class="mk-eyebrow">{{ year }} Rankings</span>
          <h1 class="best-page__title">Best {{ categoryLabel }} Software</h1>
          <p class="best-page__lede">{{ description }}</p>
        </div>
      </section>

      <!-- App list -->
      <section class="best-page__list mk-section">
        <div class="mk-section__inner">
          <ol class="best-page__items">
            <li v-for="(app, i) in apps" :key="app.id" class="best-page__item">
              <span class="best-page__rank">#{{ i + 1 }}</span>
              <img
                v-if="app.logo"
                :src="app.logo"
                :alt="`${app.name} logo`"
                class="best-page__logo"
                loading="lazy"
                width="48"
                height="48"
              />
              <div class="best-page__info">
                <NuxtLink :to="`/marketplace/app/${app.slug}`" class="best-page__app-name">
                  {{ app.name }}
                </NuxtLink>
                <p class="best-page__app-desc">{{ app.short_description }}</p>
                <div class="best-page__app-meta">
                  <span v-if="app.rating" class="best-page__rating">
                    ★ {{ app.rating.toFixed(1) }}
                    <span class="best-page__reviews">({{ app.review_count }} reviews)</span>
                  </span>
                  <span class="best-page__price">{{ priceLabel(app) }}</span>
                </div>
              </div>
              <div class="best-page__actions">
                <NuxtLink :to="`/marketplace/app/${app.slug}`" class="mk-btn mk-btn--primary">View Details</NuxtLink>
                <NuxtLink :to="`/alternatives/${app.slug}`" class="mk-btn mk-btn--ghost">Alternatives</NuxtLink>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- FAQ -->
      <section class="best-page__faq mk-section">
        <div class="mk-section__inner">
          <h2 class="best-page__faq-title">Frequently Asked Questions</h2>
          <dl class="best-page__faq-list">
            <div class="best-page__faq-item">
              <dt>What is the best {{ categoryLabel.toLowerCase() }} software in {{ year }}?</dt>
              <dd>
                The top-rated {{ categoryLabel.toLowerCase() }} software on Moonmart includes
                {{ apps.slice(0, 3).map(a => a.name).join(', ') }},
                ranked by {{ apps.reduce((s, a) => s + a.review_count, 0).toLocaleString() }} verified buyer reviews.
              </dd>
            </div>
            <div class="best-page__faq-item">
              <dt>How do I choose {{ categoryLabel.toLowerCase() }} software?</dt>
              <dd>
                Consider your team size, budget, required integrations, and key features.
                Moonmart's AI-powered fit score matches tools to your specific needs without pay-to-play bias.
              </dd>
            </div>
            <div class="best-page__faq-item">
              <dt>Is there a free {{ categoryLabel.toLowerCase() }} software option?</dt>
              <dd>
                Many {{ categoryLabel.toLowerCase() }} tools offer free plans or trials.
                Filter by pricing on Moonmart to find freemium options in this category.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.best-page__crumbs { padding: 12px 0; font-size: 0.85rem; color: var(--mk-muted, #888); }
.best-page__crumbs-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; gap: 8px; align-items: center; }
.best-page__hero { background: var(--mk-surface, #fff); border-bottom: 1px solid var(--mk-border, #e5e7eb); padding: 48px 0 40px; text-align: center; }
.best-page__hero-inner { max-width: 720px; margin: 0 auto; padding: 0 24px; }
.best-page__title { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; margin: 8px 0 16px; }
.best-page__lede { font-size: 1.05rem; color: var(--mk-muted, #6b7280); line-height: 1.6; }
.best-page__items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 20px; }
.best-page__item { display: flex; gap: 20px; align-items: flex-start; background: var(--mk-card, #fff); border: 1px solid var(--mk-border, #e5e7eb); border-radius: 8px; padding: 20px; }
.best-page__rank { font-size: 1.4rem; font-weight: 800; color: var(--mk-accent, #d4a843); min-width: 36px; }
.best-page__logo { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; flex-shrink: 0; }
.best-page__info { flex: 1; }
.best-page__app-name { font-size: 1.1rem; font-weight: 700; color: var(--mk-fg, #111); text-decoration: none; }
.best-page__app-name:hover { text-decoration: underline; }
.best-page__app-desc { font-size: 0.9rem; color: var(--mk-muted, #6b7280); margin: 6px 0; line-height: 1.5; }
.best-page__app-meta { display: flex; gap: 16px; font-size: 0.85rem; }
.best-page__rating { color: #f59e0b; font-weight: 600; }
.best-page__reviews { color: var(--mk-muted, #9ca3af); font-weight: 400; }
.best-page__price { background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
.best-page__actions { display: flex; flex-direction: column; gap: 8px; min-width: 140px; }
.best-page__missing { text-align: center; padding: 80px 24px; }
.best-page__faq-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 24px; }
.best-page__faq-list { display: flex; flex-direction: column; gap: 20px; }
.best-page__faq-item dt { font-weight: 700; margin-bottom: 8px; }
.best-page__faq-item dd { color: var(--mk-muted, #6b7280); line-height: 1.6; }
@media (max-width: 640px) {
  .best-page__item { flex-wrap: wrap; }
  .best-page__actions { width: 100%; flex-direction: row; }
}
</style>
