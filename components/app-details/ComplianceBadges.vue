<template>
  <div v-if="badges.length > 0 || loading" class="cb-wrap">
    <div class="cb-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/></svg>
      <span class="cb-title">Compliance & Certifications</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="cb-skel-row">
      <div v-for="i in 4" :key="i" class="cb-skel" />
    </div>

    <!-- Badges by region -->
    <template v-else>
      <div v-for="(groupBadges, region) in grouped" :key="region" class="cb-region">
        <span class="cb-region-label">{{ regionLabel(region) }}</span>
        <div class="cb-badges">
          <div v-for="badge in groupBadges" :key="badge.id" class="cb-badge" :class="`cb-badge--${badge.status}`" :title="badgeTitle(badge)">
            <span class="cb-badge__icon">{{ badgeIcon(badge.badge_type) }}</span>
            <span class="cb-badge__name">{{ badgeName(badge.badge_type) }}</span>
            <span class="cb-badge__status-dot" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ appId: string }>()

interface Badge {
  id: string
  badge_type: string
  region: string
  status: string
  verified_at: string | null
  source_url: string | null
}

interface ComplianceData {
  appId: string
  badges: Badge[]
  grouped: Record<string, Badge[]>
  score: number | null
  total: number
}

const loading = ref(true)
const badges = ref<Badge[]>([])
const grouped = ref<Record<string, Badge[]>>({})

async function load() {
  try {
    const data = await $fetch<ComplianceData>(`/api/compliance/${props.appId}`)
    badges.value = data.badges
    grouped.value = data.grouped
  } catch {
    // Fail silently — no badges yet
  } finally {
    loading.value = false
  }
}

const BADGE_NAMES: Record<string, string> = {
  gdpr: 'GDPR', dpiit: 'DPIIT', mas: 'MAS', soc2: 'SOC 2',
  iso27001: 'ISO 27001', hipaa: 'HIPAA', ccpa: 'CCPA', pdpa: 'PDPA'
}
const BADGE_ICONS: Record<string, string> = {
  gdpr: '🇪🇺', dpiit: '🇮🇳', mas: '🇸🇬', soc2: '🔒',
  iso27001: '🏅', hipaa: '🏥', ccpa: '🇺🇸', pdpa: '🇹🇭'
}
const REGION_LABELS: Record<string, string> = {
  global: 'Global', eu: 'Europe', india: 'India', singapore: 'Singapore',
  us: 'United States', uk: 'United Kingdom', apac: 'Asia Pacific'
}

function badgeName(type: string) { return BADGE_NAMES[type] ?? type.toUpperCase() }
function badgeIcon(type: string) { return BADGE_ICONS[type] ?? '✓' }
function regionLabel(region: string) { return REGION_LABELS[region] ?? region }
function badgeTitle(badge: Badge) {
  const lines = [`${badgeName(badge.badge_type)} — ${badge.status}`]
  if (badge.verified_at) lines.push(`Verified: ${new Date(badge.verified_at).toLocaleDateString()}`)
  return lines.join('\n')
}

onMounted(load)
</script>

<style scoped>
.cb-wrap {
  margin-top: 20px;
  padding: 14px 16px;
  background: var(--mm-s2, #161B2E);
  border: 0.5px solid var(--b1, rgba(255,255,255,0.06));
  border-radius: 12px;
}
.cb-header {
  display: flex; align-items: center; gap: 7px;
  margin-bottom: 12px; color: rgba(255,255,255,0.5);
}
.cb-title { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

.cb-region { margin-bottom: 10px; }
.cb-region:last-child { margin-bottom: 0; }
.cb-region-label { font-size: 0.73rem; color: rgba(255,255,255,0.35); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 6px; }
.cb-badges { display: flex; flex-wrap: wrap; gap: 6px; }

.cb-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
  border: 0.5px solid transparent; transition: opacity .15s;
}
.cb-badge--verified {
  background: rgba(42,157,143,0.1); border-color: rgba(42,157,143,0.3); color: var(--mm-sea, #2A9D8F);
}
.cb-badge--pending {
  background: rgba(212,168,67,0.08); border-color: rgba(212,168,67,0.25); color: var(--mm-gold, #D4A843);
}
.cb-badge--expired {
  background: rgba(248,113,113,0.07); border-color: rgba(248,113,113,0.2); color: #f87171;
}
.cb-badge--not_applicable {
  background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); color: rgba(255,255,255,0.3);
}
.cb-badge__icon { font-size: 0.8rem; }
.cb-badge__status-dot {
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
}
.cb-badge--verified .cb-badge__status-dot { background: var(--mm-sea, #2A9D8F); }
.cb-badge--pending .cb-badge__status-dot { background: var(--mm-gold, #D4A843); }
.cb-badge--expired .cb-badge__status-dot { background: #f87171; }
.cb-badge--not_applicable .cb-badge__status-dot { background: rgba(255,255,255,0.2); }

.cb-skel-row { display: flex; gap: 8px; flex-wrap: wrap; }
.cb-skel { height: 28px; width: 90px; border-radius: 20px; background: rgba(255,255,255,0.05); animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0%,100%{opacity:.4}50%{opacity:.8} }
</style>
