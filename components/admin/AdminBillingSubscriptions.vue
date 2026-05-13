<template>
  <div>
    <!-- Filters -->
    <div class="abs-filters">
      <select v-model="filters.role" class="bw-select" @change="load">
        <option value="">All roles</option>
        <option value="buyer">Buyers</option>
        <option value="vendor">Vendors</option>
      </select>
      <select v-model="filters.status" class="bw-select" @change="load">
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="trialing">Trialing</option>
        <option value="past_due">Past due</option>
        <option value="canceled">Canceled</option>
      </select>
      <select v-model="filters.plan" class="bw-select" @change="load">
        <option value="">All plans</option>
        <option value="buyer-pro">Buyer Pro</option>
        <option value="vendor-growth">Vendor Growth</option>
      </select>
    </div>

    <section class="bw-card">
      <div class="bw-card__head">
        <h2 class="bw-card__title">Active Subscriptions</h2>
        <span style="color: var(--bw-text-muted); font-size: 0.875rem;">{{ total }} total</span>
      </div>

      <div v-if="loading" class="abs-empty">Loading…</div>
      <div v-else-if="!rows.length" class="abs-empty">No subscriptions found.</div>
      <table v-else class="bw-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Period end</th>
            <th>Cancel at end</th>
            <th>Started</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sub in rows" :key="sub.id">
            <td>
              <strong>{{ sub.full_name }}</strong>
              <div style="font-size: 0.8rem; color: var(--bw-text-muted);">{{ sub.email }}</div>
            </td>
            <td>
              <span class="bw-chip" :class="sub.role === 'buyer' ? 'bw-chip--blue' : 'bw-chip--purple'">
                {{ sub.role }}
              </span>
            </td>
            <td>
              <strong>{{ sub.plan_display_name ?? sub.plan }}</strong>
              <div v-if="sub.price_monthly" style="font-size: 0.78rem; color: var(--bw-text-muted);">${{ sub.price_monthly }}/mo</div>
            </td>
            <td><span class="bw-chip" :class="statusChip(sub.stripe_status)">{{ sub.stripe_status }}</span></td>
            <td style="font-size: 0.85rem;">{{ fmt(sub.current_period_end) }}</td>
            <td>
              <span v-if="sub.cancel_at_period_end" class="bw-chip bw-chip--orange">Yes</span>
              <span v-else style="color: var(--bw-text-muted);">—</span>
            </td>
            <td style="font-size: 0.85rem; color: var(--bw-text-muted);">{{ fmt(sub.created_at) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pages > 1" class="abs-pagination">
        <button class="bw-btn bw-btn--ghost bw-btn--sm" :disabled="page <= 1" @click="go(page - 1)">← Prev</button>
        <span style="font-size: 0.85rem; color: var(--bw-text-muted);">Page {{ page }} of {{ pages }}</span>
        <button class="bw-btn bw-btn--ghost bw-btn--sm" :disabled="page >= pages" @click="go(page + 1)">Next →</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Sub {
  id: string; plan: string; plan_display_name: string | null; price_monthly: number | null
  stripe_status: string; current_period_end: string | null; cancel_at_period_end: number
  created_at: string; full_name: string; email: string; role: string
}

const loading = ref(true)
const rows = ref<Sub[]>([])
const total = ref(0)
const page = ref(1)
const pages = ref(1)

const filters = reactive({ role: '', status: '', plan: '' })

async function load() {
  loading.value = true
  const q: Record<string, string | number> = { page: page.value, limit: 25 }
  if (filters.role) q.role = filters.role
  if (filters.status) q.status = filters.status
  if (filters.plan) q.plan = filters.plan

  const data = await $fetch<{ subscriptions: Sub[]; total: number; pages: number }>('/api/admin/billing/subscriptions', { query: q })
  rows.value = data.subscriptions
  total.value = data.total
  pages.value = data.pages
  loading.value = false
}
onMounted(() => { load() })

function go(p: number) {
  page.value = p
  load()
}

function fmt(v: string | null) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function statusChip(s: string) {
  if (s === 'active' || s === 'trialing') return 'bw-chip--green'
  if (s === 'past_due') return 'bw-chip--orange'
  return 'bw-chip--red'
}
</script>

<style scoped>
.abs-filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.abs-empty { padding: 24px; text-align: center; color: var(--bw-text-muted); }
.abs-pagination { display: flex; align-items: center; gap: 12px; padding: 14px 0 4px; justify-content: center; }
</style>
