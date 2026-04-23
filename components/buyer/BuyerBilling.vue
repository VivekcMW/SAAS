<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Billing</h1>
        <p class="bw-head__sub">Your SaaSWorld plan and invoices.</p>
      </div>
    </header>

    <div class="bw-grid bw-grid--main-aside">
      <!-- Plan + invoices -->
      <div>
        <section class="bw-card plan">
          <div class="plan__head">
            <div>
              <div class="plan__eyebrow">Current plan</div>
              <h2 class="plan__name">{{ plan.name }}</h2>
              <div class="plan__price">{{ plan.price }}<span>/ month</span></div>
            </div>
            <span class="bw-chip bw-chip--success">Active</span>
          </div>
          <ul class="plan__features">
            <li v-for="f in plan.features" :key="f">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ f }}
            </li>
          </ul>
          <div class="plan__foot">
            <div>
              <div class="plan__label">Next payment</div>
              <div class="plan__value">{{ plan.nextPayment }}</div>
            </div>
            <div>
              <div class="plan__label">Payment method</div>
              <div class="plan__value">Visa •••• 4242</div>
            </div>
            <div style="margin-left: auto; display: flex; gap: 8px;">
              <button class="bw-btn bw-btn--ghost">Update card</button>
              <button class="bw-btn bw-btn--primary">Upgrade</button>
            </div>
          </div>
        </section>

        <section class="bw-card bw-section" style="padding: 0;">
          <div class="bw-card__head" style="padding: 20px 20px 0;">
            <h2 class="bw-card__title">Invoices</h2>
          </div>
          <table class="bw-table">
            <thead>
              <tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="inv in invoices" :key="inv.id">
                <td>{{ inv.date }}</td>
                <td>{{ inv.description }}</td>
                <td>${{ inv.amount }}</td>
                <td><span class="bw-chip bw-chip--success">Paid</span></td>
                <td><a href="#" class="bw-card__link">Download</a></td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <!-- Aside -->
      <aside>
        <section class="bw-card">
          <h3 style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1rem; margin: 0 0 12px;">Plan options</h3>
          <div v-for="p in allPlans" :key="p.name" class="plan-opt" :class="{ 'is-current': p.name === plan.name }">
            <div>
              <div class="plan-opt__name">{{ p.name }}</div>
              <div class="plan-opt__price">{{ p.price }} <span>/ mo</span></div>
            </div>
            <button v-if="p.name !== plan.name" class="bw-btn bw-btn--ghost bw-btn--sm">Switch</button>
            <span v-else class="bw-chip bw-chip--primary">Current</span>
          </div>
        </section>
        <section class="bw-card" style="margin-top: 16px;">
          <h3 style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1rem; margin: 0 0 8px;">Need help?</h3>
          <p style="font-size: 0.86rem; color: var(--bw-text-muted); margin: 0 0 12px;">Questions about your plan, invoices or refunds?</p>
          <NuxtLink to="/contact" class="bw-btn bw-btn--ghost">Contact support</NuxtLink>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
const plan = {
  name: 'Buyer Pro',
  price: '$19',
  nextPayment: 'May 24, 2026',
  features: [
    'Unlimited saved apps & comparisons',
    'AI recommendations',
    'Collaborative shortlists (up to 5 teammates)',
    'Priority vendor replies',
    'Export comparisons to PDF'
  ]
}

const allPlans = [
  { name: 'Buyer Free', price: '$0' },
  { name: 'Buyer Pro', price: '$19' },
  { name: 'Buyer Team', price: '$49' }
]

const invoices = [
  { id: 1, date: 'Apr 24, 2026', description: 'Buyer Pro — monthly', amount: 19 },
  { id: 2, date: 'Mar 24, 2026', description: 'Buyer Pro — monthly', amount: 19 },
  { id: 3, date: 'Feb 24, 2026', description: 'Buyer Pro — monthly', amount: 19 }
]
</script>

<style scoped>
.plan__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.plan__eyebrow { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: var(--bw-text-subtle); }
.plan__name { font-family: 'Poppins', sans-serif; font-size: 1.4rem; font-weight: 700; margin: 4px 0; }
.plan__price { font-family: 'Poppins', sans-serif; font-size: 2rem; font-weight: 700; color: var(--bw-primary); }
.plan__price span { font-size: 0.9rem; color: var(--bw-text-muted); font-weight: 500; margin-left: 4px; }
.plan__features { list-style: none; padding: 0; margin: 0 0 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
.plan__features li { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--bw-text-muted); }
.plan__features svg { color: var(--bw-success); flex-shrink: 0; }
.plan__foot { display: flex; gap: 24px; align-items: center; padding-top: 16px; border-top: 1px solid var(--bw-border); flex-wrap: wrap; }
.plan__label { font-size: 0.76rem; text-transform: uppercase; color: var(--bw-text-subtle); letter-spacing: 0.05em; }
.plan__value { font-weight: 600; font-size: 0.92rem; }

.plan-opt { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--bw-border); }
.plan-opt:last-child { border-bottom: none; }
.plan-opt.is-current { background: var(--bw-primary-50); margin: 0 -20px; padding: 10px 20px; }
.plan-opt__name { font-weight: 600; font-size: 0.92rem; }
.plan-opt__price { font-family: 'Poppins', sans-serif; font-weight: 700; color: var(--bw-primary); }
.plan-opt__price span { color: var(--bw-text-muted); font-size: 0.75rem; font-weight: 500; }
</style>
