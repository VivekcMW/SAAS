<template>
  <div v-if="visible" class="nai-wrap" :class="{ 'nai-wrap--loading': loading }">
    <div class="nai-header">
      <span class="nai-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
        AI Insight
      </span>
      <span class="nai-subtitle">What this means for buyers</span>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="nai-skel-wrap">
      <div class="nai-skel nai-skel--w100" />
      <div class="nai-skel nai-skel--w80" />
      <div class="nai-impl-row">
        <div class="nai-skel nai-skel--chip" />
        <div class="nai-skel nai-skel--chip" />
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="data">
      <p class="nai-summary">{{ data.summary }}</p>
      <div v-if="data.implications.length" class="nai-impl-row">
        <span v-for="(impl, i) in data.implications" :key="i" class="nai-chip">{{ impl }}</span>
      </div>
    </template>

    <!-- Error (silent — just hide if fail) -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ slug: string }>()

interface InsightData {
  summary: string
  implications: string[]
  cachedAt: string
}

const loading = ref(false)
const data = ref<InsightData | null>(null)
const visible = ref(false)

async function load() {
  loading.value = true
  visible.value = true
  try {
    data.value = await $fetch<InsightData>(`/api/news/${props.slug}/insight`)
  } catch {
    // Fail silently — don't break the page
    visible.value = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Lazy-load after 500ms when near viewport (IntersectionObserver)
  if (typeof IntersectionObserver === 'undefined') {
    setTimeout(load, 500)
    return
  }

  visible.value = true
  loading.value = true
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect()
      setTimeout(load, 500)
    }
  }, { rootMargin: '200px' })
  const target = document.querySelector('[data-nai-trigger]') ?? document.querySelector('.nai-wrap')
  if (target) observer.observe(target)
  else setTimeout(load, 500)
})
</script>

<style scoped>
.nai-wrap {
  background: linear-gradient(135deg, rgba(74,128,212,0.06) 0%, rgba(42,157,143,0.04) 100%);
  border: 0.5px solid rgba(74,128,212,0.2);
  border-radius: 12px;
  padding: 16px 18px;
  margin: 20px 0;
}
.nai-wrap--loading { min-height: 90px; }
.nai-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}
.nai-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(74,128,212,0.15); color: var(--mm-blue, #4A80D4);
  font-size: 0.68rem; font-weight: 800; padding: 2px 7px; border-radius: 20px;
  text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap;
}
.nai-subtitle {
  font-size: 0.82rem; font-weight: 700; color: rgba(255,255,255,0.6);
}
.nai-summary {
  font-size: 0.88rem; line-height: 1.6; color: rgba(255,255,255,0.8); margin: 0 0 12px;
}
.nai-impl-row { display: flex; flex-wrap: wrap; gap: 7px; }
.nai-chip {
  display: inline-block;
  background: rgba(255,255,255,0.06);
  border: 0.5px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 4px 11px;
  font-size: 0.76rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.4;
}

/* Skeletons */
.nai-skel-wrap { display: flex; flex-direction: column; gap: 8px; }
.nai-skel { height: 14px; border-radius: 7px; background: rgba(255,255,255,0.06); animation: shimmer 1.4s infinite; }
.nai-skel--w100 { width: 100%; }
.nai-skel--w80 { width: 80%; }
.nai-skel--chip { height: 24px; width: 140px; border-radius: 20px; }
@keyframes shimmer { 0%,100%{opacity:.4}50%{opacity:.8} }
</style>
