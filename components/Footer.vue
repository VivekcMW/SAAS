<!-- eslint-disable vue/multi-word-component-names -->
<!-- Footer component for Moonmart -->
<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <NuxtLink to="/" class="footer-logo">
            <MoonmartLogo class="logo-icon" variant="nav" />
            <span>Moon<span class="logo-accent">mart</span></span>
          </NuxtLink>
          <p class="brand-description">
            Your world of software, connected. Discover, compare, and launch the right SaaS for every team.
          </p>
          <div class="social-links">
            <a href="#" aria-label="Twitter"><UIcon dynamic name="i-simple-icons-twitter" /></a>
            <a href="#" aria-label="LinkedIn"><UIcon dynamic name="i-simple-icons-linkedin" /></a>
            <a href="#" aria-label="YouTube"><UIcon dynamic name="i-simple-icons-youtube" /></a>
          </div>
        </div>

        <div class="footer-links">
          <div class="footer-links-column">
            <h3>Product</h3>
            <ul>
              <li><NuxtLink to="/marketplace">Marketplace</NuxtLink></li>
              <li><NuxtLink to="/alternatives">Alternatives</NuxtLink></li>
              <li><NuxtLink to="/integrations">Integrations</NuxtLink></li>
              <li><NuxtLink to="/pricing">Pricing</NuxtLink></li>
              <li><NuxtLink to="/demo">Book a demo</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-links-column">
            <h3>Vendors</h3>
            <ul>
              <li><NuxtLink to="/list-product">List your product</NuxtLink></li>
              <li><NuxtLink to="/partners">Partner program</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-links-column">
            <h3>Company</h3>
            <ul>
              <li><NuxtLink to="/about">About</NuxtLink></li>
              <li><NuxtLink to="/customers">Customers</NuxtLink></li>
              <li><NuxtLink to="/careers">Careers <span class="pill-soft">Hiring</span></NuxtLink></li>
              <li><NuxtLink to="/blog">Blog</NuxtLink></li>
              <li><NuxtLink to="/news">Events &amp; news</NuxtLink></li>
              <li><NuxtLink to="/glossary">Glossary</NuxtLink></li>
              <li><NuxtLink to="/contact">Contact</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-links-column">
            <h3>Legal &amp; trust</h3>
            <ul>
              <li><NuxtLink to="/trust">Trust Center</NuxtLink></li>
              <li><NuxtLink to="/security">Security</NuxtLink></li>
              <li><NuxtLink to="/accessibility">Accessibility</NuxtLink></li>
              <li><NuxtLink to="/subprocessors">Subprocessors</NuxtLink></li>
              <li><NuxtLink to="/dpa">DPA</NuxtLink></li>
              <li><NuxtLink to="/sla">SLA</NuxtLink></li>
              <li><NuxtLink to="/acceptable-use">Acceptable use</NuxtLink></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-left">
          <p class="copyright">&copy; {{ new Date().getFullYear() }} Moonmart, Inc.</p>
          <nav class="legal-links" aria-label="Legal">
            <NuxtLink to="/terms">Terms</NuxtLink>
            <span class="legal-dot">·</span>
            <NuxtLink to="/privacy">Privacy</NuxtLink>
            <span class="legal-dot">·</span>
            <NuxtLink to="/privacy-choices">Your choices</NuxtLink>
            <span class="legal-dot">·</span>
            <NuxtLink to="/cookies">Cookies</NuxtLink>
            <span class="legal-dot">·</span>
            <NuxtLink to="/licenses">Licenses</NuxtLink>
            <span class="legal-dot">·</span>
            <NuxtLink to="/copyright">Copyright</NuxtLink>
            <span class="legal-dot">·</span>
            <NuxtLink to="/imprint">Imprint</NuxtLink>
            <span class="legal-dot">·</span>
            <NuxtLink to="/sitemap">Sitemap</NuxtLink>
          </nav>
          <NuxtLink to="/status" class="status-link">
            <span class="status-dot" aria-hidden="true"/>
            All systems normal
          </NuxtLink>
        </div>
        <div class="footer-bottom-right">
          <div class="language-selector">
            <UIcon dynamic name="i-heroicons-globe-alt" class="globe-icon" />
            <select v-model="currentLanguage" aria-label="Language">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
            <UIcon dynamic name="i-heroicons-chevron-down" class="select-chevron" />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const currentLanguage = ref('en');
</script>

<style scoped>
/* ───────────────────────────────────────────────────────────
   Moonmart Footer — dark theme
   ─────────────────────────────────────────────────────────── */
.footer {
  background-color: var(--mm-s1, #0F1220);
  color: var(--mm-silver, #A8B5CC);
  padding: 44px 0 20px;
  border-top: 0.5px solid var(--mm-border, rgba(168,180,204,.1));
  font-family: var(--f-ui);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Top grid: brand + 4 link columns ───────────────────── */
.footer-top {
  display: grid;
  grid-template-columns: 1.6fr repeat(4, 1fr);
  gap: 40px;
  padding-bottom: 28px;
  border-bottom: 0.5px solid var(--mm-border, rgba(168,180,204,.1));
}

/* Brand column */
.footer-brand { min-width: 0; }

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--mm-pearl, #F2F4F8);
  font-family: var(--f-display);
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 14px;
}
.logo-icon { width: 32px; height: 32px; flex-shrink: 0; }
.logo-accent { color: var(--mm-gold, #D4A843); }

.brand-description {
  color: var(--mm-silver, #A8B5CC);
  font-size: 0.875rem;
  line-height: 1.55;
  margin: 0 0 16px;
  max-width: 340px;
}

/* Social */
.social-links {
  display: flex;
  gap: 8px;
}
.social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--mm-s2, #161B2E);
  border: 0.5px solid var(--mm-border, rgba(168,180,204,.1));
  border-radius: var(--r-sm, 6px);
  color: var(--mm-slate, #68788F);
  text-decoration: none;
  transition: color var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast), transform var(--transition-fast);
}
.social-links a:hover {
  color: var(--mm-gold, #D4A843);
  border-color: var(--mm-gold, #D4A843);
  background: var(--mm-gold-soft, rgba(212,168,67,.08));
  transform: translateY(-1px);
}
.social-links :deep(.nuxt-icon),
.social-links svg { width: 16px; height: 16px; }

/* ── Link columns ──────────────────────────────────────── */
.footer-links {
  display: contents;
}

.footer-links-column h3 {
  font-family: var(--f-ui);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--mm-pearl, #F2F4F8);
  margin: 4px 0 16px;
}
.footer-links-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.footer-links-column li { margin-bottom: 8px; }
.footer-links-column a {
  color: var(--mm-silver, #A8B5CC);
  font-size: 0.875rem;
  text-decoration: none;
  transition: color var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.footer-links-column a:hover { color: var(--mm-gold, #D4A843); }

/* "Hiring" pill */
.pill-soft {
  display: inline-block;
  padding: 1px 7px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mm-gold, #D4A843);
  background: rgba(212, 168, 67, 0.12);
  border-radius: 4px;
  line-height: 1.4;
}

/* Status row */
.status-link {
  display: inline-flex !important;
  align-items: center;
  gap: 8px !important;
  color: var(--mm-slate, #68788F);
  text-decoration: none;
  font-size: 0.8125rem;
  transition: color var(--transition-fast);
}
.status-link:hover { color: var(--mm-silver, #A8B5CC); }
.status-dot {
  width: 8px;
  height: 8px;
  background: #10B981;
  border-radius: 999px;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  flex-shrink: 0;
}

/* ── SEO hidden ─────────────────────────────────────────── */
.seo-hidden {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* ── Bottom bar ─────────────────────────────────────────── */
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 18px;
  flex-wrap: wrap;
}
.footer-bottom-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.copyright {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--mm-slate, #68788F);
}
.legal-links {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8125rem;
}
.legal-links a {
  color: var(--mm-slate, #68788F);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.legal-links a:hover { color: var(--mm-gold, #D4A843); }
.legal-dot { color: var(--mm-slate, #68788F); opacity: 0.4; }

/* Language selector */
.language-selector {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--mm-s2, #161B2E);
  border: 0.5px solid var(--mm-border, rgba(168,180,204,.1));
  border-radius: var(--r-sm, 6px);
  padding: 6px 10px 6px 12px;
  position: relative;
  transition: border-color var(--transition-fast);
}
.language-selector:hover { border-color: rgba(168,180,204,.3); }
.globe-icon {
  width: 14px;
  height: 14px;
  color: var(--mm-slate, #68788F);
}
.language-selector select {
  background: transparent;
  color: var(--mm-silver, #A8B5CC);
  border: 0;
  cursor: pointer;
  font-family: var(--f-ui);
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 0 18px 0 0;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
}
.select-chevron {
  position: absolute;
  right: 10px;
  width: 12px;
  height: 12px;
  color: var(--mm-slate, #68788F);
  pointer-events: none;
}

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 1024px) {
  .footer-top {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 32px;
  }
  .footer-brand { grid-column: 1 / -1; }
  .footer-links { display: contents; }
}

@media (max-width: 640px) {
  .footer { padding: 48px 0 24px; }
  .footer-top {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-bottom: 32px;
  }
  .footer-brand { grid-column: auto; }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .footer-bottom-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
