<template>
  <main class="mk-page">
    <section class="mk-hero">
      <div class="mk-hero__inner">
        <p class="mk-eyebrow">Sitemap</p>
        <h1 class="mk-hero__title">Everything on Moonmart</h1>
        <p class="mk-hero__lede">
          A human-readable map of every public section on the site. Looking for the XML
          version for crawlers? It's at
          <a href="/sitemap.xml">/sitemap.xml</a>.
        </p>
      </div>
    </section>

    <section class="mk-section">
      <div class="mk-section__inner sitemap-grid">
        <div v-for="group in groups" :key="group.title" class="sitemap-col">
          <h2 class="sitemap-col__title">{{ group.title }}</h2>
          <ul>
            <li v-for="l in group.links" :key="l.to">
              <NuxtLink :to="l.to">{{ l.label }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { applySEO } = useSEO()
applySEO({
  title: 'Sitemap | Moonmart',
  description: 'A human-readable sitemap of every page on Moonmart.',
  canonical: 'https://moonmart.ai/sitemap',
  ogType: 'website'
})

const groups = [
  {
    title: 'Product',
    links: [
      { to: '/marketplace', label: 'Marketplace' },
      { to: '/integrations', label: 'Integrations' },
      { to: '/features', label: 'Features' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/demo', label: 'Book a demo' }
    ]
  },
  {
    title: 'Solutions',
    links: [
      { to: '/solutions', label: 'All solutions' },
      { to: '/compare', label: 'Compare tools' },
      { to: '/alternatives', label: 'Alternatives' },
      { to: '/customers', label: 'Customer stories' },
      { to: '/reviews', label: 'Reviews' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { to: '/blog', label: 'Blog' },
      { to: '/news', label: 'Events & news' },
      { to: '/guides', label: 'Guides' },
      { to: '/documentation', label: 'Documentation' },
      { to: '/help', label: 'Help center' },
      { to: '/glossary', label: 'SaaS glossary' },
      { to: '/community', label: 'Community' },
      { to: '/roadmap', label: 'Roadmap' },
      { to: '/changelog', label: 'Changelog' }
    ]
  },
  {
    title: 'Vendors',
    links: [
      { to: '/list-product', label: 'List your product' },
      { to: '/partners', label: 'Partner program' },
      { to: '/vendor-terms', label: 'Vendor terms' }
    ]
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/careers', label: 'Careers' },
      { to: '/press', label: 'Press' },
      { to: '/contact', label: 'Contact' }
    ]
  },
  {
    title: 'Trust & status',
    links: [
      { to: '/trust', label: 'Trust Center' },
      { to: '/status', label: 'System status' },
      { to: '/security', label: 'Security' },
      { to: '/accessibility', label: 'Accessibility' },
      { to: '/subprocessors', label: 'Subprocessors' },
      { to: '/sla', label: 'SLA' },
      { to: '/dpa', label: 'DPA' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { to: '/terms', label: 'Terms' },
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/privacy-choices', label: 'Your privacy choices' },
      { to: '/cookies', label: 'Cookie Policy' },
      { to: '/licenses', label: 'Open-source licenses' },
      { to: '/copyright', label: 'Copyright & DMCA' },
      { to: '/acceptable-use', label: 'Acceptable use' },
      { to: '/refund', label: 'Refund policy' },
      { to: '/imprint', label: 'Imprint' }
    ]
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Log in' },
      { to: '/signup', label: 'Sign up' },
      { to: '/forgot-password', label: 'Forgot password' },
      { to: '/dashboard', label: 'Dashboard' }
    ]
  }
]
</script>

<style scoped>
.sitemap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
}
.sitemap-col__title {
  font-family: var(--f-display);
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--mm-gold);
  margin: 0 0 1rem;
}
.sitemap-col ul { list-style: none; padding: 0; margin: 0; }
.sitemap-col li { margin-bottom: 0.55rem; }
.sitemap-col a { color: var(--mm-silver); font-size: 0.92rem; text-decoration: none; transition: color 0.15s; }
.sitemap-col a:hover { color: var(--mm-gold); }
</style>
