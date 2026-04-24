<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Settings</h1>
        <p class="bw-head__sub">AI feature toggles and moderation thresholds.</p>
      </div>
    </header>

    <section class="bw-card bw-section">
      <h2 class="bw-card__title">AI feature flags</h2>
      <div class="flag-grid">
        <label v-for="f in flags" :key="f.key" class="flag-row">
          <div>
            <div style="font-weight: 600;">{{ f.label }}</div>
            <div style="font-size: 0.82rem; color: var(--aw-text-muted);">{{ f.description }}</div>
          </div>
          <input type="checkbox" v-model="f.enabled" class="bw-switch" />
        </label>
      </div>
    </section>

    <section class="bw-card bw-section">
      <h2 class="bw-card__title">AI confidence thresholds</h2>
      <div class="thr">
        <label>
          <div class="thr-label"><span>Auto-action threshold</span><strong>{{ autoThreshold }}%</strong></div>
          <input type="range" min="70" max="99" v-model.number="autoThreshold" />
          <div class="thr-hint">AI will auto-remove content above this confidence. Below it, items go to human review.</div>
        </label>
        <label>
          <div class="thr-label"><span>Trust score floor for auto-suspend</span><strong>{{ trustFloor }}</strong></div>
          <input type="range" min="0" max="40" v-model.number="trustFloor" />
          <div class="thr-hint">Accounts below this trust score get auto-suspended pending review.</div>
        </label>
      </div>
    </section>

    <section class="bw-card bw-section">
      <h2 class="bw-card__title">Platform</h2>
      <div class="form-grid">
        <label><span>Platform fee (%)</span><input class="bw-input" type="number" value="23" /></label>
        <label><span>Minimum payout</span><input class="bw-input" type="number" value="100" /></label>
        <label><span>Dispute response SLA (days)</span><input class="bw-input" type="number" value="5" /></label>
        <label><span>Refund window (days)</span><input class="bw-input" type="number" value="30" /></label>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 8px;">
        <button class="bw-btn bw-btn--primary">Save changes</button>
        <button class="bw-btn bw-btn--ghost">Cancel</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
const flags = reactive([
  { key: 'ai-moderation', label: 'AI auto-moderation', description: 'Auto-remove spam and abusive content above confidence threshold.', enabled: true },
  { key: 'ai-triage', label: 'AI review triage', description: 'Score and pre-screen pending listings before human review.', enabled: true },
  { key: 'ai-fraud', label: 'AI fraud detection', description: 'Anomaly scanning on signups, reviews, and payments.', enabled: true },
  { key: 'ai-trust', label: 'AI trust scoring', description: 'Generate per-user trust scores from behaviour signals.', enabled: true },
  { key: 'ai-copilot', label: 'Vendor AI copilot', description: 'Expose the AI copilot inside vendor dashboards.', enabled: true },
  { key: 'ai-buyer-match', label: 'Buyer AI matching', description: 'Personalised app recommendations for buyers.', enabled: true }
])
const autoThreshold = ref(90)
const trustFloor = ref(25)
</script>

<style scoped>
.flag-grid { display: flex; flex-direction: column; }
.flag-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--aw-border); cursor: pointer; }
.flag-row:last-child { border-bottom: none; }

.bw-switch { width: 40px; height: 22px; appearance: none; background: #d1d5db; border-radius: 999px; position: relative; cursor: pointer; transition: background 0.2s; }
.bw-switch:checked { background: var(--aw-accent); }
.bw-switch::before { content: ''; position: absolute; width: 16px; height: 16px; background: white; border-radius: 50%; top: 3px; left: 3px; transition: transform 0.2s; }
.bw-switch:checked::before { transform: translateX(18px); }

.thr { display: flex; flex-direction: column; gap: 18px; }
.thr label { display: block; }
.thr-label { display: flex; justify-content: space-between; margin-bottom: 6px; font-weight: 600; }
.thr input[type=range] { width: 100%; }
.thr-hint { font-size: 0.82rem; color: var(--aw-text-muted); margin-top: 4px; }

.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.form-grid label { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; font-weight: 500; }
</style>
