<script setup lang="ts">
/**
 * /pricing/[slug] — Programmatic SEO pricing page per app.
 *
 * SEO target: "{AppName} Pricing {year} — Plans, Cost & Free Trial"
 * Generates: Offer schema, SoftwareApplication, BreadcrumbList, FAQPage
 */
const route = useRoute()
const slug = computed(() => route.params.slug as string)
const year = new Date().getFullYear()

interface Pricing { type: string; value?: number; period?: string; currency?: string }
interface PricingTier { name: string; price: number | null; period: string; features: string[]; highlight?: boolean; cta?: string }
interface AppData {
  id: string; slug?: string; name: string; logo?: string; provider?: string
  description: string; rating: number; reviewCount: number
  pricing: Pricing; pricingTiers?: PricingTier[]
  category?: string; website?: string
}

const { data, error } = await useFetch<AppData>(() => `/api/apps/${slug.value}`, { key: `pricing-${slug.value}` })
const app = computed(() => data.value as AppData | null)
const notFound = computed(() => error.value || !app.value)

// ── Helpers ────────────────────────────────────────────────────────────────
const priceLabel = (app: AppData | null): string => {
  if (!app) return '—'
  const p = app.pricing
  if (p?.type === 'free') return 'Free'
  if (p?.type === 'contact') return 'Contact for pricing'
  if (p?.type === 'freemium') return 'Free + Paid plans'
  if (p?.value) return `$${p.value}/${p.period || 'mo'}`
  return 'Paid plans available'
}

const tiers = computed<PricingTier[]>(() => {
  if (app.value?.pricingTiers?.length) return app.value.pricingTiers
  // Generate sensible fallback tiers
  const base = app.value?.pricing?.value || 9
  return [
    { name: 'Free', price: 0, period: 'mo', features: ['Up to 3 users', 'Core features', 'Community support'], cta: 'Get Started Free' },
    { name: 'Pro', price: base, period: 'mo', features: ['Unlimited users', 'All features', 'Priority support', 'Advanced analytics'], highlight: true, cta: 'Start Free Trial' },
    { name: 'Enterprise', price: null, period: 'mo', features: ['Custom users', 'SSO & SAML', 'Dedicated CSM', 'SLA guarantee', 'Custom integrations'], cta: 'Contact Sales' },
  ]
})

const title = computed(() => app.value
  ? `${app.value.name} Pricing ${year} — Plans, Cost & Free Trial | Moonmart`
  : 'App Pricing | Moonmart'
)
const description = computed(() => app.value
  ? `${app.value.name} pricing plans for ${year}. Compare Free, Pro & Enterprise tiers. Starting at ${priceLabel(app.value)}. See full feature breakdown and decide which plan is right for your team.`
  : 'Explore software pricing plans on Moonmart.'
)
const canonical = computed(() => `https://moonmart.ai/pricing/${slug.value}`)

// ── Schema ─────────────────────────────────────────────────────────────────
const schema = computed(() => {
  if (!app.value) return null
  const offers = tiers.value.map(t => ({
    '@type': 'Offer',
    name: t.name,
    price: t.price ?? '',
    priceCurrency: app.value!.pricing.currency || 'USD',
    priceValidUntil: `${year + 1}-12-31`,
    availability: 'https://schema.org/InStock',
    description: t.features.join(', ')
  }))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: app.value.name,
        description: app.value.description,
        applicationCategory: app.value.category || 'BusinessApplication',
        offers,
        aggregateRating: app.value.reviewCount > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: app.value.rating,
          reviewCount: app.value.reviewCount,
          bestRating: 5, worstRating: 1
        } : undefined
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `Is there a free version of ${app.value.name}?`, acceptedAnswer: { '@type': 'Answer', text: app.value.pricing.type === 'free' || app.value.pricing.type === 'freemium' ? `Yes, ${app.value.name} offers a free plan. Paid plans with advanced features start at ${priceLabel(app.value)}.` : `${app.value.name} does not offer a permanent free plan but may offer a free trial. Check the vendor's website for current offers.` } },
          { '@type': 'Question', name: `How much does ${app.value.name} cost?`, acceptedAnswer: { '@type': 'Answer', text: `${app.value.name} pricing starts at ${priceLabel(app.value)}. Enterprise plans are available — contact the vendor for a custom quote.` } },
          { '@type': 'Question', name: `Does ${app.value.name} offer a free trial?`, acceptedAnswer: { '@type': 'Answer', text: `Many plans for ${app.value.name} include a 14-day free trial. No credit card required. Visit the vendor's website to confirm current trial availability.` } },
          { '@type': 'Question', name: `Can I cancel ${app.value.name} anytime?`, acceptedAnswer: { '@type': 'Answer', text: `Yes, ${app.value.name} subscriptions can typically be cancelled at any time from your account settings. Annual plans may have different cancellation terms.` } },
        ]
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moonmart.ai' },
          { '@type': 'ListItem', position: 2, name: 'Marketplace', item: 'https://moonmart.ai/marketplace' },
          { '@type': 'ListItem', position: 3, name: app.value.name, item: `https://moonmart.ai/marketplace/app/${app.value.slug || app.value.id}` },
          { '@type': 'ListItem', position: 4, name: `${app.value.name} Pricing`, item: canonical.value },
        ]
      }
    ]
  }
})

useHead(() => ({
  title: title.value,
  link: [{ rel: 'canonical', href: canonical.value }],
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
    { property: 'og:url', content: canonical.value },
    { property: 'og:image', content: `https://moonmart.ai/api/og/app/${slug.value}` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'chatgpt:page-type', content: 'pricing' },
    { name: 'perplexity:source-type', content: 'software-pricing' },
    { name: 'robots', content: 'index, follow' },
  ],
  script: schema.value ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(schema.value, null, 2) }] : []
}))
</script>

<template>
  <div class="pricing-page min-h-screen bg-gray-50">
    <!-- 404 -->
    <div v-if="notFound" class="max-w-2xl mx-auto py-24 text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">App Not Found</h1>
      <p class="text-gray-600 mb-6">We couldn't find pricing details for this app.</p>
      <NuxtLink to="/marketplace" class="inline-block bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600">Browse Marketplace</NuxtLink>
    </div>

    <template v-else-if="app">
      <!-- Hero -->
      <section class="bg-white border-b border-gray-200">
        <div class="max-w-5xl mx-auto px-4 py-10">
          <!-- Breadcrumb -->
          <nav class="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <NuxtLink to="/" class="hover:text-orange-500">Home</NuxtLink>
            <span class="mx-2">›</span>
            <NuxtLink to="/marketplace" class="hover:text-orange-500">Marketplace</NuxtLink>
            <span class="mx-2">›</span>
            <NuxtLink :to="`/marketplace/app/${app.slug || app.id}`" class="hover:text-orange-500">{{ app.name }}</NuxtLink>
            <span class="mx-2">›</span>
            <span class="text-gray-800">Pricing</span>
          </nav>

          <div class="flex items-center gap-4 mb-4">
            <img v-if="app.logo" :src="app.logo" :alt="app.name + ' logo'" class="w-14 h-14 rounded-md object-contain border border-gray-200 bg-white p-1">
            <div>
              <h1 class="text-3xl font-extrabold text-gray-900">{{ app.name }} Pricing {{ year }}</h1>
              <p v-if="app.provider" class="text-gray-500 text-sm">by {{ app.provider }}</p>
            </div>
          </div>
          <p class="text-lg text-gray-600 max-w-2xl">{{ description }}</p>

          <!-- Quick stats -->
          <div class="flex flex-wrap gap-4 mt-6">
            <div class="bg-orange-50 rounded-md px-4 py-2 text-sm">
              <span class="font-semibold text-orange-700">Starting price:</span>
              <span class="text-orange-900 ml-1">{{ priceLabel(app) }}</span>
            </div>
            <div v-if="app.rating > 0" class="bg-yellow-50 rounded-md px-4 py-2 text-sm">
              <span class="font-semibold text-yellow-700">Rating:</span>
              <span class="text-yellow-900 ml-1">★ {{ app.rating.toFixed(1) }} / 5 ({{ app.reviewCount }} reviews)</span>
            </div>
            <div class="bg-gray-100 rounded-md px-4 py-2 text-sm">
              <span class="font-semibold text-gray-700">Category:</span>
              <span class="text-gray-900 ml-1 capitalize">{{ (app.category || 'SaaS').replace(/-/g, ' ') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing tiers -->
      <section class="max-w-5xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">{{ app.name }} Pricing Plans</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="tier in tiers"
            :key="tier.name"
            :class="[
              'rounded-md border bg-white p-6 flex flex-col',
              tier.highlight ? 'border-orange-400 shadow-md ring-1 ring-orange-400' : 'border-gray-200'
            ]"
          >
            <div v-if="tier.highlight" class="mb-3">
              <span class="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900">{{ tier.name }}</h3>
            <div class="mt-3 mb-4">
              <template v-if="tier.price === null">
                <span class="text-2xl font-extrabold text-gray-900">Custom</span>
              </template>
              <template v-else-if="tier.price === 0">
                <span class="text-3xl font-extrabold text-gray-900">Free</span>
              </template>
              <template v-else>
                <span class="text-3xl font-extrabold text-gray-900">${{ tier.price }}</span>
                <span class="text-gray-500 text-sm ml-1">/{{ tier.period }}</span>
              </template>
            </div>
            <ul class="space-y-2 flex-1 mb-6">
              <li v-for="feat in tier.features" :key="feat" class="flex gap-2 text-sm text-gray-700">
                <span class="text-green-500 flex-shrink-0">✓</span>
                {{ feat }}
              </li>
            </ul>
            <a
              v-if="app.website"
              :href="app.website"
              target="_blank"
              rel="noopener noreferrer nofollow"
              :class="[
                'block text-center text-sm font-semibold py-2.5 rounded-md',
                tier.highlight ? 'bg-orange-500 text-white hover:bg-orange-600' : 'border border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-600'
              ]"
            >
              {{ tier.cta || 'Get Started' }}
            </a>
          </div>
        </div>
      </section>

      <!-- Pricing FAQ -->
      <section class="max-w-5xl mx-auto px-4 pb-10">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ app.name }} Pricing — FAQs</h2>
        <div class="space-y-4">
          <details class="bg-white rounded-md border border-gray-200 px-5 py-4">
            <summary class="font-semibold text-gray-800 cursor-pointer list-none flex justify-between">
              Is there a free version of {{ app.name }}?
              <span class="text-gray-400 text-lg ml-4">▾</span>
            </summary>
            <p class="mt-3 text-gray-600 text-sm">
              {{ app.pricing.type === 'free' || app.pricing.type === 'freemium'
                ? `Yes, ${app.name} offers a free plan with core features included.`
                : `${app.name} offers a free trial. Paid plans start at ${priceLabel(app)}.` }}
            </p>
          </details>
          <details class="bg-white rounded-md border border-gray-200 px-5 py-4">
            <summary class="font-semibold text-gray-800 cursor-pointer list-none flex justify-between">
              How much does {{ app.name }} cost in {{ year }}?
              <span class="text-gray-400 text-lg ml-4">▾</span>
            </summary>
            <p class="mt-3 text-gray-600 text-sm">
              {{ app.name }} pricing starts at {{ priceLabel(app) }} in {{ year }}. Enterprise pricing is available on request. Always check the vendor's website for the latest promotions and plan details.
            </p>
          </details>
          <details class="bg-white rounded-md border border-gray-200 px-5 py-4">
            <summary class="font-semibold text-gray-800 cursor-pointer list-none flex justify-between">
              Does {{ app.name }} offer a money-back guarantee?
              <span class="text-gray-400 text-lg ml-4">▾</span>
            </summary>
            <p class="mt-3 text-gray-600 text-sm">
              Many SaaS vendors including {{ app.name }} offer a 30-day money-back guarantee on paid plans. Contact {{ app.provider || 'the vendor' }} directly to confirm.
            </p>
          </details>
        </div>
      </section>

      <!-- CTA -->
      <section class="max-w-5xl mx-auto px-4 pb-16">
        <div class="bg-orange-50 border border-orange-200 rounded-md p-8 text-center">
          <h2 class="text-xl font-bold text-gray-900 mb-2">Ready to evaluate {{ app.name }}?</h2>
          <p class="text-gray-600 mb-5">Read {{ app.reviewCount }} verified reviews and compare {{ app.name }} with alternatives on Moonmart.</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <NuxtLink :to="`/marketplace/app/${app.slug || app.id}`" class="bg-orange-500 text-white font-semibold px-6 py-3 rounded-md hover:bg-orange-600">
              Read Reviews
            </NuxtLink>
            <NuxtLink :to="`/alternatives/${app.slug || app.id}`" class="border border-orange-500 text-orange-600 font-semibold px-6 py-3 rounded-md hover:bg-orange-50">
              Find Alternatives
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
