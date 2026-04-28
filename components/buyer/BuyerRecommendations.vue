<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Recommendations</h1>
        <p class="bw-head__sub">Answer 4 quick questions and get a shortlist tailored to your team.</p>
      </div>
    </header>

    <!-- Wizard -->
    <section v-if="!results" class="bw-card wizard">
      <div class="wizard__steps">
        <div v-for="(s, i) in steps" :key="s.id" class="wizard__step" :class="{ 'is-on': i <= stepIdx, 'is-active': i === stepIdx }">
          <span class="wizard__num">{{ i + 1 }}</span>
          <span class="wizard__label">{{ s.label }}</span>
        </div>
      </div>

      <div class="wizard__body">
        <!-- Step 1: Category -->
        <template v-if="stepIdx === 0">
          <h2 class="wizard__q">What kind of tool are you looking for?</h2>
          <div class="chips">
            <button v-for="c in categories" :key="c" class="chip" :class="{ 'is-on': form.category === c }" @click="form.category = c">{{ c }}</button>
          </div>
        </template>

        <!-- Step 2: Team size -->
        <template v-if="stepIdx === 1">
          <h2 class="wizard__q">How big is your team?</h2>
          <div class="chips">
            <button v-for="s in teamSizes" :key="s" class="chip" :class="{ 'is-on': form.teamSize === s }" @click="form.teamSize = s">{{ s }}</button>
          </div>
        </template>

        <!-- Step 3: Must-have integrations -->
        <template v-if="stepIdx === 2">
          <h2 class="wizard__q">Any must-have integrations?</h2>
          <div class="chips">
            <button v-for="i in integrations" :key="i" class="chip" :class="{ 'is-on': form.integrations.includes(i) }" @click="toggle(i)">{{ i }}</button>
          </div>
        </template>

        <!-- Step 4: Budget -->
        <template v-if="stepIdx === 3">
          <h2 class="wizard__q">Monthly budget per seat?</h2>
          <input type="range" min="0" max="100" v-model.number="form.budget" class="wizard__range" />
          <div class="wizard__budget">${{ form.budget }} / seat / month</div>
        </template>
      </div>

      <div class="wizard__nav">
        <button class="bw-btn bw-btn--ghost" :disabled="stepIdx === 0" @click="stepIdx--">Back</button>
        <button v-if="stepIdx < steps.length - 1" class="bw-btn bw-btn--primary" :disabled="!canNext" @click="stepIdx++">Next</button>
        <button v-else class="bw-btn bw-btn--primary" @click="generate">Get my shortlist</button>
      </div>
    </section>

    <!-- Results -->
    <section v-else>
      <div class="bw-card" style="margin-bottom: 16px; border-left: 4px solid var(--bw-primary);">
        <p style="margin: 0 0 4px; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--bw-primary); font-weight: 700;">Your match</p>
        <p style="margin: 0; font-size: 0.92rem;">Based on <strong>{{ form.category }}</strong> · team of <strong>{{ form.teamSize }}</strong> · budget <strong>${{ form.budget }}/seat</strong></p>
      </div>

      <div class="bw-grid bw-grid--3">
        <article v-for="(r, idx) in results" :key="r.name" class="bw-card bw-card--hover rec">
          <div class="rec__rank">#{{ idx + 1 }} match</div>
          <div class="rec__head">
            <div class="rec__logo" :style="{ background: r.color }">{{ r.logo }}</div>
            <div>
              <div class="rec__name">{{ r.name }}</div>
              <div class="rec__cat">{{ form.category }}</div>
            </div>
          </div>
          <p class="rec__rationale">{{ r.rationale }}</p>
          <div class="rec__meta">
            <span>From ${{ r.price }}/seat</span>
            <span>★ {{ r.rating }}</span>
          </div>
          <div class="rec__actions">
            <button class="bw-btn bw-btn--ghost bw-btn--sm">Save</button>
            <button class="bw-btn bw-btn--primary bw-btn--sm">Enquire</button>
          </div>
        </article>
      </div>

      <button class="bw-btn bw-btn--subtle" style="margin-top: 16px;" @click="results = null">← Adjust answers</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const steps = [
  { id: 'category', label: 'Category' },
  { id: 'size', label: 'Team' },
  { id: 'integrations', label: 'Stack' },
  { id: 'budget', label: 'Budget' }
]

const categories = ['CRM', 'Communication', 'Productivity', 'Project mgmt', 'Support', 'Marketing', 'HR', 'Finance']
const teamSizes = ['1–10', '11–50', '51–200', '201–1000', '1000+']
const integrations = ['Slack', 'Google Workspace', 'Microsoft 365', 'Salesforce', 'Jira', 'Github', 'Notion', 'Zapier']

const stepIdx = ref(0)
const form = reactive({ category: '', teamSize: '', integrations: [] as string[], budget: 25 })

const canNext = computed(() => {
  if (stepIdx.value === 0) return !!form.category
  if (stepIdx.value === 1) return !!form.teamSize
  return true
})

const toggle = (i: string) => {
  const idx = form.integrations.indexOf(i)
  if (idx >= 0) form.integrations.splice(idx, 1)
  else form.integrations.push(i)
}

interface Rec { name: string; logo: string; color: string; price: number; rating: number; rationale: string }
const results = ref<Rec[] | null>(null)

const generate = () => {
  // Static demo results — replace with useLLMOrchestrator call
  results.value = [
    { name: 'Pipedrive', logo: 'P', color: '#1A1A1A', price: 14, rating: 4.5, rationale: `Best price-to-value pick for ${form.teamSize} teams with a ${form.category} focus. Integrates with ${form.integrations.slice(0, 2).join(' & ') || 'most tools'}.` },
    { name: 'HubSpot', logo: 'H', color: '#FF7A59', price: 45, rating: 4.4, rationale: 'Most complete feature set if you plan to layer on marketing and service modules later. Popular choice above your budget but worth considering.' },
    { name: 'Attio', logo: 'A', color: '#4338CA', price: 29, rating: 4.7, rationale: 'Modern, flexible data model, great if your team loves Notion-style UX. Fast adoption reported by teams under 100.' }
  ]
}
</script>

<style scoped>
.wizard__steps { display: flex; gap: 4px; margin-bottom: 24px; }
.wizard__step { flex: 1; display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; color: var(--bw-text-subtle); }
.wizard__num { width: 24px; height: 24px; border-radius: 50%; background: var(--bw-surface-2); display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; }
.wizard__step.is-on { color: var(--bw-text); }
.wizard__step.is-on .wizard__num { background: var(--bw-primary); color: #fff; }
.wizard__step.is-active { font-weight: 700; }

.wizard__body { min-height: 200px; padding: 8px 0; }
.wizard__q { font-family: var(--f-ui); font-size: 1.25rem; font-weight: 700; margin: 0 0 20px; color: var(--bw-primary); }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 8px 16px; border: 1px solid var(--bw-border-strong); border-radius: 999px; background: var(--bw-surface); cursor: pointer; font-size: 0.88rem; font-weight: 500; font-family: inherit; color: var(--bw-text); transition: all .15s; }
.chip:hover { border-color: var(--bw-primary); }
.chip.is-on { background: var(--bw-primary); border-color: var(--bw-primary); color: #fff; }

.wizard__range { width: 100%; margin: 20px 0 10px; accent-color: var(--bw-primary); }
.wizard__budget { font-family: var(--f-ui); font-size: 1.6rem; font-weight: 700; color: var(--bw-primary); text-align: center; }

.wizard__nav { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--bw-border); }

.rec { position: relative; display: flex; flex-direction: column; gap: 12px; }
.rec__rank { position: absolute; top: 14px; right: 14px; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--bw-primary); font-weight: 700; }
.rec__head { display: flex; align-items: center; gap: 12px; }
.rec__logo { width: 44px; height: 44px; border-radius: 12px; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-family: var(--f-ui); font-weight: 700; font-size: 1.1rem; }
.rec__name { font-family: var(--f-ui); font-weight: 700; font-size: 1.05rem; color: var(--bw-text); }
.rec__cat { font-size: 0.82rem; color: var(--bw-text-muted); }
.rec__rationale { font-size: 0.88rem; color: var(--bw-text-muted); margin: 0; line-height: 1.5; }
.rec__meta { display: flex; justify-content: space-between; padding: 10px 12px; background: var(--bw-surface-2); border-radius: 10px; font-size: 0.85rem; font-weight: 600; color: var(--bw-text-muted); }
.rec__actions { display: flex; gap: 8px; }
.rec__actions .bw-btn { flex: 1; justify-content: center; }
</style>
