<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Flagged content</h1>
        <p class="bw-head__sub">{{ openFlags.length }} open · AI has already auto-actioned {{ autoCount }}.</p>
      </div>
    </header>

    <div class="aw-ai-card" style="margin-bottom: 16px;">
      <div class="aw-ai-card__title">
        <span class="aw-ai-chip">AI</span>
        Content classifier
      </div>
      <p style="margin: 0 0 10px; font-size: 0.88rem; color: var(--aw-text);">Paste any text to classify for spam, abuse, or fake claims.</p>
      <textarea v-model="testText" class="bw-textarea" rows="3" placeholder="Paste a review, comment, or listing text…" />
      <div style="display: flex; gap: 10px; margin-top: 10px; align-items: center;">
        <button class="bw-btn bw-btn--primary" :disabled="classifying || !testText.trim()" @click="runClassify">{{ classifying ? 'Classifying…' : 'Classify' }}</button>
        <span v-if="result" class="aw-risk" :class="catBand(result.category)">{{ result.category }} · {{ result.confidence }}%</span>
      </div>
    </div>

    <div class="bw-card">
      <table class="bw-table">
        <thead>
          <tr>
            <th>Content</th>
            <th>Type</th>
            <th>Reason</th>
            <th>AI</th>
            <th>Confidence</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in flags" :key="f.id">
            <td style="max-width: 320px;">
              <div style="font-size: 0.88rem; line-height: 1.4;">{{ f.content }}</div>
              <div style="font-size: 0.75rem; color: var(--aw-text-subtle); margin-top: 4px;">by {{ f.author }}</div>
            </td>
            <td><span class="bw-chip">{{ f.type }}</span></td>
            <td style="font-size: 0.85rem;">{{ f.reason }}</td>
            <td>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span class="aw-risk" :class="catBand(f.aiCategory)">{{ f.aiCategory }}</span>
                <span style="font-size: 0.7rem; color: var(--aw-text-subtle);">{{ f.aiAction.replace('-', ' ') }}</span>
              </div>
            </td>
            <td>
              <div class="aw-conf">
                <div class="aw-conf__bar"><div class="aw-conf__fill" :style="{ width: f.aiConfidence + '%' }" /></div>
                <strong style="font-size: 0.8rem;">{{ f.aiConfidence }}%</strong>
              </div>
            </td>
            <td style="text-align: right; white-space: nowrap;">
              <template v-if="f.status === 'open'">
                <button class="bw-btn bw-btn--primary bw-btn--sm" @click="resolveFlag(f.id, 'actioned')">Remove</button>
                <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="resolveFlag(f.id, 'dismissed')">Keep</button>
              </template>
              <span v-else class="bw-chip" :class="f.status === 'actioned' ? 'bw-chip--success' : 'bw-chip--muted'">{{ f.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { flags, resolveFlag } = useAdminData()
const ai = useAdminAI()

const openFlags = computed(() => flags.value.filter(f => f.status === 'open'))
const autoCount = computed(() => flags.value.filter(f => f.aiAction === 'auto-remove').length)

const testText = ref('')
const classifying = ref(false)
const result = ref<{ category: string; confidence: number } | null>(null)

async function runClassify() {
  classifying.value = true
  result.value = null
  result.value = await ai.classifyContent(testText.value)
  classifying.value = false
}

function catBand(c: string) {
  if (c === 'safe') return 'aw-risk--low'
  if (c === 'abuse' || c === 'spam') return 'aw-risk--high'
  return 'aw-risk--med'
}
</script>
