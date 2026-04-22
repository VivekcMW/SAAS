<template>
  <section class="vendor-cta">
    <div class="vendor-cta__inner">
      <div class="vendor-cta__grid">
        <!-- Left: content -->
        <div class="vendor-cta__content">
          <span class="vendor-cta__eyebrow">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2l2.6 6.4L21 10l-4.9 4.3L17.8 21 12 17.6 6.2 21l1.7-6.7L3 10l6.4-1.6z" fill="currentColor"/></svg>
            For vendors
          </span>
          <h2 class="vendor-cta__title">
            Built a SaaS? Get found by buyers <span class="vendor-cta__accent">ready to buy.</span>
          </h2>
          <p class="vendor-cta__lede">
            List in 2 minutes and show up where evaluators are actually shortlisting —
            ranked by fit, not bids. Free forever for the core listing.
          </p>

          <ul class="vendor-cta__pills">
            <li v-for="p in pills" :key="p">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ p }}
            </li>
          </ul>

          <div class="vendor-cta__actions">
            <NuxtLink to="/list-product" class="vendor-cta__btn vendor-cta__btn--primary">
              List your app
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </NuxtLink>
            <NuxtLink to="/pricing" class="vendor-cta__btn vendor-cta__btn--secondary">See pricing</NuxtLink>
          </div>
        </div>

        <!-- Right: stats / proof -->
        <aside class="vendor-cta__proof" aria-label="Vendor stats">
          <div v-for="s in stats" :key="s.label" class="vendor-cta__stat">
            <div class="vendor-cta__stat-icon" aria-hidden="true" v-html="s.icon" />
            <div class="vendor-cta__stat-body">
              <div class="vendor-cta__stat-value">{{ s.value }}</div>
              <div class="vendor-cta__stat-label">{{ s.label }}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const pills = [
  'Free forever for core listing',
  '2-minute setup',
  'No pay-to-play rankings',
  'Verified buyer reviews'
]

const stats = [
  {
    value: '40K+',
    label: 'monthly buyer visits',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  },
  {
    value: '1,200+',
    label: 'apps live across 167 categories',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'
  },
  {
    value: '3.2x',
    label: 'avg demo requests vs. paid ads',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>'
  }
]
</script>

<style scoped>
.vendor-cta {
  padding: 4rem 1.5rem 5rem;
  background: #fbfaf8;
  border-top: 1px solid #f0efec;
}
.vendor-cta__inner { max-width: 1200px; margin: 0 auto; }

.vendor-cta__grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 3rem;
  align-items: center;
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 60px -40px rgba(15, 23, 42, 0.2);
  position: relative;
  overflow: hidden;
}
.vendor-cta__grid::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 136, 56, 0.12), transparent 70%);
  pointer-events: none;
}

@media (max-width: 900px) {
  .vendor-cta { padding: 3rem 1rem 3.5rem; }
  .vendor-cta__grid { grid-template-columns: 1fr; padding: 2rem 1.5rem; gap: 2rem; border-radius: 18px; }
}

.vendor-cta__content { position: relative; z-index: 1; }

.vendor-cta__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  margin-bottom: 1rem;
}

.vendor-cta__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.02em;
  color: #1e1e1e;
  margin: 0 0 0.85rem;
}
.vendor-cta__accent { color: var(--sw-primary, #ff8838); }

.vendor-cta__lede {
  color: #52525b;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;
  max-width: 540px;
}

.vendor-cta__pills {
  list-style: none;
  padding: 0;
  margin: 0 0 1.75rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem 1rem;
}
.vendor-cta__pills li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1e1e1e;
  font-size: 0.9rem;
  font-weight: 500;
}
.vendor-cta__pills svg { color: var(--sw-primary, #ff8838); flex-shrink: 0; }
@media (max-width: 520px) { .vendor-cta__pills { grid-template-columns: 1fr; } }

.vendor-cta__actions { display: flex; gap: 0.65rem; flex-wrap: wrap; }

.vendor-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.8rem 1.35rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}
.vendor-cta__btn--primary {
  background: var(--sw-primary, #ff8838);
  color: #fff;
  box-shadow: 0 10px 24px -12px rgba(255, 136, 56, 0.6);
}
.vendor-cta__btn--primary:hover {
  background: var(--sw-primary-hover, #e67326);
  transform: translateY(-1px);
  box-shadow: 0 14px 30px -14px rgba(255, 136, 56, 0.7);
}
.vendor-cta__btn--secondary {
  background: #fff;
  color: #1e1e1e;
  border-color: #e4e0dc;
}
.vendor-cta__btn--secondary:hover {
  border-color: var(--sw-primary, #ff8838);
  color: var(--sw-primary, #ff8838);
}

/* Proof stats */
.vendor-cta__proof {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.vendor-cta__stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: #fbfaf8;
  border: 1px solid #f0efec;
  border-radius: 14px;
  transition: all 0.15s ease;
}
.vendor-cta__stat:hover {
  border-color: var(--sw-primary, #ff8838);
  background: #fff;
  transform: translateX(-3px);
}
.vendor-cta__stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.vendor-cta__stat-body { min-width: 0; }
.vendor-cta__stat-value {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e1e1e;
  letter-spacing: -0.01em;
  line-height: 1.1;
}
.vendor-cta__stat-label {
  color: #71717a;
  font-size: 0.85rem;
  margin-top: 0.15rem;
}
</style>
