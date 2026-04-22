<script setup lang="ts">
import { ref, computed } from 'vue'

interface Feature {
  name: string
  description?: string
  included: boolean
  group?: string
  tier?: string
}

interface Props {
  features: Feature[]
  showGroups?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showGroups: true
})

const expandedGroups = ref<Set<string>>(new Set())

/** Icon + accent colour per known group, with a fallback mapping */
const GROUP_META: Record<string, { icon: string; color: string; bg: string; dot: string }> = {
  'Core Features': { icon: 'heroicons:cube', color: '#b45309', bg: '#fff3e6', dot: '#ff8838' },
  Core: { icon: 'heroicons:cube', color: '#b45309', bg: '#fff3e6', dot: '#ff8838' },
  Analytics: { icon: 'heroicons:chart-bar', color: '#1d4ed8', bg: '#eff6ff', dot: '#3b82f6' },
  Security: { icon: 'heroicons:shield-check', color: '#047857', bg: '#ecfdf5', dot: '#10b981' },
  Support: { icon: 'heroicons:lifebuoy', color: '#9d174d', bg: '#fdf2f8', dot: '#ec4899' },
  Integrations: { icon: 'heroicons:puzzle-piece', color: '#6d28d9', bg: '#f5f3ff', dot: '#8b5cf6' },
  Automation: { icon: 'heroicons:bolt', color: '#a16207', bg: '#fefce8', dot: '#eab308' },
  Collaboration: { icon: 'heroicons:users', color: '#0e7490', bg: '#ecfeff', dot: '#06b6d4' },
  AI: { icon: 'heroicons:sparkles', color: '#7e22ce', bg: '#faf5ff', dot: '#a855f7' }
}

const FALLBACK_META = { icon: 'heroicons:squares-2x2', color: '#334155', bg: '#f1f5f9', dot: '#64748b' }

function metaFor(group: string) {
  return GROUP_META[group] ?? FALLBACK_META
}

const grouped = computed(() => {
  if (!props.showGroups) return [{ group: 'All features', items: props.features }]
  const map = new Map<string, Feature[]>()
  for (const f of props.features) {
    const g = f.group || 'Core Features'
    if (!map.has(g)) map.set(g, [])
    map.get(g)!.push(f)
  }
  return Array.from(map, ([group, items]) => ({ group, items }))
})

const totals = computed(() => {
  const included = props.features.filter(f => f.included).length
  return { included, total: props.features.length }
})

const VISIBLE_PER_GROUP = 4

function visibleItems(group: string, items: Feature[]) {
  if (expandedGroups.value.has(group)) return items
  return items.slice(0, VISIBLE_PER_GROUP)
}

function toggleGroup(group: string) {
  const next = new Set(expandedGroups.value)
  if (next.has(group)) next.delete(group)
  else next.add(group)
  expandedGroups.value = next
}
</script>

<template>
  <div class="feature-matrix">
    <!-- Summary band -->
    <div class="feature-summary">
      <div class="summary-stat">
        <span class="stat-value">{{ totals.included }}</span>
        <span class="stat-label">features included</span>
      </div>
      <div class="summary-divider" aria-hidden="true" />
      <div class="summary-stat">
        <span class="stat-value">{{ grouped.length }}</span>
        <span class="stat-label">capability areas</span>
      </div>
      <div class="summary-divider" aria-hidden="true" />
      <div class="summary-note">
        <Icon name="heroicons:check-badge" />
        <span>Verified by vendor</span>
      </div>
    </div>

    <!-- Group cards -->
    <div class="feature-groups">
      <article
        v-for="g in grouped"
        :key="g.group"
        class="group-card"
        :style="{ '--group-bg': metaFor(g.group).bg, '--group-color': metaFor(g.group).color, '--group-dot': metaFor(g.group).dot }"
      >
        <header class="group-header">
          <div class="group-icon-wrap">
            <Icon :name="metaFor(g.group).icon" class="group-icon" />
          </div>
          <div class="group-title-wrap">
            <h3 class="group-title">{{ g.group }}</h3>
            <span class="group-count">{{ g.items.filter(i => i.included).length }}/{{ g.items.length }}</span>
          </div>
        </header>

        <ul class="group-list">
          <li
            v-for="(f, i) in visibleItems(g.group, g.items)"
            :key="g.group + ':' + i"
            :class="['group-feature', { 'not-included': !f.included }]"
          >
            <span class="feat-marker" :aria-hidden="true">
              <Icon :name="f.included ? 'heroicons:check' : 'heroicons:x-mark'" />
            </span>
            <div class="feat-text">
              <span class="feat-name">
                {{ f.name }}
                <span v-if="f.tier" class="feat-tier">{{ f.tier }}</span>
              </span>
              <p v-if="f.description" class="feat-desc">{{ f.description }}</p>
            </div>
          </li>
        </ul>

        <button
          v-if="g.items.length > VISIBLE_PER_GROUP"
          type="button"
          class="group-more"
          @click="toggleGroup(g.group)"
        >
          {{ expandedGroups.has(g.group)
            ? 'Show less'
            : `+${g.items.length - VISIBLE_PER_GROUP} more`
          }}
          <Icon :name="expandedGroups.has(g.group) ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" />
        </button>
      </article>
    </div>
  </div>
</template>

<style scoped>
.feature-matrix { display: flex; flex-direction: column; gap: 20px; }

/* Summary band */
.feature-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 18px;
  background: #f9fafb;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  flex-wrap: wrap;
}
.summary-stat { display: flex; align-items: baseline; gap: 6px; }
.stat-value { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; }
.stat-label { font-size: 13px; color: #6b7280; font-weight: 500; }
.summary-divider { width: 1px; height: 22px; background: #e5e7eb; }
.summary-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 13px;
  color: #047857;
  font-weight: 500;
}
.summary-note :deep(svg) { width: 16px; height: 16px; }

/* Grid of group cards */
.feature-groups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* Group card */
.group-card {
  position: relative;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.group-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--group-dot, #ff8838);
  opacity: 0.9;
}
.group-card:hover {
  border-color: var(--group-dot, #ff8838);
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
}

/* Group header */
.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.group-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--group-bg, #f1f5f9);
  color: var(--group-color, #334155);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.group-icon { width: 20px; height: 20px; }
.group-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.group-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}
.group-count {
  font-size: 12px;
  color: var(--group-color, #6b7280);
  font-weight: 600;
  background: var(--group-bg, #f1f5f9);
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

/* Feature list */
.group-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-feature {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}
.feat-marker {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--group-bg, #f1f5f9);
  color: var(--group-color, #334155);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.feat-marker :deep(svg) { width: 12px; height: 12px; }
.group-feature.not-included .feat-marker {
  background: #f3f4f6;
  color: #9ca3af;
}

.feat-text { flex: 1; min-width: 0; }
.feat-name {
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
  line-height: 1.4;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.group-feature.not-included .feat-name { color: #9ca3af; text-decoration: line-through; }

.feat-tier {
  display: inline-block;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 700;
  color: var(--group-color, #6b7280);
  background: var(--group-bg, #f3f4f6);
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.feat-desc {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: #6b7280;
  line-height: 1.5;
}

/* "+N more" toggle */
.group-more {
  margin-top: 2px;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--group-color, #334155);
  cursor: pointer;
  padding: 4px 0;
  transition: opacity 150ms ease;
}
.group-more:hover { opacity: 0.75; }
.group-more:focus-visible {
  outline: 2px solid var(--group-dot, #ff8838);
  outline-offset: 3px;
  border-radius: 4px;
}
.group-more :deep(svg) { width: 14px; height: 14px; }

@media (max-width: 700px) {
  .feature-groups { grid-template-columns: 1fr; }
  .feature-summary { gap: 14px; padding: 12px 14px; }
  .summary-note { margin-left: 0; width: 100%; order: 3; }
}
</style>
