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

const typeOptions = [
  { value: 'decrease' as const, label: 'Price drops', icon: 'heroicons:arrow-trending-down' },
  { value: 'increase' as const, label: 'Price increases', icon: 'heroicons:arrow-trending-up' },
  { value: 'any' as const, label: 'Any change', icon: 'heroicons:arrows-up-down' },
]

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

    <!-- Header -->
    <div class="pa-header">
      <div class="pa-icon-wrap">
        <Icon name="heroicons:bell-alert" class="pa-icon" />
      </div>
      <div class="pa-header-text">
        <h4 class="pa-title">Get notified about pricing changes</h4>
        <p class="pa-sub">We'll email you when {{ appName }} updates plans, runs promos, or adjusts pricing.</p>
      </div>
    </div>

    <!-- Form -->
    <form v-if="!success" class="pa-form" @submit.prevent="subscribe">

      <!-- Alert type pills -->
      <div class="pa-type-row">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          type="button"
          :class="['pa-type-pill', { active: threshold === opt.value }]"
          :disabled="submitting"
          @click="threshold = opt.value"
        >
          <Icon :name="opt.icon" class="pill-icon" />
          {{ opt.label }}
        </button>
      </div>

      <!-- Email + submit -->
      <div class="pa-input-row">
        <div class="pa-input-wrap">
          <Icon name="heroicons:envelope" class="input-prefix-icon" />
          <input
            v-model="email"
            type="email"
            placeholder="you@company.com"
            class="pa-input"
            required
            :disabled="submitting"
          >
        </div>
        <button type="submit" class="pa-submit" :disabled="submitting || !email">
          <span v-if="submitting" class="spinner"/>
          <Icon v-else name="heroicons:bell" class="submit-icon" />
          <span>{{ submitting ? 'Subscribing…' : 'Notify me' }}</span>
        </button>
      </div>

      <p v-if="error" class="pa-error">
        <Icon name="heroicons:exclamation-circle" />
        {{ error }}
      </p>

      <p class="pa-privacy">
        <Icon name="heroicons:lock-closed" />
        No spam — unsubscribe any time.
      </p>
    </form>

    <!-- Success -->
    <div v-else class="pa-success">
      <div class="pa-success-icon">
        <Icon name="heroicons:check-circle" />
      </div>
      <div class="pa-success-body">
        <span class="pa-success-title">You're all set!</span>
        <span class="pa-success-sub">We'll email <strong>{{ email }}</strong> about pricing changes.</span>
      </div>
      <button class="pa-reset" @click="reset">Change</button>
    </div>

  </div>
</template>

<style scoped>
/* ── Card shell ──────────────────────────────────────────── */
.price-alert {
  background: var(--mm-s2);
  border: 0.5px solid rgba(212, 168, 67, 0.35);
  border-radius: var(--r-lg);
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Header ──────────────────────────────────────────────── */
.pa-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.pa-icon-wrap {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: var(--r-md);
  background: rgba(212, 168, 67, 0.12);
  border: 0.5px solid rgba(212, 168, 67, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mm-gold);
}
.pa-icon { width: 20px; height: 20px; }
.pa-header-text { flex: 1; }
.pa-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--mm-pearl);
  line-height: 1.3;
}
.pa-sub {
  margin: 0;
  font-size: 13px;
  color: var(--mm-slate);
  line-height: 1.5;
}

/* ── Form ────────────────────────────────────────────────── */
.pa-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Alert type pills */
.pa-type-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pa-type-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--r-full);
  border: 0.5px solid var(--b2);
  background: var(--mm-s1);
  font-size: 13px;
  font-weight: 500;
  color: var(--mm-silver);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}
.pa-type-pill .pill-icon { width: 14px; height: 14px; }
.pa-type-pill:hover:not(:disabled) {
  background: var(--mm-s2);
  border-color: var(--b3);
  color: var(--mm-pearl);
}
.pa-type-pill.active {
  background: rgba(212, 168, 67, 0.12);
  border-color: var(--mm-gold);
  color: var(--mm-gold);
}
.pa-type-pill:disabled { opacity: 0.5; cursor: not-allowed; }

/* Email input row */
.pa-input-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
}
.pa-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}
.input-prefix-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: var(--mm-slate);
  pointer-events: none;
  flex-shrink: 0;
}
.pa-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: var(--mm-s1);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  font-size: 14px;
  color: var(--mm-pearl);
  outline: none;
  transition: border-color 0.15s;
}
.pa-input::placeholder { color: var(--mm-slate); }
.pa-input:focus { border-color: var(--mm-gold); }
.pa-input:disabled { opacity: 0.5; }

.pa-submit {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  background: var(--mm-gold);
  color: #0A0700;
  border: none;
  border-radius: var(--r-md);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, opacity 0.15s;
  flex-shrink: 0;
}
.pa-submit:hover:not(:disabled) { background: #e8bb4a; }
.pa-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.submit-icon { width: 15px; height: 15px; }

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(10,7,0,0.3);
  border-top-color: #0A0700;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Error / privacy */
.pa-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12.5px;
  color: #f87171;
}
.pa-error :deep(svg) { width: 14px; height: 14px; flex-shrink: 0; }

.pa-privacy {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  font-size: 11.5px;
  color: var(--mm-slate);
}
.pa-privacy :deep(svg) { width: 12px; height: 12px; flex-shrink: 0; }

/* ── Success state ───────────────────────────────────────── */
.pa-success {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.pa-success-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  background: rgba(212, 168, 67, 0.1);
  border: 0.5px solid rgba(212, 168, 67, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mm-gold);
  flex-shrink: 0;
}
.pa-success-icon :deep(svg) { width: 18px; height: 18px; }
.pa-success-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pa-success-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--mm-pearl);
}
.pa-success-sub {
  font-size: 13px;
  color: var(--mm-slate);
}
.pa-success-sub strong { color: var(--mm-silver); font-weight: 600; }
.pa-reset {
  background: transparent;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  padding: 6px 12px;
  font-size: 12.5px;
  color: var(--mm-slate);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  white-space: nowrap;
}
.pa-reset:hover { border-color: var(--mm-gold); color: var(--mm-gold); }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 600px) {
  .pa-input-row { flex-direction: column; }
  .pa-submit { width: 100%; justify-content: center; }
}
</style>
