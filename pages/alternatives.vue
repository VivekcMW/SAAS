<template>
  <main class="mk-page">
    <section class="mk-hero">
      <div class="mk-hero__inner">
        <p class="mk-eyebrow">Alternatives</p>
        <h1 class="mk-hero__title">Find the right alternative — fast</h1>
        <p class="mk-hero__lede">
          Thinking of replacing a tool? Start here. We curate alternatives by category,
          budget and migration path so you can switch with confidence.
        </p>
        <div class="mk-hero__cta">
          <NuxtLink to="/marketplace" class="mk-btn mk-btn--primary">Browse marketplace</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Popular alternatives -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">Popular "alternatives to" pages</h2>
        <p class="mk-section__lede">The tools buyers most often research replacements for.</p>
        <div class="mk-grid">
          <NuxtLink v-for="a in popular" :key="a.slug" :to="`/alternatives/${a.slug}`" class="mk-card mk-card--link">
            <p class="mk-card__eyebrow">{{ a.category }}</p>
            <h3 class="mk-card__title">Alternatives to {{ a.tool }}</h3>
            <p class="mk-card__desc">{{ a.note }}</p>
            <span class="mk-card__link">See {{ a.count }} alternatives →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- When to switch -->
    <section class="mk-section mk-section--soft">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">Should you actually switch?</h2>
        <p class="mk-section__lede">Before migration, run through this quick checklist.</p>
        <div class="mk-grid">
          <div v-for="c in checklist" :key="c.title" class="mk-card">
            <p class="mk-card__eyebrow">{{ c.step }}</p>
            <h3 class="mk-card__title">{{ c.title }}</h3>
            <p class="mk-card__desc">{{ c.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- By reason -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">Alternatives by reason</h2>
        <div class="mk-grid">
          <NuxtLink v-for="r in reasons" :key="r.slug" :to="`/alternatives?reason=${r.slug}`" class="mk-card mk-card--link">
            <h3 class="mk-card__title">{{ r.label }}</h3>
            <p class="mk-card__desc">{{ r.desc }}</p>
            <span class="mk-card__link">Explore →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mk-cta">
      <div class="mk-cta__inner">
        <h2 class="mk-cta__title">Migrating off a tool?</h2>
        <p class="mk-cta__lede">Talk to our team for a free migration plan — vendors and all.</p>
        <div class="mk-cta__row">
          <NuxtLink to="/demo" class="mk-btn mk-btn--primary">Book a migration chat</NuxtLink>
          <NuxtLink to="/guides" class="mk-btn mk-btn--ghost">Read migration guides</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { applySEO } = useSEO()
applySEO({
  title: 'SaaS alternatives | Moonmart',
  description: 'Curated alternatives to popular SaaS tools across CRM, support, analytics, design and more.',
  canonical: 'https://moonmart.ai/alternatives',
  ogType: 'website'
})

const popular = [
  { slug: 'salesforce', tool: 'Salesforce', category: 'CRM', count: 12, note: 'Leaner CRMs for teams that don\'t need the full Einstein stack.' },
  { slug: 'hubspot', tool: 'HubSpot', category: 'CRM', count: 10, note: 'When HubSpot\'s all-in-one bundle isn\'t a fit for your ops.' },
  { slug: 'zendesk', tool: 'Zendesk', category: 'Support', count: 11, note: 'Modern help-desk alternatives with better pricing or AI.' },
  { slug: 'mailchimp', tool: 'Mailchimp', category: 'Email', count: 14, note: 'Email tools built for ecommerce, SaaS or high-volume senders.' },
  { slug: 'google-analytics', tool: 'Google Analytics', category: 'Analytics', count: 9, note: 'Privacy-first, product-first analytics after GA4.' },
  { slug: 'slack', tool: 'Slack', category: 'Collaboration', count: 8, note: 'Team chat that prioritises async, privacy or cost.' },
  { slug: 'notion', tool: 'Notion', category: 'Knowledge', count: 7, note: 'Docs & wikis for teams hitting Notion\'s scale limits.' },
  { slug: 'jira', tool: 'Jira', category: 'PM', count: 10, note: 'Issue tracking that doesn\'t require a consultant.' },
  { slug: 'segment', tool: 'Segment', category: 'CDP', count: 6, note: 'Customer-data pipelines with lower ingest costs.' }
]

const checklist = [
  { step: '01', title: 'Diagnose the pain', desc: 'Is the issue really the tool — or your processes, training or data?' },
  { step: '02', title: 'Estimate switching cost', desc: 'Migration, retraining, integrations, contract overlap. Budget 15–30% of the tool\'s cost.' },
  { step: '03', title: 'Pilot before you commit', desc: 'Run the top 2 alternatives in parallel on a real workflow for 2–4 weeks.' },
  { step: '04', title: 'Negotiate exits', desc: 'Most SaaS contracts have notice windows. Time your switch to avoid double-paying.' }
]

const reasons = [
  { slug: 'cheaper', label: 'Cheaper alternatives', desc: 'Cut subscription cost without losing core features.' },
  { slug: 'open-source', label: 'Open-source alternatives', desc: 'Self-host for control, compliance or cost.' },
  { slug: 'privacy', label: 'Privacy-first alternatives', desc: 'Tools with stronger data practices and EU hosting.' },
  { slug: 'ai-native', label: 'AI-native alternatives', desc: 'Newer entrants built around LLMs from day one.' },
  { slug: 'smb', label: 'For small teams', desc: 'Pricing and UX designed for teams under 50.' },
  { slug: 'enterprise', label: 'For enterprise', desc: 'SSO, SCIM, audit logs and enterprise support.' }
]
</script>
