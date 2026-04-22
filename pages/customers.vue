<template>
  <main class="mk-page">
    <section class="mk-hero">
      <div class="mk-hero__inner">
        <p class="mk-eyebrow">Customer stories</p>
        <h1 class="mk-hero__title">How teams buy smarter with SaaSWorld</h1>
        <p class="mk-hero__lede">
          Real stories from RevOps, IT and founders who replaced spreadsheets, vendor
          calls and gut feel with a single buying workflow.
        </p>
        <div class="mk-hero__cta">
          <NuxtLink to="/demo" class="mk-btn mk-btn--primary">Become the next story</NuxtLink>
          <NuxtLink to="/marketplace" class="mk-btn mk-btn--ghost">Explore marketplace</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stats band -->
    <section class="mk-section cs-stats-section">
      <div class="mk-section__inner cs-stats">
        <div v-for="s in stats" :key="s.label" class="cs-stat">
          <p class="cs-stat__num">{{ s.num }}</p>
          <p class="cs-stat__label">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- Featured -->
    <section class="mk-section mk-section--soft">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">Featured stories</h2>
        <div class="cs-grid">
          <article v-for="story in featured" :key="story.slug" class="cs-card">
            <div class="cs-card__head">
              <span class="mk-tag">{{ story.industry }}</span>
              <span class="cs-card__size">{{ story.size }}</span>
            </div>
            <h3 class="cs-card__title">{{ story.title }}</h3>
            <p class="cs-card__quote">"{{ story.quote }}"</p>
            <p class="cs-card__attr">— {{ story.author }}, {{ story.role }} @ {{ story.company }}</p>
            <ul class="cs-card__kpis">
              <li v-for="k in story.kpis" :key="k">{{ k }}</li>
            </ul>
            <NuxtLink :to="`/customers/${story.slug}`" class="cs-card__link">Read the story →</NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <!-- Browse by -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">Browse stories</h2>
        <div class="cs-filters">
          <button
            v-for="f in filters"
            :key="f.id"
            :class="['cs-filter', { 'is-active': activeFilter === f.id }]"
            @click="activeFilter = f.id"
          >{{ f.label }}</button>
        </div>
        <div class="mk-grid">
          <NuxtLink v-for="s in filteredAll" :key="s.slug" :to="`/customers/${s.slug}`" class="mk-card mk-card--link">
            <p class="mk-card__eyebrow">{{ s.industry }}</p>
            <h3 class="mk-card__title">{{ s.company }}</h3>
            <p class="mk-card__desc">{{ s.summary }}</p>
            <span class="mk-card__link">Read story →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mk-cta">
      <div class="mk-cta__inner">
        <h2 class="mk-cta__title">Want your story featured?</h2>
        <p class="mk-cta__lede">If SaaSWorld changed how your team buys software, we'd love to hear about it.</p>
        <div class="mk-cta__row">
          <NuxtLink to="/contact?subject=case-study" class="mk-btn mk-btn--primary">Share your story</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { applySEO } = useSEO()
applySEO({
  title: 'Customer stories | SaaSWorld',
  description: 'Real stories from teams that replaced vendor calls and spreadsheets with SaaSWorld.',
  canonical: 'https://saasworld.com/customers',
  ogType: 'website'
})

const stats = [
  { num: '40k+', label: 'Buying teams onboarded' },
  { num: '2.8x', label: 'Faster vendor shortlisting' },
  { num: '$18M', label: 'Contract savings negotiated' },
  { num: '92%', label: 'Would recommend to a peer' }
]

const featured = [
  {
    slug: 'atlas-robotics', company: 'Atlas Robotics', industry: 'Manufacturing', size: '450 employees',
    title: 'Cut vendor evaluation from 11 weeks to 18 days',
    quote: 'SaaSWorld replaced a messy spreadsheet and three Slack threads. We shipped a new CRM in under a month.',
    author: 'Priya Rao', role: 'VP RevOps',
    kpis: ['73% faster evaluations', '$240k saved on CRM deal', 'SOC 2 evidence in one click']
  },
  {
    slug: 'mercury-market', company: 'Mercury Market', industry: 'E-commerce', size: '120 employees',
    title: 'Replaced 6 point solutions with a unified stack',
    quote: 'The comparison pages saved our team 40 hours a month. Our CFO now actually trusts the tool cost forecast.',
    author: 'Tom Becker', role: 'Head of IT',
    kpis: ['6 tools → 1 stack', '$95k/yr license savings', '4.9/5 internal NPS']
  },
  {
    slug: 'northwind-health', company: 'Northwind Health', industry: 'Healthcare', size: '900 employees',
    title: 'Passed HIPAA audit with SaaSWorld as vendor registry',
    quote: 'Having every subprocessor, DPA and SOC 2 in one place turned a 6-week audit prep into a week.',
    author: 'Dr. Lina Osei', role: 'CIO',
    kpis: ['83% audit prep reduction', '100% DPA coverage', '12 shadow-IT apps retired']
  }
]

const allStories = [
  ...featured.map(f => ({ slug: f.slug, company: f.company, industry: f.industry, summary: f.title, tag: f.industry.toLowerCase() })),
  { slug: 'lumen-labs', company: 'Lumen Labs', industry: 'Fintech', summary: 'How a Series B fintech built a compliant SaaS stack from scratch.', tag: 'fintech' },
  { slug: 'beacon-edu', company: 'Beacon Education', industry: 'Education', summary: 'Consolidating 11 district tools into a single procurement workflow.', tag: 'education' },
  { slug: 'voyager-agency', company: 'Voyager Agency', industry: 'Agency', summary: 'Standardising the creative stack for 80 freelancers across 3 continents.', tag: 'agency' },
  { slug: 'orbit-logistics', company: 'Orbit Logistics', industry: 'Manufacturing', summary: 'Cutting renewal surprises with automated contract tracking.', tag: 'manufacturing' },
  { slug: 'pixel-saas', company: 'Pixel SaaS', industry: 'SaaS', summary: 'A 40-person startup\'s honest vendor-selection playbook.', tag: 'saas' },
  { slug: 'wavefront-ai', company: 'Wavefront AI', industry: 'AI', summary: 'Evaluating AI vendors with a repeatable privacy & security scorecard.', tag: 'ai' }
]

const filters = [
  { id: 'all', label: 'All stories' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'fintech', label: 'Fintech' },
  { id: 'saas', label: 'SaaS' },
  { id: 'education', label: 'Education' }
]
const activeFilter = ref('all')

const filteredAll = computed(() => {
  if (activeFilter.value === 'all') return allStories
  return allStories.filter(s => s.tag === activeFilter.value || s.industry.toLowerCase() === activeFilter.value || s.industry.toLowerCase().includes(activeFilter.value))
})
</script>

<style scoped>
/* Stats band */
.cs-stats-section { padding-top: 3rem; padding-bottom: 3rem; }
.cs-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; text-align: center; }
.cs-stat { padding: 1.25rem 1rem; }
.cs-stat__num { font-family: var(--font-heading, 'Poppins', system-ui, sans-serif); font-size: 2.25rem; font-weight: 700; color: var(--sw-primary, #ff8838); margin: 0 0 0.25rem; }
.cs-stat__label { color: #52525b; font-size: 0.92rem; margin: 0; }

/* Featured grid */
.cs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; }
.cs-card { background: #fff; border: 1px solid #f0efec; border-radius: 16px; padding: 1.75rem 1.5rem; display: flex; flex-direction: column; }
.cs-card__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.cs-card__size { font-size: 0.8rem; color: #71717a; }
.cs-card__title { font-family: var(--font-heading, 'Poppins', system-ui, sans-serif); font-size: 1.15rem; font-weight: 700; color: #1e1e1e; margin: 0 0 1rem; line-height: 1.35; }
.cs-card__quote { font-size: 0.95rem; color: #3f3f46; line-height: 1.6; font-style: italic; margin: 0 0 0.75rem; padding-left: 1rem; border-left: 3px solid var(--sw-primary, #ff8838); }
.cs-card__attr { font-size: 0.82rem; color: #71717a; margin: 0 0 1.25rem; }
.cs-card__kpis { list-style: none; padding: 0; margin: 0 0 1.25rem; border-top: 1px solid #f0efec; padding-top: 1rem; flex: 1; }
.cs-card__kpis li { padding: 0.3rem 0 0.3rem 1.25rem; position: relative; color: #3f3f46; font-size: 0.88rem; }
.cs-card__kpis li::before { content: '→'; position: absolute; left: 0; color: var(--sw-primary, #ff8838); font-weight: 700; }
.cs-card__link { color: var(--sw-primary, #ff8838); font-weight: 600; font-size: 0.9rem; text-decoration: none; }

/* Filter chips */
.cs-filters { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-bottom: 2rem; }
.cs-filter { background: #fff; border: 1px solid #f0efec; padding: 0.5rem 1rem; border-radius: 999px; color: #52525b; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.cs-filter:hover { border-color: var(--sw-primary, #ff8838); color: var(--sw-primary, #ff8838); }
.cs-filter.is-active { background: var(--sw-primary, #ff8838); color: #fff; border-color: var(--sw-primary, #ff8838); }
</style>
