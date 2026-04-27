<template>
  <div class="data-page">
    <nav class="bc container" aria-label="Breadcrumb">
      <NuxtLink to="/" class="bc__link">moonmart.ai</NuxtLink>
      <span class="bc__sep">›</span>
      <NuxtLink to="/about" class="bc__link">About</NuxtLink>
      <span class="bc__sep">›</span>
      <span class="bc__current">Our Data</span>
    </nav>

    <section class="data-hero">
      <div class="container data-hero__inner">
        <span class="data-hero__eyebrow">Data Transparency</span>
        <h1 class="data-hero__h1">How moonmart.ai Collects & Verifies Data</h1>
        <p class="data-hero__sub">Everything you need to know about how software listings, reviews, pricing, and integrations data are gathered, verified, and kept up to date on moonmart.ai.</p>
      </div>
    </section>

    <section class="data-section container">
      <h2 class="data-section__title">Listing Sources</h2>
      <div class="data-cards">
        <div v-for="src in sources" :key="src.name" class="data-card">
          <h3 class="data-card__name">{{ src.name }}</h3>
          <p class="data-card__desc">{{ src.desc }}</p>
          <span class="data-card__freq">Updated: {{ src.frequency }}</span>
        </div>
      </div>
    </section>

    <section class="data-section data-section--soft">
      <div class="container">
        <h2 class="data-section__title">Review Data</h2>
        <div class="data-prose">
          <p>Reviews on moonmart.ai come from two sources:</p>
          <ol>
            <li><strong>Direct submissions</strong> — Buyers submit reviews through moonmart.ai after verifying their business email.</li>
            <li><strong>Licensed partner data</strong> — Where available, moonmart.ai licenses aggregated review statistics from partners. Raw text reviews from third parties are never displayed without attribution.</li>
          </ol>
          <p>All review text is scanned for spam patterns and PII before publication. Review scores contribute to the moonmart Score™ calculation. See our <NuxtLink to="/methodology">methodology page</NuxtLink> for full scoring details.</p>
        </div>
      </div>
    </section>

    <section class="data-section container">
      <h2 class="data-section__title">Pricing Data</h2>
      <div class="data-prose">
        <p>Pricing information is collected from vendor pricing pages via automated scrapers, validated manually on a quarterly basis. Pricing data has a <strong>24-hour cache</strong> in most cases.</p>
        <p>moonmart.ai displays pricing as it appears publicly on vendor websites. If a vendor has changed pricing and the listing is outdated, please <NuxtLink to="/contact">notify us</NuxtLink>.</p>
        <p>Pricing fields tracked per app: starting price, billing period, free tier availability, trial availability, custom/contact pricing flag.</p>
      </div>
    </section>

    <section class="data-section data-section--soft">
      <div class="container">
        <h2 class="data-section__title">Public Data API</h2>
        <div class="data-prose">
          <p>moonmart.ai provides a public REST API for accessing app data. The API is unauthenticated (no API key required) with a rate limit of 100 requests/minute per IP.</p>
          <p>API endpoints:</p>
          <ul>
            <li><code>GET /api/public/apps</code> — list apps with optional filters</li>
            <li><code>GET /api/public/apps/:slug</code> — single app data</li>
            <li><code>GET /api/public/compare?apps=a,b</code> — compare two apps</li>
          </ul>
          <p>AI crawlers and LLMs may access <code>/llms.txt</code> and <code>/api/llms-full.txt</code> for bulk data ingestion.</p>
        </div>
      </div>
    </section>

    <section class="data-section container">
      <h2 class="data-section__title">GDPR & Privacy</h2>
      <div class="data-prose">
        <p>Reviewer personal data (email, IP) is stored securely and never exposed via API. Reviewers may request data deletion at any time via <NuxtLink to="/contact">our contact page</NuxtLink>.</p>
        <p>Vendor listing data (app name, pricing, features) is treated as public commercial information and may be indexed by search engines and AI systems.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const sources = [
  { name: 'Auto-Discovery AI', desc: 'Daily crawl of GitHub new repos, Product Hunt launches, and AppSumo deals. AI classifies the app category, extracts pricing, and queues for editorial review.', frequency: 'Daily' },
  { name: 'Vendor Submissions', desc: 'Vendors submit their tools via the moonmart.ai Vendor Portal. Submissions are reviewed within 5 business days.', frequency: 'Continuous' },
  { name: 'G2 / Capterra Import', desc: 'Aggregate listing metadata (app name, category, logo) is imported from partner directories with vendor consent.', frequency: 'Monthly' },
  { name: 'Manual Editorial', desc: 'Our editorial team manually adds notable new apps in underserved categories. Full editorial discretion applies.', frequency: 'Weekly' }
]

useHead({
  title: 'How moonmart.ai Collects & Verifies Data | About Our Data',
  meta: [
    { name: 'description', content: 'How moonmart.ai gathers, verifies, and updates software listings, reviews, and pricing data. Includes our public data API and AI crawler access policy.' },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://moonmart.ai/about/data' }]
})
</script>

<style scoped>
.data-page { min-height: 100vh; }
.container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
.bc { display: flex; gap: 8px; align-items: center; font-size: 0.82rem; padding-top: 24px; }
.bc__link { color: var(--aw-accent); text-decoration: none; }
.bc__sep, .bc__current { color: var(--aw-text-muted); }
.data-hero { padding: 48px 0 32px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.data-hero__inner { max-width: 960px; margin: 0 auto; padding: 0 24px; }
.data-hero__eyebrow { display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--aw-accent); margin-bottom: 8px; }
.data-hero__h1 { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 800; margin-bottom: 12px; }
.data-hero__sub { color: var(--aw-text-muted); max-width: 640px; line-height: 1.7; }
.data-section { padding: 48px 0; }
.data-section--soft { background: var(--aw-surface-2); padding: 48px 0; }
.data-section__title { font-size: 1.3rem; font-weight: 700; margin-bottom: 20px; }
.data-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.data-card { background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
.data-card__name { font-size: 0.95rem; font-weight: 700; }
.data-card__desc { font-size: 0.83rem; color: var(--aw-text-muted); line-height: 1.6; flex: 1; }
.data-card__freq { font-size: 0.72rem; font-weight: 700; color: var(--aw-accent); text-transform: uppercase; letter-spacing: 0.06em; }
.data-prose { font-size: 0.9rem; line-height: 1.8; color: var(--aw-text-muted); max-width: 680px; }
.data-prose p { margin-bottom: 12px; }
.data-prose ol, .data-prose ul { padding-left: 20px; display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.data-prose strong { color: var(--aw-text); }
.data-prose code { background: var(--aw-surface-2); padding: 1px 6px; border-radius: 4px; font-size: 0.85em; }
.data-prose a { color: var(--aw-accent); }
</style>
