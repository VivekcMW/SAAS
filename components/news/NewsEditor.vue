<template>
  <form class="news-editor" @submit.prevent="$emit('submit')">
    <!-- Post Type -->
    <div class="ne-field">
      <label class="ne-label" for="ne-type">Post Type</label>
      <select id="ne-type" class="ne-select" :value="modelValue.postType" @change="update('postType', ($event.target as HTMLSelectElement).value)">
        <option value="announcement">Announcement</option>
        <option value="product-update">Product Update</option>
        <option value="feature">Feature</option>
        <option value="case-study">Case Study</option>
        <option value="culture">Culture</option>
      </select>
    </div>

    <!-- Title -->
    <div class="ne-field">
      <label class="ne-label" for="ne-title">Title <span class="ne-required">*</span></label>
      <input id="ne-title" class="ne-input" type="text" maxlength="160" placeholder="What's the news?" :value="modelValue.title" @input="update('title', ($event.target as HTMLInputElement).value)" required />
    </div>

    <!-- Excerpt -->
    <div class="ne-field">
      <label class="ne-label" for="ne-excerpt">Excerpt <span class="ne-required">*</span></label>
      <textarea id="ne-excerpt" class="ne-textarea ne-textarea--short" maxlength="300" placeholder="One-sentence summary shown in the feed…" :value="modelValue.excerpt" @input="update('excerpt', ($event.target as HTMLTextAreaElement).value)" required></textarea>
      <span class="ne-hint">{{ (modelValue.excerpt || '').length }} / 300</span>
    </div>

    <!-- Body -->
    <div class="ne-field">
      <label class="ne-label" for="ne-body">Content (Markdown) <span class="ne-required">*</span></label>
      <textarea id="ne-body" class="ne-textarea ne-textarea--tall" placeholder="Write your story in Markdown…" :value="modelValue.bodyMarkdown" @input="update('bodyMarkdown', ($event.target as HTMLTextAreaElement).value)" required></textarea>
      <span class="ne-hint">Markdown is supported: **bold**, _italic_, ## headings, `code`, [links](url)</span>
    </div>

    <!-- Cover Image -->
    <div class="ne-field">
      <label class="ne-label" for="ne-cover">Cover Image URL</label>
      <input id="ne-cover" class="ne-input" type="url" placeholder="https://…" :value="modelValue.coverImage ?? ''" @input="update('coverImage', ($event.target as HTMLInputElement).value || null)" />
    </div>

    <!-- Tags -->
    <div class="ne-field">
      <label class="ne-label" for="ne-tags">Tags</label>
      <input id="ne-tags" class="ne-input" type="text" placeholder="e.g. ai, security, mobile (comma-separated)" :value="(modelValue.tags || []).join(', ')" @input="updateTags(($event.target as HTMLInputElement).value)" />
      <span class="ne-hint">Up to 8 tags</span>
    </div>

    <!-- App link (optional) -->
    <div v-if="apps && apps.length" class="ne-field">
      <label class="ne-label" for="ne-app">Related Product</label>
      <select id="ne-app" class="ne-select" :value="modelValue.appId ?? ''" @change="update('appId', ($event.target as HTMLSelectElement).value || null)">
        <option value="">— None —</option>
        <option v-for="app in apps" :key="app.id" :value="app.id">{{ app.name }}</option>
      </select>
    </div>

    <!-- Actions -->
    <div class="ne-actions">
      <button type="button" class="ne-btn ne-btn--ghost" :disabled="loading" @click="$emit('save-draft')">
        Save Draft
      </button>
      <button type="submit" class="ne-btn ne-btn--primary" :disabled="loading">
        <svg v-if="loading" viewBox="0 0 24 24" width="16" height="16" class="ne-spin" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="60" stroke-dashoffset="30"/></svg>
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
export interface NewsEditorValue {
  postType: string
  title: string
  excerpt: string
  bodyMarkdown: string
  coverImage: string | null
  tags: string[]
  appId: string | null
}

const props = defineProps<{
  modelValue: NewsEditorValue
  loading?: boolean
  submitLabel?: string
  apps?: { id: string; name: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: NewsEditorValue]
  'submit': []
  'save-draft': []
}>()

function update(field: keyof NewsEditorValue, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function updateTags(raw: string) {
  const tags = raw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 8)
  emit('update:modelValue', { ...props.modelValue, tags })
}
</script>

<style scoped>
.news-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.ne-field { display: flex; flex-direction: column; gap: 6px; }
.ne-label { font-size: 13px; font-weight: 600; color: var(--mm-silver); }
.ne-required { color: #e5654a; }
.ne-hint { font-size: 11px; color: var(--mm-slate); }

.ne-input,
.ne-select,
.ne-textarea {
  background: var(--mm-s2);
  border: 1px solid var(--b1);
  border-radius: var(--r-md);
  color: var(--mm-pearl);
  font-size: 14px;
  padding: 10px 14px;
  transition: border-color var(--transition-fast);
  font-family: inherit;
}
.ne-input:focus,
.ne-select:focus,
.ne-textarea:focus {
  outline: none;
  border-color: var(--mm-blue);
}
.ne-input::placeholder,
.ne-textarea::placeholder { color: var(--mm-slate); }

.ne-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6' fill='none' stroke='%2368788F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}

.ne-textarea { resize: vertical; }
.ne-textarea--short { min-height: 72px; }
.ne-textarea--tall  { min-height: 240px; }

.ne-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}
.ne-btn {
  padding: 10px 22px;
  border-radius: var(--r-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity var(--transition-fast), background var(--transition-fast);
}
.ne-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ne-btn--primary { background: var(--mm-gold); color: #07090F; }
.ne-btn--primary:hover:not(:disabled) { background: var(--mm-goldl); }
.ne-btn--ghost { background: transparent; border: 1px solid var(--b1); color: var(--mm-silver); }
.ne-btn--ghost:hover:not(:disabled) { border-color: var(--b2); color: var(--mm-pearl); }

@keyframes spin { to { transform: rotate(360deg); } }
.ne-spin { animation: spin 0.8s linear infinite; }
</style>
