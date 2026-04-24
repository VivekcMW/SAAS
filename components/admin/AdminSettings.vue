<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Settings</h1>
        <p class="bw-head__sub">Platform-wide policy and pricing.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--primary" @click="save">Save changes</button>
      </div>
    </header>

    <div class="bw-grid bw-grid--2">
      <section class="bw-card">
        <h2 class="bw-card__title" style="margin-bottom: 14px;">Pricing</h2>
        <label class="st-row">
          <span>Platform fee (%)</span>
          <input v-model.number="settings.platformFee" type="number" min="0" max="50" class="bw-input" style="width: 120px;" />
        </label>
        <label class="st-row">
          <span>Minimum payout ($)</span>
          <input v-model.number="settings.minPayout" type="number" min="0" class="bw-input" style="width: 120px;" />
        </label>
      </section>

      <section class="bw-card">
        <h2 class="bw-card__title" style="margin-bottom: 14px;">Policies</h2>
        <label class="st-row">
          <span>Dispute SLA (days)</span>
          <input v-model.number="settings.disputeSla" type="number" min="1" class="bw-input" style="width: 120px;" />
        </label>
        <label class="st-row">
          <span>Refund window (days)</span>
          <input v-model.number="settings.refundWindow" type="number" min="0" class="bw-input" style="width: 120px;" />
        </label>
      </section>

      <section class="bw-card">
        <h2 class="bw-card__title" style="margin-bottom: 14px;">Marketplace</h2>
        <label class="st-row st-row--check">
          <input v-model="settings.requireApproval" type="checkbox" />
          <span>Require admin approval for new apps</span>
        </label>
        <label class="st-row st-row--check">
          <input v-model="settings.allowSelfSignupVendor" type="checkbox" />
          <span>Allow vendor self-signup</span>
        </label>
        <label class="st-row st-row--check">
          <input v-model="settings.publicReviews" type="checkbox" />
          <span>Public reviews</span>
        </label>
      </section>
    </div>

    <p v-if="saved" style="margin-top: 16px; color: var(--aw-accent); font-size: 0.88rem;">Settings saved.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const settings = ref({
  platformFee: 23,
  minPayout: 50,
  disputeSla: 7,
  refundWindow: 30,
  requireApproval: true,
  allowSelfSignupVendor: true,
  publicReviews: true
})

const saved = ref(false)
function save() {
  saved.value = true
  setTimeout(() => { saved.value = false }, 1800)
}
</script>

<style scoped>
.st-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--aw-border); font-size: 0.92rem; }
.st-row:last-child { border-bottom: none; }
.st-row--check { justify-content: flex-start; gap: 10px; }
</style>
