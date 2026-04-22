<template>
  <main class="mk-page">
    <section class="mk-hero">
      <div class="mk-hero__inner">
        <p class="mk-eyebrow">Glossary</p>
        <h1 class="mk-hero__title">The SaaS glossary</h1>
        <p class="mk-hero__lede">
          Plain-English definitions of the terms you meet every day when buying, building or
          selling software. Updated monthly.
        </p>

        <div class="gl-search">
          <input
            v-model="q"
            type="search"
            placeholder="Search 50+ terms (e.g. ARR, churn, SSO)"
            aria-label="Search glossary"
            class="gl-search__input"
          >
        </div>

        <nav class="gl-alpha" aria-label="Jump to letter">
          <a v-for="letter in letters" :key="letter" :href="`#ltr-${letter}`" class="gl-alpha__btn">
            {{ letter }}
          </a>
        </nav>
      </div>
    </section>

    <section class="mk-section">
      <div class="mk-section__inner">
        <div v-for="group in filteredGroups" :key="group.letter" :id="`ltr-${group.letter}`" class="gl-group">
          <h2 class="gl-group__letter">{{ group.letter }}</h2>
          <div class="gl-list">
            <article v-for="t in group.terms" :key="t.term" class="gl-term">
              <h3 class="gl-term__name">{{ t.term }}<span v-if="t.abbr" class="gl-term__abbr">({{ t.abbr }})</span></h3>
              <p class="gl-term__def">{{ t.def }}</p>
              <p v-if="t.see" class="gl-term__see">See also: <NuxtLink v-for="(s, i) in t.see" :key="s" :to="`#ltr-${s[0].toUpperCase()}`"><span v-if="i > 0">, </span>{{ s }}</NuxtLink></p>
            </article>
          </div>
        </div>

        <p v-if="filteredGroups.length === 0" class="gl-empty">No terms match "{{ q }}".</p>
      </div>
    </section>

    <section class="mk-cta">
      <div class="mk-cta__inner">
        <h2 class="mk-cta__title">Missing a term?</h2>
        <p class="mk-cta__lede">Suggest a definition and we'll add it with credit.</p>
        <div class="mk-cta__row">
          <NuxtLink to="/contact?subject=glossary" class="mk-btn mk-btn--primary">Suggest a term</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { applySEO } = useSEO()
applySEO({
  title: 'SaaS glossary | SaaSWorld',
  description: 'Plain-English definitions for 50+ SaaS, GTM, product and finance terms you meet every day.',
  canonical: 'https://saasworld.com/glossary',
  ogType: 'website'
})

const q = ref('')

interface Term { term: string; abbr?: string; def: string; see?: string[] }

const terms: Term[] = [
  { term: 'Activation', def: 'The moment a new user experiences the core value of a product for the first time — e.g., sending a first Slack message.' },
  { term: 'Annual Contract Value', abbr: 'ACV', def: 'The average annualised revenue from a single customer contract, excluding one-off fees.' },
  { term: 'Annual Recurring Revenue', abbr: 'ARR', def: 'The total recurring revenue a SaaS business expects over a 12-month period at a given point in time.', see: ['MRR', 'NRR'] },
  { term: 'API', def: 'Application Programming Interface — the contract that lets two pieces of software exchange data.' },
  { term: 'Attribution', def: 'The practice of assigning credit for a sale to one or more marketing touches.' },
  { term: 'Bottoms-up adoption', def: 'Go-to-market motion where individuals adopt a tool first and buying decisions bubble up to IT.' },
  { term: 'Bounce rate', def: 'Percentage of visitors who leave a site after seeing one page. High bounce on landing pages usually signals a message-match problem.' },
  { term: 'Burn rate', def: 'How quickly a company spends cash — gross burn is outflow, net burn is outflow minus income.' },
  { term: 'CAC', def: 'Customer Acquisition Cost. All sales & marketing spend divided by new customers acquired in the period.', see: ['LTV', 'Payback period'] },
  { term: 'Churn', def: 'Rate at which customers cancel. Logo churn counts accounts, revenue churn weights by price.', see: ['NRR', 'Retention'] },
  { term: 'CPM', def: 'Cost Per Mille — cost per 1,000 impressions in advertising.' },
  { term: 'CRM', def: 'Customer Relationship Management — the system of record for contacts, deals and pipeline.' },
  { term: 'Cohort analysis', def: 'Grouping users by a shared trait (usually signup month) to compare behaviour over time.' },
  { term: 'Conversion rate', def: 'Percentage of people who complete a desired action out of those who had the chance.' },
  { term: 'DAU / MAU', def: 'Daily and Monthly Active Users. Ratio indicates engagement stickiness.' },
  { term: 'Deliverability', def: 'The share of emails that successfully land in inboxes — not spam folders.' },
  { term: 'DPA', def: 'Data Processing Agreement — GDPR-required contract between a controller and processor.', see: ['GDPR', 'SCC'] },
  { term: 'EBITDA', def: 'Earnings Before Interest, Taxes, Depreciation and Amortisation — a proxy for operating profitability.' },
  { term: 'Event', def: 'A discrete action recorded by product analytics, e.g. `button_clicked`.' },
  { term: 'Freemium', def: 'Pricing model offering a free tier with the option to upgrade to paid features.' },
  { term: 'Funnel', def: 'The sequence of steps from first touch to conversion, e.g. visit → signup → paid.' },
  { term: 'GDPR', def: 'EU General Data Protection Regulation — the primary EU privacy law, in force since May 2018.' },
  { term: 'GMV', def: 'Gross Merchandise Value — total value of transactions processed, before fees or refunds.' },
  { term: 'Headless', def: 'A system where the backend (APIs) is decoupled from the frontend, enabling multi-channel delivery.' },
  { term: 'ICP', def: 'Ideal Customer Profile — the account archetype most likely to succeed with a product.' },
  { term: 'Idempotency', def: 'Property of an API call that can be safely retried without side-effects, often via an idempotency-key header.' },
  { term: 'Integration', def: 'A connection between two SaaS products, typically via API, webhooks or native app.' },
  { term: 'Jobs To Be Done', abbr: 'JTBD', def: 'Framework that defines products by the "job" a customer hires them to do.' },
  { term: 'KPI', def: 'Key Performance Indicator — a metric explicitly tied to a business goal.' },
  { term: 'Land and expand', def: 'Sales motion: land a small initial contract, expand via upsell and cross-sell.' },
  { term: 'LTV', def: 'Lifetime Value — the gross margin a customer produces over their whole relationship with you.', see: ['CAC', 'Churn'] },
  { term: 'Marketing Qualified Lead', abbr: 'MQL', def: 'A lead that marketing judges likely to become a customer, ready to hand to sales.' },
  { term: 'MRR', def: 'Monthly Recurring Revenue — the predictable monthly subscription revenue.', see: ['ARR'] },
  { term: 'Net Promoter Score', abbr: 'NPS', def: 'Customer loyalty metric on a −100 to +100 scale, based on "How likely are you to recommend us?"' },
  { term: 'NRR', def: 'Net Revenue Retention — MRR retained from existing customers, including expansion, minus downgrades and churn. Target > 110%.' },
  { term: 'Onboarding', def: 'The guided process of getting a new user to first value and habit formation.' },
  { term: 'PLG', def: 'Product-Led Growth — go-to-market strategy where the product drives acquisition, conversion and expansion.' },
  { term: 'PQL', def: 'Product Qualified Lead — a user whose in-product behaviour signals readiness to buy.' },
  { term: 'Payback period', def: 'Months of gross profit needed to recover the cost of acquiring a customer.' },
  { term: 'Quota', def: 'The revenue target assigned to a sales rep for a period.' },
  { term: 'Retention', def: 'Percentage of users or revenue kept over a period. Inverse of churn.' },
  { term: 'Revenue Operations', abbr: 'RevOps', def: 'The function that aligns marketing, sales and CS ops into one revenue engine.' },
  { term: 'SaaS', def: 'Software-as-a-Service — software delivered over the internet on a subscription basis.' },
  { term: 'SCC', def: 'Standard Contractual Clauses — EU-approved contract template for international data transfers.', see: ['GDPR', 'DPA'] },
  { term: 'SOC 2', def: 'AICPA audit report on a service provider\'s security, availability, processing integrity, confidentiality and privacy controls.' },
  { term: 'SSO', def: 'Single Sign-On — authenticate once with an identity provider, access many apps.' },
  { term: 'Time to First Value', abbr: 'TTFV', def: 'How long from signup to the user\'s first "aha" moment.' },
  { term: 'Total Addressable Market', abbr: 'TAM', def: 'Total revenue opportunity if you captured 100% of the market.' },
  { term: 'Unit economics', def: 'Revenue and cost associated with a single customer. Key ratio: LTV / CAC > 3.' },
  { term: 'Usage-based pricing', def: 'Billing model where the invoice depends on consumption, e.g. API calls, MAUs, data processed.' },
  { term: 'Virality', def: 'Growth driven by users inviting other users. Measured by k-factor = invites sent × acceptance rate.' },
  { term: 'Webhook', def: 'An HTTP callback sent by a service when an event occurs, allowing real-time integration.' },
  { term: 'White-label', def: 'Product sold unbranded so buyers can apply their own branding.' }
]

const groups = computed(() => {
  const map = new Map<string, Term[]>()
  for (const t of terms) {
    const l = t.term[0].toUpperCase()
    if (!map.has(l)) map.set(l, [])
    map.get(l)!.push(t)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, list]) => ({ letter, terms: list.sort((a, b) => a.term.localeCompare(b.term)) }))
})

const letters = computed(() => groups.value.map(g => g.letter))

const filteredGroups = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return groups.value
  return groups.value
    .map(g => ({
      ...g,
      terms: g.terms.filter(t =>
        t.term.toLowerCase().includes(query) ||
        t.abbr?.toLowerCase().includes(query) ||
        t.def.toLowerCase().includes(query)
      )
    }))
    .filter(g => g.terms.length > 0)
})
</script>

<style scoped>
.gl-search { max-width: 520px; margin: 0 auto 1.25rem; }
.gl-search__input { width: 100%; padding: 0.8rem 1.1rem; border-radius: 999px; border: 1px solid #f0d9bf; background: #fff; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
.gl-search__input:focus { border-color: var(--sw-primary, #ff8838); }

.gl-alpha { display: flex; flex-wrap: wrap; gap: 0.35rem; justify-content: center; }
.gl-alpha__btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: #fff; border: 1px solid #f0d9bf; color: #1e1e1e; text-decoration: none; font-size: 0.82rem; font-weight: 600; transition: all 0.15s; }
.gl-alpha__btn:hover { background: var(--sw-primary, #ff8838); color: #fff; border-color: var(--sw-primary, #ff8838); }

.gl-group { margin-bottom: 2.5rem; scroll-margin-top: 100px; }
.gl-group__letter { font-family: var(--font-heading, 'Poppins', system-ui, sans-serif); font-size: 2rem; font-weight: 700; color: var(--sw-primary, #ff8838); margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f0d9bf; }
.gl-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
.gl-term { background: #fff; border: 1px solid #f0efec; border-radius: 12px; padding: 1.1rem 1.25rem; }
.gl-term__name { font-family: var(--font-heading, 'Poppins', system-ui, sans-serif); font-size: 1.05rem; font-weight: 700; color: #1e1e1e; margin: 0 0 0.4rem; }
.gl-term__abbr { font-weight: 500; color: #71717a; font-size: 0.88rem; margin-left: 0.4rem; }
.gl-term__def { color: #3f3f46; font-size: 0.9rem; line-height: 1.55; margin: 0; }
.gl-term__see { margin: 0.6rem 0 0; font-size: 0.82rem; color: #71717a; }
.gl-term__see a { color: var(--sw-primary, #ff8838); text-decoration: none; font-weight: 600; }

.gl-empty { text-align: center; color: #71717a; padding: 3rem 0; }
</style>
