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
  background: var(--mm-gold-soft);
  border: 0.5px solid var(--mm-gold);
  border-radius: var(--r-lg);
  padding: 16px;
  display: flex;
  gap: 12px;
}

.alert-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  background: var(--mm-gold);
  color: #0A0700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.alert-icon :deep(svg) { width: 18px; height: 18px; }

.alert-body { flex: 1; min-width: 0; }
.alert-title { margin: 0; font-size: 14px; font-weight: 700; color: var(--mm-pearl); }
.alert-sub { margin: 2px 0 10px; font-size: 12px; color: var(--mm-slate); }

.alert-form { display: flex; flex-direction: column; gap: 6px; }
.form-row { display: flex; gap: 6px; flex-wrap: wrap; }

.alert-input,
.alert-select {
  border: 0.5px solid var(--b2);
  background: var(--mm-s3);
  color: var(--mm-silver);
  border-radius: var(--r-md);
  padding: 8px 10px;
  font-size: 13px;
  outline: none;
  transition: border-color var(--transition-fast);
}
.alert-input { flex: 1; min-width: 180px; }
.alert-input:focus,
.alert-select:focus { border-color: var(--mm-gold); }

.alert-submit {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--mm-gold);
  color: #0A0700;
  border: 0;
  padding: 8px 14px;
  border-radius: var(--r-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.alert-submit:hover:not(:disabled) { background: var(--mm-goldl); }
.alert-submit:disabled { background: var(--mm-s3); color: var(--mm-slate); cursor: not-allowed; }
.alert-submit :deep(svg) { width: 14px; height: 14px; }

.spinner { width: 12px; height: 12px; border: 2px solid #0A0700; border-top-color: transparent; border-radius: 50%; animation: spin 800ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.alert-error { margin: 4px 0 0; font-size: 12px; color: #f87171; }

.alert-success {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--mm-seal);
  flex-wrap: wrap;
}
.alert-success :deep(svg) { width: 16px; height: 16px; }
.alert-reset {
  margin-left: auto;
  background: transparent;
  border: 0;
  color: var(--mm-slate);
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}
.alert-reset:hover { color: var(--mm-gold); }
</style>
