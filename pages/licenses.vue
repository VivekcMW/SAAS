<template>
  <LegalShell
    title="Software Licenses"
    eyebrow="Legal · Licenses"
    lede="Moonmart is built on the shoulders of open source. Here are the libraries, fonts and tools that power our platform — and the terms we follow."
    :updated="updatedAt"
    contact-email="legal@moonmart.ai"
    :sections="tocSections"
  >
    <!-- Quick stats -->
    <div class="lic-stats">
      <div class="lic-stat">
        <div class="lic-stat__value">Nuxt 3</div>
        <div class="lic-stat__label">Core framework</div>
      </div>
      <div class="lic-stat">
        <div class="lic-stat__value">Vue 3</div>
        <div class="lic-stat__label">UI runtime</div>
      </div>
      <div class="lic-stat">
        <div class="lic-stat__value">MIT</div>
        <div class="lic-stat__label">Primary license</div>
      </div>
      <div class="lic-stat">
        <div class="lic-stat__value">100%</div>
        <div class="lic-stat__label">Compliance</div>
      </div>
    </div>

    <div class="prose prose-lg max-w-none">
      <!-- 1. Our License -->
      <section id="our-license">
        <h2>1. Our software license</h2>
        <div class="lic-callout">
          <p class="lic-callout__title">Moonmart Platform License</p>
          <p>
            The Moonmart platform — including its source code, design system, content and
            brand assets — is proprietary software owned by Moonmart Inc. All rights reserved.
          </p>
          <p class="lic-callout__fine">
            <strong>Copyright © {{ currentYear }} Moonmart Inc.</strong> Protected by copyright
            law and international treaties. Unauthorized reproduction or redistribution is prohibited.
          </p>
        </div>
        <p>
          While our application is proprietary, everything it runs on top of is open source.
          We build on community-maintained tools, ship attributions for every dependency, and
          contribute fixes back upstream whenever we can.
        </p>
        <p>
          For licensing, partnership, or OEM enquiries, write to
          <a href="mailto:legal@moonmart.ai">legal@moonmart.ai</a>.
        </p>
      </section>

      <!-- 2. Open Source Dependencies -->
      <section id="open-source">
        <h2>2. Open source dependencies</h2>
        <p>
          The list below reflects our current top-level runtime dependencies. Transitive
          packages are not enumerated here — the full, resolved tree is always available in
          our lockfile. Versions shown are the baseline we ship; patch updates happen
          regularly.
        </p>
        <p>
          The overwhelming majority of our dependencies are published under the
          <strong>MIT License</strong>, which permits commercial use, modification and
          distribution with attribution.
        </p>
      </section>

      <!-- 3. License Types -->
      <section id="license-types">
        <h2>3. License types we rely on</h2>
        <div class="lic-licenses">
          <div class="lic-lic">
            <p class="lic-lic__name">MIT License</p>
            <p class="lic-lic__desc">
              Short, permissive. Allows reuse in proprietary software with attribution and
              preservation of the copyright notice. Covers the bulk of our stack (Nuxt, Vue,
              Chart.js, better-sqlite3, TypeScript, and most Iconify packs).
            </p>
          </div>
          <div class="lic-lic">
            <p class="lic-lic__name">Apache License 2.0</p>
            <p class="lic-lic__desc">
              Permissive with an explicit patent grant. Used by a small number of transitive
              packages and by several of the icon source projects we bundle.
            </p>
          </div>
          <div class="lic-lic">
            <p class="lic-lic__name">BSD-2-Clause / BSD-3-Clause</p>
            <p class="lic-lic__desc">
              Permissive, similar to MIT with an additional clause about endorsement. Found
              in parts of the Node.js tool-chain and low-level parsers.
            </p>
          </div>
          <div class="lic-lic">
            <p class="lic-lic__name">OFL 1.1 (SIL Open Font License)</p>
            <p class="lic-lic__desc">
              Used by every font we load through <code>@nuxtjs/google-fonts</code>, including
              Poppins and Inter. Fonts may be embedded freely; the license may not itself be
              sold.
            </p>
          </div>
          <div class="lic-lic">
            <p class="lic-lic__name">CC-BY 4.0</p>
            <p class="lic-lic__desc">
              Applies to some icon sets served via Iconify (notably brand / logo packs).
              Attribution is provided in this document.
            </p>
          </div>
          <div class="lic-lic">
            <p class="lic-lic__name">ISC</p>
            <p class="lic-lic__desc">
              Functionally equivalent to MIT, used by several packages in the Node.js
              ecosystem.
            </p>
          </div>
        </div>
      </section>

      <!-- 4. Frontend -->
      <section id="frontend-licenses">
        <h2>4. Framework &amp; UI</h2>
        <p>
          The rendering stack — routing, reactivity, UI primitives and icon packs — is
          entirely open source.
        </p>
        <div class="lic-table-wrap">
          <table class="lic-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Purpose</th>
                <th>License</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="https://nuxt.com" target="_blank" rel="noopener noreferrer">nuxt</a></td>
                <td>Full-stack Vue meta-framework</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://vuejs.org" target="_blank" rel="noopener noreferrer">vue</a></td>
                <td>Reactive component runtime</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://router.vuejs.org" target="_blank" rel="noopener noreferrer">vue-router</a></td>
                <td>Client-side routing</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://ui.nuxt.com" target="_blank" rel="noopener noreferrer">@nuxt/ui</a></td>
                <td>Headless UI primitives</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://image.nuxt.com" target="_blank" rel="noopener noreferrer">@nuxt/image</a></td>
                <td>Responsive image pipeline</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://content.nuxt.com" target="_blank" rel="noopener noreferrer">@nuxt/content</a></td>
                <td>Markdown / content collections</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://scripts.nuxt.com" target="_blank" rel="noopener noreferrer">@nuxt/scripts</a></td>
                <td>Third-party script loader</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://i18n.nuxtjs.org" target="_blank" rel="noopener noreferrer">@nuxtjs/i18n</a></td>
                <td>Internationalization (5 locales)</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://unhead.unjs.io" target="_blank" rel="noopener noreferrer">@unhead/vue</a></td>
                <td>SEO &amp; document head management</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://www.chartjs.org" target="_blank" rel="noopener noreferrer">chart.js</a></td>
                <td>Analytics / dashboard charts</td>
                <td>MIT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 5. Backend -->
      <section id="backend-licenses">
        <h2>5. Server &amp; data</h2>
        <p>
          Our API and persistence layer run on Nitro (bundled with Nuxt) and a small set of
          focused native modules.
        </p>
        <div class="lic-table-wrap">
          <table class="lic-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Purpose</th>
                <th>License</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="https://github.com/WiseLibs/better-sqlite3" target="_blank" rel="noopener noreferrer">better-sqlite3</a></td>
                <td>Primary database driver (SQLite)</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://github.com/Automattic/node-canvas" target="_blank" rel="noopener noreferrer">canvas</a></td>
                <td>Server-side image &amp; thumbnail generation</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">node.js</a></td>
                <td>Server runtime</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://nitro.build" target="_blank" rel="noopener noreferrer">nitro</a></td>
                <td>Server engine (bundled with Nuxt)</td>
                <td>MIT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 6. Dev tools -->
      <section id="development-tools">
        <h2>6. Development tooling</h2>
        <p>
          Tooling does not ship in the production bundle, but we publish it for
          completeness.
        </p>
        <div class="lic-table-wrap">
          <table class="lic-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Purpose</th>
                <th>License</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer">typescript</a></td>
                <td>Typed JavaScript compiler</td>
                <td>Apache-2.0</td>
              </tr>
              <tr>
                <td><a href="https://eslint.org" target="_blank" rel="noopener noreferrer">eslint</a></td>
                <td>Linting &amp; code style</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://eslint.nuxt.com" target="_blank" rel="noopener noreferrer">@nuxt/eslint</a></td>
                <td>Nuxt-aware ESLint config</td>
                <td>MIT</td>
              </tr>
              <tr>
                <td><a href="https://sass-lang.com" target="_blank" rel="noopener noreferrer">sass</a></td>
                <td>CSS preprocessing</td>
                <td>MIT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 7. Fonts & Assets -->
      <section id="fonts-assets">
        <h2>7. Fonts, icons &amp; assets</h2>
        <h3>Fonts</h3>
        <p>
          Typography is served through <code>@nuxtjs/google-fonts</code>. All families we use
          are published under the SIL Open Font License 1.1.
        </p>
        <ul>
          <li><strong>Poppins</strong> — headings, display type. © Indian Type Foundry. OFL 1.1.</li>
          <li><strong>Inter</strong> — body copy, UI. © Rasmus Andersson. OFL 1.1.</li>
        </ul>

        <h3>Icons</h3>
        <p>Iconify packs are bundled on-demand at build time.</p>
        <ul>
          <li>
            <a href="https://github.com/tailwindlabs/heroicons" target="_blank" rel="noopener noreferrer">@iconify-json/heroicons</a>
            — Heroicons by Tailwind Labs. MIT.
          </li>
          <li>
            <a href="https://materialdesignicons.com" target="_blank" rel="noopener noreferrer">@iconify-json/mdi</a>
            — Material Design Icons community. Apache-2.0.
          </li>
          <li>
            <a href="https://simpleicons.org" target="_blank" rel="noopener noreferrer">@iconify-json/simple-icons</a>
            — Brand &amp; logo glyphs. CC-BY 4.0.
          </li>
          <li>
            <a href="https://github.com/gilbarbara/logos" target="_blank" rel="noopener noreferrer">@iconify-json/logos</a>
            — Gil Barbara's SVG logos. CC-BY 4.0.
          </li>
          <li>
            <a href="https://iconify.design" target="_blank" rel="noopener noreferrer">@iconify/json</a>
            — Aggregated icon metadata. MIT.
          </li>
        </ul>

        <h3>Original content</h3>
        <p>
          Editorial photography, illustrations, the <em>Moonmart</em> wordmark, product
          screenshots and written copy are © Moonmart Inc. and are not covered by any of
          the open source licenses above.
        </p>
      </section>

      <!-- 8. Compliance -->
      <section id="compliance">
        <h2>8. License compliance</h2>
        <p>We take upstream licensing seriously. Our process:</p>
        <ul>
          <li>Every direct dependency is reviewed before it enters <code>package.json</code>.</li>
          <li>Copyleft licenses (GPL / AGPL) are not introduced into the runtime bundle.</li>
          <li>This page, plus our in-repo lockfile, serve as the canonical attribution source.</li>
          <li>Security advisories are tracked continuously; patches ship as soon as they are verified.</li>
        </ul>
        <p>
          If you believe an attribution is missing or incorrect, please reach out — we'll
          correct it promptly.
        </p>
      </section>

      <!-- 9. Attributions -->
      <section id="attributions">
        <h2>9. Attributions</h2>
        <p>
          Moonmart would not exist without the work of thousands of open source
          contributors. Special thanks to:
        </p>
        <ul>
          <li>The <strong>Vue</strong> and <strong>Nuxt</strong> core teams and their communities.</li>
          <li><strong>Iconify</strong> and every icon author whose packs we ship.</li>
          <li>The <strong>SQLite</strong> project for the most deployed database engine in the world.</li>
          <li>Every maintainer on <strong>npm</strong> who keeps their packages free and up to date.</li>
        </ul>
      </section>

      <!-- 10. Contact -->
      <section id="contact">
        <h2>10. Contact</h2>
        <p>For licensing questions, attribution corrections, or compliance audits:</p>
        <div class="contact-info">
          <p><strong>Email:</strong> <a href="mailto:legal@moonmart.ai">legal@moonmart.ai</a></p>
          <p><strong>Address:</strong> Moonmart Inc., 123 Tech Street, San Francisco, CA 94105</p>
          <p><strong>Response time:</strong> within 5 business days</p>
        </div>
      </section>
    </div>
  </LegalShell>
</template>

<script setup lang="ts">
// SEO Configuration
const { applySEO } = useSEO()

const updatedAt = new Date().toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
})

const currentYear = new Date().getFullYear()

const tocSections = [
  { id: 'our-license', label: '1. Our Software License' },
  { id: 'open-source', label: '2. Open Source Dependencies' },
  { id: 'license-types', label: '3. License Types' },
  { id: 'frontend-licenses', label: '4. Frontend Libraries' },
  { id: 'backend-licenses', label: '5. Backend Dependencies' },
  { id: 'development-tools', label: '6. Development Tools' },
  { id: 'fonts-assets', label: '7. Fonts & Assets' },
  { id: 'compliance', label: '8. License Compliance' },
  { id: 'attributions', label: '9. Attributions' },
  { id: 'contact', label: '10. Contact' }
]

applySEO({
  title: 'Licenses | Moonmart - Open Source Licenses and Attributions',
  description: 'View Moonmart\'s open source licenses, third-party attributions, and software licensing information for our platform.',
  keywords: 'licenses, open source, attributions, software licenses, third-party licenses, MIT license, Apache license, GPL',
  canonical: 'https://moonmart.ai/licenses',
  ogType: 'website',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Licenses',
    description: 'Moonmart software licenses and open source attributions',
    url: 'https://moonmart.ai/licenses',
    publisher: {
      '@type': 'Organization',
      name: 'Moonmart',
      url: 'https://moonmart.ai'
    }
  }
})

// Analytics tracking
onMounted(() => {
  const { $seoTracking } = useNuxtApp()
  $seoTracking.trackEvent('legal_page_view', {
    page: 'licenses',
    category: 'legal'
  })
})
</script>


<style scoped>
.lic-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin: 0 0 2.5rem;
}
.lic-stat {
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  padding: 1.1rem 1rem;
  text-align: center;
}
.lic-stat__value {
  font-family: var(--f-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--mm-gold);
  line-height: 1;
  margin-bottom: 0.35rem;
}
.lic-stat__label {
  font-size: 0.8125rem;
  color: var(--mm-slate);
  font-weight: 500;
}
@media (max-width: 720px) {
  .lic-stats { grid-template-columns: repeat(2, 1fr); }
}

/* Callout card */
.lic-callout {
  background: var(--mm-gold-soft);
  border: 0.5px solid var(--b1);
  border-left: 2px solid var(--mm-gold);
  border-radius: var(--r-lg);
  padding: 1.25rem 1.4rem;
  margin: 0 0 1.5rem;
}
.lic-callout__title {
  font-family: var(--f-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 0.5rem;
}
.lic-callout p { color: var(--mm-silver); }
.lic-callout__fine {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 0.5px solid var(--b1);
  font-size: 0.875rem;
}

/* License-type cards */
.lic-licenses {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 0 0 1.5rem;
}
.lic-lic {
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-md);
  padding: 1rem 1.1rem;
}
.lic-lic__name {
  font-family: var(--f-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--mm-gold);
  margin: 0 0 0.35rem;
}
.lic-lic__desc {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--mm-silver);
  margin: 0;
}
@media (max-width: 720px) {
  .lic-licenses { grid-template-columns: 1fr; }
}

/* Dependency tables */
.lic-table-wrap {
  overflow-x: auto;
  border: 0.5px solid var(--b1);
  border-radius: var(--r-md);
  margin: 0 0 1.5rem;
}
.lic-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
  margin: 0;
}
.lic-table th,
.lic-table td {
  padding: 0.7rem 0.9rem;
  text-align: left;
  border-bottom: 0.5px solid var(--b1);
}
.lic-table tbody tr:last-child td { border-bottom: none; }
.lic-table th {
  background: var(--mm-s2);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mm-slate);
}
.lic-table td:last-child {
  font-family: var(--f-mon);
  font-size: 0.8125rem;
  color: var(--mm-gold);
  white-space: nowrap;
}
.lic-table a {
  color: var(--mm-silver);
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px dotted var(--b2);
}
.lic-table a:hover {
  color: var(--mm-gold);
  border-bottom-color: var(--mm-gold);
}

code {
  font-family: var(--f-mon);
  font-size: 0.875em;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-xs);
  padding: 0.1rem 0.4rem;
  color: var(--mm-goldl);
}
</style>
