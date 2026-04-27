<template>
  <div class="dev-page">
    <section class="dev-hero">
      <div class="container">
        <div class="dev-hero__badge">Public API</div>
        <h1 class="dev-hero__h1">moonmart.ai Developer API</h1>
        <p class="dev-hero__sub">Free, rate-limited JSON API for accessing SaaS app data. No auth required. Build integrations, comparison tools, or data pipelines.</p>
        <div class="dev-hero__stats">
          <div class="dev-stat">
            <span class="dev-stat__val">100</span>
            <span class="dev-stat__label">req/min free</span>
          </div>
          <div class="dev-stat">
            <span class="dev-stat__val">JSON</span>
            <span class="dev-stat__label">REST API</span>
          </div>
          <div class="dev-stat">
            <span class="dev-stat__val">No</span>
            <span class="dev-stat__label">API key needed</span>
          </div>
        </div>
      </div>
    </section>

    <div class="dev-body container">
      <nav class="dev-toc">
        <div class="dev-toc__title">Contents</div>
        <a href="#base-url" class="dev-toc__link">Base URL</a>
        <a href="#rate-limits" class="dev-toc__link">Rate Limits</a>
        <a href="#list-apps" class="dev-toc__link">List Apps</a>
        <a href="#get-app" class="dev-toc__link">Get App</a>
        <a href="#compare" class="dev-toc__link">Compare Apps</a>
        <a href="#errors" class="dev-toc__link">Errors</a>
        <a href="#embed-badge" class="dev-toc__link">Embed Badge</a>
      </nav>

      <main class="dev-content">

        <!-- Base URL -->
        <section id="base-url" class="dev-section">
          <h2 class="dev-section__h2">Base URL</h2>
          <div class="dev-code">https://moonmart.ai/api/public</div>
          <p class="dev-section__p">All endpoints return <code>application/json</code>. CORS is open — you can call these from any browser or server.</p>
        </section>

        <!-- Rate Limits -->
        <section id="rate-limits" class="dev-section">
          <h2 class="dev-section__h2">Rate Limits</h2>
          <p class="dev-section__p">Unauthenticated requests are limited to <strong>100 requests per minute</strong> per IP address. When the limit is hit, you receive <code>HTTP 429</code>.</p>
          <p class="dev-section__p">Responses include standard cache headers (<code>Cache-Control: public, max-age=300</code>) — use ETags or browser caching to stay well within the limit.</p>
        </section>

        <!-- List Apps -->
        <section id="list-apps" class="dev-section">
          <h2 class="dev-section__h2">List Apps</h2>
          <div class="dev-endpoint">
            <span class="dev-method dev-method--get">GET</span>
            <span class="dev-path">/api/public/apps</span>
          </div>
          <p class="dev-section__p">Returns a paginated list of published apps.</p>

          <h3 class="dev-section__h3">Query Parameters</h3>
          <div class="dev-table-wrap">
            <table class="dev-table">
              <thead><tr><th>Param</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td><code>category</code></td><td>string</td><td>—</td><td>Filter by category slug (e.g. <code>crm</code>, <code>marketing</code>)</td></tr>
                <tr><td><code>pricing</code></td><td>string</td><td>—</td><td><code>free</code> | <code>paid</code> | <code>trial</code> | <code>contact</code></td></tr>
                <tr><td><code>sortBy</code></td><td>string</td><td><code>rating</code></td><td><code>rating</code> | <code>reviewCount</code> | <code>createdAt</code></td></tr>
                <tr><td><code>limit</code></td><td>number</td><td>20</td><td>Results per page (max 100)</td></tr>
                <tr><td><code>page</code></td><td>number</td><td>1</td><td>Page number</td></tr>
              </tbody>
            </table>
          </div>

          <h3 class="dev-section__h3">Example</h3>
          <div class="dev-code">GET /api/public/apps?category=crm&amp;pricing=free&amp;limit=5</div>
          <div class="dev-response">
            <pre>{{ listAppsExample }}</pre>
          </div>
        </section>

        <!-- Get App -->
        <section id="get-app" class="dev-section">
          <h2 class="dev-section__h2">Get App</h2>
          <div class="dev-endpoint">
            <span class="dev-method dev-method--get">GET</span>
            <span class="dev-path">/api/public/apps/:slug</span>
          </div>
          <p class="dev-section__p">Returns full data for a single app by slug.</p>

          <h3 class="dev-section__h3">Example</h3>
          <div class="dev-code">GET /api/public/apps/hubspot</div>
          <div class="dev-response">
            <pre>{{ getAppExample }}</pre>
          </div>
        </section>

        <!-- Compare -->
        <section id="compare" class="dev-section">
          <h2 class="dev-section__h2">Compare Apps</h2>
          <div class="dev-endpoint">
            <span class="dev-method dev-method--get">GET</span>
            <span class="dev-path">/api/public/compare</span>
          </div>
          <p class="dev-section__p">Returns side-by-side data for 2–5 apps. Pass comma-separated slugs.</p>

          <h3 class="dev-section__h3">Query Parameters</h3>
          <div class="dev-table-wrap">
            <table class="dev-table">
              <thead><tr><th>Param</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td><code>apps</code></td><td>string</td><td>Comma-separated slugs, 2–5 apps required</td></tr>
              </tbody>
            </table>
          </div>

          <h3 class="dev-section__h3">Example</h3>
          <div class="dev-code">GET /api/public/compare?apps=hubspot,salesforce</div>
        </section>

        <!-- Errors -->
        <section id="errors" class="dev-section">
          <h2 class="dev-section__h2">Error Responses</h2>
          <div class="dev-table-wrap">
            <table class="dev-table">
              <thead><tr><th>Status</th><th>Meaning</th></tr></thead>
              <tbody>
                <tr><td><code>400</code></td><td>Bad request — check required parameters</td></tr>
                <tr><td><code>404</code></td><td>App not found</td></tr>
                <tr><td><code>429</code></td><td>Rate limit exceeded — slow down or cache responses</td></tr>
                <tr><td><code>500</code></td><td>Server error — try again shortly</td></tr>
              </tbody>
            </table>
          </div>
          <div class="dev-response">
            <pre>{{ errorExample }}</pre>
          </div>
        </section>

        <!-- Embed Badge -->
        <section id="embed-badge" class="dev-section">
          <h2 class="dev-section__h2">Embed moonmart Score Badge</h2>
          <p class="dev-section__p">Add a verified score badge to your website or README — links back to your moonmart.ai listing.</p>
          <div class="dev-code">&lt;img src="https://moonmart.ai/api/badges/YOUR-APP-SLUG.svg" alt="moonmart.ai Score" /&gt;</div>
          <p class="dev-section__p">The badge is an SVG, cached for 24 hours, and always reflects the latest moonmart Score.</p>
          <div class="dev-badge-preview">
            <img src="/api/badges/example.svg" alt="moonmart.ai badge example" class="dev-badge-img" onerror="this.style.display='none'" />
            <p class="dev-badge-note">Badge updates automatically when your score changes.</p>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const listAppsExample = JSON.stringify({
  data: [
    { id: 'app_abc', slug: 'hubspot', name: 'HubSpot', category: 'crm', rating: 4.5, reviewCount: 1240, pricingType: 'free', moonmartScore: 8.7 }
  ],
  meta: { total: 38, page: 1, perPage: 5, totalPages: 8 }
}, null, 2)

const getAppExample = JSON.stringify({
  id: 'app_abc', slug: 'hubspot', name: 'HubSpot',
  category: 'crm', rating: 4.5, reviewCount: 1240,
  pricingType: 'free', pricingValue: null,
  moonmartScore: 8.7, tags: ['crm', 'marketing', 'sales'],
  compareUrl: 'https://moonmart.ai/marketplace/app/hubspot'
}, null, 2)

const errorExample = JSON.stringify({ statusCode: 429, statusMessage: 'Too many requests' }, null, 2)

useHead({
  title: 'Developer API | moonmart.ai',
  meta: [
    { name: 'description', content: 'Free public REST API for SaaS app data. List apps, get details, compare tools. 100 req/min, no API key required.' },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://moonmart.ai/developer' }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'moonmart.ai Developer API',
      description: 'Free public REST API for accessing SaaS marketplace data',
      url: 'https://moonmart.ai/developer',
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: 'moonmart.ai Public API',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      }
    })
  }]
})
</script>

<style scoped>
.dev-page { min-height: 100vh; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

/* Hero */
.dev-hero { padding: 56px 0 40px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.dev-hero__badge { display: inline-block; background: var(--aw-accent); color: #fff; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 99px; margin-bottom: 14px; }
.dev-hero__h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; margin-bottom: 10px; }
.dev-hero__sub { color: var(--aw-text-muted); font-size: 1rem; max-width: 560px; margin-bottom: 28px; }
.dev-hero__stats { display: flex; gap: 32px; flex-wrap: wrap; }
.dev-stat { display: flex; flex-direction: column; }
.dev-stat__val { font-size: 1.5rem; font-weight: 800; color: var(--aw-accent); line-height: 1; }
.dev-stat__label { font-size: 0.78rem; color: var(--aw-text-muted); margin-top: 2px; }

/* Body layout */
.dev-body { display: grid; grid-template-columns: 200px 1fr; gap: 40px; padding: 40px 24px; align-items: start; }
@media (max-width: 768px) { .dev-body { grid-template-columns: 1fr; } .dev-toc { display: none; } }

/* TOC */
.dev-toc { position: sticky; top: 80px; background: var(--aw-surface-2); border: 1px solid var(--aw-border); border-radius: 10px; padding: 16px; }
.dev-toc__title { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--aw-text-muted); margin-bottom: 10px; }
.dev-toc__link { display: block; font-size: 0.83rem; color: var(--aw-text-muted); text-decoration: none; padding: 4px 0; }
.dev-toc__link:hover { color: var(--aw-accent); }

/* Sections */
.dev-section { margin-bottom: 48px; }
.dev-section__h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--aw-border); }
.dev-section__h3 { font-size: 0.88rem; font-weight: 700; margin: 18px 0 8px; color: var(--aw-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.dev-section__p { color: var(--aw-text-muted); font-size: 0.9rem; line-height: 1.7; margin-bottom: 10px; }
.dev-section__p strong { color: inherit; font-weight: 700; }

/* Endpoint */
.dev-endpoint { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.dev-method { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.05em; padding: 3px 10px; border-radius: 6px; }
.dev-method--get { background: #d1fae5; color: #065f46; }
.dev-path { font-family: monospace; font-size: 0.95rem; font-weight: 600; }

/* Code blocks */
.dev-code { background: var(--aw-surface-2); border: 1px solid var(--aw-border); border-radius: 8px; padding: 12px 16px; font-family: monospace; font-size: 0.85rem; margin-bottom: 12px; word-break: break-all; }
.dev-response { background: #111827; border-radius: 10px; padding: 20px; margin-bottom: 12px; }
.dev-response pre { color: #d1d5db; font-family: monospace; font-size: 0.82rem; line-height: 1.6; white-space: pre-wrap; margin: 0; }

/* Table */
.dev-table-wrap { overflow-x: auto; margin-bottom: 12px; }
.dev-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.dev-table th { text-align: left; padding: 8px 12px; border-bottom: 2px solid var(--aw-border); font-size: 0.78rem; font-weight: 700; color: var(--aw-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.dev-table td { padding: 9px 12px; border-bottom: 1px solid var(--aw-border); vertical-align: top; }
.dev-table code { background: var(--aw-surface-2); padding: 2px 6px; border-radius: 4px; font-size: 0.82rem; }

/* Badge preview */
.dev-badge-preview { margin-top: 12px; }
.dev-badge-img { display: block; margin-bottom: 8px; }
.dev-badge-note { font-size: 0.82rem; color: var(--aw-text-muted); }
</style>
