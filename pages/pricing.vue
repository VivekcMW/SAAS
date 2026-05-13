<template>
  <main class="mk-page">
    <!-- PPP regional pricing banner -->
    <div v-if="ppp?.eligible" class="mk-ppp-banner">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
      Prices below are adjusted for {{ ppp.name }} — <strong>up to {{ ppp.discountPct }}% off</strong> standard USD pricing.
      <a href="mailto:hello@moonmart.ai?subject=PPP+pricing+request" class="mk-ppp-banner__link">Questions? Contact us →</a>
    </div>

    <!-- Hero -->
    <section class="mk-hero">
      <div class="mk-hero__inner">
        <p class="mk-eyebrow">Pricing</p>
        <h1 class="mk-hero__title">Simple pricing for buyers and vendors</h1>
        <p class="mk-hero__lede">
          Moonmart is free for teams searching for software. Vendors pay only when the
          marketplace drives real pipeline.
        </p>

        <div class="mk-toggle">
          <button
            v-for="c in cycles"
            :key="c.id"
            :class="['mk-toggle__btn', { 'is-active': cycle === c.id }]"
            @click="cycle = c.id"
          >
            {{ c.label }}
            <span v-if="c.note" class="mk-toggle__note">{{ c.note }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Buyer plans -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">For software buyers</h2>
        <p class="mk-section__lede">
          Always free. Forever. We're paid by vendors, not by you.
        </p>
        <div class="mk-plans">
          <article v-for="p in buyerPlans" :key="p.name" :class="['mk-plan', { 'is-featured': p.featured }]">
            <p class="mk-plan__eyebrow">{{ p.eyebrow }}</p>
            <h3 class="mk-plan__name">{{ p.name }}</h3>
            <p class="mk-plan__price">{{ currentPrice(p) }}<span v-if="p.unit">{{ p.unit }}</span></p>
            <p class="mk-plan__desc">{{ p.desc }}</p>
            <ul class="mk-plan__list">
              <li v-for="f in p.features" :key="f">{{ f }}</li>
            </ul>
            <NuxtLink :to="p.cta.to" :class="['mk-btn', p.featured ? 'mk-btn--primary' : 'mk-btn--ghost']">
              {{ p.cta.label }}
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <!-- Vendor plans -->
    <section class="mk-section mk-section--soft">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">For vendors</h2>
        <p class="mk-section__lede">
          Lead-generation pricing. Pay per qualified lead, or upgrade for deeper placement.
        </p>
        <div class="mk-plans">
          <article v-for="p in vendorPlans" :key="p.name" :class="['mk-plan', { 'is-featured': p.featured }]">
            <p v-if="p.featured" class="mk-plan__badge">Most popular</p>
            <p class="mk-plan__eyebrow">{{ p.eyebrow }}</p>
            <h3 class="mk-plan__name">{{ p.name }}</h3>
            <p class="mk-plan__price">
              {{ currentPrice(p) }}<span v-if="p.unit">{{ p.unit }}</span>
            </p>
            <p class="mk-plan__desc">{{ p.desc }}</p>
            <ul class="mk-plan__list">
              <li v-for="f in p.features" :key="f">{{ f }}</li>
            </ul>
            <NuxtLink :to="p.cta.to" :class="['mk-btn', p.featured ? 'mk-btn--primary' : 'mk-btn--ghost']">
              {{ p.cta.label }}
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <!-- Compare table -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">Compare vendor plans</h2>
        <p class="mk-section__lede">Every vendor plan, side-by-side. No footnotes, no surprises.</p>
        <div class="cmp-wrap">
          <table class="cmp">
            <thead>
              <tr>
                <th scope="col" class="cmp__th cmp__th--feature">Feature</th>
                <th scope="col" class="cmp__th cmp__th--plan">Starter</th>
                <th scope="col" class="cmp__th cmp__th--plan cmp__th--featured"><span class="cmp__pill">Growth</span></th>
                <th scope="col" class="cmp__th cmp__th--plan">Scale</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in compareRows" :key="row.label">
                <th scope="row">{{ row.label }}</th>
                <td>
                  <span v-if="row.starter === '✓'" class="cmp__yes" aria-label="Included">✓</span>
                  <span v-else-if="row.starter === '—'" class="cmp__no" aria-label="Not included">—</span>
                  <span v-else>{{ row.starter }}</span>
                </td>
                <td class="cmp__featured">
                  <span v-if="row.growth === '✓'" class="cmp__yes" aria-label="Included">✓</span>
                  <span v-else-if="row.growth === '—'" class="cmp__no" aria-label="Not included">—</span>
                  <span v-else>{{ row.growth }}</span>
                </td>
                <td>
                  <span v-if="row.scale === '✓'" class="cmp__yes" aria-label="Included">✓</span>
                  <span v-else-if="row.scale === '—'" class="cmp__no" aria-label="Not included">—</span>
                  <span v-else>{{ row.scale }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mk-section mk-section--soft">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">Pricing FAQ</h2>
        <div class="mk-faq">
          <details v-for="q in faqs" :key="q.q" class="mk-faq__item">
            <summary>{{ q.q }}</summary>
            <p>{{ q.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="mk-cta">
      <div class="mk-cta__inner">
        <h2 class="mk-cta__title">Ready to list your product?</h2>
        <p class="mk-cta__lede">Start free. Upgrade when you see the pipeline.</p>
        <div class="mk-cta__row">
          <NuxtLink to="/list-product" class="mk-btn mk-btn--primary">List your product</NuxtLink>
          <NuxtLink to="/demo" class="mk-btn mk-btn--ghost">Book a demo</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { applySEO } = useSEO()
const { formatPrice, formatPppPrice } = useCurrency()

// PPP regional pricing
interface PppInfo { country: string; name: string; multiplier: number; eligible: boolean; discountPct: number }
const ppp = ref<PppInfo | null>(null)
onMounted(async () => {
  try {
    const country = (await $fetch<{ country: string }>('/api/geo')).country
    if (country) ppp.value = await $fetch<PppInfo>(`/api/ppp?country=${country}`)
  } catch { /* ignore — geo or ppp may be unavailable */ }
})

applySEO({
  title: 'Pricing | Moonmart',
  description: 'Free for software buyers, fair lead-based pricing for vendors. See plans for Starter, Growth and Scale.',
  canonical: 'https://moonmart.ai/pricing',
  ogType: 'website'
})

useHead({
  meta: [
    { property: 'og:image', content: '/api/og/page?title=Moonmart+Pricing&sub=Free+for+buyers%2C+fair+pricing+for+vendors&label=Pricing' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: '/api/og/page?title=Moonmart+Pricing&sub=Free+for+buyers%2C+fair+pricing+for+vendors&label=Pricing' }
  ]
})

const cycles = [
  { id: 'monthly', label: 'Monthly', note: '' },
  { id: 'annual', label: 'Annual', note: 'Save 20%' }
]
const cycle = ref('monthly')

type DbPlan = {
  plan_key: string
  display_name: string
  price_monthly: number
  price_annual: number
  features: string[]
}

const { data: buyerDbPlans } = await useFetch<DbPlan[]>('/api/billing/plans', { query: { audience: 'buyer' } })
const { data: vendorDbPlans } = await useFetch<DbPlan[]>('/api/billing/plans', { query: { audience: 'vendor' } })

function fmtPrice (amount: number | null | undefined): string {
  if (!amount) return formatPrice(0)
  return ppp.value?.eligible ? formatPppPrice(amount) : formatPrice(amount)
}

const buyerPlans = computed(() => {
  const freePlan = buyerDbPlans.value?.find(p => p.plan_key === 'buyer-free')
  const proPlan = buyerDbPlans.value?.find(p => p.plan_key === 'buyer-pro')
  return [
    {
      eyebrow: 'Buyer', name: 'Free',
      priceMonthly: '$0', priceAnnual: '$0', unit: '/forever',
      desc: 'Everything you need to find and compare SaaS tools.',
      features: freePlan?.features?.length ? freePlan.features : ['Unlimited searches', 'Compare up to 5 tools', 'Read verified reviews', 'Shortlists & notes', 'Community Q&A'],
      cta: { label: 'Create free account', to: '/signup' }, featured: false
    },
    {
      eyebrow: 'Buyer · Pro', name: proPlan?.display_name ?? 'Buyer Pro',
      priceMonthly: proPlan ? fmtPrice(proPlan.price_monthly) : '$29',
      priceAnnual: proPlan ? fmtPrice(proPlan.price_annual) : '$23',
      unit: '/user/mo',
      desc: 'For RevOps, IT and procurement teams managing a large stack.',
      features: proPlan?.features?.length ? proPlan.features : ['Stack inventory & renewals', 'Team shortlists', 'Contract repository', 'Private Q&A threads', 'Priority support'],
      cta: { label: 'Start 14-day trial', to: '/signup?plan=buyer-pro' }, featured: true
    }
  ]
})

const vendorPlans = computed(() => {
  const freePlan = vendorDbPlans.value?.find(p => p.plan_key === 'vendor-free')
  const growthPlan = vendorDbPlans.value?.find(p => p.plan_key === 'vendor-growth')
  return [
    {
      eyebrow: 'Vendor', name: freePlan?.display_name ?? 'Starter',
      priceMonthly: '$0', priceAnnual: '$0', unit: '/mo',
      desc: 'Get found. Pay only for qualified leads you accept.',
      features: freePlan?.features?.length ? freePlan.features : ['Free listing page', 'Basic analytics', '$99 per accepted lead', 'Respond to reviews', 'Email support'],
      cta: { label: 'List for free', to: '/list-product' }, featured: false
    },
    {
      eyebrow: 'Vendor', name: growthPlan?.display_name ?? 'Growth',
      priceMonthly: growthPlan ? fmtPrice(growthPlan.price_monthly) : '$499',
      priceAnnual: growthPlan ? fmtPrice(growthPlan.price_annual) : '$399',
      unit: '/mo',
      desc: 'For vendors with strong PMF that want deeper placement.',
      features: growthPlan?.features?.length ? growthPlan.features : ['Everything in Starter', 'Category boost & sidebar ads', 'Advanced lead scoring', 'Competitor insights', '$59 per accepted lead', 'Slack + email support'],
      cta: { label: 'Start Growth', to: '/list-product?plan=growth' }, featured: true
    },
    {
      eyebrow: 'Vendor', name: 'Scale', priceMonthly: 'Custom', priceAnnual: 'Custom', unit: '',
      desc: 'For category leaders that want premium distribution and partnerships.',
      features: ['Everything in Growth', 'Homepage placements', 'Co-marketing & webinars', 'Dedicated CSM', 'SLA & MSA options', 'Volume lead pricing'],
      cta: { label: 'Talk to sales', to: '/demo' }, featured: false
    }
  ]
})

function currentPrice (p: { priceMonthly: string; priceAnnual: string }) {
  return cycle.value === 'annual' ? p.priceAnnual : p.priceMonthly
}

const compareRows = [
  { label: 'Listing page', starter: '✓', growth: '✓', scale: '✓' },
  { label: 'Review replies', starter: '✓', growth: '✓', scale: '✓' },
  { label: 'Cost per accepted lead', starter: '$99', growth: '$59', scale: 'Volume' },
  { label: 'Category boost', starter: '—', growth: '✓', scale: '✓' },
  { label: 'Homepage placements', starter: '—', growth: '—', scale: '✓' },
  { label: 'Lead scoring & enrichment', starter: 'Basic', growth: 'Advanced', scale: 'Advanced+' },
  { label: 'Competitor insights', starter: '—', growth: '✓', scale: '✓' },
  { label: 'Co-marketing programs', starter: '—', growth: '—', scale: '✓' },
  { label: 'Support', starter: 'Email', growth: 'Slack + email', scale: 'Dedicated CSM' },
  { label: 'Contract', starter: 'Self-serve', growth: 'Self-serve', scale: 'MSA / SLA' }
]

const faqs = [
  { q: 'Is it really free for buyers?', a: 'Yes. Individual users and entire buying teams use Moonmart for free. Our revenue comes from vendor subscriptions and accepted leads, not from buyers.' },
  { q: 'How are "accepted leads" defined?', a: 'A lead is accepted when the vendor confirms it fits their ICP within 10 business days. Rejected or duplicate leads are never charged.' },
  { q: 'Can I switch plans mid-term?', a: 'Yes. Upgrade at any time and we prorate the difference. Downgrades take effect at the end of the current billing period.' },
  { q: 'Do you offer annual billing?', a: 'Yes — save 20% when you pay annually. Enterprise agreements are also available via our Scale plan.' },
  { q: 'What about refunds?', a: 'See our full refund policy at /refund. EU/UK consumers enjoy a 14-day cooling-off period.' },
  { q: 'Do you charge for reviews?', a: 'No. Reviews are free to publish and respond to. Buying reviews is strictly prohibited under our Acceptable Use policy.' }
]
</script>

<style scoped>
/* Pricing-specific tweaks (shared mk-* classes live in assets/css/marketing.css) */

.mk-ppp-banner { display: flex; align-items: center; gap: 0.5rem; background: #fef9e7; border-bottom: 1px solid #f59e0b; padding: 0.6rem 1.5rem; font-size: 0.85rem; color: #92400e; flex-wrap: wrap; }
.mk-ppp-banner__link { margin-left: 0.25rem; color: #b45309; font-weight: 600; text-decoration: none; }
.mk-ppp-banner__link:hover { text-decoration: underline; }

.mk-toggle { display: inline-flex; background: var(--mm-s2); border: 0.5px solid var(--b1); border-radius: var(--r-full); padding: 0.25rem; }
.mk-toggle__btn { background: transparent; border: none; padding: 0.5rem 1.1rem; border-radius: var(--r-sm); font-weight: 600; color: var(--mm-slate); cursor: pointer; font-size: 0.9rem; }
.mk-toggle__btn.is-active { background: var(--mm-gold); color: #0A0700; }
.mk-toggle__note { margin-left: 0.4rem; font-size: 0.72rem; font-weight: 700; }

/* Plans */
.mk-plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; max-width: 1100px; margin: 0 auto; }
.mk-plan { position: relative; background: var(--mm-s2); border: 0.5px solid var(--b1); border-radius: var(--r-xl); padding: 1.75rem 1.5rem; display: flex; flex-direction: column; }
.mk-plan.is-featured { border-color: var(--mm-gold); box-shadow: 0 12px 30px -18px var(--mm-gold-soft); }
.mk-plan__badge { position: absolute; top: -0.7rem; left: 50%; transform: translateX(-50%); background: var(--mm-gold); color: #0A0700; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.3rem 0.7rem; border-radius: var(--r-full); margin: 0; }
.mk-plan__eyebrow { color: var(--mm-gold); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 0.5rem; }
.mk-plan__name { font-family: var(--f-display); font-size: 1.25rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 0.5rem; }
.mk-plan__price { font-family: var(--f-display); font-size: 2rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 0.5rem; }
.mk-plan__price span { font-size: 0.85rem; font-weight: 500; color: var(--mm-slate); margin-left: 0.25rem; }
.mk-plan__desc { color: var(--mm-silver); font-size: 0.9rem; line-height: 1.55; margin: 0 0 1.25rem; }
.mk-plan__list { list-style: none; padding: 0; margin: 0 0 1.5rem; flex: 1; }
.mk-plan__list li { padding: 0.45rem 0 0.45rem 1.5rem; position: relative; color: var(--mm-silver); font-size: 0.9rem; line-height: 1.5; }
.mk-plan__list li::before { content: '✓'; position: absolute; left: 0; top: 0.45rem; color: var(--mm-gold); font-weight: 700; }

/* Compare vendor plans table */
.cmp-wrap {
  width: 100%;
  margin: 2rem 0 0;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-xl);
  overflow-x: auto;
}
.cmp {
  width: 100%;
  display: table;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.95rem;
  overflow-x: visible;
}
.cmp__th--feature { width: 40%; }
.cmp__th--plan { width: 20%; }

.cmp thead th {
  background: var(--mm-s3);
  padding: 1rem 1.25rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--mm-slate);
  text-align: center;
  border-bottom: 0.5px solid var(--b1);
}
.cmp thead th:first-child { text-align: left; }

.cmp__pill {
  display: inline-block;
  background: var(--mm-gold);
  color: #0A0700;
  padding: 0.3rem 0.75rem;
  border-radius: var(--r-full);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
}

.cmp tbody th,
.cmp tbody td {
  padding: 0.95rem 1.25rem;
  border-top: 0.5px solid var(--b1);
  vertical-align: middle;
}
.cmp tbody th {
  text-align: left;
  font-weight: 600;
  color: var(--mm-pearl);
  background: var(--mm-s2);
}
.cmp tbody td {
  text-align: center;
  color: var(--mm-silver);
}
.cmp tbody tr:hover th,
.cmp tbody tr:hover td { background: var(--mm-s3); }

.cmp__featured { background: var(--mm-gold-soft); }
.cmp tbody tr:hover .cmp__featured { background: rgba(212,168,67,.18); }

.cmp__yes { color: var(--mm-gold); font-weight: 700; font-size: 1.05rem; }
.cmp__no { color: var(--mm-slate); font-weight: 500; }

@media (max-width: 720px) {
  .cmp-wrap { overflow-x: auto; }
  .cmp { min-width: 620px; }
  .cmp thead th,
  .cmp tbody th,
  .cmp tbody td { padding: 0.75rem 0.85rem; font-size: 0.88rem; }
}
</style>
