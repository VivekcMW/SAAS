<template>
  <div class="price-intel">
    <div class="price-intel__header">
      <h3>Community Price Data</h3>
      <span class="price-intel__badge">{{ total }} reports</span>
    </div>

    <div v-if="aggregates?.length" class="price-intel__plans">
      <div v-for="plan in aggregates" :key="plan.plan_name" class="price-intel__plan">
        <div class="price-intel__plan-name">{{ plan.plan_name }}</div>
        <div class="price-intel__range">
          <span class="price-intel__min">${{ fmt(plan.min_price) }}</span>
          <div class="price-intel__bar-wrap">
            <div
              class="price-intel__bar-median"
              :style="barStyle(plan)"
              title="Median price"
            />
          </div>
          <span class="price-intel__max">${{ fmt(plan.max_price) }}</span>
        </div>
        <div class="price-intel__stats">
          <span>Avg <strong>${{ fmt(plan.avg_price) }}</strong></span>
          <span>Median <strong>${{ fmt(plan.median_price) }}</strong></span>
          <span class="price-intel__samples">{{ plan.sample_count }} {{ plan.sample_count === 1 ? 'report' : 'reports' }}</span>
        </div>
      </div>
    </div>
    <p v-else class="price-intel__empty">No community price data yet for this app.</p>

    <!-- Report form toggle -->
    <div class="price-intel__report">
      <button v-if="!showForm" class="price-intel__report-btn" @click="showForm = true">
        + Report a price
      </button>
      <form v-else class="price-intel__form" @submit.prevent="submit">
        <input v-model="form.plan_name" type="text" placeholder="Plan name (e.g. Pro)" required />
        <input v-model.number="form.price_usd" type="number" min="0" max="100000" step="0.01" placeholder="Price (USD)" required />
        <select v-model="form.billing_period">
          <option value="month">per month</option>
          <option value="year">per year</option>
          <option value="user/month">per user/month</option>
          <option value="one-time">one-time</option>
        </select>
        <p v-if="error" class="form-error">{{ error }}</p>
        <div class="price-intel__form-actions">
          <button type="submit" :disabled="loading">{{ loading ? 'Submitting…' : 'Submit' }}</button>
          <button type="button" @click="showForm = false">Cancel</button>
        </div>
      </form>
    </div>

    <p class="price-intel__disclaimer">Prices are community-reported and may differ from official pricing.</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ appId: string }>()

const { data, refresh } = await useAsyncData(
  `price-intel-${props.appId}`,
  () => $fetch(`/api/prices/${props.appId}`)
)

const aggregates = computed(() => (data.value as any)?.aggregates ?? [])
const total = computed(() => aggregates.value.reduce((s: number, p: any) => s + (p.sample_count || 0), 0))

// Position the median bar between min and max
const globalMin = computed(() => Math.min(...aggregates.value.map((p: any) => p.min_price ?? 0)))
const globalMax = computed(() => Math.max(...aggregates.value.map((p: any) => p.max_price ?? 0)))

function barStyle(plan: any) {
  const range = globalMax.value - globalMin.value || 1
  const left = ((plan.min_price - globalMin.value) / range) * 100
  const width = Math.max(4, ((plan.max_price - plan.min_price) / range) * 100)
  const medPos = ((plan.median_price - plan.min_price) / (plan.max_price - plan.min_price || 1)) * 100
  return { marginLeft: `${left}%`, width: `${width}%`, '--med': `${medPos}%` }
}

function fmt(n: number | null) {
  if (n == null) return '—'
  return n % 1 === 0 ? n.toString() : n.toFixed(2)
}

const showForm = ref(false)
const loading = ref(false)
const error = ref('')
const form = reactive({ plan_name: '', price_usd: 0, billing_period: 'month' })

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/prices/report', { method: 'POST', body: { app_id: props.appId, ...form } })
    showForm.value = false
    await refresh()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Failed to submit.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.price-intel { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.25rem 1.5rem; }
.price-intel__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.price-intel__header h3 { font-size: 1rem; font-weight: 700; }
.price-intel__badge { background: #e0e7ff; color: #3730a3; font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: 99px; }
.price-intel__plans { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }
.price-intel__plan { display: flex; flex-direction: column; gap: 4px; }
.price-intel__plan-name { font-size: 0.85rem; font-weight: 600; }
.price-intel__range { display: flex; align-items: center; gap: 8px; }
.price-intel__min, .price-intel__max { font-size: 0.75rem; color: #6b7280; min-width: 36px; }
.price-intel__max { text-align: right; }
.price-intel__bar-wrap { flex: 1; height: 8px; background: #f3f4f6; border-radius: 99px; position: relative; overflow: hidden; }
.price-intel__bar-median { height: 100%; background: #6366f1; border-radius: 99px; position: absolute; top: 0; }
.price-intel__stats { display: flex; gap: 1rem; font-size: 0.75rem; color: #6b7280; }
.price-intel__samples { margin-left: auto; }
.price-intel__empty { font-size: 0.875rem; color: #9ca3af; margin-bottom: 0.75rem; }
.price-intel__report { margin-top: 0.75rem; }
.price-intel__report-btn { background: none; border: 1px dashed #d1d5db; border-radius: 7px; padding: 5px 14px; font-size: 0.8rem; color: #6b7280; cursor: pointer; }
.price-intel__report-btn:hover { border-color: #6366f1; color: #6366f1; }
.price-intel__form { display: flex; flex-direction: column; gap: 8px; }
.price-intel__form input, .price-intel__form select { border: 1px solid #d1d5db; border-radius: 7px; padding: 6px 10px; font-size: 0.875rem; font-family: inherit; }
.price-intel__form-actions { display: flex; gap: 8px; }
.price-intel__form-actions button { border-radius: 7px; padding: 5px 14px; font-size: 0.8rem; cursor: pointer; }
.price-intel__form-actions button[type=submit] { background: #4f46e5; color: #fff; border: none; }
.price-intel__form-actions button[type=button] { background: none; border: 1px solid #e5e7eb; }
.form-error { color: #dc2626; font-size: 0.8rem; }
.price-intel__disclaimer { font-size: 0.72rem; color: #9ca3af; margin-top: 0.75rem; }
</style>
