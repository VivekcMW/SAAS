<template>
  <div class="dev-page">
    <section class="dev-hero">
      <div class="container">
        <div class="dev-hero__badge">Developer Platform</div>
        <h1 class="dev-hero__h1">moonmart.ai Developer API</h1>
        <p class="dev-hero__sub">Access SaaS marketplace data via REST API. Free tier available, paid tiers for higher limits and AI agent discovery.</p>
        <div class="dev-hero__stats">
          <div class="dev-stat">
            <span class="dev-stat__val">100</span>
            <span class="dev-stat__label">req/day free</span>
          </div>
          <div class="dev-stat">
            <span class="dev-stat__val">10K</span>
            <span class="dev-stat__label">req/day developer</span>
          </div>
          <div class="dev-stat">
            <span class="dev-stat__val">∞</span>
            <span class="dev-stat__label">req/day business</span>
          </div>
        </div>
      </div>
    </section>

    <div class="dev-body container">
      <nav class="dev-toc">
        <div class="dev-toc__title">Contents</div>
        <a href="#api-keys" class="dev-toc__link">API Keys</a>
        <a href="#tiers" class="dev-toc__link">Plans &amp; Tiers</a>
        <a href="#base-url" class="dev-toc__link">Base URL</a>
        <a href="#rate-limits" class="dev-toc__link">Rate Limits</a>
        <a href="#list-apps" class="dev-toc__link">List Apps</a>
        <a href="#get-app" class="dev-toc__link">Get App</a>
        <a href="#categories" class="dev-toc__link">Categories</a>
        <a href="#agents" class="dev-toc__link">AI Agent Discovery</a>
        <a href="#compare" class="dev-toc__link">Compare Apps</a>
        <a href="#benchmark" class="dev-toc__link">Spend Benchmark</a>
        <a href="#errors" class="dev-toc__link">Errors</a>
        <a href="#embed-badge" class="dev-toc__link">Embed Widget</a>
      </nav>

      <main class="dev-content">

        <!-- API Keys -->
        <section id="api-keys" class="dev-section">
          <h2 class="dev-section__h2">API Keys</h2>
          <p class="dev-section__p">The v1 API requires an API key. Pass it in the <code>Authorization</code> header or as a query parameter:</p>
          <div class="dev-code">Authorization: Bearer mm_your_api_key_here</div>
          <div class="dev-code">GET /api/v1/apps?api_key=mm_your_api_key_here</div>

          <!-- Key Generator -->
          <div v-if="user" class="dev-key-box">
            <h3 class="dev-section__h3">Your API Keys</h3>
            <div v-if="keysLoading" class="muted">Loading…</div>
            <table v-else-if="keys.length" class="dev-table">
              <thead><tr><th>Name</th><th>Prefix</th><th>Tier</th><th>Req Today</th><th>Total</th><th></th></tr></thead>
              <tbody>
                <tr v-for="k in keys" :key="k.id">
                  <td>{{ k.name }}</td>
                  <td><code>{{ k.key_prefix }}…</code></td>
                  <td><span :class="`dev-tier dev-tier--${k.tier}`">{{ k.tier }}</span></td>
                  <td>{{ k.requests_today.toLocaleString() }}</td>
                  <td>{{ k.requests_total.toLocaleString() }}</td>
                  <td><button class="dev-btn-revoke" @click="revokeKey(k.id)">Revoke</button></td>
                </tr>
              </tbody>
            </table>
            <p v-else class="muted">No API keys yet.</p>

            <div class="dev-new-key">
              <input v-model="newKeyName" type="text" placeholder="Key name (e.g. My App)" />
              <select v-model="newKeyTier">
                <option value="free">Free (100 req/day)</option>
                <option value="developer">Developer (10K req/day)</option>
                <option value="business">Business (Unlimited)</option>
              </select>
              <button :disabled="!newKeyName || generatingKey" @click="generateKey">
                {{ generatingKey ? 'Generating…' : '+ Generate key' }}
              </button>
            </div>
            <div v-if="newKeyValue" class="dev-key-reveal">
              <strong>Copy your key — it will not be shown again:</strong>
              <code>{{ newKeyValue }}</code>
              <button @click="copyKey">Copy</button>
            </div>
            <p v-if="keyError" class="form-error">{{ keyError }}</p>
          </div>
          <div v-else class="dev-login-prompt">
            <p><NuxtLink to="/login">Log in</NuxtLink> or <NuxtLink to="/signup">sign up</NuxtLink> to generate an API key.</p>
          </div>
        </section>

        <!-- Tiers -->
        <section id="tiers" class="dev-section">
          <h2 class="dev-section__h2">Plans &amp; Tiers</h2>
          <div class="dev-table-wrap">
            <table class="dev-table">
              <thead><tr><th>Tier</th><th>Daily Limit</th><th>Requires</th><th>AI Agent Endpoint</th></tr></thead>
              <tbody>
                <tr><td><span class="dev-tier dev-tier--free">free</span></td><td>100 req/day</td><td>Any account</td><td>Included</td></tr>
                <tr><td><span class="dev-tier dev-tier--developer">developer</span></td><td>10,000 req/day</td><td>Starter plan+</td><td>Included</td></tr>
                <tr><td><span class="dev-tier dev-tier--business">business</span></td><td>Unlimited</td><td>Professional plan+</td><td>Included</td></tr>
              </tbody>
            </table>
          </div>
          <p class="dev-section__p">Legacy unauthenticated requests (<code>/api/public/apps</code>) remain available at 100 req/min per IP for backward compatibility.</p>
        </section>

        <!-- Base URL -->
        <section id="base-url" class="dev-section">
          <h2 class="dev-section__h2">Base URL</h2>
          <div class="dev-code">https://moonmart.ai/api/v1</div>
          <p class="dev-section__p">Legacy base: <code>https://moonmart.ai/api/public</code> (no key, IP-limited)</p>
          <p class="dev-section__p">All endpoints return <code>application/json</code>. CORS is open.</p>
        </section>

        <!-- Rate Limits -->
        <section id="rate-limits" class="dev-section">
          <h2 class="dev-section__h2">Rate Limits</h2>
          <p class="dev-section__p">v1 keys are rate-limited per calendar day (UTC). The window resets at midnight UTC.</p>
          <p class="dev-section__p">When the limit is hit you receive <code>HTTP 429</code>. Upgrade your plan to increase limits.</p>
        </section>

        <!-- List Apps -->
        <section id="list-apps" class="dev-section">
          <h2 class="dev-section__h2">List Apps</h2>
          <div class="dev-endpoint">
            <span class="dev-method dev-method--get">GET</span>
            <span class="dev-path">/api/v1/apps</span>
          </div>
          <p class="dev-section__p">Returns a paginated list of published apps.</p>

          <h3 class="dev-section__h3">Query Parameters</h3>
          <div class="dev-table-wrap">
            <table class="dev-table">
              <thead><tr><th>Param</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td><code>category</code></td><td>string</td><td>—</td><td>Filter by category name</td></tr>
                <tr><td><code>search</code></td><td>string</td><td>—</td><td>Full-text search</td></tr>
                <tr><td><code>pricing</code></td><td>string</td><td>—</td><td><code>free</code> | <code>paid</code> | <code>trial</code> | <code>contact</code></td></tr>
                <tr><td><code>sort</code></td><td>string</td><td><code>rating</code></td><td><code>rating</code> | <code>newest</code> | <code>reviews</code></td></tr>
                <tr><td><code>limit</code></td><td>number</td><td>10</td><td>Results per page (max 100)</td></tr>
                <tr><td><code>page</code></td><td>number</td><td>1</td><td>Page number</td></tr>
              </tbody>
            </table>
          </div>
          <div class="dev-code">GET /api/v1/apps?category=CRM&amp;pricing=free&amp;limit=5</div>
        </section>

        <!-- Get App -->
        <section id="get-app" class="dev-section">
          <h2 class="dev-section__h2">Get App</h2>
          <div class="dev-endpoint">
            <span class="dev-method dev-method--get">GET</span>
            <span class="dev-path">/api/v1/apps/:slug</span>
          </div>
          <p class="dev-section__p">Returns full app data including top reviews and embed snippet.</p>
          <div class="dev-code">GET /api/v1/apps/hubspot</div>
        </section>

        <!-- Categories -->
        <section id="categories" class="dev-section">
          <h2 class="dev-section__h2">Categories</h2>
          <div class="dev-endpoint">
            <span class="dev-method dev-method--get">GET</span>
            <span class="dev-path">/api/v1/categories</span>
          </div>
          <p class="dev-section__p">Full category taxonomy with published app counts.</p>
          <div class="dev-code">GET /api/v1/categories</div>
        </section>

        <!-- AI Agent Discovery -->
        <section id="agents" class="dev-section">
          <h2 class="dev-section__h2">AI Agent Discovery</h2>
          <div class="dev-endpoint">
            <span class="dev-method dev-method--get">GET</span>
            <span class="dev-path">/api/v1/agents/discover</span>
          </div>
          <p class="dev-section__p">Structured tool recommendations designed for AI agents. Pass a natural-language task and constraints — get back ranked tools with <code>machine_actions</code> URLs the agent can act on directly.</p>

          <h3 class="dev-section__h3">Query Parameters</h3>
          <div class="dev-table-wrap">
            <table class="dev-table">
              <thead><tr><th>Param</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td><code>task</code></td><td>string</td><td>What to do — <code>crm</code>, <code>send_email</code>, <code>analytics</code>, <code>project_management</code>…</td></tr>
                <tr><td><code>budget_usd</code></td><td>number</td><td>Max monthly spend in USD</td></tr>
                <tr><td><code>seats</code></td><td>number</td><td>Number of users</td></tr>
                <tr><td><code>integrations</code></td><td>string</td><td>Comma-separated required integrations, e.g. <code>slack,salesforce</code></td></tr>
                <tr><td><code>free_only</code></td><td>boolean</td><td>Restrict to free / freemium tools</td></tr>
                <tr><td><code>limit</code></td><td>number</td><td>1–10 results (default 5)</td></tr>
              </tbody>
            </table>
          </div>
          <div class="dev-code">GET /api/v1/agents/discover?task=crm&amp;budget_usd=200&amp;seats=10&amp;integrations=slack</div>
          <div class="dev-response"><pre>{{ agentExample }}</pre></div>
        </section>

        <!-- Compare -->
        <section id="compare" class="dev-section">
          <h2 class="dev-section__h2">Compare Apps</h2>
          <div class="dev-endpoint">
            <span class="dev-method dev-method--get">GET</span>
            <span class="dev-path">/api/public/compare</span>
          </div>
          <p class="dev-section__p">Side-by-side comparison for 2–5 apps by slug.</p>
          <div class="dev-code">GET /api/public/compare?apps=hubspot,salesforce</div>
        </section>

        <!-- Spend Benchmark -->
        <section id="benchmark" class="dev-section">
          <h2 class="dev-section__h2">Spend Benchmark</h2>
          <div class="dev-endpoint">
            <span class="dev-method dev-method--get">GET</span>
            <span class="dev-path">/api/stack/benchmark</span>
          </div>
          <p class="dev-section__p">Anonymized aggregate spend data for a software category. Shows what companies of a given size actually pay (sourced from community-submitted price reports).</p>
          <div class="dev-code">GET /api/stack/benchmark?category=CRM&amp;company_size=11-50</div>
        </section>

        <!-- Errors -->
        <section id="errors" class="dev-section">
          <h2 class="dev-section__h2">Error Responses</h2>
          <div class="dev-table-wrap">
            <table class="dev-table">
              <thead><tr><th>Status</th><th>Meaning</th></tr></thead>
              <tbody>
                <tr><td><code>400</code></td><td>Bad request — check required parameters</td></tr>
                <tr><td><code>401</code></td><td>Missing or invalid API key</td></tr>
                <tr><td><code>403</code></td><td>Plan tier insufficient for this key</td></tr>
                <tr><td><code>404</code></td><td>App not found</td></tr>
                <tr><td><code>429</code></td><td>Daily rate limit reached — upgrade or wait for reset</td></tr>
                <tr><td><code>500</code></td><td>Server error — try again shortly</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Embed Widget -->
        <section id="embed-badge" class="dev-section">
          <h2 class="dev-section__h2">Embed Widget</h2>
          <p class="dev-section__p">Add a moonmart review card to any website with one line of HTML. The widget auto-resizes and links back to your full listing.</p>
          <div class="dev-code">&lt;script src="https://moonmart.ai/embed.js" data-app="YOUR-APP-SLUG" async&gt;&lt;/script&gt;</div>
          <p class="dev-section__p">Optional attributes: <code>data-theme="dark"</code>, <code>data-width="400"</code>, <code>data-lang="fr"</code></p>

          <h3 class="dev-section__h3">Score Badge</h3>
          <div class="dev-code">&lt;img src="https://moonmart.ai/api/badges/YOUR-APP-SLUG.svg" alt="moonmart.ai Score" /&gt;</div>
          <div class="dev-badge-preview">
            <img :src="'/api/badges/example.svg'" alt="moonmart.ai badge example" class="dev-badge-img" @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" />
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// ── Auth ──────────────────────────────────────────────────────────────────────
const { currentUser: user } = useAuth()

// ── API Keys ──────────────────────────────────────────────────────────────────
interface ApiKey {
  id: string
  key_prefix: string
  name: string
  tier: string
  requests_today: number
  requests_total: number
  last_used_at: string | null
  status: string
  created_at: string
}

const keys = ref<ApiKey[]>([])
const keysLoading = ref(false)
const newKeyName = ref('')
const newKeyTier = ref('free')
const newKeyValue = ref('')
const generatingKey = ref(false)
const keyError = ref('')

async function loadKeys() {
  keysLoading.value = true
  try {
    const res = await $fetch<{ keys: ApiKey[] }>('/api/v1/keys')
    keys.value = res.keys
  } catch { /* not logged in */ }
  finally { keysLoading.value = false }
}

async function generateKey() {
  keyError.value = ''
  newKeyValue.value = ''
  generatingKey.value = true
  try {
    const res = await $fetch<{ key: string }>('/api/v1/keys', {
      method: 'POST',
      body: { name: newKeyName.value, tier: newKeyTier.value }
    })
    newKeyValue.value = res.key
    newKeyName.value = ''
    await loadKeys()
  } catch (e: unknown) {
    keyError.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Error generating key'
  } finally {
    generatingKey.value = false
  }
}

async function revokeKey(id: string) {
  if (!confirm('Revoke this key? This cannot be undone.')) return
  await $fetch(`/api/v1/keys?id=${id}`, { method: 'DELETE' }).catch(() => {})
  await loadKeys()
}

async function copyKey() {
  await navigator.clipboard.writeText(newKeyValue.value).catch(() => {})
}

onMounted(() => { if (user.value) loadKeys() })

// ── Example JSON ──────────────────────────────────────────────────────────────
const agentExample = JSON.stringify({
  query: { task: 'crm', budget_usd: 200, seats: 10, integrations: ['slack'] },
  resolved_category: 'CRM',
  count: 3,
  recommendations: [
    {
      rank: 1, slug: 'hubspot', name: 'HubSpot', category: 'CRM',
      rating: 4.5,
      pricing: { type: 'free', monthly_usd: null, label: 'Free' },
      machine_actions: {
        view_details: 'https://moonmart.ai/marketplace/app/hubspot',
        add_to_stack: 'https://moonmart.ai/stack?add=hubspot',
      }
    }
  ],
  powered_by: 'moonmart.ai Agent Registry'
}, null, 2)

useHead({
  title: 'Developer API | moonmart.ai',
  meta: [
    { name: 'description', content: 'REST API for SaaS marketplace data. Free tier, paid plans with higher limits. Includes AI Agent discovery endpoint.' },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://moonmart.ai/developer' }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'moonmart.ai Developer API',
      description: 'REST API for SaaS marketplace data with AI agent discovery',
      url: 'https://moonmart.ai/developer',
    })
  }]
})
</script>

<style scoped>
.dev-page { min-height: 100vh; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

.dev-hero { padding: 56px 0 40px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.dev-hero__badge { display: inline-block; background: #3366B8; color: #fff; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 99px; margin-bottom: 14px; }
.dev-hero__h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; margin-bottom: 10px; color: var(--aw-text, #F2F4F8); }
.dev-hero__sub { color: var(--aw-text-muted); font-size: 1rem; max-width: 560px; margin-bottom: 28px; }
.dev-hero__stats { display: flex; gap: 32px; flex-wrap: wrap; }
.dev-stat { display: flex; flex-direction: column; }
.dev-stat__val { font-size: 1.5rem; font-weight: 800; color: var(--aw-accent); line-height: 1; }
.dev-stat__label { font-size: 0.78rem; color: var(--aw-text-muted); margin-top: 2px; }

.dev-body { display: grid; grid-template-columns: 220px 1fr; gap: 40px; padding: 40px 24px; align-items: start; }
@media (max-width: 768px) { .dev-body { grid-template-columns: 1fr; } .dev-toc { display: none; } }

.dev-toc { position: sticky; top: 80px; background: var(--aw-surface-2); border: 1px solid var(--aw-border); border-radius: 10px; padding: 16px; }
.dev-toc__title { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--aw-text-muted); margin-bottom: 10px; }
.dev-toc__link { display: block; font-size: 0.83rem; color: var(--aw-text-muted); text-decoration: none; padding: 4px 0; }
.dev-toc__link:hover { color: var(--aw-accent); }

.dev-section { margin-bottom: 48px; }
.dev-section__h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--aw-border); }
.dev-section__h3 { font-size: 0.88rem; font-weight: 700; margin: 18px 0 8px; color: var(--aw-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.dev-section__p { color: var(--aw-text-muted); font-size: 0.9rem; line-height: 1.7; margin-bottom: 10px; }

.dev-endpoint { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.dev-method { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.05em; padding: 3px 10px; border-radius: 6px; }
.dev-method--get { background: #d1fae5; color: #065f46; }
.dev-path { font-family: monospace; font-size: 0.95rem; font-weight: 600; }

.dev-code { background: var(--aw-surface-2); border: 1px solid var(--aw-border); border-radius: 8px; padding: 12px 16px; font-family: monospace; font-size: 0.85rem; margin-bottom: 12px; word-break: break-all; }
.dev-response { background: #111827; border-radius: 10px; padding: 20px; margin-bottom: 12px; }
.dev-response pre { color: #d1d5db; font-family: monospace; font-size: 0.82rem; line-height: 1.6; white-space: pre-wrap; margin: 0; }

.dev-table-wrap { overflow-x: auto; margin-bottom: 12px; }
.dev-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.dev-table th { text-align: left; padding: 8px 12px; border-bottom: 2px solid var(--aw-border); font-size: 0.78rem; font-weight: 700; color: var(--aw-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.dev-table td { padding: 9px 12px; border-bottom: 1px solid var(--aw-border); vertical-align: top; }
.dev-table code { background: var(--aw-surface-2); padding: 2px 6px; border-radius: 4px; font-size: 0.82rem; }

/* API key management */
.dev-key-box { background: var(--aw-surface-2); border: 1px solid var(--aw-border); border-radius: 12px; padding: 20px; margin-top: 16px; }
.dev-new-key { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
.dev-new-key input, .dev-new-key select { border: 1px solid var(--aw-border); border-radius: 8px; padding: 8px 12px; font-size: 0.88rem; background: var(--aw-surface); color: var(--aw-text); }
.dev-new-key input { flex: 1; min-width: 180px; }
.dev-new-key button { background: var(--aw-accent); color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-weight: 700; cursor: pointer; }
.dev-new-key button:disabled { opacity: 0.5; cursor: not-allowed; }
.dev-btn-revoke { background: transparent; border: 1px solid #f87171; color: #f87171; border-radius: 6px; padding: 3px 10px; font-size: 0.78rem; cursor: pointer; }
.dev-key-reveal { background: #111827; border-radius: 10px; padding: 14px 18px; margin-top: 12px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.dev-key-reveal strong { color: #fbbf24; font-size: 0.85rem; }
.dev-key-reveal code { color: #6ee7b7; font-family: monospace; word-break: break-all; }
.dev-key-reveal button { background: var(--aw-accent); color: #fff; border: none; border-radius: 6px; padding: 4px 14px; font-size: 0.82rem; cursor: pointer; }
.dev-login-prompt { background: var(--aw-surface-2); border: 1px solid var(--aw-border); border-radius: 10px; padding: 16px 20px; margin-top: 12px; font-size: 0.9rem; }
.dev-login-prompt a { text-decoration: underline; }

/* Tier badges */
.dev-tier { display: inline-block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 8px; border-radius: 99px; }
.dev-tier--free { background: #e0f2fe; color: #0369a1; }
.dev-tier--developer { background: #fef3c7; color: #92400e; }
.dev-tier--business { background: #ede9fe; color: #6b21a8; }

.dev-badge-preview { margin-top: 12px; }
.dev-badge-img { display: block; margin-bottom: 8px; }
.muted { color: var(--aw-text-muted); font-size: 0.9rem; }
.form-error { color: #f87171; font-size: 0.85rem; margin-top: 8px; }
</style>
