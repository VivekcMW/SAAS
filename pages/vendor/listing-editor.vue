<template>
  <!-- Published success screen -->
  <div v-if="published" class="le-success">
    <div class="le-success__card">
      <div class="le-success__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="9 12 11 14 15 10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1>Your listing is live!</h1>
      <p>{{ editor.draft.name }} is now visible on the Moonmart marketplace.</p>
      <div class="le-success__actions">
        <NuxtLink :to="editor.publishedUrl.value || '/marketplace'" class="le-btn le-btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View live listing
        </NuxtLink>
        <NuxtLink to="/list-product" class="le-btn le-btn--ghost">List another product</NuxtLink>
      </div>
    </div>

    <!-- SEO score + promote widgets, shown if we have an app ID -->
    <div v-if="editor.publishedId.value" class="le-success__widgets">
      <VendorSeoScoreWidget :app-id="editor.publishedId.value" :app-name="editor.publishedName.value" />
      <VendorPromoteApp :app-id="editor.publishedId.value" :app-name="editor.publishedName.value" />
    </div>
  </div>

  <!-- Editor layout -->
  <div v-else class="le-root">

    <!-- ── Top bar ─────────────────────────────────────────────────────────── -->
    <header class="le-topbar">
      <NuxtLink to="/list-product" class="le-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </NuxtLink>

      <div class="le-topbar__title">
        <span class="le-logo-mark">M</span>
        <span class="le-page-name">Listing Preview</span>
        <span class="le-status-pill" :class="editor.publishedAsDraft.value ? 'le-status-pill--draft' : 'le-status-pill--new'">
          {{ editor.publishedAsDraft.value ? 'Draft saved' : 'Not saved' }}
        </span>
      </div>

      <div class="le-topbar__score">
        <div class="le-score-bar">
          <div class="le-score-bar__fill" :style="{ width: editor.completeness.value + '%' }" />
        </div>
        <span class="le-score-label">{{ editor.completeness.value }}% complete</span>
      </div>

      <div class="le-topbar__actions">
        <span v-if="editor.saveError.value" class="le-save-error">{{ editor.saveError.value }}</span>
        <button class="le-btn le-btn--ghost" :disabled="editor.saving.value" @click="handleSaveDraft">
          <svg v-if="editor.saving.value" class="le-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          {{ editor.saving.value ? 'Saving…' : 'Save draft' }}
        </button>
        <button class="le-btn le-btn--primary" :disabled="editor.publishing.value || !canPublish" @click="handlePublish">
          <svg v-if="editor.publishing.value" class="le-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          {{ editor.publishing.value ? 'Publishing…' : 'Publish' }}
        </button>
      </div>
    </header>

    <!-- ── Body: preview + editor ─────────────────────────────────────────── -->
    <div class="le-body">

      <!-- LEFT — Live preview ──────────────────────────────────────────────── -->
      <div class="le-preview-pane" @click.self="activeSection = null">
        <div class="le-preview-frame">
          <!-- Preview header bar (fakes browser chrome) -->
          <div class="le-browser-chrome">
            <div class="le-browser-dots"><span/><span/><span/></div>
            <div class="le-browser-url">moonmart.ai/app/{{ slugifiedName }}</div>
          </div>

          <!-- ── Listing content ──────────────────────────────────────────── -->
          <div class="le-listing">

            <!-- Hero -->
            <section
              class="le-section"
              :class="{ 'le-section--active': activeSection === 'basics' }"
              @click="setSection('basics')"
            >
              <div class="le-hero">
                <div class="le-hero__img-wrap">
                  <img
                    v-if="editor.draft.screenshots[0]"
                    :src="editor.draft.screenshots[0]"
                    class="le-hero__img"
                    alt="Screenshot"
                  >
                  <div v-else class="le-hero__img-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>Add a screenshot</span>
                  </div>
                </div>
                <div class="le-hero__body">
                  <div class="le-hero__badges">
                    <span v-if="editor.draft.categories[0]" class="le-badge le-badge--cat">{{ categoryLabel(editor.draft.categories[0]) }}</span>
                    <span class="le-badge le-badge--price">{{ editor.pricingLabel.value }}</span>
                  </div>
                  <div class="le-hero__brand">
                    <div class="le-hero__logo-wrap">
                      <img v-if="editor.draft.logo" :src="editor.draft.logo" class="le-hero__logo" :alt="editor.draft.name" @error="editor.draft.logo = ''" >
                      <div v-else class="le-hero__logo-fallback">{{ initial }}</div>
                    </div>
                    <div>
                      <h1 class="le-hero__name">{{ editor.draft.name || 'Your App Name' }}</h1>
                      <p class="le-hero__provider">by {{ editor.draft.provider || 'Your Company' }}</p>
                    </div>
                  </div>
                  <p class="le-hero__tagline">{{ editor.draft.tagline || 'Your product tagline will appear here.' }}</p>
                  <div v-if="editor.draft.keywords.length" class="le-hero__keywords">
                    <span v-for="kw in editor.draft.keywords.slice(0, 5)" :key="kw" class="le-kw">{{ kw }}</span>
                  </div>
                </div>
              </div>
              <div class="le-section-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit basics
              </div>
            </section>

            <!-- Screenshots -->
            <section
              class="le-section"
              :class="{ 'le-section--active': activeSection === 'media' }"
              @click="setSection('media')"
            >
              <h2 class="le-section-title">Screenshots</h2>
              <div v-if="editor.draft.screenshots.length" class="le-screenshots">
                <img
                  v-for="(ss, i) in editor.draft.screenshots.slice(0, 4)"
                  :key="i"
                  :src="ss"
                  class="le-screenshot"
                  :alt="`Screenshot ${i + 1}`"
                >
              </div>
              <div v-else class="le-empty-section">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                No screenshots yet — add some to showcase your product
              </div>
              <div class="le-section-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit media
              </div>
            </section>

            <!-- Features -->
            <section
              class="le-section"
              :class="{ 'le-section--active': activeSection === 'features' }"
              @click="setSection('features')"
            >
              <h2 class="le-section-title">Features</h2>
              <div v-if="editor.draft.features.length" class="le-features">
                <div v-for="(f, i) in editor.draft.features" :key="i" class="le-feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14" class="le-feature__check"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ f }}
                </div>
              </div>
              <div v-else class="le-empty-section">
                Add your key features to highlight what makes your product great
              </div>
              <div class="le-section-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit features
              </div>
            </section>

            <!-- Pricing -->
            <section
              class="le-section"
              :class="{ 'le-section--active': activeSection === 'pricing' }"
              @click="setSection('pricing')"
            >
              <h2 class="le-section-title">Pricing</h2>
              <div class="le-pricing-card">
                <div class="le-pricing-card__header">
                  <span class="le-pricing-card__type">{{ pricingTypeLabel }}</span>
                  <span class="le-pricing-card__amount">{{ editor.pricingLabel.value }}</span>
                </div>
                <p v-if="editor.draft.pricingType === 'contact'" class="le-pricing-card__note">
                  Contact {{ editor.draft.provider || 'vendor' }} for custom pricing
                </p>
                <p v-else-if="editor.draft.pricingType === 'free'" class="le-pricing-card__note">
                  Free to use · No credit card required
                </p>
                <p v-else-if="editor.draft.pricingType === 'freemium'" class="le-pricing-card__note">
                  Free plan available · Upgrade for more features
                </p>
              </div>
              <div class="le-section-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit pricing
              </div>
            </section>

            <!-- About -->
            <section
              class="le-section"
              :class="{ 'le-section--active': activeSection === 'about' }"
              @click="setSection('about')"
            >
              <h2 class="le-section-title">About</h2>
              <p v-if="editor.draft.description" class="le-about-text">{{ editor.draft.description }}</p>
              <div v-else class="le-empty-section">
                Add a description to tell users more about your product
              </div>
              <div class="le-section-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit about
              </div>
            </section>

          </div><!-- /le-listing -->
        </div><!-- /le-preview-frame -->
      </div><!-- /le-preview-pane -->

      <!-- RIGHT — Editor panel ─────────────────────────────────────────────── -->
      <aside class="le-editor-pane">
        <div class="le-editor-inner">
          <!-- Section tabs -->
          <nav class="le-tabs">
            <button
              v-for="tab in TABS"
              :key="tab.id"
              class="le-tab"
              :class="{ 'le-tab--active': activeSection === tab.id }"
              @click="setSection(tab.id)"
            >
              <span class="le-tab__dot" :class="tabComplete(tab.id) ? 'le-tab__dot--done' : 'le-tab__dot--empty'" />
              {{ tab.label }}
            </button>
          </nav>

          <!-- ── BASICS ──────────────────────────────────────────────────── -->
          <div v-show="activeSection === 'basics'" class="le-fields">
            <div class="le-field">
              <label class="le-label">Product name <span class="le-req">*</span></label>
              <input v-model="editor.draft.name" class="le-input" placeholder="e.g. Notion" maxlength="80" @input="editor.persist()" >
            </div>
            <div class="le-field">
              <label class="le-label">Company / maker <span class="le-req">*</span></label>
              <input v-model="editor.draft.provider" class="le-input" placeholder="e.g. Notion Labs" maxlength="80" @input="editor.persist()" >
            </div>
            <div class="le-field">
              <label class="le-label">Tagline <span class="le-req">*</span></label>
              <input v-model="editor.draft.tagline" class="le-input" placeholder="One sentence that sells your product" maxlength="160" @input="editor.persist()" >
              <span class="le-hint">{{ editor.draft.tagline.length }}/160</span>
            </div>
            <div class="le-field">
              <label class="le-label">Website URL</label>
              <input v-model="editor.draft.websiteUrl" class="le-input" type="url" placeholder="https://yourapp.com" @input="editor.persist()" >
            </div>
            <div class="le-field">
              <label class="le-label">Categories <span class="le-req">*</span></label>
              <div class="le-cat-grid">
                <button
                  v-for="cat in CATEGORIES"
                  :key="cat.value"
                  type="button"
                  class="le-cat-btn"
                  :class="{ 'le-cat-btn--active': editor.draft.categories.includes(cat.value) }"
                  @click="toggleCategory(cat.value)"
                >
                  {{ cat.label }}
                </button>
              </div>
            </div>
            <div class="le-field">
              <label class="le-label">Keywords / tags</label>
              <div class="le-tags-wrap">
                <span
                  v-for="(kw, i) in editor.draft.keywords"
                  :key="kw"
                  class="le-tag"
                >
                  {{ kw }}
                  <button type="button" class="le-tag__rm" @click="removeKeyword(i)">×</button>
                </span>
                <input
                  v-model.trim="keywordDraft"
                  class="le-tag-input"
                  placeholder="Add tag, press Enter"
                  maxlength="32"
                  @keydown.enter.prevent="addKeyword"
                  @keydown="(e: KeyboardEvent) => { if (e.key === ',') { e.preventDefault(); addKeyword() } }"
                >
              </div>
            </div>
          </div>

          <!-- ── MEDIA ───────────────────────────────────────────────────── -->
          <div v-show="activeSection === 'media'" class="le-fields">
            <div class="le-field">
              <label class="le-label">Logo URL</label>
              <input v-model="editor.draft.logo" class="le-input" type="url" placeholder="https://cdn.example.com/logo.png" @input="editor.persist()" >
              <div v-if="editor.draft.logo" class="le-logo-preview">
                <img :src="editor.draft.logo" alt="Logo preview" @error="editor.draft.logo = ''" >
              </div>
            </div>
            <div class="le-field">
              <label class="le-label">Screenshots <span class="le-hint-inline">(up to 8 URLs)</span></label>
              <div class="le-ss-list">
                <div
                  v-for="(ss, i) in editor.draft.screenshots"
                  :key="i"
                  class="le-ss-item"
                >
                  <img :src="ss" class="le-ss-thumb" alt="" @error="(e) => (e.target as HTMLImageElement).style.display='none'" >
                  <span class="le-ss-url">{{ ss }}</span>
                  <button type="button" class="le-ss-rm" @click="editor.removeScreenshot(i)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div v-if="editor.draft.screenshots.length < 8" class="le-ss-add">
                  <input
                    v-model.trim="ssDraft"
                    class="le-input"
                    type="url"
                    placeholder="https://cdn.example.com/screenshot.png"
                    @keydown.enter.prevent="addScreenshot"
                  >
                  <button type="button" class="le-btn le-btn--ghost le-btn--sm" @click="addScreenshot">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── FEATURES ────────────────────────────────────────────────── -->
          <div v-show="activeSection === 'features'" class="le-fields">
            <div class="le-field">
              <label class="le-label">About / Description</label>
              <textarea
                v-model="editor.draft.description"
                class="le-textarea"
                rows="5"
                placeholder="Describe your product in detail. What problem does it solve? Who is it for?"
                maxlength="2000"
                @input="editor.persist()"
              />
              <span class="le-hint">{{ editor.draft.description.length }}/2000</span>
            </div>
            <div class="le-field">
              <label class="le-label">Key features <span class="le-hint-inline">(at least 3 recommended)</span></label>
              <ul class="le-feat-list">
                <li v-for="(f, i) in editor.draft.features" :key="i" class="le-feat-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13" style="color:var(--mm-gold);flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ f }}</span>
                  <button type="button" class="le-feat-rm" @click="editor.removeFeature(i)">×</button>
                </li>
              </ul>
              <div class="le-feat-add">
                <input
                  v-model.trim="featureDraft"
                  class="le-input"
                  placeholder="e.g. Real-time collaboration"
                  maxlength="120"
                  @keydown.enter.prevent="addFeature"
                >
                <button type="button" class="le-btn le-btn--ghost le-btn--sm" @click="addFeature">Add</button>
              </div>
            </div>
          </div>

          <!-- ── PRICING ─────────────────────────────────────────────────── -->
          <div v-show="activeSection === 'pricing'" class="le-fields">
            <div class="le-field">
              <label class="le-label">Pricing model <span class="le-req">*</span></label>
              <div class="le-pricing-options">
                <button
                  v-for="pt in PRICING_TYPES"
                  :key="pt.value"
                  type="button"
                  class="le-pricing-opt"
                  :class="{ 'le-pricing-opt--active': editor.draft.pricingType === pt.value }"
                  @click="editor.draft.pricingType = pt.value; editor.persist()"
                >
                  <span class="le-pricing-opt__label">{{ pt.label }}</span>
                  <span class="le-pricing-opt__desc">{{ pt.desc }}</span>
                </button>
              </div>
            </div>
            <div v-if="editor.draft.pricingType === 'paid'" class="le-field">
              <label class="le-label">Starting price (USD)</label>
              <div class="le-price-row">
                <span class="le-currency">$</span>
                <input
                  v-model.number="editor.draft.pricingValue"
                  class="le-input le-input--price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="29"
                  @input="editor.persist()"
                >
                <select v-model="editor.draft.pricingPeriod" class="le-select" @change="editor.persist()">
                  <option value="month">/ month</option>
                  <option value="year">/ year</option>
                  <option value="">one-time</option>
                </select>
              </div>
            </div>
            <div v-if="editor.draft.pricingType === 'contact'" class="le-field">
              <label class="le-label">Contact email</label>
              <input v-model="editor.draft.contactEmail" class="le-input" type="email" placeholder="sales@yourcompany.com" @input="editor.persist()" >
            </div>
          </div>

          <!-- ── ABOUT (same as features tab scroll target) ──────────────── -->
          <div v-show="activeSection === 'about'" class="le-fields">
            <div class="le-field">
              <label class="le-label">About / Description</label>
              <textarea
                v-model="editor.draft.description"
                class="le-textarea"
                rows="8"
                placeholder="Describe your product in detail. What problem does it solve? Who is it for?"
                maxlength="2000"
                @input="editor.persist()"
              />
              <span class="le-hint">{{ editor.draft.description.length }}/2000</span>
            </div>
            <div class="le-field">
              <label class="le-label">Website URL</label>
              <input v-model="editor.draft.websiteUrl" class="le-input" type="url" placeholder="https://yourapp.com" @input="editor.persist()" >
            </div>
          </div>

          <!-- Publish checklist -->
          <div class="le-checklist">
            <p class="le-checklist__title">Before publishing</p>
            <ul class="le-checklist__list">
              <li :class="{ done: !!editor.draft.name }">
                <span class="chk-icon">{{ editor.draft.name ? '✓' : '○' }}</span> Product name
              </li>
              <li :class="{ done: !!editor.draft.tagline }">
                <span class="chk-icon">{{ editor.draft.tagline ? '✓' : '○' }}</span> Tagline
              </li>
              <li :class="{ done: editor.draft.categories.length > 0 }">
                <span class="chk-icon">{{ editor.draft.categories.length > 0 ? '✓' : '○' }}</span> Category
              </li>
              <li :class="{ done: !!editor.draft.logo }">
                <span class="chk-icon">{{ editor.draft.logo ? '✓' : '○' }}</span> Logo
              </li>
              <li :class="{ done: editor.draft.screenshots.length > 0 }">
                <span class="chk-icon">{{ editor.draft.screenshots.length > 0 ? '✓' : '○' }}</span> At least 1 screenshot
              </li>
              <li :class="{ done: editor.draft.features.length >= 3 }">
                <span class="chk-icon">{{ editor.draft.features.length >= 3 ? '✓' : '○' }}</span> 3+ features
              </li>
            </ul>
          </div>

        </div>
      </aside>

    </div><!-- /le-body -->

    <!-- Publish confirm modal -->
    <div v-if="showPublishModal" class="le-modal-overlay" @click.self="showPublishModal = false">
      <div class="le-modal">
        <h2>Ready to go live?</h2>
        <p>Your listing for <strong>{{ editor.draft.name }}</strong> will be visible to all Moonmart visitors immediately.</p>
        <div v-if="editor.saveError.value" class="le-modal-error">{{ editor.saveError.value }}</div>
        <div class="le-modal-actions">
          <button class="le-btn le-btn--ghost" @click="showPublishModal = false">Cancel</button>
          <button class="le-btn le-btn--primary" :disabled="editor.publishing.value" @click="confirmPublish">
            <svg v-if="editor.publishing.value" class="le-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ editor.publishing.value ? 'Publishing…' : 'Yes, publish now' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useListingEditor } from '~/composables/useListingEditor'
import VendorSeoScoreWidget from '~/components/vendor/VendorSeoScoreWidget.vue'
import VendorPromoteApp from '~/components/vendor/VendorPromoteApp.vue'

definePageMeta({ layout: false })

useHead({ title: 'Listing Preview & Publish — Moonmart' })

const editor = useListingEditor()

const activeSection = ref<string>('basics')
const keywordDraft = ref('')
const featureDraft = ref('')
const ssDraft = ref('')
const showPublishModal = ref(false)
const published = ref(false)

onMounted(() => {
  editor.loadFromSession()
  // Default to first section
  if (!activeSection.value) activeSection.value = 'basics'
})

function setSection(id: string) {
  activeSection.value = id
}

// ── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'crm', label: 'CRM' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'support', label: 'Customer Support' },
  { value: 'payments', label: 'Payments' },
  { value: 'developer', label: 'Developer Tools' },
  { value: 'design', label: 'Design' },
  { value: 'hr', label: 'HR & People' },
  { value: 'ai', label: 'AI & ML' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' },
]

const PRICING_TYPES = [
  { value: 'free' as const, label: 'Free', desc: 'Always free' },
  { value: 'freemium' as const, label: 'Freemium', desc: 'Free + paid plans' },
  { value: 'paid' as const, label: 'Paid', desc: 'Paid subscription' },
  { value: 'contact' as const, label: 'Contact', desc: 'Custom / enterprise' },
]

const TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'media', label: 'Media' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'about', label: 'About' },
]

// ── Derived values ───────────────────────────────────────────────────────────
const initial = computed(() =>
  editor.draft.name ? editor.draft.name.charAt(0).toUpperCase() : 'M'
)

const slugifiedName = computed(() =>
  (editor.draft.name || 'your-app').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
)

const pricingTypeLabel = computed(() => {
  const map: Record<string, string> = {
    free: 'Free',
    freemium: 'Freemium',
    paid: 'Paid plan',
    contact: 'Enterprise',
  }
  return map[editor.draft.pricingType] || 'Paid'
})

const canPublish = computed(() =>
  !!editor.draft.name && !!editor.draft.tagline && editor.draft.categories.length > 0
)

function categoryLabel(val: string) {
  return CATEGORIES.find(c => c.value === val)?.label ?? val
}

function tabComplete(id: string) {
  const d = editor.draft
  switch (id) {
    case 'basics': return !!d.name && !!d.tagline && d.categories.length > 0
    case 'media': return !!d.logo && d.screenshots.length > 0
    case 'features': return d.features.length >= 3
    case 'pricing': return !!d.pricingType
    case 'about': return !!d.description
    default: return false
  }
}

// ── Keyword helpers ──────────────────────────────────────────────────────────
function addKeyword() {
  const kw = keywordDraft.value.trim()
  if (kw && !editor.draft.keywords.includes(kw)) {
    editor.draft.keywords.push(kw)
    editor.persist()
  }
  keywordDraft.value = ''
}
function removeKeyword(i: number) {
  editor.draft.keywords.splice(i, 1)
  editor.persist()
}

function toggleCategory(val: string) {
  const idx = editor.draft.categories.indexOf(val)
  if (idx >= 0) editor.draft.categories.splice(idx, 1)
  else editor.draft.categories.push(val)
  editor.persist()
}

// ── Feature helpers ──────────────────────────────────────────────────────────
function addFeature() {
  editor.addFeature(featureDraft.value)
  featureDraft.value = ''
}

// ── Screenshot helpers ───────────────────────────────────────────────────────
function addScreenshot() {
  editor.addScreenshot(ssDraft.value)
  ssDraft.value = ''
}

// ── Save / Publish ───────────────────────────────────────────────────────────
async function handleSaveDraft() {
  await editor.saveDraft()
}

function handlePublish() {
  showPublishModal.value = true
}

async function confirmPublish() {
  const ok = await editor.publish()
  if (ok) {
    showPublishModal.value = false
    published.value = true
  }
}
</script>

<style scoped>
/* ── Root ───────────────────────────────────────────────────────────────────── */
.le-root {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  background: var(--mm-bg, #0D1117);
  font-family: var(--f-ui, system-ui, sans-serif);
}

/* ── Top bar ────────────────────────────────────────────────────────────────── */
.le-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  height: 52px;
  border-bottom: 0.5px solid var(--b1, rgba(255,255,255,.08));
  background: var(--mm-s1, #141921);
  flex-shrink: 0;
  z-index: 100;
}

.le-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  color: var(--mm-slate, #68788F);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: color .15s, background .15s;
  white-space: nowrap;
}
.le-back:hover { color: var(--mm-pearl, #E2E8F0); background: var(--mm-s2, #1F2742); }

.le-topbar__title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.le-logo-mark {
  width: 24px;
  height: 24px;
  background: var(--mm-gold, #D4A843);
  color: var(--mm-bg, #0D1117);
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.le-page-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--mm-pearl, #E2E8F0);
}
.le-status-pill {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  padding: 2px 7px;
  border-radius: 999px;
}
.le-status-pill--new { background: rgba(168,181,204,.1); color: var(--mm-slate, #68788F); }
.le-status-pill--draft { background: rgba(212,168,67,.12); color: var(--mm-gold, #D4A843); }

.le-topbar__score {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}
.le-score-bar {
  width: 80px;
  height: 4px;
  background: var(--b1, rgba(255,255,255,.08));
  border-radius: 99px;
  overflow: hidden;
}
.le-score-bar__fill {
  height: 100%;
  background: var(--mm-gold, #D4A843);
  border-radius: 99px;
  transition: width .4s ease;
}
.le-score-label {
  font-size: 0.75rem;
  color: var(--mm-slate, #68788F);
  white-space: nowrap;
}

.le-topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.le-save-error {
  font-size: 0.75rem;
  color: #F87171;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Buttons ────────────────────────────────────────────────────────────────── */
.le-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border-radius: 7px;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 0.5px solid transparent;
  cursor: pointer;
  transition: all .15s;
  text-decoration: none;
  white-space: nowrap;
}
.le-btn--primary {
  background: var(--mm-gold, #D4A843);
  color: var(--mm-bg, #0D1117);
  border-color: var(--mm-gold, #D4A843);
}
.le-btn--primary:hover:not(:disabled) { filter: brightness(1.08); }
.le-btn--primary:disabled { opacity: .5; cursor: not-allowed; }
.le-btn--ghost {
  background: transparent;
  color: var(--mm-silver, #A8B5CC);
  border-color: var(--b2, rgba(255,255,255,.12));
}
.le-btn--ghost:hover:not(:disabled) { background: var(--mm-s2, #1F2742); color: var(--mm-pearl, #E2E8F0); }
.le-btn--ghost:disabled { opacity: .5; cursor: not-allowed; }
.le-btn--sm { height: 30px; padding: 0 10px; font-size: 0.75rem; }

/* ── Body split ─────────────────────────────────────────────────────────────── */
.le-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* ── Preview pane ───────────────────────────────────────────────────────────── */
.le-preview-pane {
  flex: 1 1 55%;
  overflow-y: auto;
  background: var(--mm-s1, #141921);
  padding: 24px;
}

.le-preview-frame {
  max-width: 820px;
  margin: 0 auto;
  border: 0.5px solid var(--b1, rgba(255,255,255,.08));
  border-radius: 12px;
  overflow: hidden;
  background: var(--mm-bg, #0D1117);
}

/* Fake browser chrome */
.le-browser-chrome {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--mm-s2, #1F2742);
  border-bottom: 0.5px solid var(--b1, rgba(255,255,255,.08));
}
.le-browser-dots {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}
.le-browser-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--b2, rgba(255,255,255,.12));
}
.le-browser-url {
  flex: 1;
  font-size: 0.7rem;
  color: var(--mm-slate, #68788F);
  background: var(--mm-bg, #0D1117);
  border: 0.5px solid var(--b1, rgba(255,255,255,.08));
  border-radius: 5px;
  padding: 4px 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Listing sections */
.le-listing { padding: 0; }

.le-section {
  padding: 24px;
  border-bottom: 0.5px solid var(--b1, rgba(255,255,255,.08));
  cursor: pointer;
  position: relative;
  transition: background .15s;
}
.le-section:hover { background: rgba(212,168,67,.02); }
.le-section--active {
  background: rgba(212,168,67,.04) !important;
  outline: 1.5px solid rgba(212,168,67,.3);
  outline-offset: -1px;
}

/* Edit hint badge */
.le-section-hint {
  position: absolute;
  top: 10px;
  right: 12px;
  display: none;
  align-items: center;
  gap: 4px;
  font-size: 0.6875rem;
  color: var(--mm-gold, #D4A843);
  background: rgba(212,168,67,.1);
  border: 0.5px solid rgba(212,168,67,.2);
  padding: 3px 8px;
  border-radius: 5px;
}
.le-section:hover .le-section-hint,
.le-section--active .le-section-hint { display: inline-flex; }

.le-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--mm-pearl, #E2E8F0);
  margin: 0 0 16px;
}

/* Hero */
.le-hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
.le-hero__img-wrap { border-radius: 10px; overflow: hidden; aspect-ratio: 16/9; background: var(--mm-s2, #1F2742); }
.le-hero__img { width: 100%; height: 100%; object-fit: cover; }
.le-hero__img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--mm-slate, #68788F);
  font-size: 0.8125rem;
}

.le-hero__badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.le-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  padding: 3px 9px;
  border-radius: 5px;
}
.le-badge--cat { background: rgba(74,128,212,.15); color: #6FA0E8; }
.le-badge--price { background: rgba(212,168,67,.15); color: var(--mm-gold, #D4A843); }

.le-hero__brand { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.le-hero__logo-wrap { width: 48px; height: 48px; border-radius: 10px; overflow: hidden; flex-shrink: 0; border: 0.5px solid var(--b1, rgba(255,255,255,.08)); }
.le-hero__logo { width: 100%; height: 100%; object-fit: contain; }
.le-hero__logo-fallback {
  width: 100%;
  height: 100%;
  background: var(--mm-s2, #1F2742);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--mm-gold, #D4A843);
}
.le-hero__name { font-size: 1.375rem; font-weight: 800; color: var(--mm-pearl, #E2E8F0); margin: 0; }
.le-hero__provider { font-size: 0.8125rem; color: var(--mm-slate, #68788F); margin: 2px 0 0; }
.le-hero__tagline { font-size: 0.9375rem; color: var(--mm-silver, #A8B5CC); margin: 8px 0 12px; line-height: 1.5; }
.le-hero__keywords { display: flex; flex-wrap: wrap; gap: 5px; }
.le-kw {
  font-size: 0.6875rem;
  background: var(--mm-s2, #1F2742);
  border: 0.5px solid var(--b2, rgba(255,255,255,.12));
  color: var(--mm-slate, #68788F);
  border-radius: 4px;
  padding: 2px 7px;
}

/* Screenshots grid */
.le-screenshots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.le-screenshot {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 6px;
  border: 0.5px solid var(--b1, rgba(255,255,255,.08));
}

/* Empty state */
.le-empty-section {
  padding: 28px;
  text-align: center;
  color: var(--mm-slate, #68788F);
  font-size: 0.8125rem;
  background: var(--mm-s1, #141921);
  border-radius: 8px;
  border: 0.5px dashed var(--b2, rgba(255,255,255,.12));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Features grid */
.le-features {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}
.le-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: var(--mm-silver, #A8B5CC);
  padding: 8px 12px;
  background: var(--mm-s1, #141921);
  border: 0.5px solid var(--b1, rgba(255,255,255,.08));
  border-radius: 7px;
}
.le-feature__check { color: var(--mm-gold, #D4A843); flex-shrink: 0; }

/* Pricing card */
.le-pricing-card {
  background: var(--mm-s1, #141921);
  border: 0.5px solid var(--b1, rgba(255,255,255,.08));
  border-radius: 10px;
  padding: 20px;
  max-width: 320px;
}
.le-pricing-card__header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.le-pricing-card__type { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--mm-slate, #68788F); }
.le-pricing-card__amount { font-size: 1.25rem; font-weight: 800; color: var(--mm-gold, #D4A843); }
.le-pricing-card__note { font-size: 0.8125rem; color: var(--mm-slate, #68788F); margin: 0; }

/* About */
.le-about-text {
  font-size: 0.9rem;
  color: var(--mm-silver, #A8B5CC);
  line-height: 1.65;
  white-space: pre-wrap;
  margin: 0;
}

/* ── Editor pane ────────────────────────────────────────────────────────────── */
.le-editor-pane {
  width: 380px;
  flex-shrink: 0;
  border-left: 0.5px solid var(--b1, rgba(255,255,255,.08));
  overflow-y: auto;
  background: var(--mm-s1, #141921);
}

.le-editor-inner { padding: 0 0 40px; }

/* Tabs */
.le-tabs {
  display: flex;
  border-bottom: 0.5px solid var(--b1, rgba(255,255,255,.08));
  overflow-x: auto;
  scrollbar-width: none;
  position: sticky;
  top: 0;
  background: var(--mm-s1, #141921);
  z-index: 10;
}
.le-tabs::-webkit-scrollbar { display: none; }
.le-tab {
  flex: 1;
  min-width: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--mm-slate, #68788F);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color .15s, border-color .15s;
  white-space: nowrap;
}
.le-tab:hover { color: var(--mm-silver, #A8B5CC); }
.le-tab--active { color: var(--mm-gold, #D4A843); border-bottom-color: var(--mm-gold, #D4A843); }
.le-tab__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.le-tab__dot--done { background: #10B981; }
.le-tab__dot--empty { background: var(--b2, rgba(255,255,255,.12)); }

/* Fields */
.le-fields { padding: 20px; display: flex; flex-direction: column; gap: 18px; }

.le-field { display: flex; flex-direction: column; gap: 6px; }
.le-label { font-size: 0.75rem; font-weight: 600; color: var(--mm-silver, #A8B5CC); }
.le-req { color: var(--mm-gold, #D4A843); }
.le-hint { font-size: 0.6875rem; color: var(--mm-slate, #68788F); text-align: right; }
.le-hint-inline { font-size: 0.6875rem; color: var(--mm-slate, #68788F); font-weight: 400; }

.le-input {
  height: 36px;
  padding: 0 10px;
  border: 0.5px solid var(--b2, rgba(255,255,255,.12));
  border-radius: 7px;
  background: var(--mm-bg, #0D1117);
  color: var(--mm-pearl, #E2E8F0);
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color .15s;
  width: 100%;
  box-sizing: border-box;
}
.le-input:focus { outline: none; border-color: var(--mm-gold, #D4A843); }
.le-input--price { width: 90px; }

.le-textarea {
  padding: 10px;
  border: 0.5px solid var(--b2, rgba(255,255,255,.12));
  border-radius: 7px;
  background: var(--mm-bg, #0D1117);
  color: var(--mm-pearl, #E2E8F0);
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color .15s;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;
}
.le-textarea:focus { outline: none; border-color: var(--mm-gold, #D4A843); }

.le-select {
  height: 36px;
  padding: 0 8px;
  border: 0.5px solid var(--b2, rgba(255,255,255,.12));
  border-radius: 7px;
  background: var(--mm-bg, #0D1117);
  color: var(--mm-pearl, #E2E8F0);
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
}
.le-select:focus { outline: none; border-color: var(--mm-gold, #D4A843); }

/* Category grid */
.le-cat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}
.le-cat-btn {
  padding: 6px 4px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 6px;
  border: 0.5px solid var(--b2, rgba(255,255,255,.12));
  background: var(--mm-bg, #0D1117);
  color: var(--mm-slate, #68788F);
  cursor: pointer;
  transition: all .15s;
  text-align: center;
}
.le-cat-btn:hover { border-color: var(--mm-gold, #D4A843); color: var(--mm-gold, #D4A843); }
.le-cat-btn--active { background: rgba(212,168,67,.12); border-color: var(--mm-gold, #D4A843); color: var(--mm-gold, #D4A843); }

/* Tags */
.le-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 7px;
  border: 0.5px solid var(--b2, rgba(255,255,255,.12));
  border-radius: 7px;
  background: var(--mm-bg, #0D1117);
  min-height: 36px;
  cursor: text;
}
.le-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--mm-s2, #1F2742);
  color: var(--mm-silver, #A8B5CC);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px 2px 8px;
  border-radius: 4px;
}
.le-tag__rm {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--mm-slate, #68788F);
  line-height: 1;
  padding: 0;
  display: flex;
}
.le-tag__rm:hover { color: #F87171; }
.le-tag-input {
  flex: 1;
  min-width: 100px;
  background: none;
  border: none;
  outline: none;
  color: var(--mm-pearl, #E2E8F0);
  font-size: 0.8125rem;
  font-family: inherit;
}

/* Logo preview */
.le-logo-preview {
  margin-top: 8px;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  border: 0.5px solid var(--b1, rgba(255,255,255,.08));
}
.le-logo-preview img { width: 100%; height: 100%; object-fit: contain; background: var(--mm-s2, #1F2742); }

/* Screenshot list */
.le-ss-list { display: flex; flex-direction: column; gap: 8px; }
.le-ss-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--mm-bg, #0D1117);
  border: 0.5px solid var(--b1, rgba(255,255,255,.08));
  border-radius: 7px;
}
.le-ss-thumb { width: 40px; height: 28px; object-fit: cover; border-radius: 4px; flex-shrink: 0; background: var(--mm-s2, #1F2742); }
.le-ss-url { flex: 1; font-size: 0.7rem; color: var(--mm-slate, #68788F); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.le-ss-rm { background: none; border: none; cursor: pointer; color: var(--mm-slate, #68788F); display: flex; padding: 4px; border-radius: 4px; flex-shrink: 0; }
.le-ss-rm:hover { color: #F87171; background: rgba(248,113,113,.08); }
.le-ss-add { display: flex; gap: 6px; }

/* Feature list */
.le-feat-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; }
.le-feat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: var(--mm-silver, #A8B5CC);
  padding: 7px 10px;
  background: var(--mm-bg, #0D1117);
  border: 0.5px solid var(--b1, rgba(255,255,255,.08));
  border-radius: 6px;
}
.le-feat-item span { flex: 1; }
.le-feat-rm { background: none; border: none; cursor: pointer; color: var(--mm-slate, #68788F); font-size: 1rem; line-height: 1; padding: 2px 4px; border-radius: 3px; }
.le-feat-rm:hover { color: #F87171; background: rgba(248,113,113,.08); }
.le-feat-add { display: flex; gap: 6px; }

/* Pricing options */
.le-pricing-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.le-pricing-opt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 8px;
  border: 0.5px solid var(--b2, rgba(255,255,255,.12));
  border-radius: 8px;
  background: var(--mm-bg, #0D1117);
  cursor: pointer;
  transition: all .15s;
}
.le-pricing-opt:hover { border-color: var(--mm-gold, #D4A843); }
.le-pricing-opt--active { background: rgba(212,168,67,.1); border-color: var(--mm-gold, #D4A843); }
.le-pricing-opt__label { font-size: 0.8125rem; font-weight: 700; color: var(--mm-pearl, #E2E8F0); }
.le-pricing-opt__desc { font-size: 0.6875rem; color: var(--mm-slate, #68788F); }
.le-pricing-opt--active .le-pricing-opt__label { color: var(--mm-gold, #D4A843); }

.le-price-row { display: flex; align-items: center; gap: 6px; }
.le-currency { font-size: 0.9375rem; font-weight: 700; color: var(--mm-gold, #D4A843); }

/* Checklist */
.le-checklist {
  margin: 24px 20px 0;
  padding: 16px;
  background: rgba(16,185,129,.04);
  border: 0.5px solid rgba(16,185,129,.15);
  border-radius: 10px;
}
.le-checklist__title { font-size: 0.75rem; font-weight: 700; color: var(--mm-silver, #A8B5CC); margin: 0 0 10px; }
.le-checklist__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.le-checklist__list li {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8rem;
  color: var(--mm-slate, #68788F);
  transition: color .15s;
}
.le-checklist__list li.done { color: #10B981; }
.chk-icon { font-size: 0.75rem; width: 14px; flex-shrink: 0; }

/* ── Modal ──────────────────────────────────────────────────────────────────── */
.le-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
.le-modal {
  background: var(--mm-s1, #141921);
  border: 0.5px solid var(--b2, rgba(255,255,255,.12));
  border-radius: 14px;
  padding: 32px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 24px 80px rgba(0,0,0,.6);
}
.le-modal h2 { font-size: 1.25rem; font-weight: 800; color: var(--mm-pearl, #E2E8F0); margin: 0 0 10px; }
.le-modal p { font-size: 0.9rem; color: var(--mm-silver, #A8B5CC); margin: 0 0 20px; line-height: 1.5; }
.le-modal p strong { color: var(--mm-pearl, #E2E8F0); }
.le-modal-error { font-size: 0.8rem; color: #F87171; margin-bottom: 14px; background: rgba(248,113,113,.08); padding: 8px 12px; border-radius: 6px; }
.le-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }

/* ── Spinner ─────────────────────────────────────────────────────────────────  */
.le-spin {
  animation: le-spin 1s linear infinite;
}
@keyframes le-spin { to { transform: rotate(360deg); } }

/* ── Success screen ─────────────────────────────────────────────────────────── */
.le-success {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mm-bg, #0D1117);
  padding: 32px;
}
.le-success__card {
  max-width: 480px;
  width: 100%;
  text-align: center;
  background: var(--mm-s1, #141921);
  border: 0.5px solid var(--b1, rgba(255,255,255,.08));
  border-radius: 20px;
  padding: 48px 40px;
}
.le-success__icon {
  width: 64px;
  height: 64px;
  background: rgba(16,185,129,.12);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #10B981;
}
.le-success__card h1 { font-size: 1.5rem; font-weight: 800; color: var(--mm-pearl, #E2E8F0); margin: 0 0 10px; }
.le-success__card p { color: var(--mm-slate, #68788F); margin: 0 0 28px; line-height: 1.6; }
.le-success__actions { display: flex; flex-direction: column; gap: 8px; }
.le-success__actions .le-btn { justify-content: center; height: 44px; }
.le-success__widgets { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 520px; margin: 24px auto 0; }

/* ── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .le-body { flex-direction: column; }
  .le-preview-pane { flex: none; min-height: 500px; }
  .le-editor-pane { width: 100%; border-left: none; border-top: 0.5px solid var(--b1, rgba(255,255,255,.08)); }
  .le-topbar { flex-wrap: wrap; height: auto; padding: 10px 16px; gap: 8px; }
  .le-topbar__score { display: none; }
  .le-topbar__actions { margin-left: auto; }
}
@media (max-width: 480px) {
  .le-page-name { display: none; }
}
</style>
