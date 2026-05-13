<template>
  <div class="rp-page">
    <div class="rp-card">
      <NuxtLink to="/" class="rp-logo">
        <span class="rp-logo__mark">S</span>
        <span class="rp-logo__name">Moonmart</span>
      </NuxtLink>

      <!-- Success -->
      <div v-if="success" class="rp-success">
        <div class="rp-success__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h1>Password updated</h1>
        <p>Your password has been changed successfully. You can now sign in with your new password.</p>
        <NuxtLink to="/login" class="rp-btn rp-btn--primary">Go to sign in</NuxtLink>
      </div>

      <!-- Invalid / expired token -->
      <div v-else-if="tokenInvalid" class="rp-error-state">
        <div class="rp-error-state__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h1>Link expired</h1>
        <p>This password reset link is invalid or has already been used. Please request a new one.</p>
        <NuxtLink to="/forgot-password" class="rp-btn rp-btn--primary">Request new link</NuxtLink>
      </div>

      <!-- Form -->
      <div v-else>
        <h1 class="rp-title">Choose a new password</h1>
        <p class="rp-subtitle">Enter a strong password of at least 8 characters.</p>

        <form class="rp-form" @submit.prevent="handleSubmit">
          <div class="rp-field">
            <label for="password">New password</label>
            <div class="rp-field__input-wrap">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                placeholder="At least 8 characters"
                autocomplete="new-password"
                spellcheck="false"
                :disabled="isLoading"
              >
              <button type="button" class="rp-field__toggle" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                <svg v-if="showPassword" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div v-if="form.password" class="rp-strength">
              <div class="rp-strength__bar">
                <div :class="['rp-strength__fill', `is-${strengthLabel}`]" :style="{ width: strengthPct + '%' }" />
              </div>
              <span :class="['rp-strength__label', `is-${strengthLabel}`]">{{ strengthLabel }}</span>
            </div>
          </div>

          <div class="rp-field">
            <label for="confirm">Confirm password</label>
            <input
              id="confirm"
              v-model="form.confirm"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Repeat your new password"
              autocomplete="new-password"
              spellcheck="false"
              :disabled="isLoading"
            >
            <p v-if="form.confirm && form.password !== form.confirm" class="rp-field__hint rp-field__hint--error">Passwords do not match</p>
          </div>

          <p v-if="errorMessage" class="rp-form-error">{{ errorMessage }}</p>

          <button type="submit" class="rp-btn rp-btn--primary rp-btn--full" :disabled="isLoading || form.password !== form.confirm || form.password.length < 8">
            <span v-if="isLoading">Updating…</span>
            <span v-else>Set new password</span>
          </button>
        </form>

        <p class="rp-back"><NuxtLink to="/login">← Back to sign in</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

definePageMeta({ layout: false })
useHead({
  title: 'Reset Password · Moonmart',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)

const form = reactive({ password: '', confirm: '' })
const showPassword = ref(false)
const isLoading = ref(false)
const success = ref(false)
const tokenInvalid = ref(false)
const errorMessage = ref('')

// Password strength
const strengthPct = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score += 25
  if (p.length >= 12) score += 25
  if (/[A-Z]/.test(p)) score += 15
  if (/\d/.test(p)) score += 15
  if (/[^A-Za-z0-9]/.test(p)) score += 20
  return Math.min(score, 100)
})
const strengthLabel = computed(() => {
  const p = strengthPct.value
  if (p < 30) return 'weak'
  if (p < 60) return 'fair'
  if (p < 80) return 'good'
  return 'strong'
})

// Validate token presence on load
if (!token.value) tokenInvalid.value = true

async function handleSubmit() {
  if (!token.value || isLoading.value) return
  if (form.password !== form.confirm) return
  isLoading.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, password: form.password }
    })
    success.value = true
  } catch (err: any) {
    const msg = err?.data?.statusMessage || ''
    if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
      tokenInvalid.value = true
    } else {
      errorMessage.value = msg || 'Something went wrong. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.rp-page {
  min-height: 100vh;
  background: var(--mm-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.rp-card {
  width: 100%;
  max-width: 420px;
  background: var(--mm-s1);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  padding: 36px 32px;
}

.rp-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  margin-bottom: 28px;
}
.rp-logo__mark {
  width: 32px; height: 32px;
  background: var(--mm-gold);
  color: #0A0700;
  border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1rem;
}
.rp-logo__name { font-weight: 700; font-size: 1.1rem; color: var(--mm-pearl); }

.rp-title { font-size: 1.35rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 6px; }
.rp-subtitle { font-size: 0.9rem; color: var(--mm-slate); margin: 0 0 24px; }

.rp-form { display: flex; flex-direction: column; gap: 18px; }

.rp-field { display: flex; flex-direction: column; gap: 5px; }
.rp-field label { font-size: 0.85rem; font-weight: 600; color: var(--mm-silver); }
.rp-field input {
  width: 100%;
  padding: 10px 12px;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-size: 0.9rem;
  font-family: inherit;
  background: var(--mm-s2);
  color: var(--mm-pearl);
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}
.rp-field input:focus { outline: none; border-color: var(--mm-gold); }
.rp-field input:disabled { opacity: 0.6; cursor: not-allowed; }

.rp-field__input-wrap { position: relative; }
.rp-field__input-wrap input { padding-right: 40px; }
.rp-field__toggle {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: transparent; border: 0; cursor: pointer; color: var(--mm-slate); padding: 0;
  display: flex; align-items: center;
}

.rp-strength__bar { flex: 1; height: 4px; background: var(--b1); border-radius: 99px; overflow: hidden; }
.rp-strength__fill { height: 100%; border-radius: 99px; transition: width 0.25s ease, background 0.25s ease; }
.rp-strength__fill.is-weak { background: #ef4444; }
.rp-strength__fill.is-fair { background: #f59e0b; }
.rp-strength__fill.is-good { background: #3b82f6; }
.rp-strength__fill.is-strong { background: #22c55e; }
.rp-strength__label { font-size: 0.72rem; font-weight: 600; text-transform: capitalize; }
.rp-strength__label.is-weak { color: #ef4444; }
.rp-strength__label.is-fair { color: #f59e0b; }
.rp-strength__label.is-good { color: #3b82f6; }
.rp-strength__label.is-strong { color: #22c55e; }

.rp-field__hint { font-size: 0.78rem; margin: 0; }
.rp-field__hint--error { color: #ef4444; }

.rp-form-error {
  background: rgba(220,38,38,0.08);
  border: 0.5px solid rgba(220,38,38,0.3);
  border-radius: var(--r-sm);
  color: #dc2626;
  font-size: 0.85rem;
  padding: 10px 12px;
  margin: 0;
}

.rp-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 42px; padding: 0 20px;
  border-radius: var(--r-sm);
  font-weight: 600; font-size: 0.9rem; font-family: inherit;
  cursor: pointer; text-decoration: none; border: 0.5px solid transparent;
  transition: all 0.15s ease;
}
.rp-btn--primary {
  background: var(--mm-gold);
  color: #0A0700;
  border-color: var(--mm-gold);
}
.rp-btn--primary:hover:not(:disabled) { background: var(--mm-goldl); border-color: var(--mm-goldl); }
.rp-btn--primary:disabled { opacity: 0.55; cursor: not-allowed; }
.rp-btn--full { width: 100%; }

.rp-back { margin: 16px 0 0; text-align: center; font-size: 0.85rem; }
.rp-back a { color: var(--mm-slate); text-decoration: none; }
.rp-back a:hover { color: var(--mm-silver); }

/* Success + error states */
.rp-success, .rp-error-state {
  text-align: center;
  padding: 12px 0;
}
.rp-success__icon, .rp-error-state__icon {
  width: 60px; height: 60px;
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.rp-success__icon { background: var(--mm-sea-soft); color: var(--mm-seal); }
.rp-error-state__icon { background: rgba(220,38,38,0.08); color: #dc2626; }
.rp-success h1, .rp-error-state h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 8px; color: var(--mm-pearl); }
.rp-success p, .rp-error-state p { font-size: 0.9rem; color: var(--mm-silver); margin: 0 0 20px; line-height: 1.5; }
</style>
