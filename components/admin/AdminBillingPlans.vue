<template>
  <div>
    <!-- KPI strip -->
    <div class="bw-kpis" style="margin-bottom: 20px;">
      <div class="bw-kpi">
        <div class="bw-kpi__label">Total plans</div>
        <div class="bw-kpi__value">{{ plans.length }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Active</div>
        <div class="bw-kpi__value">{{ plans.filter(p => p.status === 'active').length }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Buyer plans</div>
        <div class="bw-kpi__value">{{ plans.filter(p => p.audience === 'buyer').length }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Vendor plans</div>
        <div class="bw-kpi__value">{{ plans.filter(p => p.audience === 'vendor').length }}</div>
      </div>
    </div>

    <section class="bw-card">
      <div class="bw-card__head">
        <h2 class="bw-card__title">Billing Plans</h2>
        <button class="bw-btn bw-btn--primary bw-btn--sm" @click="openCreate">+ New plan</button>
      </div>

      <div v-if="loading" class="abp-empty">Loading…</div>
      <div v-else-if="!plans.length" class="abp-empty">No plans configured yet.</div>
      <table v-else class="bw-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Audience</th>
            <th>Monthly</th>
            <th>Annual</th>
            <th>Status</th>
            <th>Stripe IDs</th>
            <th style="width:120px;"/>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in plans" :key="plan.id">
            <td>
              <strong>{{ plan.display_name }}</strong>
              <div class="abp-key">{{ plan.plan_key }}</div>
            </td>
            <td>
              <span class="bw-chip" :class="plan.audience === 'buyer' ? 'bw-chip--blue' : 'bw-chip--purple'">
                {{ plan.audience }}
              </span>
            </td>
            <td>${{ plan.price_monthly }}/mo</td>
            <td>${{ plan.price_annual }}/yr</td>
            <td>
              <span class="bw-chip" :class="statusChip(plan.status)">{{ plan.status }}</span>
            </td>
            <td class="abp-stripe-ids">
              <span v-if="plan.stripe_price_id_monthly" class="abp-price-id">M: {{ plan.stripe_price_id_monthly }}</span>
              <span v-if="plan.stripe_price_id_annual" class="abp-price-id">A: {{ plan.stripe_price_id_annual }}</span>
              <span v-if="!plan.stripe_price_id_monthly && !plan.stripe_price_id_annual" style="color: var(--bw-text-muted); font-size: 0.8rem;">—</span>
            </td>
            <td>
              <div style="display:flex; gap:6px; justify-content:flex-end;">
                <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="openEdit(plan)">Edit</button>
                <button
                  v-if="plan.status !== 'deprecated'"
                  class="bw-btn bw-btn--subtle bw-btn--sm"
                  @click="deprecate(plan)"
                >Archive</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Edit / Create modal -->
    <div v-if="modal.open" class="abp-backdrop" @click.self="modal.open = false">
      <div class="abp-modal">
        <h3 class="abp-modal__title">{{ modal.id ? 'Edit Plan' : 'New Plan' }}</h3>

        <div class="bw-grid bw-grid--2" style="gap:14px; margin-bottom:14px;">
          <label class="st-row" style="flex-direction:column; align-items:flex-start; gap:4px;">
            <span>Plan key <em class="abp-req">*</em></span>
            <input v-model="form.plan_key" class="bw-input" placeholder="e.g. buyer-pro" :disabled="!!modal.id" >
          </label>
          <label class="st-row" style="flex-direction:column; align-items:flex-start; gap:4px;">
            <span>Display name <em class="abp-req">*</em></span>
            <input v-model="form.display_name" class="bw-input" placeholder="e.g. Buyer Pro" >
          </label>
          <label class="st-row" style="flex-direction:column; align-items:flex-start; gap:4px;">
            <span>Audience <em class="abp-req">*</em></span>
            <select v-model="form.audience" class="bw-select">
              <option value="buyer">Buyer</option>
              <option value="vendor">Vendor</option>
            </select>
          </label>
          <label class="st-row" style="flex-direction:column; align-items:flex-start; gap:4px;">
            <span>Status</span>
            <select v-model="form.status" class="bw-select">
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </label>
          <label class="st-row" style="flex-direction:column; align-items:flex-start; gap:4px;">
            <span>Monthly price ($)</span>
            <input v-model.number="form.price_monthly" type="number" min="0" class="bw-input" >
          </label>
          <label class="st-row" style="flex-direction:column; align-items:flex-start; gap:4px;">
            <span>Annual price ($)</span>
            <input v-model.number="form.price_annual" type="number" min="0" class="bw-input" >
          </label>
          <label class="st-row" style="flex-direction:column; align-items:flex-start; gap:4px;">
            <span>Stripe Price ID (monthly)</span>
            <input v-model="form.stripe_price_id_monthly" class="bw-input" placeholder="price_..." >
          </label>
          <label class="st-row" style="flex-direction:column; align-items:flex-start; gap:4px;">
            <span>Stripe Price ID (annual)</span>
            <input v-model="form.stripe_price_id_annual" class="bw-input" placeholder="price_..." >
          </label>
        </div>

        <label class="st-row" style="flex-direction:column; align-items:flex-start; gap:4px; margin-bottom:14px;">
          <span>Features (one per line)</span>
          <textarea v-model="featuresText" class="bw-input" rows="5" style="resize:vertical; font-size:0.875rem;" />
        </label>

        <label class="st-row" style="flex-direction:column; align-items:flex-start; gap:4px; margin-bottom:18px;">
          <span>Sort order</span>
          <input v-model.number="form.sort_order" type="number" min="0" class="bw-input" style="max-width:100px;" >
        </label>

        <p v-if="formError" class="abp-error">{{ formError }}</p>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="bw-btn bw-btn--ghost" @click="modal.open = false">Cancel</button>
          <button class="bw-btn bw-btn--primary" :disabled="saving" @click="save">
            {{ saving ? 'Saving…' : (modal.id ? 'Save changes' : 'Create plan') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface Plan {
  id: string; plan_key: string; display_name: string; audience: string
  price_monthly: number; price_annual: number; features: string[]
  stripe_price_id_monthly: string | null; stripe_price_id_annual: string | null
  status: string; sort_order: number
}

const loading = ref(true)
const saving = ref(false)
const formError = ref('')
const plans = ref<Plan[]>([])

const modal = reactive({ open: false, id: '' })
const form = reactive<Omit<Plan, 'id' | 'features'> & { features: string[] }>({
  plan_key: '', display_name: '', audience: 'buyer',
  price_monthly: 0, price_annual: 0, features: [],
  stripe_price_id_monthly: null, stripe_price_id_annual: null,
  status: 'active', sort_order: 0
})

const featuresText = computed({
  get: () => form.features.join('\n'),
  set: (v: string) => { form.features = v.split('\n').map(s => s.trim()).filter(Boolean) }
})

async function load() {
  loading.value = true
  const data = await $fetch<Plan[]>('/api/admin/billing/plans')
  plans.value = data
  loading.value = false
}
onMounted(() => { load() })

function statusChip(s: string) {
  if (s === 'active') return 'bw-chip--green'
  if (s === 'hidden') return 'bw-chip--orange'
  return 'bw-chip--red'
}

function openCreate() {
  modal.id = ''
  Object.assign(form, {
    plan_key: '', display_name: '', audience: 'buyer',
    price_monthly: 0, price_annual: 0, features: [],
    stripe_price_id_monthly: null, stripe_price_id_annual: null,
    status: 'active', sort_order: 0
  })
  formError.value = ''
  modal.open = true
}

function openEdit(plan: Plan) {
  modal.id = plan.id
  Object.assign(form, {
    plan_key: plan.plan_key, display_name: plan.display_name, audience: plan.audience,
    price_monthly: plan.price_monthly, price_annual: plan.price_annual,
    features: [...plan.features],
    stripe_price_id_monthly: plan.stripe_price_id_monthly ?? null,
    stripe_price_id_annual: plan.stripe_price_id_annual ?? null,
    status: plan.status, sort_order: plan.sort_order
  })
  formError.value = ''
  modal.open = true
}

async function save() {
  formError.value = ''
  if (!form.plan_key || !form.display_name) {
    formError.value = 'Plan key and display name are required.'
    return
  }
  saving.value = true
  try {
    const payload = { ...form, features: form.features }
    if (modal.id) {
      await $fetch(`/api/admin/billing/${modal.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/admin/billing/plans', { method: 'POST', body: payload })
    }
    modal.open = false
    await load()
  } catch (e: any) {
    formError.value = e?.data?.message ?? 'Failed to save plan.'
  } finally {
    saving.value = false
  }
}

async function deprecate(plan: Plan) {
  if (!confirm(`Archive "${plan.display_name}"? It will no longer be shown to users.`)) return
  await $fetch(`/api/admin/billing/${plan.id}`, { method: 'DELETE' })
  await load()
}
</script>

<style scoped>
.abp-key { font-size: 0.78rem; color: var(--bw-text-muted); margin-top: 2px; }
.abp-stripe-ids { display: flex; flex-direction: column; gap: 2px; }
.abp-price-id { font-size: 0.72rem; color: var(--bw-text-muted); font-family: monospace; }
.abp-empty { padding: 24px; text-align: center; color: var(--bw-text-muted); }
.abp-req { color: var(--mm-warn, #f59e0b); font-style: normal; }
.abp-error { color: var(--mm-danger, #ef4444); font-size: 0.875rem; margin-bottom: 10px; }

.abp-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.abp-modal {
  background: var(--bw-surface); border-radius: 8px; padding: 28px;
  width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto;
}
.abp-modal__title { font-size: 1.1rem; font-weight: 600; margin-bottom: 20px; }
</style>
