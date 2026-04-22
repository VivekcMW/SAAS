<script setup lang="ts">
import { computed, ref } from 'vue'

interface MigrationStep {
  title: string
  detail: string
}

interface MigrationGuide {
  fromName: string
  fromLogo?: string
  effort: 'low' | 'medium' | 'high'
  duration: string
  steps: MigrationStep[]
}

interface Props {
  appName: string
  guides?: MigrationGuide[]
}

const props = withDefaults(defineProps<Props>(), { guides: () => [] })

const fallbackGuides: MigrationGuide[] = [
  {
    fromName: 'HubSpot',
    effort: 'medium',
    duration: '1–2 weeks',
    steps: [
      { title: 'Export contacts & companies', detail: 'Use HubSpot’s native CSV export or the contacts API to extract all records with custom properties.' },
      { title: 'Map fields', detail: 'Match HubSpot custom properties to native fields. Use a staging spreadsheet to confirm mappings before import.' },
      { title: 'Bulk import via CSV', detail: 'Upload mapped CSV in batches of 5,000 to avoid timeouts. Validate sample records after each batch.' },
      { title: 'Reconnect integrations', detail: 'Reauthorize Slack, Gmail, calendar, and Zapier. Test each workflow before turning off HubSpot.' },
      { title: 'Run parallel for 2 weeks', detail: 'Keep both systems live; new leads to the new tool, follow-ups in HubSpot until pipeline drains.' }
    ]
  },
  {
    fromName: 'Pipedrive',
    effort: 'low',
    duration: '3–5 days',
    steps: [
      { title: 'Export deals + activities', detail: 'Pipedrive’s export center provides JSON and CSV. Include custom fields and pipelines.' },
      { title: 'Import via API', detail: 'Use bulk import endpoint to preserve deal stages and ownership.' },
      { title: 'Notify sales team', detail: 'Hold a 30-minute walkthrough; share pre-built dashboards mirroring Pipedrive views.' },
      { title: 'Decommission Pipedrive', detail: 'Cancel licenses after the close of the next billing cycle.' }
    ]
  }
]

const items = computed<MigrationGuide[]>(() => (props.guides.length ? props.guides : fallbackGuides))
const activeIdx = ref(0)
const active = computed(() => items.value[activeIdx.value])

function effortMeta(effort: MigrationGuide['effort']) {
  switch (effort) {
    case 'low': return { label: 'Low effort', tone: 'good' }
    case 'medium': return { label: 'Medium effort', tone: 'neutral' }
    case 'high': return { label: 'High effort', tone: 'warn' }
  }
}
</script>

<template>
  <div class="migration">
    <header class="mig-head">
      <div>
        <h3 class="mig-title">
          <Icon name="heroicons:arrow-right-circle" />
          Migrating to {{ appName }}
        </h3>
        <p class="mig-sub">Step-by-step guides to switch with minimal downtime.</p>
      </div>
    </header>

    <div class="mig-tabs" role="tablist">
      <button
        v-for="(g, i) in items"
        :key="g.fromName"
        :class="['mig-tab', { active: i === activeIdx }]"
        role="tab"
        :aria-selected="i === activeIdx"
        @click="activeIdx = i"
      >
        From {{ g.fromName }}
      </button>
    </div>

    <div v-if="active" class="mig-body">
      <div class="mig-meta">
        <span class="mig-pill" :class="`tone-${effortMeta(active.effort).tone}`">{{ effortMeta(active.effort).label }}</span>
        <span class="mig-duration">
          <Icon name="heroicons:clock" />
          {{ active.duration }}
        </span>
      </div>

      <ol class="mig-steps">
        <li v-for="(step, i) in active.steps" :key="step.title">
          <div class="step-num">{{ i + 1 }}</div>
          <div class="step-body">
            <h4 class="step-title">{{ step.title }}</h4>
            <p class="step-detail">{{ step.detail }}</p>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.migration {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.mig-head { margin-bottom: 12px; }
.mig-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
.mig-title :deep(svg) { width: 18px; height: 18px; color: #ff8838; }
.mig-sub { margin: 4px 0 0; font-size: 13px; color: #6b7280; }

.mig-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 0.5px solid #e5e7eb;
  flex-wrap: wrap;
}
.mig-tab {
  background: transparent;
  border: 0;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 150ms ease, border-color 150ms ease;
}
.mig-tab:hover { color: #111827; }
.mig-tab.active { color: #ff8838; border-bottom-color: #ff8838; }

.mig-meta { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
.mig-pill {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 999px;
}
.mig-pill.tone-good { background: #d1fae5; color: #047857; }
.mig-pill.tone-neutral { background: #e0e7ff; color: #4338ca; }
.mig-pill.tone-warn { background: #fef3c7; color: #b45309; }

.mig-duration { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280; }
.mig-duration :deep(svg) { width: 12px; height: 12px; }

.mig-steps { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.mig-steps li { display: flex; gap: 10px; align-items: flex-start; }

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff3e6;
  color: #b45309;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-body { flex: 1; }
.step-title { margin: 0; font-size: 14px; font-weight: 600; color: #111827; }
.step-detail { margin: 2px 0 0; font-size: 12px; color: #4b5563; line-height: 1.55; }
</style>
