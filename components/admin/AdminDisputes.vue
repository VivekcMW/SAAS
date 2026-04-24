<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Disputes</h1>
        <p class="bw-head__sub">{{ openCount }} open · AI resolutions suggested for each.</p>
      </div>
    </header>

    <div class="disputes">
      <article v-for="d in disputes" :key="d.id" class="bw-card dispute">
        <div class="dispute-head">
          <div>
            <div style="font-weight: 700; font-size: 1rem;">{{ d.subject }}</div>
            <div style="font-size: 0.82rem; color: var(--aw-text-subtle); margin-top: 2px;">
              {{ d.buyerName }} → {{ d.vendorName }} · opened {{ d.openedAt }}
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
            <span class="bw-chip" :class="statusChip(d.status)">{{ d.status }}</span>
            <strong v-if="d.amount" style="font-family: 'Poppins';">${{ d.amount }}</strong>
          </div>
        </div>

        <p style="margin: 10px 0; font-size: 0.9rem; line-height: 1.55; color: var(--aw-text);">{{ d.description }}</p>

        <div class="aw-ai-card" style="padding: 12px;">
          <div class="aw-ai-card__title" style="margin-bottom: 6px;">
            <span class="aw-ai-chip">AI</span>
            Recommendation
          </div>
          <p style="margin: 0; font-size: 0.85rem;"><strong>{{ d.aiRecommendedResolution }}.</strong> {{ d.aiSummary }}</p>
        </div>

        <div v-if="d.status !== 'resolved'" style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="bw-btn bw-btn--primary" @click="resolveDispute(d.id)">Accept AI resolution</button>
          <button class="bw-btn bw-btn--ghost">Mediate manually</button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { disputes, resolveDispute } = useAdminData()
const openCount = computed(() => disputes.value.filter(d => d.status !== 'resolved').length)

function statusChip(s: string) {
  if (s === 'resolved') return 'bw-chip--success'
  if (s === 'mediating') return 'bw-chip--warning'
  return 'bw-chip--danger'
}
</script>

<style scoped>
.disputes { display: flex; flex-direction: column; gap: 14px; }
.dispute-head { display: flex; justify-content: space-between; gap: 12px; }
</style>
