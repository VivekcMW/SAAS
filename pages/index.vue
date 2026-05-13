<template>
  <main class="mk-page home">
    <!-- 1. Hero -->
    <section class="home-hero">
      <div class="home-hero__inner">
        <span class="mk-eyebrow home-hero__badge">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2l2.6 6.4L21 10l-4.9 4.3L17.8 21 12 17.6 6.2 21l1.7-6.7L3 10l6.4-1.6z" fill="currentColor"/></svg>
          AI-powered software discovery
        </span>
        <h1 class="home-hero__title">
          Find the right software for the way
          <span class="home-hero__accent">you work.</span>
        </h1>
        <p class="home-hero__lede">
          Tell us what you need in plain English. We'll shortlist the 3 best apps out of 1,200+ —
          no sales calls, no bias, no pay-to-play rankings.
        </p>

        <form class="home-search" @submit.prevent="runAIMatch">
          <svg class="home-search__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            v-model="aiPrompt"
            type="text"
            class="home-search__input"
            :placeholder="searchPlaceholder"
            :disabled="aiLoading"
            aria-label="Describe what you need"
          >
          <button
            type="submit"
            class="mk-btn mk-btn--primary home-search__btn"
            :disabled="!aiPrompt.trim() || aiLoading"
          >
            <span v-if="!aiLoading">Find my tools</span>
            <span v-else>Matching…</span>
          </button>
        </form>

        <div class="home-chips">
          <span class="home-chips__label">Try:</span>
          <button
            v-for="(ex, i) in examples"
            :key="i"
            type="button"
            class="home-chip"
            @click="aiPrompt = ex"
          >{{ ex }}</button>
        </div>

        <div v-if="aiError" class="home-results home-results--error">
          <p>{{ aiError }}</p>
        </div>

        <div v-if="aiResults.length" class="home-results">
          <div class="home-results__header">
            <span class="home-results__eyebrow">
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M12 2l2.6 6.4L21 10l-4.9 4.3L17.8 21 12 17.6 6.2 21l1.7-6.7L3 10l6.4-1.6z" fill="currentColor"/></svg>
              Top picks for you
            </span>
          </div>
          <ul class="home-results__list">
            <li v-for="(r, idx) in aiResults" :key="r.app.id" class="home-results__card">
              <div class="home-results__rank">{{ idx + 1 }}</div>
              <div class="home-results__body">
                <div class="home-results__top">
                  <NuxtLink :to="`/apps/${r.app.slug}`" class="home-results__name">{{ r.app.name }}</NuxtLink>
                  <span class="home-results__score">
                    <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true"><path d="M12 2l2.6 6.4L21 10l-4.9 4.3L17.8 21 12 17.6 6.2 21l1.7-6.7L3 10l6.4-1.6z" fill="currentColor"/></svg>
                    {{ Math.round(r.score * 100) }}% match
                  </span>
                </div>
                <div class="home-results__bar-wrap">
                  <div class="home-results__bar" :style="{ width: Math.round(r.score * 100) + '%' }" />
                </div>
                <p class="home-results__reason">{{ r.reasoning }}</p>
                <p v-if="r.tradeoff" class="home-results__tradeoff">
                  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  {{ r.tradeoff }}
                </p>
              </div>
            </li>
          </ul>
          <NuxtLink to="/marketplace" class="home-results__more">
            Browse all matches in marketplace
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </NuxtLink>
        </div>

        <div class="home-trust">
          <span><strong>167</strong> categories</span>
          <span class="home-trust__dot" aria-hidden="true">·</span>
          <span><strong>1,200+</strong> apps indexed</span>
          <span class="home-trust__dot" aria-hidden="true">·</span>
          <span><strong>Free</strong> to browse</span>
        </div>
      </div>
    </section>

    <!-- 2. Social proof -->
    <section class="home-proof">
      <div class="home-proof__inner">
        <span class="home-proof__label">Trusted by teams at</span>
        <div class="home-proof__logos">
          <span v-for="brand in trustedBrands" :key="brand" class="home-proof__brand">{{ brand }}</span>
        </div>
      </div>
    </section>

    <!-- 3. How it works -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <div class="home-section-head">
          <span class="mk-eyebrow">How it works</span>
          <h2 class="mk-section__title">From fuzzy need to shortlist in under a minute</h2>
          <p class="mk-section__lede">A focused workflow that replaces hours of demo calls.</p>
        </div>

        <div class="home-steps">
          <article v-for="(s, i) in steps" :key="s.title" class="home-step">
            <div class="home-step__num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="home-step__icon" aria-hidden="true" v-html="s.icon" />
            <h3 class="home-step__title">{{ s.title }}</h3>
            <p class="home-step__text">{{ s.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 4. Categories -->
    <section class="mk-section mk-section--soft">
      <div class="mk-section__inner">
        <div class="home-section-head">
          <span class="mk-eyebrow">Browse by category</span>
          <h2 class="mk-section__title">Start where your stack needs the most help</h2>
        </div>
        <div class="home-cats">
          <NuxtLink
            v-for="c in categories"
            :key="c.slug"
            :to="`/marketplace?category=${c.slug}`"
            class="home-cat"
          >
            <div class="home-cat__icon" aria-hidden="true" v-html="c.icon" />
            <div class="home-cat__text">
              <h3 class="home-cat__name">{{ c.name }}</h3>
              <span class="home-cat__count">{{ c.count }} apps</span>
            </div>
            <svg class="home-cat__arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </NuxtLink>
        </div>
        <div class="home-cats__footer">
          <NuxtLink to="/marketplace" class="mk-btn mk-btn--secondary">Browse all categories</NuxtLink>
        </div>
      </div>
    </section>

    <!-- 5. Trending apps -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <div class="home-section-head">
          <span class="mk-eyebrow">Trending right now</span>
          <h2 class="mk-section__title">What buyers are shortlisting this week</h2>
          <p class="mk-section__lede">Hand-picked from real evaluation activity on Moonmart — not paid placements.</p>
        </div>

        <div class="home-apps">
          <NuxtLink
            v-for="app in topProducts"
            :key="app.id"
            :to="`/marketplace/app/${app.id}`"
            class="app-card"
          >
            <div class="app-card__head">
              <div class="app-card__logo">
                <img :src="app.image" :alt="`${app.name} logo`" loading="lazy" @error="onLogoError" >
              </div>
              <div class="app-card__title">
                <h3 class="app-card__name">{{ app.name }}</h3>
                <span class="app-card__cat">{{ app.category }}</span>
              </div>
            </div>

            <p class="app-card__tag">{{ app.tagline }}</p>

            <div class="app-card__meta">
              <span class="app-card__rating">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2l2.6 6.4L21 10l-4.9 4.3L17.8 21 12 17.6 6.2 21l1.7-6.7L3 10l6.4-1.6z" fill="currentColor"/></svg>
                <strong>{{ app.rating }}</strong>
                <span class="app-card__reviews">({{ app.reviewCount }})</span>
              </span>
              <span class="app-card__dot" aria-hidden="true">·</span>
              <span class="app-card__price">{{ formatPrice(app) }}</span>
            </div>

            <span class="app-card__cta">
              View details
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </NuxtLink>
        </div>

        <div class="home-apps__footer">
          <NuxtLink to="/marketplace" class="mk-btn mk-btn--secondary">View all apps</NuxtLink>
        </div>
      </div>
    </section>

    <!-- 5b. App of the day -->
    <section class="mk-section mk-section--soft home-aotd-section">
      <div class="mk-section__inner">
        <div class="home-aotd">
          <div class="home-aotd__badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2l2.6 6.4L21 10l-4.9 4.3L17.8 21 12 17.6 6.2 21l1.7-6.7L3 10l6.4-1.6z"/></svg>
            App of the day
          </div>
          <div class="home-aotd__card">
            <div class="home-aotd__left">
              <div class="home-aotd__logo">
                <img :src="appOfDay.image" :alt="appOfDay.name" @error="onLogoError" >
              </div>
              <div class="home-aotd__info">
                <h3 class="home-aotd__name">{{ appOfDay.name }}</h3>
                <span class="home-aotd__cat">{{ appOfDay.category }}</span>
                <div class="home-aotd__rating">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2l2.6 6.4L21 10l-4.9 4.3L17.8 21 12 17.6 6.2 21l1.7-6.7L3 10l6.4-1.6z"/></svg>
                  {{ appOfDay.rating }} · {{ appOfDay.reviewCount }} reviews
                </div>
              </div>
            </div>
            <div class="home-aotd__body">
              <p class="home-aotd__tagline">{{ appOfDay.tagline }}</p>
              <p class="home-aotd__editorial">{{ appOfDay.editorial }}</p>
            </div>
            <div class="home-aotd__actions">
              <NuxtLink :to="`/marketplace/app/${appOfDay.id}`" class="mk-btn mk-btn--primary home-aotd__cta">See full profile</NuxtLink>
              <span class="home-aotd__price">{{ formatPrice(appOfDay) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5c. New this week -->
    <section class="mk-section home-new-section">
      <div class="mk-section__inner">
        <div class="home-section-head">
          <div class="home-section-head__row">
            <div>
              <span class="mk-eyebrow">New this week</span>
              <h2 class="mk-section__title">Just launched on Moonmart</h2>
            </div>
            <NuxtLink to="/marketplace?sort=newest" class="home-see-all">
              See all new
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>
        </div>
        <div class="home-new-list">
          <NuxtLink
            v-for="app in newThisWeek"
            :key="app.id"
            :to="`/marketplace/app/${app.id}`"
            class="home-new-item"
          >
            <div class="home-new-item__logo">
              <img :src="app.image" :alt="app.name" @error="onLogoError" >
            </div>
            <div class="home-new-item__body">
              <span class="home-new-item__name">{{ app.name }}</span>
              <span class="home-new-item__cat">{{ app.category }}</span>
            </div>
            <span class="home-new-item__badge">New</span>
            <span class="home-new-item__price">{{ formatPrice(app) }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 5d. Continue exploring (personalized — client only) -->
    <ClientOnly>
      <section v-if="recentlyViewed.length > 0" class="mk-section mk-section--soft home-continue-section">
        <div class="mk-section__inner">
          <div class="home-section-head">
            <span class="mk-eyebrow">Continue exploring</span>
            <h2 class="mk-section__title">Pick up where you left off</h2>
          </div>
          <div class="home-apps">
            <NuxtLink
              v-for="item in recentlyViewed"
              :key="item.id"
              :to="`/app/${item.id}`"
              class="app-card"
            >
              <div class="app-card__head">
                <div class="app-card__logo">
                  <span>{{ item.name.charAt(0) }}</span>
                </div>
                <div class="app-card__title">
                  <h3 class="app-card__name">{{ item.name }}</h3>
                  <span class="app-card__cat">{{ item.category }}</span>
                </div>
              </div>
              <p class="app-card__tag">{{ item.tagline }}</p>
              <span class="app-card__cta">
                Continue reading
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </NuxtLink>
          </div>
        </div>
      </section>
    </ClientOnly>

    <!-- 6. Why -->
    <section class="mk-section mk-section--soft">
      <div class="mk-section__inner">
        <div class="home-section-head">
          <span class="mk-eyebrow">Why Moonmart</span>
          <h2 class="mk-section__title">Built for buyers, not for vendors</h2>
        </div>
        <div class="home-why">
          <article v-for="v in values" :key="v.title" class="home-why__card">
            <div class="home-why__icon" aria-hidden="true" v-html="v.icon" />
            <h3 class="home-why__title">{{ v.title }}</h3>
            <p class="home-why__text">{{ v.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 7. Testimonial -->
    <section class="mk-section home-quote-section">
      <div class="mk-section__inner">
        <blockquote class="home-quote">
          <svg class="home-quote__mark" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M7.17 6.17C4.87 7.28 3 9.55 3 13v5h5v-5H5.5c.17-1.92 1.33-3.33 3-4L7.17 6.17zm10 0C14.87 7.28 13 9.55 13 13v5h5v-5h-2.5c.17-1.92 1.33-3.33 3-4l-1.33-2.83z" fill="currentColor"/></svg>
          <p>
            We shortlisted our new CRM in 20 minutes instead of 6 weeks. The framework and
            unbiased tagging were the real unlocks — not another spec sheet.
          </p>
          <footer>
            <strong>Priya Rao</strong>
            <span>VP Operations, Mercury Market</span>
          </footer>
        </blockquote>
      </div>
    </section>

    <!-- 8. Integrations -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <div class="home-section-head">
          <span class="mk-eyebrow">Integrations</span>
          <h2 class="mk-section__title">Plays well with the tools you already use</h2>
          <p class="mk-section__lede">Every listing shows which of your apps it natively integrates with, so you never adopt an island.</p>
        </div>
        <div class="home-integrations">
          <div
            v-for="logo in integrationLogos"
            :key="logo.name"
            class="home-integration"
            :title="logo.name"
          >
            <UIcon :name="logo.icon" dynamic class="home-integration__icon" />
            <span class="home-integration__name">{{ logo.name }}</span>
          </div>
        </div>
        <div class="home-integrations__footer">
          <NuxtLink to="/integrations" class="mk-btn mk-btn--secondary">View all integrations</NuxtLink>
        </div>
      </div>
    </section>

    <!-- 9. Final CTA -->
    <section class="mk-section home-final">
      <div class="mk-section__inner">
        <div class="home-final__card">
          <h2 class="home-final__title">Ready to find your stack?</h2>
          <p class="home-final__lede">Start with a free shortlist. No account required, no sales call.</p>
          <div class="home-final__actions">
            <NuxtLink to="/marketplace" class="mk-btn mk-btn--primary">Browse apps</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Vendor CTA -->
    <VendorCta />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { applySEO } = useSEO()
applySEO({
  title: 'Moonmart — Find the right software for the way you work',
  description:
    'AI-powered software discovery for teams. Describe what you need, get an unbiased shortlist from 1,200+ apps across 167 categories — no sales calls, no pay-to-play rankings.',
  canonical: '/',
  ogType: 'website'
})

// ── Global structured data: WebSite + Organization + SearchAction ───────────
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': 'https://moonmart.ai/#website',
        name: 'Moonmart',
        url: 'https://moonmart.ai',
        description: 'AI-powered SaaS marketplace — discover, compare and launch the right software for every team.',
        inLanguage: 'en',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://moonmart.ai/marketplace?q={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      })
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://moonmart.ai/#organization',
        name: 'Moonmart',
        url: 'https://moonmart.ai',
        logo: {
          '@type': 'ImageObject',
          url: 'https://moonmart.ai/assets/images/og-image.jpg',
          width: 512,
          height: 512
        },
        sameAs: [
          'https://twitter.com/moonmart',
          'https://www.linkedin.com/company/moonmart'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          url: 'https://moonmart.ai/contact',
          availableLanguage: 'English'
        }
      })
    }
  ]
})

const aiPrompt = ref('')
const aiLoading = ref(false)
const aiResults = ref<Array<{ app: { id: string; name: string; slug: string }; score: number; reasoning: string; tradeoff: string }>>([])
const aiError = ref('')
const searchPlaceholder =
  'Describe what you need — e.g. "CRM for a 10-person sales team"'

const examples = [
  'CRM for a 10-person sales team',
  'Async video for a distributed engineering team',
  'All-in-one HR + payroll under $200/mo'
]

async function runAIMatch() {
  if (!aiPrompt.value.trim() || aiLoading.value) return
  aiLoading.value = true
  aiResults.value = []
  aiError.value = ''
  try {
    const data = await $fetch<{ matches: Array<{ app: { id: string; name: string; slug: string }; score: number; reasoning: string; tradeoff: string }> }>('/api/ai/match', {
      method: 'POST',
      body: { painPoint: aiPrompt.value }
    })
    aiResults.value = data.matches || []
  } catch {
    aiError.value = 'Something went wrong. Please try again.'
  } finally {
    aiLoading.value = false
  }
}

const trustedBrands = ['Shopify', 'Notion', 'Stripe', 'Airbnb', 'Linear', 'Figma', 'Zapier', 'Intercom']

const steps = [
  {
    title: 'Describe your need',
    text: 'Tell us what job you need to get done — team size, budget, must-haves.',
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M8 12h4M8 8h6M8 16h3"/></svg>'
  },
  {
    title: 'See your shortlist',
    text: 'Our engine filters 1,200+ apps against your fit criteria — not paid rankings.',
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v4H4zM4 10h10v10H4zM16 10h4v4h-4zM16 16h4v4h-4z"/></svg>'
  },
  {
    title: 'Decide with confidence',
    text: 'Side-by-side comparison, verified reviews, transparent pricing. Demo or buy.',
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
  }
]

const categories = [
  { slug: 'crm-sales', name: 'CRM & Sales', count: 148, icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>' },
  { slug: 'project-management', name: 'Project Management', count: 112, icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v16"/></svg>' },
  { slug: 'collaboration', name: 'Team Collaboration', count: 96, icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { slug: 'hr-people', name: 'HR & People Ops', count: 84, icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { slug: 'marketing', name: 'Marketing', count: 134, icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l18-8-8 18-2-8z"/></svg>' },
  { slug: 'developer', name: 'Developer Tools', count: 161, icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>' }
]

interface HomeApp {
  id: string
  name: string
  category: string
  tagline: string
  image: string
  rating: string
  reviewCount: string
  price: string
  pricePeriod: string
}

const topProducts: HomeApp[] = [
  { id: 'slack', name: 'Slack', category: 'Team Collaboration', tagline: 'Channel-based messaging that replaces internal email for fast-moving teams.', image: '/assets/images/integrations/slack.svg', rating: '4.8', reviewCount: '42.1K', price: 'From $8', pricePeriod: '/user/mo' },
  { id: 'hubspot', name: 'HubSpot CRM', category: 'Customer Relationship', tagline: 'Free CRM that scales into a full marketing, sales, and service platform.', image: '/assets/images/integrations/hubspot.svg', rating: '4.7', reviewCount: '28.9K', price: 'Free forever', pricePeriod: '' },
  { id: 'zoom', name: 'Zoom', category: 'Video Conferencing', tagline: 'The reliability benchmark for video meetings, webinars, and events.', image: '/assets/images/integrations/zoom.svg', rating: '4.6', reviewCount: '55.3K', price: 'From $14.99', pricePeriod: '/host/mo' },
  { id: 'notion', name: 'Notion', category: 'Productivity', tagline: 'Docs, wikis, tasks, and databases in one connected workspace.', image: '/assets/images/integrations/notion.svg', rating: '4.9', reviewCount: '18.4K', price: 'From $10', pricePeriod: '/user/mo' },
  { id: 'salesforce', name: 'Salesforce', category: 'CRM & Sales', tagline: 'The enterprise CRM standard — deeply customizable revenue platform.', image: '/assets/images/integrations/salesforce.svg', rating: '4.5', reviewCount: '71.2K', price: 'From $25', pricePeriod: '/user/mo' },
  { id: 'canva', name: 'Canva', category: 'Design', tagline: 'Drag-and-drop design for teams that need beautiful output fast.', image: '/assets/images/integrations/canva.svg', rating: '4.8', reviewCount: '12.1K', price: 'From $12.99', pricePeriod: '/user/mo' }
]

// App of the day (editorial pick — rotates daily by date seed)
const dayIndex = new Date().getDate() % topProducts.length
const appOfDay = {
  ...topProducts[dayIndex],
  editorial: 'Our editorial team picked this app for its exceptional onboarding experience, transparent pricing, and best-in-class integrations — making it an instant upgrade for teams of any size.'
}

// New this week (simulated — in production pull from /api/apps?sort=newest&limit=5)
const newThisWeek: HomeApp[] = [
  { id: 'linear', name: 'Linear', category: 'Project Management', tagline: 'Built for high-performance engineering teams.', image: '/assets/images/integrations/notion.svg', rating: '4.9', reviewCount: '6.2K', price: 'From $8', pricePeriod: '/user/mo' },
  { id: 'loom', name: 'Loom', category: 'Async Video', tagline: 'Record and share async video messages instantly.', image: '/assets/images/integrations/zoom.svg', rating: '4.7', reviewCount: '9.1K', price: 'Free', pricePeriod: '' },
  { id: 'figma', name: 'Figma', category: 'Design', tagline: 'Collaborative interface design for modern teams.', image: '/assets/images/integrations/canva.svg', rating: '4.8', reviewCount: '22.5K', price: 'Free tier', pricePeriod: '' },
  { id: 'stripe', name: 'Stripe', category: 'Payments', tagline: 'Payments infrastructure for the internet.', image: '/assets/images/integrations/salesforce.svg', rating: '4.8', reviewCount: '14.3K', price: '2.9% + 30¢', pricePeriod: '/txn' },
  { id: 'intercom', name: 'Intercom', category: 'Customer Support', tagline: 'AI-first customer service across all channels.', image: '/assets/images/integrations/hubspot.svg', rating: '4.5', reviewCount: '11.7K', price: 'From $39', pricePeriod: '/mo' },
]

// Recently viewed (client-side localStorage)
interface RecentItem { id: string; name: string; category: string; tagline: string }
const recentlyViewed = ref<RecentItem[]>([])
if (import.meta.client) {
  try {
    const stored = localStorage.getItem('mm_recently_viewed')
    if (stored) recentlyViewed.value = JSON.parse(stored).slice(0, 4)
  } catch { /* ignore */ }
}

function formatPrice(a: HomeApp) {
  if (!a.pricePeriod) return a.price
  return `${a.price}${a.pricePeriod}`
}

function onLogoError(e: Event) {
  const el = e.target as HTMLImageElement
  el.style.display = 'none'
}

const values = [
  { title: 'Unbiased by design', text: "Vendors can't buy their way to the top. Rankings reflect real fit and verified usage — not bids.", icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>' },
  { title: 'Fast where it matters', text: 'Shortlists in under a minute, comparison in under five. Save your team from a month of demo calls.', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>' },
  { title: 'Transparent pricing', text: 'Every listing shows real starting prices, free tiers, and hidden fees. No "contact us" dead-ends.', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h6a2 2 0 0 1 0 4H9a2 2 0 0 0 0 4h6"/></svg>' }
]

const integrationLogos = [
  { name: 'Slack', icon: 'logos:slack-icon' },
  { name: 'Google', icon: 'logos:google-icon' },
  { name: 'Microsoft', icon: 'logos:microsoft-icon' },
  { name: 'Zoom', icon: 'logos:zoom-icon' },
  { name: 'Dropbox', icon: 'logos:dropbox' },
  { name: 'Salesforce', icon: 'logos:salesforce' },
  { name: 'HubSpot', icon: 'logos:hubspot' },
  { name: 'Notion', icon: 'simple-icons:notion' },
  { name: 'GitHub', icon: 'logos:github-icon' },
  { name: 'Stripe', icon: 'logos:stripe' },
  { name: 'Zapier', icon: 'logos:zapier-icon' },
  { name: 'Asana', icon: 'logos:asana' }
]
</script>

<style scoped>
.home { background: var(--mm-bg); }

/* Hero */
.home-hero {
  background: var(--mm-bg);
  padding: calc(var(--navbar-height, 72px) + 3.5rem) 1.5rem 4rem;
  text-align: center;
}
.home-hero__inner { max-width: 880px; margin: 0 auto; }
.home-hero__badge { display: inline-flex; align-items: center; gap: 0.4rem; margin-bottom: 1.25rem; }
.home-hero__title {
  font-family: var(--f-ui);
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.12;
  font-weight: 800;
  color: var(--mm-pearl);
  margin: 0 0 1rem;
  letter-spacing: -0.03em;
}
.home-hero__accent { color: var(--mm-gold); }
.home-hero__lede { color: var(--mm-silver); font-size: 1.08rem; line-height: 1.6; max-width: 680px; margin: 0 auto 2rem; }

.home-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--mm-s2);
  border: .5px solid var(--b2);
  border-radius: var(--r-lg);
  padding: 0.45rem 0.45rem 0.45rem 1rem;
  box-shadow: var(--shadow-md);
  max-width: 720px;
  margin: 0 auto 1.25rem;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.home-search:focus-within {
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 4px rgba(212,168,67,0.12), var(--shadow-md);
}
.home-search__icon { color: var(--mm-slate); flex-shrink: 0; }
.home-search__input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: var(--f-ui);
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--mm-pearl);
  padding: 0.65rem 0.25rem;
  min-width: 0;
}
.home-search__input::placeholder {
  color: var(--mm-silver);
  font-weight: 400;
}
.home-search__input:-webkit-autofill,
.home-search__input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px var(--mm-s2) inset !important;
  -webkit-text-fill-color: var(--mm-pearl) !important;
  caret-color: var(--mm-pearl);
}
.home-search__btn { white-space: nowrap; padding: 0.65rem 1.1rem; }
@media (max-width: 560px) {
  .home-search { flex-wrap: wrap; padding: 0.75rem; gap: 0.75rem; }
  .home-search__btn { width: 100%; }
}

.home-chips { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1.5rem; }
.home-chips__label { color: var(--mm-slate); font-size: 0.85rem; }
.home-chip {
  background: var(--mm-s2);
  border: .5px solid var(--b2);
  border-radius: var(--r-sm);
  padding: 0.35rem 0.85rem;
  font: inherit;
  font-size: 0.83rem;
  color: var(--mm-silver);
  cursor: pointer;
  transition: all 0.15s ease;
}
.home-chip:hover { border-color: var(--mm-gold); color: var(--mm-goldl); background: var(--mm-gold-soft); }

.home-results {
  max-width: 640px;
  margin: 0 auto 1.5rem;
  text-align: left;
  animation: fadeSlideUp 0.35s ease both;
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.home-results__header {
  display: flex;
  align-items: center;
  margin-bottom: 0.85rem;
}
.home-results__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--f-ui);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mm-gold);
}
.home-results__list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.home-results__card {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  padding: 1rem 1.15rem;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.home-results__card:hover {
  border-color: var(--mm-gold);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -20px rgba(212,168,67,.18);
}
.home-results__rank {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  font-family: var(--f-mon);
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}
.home-results__body { flex: 1; min-width: 0; }
.home-results__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}
.home-results__name {
  font-family: var(--f-ui);
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--mm-pearl);
  text-decoration: none;
}
.home-results__name:hover { color: var(--mm-gold); }
.home-results__score {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
  font-family: var(--f-mon);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--mm-gold);
  background: var(--mm-gold-soft);
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
}
.home-results__bar-wrap {
  height: 3px;
  background: var(--b1);
  border-radius: 999px;
  margin-bottom: 0.55rem;
  overflow: hidden;
}
.home-results__bar {
  height: 100%;
  background: var(--mm-gold);
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(.4,0,.2,1);
}
.home-results__reason {
  font-size: 0.86rem;
  color: var(--mm-silver);
  line-height: 1.55;
  margin: 0 0 0.4rem;
}
.home-results__tradeoff {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--mm-slate);
  margin: 0;
}
.home-results__tradeoff svg { flex-shrink: 0; margin-top: 1px; opacity: 0.7; }
.home-results__more {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--f-ui);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--mm-gold);
  text-decoration: none;
  transition: gap 0.15s ease;
}
.home-results__more:hover { gap: 0.65rem; }

.home-trust { display: flex; justify-content: center; flex-wrap: wrap; gap: 0.65rem; color: var(--mm-slate); font-size: 0.9rem; }
.home-trust strong { color: var(--mm-silver); }
.home-trust__dot { color: var(--b2); }

/* Social proof */
.home-proof { border-top: .5px solid var(--b1); border-bottom: .5px solid var(--b1); background: var(--mm-s1); padding: 1.75rem 1.5rem; }
.home-proof__inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; justify-content: center; }
.home-proof__label { color: var(--mm-slate); font-size: 0.82rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
.home-proof__logos { display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; }
.home-proof__brand { color: var(--mm-slate); font-family: var(--f-ui); font-weight: 700; font-size: 1rem; letter-spacing: 0.02em; }

/* Section head */
.home-section-head { text-align: center; max-width: 680px; margin: 0 auto 2.5rem; }
.home-section-head .mk-eyebrow { display: inline-block; margin-bottom: 0.75rem; }

/* Steps */
.home-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
@media (max-width: 820px) { .home-steps { grid-template-columns: 1fr; } }
.home-step { background: var(--mm-s2); border: .5px solid var(--b1); border-radius: var(--r-xl); padding: 1.75rem 1.5rem; text-align: left; }
.home-step__num { font-family: var(--f-mon); font-weight: 800; font-size: 0.82rem; color: var(--mm-gold); letter-spacing: 0.1em; margin-bottom: 0.75rem; }
.home-step__icon { width: 44px; height: 44px; border-radius: var(--r-lg); background: var(--mm-gold-soft); color: var(--mm-gold); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
.home-step__title { font-family: var(--f-ui); font-size: 1.08rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 0.35rem; }
.home-step__text { color: var(--mm-silver); font-size: 0.94rem; line-height: 1.55; margin: 0; }

/* Categories */
.home-cats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; }
@media (max-width: 820px) { .home-cats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .home-cats { grid-template-columns: 1fr; } }
.home-cat {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  background: var(--mm-s2);
  border: .5px solid var(--b1);
  border-radius: var(--r-lg);
  padding: 1rem 1.15rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}
.home-cat:hover { border-color: var(--mm-gold); transform: translateY(-2px); box-shadow: 0 14px 36px -24px rgba(212,168,67,.2); }
.home-cat__icon { width: 40px; height: 40px; border-radius: var(--r-md); background: var(--mm-gold-soft); color: var(--mm-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.home-cat__text { flex: 1; min-width: 0; }
.home-cat__name { font-family: var(--f-ui); font-size: 0.98rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 0.1rem; }
.home-cat__count { color: var(--mm-slate); font-size: 0.8rem; }
.home-cat__arrow { color: var(--mm-slate); flex-shrink: 0; transition: color 0.15s ease, transform 0.15s ease; }
.home-cat:hover .home-cat__arrow { color: var(--mm-gold); transform: translateX(3px); }
.home-cats__footer { text-align: center; margin-top: 2rem; }

/* App cards */
.home-apps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
@media (max-width: 960px) { .home-apps { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .home-apps { grid-template-columns: 1fr; } }

.app-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--mm-s2);
  border: .5px solid var(--b1);
  border-radius: var(--r-xl);
  padding: 1.35rem 1.4rem 1.25rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.18s ease;
  min-height: 240px;
}
.app-card:hover { transform: translateY(-3px); border-color: var(--mm-gold); box-shadow: 0 20px 40px -24px rgba(212,168,67,.2); background: var(--mm-s3); }
.app-card__head { display: flex; align-items: center; gap: 0.85rem; }
.app-card__logo {
  width: 44px;
  height: 44px;
  border-radius: var(--r-md);
  border: .5px solid var(--b1);
  background: var(--mm-s3);
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.app-card__logo img { width: 100%; height: 100%; object-fit: contain; }
.app-card__title { display: flex; flex-direction: column; min-width: 0; }
.app-card__name { font-family: var(--f-ui); font-size: 1.05rem; font-weight: 700; color: var(--mm-pearl); margin: 0; line-height: 1.3; }
.app-card__cat { color: var(--mm-slate); font-size: 0.8rem; }

.app-card__tag {
  color: var(--mm-slate);
  font-size: 0.92rem;
  line-height: 1.5;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-card__meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--mm-silver); flex-wrap: wrap; }
.app-card__rating { display: inline-flex; align-items: center; gap: 0.3rem; color: var(--mm-gold); }
.app-card__rating strong { color: var(--mm-pearl); }
.app-card__reviews { color: var(--mm-slate); font-size: 0.8rem; margin-left: 0.15rem; }
.app-card__dot { color: var(--b2); }
.app-card__price { color: var(--mm-pearl); font-weight: 500; }

.app-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--mm-gold);
  font-weight: 600;
  font-size: 0.88rem;
  padding-top: 0.4rem;
  border-top: .5px solid var(--b1);
  transition: gap 0.15s ease;
}
.app-card:hover .app-card__cta { gap: 0.6rem; }

.home-apps__footer { text-align: center; margin-top: 2rem; }

/* Why */
.home-why { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
@media (max-width: 820px) { .home-why { grid-template-columns: 1fr; } }
.home-why__card { background: var(--mm-s2); border: .5px solid var(--b1); border-radius: var(--r-xl); padding: 1.75rem 1.5rem; }
.home-why__icon { width: 44px; height: 44px; border-radius: var(--r-lg); background: var(--mm-gold-soft); color: var(--mm-gold); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
.home-why__title { font-family: var(--f-ui); font-size: 1.08rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 0.4rem; }
.home-why__text { color: var(--mm-silver); font-size: 0.94rem; line-height: 1.55; margin: 0; }

/* Quote */
.home-quote-section { background: var(--mm-s1); }
.home-quote { max-width: 760px; margin: 0 auto; text-align: center; padding: 0 1rem; }
.home-quote__mark { color: var(--mm-gold); opacity: 0.3; margin-bottom: 0; }
.home-quote p {
  font-family: var(--f-ui);
  font-size: clamp(1.25rem, 2.4vw, 1.65rem);
  font-weight: 400;
  font-style: italic;
  color: var(--mm-pearl);
  line-height: 1.4;
  margin: 0 0 1.25rem;
}
.home-quote footer { display: flex; flex-direction: column; gap: 0.15rem; color: var(--mm-slate); font-size: 0.88rem; }
.home-quote footer strong { color: var(--mm-silver); font-weight: 600; }

/* Integrations */
.home-integrations { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.85rem; }
@media (max-width: 960px) { .home-integrations { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 560px) { .home-integrations { grid-template-columns: repeat(3, 1fr); } }
.home-integration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  background: var(--mm-s2);
  border: .5px solid var(--b1);
  border-radius: var(--r-lg);
  transition: all 0.15s ease;
}
.home-integration:hover { border-color: var(--mm-sea); background: var(--mm-sea-soft); }
.home-integration__icon { font-size: 1.75rem; }
.home-integration__name { color: var(--mm-slate); font-size: 0.78rem; font-weight: 500; }
.home-integrations__footer { text-align: center; margin-top: 2rem; }

/* Final CTA */
.home-final { padding-bottom: 4rem; }
.home-final__card {
  background: var(--mm-s2);
  border: .5px solid var(--b2);
  border-radius: var(--r-xl);
  padding: 3rem 2rem;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}
.home-final__title {
  font-family: var(--f-ui);
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 800;
  color: var(--mm-pearl);
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
}
.home-final__lede { color: var(--mm-silver); font-size: 1rem; margin: 0 auto 1.75rem; max-width: 520px; }
.home-final__actions { display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; }

/* ── App of the Day ─────────────────────────────────────────────────────────── */
.home-aotd-section { border-top: 1px solid rgba(212,168,67,.1); border-bottom: 1px solid rgba(212,168,67,.1); }
.home-aotd__badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: var(--mm-gold, #D4A843); margin-bottom: 16px;
}
.home-aotd__card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px; align-items: center;
  background: var(--mm-s2, #1F2742);
  border: 1px solid rgba(212,168,67,.15);
  border-radius: 16px;
  padding: 24px 28px;
}
.home-aotd__left { display: flex; align-items: center; gap: 16px; }
.home-aotd__logo {
  width: 56px; height: 56px; border-radius: 14px;
  background: var(--mm-bg); overflow: hidden; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.home-aotd__logo img { width: 100%; height: 100%; object-fit: contain; }
.home-aotd__info { min-width: 120px; }
.home-aotd__name { font-weight: 700; font-size: 1rem; margin: 0 0 4px; color: var(--mm-pearl); }
.home-aotd__cat { font-size: .75rem; color: var(--mm-slate); }
.home-aotd__rating { display: flex; align-items: center; gap: 4px; font-size: .8rem; font-weight: 600; color: var(--mm-gold); margin-top: 6px; }
.home-aotd__body { border-left: 1px solid rgba(168,180,204,.08); padding-left: 24px; }
.home-aotd__tagline { font-weight: 600; font-size: .95rem; color: var(--mm-pearl); margin: 0 0 8px; }
.home-aotd__editorial { font-size: .85rem; color: var(--mm-silver); line-height: 1.6; margin: 0; }
.home-aotd__actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.home-aotd__cta { white-space: nowrap; }
.home-aotd__price { font-size: .8rem; color: var(--mm-slate); }
@media (max-width: 760px) {
  .home-aotd__card { grid-template-columns: 1fr; }
  .home-aotd__body { border-left: none; padding-left: 0; border-top: 1px solid rgba(168,180,204,.08); padding-top: 16px; }
  .home-aotd__actions { flex-direction: row; align-items: center; justify-content: space-between; }
}

/* ── New this week ──────────────────────────────────────────────────────────── */
.home-section-head__row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.home-see-all {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: .82rem; font-weight: 600; color: var(--mm-gold, #D4A843);
  text-decoration: none; white-space: nowrap; margin-top: 4px;
}
.home-see-all:hover { text-decoration: underline; }
.home-new-list { display: flex; flex-direction: column; gap: 2px; margin-top: 20px; }
.home-new-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 16px; border-radius: 10px;
  text-decoration: none; color: var(--mm-pearl);
  background: transparent;
  transition: background .15s;
}
.home-new-item:hover { background: var(--mm-s2, #1F2742); }
.home-new-item__logo {
  width: 36px; height: 36px; border-radius: 8px;
  background: var(--mm-s2); overflow: hidden; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.home-new-item__logo img { width: 100%; height: 100%; object-fit: contain; }
.home-new-item__body { flex: 1; min-width: 0; }
.home-new-item__name { display: block; font-weight: 600; font-size: .875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.home-new-item__cat { font-size: .75rem; color: var(--mm-slate); }
.home-new-item__badge {
  font-size: .65rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  padding: 2px 7px; border-radius: 4px;
  background: rgba(74,222,128,.12); color: #4ade80; border: 1px solid rgba(74,222,128,.2);
  white-space: nowrap;
}
.home-new-item__price { font-size: .8rem; color: var(--mm-silver); min-width: 80px; text-align: right; }
</style>
