<script setup lang="ts">
useHead({
  title: 'About Moonmart — The Software Marketplace Built for Every Founder',
  meta: [
    {
      name: 'description',
      content:
        'Moonmart helps every entrepreneur — from solo founders to global enterprises — discover, compare, and launch the right software, faster.'
    }
  ]
})

interface Chapter { kicker: string; title: string; body: string }
interface Audience {
  stage: string
  title: string
  tagline: string
  description: string
  highlight: { value: string; label: string }
  points: string[]
}
type PillarIcon = 'shield' | 'sparkles' | 'users' | 'handshake'
interface Pillar { title: string; body: string; outcome: string; icon: PillarIcon }
interface Stat { label: string; value: string }
interface Faq { q: string; a: string }

const chapters: Chapter[] = [
  {
    kicker: 'Our story',
    title: 'Software shouldn’t be a maze.',
    body:
      'Every founder we met was losing weeks to the same problem: too many tools, too many tabs, too little clarity. We built Moonmart so anyone — from a first-time founder in a home office to a CTO at a Fortune 500 — can find the right software in minutes, not months.'
  },
  {
    kicker: 'Why we exist',
    title: 'Great ideas deserve great tools.',
    body:
      'The playing field gets leveled when a solo creator can access the same quality of software decisions as a global team. Moonmart turns fragmented research into a single, honest, side-by-side experience — with real reviews, transparent pricing, and trusted vendors.'
  },
  {
    kicker: 'How we help',
    title: 'One marketplace. Every stage of your journey.',
    body:
      'Whether you’re validating your first idea or scaling to a hundred markets, Moonmart grows with you. Discover trending apps, compare features that actually matter, talk to vendors directly, and launch with confidence.'
  }
]

const audiences: Audience[] = [
  {
    stage: 'Stage 1',
    title: 'Solo founders',
    tagline: 'Ship faster with fewer tools.',
    description:
      'You’re building with focus. Moonmart surfaces starter-friendly tools, free tiers, and battle-tested toolkits so you can go from idea to live in a weekend — without drowning in sales calls.',
    highlight: { value: 'Free tiers', label: 'highlighted first' },
    points: [
      'Starter plans and free tiers shown upfront',
      'Hand-picked toolkits for common playbooks',
      'No hidden fees, no sales calls required'
    ]
  },
  {
    stage: 'Stage 2',
    title: 'Startups & small teams',
    tagline: 'Move from zero to one without guessing.',
    description:
      'Every tool you pick now sets the pace for the next two years. We help small teams decide quickly with side-by-side comparisons and reviews written by operators who’ve actually shipped.',
    highlight: { value: '10x', label: 'faster decisions' },
    points: [
      'Side-by-side comparisons of the top tools in every category',
      'Verified reviews from real operators',
      'Integrations that play well with the rest of your stack'
    ]
  },
  {
    stage: 'Stage 3',
    title: 'Scaling companies',
    tagline: 'Replace chaos with a clear playbook.',
    description:
      'Growing teams need procurement-ready answers, not marketing fluff. Get pricing, security, and compliance info in one place, with direct lines to vendors for demos and custom quotes.',
    highlight: { value: '1 place', label: 'for every evaluation' },
    points: [
      'Procurement-ready profiles with pricing, security & compliance',
      'Team-wide evaluations and shared shortlists',
      'Direct lines to vendors for demos and custom pricing'
    ]
  },
  {
    stage: 'Stage 4',
    title: 'Enterprises',
    tagline: 'A trusted catalog at global scale.',
    description:
      'From global rollouts to region-specific procurement, Moonmart is the catalog your teams can actually trust. Governance, SSO-ready workflows, and category leadership partnerships — built in.',
    highlight: { value: 'SSO-ready', label: 'for every team' },
    points: [
      'Enterprise search with advanced filters and governance',
      'SSO-ready workflows and vendor verification',
      'Dedicated partnerships with category leaders'
    ]
  }
]

const selectedAudienceIndex = ref(0)
const selectedAudience = computed(() => audiences[selectedAudienceIndex.value])

const pillars: Pillar[] = [
  {
    icon: 'shield',
    title: 'Honest by default',
    body: 'Real reviews, real pricing. We never hide the trade-offs that matter.',
    outcome: 'You decide with facts, not marketing spin.'
  },
  {
    icon: 'sparkles',
    title: 'Simple to use',
    body: 'Clean design, plain language, and the fastest path to a confident decision.',
    outcome: 'You find the right tool in minutes, not days.'
  },
  {
    icon: 'users',
    title: 'Built for everyone',
    body: 'One experience that serves a side-project on day one and a global rollout on day one thousand.',
    outcome: 'You never outgrow the platform you started on.'
  },
  {
    icon: 'handshake',
    title: 'Vendor friendly',
    body: 'We help great products get found — with fair listings, not pay-to-play rankings.',
    outcome: 'You see what is truly best — not who paid the most.'
  }
]

const stats: Stat[] = [
  { value: '10k+', label: 'Software products' },
  { value: '120+', label: 'Categories covered' },
  { value: '50k+', label: 'Verified reviews' },
  { value: '190+', label: 'Countries reached' }
]

interface AboutStats {
  products: number
  categories: number
  reviews: number
  users: number
}

/**
 * Format a raw count into a short, readable display value.
 *   1_234 → "1,234"
 *   12_300 → "12k+"
 *   1_500_000 → "1.5M+"
 */
function formatCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0'
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v >= 10 ? Math.floor(v) : v.toFixed(1).replace(/\.0$/, '')}M+`
  }
  if (n >= 1_000) {
    const v = n / 1_000
    return `${v >= 10 ? Math.floor(v) : v.toFixed(1).replace(/\.0$/, '')}k+`
  }
  return n.toLocaleString()
}

// Live stats from the database. Rendered server-side so the user sees the
// real numbers immediately, with a safe fallback if the endpoint fails.
const { data: liveStats } = await useFetch<AboutStats>('/api/stats/about', {
  key: 'about-stats',
  default: () => ({ products: 0, categories: 0, reviews: 0, users: 0 })
})

const displayStats = computed<Stat[]>(() => {
  const s = liveStats.value || { products: 0, categories: 0, reviews: 0, users: 0 }
  return [
    { value: formatCount(s.products), label: 'Software products' },
    { value: formatCount(s.categories), label: 'Categories covered' },
    { value: formatCount(s.reviews), label: 'Verified reviews' },
    { value: formatCount(s.users), label: 'Founders & teams' }
  ]
})

interface Faq { q: string; a: string }

const faqs: Faq[] = [
  {
    q: 'What is Moonmart?',
    a: 'Moonmart is a global software marketplace where anyone — from solo founders to enterprise teams — can discover, compare, and launch the right tools in minutes, backed by real reviews and transparent pricing.'
  },
  {
    q: 'Is Moonmart free to use?',
    a: 'Yes. Browsing the marketplace, comparing products, reading reviews, and contacting vendors is free for buyers. You only pay the vendor you choose — directly, with no markup from us.'
  },
  {
    q: 'How do you keep listings and reviews honest?',
    a: 'Every vendor listing goes through a verification step, and every review is moderated before it appears. Rankings are never pay-to-play — we surface products based on fit, ratings, and real usage signals.'
  },
  {
    q: 'I’m a solo founder — is this for me?',
    a: 'Absolutely. We highlight free tiers, starter plans, and hand-picked toolkits so you can ship fast without overspending. Most founders find what they need without a single sales call.'
  },
  {
    q: 'Do you support enterprise procurement?',
    a: 'Yes. Enterprise profiles include pricing, security, and compliance info, plus team shortlists and direct lines to vendors for demos and custom pricing. SSO-ready workflows are available for large teams.'
  },
  {
    q: 'How do I list my product on Moonmart?',
    a: 'Head to “List your product”, complete the short onboarding form, and our team reviews new listings within 24–48 hours. Once approved, your product is live across the marketplace.'
  }
]

const openFaqIndex = ref<number | null>(0)
function toggleFaq(i: number) {
  openFaqIndex.value = openFaqIndex.value === i ? null : i
}
</script>

<template>
  <div class="about-page">
    <section class="about-hero">
      <div class="container">
        <span class="about-eyebrow">Our story</span>
        <h1 class="about-hero-title">
          Every great company starts with the <span class="accent">right tools</span>.
        </h1>
        <p class="about-hero-sub">
          Moonmart is the marketplace built for every founder — from a one-person studio to
          a global enterprise. Find the software that fits your stage, without the noise.
        </p>
        <div class="about-hero-cta">
          <NuxtLink to="/marketplace" class="btn btn-primary">Explore the marketplace</NuxtLink>
          <NuxtLink to="/list-product" class="btn btn-ghost">List your product</NuxtLink>
        </div>
      </div>
    </section>

    <section class="about-story">
      <div class="container">
        <article
          v-for="(chapter, index) in chapters"
          :key="chapter.title"
          class="story-chapter"
          :class="{ 'story-chapter--flip': index % 2 === 1 }"
        >
          <div class="story-copy">
            <span class="story-kicker">{{ chapter.kicker }}</span>
            <h2 class="story-title">{{ chapter.title }}</h2>
            <p class="story-body">{{ chapter.body }}</p>
          </div>
          <div class="story-visual" aria-hidden="true">
            <span class="story-index">0{{ index + 1 }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="about-audiences">
      <div class="container">
        <div class="section-heading">
          <span class="section-eyebrow">Built for every founder</span>
          <h2 class="section-title">From your first idea to your next hundred markets.</h2>
          <p class="section-sub">
            Moonmart adapts to where you are — and grows with where you’re going.
            Pick your stage and see how we help.
          </p>
        </div>

        <div class="stage-picker" role="tablist" aria-label="Founder stage">
          <button
            v-for="(audience, i) in audiences"
            :key="audience.title"
            type="button"
            role="tab"
            :aria-selected="selectedAudienceIndex === i"
            :aria-controls="`stage-panel-${i}`"
            :id="`stage-tab-${i}`"
            :tabindex="selectedAudienceIndex === i ? 0 : -1"
            class="stage-chip"
            :class="{ 'stage-chip--active': selectedAudienceIndex === i }"
            @click="selectedAudienceIndex = i"
          >
            <span class="stage-chip__step">{{ audience.stage }}</span>
            <span class="stage-chip__title">{{ audience.title }}</span>
          </button>
        </div>

        <div
          :id="`stage-panel-${selectedAudienceIndex}`"
          role="tabpanel"
          :aria-labelledby="`stage-tab-${selectedAudienceIndex}`"
          class="stage-panel"
        >
          <div class="stage-panel__content">
            <span class="stage-panel__tagline">{{ selectedAudience.tagline }}</span>
            <h3 class="stage-panel__title">{{ selectedAudience.title }}</h3>
            <p class="stage-panel__description">{{ selectedAudience.description }}</p>

            <ul class="stage-panel__points">
              <li v-for="point in selectedAudience.points" :key="point">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12l4 4L19 7" />
                </svg>
                <span>{{ point }}</span>
              </li>
            </ul>
          </div>

          <aside class="stage-panel__aside" aria-hidden="true">
            <div class="stage-highlight">
              <div class="stage-highlight__value">{{ selectedAudience.highlight.value }}</div>
              <div class="stage-highlight__label">{{ selectedAudience.highlight.label }}</div>
            </div>
            <div class="stage-progress">
              <span
                v-for="(audience, i) in audiences"
                :key="audience.title"
                class="stage-progress__dot"
                :class="{ 'stage-progress__dot--active': i <= selectedAudienceIndex }"
              />
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="about-pillars">
      <div class="container">
        <div class="section-heading">
          <span class="section-eyebrow">What we believe</span>
          <h2 class="section-title">Simple principles. Serious outcomes.</h2>
        </div>
        <ul class="pillar-list">
          <li v-for="(pillar, i) in pillars" :key="pillar.title" class="pillar-item">
            <span class="pillar-item__num">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="pillar-item__content">
              <h3 class="pillar-item__title">{{ pillar.title }}</h3>
              <p class="pillar-item__body">{{ pillar.body }}</p>
              <p class="pillar-item__outcome">{{ pillar.outcome }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="about-stats">
      <div class="container">
        <div class="stats-heading">
          <span class="stats-eyebrow">Live on the platform</span>
          <h2 class="stats-title">What is available on Moonmart right now.</h2>
          <p class="stats-sub">
            A live snapshot of our catalog — updated as new products, categories, reviews and founders join.
          </p>
        </div>

        <div class="stats-grid">
          <div v-for="stat in displayStats" :key="stat.label" class="stat-card">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>

        <div class="stats-cta">
          <p class="stats-cta__text">Looking for something you don’t see here?</p>
          <NuxtLink to="/contact?topic=request" class="stats-cta__btn">
            Request it here
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="about-faq">
      <div class="container">
        <div class="section-heading">
          <span class="section-eyebrow">FAQ</span>
          <h2 class="section-title">Answers before you ask.</h2>
          <p class="section-sub">Everything founders and teams want to know about Moonmart.</p>
        </div>
        <ul class="faq-list">
          <li
            v-for="(faq, i) in faqs"
            :key="faq.q"
            class="faq-item"
            :class="{ 'faq-item--open': openFaqIndex === i }"
          >
            <button
              type="button"
              class="faq-question"
              :aria-expanded="openFaqIndex === i"
              :aria-controls="`faq-panel-${i}`"
              @click="toggleFaq(i)"
            >
              <span>{{ faq.q }}</span>
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <section
              v-show="openFaqIndex === i"
              :id="`faq-panel-${i}`"
              class="faq-answer"
              :aria-label="faq.q"
            >
              <p>{{ faq.a }}</p>
            </section>
          </li>
        </ul>
      </div>
    </section>

    <section class="about-cta">
      <div class="container">
        <h2 class="cta-title">Your software story starts here.</h2>
        <p class="cta-sub">
          Join the founders, teams, and enterprises choosing their next tool with Moonmart.
        </p>
        <div class="cta-actions">
          <NuxtLink to="/signup" class="btn btn-primary">Get started free</NuxtLink>
          <NuxtLink to="/marketplace" class="btn btn-ghost">Browse marketplace</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  background: var(--mm-bg);
  color: var(--mm-pearl);
  font-family: var(--f-ui);
}
.container { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; }

.about-hero { padding: 7rem 0 5rem; background: var(--mm-gold-soft); text-align: center; }
.about-eyebrow {
  display: inline-block; padding: 0.35rem 0.9rem; border-radius: var(--r-full);
  background: var(--mm-s2); color: var(--mm-gold);
  font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.02em;
  margin-bottom: 1.5rem;
}
.about-hero-title {
  font-family: var(--f-display);
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  line-height: 1.1; font-weight: 700;
  margin: 0 auto 1.25rem; max-width: 18ch; color: var(--mm-pearl);
}
.about-hero-title .accent { color: var(--mm-gold); }
.about-hero-sub {
  max-width: 46rem; margin: 0 auto 2.25rem;
  font-size: 1.125rem; line-height: 1.65; color: var(--mm-silver);
}
.about-hero-cta { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.85rem 1.5rem; border-radius: var(--r-sm);
  font-weight: 600; font-size: 0.9375rem; text-decoration: none;
  transition: transform 0.15s ease, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  border: 0.5px solid transparent;
}
.btn-primary { background: var(--mm-gold); color: #0A0700; }
.btn-primary:hover { background: var(--mm-goldl); transform: translateY(-1px); }
.btn-ghost { background: var(--mm-s2); color: var(--mm-silver); border-color: var(--b2); }
.btn-ghost:hover { border-color: var(--mm-gold); color: var(--mm-gold); }

.about-story { padding: 6rem 0; }
.story-chapter {
  display: grid; grid-template-columns: 1.25fr 1fr; gap: 3rem;
  align-items: center; padding: 2.5rem 0; border-bottom: 0.5px solid var(--b1);
}
.story-chapter:last-child { border-bottom: none; }
.story-chapter--flip .story-copy { order: 2; }
.story-chapter--flip .story-visual { order: 1; }
.story-kicker {
  display: inline-block; color: var(--mm-gold);
  font-weight: 600; font-size: 0.8125rem;
  text-transform: uppercase; letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
}
.story-title {
  font-family: var(--f-display);
  font-size: clamp(1.75rem, 3.2vw, 2.5rem);
  font-weight: 700; line-height: 1.2; margin: 0 0 1rem; color: var(--mm-pearl);
}
.story-body { font-size: 1.0625rem; line-height: 1.7; color: var(--mm-silver); margin: 0; max-width: 42ch; }
.story-visual {
  display: flex; align-items: center; justify-content: center;
  min-height: 220px; background: var(--mm-s2);
  border: 0.5px solid var(--b1); border-radius: var(--r-xl);
}
.story-index {
  font-family: var(--f-display);
  font-size: clamp(4rem, 10vw, 7rem);
  font-weight: 700; color: var(--mm-gold); line-height: 1;
}

.section-heading { text-align: center; max-width: 42rem; margin: 0 auto 3rem; }
.section-eyebrow {
  display: inline-block; color: var(--mm-gold);
  font-weight: 600; font-size: 0.8125rem;
  text-transform: uppercase; letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
}
.section-title {
  font-family: var(--f-display);
  font-size: clamp(1.75rem, 3.2vw, 2.5rem);
  font-weight: 700; line-height: 1.2; margin: 0 0 0.75rem; color: var(--mm-pearl);
}
.section-sub { color: var(--mm-silver); font-size: 1.0625rem; line-height: 1.65; margin: 0; }

.about-audiences { padding: 6rem 0; background: var(--mm-s1); }

.stage-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;
  position: relative;
}
.stage-picker::before {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  top: 22px;
  height: 2px;
  background: var(--b1);
  z-index: 0;
}
.stage-chip {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1rem 1.1rem;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
  font-family: inherit;
}
.stage-chip:hover {
  border-color: var(--mm-gold);
  transform: translateY(-2px);
}
.stage-chip:focus-visible {
  outline: 2px solid var(--mm-gold);
  outline-offset: 2px;
}
.stage-chip--active {
  border-color: var(--mm-gold);
  box-shadow: 0 10px 28px var(--mm-gold-soft);
}
.stage-chip__step {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mm-gold);
}
.stage-chip__title {
  font-family: var(--f-ui);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--mm-pearl);
}

.stage-panel {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 2rem;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-xl);
  padding: 2rem;
}
.stage-panel__tagline {
  display: inline-block;
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  padding: 0.3rem 0.75rem;
  border-radius: var(--r-full);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  margin-bottom: 1rem;
}
.stage-panel__title {
  font-family: var(--f-display);
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 0.75rem;
  line-height: 1.2;
}
.stage-panel__description {
  color: var(--mm-silver);
  font-size: 1rem;
  line-height: 1.7;
  margin: 0 0 1.25rem;
  max-width: 48ch;
}
.stage-panel__points {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.625rem;
}
.stage-panel__points li {
  display: flex;
  gap: 0.625rem;
  align-items: flex-start;
  font-size: 0.9375rem;
  color: var(--mm-silver);
  line-height: 1.55;
}
.stage-panel__points svg {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  color: var(--mm-gold);
}

.stage-panel__aside {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  background: var(--mm-gold-soft);
  border-radius: var(--r-lg);
  padding: 1.75rem;
}
.stage-highlight__value {
  font-family: var(--f-display);
  font-size: clamp(1.75rem, 3.4vw, 2.5rem);
  font-weight: 700;
  color: var(--mm-gold);
  line-height: 1;
  margin-bottom: 0.35rem;
}
.stage-highlight__label {
  color: var(--mm-silver);
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}
.stage-progress {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}
.stage-progress__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--b2);
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.stage-progress__dot--active {
  background: var(--mm-gold);
  transform: scale(1.15);
}

.about-pillars { padding: 6rem 0; }
.pillar-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 760px;
  margin-inline: auto;
  border-top: 1px solid #eee;
}
.pillar-item {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 1.5rem;
  padding: 1.75rem 0;
  border-bottom: 0.5px solid var(--b1);
}
.pillar-item__num {
  font-family: var(--f-ui);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--mm-gold);
  padding-top: 0.25rem;
}
.pillar-item__title {
  font-family: var(--f-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 0.375rem;
}
.pillar-item__body {
  margin: 0 0 0.5rem;
  color: var(--mm-silver);
  line-height: 1.6;
  font-size: 0.9375rem;
}
.pillar-item__outcome {
  margin: 0;
  color: var(--mm-silver);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.55;
}

.about-stats { padding: 5rem 0; background: var(--mm-s1); color: var(--mm-pearl); }
.stats-heading { text-align: center; max-width: 640px; margin: 0 auto 2.5rem; }
.stats-eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mm-gold);
  margin-bottom: 0.75rem;
}
.stats-title {
  font-family: var(--f-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 0.75rem;
  line-height: 1.25;
}
.stats-sub {
  color: var(--mm-silver);
  font-size: 0.9375rem;
  margin: 0;
  line-height: 1.6;
}
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; text-align: center; }
.stat-card { padding: 1rem; }
.stat-value {
  font-family: var(--f-display);
  font-size: clamp(2rem, 4vw, 3rem); font-weight: 700;
  color: var(--mm-gold); line-height: 1;
}
.stat-label { margin-top: 0.5rem; color: var(--mm-silver); font-size: 0.9375rem; }
.stats-cta {
  margin-top: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 0.5px solid var(--b1);
}
.stats-cta__text {
  margin: 0;
  color: var(--mm-silver);
  font-size: 0.9375rem;
}
.stats-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: var(--mm-gold);
  color: #0A0700;
  border-radius: var(--r-sm);
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: background-color 0.15s ease, transform 0.15s ease;
}
.stats-cta__btn:hover {
  background: var(--mm-goldl);
  transform: translateY(-1px);
}
.stats-cta__btn svg { width: 16px; height: 16px; }

.about-faq { padding: 6rem 0; background: var(--mm-s1); }
.faq-list { list-style: none; padding: 0; margin: 0 auto; max-width: 48rem; display: grid; gap: 0.75rem; }
.faq-item { background: var(--mm-s2); border: 0.5px solid var(--b1); border-radius: var(--r-lg); overflow: hidden; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
.faq-item:hover { border-color: var(--mm-gold); }
.faq-item--open { border-color: var(--mm-gold); box-shadow: 0 8px 20px var(--mm-gold-soft); }
.faq-question {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 1.1rem 1.35rem; background: transparent; border: none;
  text-align: left; cursor: pointer;
  font-family: var(--f-display);
  font-size: 1rem; font-weight: 600; color: var(--mm-pearl);
}
.faq-question:focus-visible { outline: 2px solid var(--mm-gold); outline-offset: -2px; }
.faq-chevron { width: 18px; height: 18px; color: var(--mm-gold); transition: transform 0.2s ease; flex: 0 0 auto; }
.faq-item--open .faq-chevron { transform: rotate(180deg); }
.faq-answer { padding: 0 1.35rem 1.1rem; }
.faq-answer p { margin: 0; color: var(--mm-silver); line-height: 1.65; font-size: 0.9375rem; }

.about-cta { padding: 6rem 0; text-align: center; }
.cta-title {
  font-family: var(--f-display);
  font-size: clamp(1.75rem, 3.4vw, 2.5rem);
  font-weight: 700; margin: 0 0 0.75rem; color: var(--mm-pearl);
}
.cta-sub { max-width: 36rem; margin: 0 auto 2rem; color: var(--mm-silver); font-size: 1.0625rem; line-height: 1.65; }
.cta-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }

@media (max-width: 768px) {
  .story-chapter { grid-template-columns: 1fr; text-align: left; gap: 1.5rem; }
  .story-chapter--flip .story-copy,
  .story-chapter--flip .story-visual { order: 0; }
  .story-visual { min-height: 140px; }

  .stage-picker { grid-template-columns: repeat(2, 1fr); }
  .stage-picker::before { display: none; }
  .stage-panel { grid-template-columns: 1fr; padding: 1.5rem; }
  .stage-panel__aside { flex-direction: row; align-items: center; justify-content: space-between; padding: 1.25rem; }

  .pillar-item { grid-template-columns: 1fr; gap: 0.5rem; }
}
</style>
