<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Pending approvals</h1>
        <p class="bw-head__sub">{{ pendingApps.length }} {{ pendingApps.length === 1 ? 'app' : 'apps' }} awaiting review.</p>
      </div>
    </header>

    <div v-if="pendingApps.length === 0" class="bw-empty">
      <p class="bw-empty__title">All caught up.</p>
      <p class="bw-empty__desc">No apps are waiting for approval.</p>
    </div>

    <div v-else class="bw-grid bw-grid--main-aside">
      <!-- List -->
      <section class="bw-card bw-card--compact">
        <ul class="pq-list">
          <li
            v-for="a in pendingApps"
            :key="a.id"
            :class="{ 'pq-item--active': selected?.id === a.id }"
            class="pq-item"
            @click="selectedId = a.id"
          >
            <div class="q-logo" :style="{ background: a.color }">{{ a.logo }}</div>
            <div class="pq-item__body">
              <div class="pq-name">{{ a.name }}</div>
              <div class="pq-meta">{{ a.vendorName }}</div>
              <div class="pq-meta pq-meta--muted">{{ a.submittedAt }}</div>
            </div>
          </li>
        </ul>
      </section>

      <!-- Detail -->
      <section v-if="selected" class="bw-card">
        <div class="pq-detail-head">
          <div class="q-logo q-logo--lg" :style="{ background: selected.color }">{{ selected.logo }}</div>
          <div>
            <h2 class="pq-detail-title">{{ selected.name }}</h2>
            <p class="pq-detail-sub">{{ selected.category }} · submitted {{ selected.submittedAt }}</p>
          </div>
        </div>

        <div class="pq-meta-grid">
          <div>
            <div class="pq-label">Vendor</div>
            <div>{{ selected.vendorName }}</div>
            <div class="pq-vendor-email">{{ selected.vendorEmail }}</div>
          </div>
          <div>
            <div class="pq-label">Category</div>
            <div>{{ selected.category }}</div>
          </div>
        </div>

        <div class="pq-desc">
          <div class="pq-label">Description</div>
          <p class="pq-desc-text">{{ selected.description }}</p>
        </div>

        <div class="pq-actions">
          <button class="bw-btn bw-btn--primary" @click="decide('approved')">Approve</button>
          <button class="bw-btn bw-btn--ghost" @click="decide('rejected')">Reject</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
const { apps, decideApp } = useAdminData()

const pendingApps = computed(() => apps.value.filter(a => a.status === 'pending'))
const selectedId = ref<string | null>(pendingApps.value[0]?.id ?? null)
const selected = computed(() => pendingApps.value.find(a => a.id === selectedId.value))

watch(pendingApps, (list) => {
  if (!list.some(a => a.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null
  }
})

function decide(d: 'approved' | 'rejected') {
  if (selectedId.value) decideApp(selectedId.value, d)
}
</script>

<style scoped>
.pq-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.pq-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; cursor: pointer; transition: background 0.12s; }
.pq-item:hover { background: var(--aw-surface-2); }
.pq-item--active { background: var(--aw-accent-50); }
.pq-item--active .pq-name { color: var(--aw-accent-text); }
.pq-item__body { flex: 1; min-width: 0; }
.q-logo { width: 40px; height: 40px; border-radius: 8px; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
.q-logo--lg { width: 52px; height: 52px; font-size: 1.15rem; }
.pq-name { font-weight: 600; font-size: 0.88rem; }
.pq-meta { font-size: 0.75rem; color: var(--aw-text-muted); }
.pq-meta--muted { font-size: 0.72rem; color: var(--aw-text-subtle); }

.pq-detail-head { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
.pq-detail-title { font-family: var(--f-ui); font-size: 1.15rem; font-weight: 700; margin: 0; }
.pq-detail-sub { font-size: 0.85rem; color: var(--aw-text-muted); margin: 3px 0 0; }

.pq-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.88rem; }
.pq-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--aw-text-subtle); font-weight: 600; margin-bottom: 4px; }
.pq-vendor-email { font-size: 0.75rem; color: var(--aw-text-subtle); }

.pq-desc { margin-top: 16px; }
.pq-desc-text { font-size: 0.88rem; line-height: 1.6; margin: 6px 0 0; }
.pq-actions { display: flex; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--aw-border); }
</style>
