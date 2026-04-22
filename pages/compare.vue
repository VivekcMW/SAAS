<template>
  <main class="mk-page">
    <section class="mk-hero">
      <div class="mk-hero__inner">
        <p class="mk-eyebrow">Compare</p>
        <h1 class="mk-hero__title">Compare SaaS tools, side by side</h1>
        <p class="mk-hero__lede">
          Pick two or three products, see features, pricing, integrations and verified
          reviews in one view. No fluff, no sponsored-first ranking.
        </p>
        <div class="mk-hero__cta">
          <NuxtLink to="/marketplace" class="mk-btn mk-btn--primary">Browse all tools</NuxtLink>
          <NuxtLink to="/alternatives" class="mk-btn mk-btn--ghost">See alternatives</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Popular comparisons -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">Popular comparisons</h2>
        <p class="mk-section__lede">The match-ups buyers research most on SaaSWorld.</p>
        <div class="mk-grid">
          <NuxtLink v-for="c in popular" :key="c.slug" :to="`/compare/${c.slug}`" class="mk-card mk-card--link">
            <p class="mk-card__eyebrow">{{ c.category }}</p>
            <h3 class="mk-card__title">{{ c.a }} vs {{ c.b }}</h3>
            <p class="mk-card__desc">{{ c.note }}</p>
            <span class="mk-card__link">Read comparison →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Browse by category -->
    <section class="mk-section mk-section--soft">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">Browse comparisons by category</h2>
        <div class="mk-grid">
          <NuxtLink v-for="c in categories" :key="c.slug" :to="`/marketplace?category=${c.slug}`" class="mk-card mk-card--link">
            <p class="mk-card__eyebrow">Category</p>
            <h3 class="mk-card__title">{{ c.label }}</h3>
            <p class="mk-card__desc">{{ c.desc }}</p>
            <span class="mk-card__link">Explore {{ c.count }} tools →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- How we compare -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">How SaaSWorld compares tools</h2>
        <div class="mk-grid">
          <div v-for="p in principles" :key="p.title" class="mk-card">
            <h3 class="mk-card__title">{{ p.title }}</h3>
            <p class="mk-card__desc">{{ p.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mk-cta">
      <div class="mk-cta__inner">
        <h2 class="mk-cta__title">Didn't find the comparison you need?</h2>
        <p class="mk-cta__lede">Tell us which tools to compare next. We'll build it and email you when it's live.</p>
        <div class="mk-cta__row">
          <NuxtLink to="/contact?subject=compare-request" class="mk-btn mk-btn--primary">Request a comparison</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { applySEO } = useSEO()
applySEO({
  title: 'Compare SaaS tools | SaaSWorld',
  description: 'Side-by-side comparisons of popular SaaS tools across CRM, help desk, analytics, email and more.',
  canonical: 'https://saasworld.com/compare',
  ogType: 'website'
})

const popular = [
  { slug: 'hubspot-vs-salesforce', a: 'HubSpot', b: 'Salesforce', category: 'CRM', note: 'All-in-one vs. deep customisation for enterprise RevOps.' },
  { slug: 'slack-vs-microsoft-teams', a: 'Slack', b: 'Microsoft Teams', category: 'Collaboration', note: 'Channels-first collaboration vs. bundled enterprise suite.' },
  { slug: 'zendesk-vs-intercom', a: 'Zendesk', b: 'Intercom', category: 'Support', note: 'Ticket-based scale vs. conversational customer messaging.' },
  { slug: 'notion-vs-confluence', a: 'Notion', b: 'Confluence', category: 'Knowledge', note: 'Flexible blocks vs. enterprise wiki with Jira integration.' },
  { slug: 'mailchimp-vs-klaviyo', a: 'Mailchimp', b: 'Klaviyo', category: 'Email', note: 'Generalist email marketing vs. ecommerce-first automation.' },
  { slug: 'mixpanel-vs-amplitude', a: 'Mixpanel', b: 'Amplitude', category: 'Analytics', note: 'Event analytics with strong behavioural cohorts either way.' },
  { slug: 'asana-vs-monday', a: 'Asana', b: 'Monday', category: 'PM', note: 'Task hierarchies vs. spreadsheet-style work OS.' },
  { slug: 'figma-vs-sketch', a: 'Figma', b: 'Sketch', category: 'Design', note: 'Browser-native multiplayer vs. macOS-native design tool.' },
  { slug: 'datadog-vs-new-relic', a: 'Datadog', b: 'New Relic', category: 'Observability', note: 'Integrated monitoring vs. APM-first platform.' }
]

const categories = [
  { slug: 'crm', label: 'CRM', desc: 'Pipeline, contacts, deals and forecasting.', count: 48 },
  { slug: 'marketing-automation', label: 'Marketing automation', desc: 'Email, nurture, attribution.', count: 62 },
  { slug: 'customer-support', label: 'Customer support', desc: 'Ticketing, messaging, KB.', count: 41 },
  { slug: 'analytics', label: 'Product analytics', desc: 'Events, funnels, retention.', count: 33 },
  { slug: 'design', label: 'Design & prototyping', desc: 'UI, whiteboards, handoff.', count: 27 },
  { slug: 'devops', label: 'DevOps & observability', desc: 'CI/CD, APM, logs.', count: 54 }
]

const principles = [
  { title: 'Unbiased ranking', desc: 'We do not rank by who pays us. Sponsored placements are always labelled.' },
  { title: 'Verified reviews only', desc: 'We validate reviewer identity with domain email or LinkedIn before publishing.' },
  { title: 'Living data', desc: 'Pricing, features and integrations are refreshed continuously via vendor APIs and manual audits.' },
  { title: 'Buyer-first', desc: 'Every comparison is written for the person signing the contract, not the one selling.' }
]
</script>
