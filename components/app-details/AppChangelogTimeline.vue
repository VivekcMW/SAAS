<script setup lang="ts">
import { computed } from 'vue'

interface ChangelogEntry {
  version: string
  date: string
  type: 'feature' | 'fix' | 'improvement' | 'breaking'
  title: string
  highlights?: string[]
}

interface Props {
  appName: string
  entries?: ChangelogEntry[]
}

const props = withDefaults(defineProps<Props>(), {
  entries: () => []
})

// If no entries provided, generate plausible recent history
const fallbackEntries: ChangelogEntry[] = [
  {
    version: '4.2.0',
    date: '2026-04-08',
    type: 'feature',
    title: 'AI summary in dashboards',
    highlights: ['One-click AI rollups for any board', 'Custom prompt presets per workspace', 'Export summaries to PDF']
  },
  {
    version: '4.1.3',
    date: '2026-03-21',
    type: 'improvement',
    title: 'Faster mobile loading',
    highlights: ['~40% reduction in time to interactive on mobile', 'Lazy-loaded image gallery', 'Better offline cache']
  },
  {
    version: '4.1.0',
    date: '2026-02-14',
    type: 'feature',
    title: 'Slack & Teams native integration',
    highlights: ['Two-way sync of comments and statuses', 'Slash commands for quick creates', 'Per-channel notification rules']
  },
  {
    version: '4.0.5',
    date: '2026-01-10',
    type: 'fix',
    title: 'Stability and security patches',
    highlights: ['Fixed rare crash on shared boards', 'Patched CVE-2025-XXXX', 'Improved 2FA recovery flow']
  }
]

const items = computed<ChangelogEntry[]>(() => (props.entries.length ? props.entries : fallbackEntries))

function typeMeta(type: ChangelogEntry['type']) {
  switch (type) {
    case 'feature': return { label: 'New', color: 'good', icon: 'heroicons:sparkles' }
    case 'improvement': return { label: 'Improved', color: 'neutral', icon: 'heroicons:arrow-trending-up' }
    case 'fix': return { label: 'Fix', color: 'warn', icon: 'heroicons:wrench-screwdriver' }
    case 'breaking': return { label: 'Breaking', color: 'danger', icon: 'heroicons:exclamation-triangle' }
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="changelog">
    <header class="cl-head">
      <div>
        <h3 class="cl-title">
          <Icon name="heroicons:clock" />
          Recent updates
        </h3>
        <p class="cl-sub">What's new in {{ appName }} — last 90 days</p>
      </div>
    </header>

    <ol class="cl-timeline">
      <li v-for="(entry, idx) in items" :key="entry.version" class="cl-item">
        <div class="cl-marker" :class="`tone-${typeMeta(entry.type).color}`">
          <Icon :name="typeMeta(entry.type).icon" />
        </div>
        <div v-if="idx < items.length - 1" class="cl-line"></div>

        <div class="cl-card">
          <div class="cl-meta">
            <span class="cl-version">v{{ entry.version }}</span>
            <span class="cl-pill" :class="`tone-${typeMeta(entry.type).color}`">
              {{ typeMeta(entry.type).label }}
            </span>
            <span class="cl-date">{{ formatDate(entry.date) }}</span>
          </div>
          <h4 class="cl-itemtitle">{{ entry.title }}</h4>
          <ul v-if="entry.highlights?.length" class="cl-highlights">
            <li v-for="h in entry.highlights" :key="h">{{ h }}</li>
          </ul>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.changelog {
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  padding: 20px;
}

.cl-head { margin-bottom: 16px; }
.cl-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--mm-pearl);
}
.cl-title :deep(svg) { width: 18px; height: 18px; color: var(--mm-gold); }
.cl-sub { margin: 4px 0 0; font-size: 13px; color: var(--mm-slate); }

.cl-timeline { list-style: none; padding: 0; margin: 0; }
.cl-item { position: relative; padding-left: 36px; padding-bottom: 16px; }
.cl-item:last-child { padding-bottom: 0; }

.cl-marker {
  position: absolute;
  left: 0;
  top: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  border: 2px solid var(--mm-s2);
}
.cl-marker :deep(svg) { width: 12px; height: 12px; }

.cl-marker.tone-good { background: var(--mm-sea-soft); color: var(--mm-seal); }
.cl-marker.tone-neutral { background: var(--mm-blue-soft); color: var(--mm-bluel); }
.cl-marker.tone-warn { background: var(--mm-gold-soft); color: var(--mm-gold); }
.cl-marker.tone-danger { background: rgba(248,113,113,0.12); color: #f87171; }

.cl-line {
  position: absolute;
  left: 11px;
  top: 28px;
  bottom: 0;
  width: 2px;
  background: var(--b1);
}

.cl-card {
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-md);
  padding: 10px 12px;
}

.cl-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.cl-version { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11px; color: var(--mm-slate); }
.cl-pill {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  border-radius: var(--r-xs);
}
.cl-pill.tone-good { background: var(--mm-sea-soft); color: var(--mm-seal); }
.cl-pill.tone-neutral { background: var(--mm-blue-soft); color: var(--mm-bluel); }
.cl-pill.tone-warn { background: var(--mm-gold-soft); color: var(--mm-gold); }
.cl-pill.tone-danger { background: rgba(248,113,113,0.12); color: #f87171; }
.cl-date { font-size: 11px; color: var(--mm-slate); margin-left: auto; }

.cl-itemtitle { margin: 0 0 6px; font-size: 14px; font-weight: 600; color: var(--mm-pearl); }

.cl-highlights {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--mm-silver);
  line-height: 1.55;
}
.cl-highlights li { margin: 2px 0; }
</style>
