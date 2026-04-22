<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  appId: string
  appName: string
}

const props = defineProps<Props>()

const email = ref('')
const threshold = ref<'any' | 'decrease' | 'increase'>('decrease')
const submitting = ref(false)
const success = ref(false)
const error = ref('')

async function subscribe() {
  if (!email.value) return
  submitting.value = true
  error.value = ''
  try {
    await $fetch('/api/alerts/subscribe', {
      method: 'POST',
      body: {
        appId: props.appId,
        email: email.value,
        threshold: threshold.value
      }
    })
    success.value = true
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    error.value = err?.data?.statusMessage || err?.message || 'Could not subscribe. Please try again.'
  } finally {
    submitting.value = false
  }
}

function reset() {
  success.value = false
  email.value = ''
}
</script>

<template>
  <div class="price-alert">
    <div class="alert-icon">
      <Icon name="heroicons:bell-alert" />
    </div>
    <div class="alert-body">
      <h4 class="alert-title">Get notified about pricing changes</h4>
      <p class="alert-sub">We'll email you when {{ appName }} updates plans, runs promos, or adjusts pricing.</p>

      <form v-if="!success" class="alert-form" @submit.prevent="subscribe">
        <div class="form-row">
          <input
            v-model="email"
            type="email"
            placeholder="you@company.com"
            class="alert-input"
            required
            :disabled="submitting"
          />
          <select v-model="threshold" class="alert-select" :disabled="submitting">
            <option value="decrease">Price drops</option>
            <option value="increase">Price increases</option>
            <option value="any">Any change</option>
          </select>
          <button type="submit" class="alert-submit" :disabled="submitting || !email">
            <Icon v-if="!submitting" name="heroicons:bell" />
            <span v-else class="spinner"></span>
            {{ submitting ? 'Subscribing…' : 'Notify me' }}
          </button>
        </div>
        <p v-if="error" class="alert-error">{{ error }}</p>
      </form>

      <div v-else class="alert-success">
        <Icon name="heroicons:check-circle" />
        <span>You're subscribed. We'll email <strong>{{ email }}</strong>.</span>
        <button class="alert-reset" @click="reset">Subscribe another</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.price-alert {
  background: #fffaf5;
  border: 0.5px solid #ffedd5;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
}

.alert-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #ff8838;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.alert-icon :deep(svg) { width: 18px; height: 18px; }

.alert-body { flex: 1; min-width: 0; }
.alert-title { margin: 0; font-size: 14px; font-weight: 700; color: #111827; }
.alert-sub { margin: 2px 0 10px; font-size: 12px; color: #6b7280; }

.alert-form { display: flex; flex-direction: column; gap: 6px; }
.form-row { display: flex; gap: 6px; flex-wrap: wrap; }

.alert-input,
.alert-select {
  border: 0.5px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  outline: none;
  transition: border-color 150ms ease;
}
.alert-input { flex: 1; min-width: 180px; }
.alert-input:focus,
.alert-select:focus { border-color: #ff8838; }

.alert-submit {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ff8838;
  color: #ffffff;
  border: 0;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease;
}
.alert-submit:hover:not(:disabled) { background: #e57320; }
.alert-submit:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }
.alert-submit :deep(svg) { width: 14px; height: 14px; }

.spinner { width: 12px; height: 12px; border: 2px solid #ffffff; border-top-color: transparent; border-radius: 50%; animation: spin 800ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.alert-error { margin: 4px 0 0; font-size: 12px; color: #dc2626; }

.alert-success {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #047857;
  flex-wrap: wrap;
}
.alert-success :deep(svg) { width: 16px; height: 16px; }
.alert-reset {
  margin-left: auto;
  background: transparent;
  border: 0;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}
.alert-reset:hover { color: #ff8838; }
</style>
