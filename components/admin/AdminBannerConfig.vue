<template>
  <div>

    <!-- Live preview ─────────────────────────────────────────────── -->
    <section class="abc-preview-wrap">
      <p class="abc-preview-label">Live preview</p>
      <div class="abc-preview" :style="{ background: form.bgColor }">
        <div class="abc-preview__inner">
          <div class="abc-preview__left">
            <span class="abc-preview__icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </span>
            <span class="abc-preview__msg" v-html="renderedMessage" />
          </div>
          <div class="abc-preview__right">
            <span v-if="form.ctaLabel" class="abc-preview__cta">
              {{ form.ctaLabel }}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
            <span class="abc-preview__dismiss">✕</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Form ──────────────────────────────────────────────────────── -->
    <div class="bw-grid bw-grid--2" style="gap: 20px; margin-top: 24px;">

      <section class="bw-card">
        <h2 class="bw-card__title abc-section-title">Content</h2>

        <!-- Enabled toggle -->
        <fieldset class="abc-toggle-row abc-fieldset-reset">
          <legend class="abc-legend">Banner enabled</legend>
          <div class="abc-toggle" :class="{ 'abc-toggle--on': form.enabled }" role="switch" :aria-checked="form.enabled" tabindex="0" @click="form.enabled = !form.enabled" @keydown.space.prevent="form.enabled = !form.enabled">
            <span class="abc-toggle__knob" />
          </div>
          <div>
            <strong aria-hidden="true">Banner enabled</strong>
            <p class="abc-hint">When off, the banner is hidden for all visitors.</p>
          </div>
        </fieldset>

        <!-- Show on homepage -->
        <fieldset class="abc-toggle-row abc-fieldset-reset" style="margin-top: 14px;">
          <legend class="abc-legend">Show on homepage</legend>
          <div class="abc-toggle" :class="{ 'abc-toggle--on': form.showOnHomepage }" role="switch" :aria-checked="form.showOnHomepage" tabindex="0" @click="form.showOnHomepage = !form.showOnHomepage" @keydown.space.prevent="form.showOnHomepage = !form.showOnHomepage">
            <span class="abc-toggle__knob" />
          </div>
          <div>
            <strong aria-hidden="true">Show on homepage</strong>
            <p class="abc-hint">By default the banner is hidden on the homepage. Enable to show it there too.</p>
          </div>
        </fieldset>

        <div class="abc-field" style="margin-top: 20px;">
          <label class="abc-label" for="banner-message">
            Banner message
            <span class="abc-hint-inline">Use <code>{currency}</code> to insert the visitor's localised currency code.</span>
          </label>
          <textarea id="banner-message" v-model="form.message" class="bw-input abc-textarea" rows="3" maxlength="200" placeholder="Welcome to Moonmart — Global SaaS Marketplace with localised pricing in {currency}" />
          <div class="abc-char-count">{{ form.message.length }} / 200</div>
        </div>
      </section>

      <section class="bw-card">
        <h2 class="bw-card__title abc-section-title">Call-to-action & style</h2>

        <div class="abc-field">
          <label class="abc-label" for="cta-label">CTA button label</label>
          <input id="cta-label" v-model="form.ctaLabel" class="bw-input" placeholder="Browse apps" maxlength="40" >
          <p class="abc-hint">Leave blank to hide the CTA button.</p>
        </div>

        <div class="abc-field">
          <label class="abc-label" for="cta-url">CTA destination URL</label>
          <input id="cta-url" v-model="form.ctaUrl" class="bw-input" placeholder="/marketplace" maxlength="200" >
        </div>

        <div class="abc-field">
          <label class="abc-label" for="bg-color">Background colour</label>
          <div class="abc-color-row">
            <input id="bg-color-picker" v-model="form.bgColor" type="color" class="abc-color-picker" :title="form.bgColor" >
            <input id="bg-color" v-model="form.bgColor" class="bw-input abc-color-text" placeholder="#131929" maxlength="25" >
          </div>
          <div class="abc-presets">
            <button
              v-for="p in colorPresets"
              :key="p.value"
              class="abc-preset"
              :class="{ 'abc-preset--active': form.bgColor === p.value }"
              :style="{ background: p.value }"
              :title="p.label"
              @click="form.bgColor = p.value"
            />
          </div>
        </div>
      </section>
    </div>

    <!-- Meta / timestamps ─────────────────────────────────────────── -->
    <div v-if="savedConfig.updatedAt" class="abc-meta">
      Last saved {{ new Date(savedConfig.updatedAt).toLocaleString() }}
      <span v-if="savedConfig.updatedBy"> by <strong>{{ savedConfig.updatedBy }}</strong></span>
    </div>

    <p v-if="saveError" class="abc-error">{{ saveError }}</p>
    <div v-if="saved" class="abc-success">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      Banner configuration saved.
    </div>

    <div style="display:flex; gap:10px; margin-top: 24px;">
      <button class="bw-btn bw-btn--primary" :disabled="saving" @click="save">
        {{ saving ? 'Saving…' : 'Save banner config' }}
      </button>
      <button class="bw-btn bw-btn--ghost" :disabled="saving" @click="load">Reset</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface BannerConfig {
  enabled: boolean
  message: string
  ctaLabel: string
  ctaUrl: string
  showOnHomepage: boolean
  bgColor: string
  updatedAt: string | null
  updatedBy: string | null
}

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

const savedConfig = ref<Partial<BannerConfig>>({})
const form = reactive<BannerConfig>({
  enabled: true,
  message: 'Welcome to Moonmart — Global SaaS Marketplace with localised pricing in {currency}',
  ctaLabel: 'Browse apps',
  ctaUrl: '/marketplace',
  showOnHomepage: false,
  bgColor: '#131929',
  updatedAt: null,
  updatedBy: null,
})

const colorPresets = [
  { label: 'Moonmart dark', value: '#131929' },
  { label: 'Navy', value: '#0F1A2E' },
  { label: 'Forest', value: '#0D2418' },
  { label: 'Plum', value: '#1C1030' },
  { label: 'Brand gold', value: '#7A5500' },
  { label: 'Slate', value: '#1E2432' },
]

// Replace {currency} placeholder with a styled example in the preview
const renderedMessage = computed(() => {
  const msg = form.message || ''
  return msg.replace('{currency}', '<strong style="color:#FFC850">USD</strong>')
})

async function load() {
  loading.value = true
  saveError.value = ''
  try {
    const data = await $fetch<BannerConfig>('/api/admin/banner-config')
    savedConfig.value = data
    Object.assign(form, data)
  } finally {
    loading.value = false
  }
}
onMounted(() => { load() })

async function save() {
  saving.value = true
  saved.value = false
  saveError.value = ''
  try {
    const data = await $fetch<BannerConfig>('/api/admin/banner-config', {
      method: 'PUT',
      body: { ...form },
    })
    savedConfig.value = data
    Object.assign(form, data)
    saved.value = true
    setTimeout(() => { saved.value = false }, 4000)
  } catch (e: unknown) {
    saveError.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Failed to save. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* ── Preview ─────────────────────────────────────────── */
.abc-preview-wrap {
  background: var(--bw-bg2, #10141e);
  border: 1px solid var(--bw-border);
  border-radius: 8px;
  overflow: hidden;
}
.abc-preview-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bw-text-muted);
  padding: 8px 14px 6px;
  border-bottom: 1px solid var(--bw-border);
  margin: 0;
}
.abc-preview {
  padding: 10px 20px;
  transition: background 0.2s;
  box-shadow: inset 0 2px 0 0 #FFC850;
}
.abc-preview__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.abc-preview__left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.abc-preview__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1a1200;
  color: #FFC850;
  border: 1px solid rgba(255,200,80,0.25);
  flex-shrink: 0;
}
.abc-preview__msg {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.abc-preview__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.abc-preview__cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.25rem 0.7rem;
  border-radius: 99px;
  background: #FFC850;
  color: #0A0700;
  font-size: 0.7rem;
  font-weight: 700;
}
.abc-preview__dismiss {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  color: rgba(255,255,255,0.5);
}

/* ── Section titles ──────────────────────────────────── */
.abc-section-title {
  margin-bottom: 16px;
}

/* ── Toggle ──────────────────────────────────────────── */
.abc-fieldset-reset {
  border: none;
  padding: 0;
  margin: 0;
}
.abc-legend {
  /* visually hidden — strong label is visible, legend is for AT */
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
}
.abc-toggle-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}
.abc-toggle-row strong { font-size: 0.875rem; color: var(--bw-text); display: block; }

.abc-toggle {
  flex-shrink: 0;
  width: 38px;
  height: 22px;
  border-radius: 99px;
  background: var(--bw-border, #2a2f3e);
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 2px;
}
.abc-toggle--on {
  background: #2a6e3f;
  border-color: rgba(255,255,255,0.15);
}
.abc-toggle__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255,255,255,0.55);
  transition: left 0.18s, background 0.18s;
}
.abc-toggle--on .abc-toggle__knob {
  left: 18px;
  background: #fff;
}

/* ── Fields ──────────────────────────────────────────── */
.abc-field { margin-bottom: 16px; }
.abc-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--bw-text);
  margin-bottom: 6px;
}
.abc-hint {
  font-size: 0.77rem;
  color: var(--bw-text-muted);
  margin: 3px 0 0;
}
.abc-hint-inline {
  display: block;
  font-size: 0.74rem;
  font-weight: 400;
  color: var(--bw-text-muted);
  margin-top: 2px;
}
.abc-hint-inline code {
  background: #1a1200;
  color: #FFC850;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.82em;
}
.abc-textarea {
  width: 100%;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}
.abc-char-count {
  font-size: 0.72rem;
  color: var(--bw-text-muted);
  text-align: right;
  margin-top: 3px;
}

/* ── Colour picker ───────────────────────────────────── */
.abc-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.abc-color-picker {
  width: 38px;
  height: 36px;
  border: 1px solid var(--bw-border);
  border-radius: 6px;
  padding: 2px;
  background: var(--bw-bg2);
  cursor: pointer;
  flex-shrink: 0;
}
.abc-color-text {
  flex: 1;
  font-family: monospace;
  font-size: 0.875rem;
}
.abc-presets {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.abc-preset {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}
.abc-preset:hover { transform: scale(1.1); }
.abc-preset--active { border-color: #FFC850; }

/* ── Meta / status ───────────────────────────────────── */
.abc-meta {
  font-size: 0.78rem;
  color: var(--bw-text-muted);
  margin-top: 16px;
}
.abc-error {
  color: var(--bw-danger, #e05656);
  font-size: 0.82rem;
  margin-top: 10px;
}
.abc-success {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #4caf7d;
  margin-top: 10px;
}
</style>
