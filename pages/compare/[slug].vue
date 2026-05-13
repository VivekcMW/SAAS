<script setup lang="ts">
/**
 * /compare/[slug] — Programmatic SEO page for "A vs B" comparisons.
 *
 * Route format: /compare/slack-vs-notion
 *
 * SEO targets: "{AppA} vs {AppB} {year} — Features, Pricing & Reviews"
 * Generates: FAQPage schema, BreadcrumbList, SoftwareApplication × 2
 */
import { computed } from 'vue'

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || '')
const year = new Date().getFullYear()

// Parse "a-vs-b" — split on the first "-vs-" occurrence
const parts = computed(() => {
  const s = slug.value
  const idx = s.indexOf('-vs-')
  if (idx === -1) return null
  return { aSlug: s.slice(0, idx), bSlug: s.slice(idx + 4) }
})

// Fetch both apps in parallel
const { data: appAData, error: errorA } = await useFetch<AppData>(
  () => parts.value ? `/api/apps/${parts.value.aSlug}` : '/api/apps/_',
  { key: `cmp-a-${slug.value}` }
)
const { data: appBData, error: errorB } = await useFetch<AppData>(
  () => parts.value ? `/api/apps/${parts.value.bSlug}` : '/api/apps/_',
  { key: `cmp-b-${slug.value}` }
)

const appA = computed(() => appAData.value as AppData | null)
const appB = computed(() => appBData.value as AppData | null)
const notFound = computed(() => !parts.value || errorA.value || errorB.value || !appA.value || !appB.value)

// ── Types ──────────────────────────────────────────────────────────────────
interface Pricing { type: string; value?: number; period?: string }
interface AppData {
  id: string; slug?: string; name: string; logo?: string; provider?: string
  description: string; rating: number; reviewCount: number
  pricing: Pricing; category?: string; features?: unknown[]
  tags?: string[]; integrations?: string[]
  security?: { certifications?: string[] }
  performance?: { uptime?: number }
}

// ── Helpers ────────────────────────────────────────────────────────────────
const priceLabel = (app: AppData | null) => {
  if (!app) return '—'
  const p = app.pricing
  if (p?.type === 'free') return 'Free'
  if (p?.type === 'contact') return 'Contact Sales'
  if (p?.value) return `$${p.value}/${p.period || 'mo'}`
  return 'Paid'
}

const title = computed(() => {
  if (!appA.value || !appB.value) return 'Compare Software | Moonmart'
  return `${appA.value.name} vs ${appB.value.name} ${year} — Features, Pricing & Reviews | Moonmart`
})
const description = computed(() => {
  if (!appA.value || !appB.value) return 'Compare SaaS tools side-by-side on Moonmart.'
  return `Compare ${appA.value.name} vs ${appB.value.name}: features, pricing, reviews and ratings. Find out which is best for your team in ${year}.`
})
const canonical = computed(() => `https://moonmart.ai/compare/${slug.value}`)

// ── Schema ─────────────────────────────────────────────────────────────────
const schema = computed(() => {
  if (!appA.value || !appB.value) return null
  const makeApp = (app: AppData) => ({
    '@type': 'SoftwareApplication',
    name: app.name,
    applicationCategory: app.category || 'BusinessApplication',
    description: app.description,
    aggregateRating: app.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: app.rating,
      reviewCount: app.reviewCount,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    offers: {
      '@type': 'Offer',
      price: app.pricing.value || 0,
      priceCurrency: 'USD',
      priceValidUntil: `${year + 1}-12-31`,
      availability: 'https://schema.org/InStock'
    }
  })

  const faqs = [
    { '@type': 'Question', name: `What is the difference between ${appA.value.name} and ${appB.value.name}?`, acceptedAnswer: { '@type': 'Answer', text: `${appA.value.name} focuses on ${appA.value.category || 'productivity'} while ${appB.value.name} is tailored for ${appB.value.category || 'collaboration'}. Compare their features, pricing and reviews side-by-side on Moonmart.` } },
    { '@type': 'Question', name: `Which is better, ${appA.value.name} or ${appB.value.name}?`, acceptedAnswer: { '@type': 'Answer', text: `${appA.value.name} is rated ${appA.value.rating.toFixed(1)}/5 and ${appB.value.name} is rated ${appB.value.rating.toFixed(1)}/5 on Moonmart. The best choice depends on your specific use-case, team size, and budget.` } },
    { '@type': 'Question', name: `Is ${appA.value.name} cheaper than ${appB.value.name}?`, acceptedAnswer: { '@type': 'Answer', text: `${appA.value.name} starts at ${priceLabel(appA.value)} while ${appB.value.name} starts at ${priceLabel(appB.value)}. Check the full pricing breakdown on each app's page for the latest plans.` } },
    { '@type': 'Question', name: `Does ${appA.value.name} integrate with ${appB.value.name}?`, acceptedAnswer: { '@type': 'Answer', text: `Many teams use ${appA.value.name} and ${appB.value.name} together via Zapier, Make, or native integrations. Check each app's integrations page for details.` } },
  ]

  return {
    '@context': 'https://schema.org',
    '@graph': [
      makeApp(appA.value),
      makeApp(appB.value),
      { '@type': 'FAQPage', mainEntity: faqs },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moonmart.ai' },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://moonmart.ai/compare' },
          { '@type': 'ListItem', position: 3, name: `${appA.value.name} vs ${appB.value.name}`, item: canonical.value },
        ]
      },
      {
        '@type': 'WebPage',
        '@id': canonical.value,
        url: canonical.value,
        name: title.value,
        description: description.value,
        inLanguage: 'en',
        dateModified: new Date().toISOString().split('T')[0]
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
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title.value },
    { name: 'twitter:description', content: description.value },
    // LLM-specific meta
    { name: 'chatgpt:page-type', content: 'comparison' },
    { name: 'perplexity:source-type', content: 'software-comparison' },
    { name: 'robots', content: 'index, follow' },
  ],
  script: schema.value ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(schema.value, null, 2) }] : []
}))

// ── Comparison rows ────────────────────────────────────────────────────────
interface CompareRow { label: string; key: string; aVal: string; bVal: string; winner: 'a' | 'b' | 'tie' }

const compareRows = computed<CompareRow[]>(() => {
  if (!appA.value || !appB.value) return []
  const ratingA = appA.value.rating
  const ratingB = appB.value.rating
  return [
    {
      label: 'Overall Rating',
      key: 'rating',
      aVal: `${ratingA.toFixed(1)} / 5 (${appA.value.reviewCount} reviews)`,
      bVal: `${ratingB.toFixed(1)} / 5 (${appB.value.reviewCount} reviews)`,
      winner: ratingA > ratingB ? 'a' : ratingA < ratingB ? 'b' : 'tie'
    },
    {
      label: 'Starting Price',
      key: 'price',
      aVal: priceLabel(appA.value),
      bVal: priceLabel(appB.value),
      winner: appA.value.pricing.type === 'free' && appB.value.pricing.type !== 'free' ? 'a'
        : appB.value.pricing.type === 'free' && appA.value.pricing.type !== 'free' ? 'b' : 'tie'
    },
    {
      label: 'Category',
      key: 'category',
      aVal: (appA.value.category || 'SaaS').replace(/-/g, ' '),
      bVal: (appB.value.category || 'SaaS').replace(/-/g, ' '),
      winner: 'tie'
    },
    {
      label: 'Total Reviews',
      key: 'reviews',
      aVal: appA.value.reviewCount.toLocaleString(),
      bVal: appB.value.reviewCount.toLocaleString(),
      winner: appA.value.reviewCount > appB.value.reviewCount ? 'a' : appA.value.reviewCount < appB.value.reviewCount ? 'b' : 'tie'
    },
    {
      label: 'Security Certifications',
      key: 'security',
      aVal: appA.value.security?.certifications?.join(', ') || 'Not listed',
      bVal: appB.value.security?.certifications?.join(', ') || 'Not listed',
      winner: 'tie'
    },
    {
      label: 'Uptime SLA',
      key: 'uptime',
      aVal: appA.value.performance?.uptime ? `${appA.value.performance.uptime}%` : 'Not listed',
      bVal: appB.value.performance?.uptime ? `${appB.value.performance.uptime}%` : 'Not listed',
      winner: (appA.value.performance?.uptime || 0) > (appB.value.performance?.uptime || 0) ? 'a'
        : (appA.value.performance?.uptime || 0) < (appB.value.performance?.uptime || 0) ? 'b' : 'tie'
    },
  ]
})

const faqItems = computed(() => {
  if (!appA.value || !appB.value) return []
  return [
    { q: `What is the difference between ${appA.value.name} and ${appB.value.name}?`, a: `${appA.value.name} focuses on ${appA.value.category || 'productivity'} while ${appB.value.name} is built for ${appB.value.category || 'collaboration'}. Both are top-rated tools with different strengths. Read the full comparison above to see which fits your workflow.` },
    { q: `Which is better: ${appA.value.name} or ${appB.value.name}?`, a: `${appA.value.name} is rated ${appA.value.rating.toFixed(1)}/5 vs ${appB.value.name} at ${appB.value.rating.toFixed(1)}/5 on Moonmart. The best tool depends on your team's needs, budget, and existing tech stack.` },
    { q: `Is ${appA.value.name} cheaper than ${appB.value.name}?`, a: `${appA.value.name} starts at ${priceLabel(appA.value)} and ${appB.value.name} at ${priceLabel(appB.value)}. Always check the vendor's pricing page for the latest plan details.` },
    { q: `Can I migrate from ${appA.value.name} to ${appB.value.name}?`, a: `Yes, most modern SaaS tools offer data export. Check ${appA.value.name}'s export settings and ${appB.value.name}'s import guide for step-by-step migration instructions.` },
  ]
})
</script>

<template>
  <div class="compare-page min-h-screen bg-gray-50">
    <!-- 404 state -->
    <div v-if="notFound" class="max-w-2xl mx-auto py-24 text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Comparison Not Found</h1>
      <p class="text-gray-600 mb-6">We couldn't find both apps for this comparison. Try searching for specific tools.</p>
      <NuxtLink to="/compare" class="inline-block bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600">Compare Tools</NuxtLink>
    </div>

    <template v-else-if="appA && appB">
      <!-- Hero section -->
      <section class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-4 py-10">
          <!-- Breadcrumb -->
          <nav class="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <NuxtLink to="/" class="hover:text-orange-500">Home</NuxtLink>
            <span class="mx-2">›</span>
            <NuxtLink to="/compare" class="hover:text-orange-500">Compare</NuxtLink>
            <span class="mx-2">›</span>
            <span class="text-gray-800">{{ appA.name }} vs {{ appB.name }}</span>
          </nav>

          <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            {{ appA.name }} vs {{ appB.name }}
            <span class="text-gray-400 font-normal">{{ year }}</span>
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl">{{ description }}</p>

          <!-- App header cards -->
          <div class="grid grid-cols-2 gap-6 mt-8">
            <!-- App A -->
            <div class="bg-gray-50 rounded-md p-6 border border-gray-200">
              <div class="flex items-center gap-3 mb-3">
                <img v-if="appA.logo" :src="appA.logo" :alt="appA.name + ' logo'" class="w-12 h-12 rounded-md object-contain border border-gray-200 bg-white p-1">
                <div v-else class="w-12 h-12 rounded-md bg-orange-100 flex items-center justify-center">
                  <span class="text-orange-600 font-bold text-lg">{{ appA.name[0] }}</span>
                </div>
                <div>
                  <h2 class="font-bold text-xl text-gray-900">{{ appA.name }}</h2>
                  <p v-if="appA.provider" class="text-sm text-gray-500">by {{ appA.provider }}</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ appA.description }}</p>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-yellow-500 font-bold">★ {{ appA.rating.toFixed(1) }}</span>
                <span class="text-gray-400">({{ appA.reviewCount }} reviews)</span>
              </div>
              <div class="mt-3">
                <span class="inline-block bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">{{ priceLabel(appA) }}</span>
              </div>
              <NuxtLink :to="`/marketplace/app/${appA.slug || appA.id}`" class="mt-4 block text-center bg-orange-500 text-white text-sm font-semibold py-2 rounded-md hover:bg-orange-600">
                View {{ appA.name }}
              </NuxtLink>
            </div>

            <!-- App B -->
            <div class="bg-gray-50 rounded-md p-6 border border-gray-200">
              <div class="flex items-center gap-3 mb-3">
                <img v-if="appB.logo" :src="appB.logo" :alt="appB.name + ' logo'" class="w-12 h-12 rounded-md object-contain border border-gray-200 bg-white p-1">
                <div v-else class="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center">
                  <span class="text-blue-600 font-bold text-lg">{{ appB.name[0] }}</span>
                </div>
                <div>
                  <h2 class="font-bold text-xl text-gray-900">{{ appB.name }}</h2>
                  <p v-if="appB.provider" class="text-sm text-gray-500">by {{ appB.provider }}</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ appB.description }}</p>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-yellow-500 font-bold">★ {{ appB.rating.toFixed(1) }}</span>
                <span class="text-gray-400">({{ appB.reviewCount }} reviews)</span>
              </div>
              <div class="mt-3">
                <span class="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{{ priceLabel(appB) }}</span>
              </div>
              <NuxtLink :to="`/marketplace/app/${appB.slug || appB.id}`" class="mt-4 block text-center bg-blue-600 text-white text-sm font-semibold py-2 rounded-md hover:bg-blue-700">
                View {{ appB.name }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Comparison table -->
      <section class="max-w-6xl mx-auto px-4 py-10">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ appA.name }} vs {{ appB.name }} — Side-by-Side Comparison</h2>
        <div class="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-5 py-3 text-gray-500 font-semibold w-1/4">Feature</th>
                <th class="text-center px-5 py-3 text-gray-900 font-bold w-3/8">{{ appA.name }}</th>
                <th class="text-center px-5 py-3 text-gray-900 font-bold w-3/8">{{ appB.name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in compareRows"
                :key="row.key"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="px-5 py-3 text-gray-600 font-medium">{{ row.label }}</td>
                <td class="px-5 py-3 text-center">
                  <span :class="row.winner === 'a' ? 'text-green-700 font-bold' : 'text-gray-700'">
                    {{ row.aVal }}
                    <span v-if="row.winner === 'a'" class="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Winner</span>
                  </span>
                </td>
                <td class="px-5 py-3 text-center">
                  <span :class="row.winner === 'b' ? 'text-green-700 font-bold' : 'text-gray-700'">
                    {{ row.bVal }}
                    <span v-if="row.winner === 'b'" class="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Winner</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Verdict section -->
      <section class="max-w-6xl mx-auto px-4 pb-10">
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-white rounded-md border border-gray-200 p-6">
            <h3 class="font-bold text-gray-900 text-lg mb-2">Choose {{ appA.name }} if…</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex gap-2"><span class="text-green-500">✓</span> You prioritize <strong>{{ (appA.category || 'productivity').replace(/-/g, ' ') }}</strong> features</li>
              <li class="flex gap-2"><span class="text-green-500">✓</span> Your team loves a rating of {{ appA.rating.toFixed(1) }}/5</li>
              <li class="flex gap-2"><span class="text-green-500">✓</span> Budget: {{ priceLabel(appA) }}</li>
            </ul>
            <NuxtLink :to="`/marketplace/app/${appA.slug || appA.id}`" class="mt-4 block text-center border border-orange-500 text-orange-600 text-sm font-semibold py-2 rounded-md hover:bg-orange-50">
              Try {{ appA.name }} Free
            </NuxtLink>
          </div>
          <div class="bg-white rounded-md border border-gray-200 p-6">
            <h3 class="font-bold text-gray-900 text-lg mb-2">Choose {{ appB.name }} if…</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex gap-2"><span class="text-green-500">✓</span> You prioritize <strong>{{ (appB.category || 'collaboration').replace(/-/g, ' ') }}</strong> features</li>
              <li class="flex gap-2"><span class="text-green-500">✓</span> Your team loves a rating of {{ appB.rating.toFixed(1) }}/5</li>
              <li class="flex gap-2"><span class="text-green-500">✓</span> Budget: {{ priceLabel(appB) }}</li>
            </ul>
            <NuxtLink :to="`/marketplace/app/${appB.slug || appB.id}`" class="mt-4 block text-center border border-blue-500 text-blue-600 text-sm font-semibold py-2 rounded-md hover:bg-blue-50">
              Try {{ appB.name }} Free
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Related comparisons & alternatives -->
      <section class="max-w-6xl mx-auto px-4 pb-10">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Related Comparisons &amp; Alternatives</h2>
        <div class="flex flex-wrap gap-3">
          <NuxtLink :to="`/alternatives/${appA.slug || appA.id}`" class="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 hover:border-orange-400 hover:text-orange-600">
            Best alternatives to {{ appA.name }}
          </NuxtLink>
          <NuxtLink :to="`/alternatives/${appB.slug || appB.id}`" class="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 hover:border-orange-400 hover:text-orange-600">
            Best alternatives to {{ appB.name }}
          </NuxtLink>
          <NuxtLink :to="`/pricing/${appA.slug || appA.id}`" class="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 hover:border-orange-400 hover:text-orange-600">
            {{ appA.name }} Pricing {{ year }}
          </NuxtLink>
          <NuxtLink :to="`/pricing/${appB.slug || appB.id}`" class="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 hover:border-orange-400 hover:text-orange-600">
            {{ appB.name }} Pricing {{ year }}
          </NuxtLink>
        </div>
      </section>

      <!-- FAQ section — full LLM optimised -->
      <section class="max-w-6xl mx-auto px-4 pb-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ appA.name }} vs {{ appB.name }} — Frequently Asked Questions</h2>
        <div class="space-y-4">
          <details
            v-for="(item, i) in faqItems"
            :key="i"
            class="bg-white rounded-md border border-gray-200 px-5 py-4 group"
          >
            <summary class="font-semibold text-gray-800 cursor-pointer list-none flex justify-between items-center">
              {{ item.q }}
              <span class="text-gray-400 group-open:rotate-180 transition-transform text-lg ml-4">▾</span>
            </summary>
            <p class="mt-3 text-gray-600 text-sm leading-relaxed">{{ item.a }}</p>
          </details>
        </div>
      </section>
    </template>
  </div>
</template>
