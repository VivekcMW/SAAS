<template>
  <main class="trust-page">
    <!-- Hero -->
    <section class="trust-hero">
      <div class="trust-hero__inner">
        <p class="trust-hero__eyebrow">Trust Center</p>
        <h1 class="trust-hero__title">Security, privacy &amp; compliance at Moonmart</h1>
        <p class="trust-hero__lede">
          A single home for how we protect your data, operate our service, and meet the
          legal obligations that come with it.
        </p>
        <div class="trust-hero__cta">
          <NuxtLink to="/status" class="trust-btn trust-btn--primary">Live status</NuxtLink>
          <a href="mailto:security@moonmart.ai" class="trust-btn trust-btn--ghost">Contact security</a>
        </div>
      </div>
    </section>

    <!-- Certifications -->
    <section class="trust-section">
      <div class="trust-section__inner">
        <h2 class="trust-section__title">Certifications &amp; frameworks</h2>
        <p class="trust-section__lede">
          We align our controls with leading industry frameworks. Formal audit reports are
          available under NDA.
        </p>
        <div class="trust-badges">
          <div v-for="b in badges" :key="b.label" class="trust-badge">
            <div class="trust-badge__mark">{{ b.mark }}</div>
            <div>
              <p class="trust-badge__label">{{ b.label }}</p>
              <p class="trust-badge__note">{{ b.note }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Topic cards -->
    <section class="trust-section trust-section--soft">
      <div class="trust-section__inner">
        <h2 class="trust-section__title">Explore</h2>
        <div class="trust-grid">
          <NuxtLink v-for="c in cards" :key="c.to" :to="c.to" class="trust-card">
            <p class="trust-card__eyebrow">{{ c.eyebrow }}</p>
            <h3 class="trust-card__title">{{ c.title }}</h3>
            <p class="trust-card__desc">{{ c.desc }}</p>
            <span class="trust-card__link">Read more →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Contacts -->
    <section class="trust-section">
      <div class="trust-section__inner">
        <h2 class="trust-section__title">Talk to the right team</h2>
        <div class="trust-contacts">
          <div v-for="con in contacts" :key="con.email" class="trust-contact">
            <p class="trust-contact__role">{{ con.role }}</p>
            <a :href="`mailto:${con.email}`" class="trust-contact__email">{{ con.email }}</a>
            <p class="trust-contact__desc">{{ con.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { applySEO } = useSEO()

applySEO({
  title: 'Trust Center | Moonmart',
  description: 'Security, privacy and compliance at Moonmart — one place for everything.',
  canonical: 'https://moonmart.ai/trust',
  ogType: 'website'
})

const badges = [
  { mark: 'SOC 2', label: 'SOC 2 Type II', note: 'Annual audit, report under NDA' },
  { mark: 'ISO', label: 'ISO 27001', note: 'Information security management' },
  { mark: 'GDPR', label: 'GDPR ready', note: 'DPA, SCCs, data-subject rights' },
  { mark: 'CCPA', label: 'CCPA / CPRA', note: 'California privacy rights honoured' },
  { mark: 'PCI', label: 'PCI DSS', note: 'Payments handled by PCI-compliant partners' },
  { mark: 'WCAG', label: 'WCAG 2.1 AA', note: 'Accessibility conformance target' }
]

const cards = [
  { to: '/security', eyebrow: 'Security', title: 'Security program', desc: 'Infrastructure, application, access and incident response controls.' },
  { to: '/privacy', eyebrow: 'Privacy', title: 'Privacy Policy', desc: 'What we collect, why, and how we protect it.' },
  { to: '/privacy-choices', eyebrow: 'Rights', title: 'Your privacy choices', desc: 'Exercise GDPR, CCPA and other rights in one place.' },
  { to: '/dpa', eyebrow: 'Contracts', title: 'Data Processing Agreement', desc: 'GDPR Article 28 terms, SCCs and audit rights.' },
  { to: '/subprocessors', eyebrow: 'Supply chain', title: 'Subprocessors', desc: 'The third parties we engage and how we notify changes.' },
  { to: '/accessibility', eyebrow: 'Inclusion', title: 'Accessibility', desc: 'WCAG 2.1 AA conformance, testing matrix, feedback.' },
  { to: '/acceptable-use', eyebrow: 'Rules', title: 'Acceptable Use', desc: 'What you can — and cannot — do on the platform.' },
  { to: '/sla', eyebrow: 'Service', title: 'Service Level Agreement', desc: 'Uptime commitment, exclusions and credits.' },
  { to: '/status', eyebrow: 'Live', title: 'System status', desc: 'Real-time availability and historical uptime.' }
]

const contacts = [
  { role: 'Security & vulnerability disclosure', email: 'security@moonmart.ai', desc: 'Report a vulnerability, ask about our security program.' },
  { role: 'Privacy & data protection', email: 'privacy@moonmart.ai', desc: 'Privacy rights, DPAs, subprocessor questions.' },
  { role: 'Legal & compliance', email: 'legal@moonmart.ai', desc: 'Contracts, certifications, regulatory requests.' }
]
</script>

<style scoped>
.trust-page { background: var(--mm-bg); min-height: 100vh; }

/* Hero */
.trust-hero {
  background: var(--mm-gold-soft);
  padding: 5rem 1.5rem 3.5rem;
  border-bottom: 0.5px solid var(--mm-gold);
}
.trust-hero__inner { max-width: 960px; margin: 0 auto; text-align: center; }
.trust-hero__eyebrow {
  color: var(--mm-gold);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0 0 1rem;
}
.trust-hero__title {
  font-family: var(--f-display);
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  font-weight: 700;
  color: var(--mm-pearl);
  line-height: 1.15;
  margin: 0 0 1rem;
}
.trust-hero__lede {
  font-size: 1.125rem;
  color: var(--mm-silver);
  max-width: 640px;
  margin: 0 auto 2rem;
  line-height: 1.65;
}
.trust-hero__cta { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
.trust-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.7rem 1.3rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.2s ease;
}
.trust-btn--primary {
  background: var(--mm-gold);
  color: #0A0700;
}
.trust-btn--primary:hover { background: var(--mm-goldl); }
.trust-btn--ghost {
  border: 0.5px solid var(--b2);
  background: var(--mm-s2);
  color: var(--mm-silver);
}
.trust-btn--ghost:hover { border-color: var(--mm-gold); color: var(--mm-gold); }

/* Sections */
.trust-section { padding: 4rem 1.5rem; }
.trust-section--soft { background: var(--mm-s1); border-top: 0.5px solid var(--b1); border-bottom: 0.5px solid var(--b1); }
.trust-section__inner { max-width: 1120px; margin: 0 auto; }
.trust-section__title {
  font-family: var(--f-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 0.75rem;
}
.trust-section__lede {
  color: var(--mm-silver);
  font-size: 1rem;
  max-width: 640px;
  margin: 0 0 2rem;
  line-height: 1.65;
}

/* Badges */
.trust-badges {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.trust-badge {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.1rem;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
}
.trust-badge__mark {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: var(--r-md);
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
}
.trust-badge__label { margin: 0; font-weight: 700; color: var(--mm-pearl); font-size: 0.95rem; }
.trust-badge__note { margin: 0.15rem 0 0; color: var(--mm-slate); font-size: 0.82rem; }

/* Grid */
.trust-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.trust-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  text-decoration: none;
  transition: all 0.2s ease;
}
.trust-card:hover {
  transform: translateY(-2px);
  border-color: var(--mm-gold);
  box-shadow: 0 10px 25px -12px var(--mm-gold-soft);
}
.trust-card__eyebrow {
  color: var(--mm-gold);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0 0 0.6rem;
}
.trust-card__title {
  font-family: var(--f-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 0.5rem;
}
.trust-card__desc { color: var(--mm-silver); font-size: 0.92rem; line-height: 1.55; margin: 0 0 1rem; flex: 1; }
.trust-card__link { color: var(--mm-gold); font-weight: 600; font-size: 0.9rem; }

/* Contacts */
.trust-contacts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}
.trust-contact {
  padding: 1.25rem 1.3rem;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
}
.trust-contact__role { margin: 0 0 0.25rem; font-weight: 700; color: var(--mm-pearl); font-size: 0.95rem; }
.trust-contact__email { display: block; color: var(--mm-gold); font-weight: 600; margin-bottom: 0.5rem; text-decoration: none; }
.trust-contact__email:hover { text-decoration: underline; }
.trust-contact__desc { margin: 0; color: var(--mm-slate); font-size: 0.85rem; line-height: 1.5; }
</style>
