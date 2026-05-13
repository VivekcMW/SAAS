<script setup lang="ts">
/**
 * /features/[slug] — Programmatic SEO page for apps with a specific feature.
 *
 * Slug: sso, api, mobile-app, free-trial, gdpr-compliant, etc.
 * SEO target: "Apps with [Feature] — Best [Feature] SaaS Tools | Moonmart"
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

const { data, error } = await useFetch<{ slug: string; featureLabel: string; apps: App[] }>(
  `/api/seo/features/${slug}`,
  { key: `features-${slug}` }
)

useHreflang()

const apps = computed(() => data.value?.apps ?? [])
const featureLabel = computed(() => data.value?.featureLabel ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
const pageTitle = computed(() => `Best Apps with ${featureLabel.value} (${year}) — Top ${featureLabel.value} SaaS Tools | Moonmart`)
const description = computed(() => `Discover the ${apps.value.length} best SaaS apps with ${featureLabel.value} in ${year}. Rated by real users — no sponsored rankings.`)
const canonical = `https://moonmart.ai/features/${slug}`

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
    { name: 'chatgpt:entity-type', content: 'SoftwareFeatureList' },
    { name: 'chatgpt:category', content: featureLabel.value },
    { name: 'perplexity:source-type', content: 'software-feature-list' },
    { name: 'ai:content-type', content: 'feature-software-list' },
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
          url: `https://moonmart.ai/marketplace/app/${app.slug}`
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
          { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://moonmart.ai/features' },
          { '@type': 'ListItem', position: 3, name: featureLabel.value, item: canonical }
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
            name: `Which software has ${featureLabel.value}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: apps.value.length
                ? `The top-rated software tools with ${featureLabel.value} on Moonmart include ${apps.value.slice(0, 3).map(a => a.name).join(', ')}.`
                : `Moonmart tracks SaaS tools with ${featureLabel.value}.`
            }
          },
          {
            '@type': 'Question',
            name: `Is there a free tool with ${featureLabel.value}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Several SaaS tools with ${featureLabel.value} offer free plans or free trials. Filter by pricing on Moonmart to see which ones have a freemium tier.`
            }
          }
        ]
      })
    }
  ] : []
}))

function priceLabel(app: App): string {
  if (!app.pricing_type || app.pricing_type === 'free') return 'Free'
  if (app.pricing_type === 'freemium') return 'Freemium'
  if (app.pricing_type === 'paid' && app.pricing_value) {
    return `From $${app.pricing_value}/${app.pricing_period ?? 'mo'}`
  }
  return 'Contact for pricing'
}
</script>

<template>
  <main class="feat-page mk-page">
    <!-- 404 -->
    <div v-if="error || (!data && !apps.length)" class="mk-section">
      <div class="mk-section__inner feat-page__missing">
        <h1>Feature not found</h1>
        <p>We couldn't find apps with this feature. <NuxtLink to="/marketplace">Browse the marketplace</NuxtLink>.</p>
      </div>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <nav class="feat-page__crumbs" aria-label="Breadcrumb">
        <div class="feat-page__crumbs-inner">
          <NuxtLink to="/">Home</NuxtLink>
          <span aria-hidden="true">/</span>
          <span>Features</span>
          <span aria-hidden="true">/</span>
          <span>{{ featureLabel }}</span>
        </div>
      </nav>

      <!-- Hero -->
      <section class="feat-page__hero">
        <div class="feat-page__hero-inner">
          <span class="mk-eyebrow">Feature Filter</span>
          <h1 class="feat-page__title">Apps with {{ featureLabel }}</h1>
          <p class="feat-page__lede">{{ description }}</p>
        </div>
      </section>

      <!-- App list -->
      <section class="feat-page__list mk-section">
        <div class="mk-section__inner">
          <ol class="feat-page__items">
            <li v-for="(app, i) in apps" :key="app.id" class="feat-page__item">
              <span class="feat-page__rank">#{{ i + 1 }}</span>
              <img
                v-if="app.logo"
                :src="app.logo"
                :alt="`${app.name} logo`"
                class="feat-page__logo"
                loading="lazy"
                width="48"
                height="48"
              />
              <div class="feat-page__info">
                <NuxtLink :to="`/marketplace/app/${app.slug}`" class="feat-page__app-name">
                  {{ app.name }}
                </NuxtLink>
                <p class="feat-page__app-desc">{{ app.short_description }}</p>
                <div class="feat-page__app-meta">
                  <span v-if="app.rating" class="feat-page__rating">
                    ★ {{ app.rating.toFixed(1) }}
                    <span class="feat-page__reviews">({{ app.review_count }} reviews)</span>
                  </span>
                  <span class="feat-page__price">{{ priceLabel(app) }}</span>
                  <span class="feat-page__cat">{{ app.category }}</span>
                </div>
              </div>
              <div class="feat-page__actions">
                <NuxtLink :to="`/marketplace/app/${app.slug}`" class="mk-btn mk-btn--primary">View</NuxtLink>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- FAQ -->
      <section class="feat-page__faq mk-section">
        <div class="mk-section__inner">
          <h2>Frequently Asked Questions</h2>
          <dl class="feat-page__faq-list">
            <div class="feat-page__faq-item">
              <dt>Which software has {{ featureLabel }}?</dt>
              <dd>
                Top tools with {{ featureLabel }} on Moonmart include
                {{ apps.slice(0, 3).map(a => a.name).join(', ') }}, rated by verified buyers.
              </dd>
            </div>
            <div class="feat-page__faq-item">
              <dt>Is there a free tool with {{ featureLabel }}?</dt>
              <dd>
                Several tools with {{ featureLabel }} offer free plans or trials.
                Filter by pricing on Moonmart to find freemium options.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.feat-page__crumbs { padding: 12px 0; font-size: 0.85rem; color: var(--mk-muted, #888); }
.feat-page__crumbs-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; gap: 8px; align-items: center; }
.feat-page__hero { background: var(--mk-surface, #fff); border-bottom: 1px solid var(--mk-border, #e5e7eb); padding: 48px 0 40px; text-align: center; }
.feat-page__hero-inner { max-width: 720px; margin: 0 auto; padding: 0 24px; }
.feat-page__title { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; margin: 8px 0 16px; }
.feat-page__lede { font-size: 1.05rem; color: var(--mk-muted, #6b7280); line-height: 1.6; }
.feat-page__items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
.feat-page__item { display: flex; gap: 16px; align-items: flex-start; background: var(--mk-card, #fff); border: 1px solid var(--mk-border, #e5e7eb); border-radius: 8px; padding: 20px; }
.feat-page__rank { font-size: 1.2rem; font-weight: 800; color: var(--mk-accent, #d4a843); min-width: 32px; }
.feat-page__logo { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; flex-shrink: 0; }
.feat-page__info { flex: 1; }
.feat-page__app-name { font-size: 1.05rem; font-weight: 700; color: var(--mk-fg, #111); text-decoration: none; }
.feat-page__app-name:hover { text-decoration: underline; }
.feat-page__app-desc { font-size: 0.9rem; color: var(--mk-muted, #6b7280); margin: 6px 0; line-height: 1.5; }
.feat-page__app-meta { display: flex; gap: 12px; font-size: 0.82rem; flex-wrap: wrap; }
.feat-page__rating { color: #f59e0b; font-weight: 600; }
.feat-page__reviews { color: var(--mk-muted, #9ca3af); font-weight: 400; }
.feat-page__price, .feat-page__cat { background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
.feat-page__actions { display: flex; flex-direction: column; gap: 8px; }
.feat-page__missing { text-align: center; padding: 80px 24px; }
.feat-page__faq-list { display: flex; flex-direction: column; gap: 20px; }
.feat-page__faq-item dt { font-weight: 700; margin-bottom: 8px; }
.feat-page__faq-item dd { color: var(--mk-muted, #6b7280); line-height: 1.6; }
</style>
