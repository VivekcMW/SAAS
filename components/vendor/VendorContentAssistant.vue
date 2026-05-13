<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">
          <span class="vw-ai-chip">AI</span>
          Content assistant
        </h1>
        <p class="bw-head__sub">Generate listing titles, descriptions, and feature bullets in seconds.</p>
      </div>
    </header>

    <div class="ca-grid">
      <!-- Form -->
      <section class="bw-card">
        <h2 class="bw-card__title">Tell me about your product</h2>
        <label class="bw-label">Product (1 line)</label>
        <input v-model="form.product" class="bw-input" placeholder="e.g. Acme CRM — a pipeline tool for SMB sales teams" >

        <label class="bw-label">Target audience</label>
        <input v-model="form.audience" class="bw-input" placeholder="e.g. 10–200 person B2B SaaS teams" >

        <label class="bw-label">Top integrations (comma separated)</label>
        <input v-model="form.integrations" class="bw-input" placeholder="e.g. Slack, Zapier, Salesforce" >

        <label class="bw-label">Tone</label>
        <select v-model="form.tone" class="bw-select">
          <option value="professional">Professional</option>
          <option value="warm">Warm &amp; friendly</option>
          <option value="concise">Concise</option>
        </select>

        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <button class="bw-btn bw-btn--primary" :disabled="!canGen || generating" @click="generate">
            <svg v-if="!generating" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 3l14 9-14 9V3z"/></svg>
            {{ generating ? 'Generating…' : 'Generate with AI' }}
          </button>
          <button class="bw-btn bw-btn--subtle" :disabled="generating" @click="reset">Reset</button>
        </div>
      </section>

      <!-- Preview -->
      <section class="bw-card ca-preview">
        <div class="bw-card__head">
          <h2 class="bw-card__title">Preview</h2>
          <button v-if="draft" class="bw-btn bw-btn--ghost bw-btn--sm" @click="copy">Copy all</button>
        </div>

        <div v-if="!draft && !generating" class="ca-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--vw-ai);"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
          <p>Fill in the form and I'll draft your listing copy.</p>
        </div>

        <div v-if="generating" class="ca-empty">
          <div class="ca-spinner" />
          <p>Drafting with AI…</p>
        </div>

        <div v-if="draft && !generating" class="ca-result">
          <div class="ca-field">
            <label class="ca-field__label">Title</label>
            <div class="ca-field__value">{{ draft.title }}</div>
          </div>
          <div class="ca-field">
            <label class="ca-field__label">Description</label>
            <div class="ca-field__value ca-field__value--body">{{ draft.description }}</div>
          </div>
          <div class="ca-field">
            <label class="ca-field__label">Feature bullets</label>
            <ul class="ca-bullets">
              <li v-for="(b, i) in draft.bullets" :key="i">{{ b }}</li>
            </ul>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 14px;">
            <button class="bw-btn bw-btn--primary bw-btn--sm" @click="useIt">Save to listing</button>
            <button class="bw-btn bw-btn--subtle bw-btn--sm" @click="generate">Regenerate</button>
          </div>
        </div>
      </section>
    </div>

    <div v-if="toast" class="bw-toast-fixed">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const ai = useAICopilot()
const { listings: _listings } = useVendorData()

const form = ref({ product: '', audience: '', integrations: '', tone: 'professional' })
const draft = ref<{ title: string; description: string; bullets: string[] } | null>(null)
const generating = ref(false)
const saving = ref(false)
const toast = ref('')
const targetListingId = ref('')

const canGen = computed(() => form.value.product.trim().length > 5)

async function generate() {
  generating.value = true
  draft.value = null
  const res = await ai.generateListingCopy({
    product: form.value.product,
    audience: form.value.audience,
    integrations: form.value.integrations.split(',').map(s => s.trim()).filter(Boolean).join(', ')
  })
  draft.value = res
  generating.value = false
}
function reset() {
  draft.value = null
}
function copy() {
  if (!draft.value) return
  const text = `${draft.value.title}\n\n${draft.value.description}\n\n${draft.value.bullets.map(b => '• ' + b).join('\n')}`
  if (navigator.clipboard) navigator.clipboard.writeText(text)
  toast.value = 'Copied to clipboard'
  setTimeout(() => toast.value = '', 1800)
}
async function useIt() {
  if (!draft.value || !targetListingId.value) return
  saving.value = true
  try {
    await $fetch(`/api/vendor/apps/${targetListingId.value}`, {
      method: 'PUT',
      body: {
        name: draft.value.title,
        description: draft.value.description,
      }
    })
    toast.value = 'Saved to listing — open Listings to review and publish.'
    targetListingId.value = ''
  } catch {
    toast.value = 'Save failed — please try again.'
  } finally {
    saving.value = false
    setTimeout(() => (toast.value = ''), 2800)
  }
}
</script>

<style scoped>
.ca-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
@media (max-width: 960px) { .ca-grid { grid-template-columns: 1fr; } }

.ca-preview { min-height: 420px; }
.ca-empty { text-align: center; padding: 56px 16px; color: var(--vw-text-muted); }
.ca-empty p { margin: 12px 0 0; font-size: 0.9rem; }

.ca-spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid var(--vw-ai-100);
  border-top-color: var(--vw-ai);
  margin: 0 auto; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.ca-field { margin-bottom: 14px; }
.ca-field__label { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--vw-text-subtle); font-weight: 600; margin-bottom: 4px; }
.ca-field__value { font-size: 1rem; font-weight: 600; font-family: var(--f-ui); }
.ca-field__value--body { font-weight: 400; font-family: inherit; line-height: 1.55; color: var(--vw-text); }

.ca-bullets { margin: 0; padding-left: 20px; font-size: 0.9rem; }
.ca-bullets li { margin-bottom: 4px; }

.ca-save-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 14px; }
.ca-save-select { flex: 1; min-width: 180px; }

.bw-toast-fixed {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: var(--vw-surface-2); border: 1px solid var(--vw-border-strong); color: var(--vw-text); padding: 10px 16px; border-radius: 10px;
  font-size: 0.88rem; z-index: 1000;
}
</style>
