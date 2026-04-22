<template>
  <main class="mk-page">
    <section class="mk-hero">
      <div class="mk-hero__inner">
        <p class="mk-eyebrow">Solutions</p>
        <h1 class="mk-hero__title">The right stack for every team</h1>
        <p class="mk-hero__lede">
          Curated SaaS recommendations by team, industry and company size. Built by
          practitioners who've bought and deployed these tools themselves.
        </p>
        <div class="mk-hero__cta">
          <NuxtLink to="/marketplace" class="mk-btn mk-btn--primary">Browse marketplace</NuxtLink>
          <NuxtLink to="/demo" class="mk-btn mk-btn--ghost">Get a tailored stack</NuxtLink>
        </div>
      </div>
    </section>

    <!-- By team -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">By team</h2>
        <p class="mk-section__lede">Start where you live. We'll show you the categories that matter most for your function.</p>
        <div class="mk-grid">
          <NuxtLink v-for="t in teams" :key="t.slug" :to="`/solutions/${t.slug}`" class="mk-card mk-card--link">
            <p class="mk-card__eyebrow">{{ t.persona }}</p>
            <h3 class="mk-card__title">{{ t.title }}</h3>
            <p class="mk-card__desc">{{ t.desc }}</p>
            <span class="mk-card__link">See stack →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- By industry -->
    <section class="mk-section mk-section--soft">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">By industry</h2>
        <div class="mk-grid">
          <NuxtLink v-for="i in industries" :key="i.slug" :to="`/solutions/${i.slug}`" class="mk-card mk-card--link">
            <p class="mk-card__eyebrow">Industry</p>
            <h3 class="mk-card__title">{{ i.title }}</h3>
            <p class="mk-card__desc">{{ i.desc }}</p>
            <span class="mk-card__link">Recommended tools →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- By size -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">By company size</h2>
        <div class="mk-grid">
          <NuxtLink v-for="s in sizes" :key="s.slug" :to="`/solutions/${s.slug}`" class="mk-card mk-card--link">
            <p class="mk-card__eyebrow">{{ s.range }}</p>
            <h3 class="mk-card__title">{{ s.title }}</h3>
            <p class="mk-card__desc">{{ s.desc }}</p>
            <span class="mk-card__link">See stack →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mk-cta">
      <div class="mk-cta__inner">
        <h2 class="mk-cta__title">Need a custom stack?</h2>
        <p class="mk-cta__lede">Tell us about your team and goals — we'll send back a vetted shortlist within 48 hours.</p>
        <div class="mk-cta__row">
          <NuxtLink to="/demo" class="mk-btn mk-btn--primary">Get a custom stack</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { applySEO } = useSEO()
applySEO({
  title: 'Solutions by team, industry & size | SaaSWorld',
  description: 'Curated SaaS stacks for sales, marketing, product, engineering, HR and finance — by industry and company size.',
  canonical: 'https://saasworld.com/solutions',
  ogType: 'website'
})

const teams = [
  { slug: 'sales', persona: 'Sales', title: 'Sales & RevOps', desc: 'CRM, outbound, enablement and revenue intelligence.' },
  { slug: 'marketing', persona: 'Marketing', title: 'Marketing teams', desc: 'Automation, CDP, attribution, SEO and content.' },
  { slug: 'product', persona: 'Product', title: 'Product management', desc: 'Analytics, feedback, roadmap and experimentation.' },
  { slug: 'engineering', persona: 'Engineering', title: 'Engineering & DevOps', desc: 'CI/CD, observability, feature flags and incident response.' },
  { slug: 'customer-success', persona: 'CS', title: 'Customer success', desc: 'Health scores, onboarding, community and support.' },
  { slug: 'people', persona: 'People', title: 'HR & people ops', desc: 'HRIS, ATS, performance and engagement.' },
  { slug: 'finance', persona: 'Finance', title: 'Finance & ops', desc: 'Billing, revenue recognition, FP&A and procurement.' },
  { slug: 'it', persona: 'IT', title: 'IT & security', desc: 'Identity, MDM, SaaS management and compliance.' }
]

const industries = [
  { slug: 'ecommerce', title: 'E-commerce', desc: 'Storefront, email, reviews, shipping, support.' },
  { slug: 'fintech', title: 'Fintech', desc: 'KYC, ledgers, compliance and fraud.' },
  { slug: 'healthcare', title: 'Healthcare', desc: 'HIPAA-ready tools for telehealth and patient ops.' },
  { slug: 'education', title: 'Education', desc: 'LMS, SIS, communications and assessment.' },
  { slug: 'agency', title: 'Agencies', desc: 'Project management, time tracking and reporting.' },
  { slug: 'manufacturing', title: 'Manufacturing', desc: 'ERP, MES, field ops and CPQ.' }
]

const sizes = [
  { slug: 'startup', range: '1–20', title: 'Startups', desc: 'Lean, free-tier-friendly stack that scales with you.' },
  { slug: 'smb', range: '21–200', title: 'Small & mid-market', desc: 'Balance growth speed with proper processes.' },
  { slug: 'mid-market', range: '200–1000', title: 'Mid-market', desc: 'Tools that play nicely with SSO, SCIM and audit logs.' },
  { slug: 'enterprise', range: '1000+', title: 'Enterprise', desc: 'Enterprise-grade security, compliance and support.' }
]
</script>
