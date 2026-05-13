<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Similar vendors</h1>
        <p class="bw-head__sub">How your listings compare to the closest alternatives.</p>
      </div>
    </header>

    <p v-if="similarVendorsLoading" style="padding:24px;color:var(--vw-text-subtle)">Loading competitors…</p>
    <p v-else-if="similarVendors.length === 0" style="padding:24px;color:var(--vw-text-subtle)">No competitor data yet — publish a listing to see comparisons.</p>
    <div v-else class="bw-card">
      <table class="bw-table sv-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Category</th>
            <th>Rating</th>
            <th>Your rank</th>
            <th>Gap</th>
            <th>Audience overlap</th>
            <th/>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in similarVendors" :key="c.id">
            <td>
              <div class="sv-vendor">
                <div class="sv-logo" :style="{ background: c.color }">{{ c.logo }}</div>
                <div>
                  <div class="sv-name">{{ c.name }}</div>
                  <div class="sv-meta">from ${{ c.priceFrom }}/mo</div>
                </div>
              </div>
            </td>
            <td>{{ c.category }}</td>
            <td><span class="sv-stars">★ {{ c.rating }}</span></td>
            <td><span class="bw-chip" :class="rankChip(c.yourRank)">{{ c.yourRank }}</span></td>
            <td>{{ c.gap }}</td>
            <td>
              <div class="sv-overlap">
                <div class="sv-overlap__bar">
                  <div class="sv-overlap__fill" :style="{ width: c.overlap + '%' }" />
                </div>
                <span>{{ c.overlap }}%</span>
              </div>
            </td>
            <td/>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="vw-ai-card" style="margin-top: 20px;">
      <div class="vw-ai-card__title">
        <span class="vw-ai-chip">AI</span>
        Positioning insight
      </div>
      <p style="margin: 0 0 10px; font-size: 0.9rem; line-height: 1.55;">
        You rank <strong>above HubSpot</strong> on price but <strong>below</strong> on integrations. Adding 3 key integrations (Salesforce, Zapier, Slack) would close 60% of the enterprise gap and likely lift enquiry rate by 18–22%.
      </p>
      <NuxtLink to="/dashboard/content-assistant" class="bw-btn bw-btn--primary bw-btn--sm">Draft integration page with AI</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
const { similarVendors, similarVendorsLoading, loadSimilarVendors } = useVendorData()

onMounted(loadSimilarVendors)

function rankChip(r: string) {
  if (r === 'above') return 'bw-chip--success'
  if (r === 'tied') return 'bw-chip--neutral'
  return 'bw-chip--warning'
}
</script>

<style scoped>
.sv-vendor { display: flex; gap: 10px; align-items: center; }
.sv-logo { width: 32px; height: 32px; border-radius: 8px; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.sv-name { font-weight: 600; }
.sv-meta { font-size: 0.76rem; color: var(--vw-text-subtle); }
.sv-stars { color: #f59e0b; font-weight: 600; }
.sv-overlap { display: flex; align-items: center; gap: 8px; }
.sv-overlap__bar { flex: 1; height: 6px; background: var(--vw-surface-2); border-radius: 3px; overflow: hidden; min-width: 80px; }
.sv-overlap__fill { height: 100%; background: var(--vw-primary); }
</style>
