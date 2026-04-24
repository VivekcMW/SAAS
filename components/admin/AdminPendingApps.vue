<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Pending apps</h1>
        <p class="bw-head__sub">AI-scored review queue. Approve, reject, or defer with one click.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--subtle" @click="autoApproveSafe">
          <span class="aw-ai-chip">AI</span>
          Auto-approve low-risk ({{ lowRiskCount }})
        </button>
      </div>
    </header>

    <div class="aw-queue">
      <!-- Queue list -->
      <div class="aw-queue__list">
        <div
          v-for="a in pendingList"
          :key="a.id"
          class="aw-queue__item"
          :class="{ 'is-active': active?.id === a.id }"
          @click="activeId = a.id"
        >
          <div style="display: flex; gap: 10px; align-items: center;">
            <div class="q-logo" :style="{ background: a.color }">{{ a.logo }}</div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; font-size: 0.88rem;">{{ a.name }}</div>
              <div style="font-size: 0.76rem; color: var(--aw-text-subtle);">{{ a.vendorName }} · {{ a.submittedAt }}</div>
            </div>
            <span class="aw-risk" :class="riskBand(a.aiRiskScore)">{{ a.aiRiskScore }}</span>
          </div>
        </div>
        <div v-if="pendingList.length === 0" style="padding: 40px 16px; text-align: center; color: var(--aw-text-muted);">Queue is clear.</div>
      </div>

      <!-- Detail -->
      <div v-if="active" class="aw-queue__main">
        <div class="detail-head">
          <div class="q-logo" :style="{ background: active.color, width: 48, height: 48 }">{{ active.logo }}</div>
          <div style="flex: 1;">
            <h2 style="font-family: 'Poppins'; margin: 0;">{{ active.name }}</h2>
            <div style="color: var(--aw-text-muted); font-size: 0.88rem;">{{ active.vendorName }} · {{ active.vendorEmail }} · {{ active.category }}</div>
          </div>
        </div>

        <p style="margin: 14px 0; line-height: 1.55; color: var(--aw-text);">{{ active.description }}</p>

        <!-- AI assessment -->
        <div class="aw-ai-card" style="margin-bottom: 16px;">
          <div class="aw-ai-card__title">
            <span class="aw-ai-chip">AI</span>
            Risk assessment
          </div>
          <div class="risk-row">
            <div class="risk-col">
              <div class="risk-col__label">Risk score</div>
              <div class="aw-risk-bar" style="margin-bottom: 6px;">
                <div class="aw-risk-bar__fill" :class="riskBarFill(active.aiRiskScore)" :style="{ width: active.aiRiskScore + '%' }" />
              </div>
              <strong>{{ active.aiRiskScore }}/100</strong>
            </div>
            <div class="risk-col">
              <div class="risk-col__label">Recommendation</div>
              <span class="aw-risk" :class="recBand(active.aiRecommendation)">{{ active.aiRecommendation }}</span>
            </div>
            <div class="risk-col">
              <div class="risk-col__label">Confidence</div>
              <div class="aw-conf">
                <div class="aw-conf__bar"><div class="aw-conf__fill" :style="{ width: active.aiConfidence + '%' }" /></div>
                <strong>{{ active.aiConfidence }}%</strong>
              </div>
            </div>
          </div>
          <p style="margin: 12px 0 0; font-size: 0.88rem; line-height: 1.55;">{{ active.aiSummary }}</p>
          <div v-if="active.aiFlags.length" style="margin-top: 12px;">
            <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--aw-text-subtle); font-weight: 700; margin-bottom: 6px;">Flags</div>
            <ul class="flag-list">
              <li v-for="(f, i) in active.aiFlags" :key="i">{{ f }}</li>
            </ul>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-actions">
          <button class="bw-btn bw-btn--primary" @click="decide(active.id, 'approved')">Approve listing</button>
          <button class="bw-btn bw-btn--subtle" @click="decide(active.id, 'rejected')">Reject</button>
          <button class="bw-btn bw-btn--ghost">Request changes</button>
        </div>
      </div>
      <div v-else class="aw-queue__main" style="text-align: center; padding: 60px; color: var(--aw-text-muted);">
        Select an app from the queue to review.
      </div>
    </div>

    <div v-if="toast" class="bw-toast-fixed">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { pendingApps, decideApp } = useAdminData()

const activeId = ref<string | null>(pendingApps.value.find(a => a.status === 'pending')?.id || null)
const toast = ref('')

const pendingList = computed(() => pendingApps.value.filter(a => a.status === 'pending'))
const active = computed(() => pendingApps.value.find(a => a.id === activeId.value) || null)
const lowRiskCount = computed(() => pendingList.value.filter(a => a.aiRecommendation === 'approve' && a.aiRiskScore < 30).length)

function riskBand(n: number) { return n < 30 ? 'aw-risk--low' : n < 60 ? 'aw-risk--med' : 'aw-risk--high' }
function riskBarFill(n: number) { return n < 30 ? 'aw-risk-bar__fill--low' : n < 60 ? 'aw-risk-bar__fill--med' : 'aw-risk-bar__fill--high' }
function recBand(r: string) { return r === 'approve' ? 'aw-risk--low' : r === 'reject' ? 'aw-risk--high' : 'aw-risk--med' }

function decide(id: string, d: 'approved' | 'rejected') {
  decideApp(id, d)
  toast.value = d === 'approved' ? 'Listing approved' : 'Listing rejected'
  setTimeout(() => toast.value = '', 1800)
  const next = pendingList.value[0]
  activeId.value = next?.id || null
}

function autoApproveSafe() {
  const safe = pendingList.value.filter(a => a.aiRecommendation === 'approve' && a.aiRiskScore < 30)
  safe.forEach(a => decideApp(a.id, 'approved'))
  toast.value = `AI auto-approved ${safe.length} low-risk listing(s)`
  setTimeout(() => toast.value = '', 2400)
  activeId.value = pendingList.value[0]?.id || null
}
</script>

<style scoped>
.q-logo { width: 32px; height: 32px; border-radius: 8px; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; }

.detail-head { display: flex; align-items: center; gap: 14px; }

.risk-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.risk-col__label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--aw-text-subtle); font-weight: 700; margin-bottom: 6px; }

.flag-list { margin: 0; padding-left: 20px; font-size: 0.85rem; color: var(--aw-text); }
.flag-list li { margin-bottom: 4px; }

.detail-actions { display: flex; gap: 8px; padding-top: 16px; border-top: 1px solid var(--aw-border); }

.bw-toast-fixed { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #111827; color: white; padding: 10px 16px; border-radius: 10px; font-size: 0.88rem; z-index: 1000; }
</style>
