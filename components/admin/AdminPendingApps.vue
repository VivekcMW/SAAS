<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Pending approvals</h1>
        <p class="bw-head__sub">{{ pendingApps.length }} {{ pendingApps.length === 1 ? 'app' : 'apps' }} awaiting review.</p>
      </div>
    </header>

    <div v-if="pendingApps.length === 0" class="bw-card" style="text-align: center; padding: 48px 24px;">
      <h2 class="bw-card__title" style="margin-bottom: 8px;">All caught up.</h2>
      <p style="color: var(--aw-text-muted); margin: 0;">No apps are waiting for approval.</p>
    </div>

    <div v-else class="bw-grid bw-grid--main-aside">
      <!-- List -->
      <section class="bw-card" style="padding: 12px;">
        <ul class="pq-list">
          <li
            v-for="a in pendingApps"
            :key="a.id"
            :class="{ 'pq-item--active': selected?.id === a.id }"
            class="pq-item"
            @click="selectedId = a.id"
          >
            <div class="q-logo" :style="{ background: a.color }">{{ a.logo }}</div>
            <div style="flex: 1; min-width: 0;">
              <div class="pq-name">{{ a.name }}</div>
              <div class="pq-meta">{{ a.vendorName }}</div>
              <div class="pq-meta pq-meta--muted">{{ a.submittedAt }}</div>
            </div>
          </li>
        </ul>
      </section>

      <!-- Detail -->
      <section v-if="selected" class="bw-card">
        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 16px;">
          <div class="q-logo" :style="{ background: selected.color, width: '56px', height: '56px', fontSize: '1.2rem' }">{{ selected.logo }}</div>
          <div>
            <h2 style="font-family: 'Poppins', sans-serif; font-size: 1.25rem; margin: 0;">{{ selected.name }}</h2>
            <p style="font-size: 0.88rem; color: var(--aw-text-muted); margin: 2px 0 0;">{{ selected.category }} · submitted {{ selected.submittedAt }}</p>
          </div>
        </div>

        <div class="pq-meta-grid">
          <div>
            <div class="pq-label">Vendor</div>
            <div>{{ selected.vendorName }}</div>
            <div style="font-size: 0.78rem; color: var(--aw-text-subtle);">{{ selected.vendorEmail }}</div>
          </div>
          <div>
            <div class="pq-label">Category</div>
            <div>{{ selected.category }}</div>
          </div>
        </div>

        <div style="margin-top: 20px;">
          <div class="pq-label">Description</div>
          <p style="font-size: 0.92rem; line-height: 1.6;">{{ selected.description }}</p>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--aw-border);">
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
  if (!list.find(a => a.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null
  }
})

function decide(d: 'approved' | 'rejected') {
  if (selectedId.value) decideApp(selectedId.value, d)
}
</script>

<style scoped>
.pq-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.pq-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; cursor: pointer; transition: background 0.12s; }
.pq-item:hover { background: var(--aw-surface-2); }
.pq-item--active { background: var(--aw-accent-50); }
.pq-item--active .pq-name { color: var(--aw-accent-text); }
.q-logo { width: 40px; height: 40px; border-radius: 8px; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
.pq-name { font-weight: 600; font-size: 0.92rem; }
.pq-meta { font-size: 0.78rem; color: var(--aw-text-muted); }
.pq-meta--muted { font-size: 0.72rem; color: var(--aw-text-subtle); }

.pq-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.88rem; }
.pq-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--aw-text-subtle); font-weight: 600; margin-bottom: 4px; }
</style>
