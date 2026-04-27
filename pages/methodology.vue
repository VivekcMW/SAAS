<template>
  <div class="method-page">
    <nav class="bc container" aria-label="Breadcrumb">
      <NuxtLink to="/" class="bc__link">moonmart.ai</NuxtLink>
      <span class="bc__sep">›</span>
      <span class="bc__current">Methodology</span>
    </nav>

    <section class="method-hero">
      <div class="container method-hero__inner">
        <span class="method-hero__eyebrow">Transparency & E-E-A-T</span>
        <h1 class="method-hero__h1">How moonmart.ai Scores & Ranks Software</h1>
        <p class="method-hero__sub">Every ranking, score, and recommendation on moonmart.ai follows a documented, reproducible methodology. This page explains exactly how the moonmart Score™ is calculated, how reviews are verified, and how listings are kept current.</p>
        <div class="method-hero__badges">
          <span class="method-badge">Updated {{ today }}</span>
          <span class="method-badge">Independent research</span>
          <span class="method-badge">No pay-to-rank</span>
        </div>
      </div>
    </section>

    <!-- Score formula -->
    <section class="method-section container">
      <div class="method-section__header">
        <div class="method-section__num">01</div>
        <h2 class="method-section__h2">moonmart Score™ Formula</h2>
      </div>
      <p class="method-section__lead">The moonmart Score is a composite 0–10 quality metric computed from five data signals, weighted by their importance to enterprise buyers:</p>

      <div class="method-formula">
        <div v-for="factor in scoreFactors" :key="factor.name" class="method-formula__row">
          <div class="method-formula__bar" :style="{ width: factor.weight + '%', backgroundColor: 'var(--aw-accent)' }" />
          <div class="method-formula__info">
            <span class="method-formula__name">{{ factor.name }}</span>
            <span class="method-formula__weight">{{ factor.weight }}%</span>
          </div>
          <p class="method-formula__desc">{{ factor.desc }}</p>
        </div>
      </div>

      <div class="method-callout">
        <strong>Floor rule:</strong> Any published app receives a minimum score of 3.0 to prevent unfair penalization of new tools with limited data.
      </div>

      <div class="method-score-table">
        <div v-for="tier in scoreTiers" :key="tier.label" class="method-score-tier">
          <span class="method-score-tier__range">{{ tier.range }}</span>
          <span class="method-score-tier__label" :style="{ color: 'var(--aw-accent)' }">{{ tier.label }}</span>
          <span class="method-score-tier__desc">{{ tier.desc }}</span>
        </div>
      </div>
    </section>

    <!-- Review verification -->
    <section class="method-section method-section--soft">
      <div class="container">
        <div class="method-section__header">
          <div class="method-section__num">02</div>
          <h2 class="method-section__h2">Review Verification Process</h2>
        </div>
        <div class="method-verify-grid">
          <div v-for="step in verifySteps" :key="step.title" class="method-verify-card">
            <div class="method-verify-card__icon">{{ step.icon }}</div>
            <h3 class="method-verify-card__title">{{ step.title }}</h3>
            <p class="method-verify-card__desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Data freshness -->
    <section class="method-section container">
      <div class="method-section__header">
        <div class="method-section__num">03</div>
        <h2 class="method-section__h2">Data Freshness & Update Cadence</h2>
      </div>
      <div class="method-freshness-grid">
        <div v-for="item in freshnessItems" :key="item.label" class="method-freshness-card">
          <span class="method-freshness-card__freq">{{ item.frequency }}</span>
          <h3 class="method-freshness-card__label">{{ item.label }}</h3>
          <p class="method-freshness-card__desc">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Editorial independence -->
    <section class="method-section method-section--soft">
      <div class="container">
        <div class="method-section__header">
          <div class="method-section__num">04</div>
          <h2 class="method-section__h2">Editorial Independence</h2>
        </div>
        <div class="method-prose">
          <p><strong>No pay-to-rank.</strong> Vendors cannot pay to improve their moonmart Score or ranking position. Advertised placements are clearly labeled as "Sponsored".</p>
          <p><strong>Vendor responses.</strong> Vendors may respond to reviews publicly, but cannot edit or remove verified buyer reviews. Disputed reviews are reviewed by our editorial team.</p>
          <p><strong>Conflict disclosure.</strong> moonmart.ai earns revenue through affiliate links and sponsored placements. These do not influence editorial rankings or scores. We disclose all commercial relationships.</p>
          <p><strong>Auto-discovery.</strong> New tools are discovered automatically from GitHub, Product Hunt, G2, and other sources. Editorial review determines final listing status.</p>
        </div>
      </div>
    </section>

    <!-- AI signals -->
    <section class="method-section container">
      <div class="method-section__header">
        <div class="method-section__num">05</div>
        <h2 class="method-section__h2">AI-Generated Content Policy</h2>
      </div>
      <div class="method-prose">
        <p>moonmart.ai uses AI (OpenAI GPT-4o) to assist with:</p>
        <ul>
          <li>Synthesizing common themes across buyer reviews into an AI Consensus™ summary</li>
          <li>Generating FAQ answers based on real review data</li>
          <li>Producing the <em>Quick Verdict</em> paragraph on each app page</li>
        </ul>
        <p>All AI-generated content is <strong>based on real review data</strong> and is clearly labeled. It does not replace verified buyer reviews. AI-generated content is reviewed periodically for accuracy.</p>
      </div>
    </section>

    <!-- Contact -->
    <section class="method-cta container">
      <h2 class="method-cta__h2">Questions about our methodology?</h2>
      <p class="method-cta__p">We publish our scoring formula openly. If you believe a score is inaccurate or a review is fraudulent, contact our editorial team.</p>
      <NuxtLink to="/contact" class="bw-btn bw-btn--primary">Contact Editorial Team</NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

const scoreFactors = [
  { name: 'Review Quality', weight: 30, desc: 'Weighted average of verified buyer ratings, recency-adjusted. More recent reviews receive higher weight.' },
  { name: 'Integration Ecosystem', weight: 20, desc: 'Number of native integrations and API availability. Tools that connect well score higher.' },
  { name: 'Support Quality', weight: 20, desc: 'Based on reviewer-reported response times, resolution rates, and availability (chat, phone, email).' },
  { name: 'Price-Value Ratio', weight: 20, desc: 'Starting price benchmarked against category average. Free tiers, trial availability, and transparent pricing improve this score.' },
  { name: 'Security Posture', weight: 10, desc: 'Verified security certifications: SOC 2 Type II, ISO 27001, GDPR, HIPAA, and published security documentation.' }
]

const scoreTiers = [
  { range: '9.0–10.0', label: 'Outstanding', desc: 'Best-in-class. Consistently excellent across all dimensions.' },
  { range: '8.0–8.9', label: 'Excellent', desc: 'Top-tier tool. Minor gaps in one area but strong overall.' },
  { range: '7.0–7.9', label: 'Great', desc: 'Solid performer. Recommended for most teams.' },
  { range: '6.0–6.9', label: 'Good', desc: 'Above average. Worth evaluating for your specific use case.' },
  { range: '3.0–5.9', label: 'Listed', desc: 'Meets basic listing criteria. Insufficient data or mixed reviews.' }
]

const verifySteps = [
  { icon: '01', title: 'Email domain verification', desc: 'Reviewers must submit reviews from a verified business email domain matching their stated employer.' },
  { icon: '02', title: 'LinkedIn employment check', desc: 'For high-value reviews (3+ sentences), we optionally cross-reference reviewer employment via LinkedIn OAuth.' },
  { icon: '03', title: 'Behavioral pattern analysis', desc: 'AI-powered detection of review farms, duplicate content, and unnatural rating spikes. Flagged reviews are removed or marked unverified.' },
  { icon: '04', title: 'Usage signal requirements', desc: 'Reviewers must confirm usage duration (e.g., 6+ months for verified badge). This is not technically enforced but audited randomly.' }
]

const freshnessItems = [
  { frequency: 'Daily', label: 'New app discovery', desc: 'AI crawler checks GitHub, Product Hunt, and partner feeds for new SaaS tools.' },
  { frequency: 'Weekly', label: 'Pricing updates', desc: 'Automated scrapers verify pricing page changes for all listed apps.' },
  { frequency: 'Monthly', label: 'Score recalculation', desc: 'moonmart Scores are recalculated monthly using the latest review data.' },
  { frequency: 'Quarterly', label: 'Full editorial review', desc: 'Editorial team manually reviews top 100 apps per category for accuracy.' }
]

useHead({
  title: 'How moonmart.ai Ranks Software — Methodology & moonmart Score™',
  meta: [
    { name: 'description', content: 'Transparent methodology behind the moonmart Score™ — how we calculate ratings, verify reviews, and maintain editorial independence. Updated monthly.' },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://moonmart.ai/methodology' }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'moonmart.ai Methodology',
      url: 'https://moonmart.ai/methodology',
      description: 'How moonmart.ai scores and ranks SaaS software using the moonmart Score™ algorithm.',
      publisher: { '@type': 'Organization', name: 'moonmart.ai', url: 'https://moonmart.ai' }
    })
  }]
})
</script>

<style scoped>
.method-page { min-height: 100vh; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
.bc { display: flex; gap: 8px; align-items: center; font-size: 0.82rem; padding-top: 24px; }
.bc__link { color: var(--aw-accent); text-decoration: none; }
.bc__sep, .bc__current { color: var(--aw-text-muted); }
.method-hero { padding: 52px 0 40px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.method-hero__inner { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
.method-hero__eyebrow { display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--aw-accent); margin-bottom: 10px; }
.method-hero__h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; margin-bottom: 16px; }
.method-hero__sub { color: var(--aw-text-muted); line-height: 1.7; max-width: 720px; font-size: 0.95rem; margin-bottom: 20px; }
.method-hero__badges { display: flex; gap: 10px; flex-wrap: wrap; }
.method-badge { padding: 4px 14px; border: 1.5px solid var(--aw-border); border-radius: 999px; font-size: 0.75rem; color: var(--aw-text-muted); }
.method-section { padding: 56px 0; }
.method-section--soft { background: var(--aw-surface-2); margin: 0; padding: 56px 0; }
.method-section__header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.method-section__num { width: 36px; height: 36px; background: var(--aw-accent); color: #fff; font-size: 0.78rem; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.method-section__h2 { font-size: 1.4rem; font-weight: 700; }
.method-section__lead { color: var(--aw-text-muted); margin-bottom: 28px; max-width: 700px; line-height: 1.7; }
.method-formula { display: flex; flex-direction: column; gap: 20px; margin-bottom: 28px; }
.method-formula__row { background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 12px; padding: 18px 20px; overflow: hidden; }
.method-formula__bar { height: 4px; border-radius: 999px; margin-bottom: 12px; }
.method-formula__info { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.method-formula__name { font-weight: 700; font-size: 0.95rem; }
.method-formula__weight { font-size: 1.1rem; font-weight: 800; color: var(--aw-accent); }
.method-formula__desc { font-size: 0.85rem; color: var(--aw-text-muted); line-height: 1.6; margin: 0; }
.method-callout { background: var(--aw-accent-50, #eff6ff); border-left: 4px solid var(--aw-accent); padding: 14px 20px; border-radius: 8px; font-size: 0.88rem; margin-bottom: 24px; line-height: 1.6; }
.method-score-table { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.method-score-tier { background: var(--aw-surface-2); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 3px; }
.method-score-tier__range { font-size: 1rem; font-weight: 800; color: var(--aw-accent); }
.method-score-tier__label { font-size: 0.85rem; font-weight: 700; }
.method-score-tier__desc { font-size: 0.78rem; color: var(--aw-text-muted); line-height: 1.5; }
.method-verify-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.method-verify-card { background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 12px; padding: 20px; }
.method-verify-card__icon { width: 32px; height: 32px; background: var(--aw-accent); color: #fff; font-size: 0.72rem; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.method-verify-card__title { font-size: 0.9rem; font-weight: 700; margin-bottom: 6px; }
.method-verify-card__desc { font-size: 0.82rem; color: var(--aw-text-muted); line-height: 1.6; }
.method-freshness-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.method-freshness-card { border: 1.5px solid var(--aw-border); border-radius: 12px; padding: 20px; }
.method-freshness-card__freq { display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--aw-accent); margin-bottom: 6px; }
.method-freshness-card__label { font-size: 0.9rem; font-weight: 700; margin-bottom: 6px; }
.method-freshness-card__desc { font-size: 0.82rem; color: var(--aw-text-muted); line-height: 1.6; }
.method-prose { font-size: 0.92rem; line-height: 1.8; color: var(--aw-text-muted); max-width: 720px; }
.method-prose p { margin-bottom: 14px; }
.method-prose ul { padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
.method-prose strong { color: var(--aw-text); }
.method-cta { padding: 64px 0; text-align: center; }
.method-cta__h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; }
.method-cta__p { color: var(--aw-text-muted); max-width: 480px; margin: 0 auto 24px; }
</style>
