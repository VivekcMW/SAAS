<template>
  <Teleport to="body">
    <div class="bm-overlay" @click.self="$emit('close')">
      <div class="bm-dialog" role="dialog" aria-modal="true" aria-label="AI Evaluation Brief">
        <header class="bm-header">
          <div class="bm-header__left">
            <span class="bm-ai-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
              AI Brief
            </span>
            <h2 class="bm-title">Evaluation Brief</h2>
          </div>
          <button class="bm-close" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </header>

        <!-- Step 1: Context form -->
        <div v-if="!brief && !loading && !err" class="bm-body">
          <p class="bm-desc">Comparing <strong>{{ appNames.join(' vs ') }}</strong>. Add optional context for a more tailored brief.</p>

          <div class="bm-form">
            <div class="bm-row">
              <div class="bm-field">
                <label class="bm-label">Company name</label>
                <input v-model="ctx.companyName" class="bm-input" placeholder="Acme Corp" />
              </div>
              <div class="bm-field">
                <label class="bm-label">Team size</label>
                <input v-model.number="ctx.teamSize" type="number" min="1" class="bm-input" placeholder="50" />
              </div>
            </div>
            <div class="bm-row">
              <div class="bm-field">
                <label class="bm-label">Monthly budget (USD)</label>
                <input v-model.number="ctx.budget" type="number" min="0" class="bm-input" placeholder="500" />
              </div>
              <div class="bm-field">
                <label class="bm-label">Decision date</label>
                <input v-model="ctx.decisionDate" type="date" class="bm-input" />
              </div>
            </div>
          </div>

          <div class="bm-actions">
            <button class="bm-btn bm-btn--primary" @click="generate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
              Generate brief
            </button>
            <button class="bm-btn bm-btn--ghost" @click="$emit('close')">Cancel</button>
          </div>
        </div>

        <!-- Loading -->
        <div v-else-if="loading" class="bm-body bm-loading">
          <div class="bm-spinner" />
          <p class="bm-loading-text">Generating your evaluation brief with GPT-4o…</p>
          <p class="bm-loading-sub">This takes about 10–15 seconds.</p>
        </div>

        <!-- Error -->
        <div v-else-if="err" class="bm-body">
          <div class="bm-err-block">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>{{ err }}</p>
          </div>
          <div class="bm-actions">
            <button class="bm-btn bm-btn--primary" @click="generate">Try again</button>
            <button class="bm-btn bm-btn--ghost" @click="$emit('close')">Close</button>
          </div>
        </div>

        <!-- Brief output -->
        <div v-else-if="brief" class="bm-body bm-output">
          <div class="bm-share-row">
            <span class="bm-share-label">Share link</span>
            <div class="bm-share-chip">
              <span class="bm-share-url">{{ brief.shareUrl }}</span>
              <button class="bm-copy-btn" @click="copy">
                <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>

          <!-- Rendered markdown -->
          <!-- eslint-disable vue/no-v-html -->
          <div class="bm-markdown" v-html="renderedMd" />

          <div class="bm-foot-actions">
            <button class="bm-btn bm-btn--ghost" @click="generate">Regenerate</button>
            <button class="bm-btn bm-btn--ghost" @click="$emit('close')">Close</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  appIds: string[]
  appNames: string[]
}>()

defineEmits<{ close: [] }>()

interface BriefResponse {
  briefId: string
  shareUrl: string
  title: string
  contentMd: string
  sections: string[]
}

const loading = ref(false)
const err = ref('')
const brief = ref<BriefResponse | null>(null)
const copied = ref(false)

const ctx = ref({
  companyName: '',
  teamSize: null as number | null,
  budget: null as number | null,
  decisionDate: ''
})

async function generate() {
  loading.value = true
  err.value = ''
  brief.value = null
  try {
    brief.value = await $fetch<BriefResponse>('/api/ai/briefing', {
      method: 'POST',
      body: {
        appIds: props.appIds,
        context: {
          companyName: ctx.value.companyName || undefined,
          teamSize: ctx.value.teamSize ?? undefined,
          budget: ctx.value.budget ?? undefined,
          decisionDate: ctx.value.decisionDate || undefined
        }
      }
    })
  } catch (e: unknown) {
    const code = (e as { statusCode?: number })?.statusCode
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    if (code === 402) {
      err.value = 'The AI Briefing Generator requires a Professional plan. Upgrade in Billing to access this feature.'
    } else if (code === 429) {
      err.value = 'Daily briefing limit reached (10/day). Try again tomorrow.'
    } else {
      err.value = msg ?? 'Failed to generate brief. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function copy() {
  if (!brief.value?.shareUrl) return
  navigator.clipboard.writeText(brief.value.shareUrl).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

// Minimal Markdown → HTML renderer (no external dependency)
const renderedMd = computed(() => {
  if (!brief.value?.contentMd) return ''
  return brief.value.contentMd
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
})
</script>

<style scoped>
.bm-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(7, 9, 15, 0.85);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}
.bm-dialog {
  background: var(--mm-s1, #0F1220);
  border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
  border-radius: 16px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.bm-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px 16px;
  border-bottom: 0.5px solid var(--b1, rgba(255,255,255,0.06));
  flex-shrink: 0;
}
.bm-header__left { display: flex; align-items: center; gap: 12px; }
.bm-ai-badge {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(74,128,212,0.15); color: var(--mm-blue, #4A80D4);
  font-size: 0.72rem; font-weight: 700; padding: 3px 9px; border-radius: 20px;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.bm-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
.bm-close {
  background: transparent; border: none; color: rgba(255,255,255,0.4);
  cursor: pointer; padding: 4px; border-radius: 6px; transition: color 0.15s;
}
.bm-close:hover { color: inherit; }

.bm-body { padding: 22px 24px; overflow-y: auto; flex: 1; }
.bm-desc { font-size: 0.88rem; color: rgba(255,255,255,0.55); margin: 0 0 18px; }

.bm-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.bm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.bm-field { display: flex; flex-direction: column; gap: 4px; }
.bm-label { font-size: 0.78rem; color: rgba(255,255,255,0.45); }
.bm-input {
  background: var(--mm-s2, #161B2E);
  border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
  border-radius: 8px; color: inherit;
  font-family: var(--f-ui); font-size: 0.85rem; padding: 8px 11px;
}
.bm-input:focus { outline: none; border-color: var(--mm-blue, #4A80D4); }

.bm-actions { display: flex; gap: 10px; }
.bm-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 9px; font-size: 0.86rem;
  font-family: var(--f-ui); font-weight: 600; cursor: pointer; border: none;
  transition: opacity 0.15s;
}
.bm-btn--primary { background: var(--mm-blue, #4A80D4); color: #fff; }
.bm-btn--primary:hover { opacity: 0.85; }
.bm-btn--ghost {
  background: transparent;
  border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
  color: inherit;
}
.bm-btn--ghost:hover { background: rgba(255,255,255,0.04); }

.bm-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 48px 24px; }
.bm-spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,0.1);
  border-top-color: var(--mm-blue, #4A80D4);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.bm-loading-text { font-size: 0.95rem; font-weight: 600; margin: 0; }
.bm-loading-sub { font-size: 0.82rem; color: rgba(255,255,255,0.4); margin: 0; }

.bm-err-block {
  display: flex; align-items: flex-start; gap: 12px;
  background: rgba(248,113,113,0.08); border: 0.5px solid rgba(248,113,113,0.25);
  border-radius: 10px; padding: 16px; color: #f87171;
  font-size: 0.88rem; line-height: 1.5; margin-bottom: 18px;
}
.bm-err-block svg { flex-shrink: 0; margin-top: 2px; }
.bm-err-block p { margin: 0; }

.bm-share-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.bm-share-label { font-size: 0.78rem; color: rgba(255,255,255,0.45); white-space: nowrap; }
.bm-share-chip {
  display: flex; align-items: center; gap: 0;
  background: var(--mm-s2, #161B2E);
  border: 0.5px solid var(--b2, rgba(255,255,255,0.08));
  border-radius: 8px; overflow: hidden; flex: 1; min-width: 0;
}
.bm-share-url {
  font-family: monospace; font-size: 0.78rem; color: rgba(255,255,255,0.5);
  padding: 6px 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
}
.bm-copy-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; background: rgba(255,255,255,0.06); border: none;
  border-left: 0.5px solid var(--b2, rgba(255,255,255,0.08));
  color: inherit; font-size: 0.78rem; cursor: pointer; white-space: nowrap;
  transition: background 0.15s;
}
.bm-copy-btn:hover { background: rgba(255,255,255,0.1); }

.bm-markdown {
  font-size: 0.9rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.8);
}
.bm-markdown :deep(h1) { font-size: 1.25rem; font-weight: 700; margin: 0 0 12px; }
.bm-markdown :deep(h2) { font-size: 1.05rem; font-weight: 700; margin: 20px 0 8px; color: rgba(255,255,255,0.9); }
.bm-markdown :deep(h3) { font-size: 0.95rem; font-weight: 700; margin: 14px 0 6px; color: rgba(255,255,255,0.75); }
.bm-markdown :deep(p) { margin: 0 0 10px; }
.bm-markdown :deep(ul) { padding-left: 18px; margin: 6px 0 10px; }
.bm-markdown :deep(li) { margin: 4px 0; }
.bm-markdown :deep(strong) { color: #fff; }
.bm-markdown :deep(table) { width: 100%; border-collapse: collapse; font-size: 0.84rem; margin: 12px 0; }
.bm-markdown :deep(th) { text-align: left; padding: 6px 10px; background: var(--mm-s2); border-bottom: 0.5px solid rgba(255,255,255,0.1); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(255,255,255,0.45); }
.bm-markdown :deep(td) { padding: 8px 10px; border-bottom: 0.5px solid rgba(255,255,255,0.05); }

.bm-foot-actions { display: flex; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 0.5px solid rgba(255,255,255,0.06); }

@media (max-width: 560px) { .bm-row { grid-template-columns: 1fr; } }
</style>
