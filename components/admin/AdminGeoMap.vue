<template>
  <div class="geomap-wrap">
    <!-- Header + controls -->
    <div class="geomap-header">
      <div class="geomap-header__left">
        <h2>User Geo Map</h2>
        <p>Login &amp; visit origins in the last {{ selectedDays }} days</p>
      </div>
      <div class="geomap-header__right">
        <div class="day-filter">
          <button
            v-for="d in [7, 30, 90]"
            :key="d"
            class="day-btn"
            :class="{ 'day-btn--active': selectedDays === d }"
            @click="selectedDays = d; loadData()"
          >{{ d }}d</button>
        </div>
        <button class="refresh-btn" :disabled="loading" @click="loadData()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spin: loading }">
            <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Summary stat cards -->
    <div v-if="stats" class="stat-cards">
      <div class="stat-card">
        <span class="stat-card__val">{{ stats.total_events ?? 0 }}</span>
        <span class="stat-card__label">Total events</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__val">{{ stats.total_logins ?? 0 }}</span>
        <span class="stat-card__label">Logins</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__val">{{ stats.unique_users ?? 0 }}</span>
        <span class="stat-card__label">Unique users</span>
      </div>
      <div class="stat-card stat-card--gold">
        <span class="stat-card__val">{{ stats.unique_countries ?? 0 }}</span>
        <span class="stat-card__label">Countries</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__val">{{ stats.events_today ?? 0 }}</span>
        <span class="stat-card__label">Today</span>
      </div>
    </div>

    <!-- Map -->
    <div class="map-container">
      <div v-if="loading" class="map-loading">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
        </svg>
        Loading map data…
      </div>
      <div v-if="error" class="map-error">{{ error }}</div>
      <div ref="mapEl" class="leaflet-map" />
    </div>

    <!-- Bottom split: country table + recent feed -->
    <div class="bottom-grid">
      <!-- Country ranking table -->
      <div class="country-table-wrap">
        <h3>Top Countries</h3>
        <table v-if="byCountry.length" class="country-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Events</th>
              <th>Logins</th>
              <th>Users</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in byCountry.slice(0, 10)"
              :key="row.country_code"
              class="country-row"
              :class="{ 'country-row--highlight': hoveredCountry === row.country_code }"
              @mouseenter="hoveredCountry = row.country_code"
              @mouseleave="hoveredCountry = null"
            >
              <td>
                <span class="rank">{{ i + 1 }}</span>
                <img
                  :src="`https://flagcdn.com/24x18/${row.country_code.toLowerCase()}.png`"
                  :alt="row.country_name"
                  class="flag"
                  loading="lazy"
                  width="24"
                  height="18"
                >
                {{ row.country_name || row.country_code }}
              </td>
              <td>{{ row.total_events }}</td>
              <td>{{ row.logins }}</td>
              <td>{{ row.unique_users }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-hint">No data yet. Events are recorded on each login.</p>
      </div>

      <!-- Recent activity feed -->
      <div class="activity-feed">
        <h3>Recent Activity</h3>
        <ul v-if="recent.length" class="feed-list">
          <li v-for="ev in recent.slice(0, 20)" :key="ev.id" class="feed-item">
            <img
              :src="`https://flagcdn.com/24x18/${ev.country_code.toLowerCase()}.png`"
              :alt="ev.country_name"
              class="flag"
              loading="lazy"
              width="24"
              height="18"
            >
            <div class="feed-info">
              <span class="feed-name">{{ ev.user_name || ev.user_email || 'Anonymous' }}</span>
              <span class="feed-loc">{{ ev.city ? ev.city + ', ' : '' }}{{ ev.country_name }}</span>
            </div>
            <div class="feed-right">
              <span class="feed-type" :class="`feed-type--${ev.event_type}`">{{ formatEventType(ev.event_type) }}</span>
              <span class="feed-time">{{ timeAgo(ev.created_at) }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="empty-hint">No recent activity.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { Map as LeafletMap, CircleMarker } from 'leaflet'

interface CountryRow {
  country_code: string
  country_name: string
  lat: number
  lon: number
  total_events: number
  logins: number
  unique_users: number
}

interface RecentEvent {
  id: string
  country_code: string
  country_name: string
  city: string
  event_type: string
  created_at: string
  user_email: string | null
  user_name: string | null
}

interface Totals {
  total_events: number
  total_logins: number
  unique_users: number
  unique_countries: number
  events_today: number
}

const mapEl = ref<HTMLElement | null>(null)
const loading = ref(false)
const error = ref('')
const selectedDays = ref(30)
const byCountry = ref<CountryRow[]>([])
const recent = ref<RecentEvent[]>([])
const stats = ref<Totals | null>(null)
const hoveredCountry = ref<string | null>(null)

let leafletMap: LeafletMap | null = null
let markers: CircleMarker[] = []

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<{ byCountry: CountryRow[]; recent: RecentEvent[]; totals: Totals }>(`/api/admin/geo-stats?days=${selectedDays.value}`)
    byCountry.value = data.byCountry ?? []
    recent.value = data.recent ?? []
    stats.value = data.totals ?? null
    renderMarkers()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Failed to load geo data.'
  } finally {
    loading.value = false
  }
}

function renderMarkers() {
  if (!leafletMap) return
  // Clear existing markers
  for (const m of markers) m.remove()
  markers = []

  if (!byCountry.value.length) return

  const maxEvents = Math.max(...byCountry.value.map((c) => c.total_events), 1)
  const L = (globalThis as any).L

  for (const country of byCountry.value) {
    if (!country.lat && !country.lon) continue
    const radius = 6 + Math.sqrt(country.total_events / maxEvents) * 22

    const marker = L.circleMarker([country.lat, country.lon], {
      radius,
      fillColor: '#FFC850',
      fillOpacity: 0.7,
      color: '#FFC850',
      weight: 1,
      opacity: 0.9,
    })

    marker.bindPopup(`
      <div style="font-family:sans-serif;min-width:160px">
        <strong style="font-size:0.9rem">${country.country_name || country.country_code}</strong><br>
        <table style="margin-top:6px;font-size:0.8rem;border-collapse:collapse;width:100%">
          <tr><td style="color:#aaa;padding:2px 8px 2px 0">Events</td><td><strong>${country.total_events}</strong></td></tr>
          <tr><td style="color:#aaa;padding:2px 8px 2px 0">Logins</td><td><strong>${country.logins}</strong></td></tr>
          <tr><td style="color:#aaa;padding:2px 8px 2px 0">Users</td><td><strong>${country.unique_users}</strong></td></tr>
        </table>
      </div>
    `)

    marker.addTo(leafletMap!)
    markers.push(marker)
  }
}

async function initMap() {
  if (!mapEl.value) return

  // Lazy-load Leaflet
  const L = await import('leaflet').catch(() => null)
  if (!L) { error.value = 'Failed to load map library.'; return }

  // Fix Leaflet default icon paths (Vite/Nuxt asset handling)
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })

  // Expose to renderMarkers (called from loadData)
  ;(globalThis as any).L = L

  leafletMap = L.map(mapEl.value, {
    center: [20, 10],
    zoom: 2,
    minZoom: 1,
    maxZoom: 10,
    zoomControl: true,
    scrollWheelZoom: false,
  })

  // CartoDB Dark Matter — free, no token
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(leafletMap)

  await loadData()
}

onMounted(() => { initMap() })
onUnmounted(() => { leafletMap?.remove(); leafletMap = null })

// Highlight hovered country marker
watch(hoveredCountry, (code) => {
  if (!leafletMap) return
  for (let i = 0; i < markers.length; i++) {
    const country = byCountry.value[i]
    if (!country) continue
    const isHovered = country.country_code === code
    markers[i].setStyle({
      fillOpacity: isHovered ? 0.95 : 0.7,
      weight: isHovered ? 2 : 1,
      radius: isHovered
        ? 8 + Math.sqrt(country.total_events / Math.max(...byCountry.value.map((c) => c.total_events), 1)) * 26
        : 6 + Math.sqrt(country.total_events / Math.max(...byCountry.value.map((c) => c.total_events), 1)) * 22,
    })
  }
})

function formatEventType(t: string) {
  const labels: Record<string, string> = {
    login: 'Login',
    oauth_login: 'OAuth',
    magic_link_login: 'Magic Link',
    passkey_login: 'Passkey',
    pageview: 'Visit',
  }
  return labels[t] ?? t
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
</script>

<style scoped>
/* ── Wrap ─────────────────────────────────────────────────────── */
.geomap-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Header ───────────────────────────────────────────────────── */
.geomap-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.geomap-header__left h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
}
.geomap-header__left p { color: rgba(255,255,255,0.45); font-size: 0.875rem; margin: 0; }
.geomap-header__right { display: flex; align-items: center; gap: 8px; }

.day-filter { display: flex; gap: 4px; }
.day-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.55);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}
.day-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
.day-btn--active { background: #FFC850; color: #0A0700; border-color: #FFC850; font-weight: 600; }

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.55);
  font-size: 0.8rem;
  cursor: pointer;
}
.refresh-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; }
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Stat cards ────────────────────────────────────────────────── */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}
.stat-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-card--gold { border-color: rgba(255, 200, 80, 0.25); }
.stat-card__val { font-size: 1.6rem; font-weight: 700; color: #fff; line-height: 1; }
.stat-card--gold .stat-card__val { color: #FFC850; }
.stat-card__label { font-size: 0.75rem; color: rgba(255,255,255,0.4); }

/* ── Map container ────────────────────────────────────────────── */
.map-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  background: #0b0f1a;
}
.leaflet-map { height: 400px; width: 100%; }

.map-loading, .map-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 0.9rem;
  z-index: 1000;
  background: rgba(7, 9, 15, 0.7);
  color: rgba(255,255,255,0.6);
  border-radius: 12px;
}
.map-error { color: #ff7875; }

/* ── Bottom grid ─────────────────────────────────────────────── */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .bottom-grid { grid-template-columns: 1fr; }
}

/* ── Country table ─────────────────────────────────────────────── */
.country-table-wrap h3,
.activity-feed h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px;
}
.country-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.country-table th {
  text-align: left;
  color: rgba(255,255,255,0.4);
  font-weight: 500;
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.country-table td {
  padding: 8px;
  color: rgba(255,255,255,0.8);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  vertical-align: middle;
}
.country-row:hover td { background: rgba(255,200,80,0.05); }
.country-row--highlight td { background: rgba(255,200,80,0.08); }
.rank {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.35);
  margin-right: 6px;
}
.flag {
  display: inline-block;
  border-radius: 2px;
  vertical-align: middle;
  margin-right: 6px;
}

/* ── Activity feed ─────────────────────────────────────────────── */
.feed-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
}
.feed-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.04);
}
.feed-info { flex: 1; min-width: 0; }
.feed-name { display: block; font-size: 0.8rem; color: #fff; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
.feed-loc { display: block; font-size: 0.75rem; color: rgba(255,255,255,0.4); }
.feed-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.feed-time { font-size: 0.7rem; color: rgba(255,255,255,0.3); white-space: nowrap; }

.feed-type {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}
.feed-type--login { background: rgba(82,196,26,0.15); color: #52c41a; }
.feed-type--oauth_login { background: rgba(24,144,255,0.15); color: #1890ff; }
.feed-type--magic_link_login { background: rgba(255,200,80,0.15); color: #FFC850; }
.feed-type--passkey_login { background: rgba(114,46,209,0.15); color: #9254de; }
.feed-type--pageview { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); }

.empty-hint { color: rgba(255,255,255,0.3); font-size: 0.875rem; }

/* ── Spin animation ─────────────────────────────────────────────── */
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
