<template>
  <div class="auth-page">
    <div class="auth-card">
      <header class="auth-head">
        <NuxtLink to="/" class="auth-logo" aria-label="SaaSWorld home">
          <SaasworldLogo class="logo" />
        </NuxtLink>
        <h1>Create your account</h1>
        <p class="subtitle">Start your 14-day free trial. No credit card required.</p>
      </header>

      <!-- Social signup -->
      <div class="social-row">
        <button
          type="button"
          class="social-btn"
          :disabled="isLoading"
          @click="handleSocial('google')"
        >
          <Icon name="logos:google-icon" class="social-icon" />
          <span>Google</span>
        </button>
        <button
          type="button"
          class="social-btn"
          :disabled="isLoading"
          @click="handleSocial('github')"
        >
          <Icon name="logos:github-icon" class="social-icon" />
          <span>GitHub</span>
        </button>
      </div>

      <div class="divider"><span>or sign up with email</span></div>

      <form class="auth-form" novalidate @submit.prevent="handleSignup">
        <div class="field-row">
          <div class="field">
            <label for="firstName">First name</label>
            <input
              id="firstName"
              v-model.trim="form.firstName"
              type="text"
              autocomplete="given-name"
              placeholder="Jane"
              :disabled="isLoading"
              :aria-invalid="!!fieldErrors.firstName"
              required
              @input="clearFieldError('firstName')"
            />
            <p v-if="fieldErrors.firstName" class="field-error">{{ fieldErrors.firstName }}</p>
          </div>
          <div class="field">
            <label for="lastName">Last name</label>
            <input
              id="lastName"
              v-model.trim="form.lastName"
              type="text"
              autocomplete="family-name"
              placeholder="Doe"
              :disabled="isLoading"
              :aria-invalid="!!fieldErrors.lastName"
              required
              @input="clearFieldError('lastName')"
            />
            <p v-if="fieldErrors.lastName" class="field-error">{{ fieldErrors.lastName }}</p>
          </div>
        </div>

        <div class="field">
          <label for="email">Work email</label>
          <input
            id="email"
            v-model.trim="form.email"
            type="email"
            autocomplete="email"
            placeholder="you@company.com"
            :disabled="isLoading"
            :aria-invalid="!!fieldErrors.email"
            required
            @input="clearFieldError('email')"
          />
          <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <div class="password-wrap">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="At least 8 characters"
              :disabled="isLoading"
              :aria-invalid="!!fieldErrors.password"
              required
              @input="clearFieldError('password')"
            />
            <button
              type="button"
              class="eye-btn"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :disabled="isLoading"
              @click="showPassword = !showPassword"
            >
              <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" />
            </button>
          </div>
          <div v-if="form.password" class="strength">
            <div class="strength-bar">
              <div :class="['strength-fill', strengthClass]" :style="{ width: strengthPercent + '%' }" />
            </div>
            <span :class="['strength-label', strengthClass]">{{ strengthLabel }}</span>
          </div>
          <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
        </div>

        <label class="terms">
          <input v-model="form.termsAgree" type="checkbox" :disabled="isLoading" />
          <span>
            I agree to the
            <NuxtLink to="/terms" target="_blank">Terms</NuxtLink>
            and
            <NuxtLink to="/privacy" target="_blank">Privacy Policy</NuxtLink>.
          </span>
        </label>
        <p v-if="fieldErrors.terms" class="field-error">{{ fieldErrors.terms }}</p>

        <p v-if="errorMessage" class="auth-error" role="alert">
          <Icon name="heroicons:exclamation-triangle" />
          <span>{{ errorMessage }}</span>
        </p>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <Icon v-if="isLoading" name="heroicons:arrow-path" class="spin" />
          <span>{{ isLoading ? 'Creating account…' : 'Create account' }}</span>
        </button>
      </form>

      <p class="alt-link">
        Already have an account?
        <NuxtLink to="/login">Sign in</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watchEffect } from 'vue'

definePageMeta({ layout: false })

useHead({
  title: 'Sign up — SaaSWorld',
  meta: [
    { name: 'description', content: 'Create your SaaSWorld account and start your free trial.' }
  ]
})

const { isAuthenticated, register, isLoading: authLoading } = useAuth()

watchEffect(() => {
  if (!authLoading.value && isAuthenticated.value) {
    navigateTo('/dashboard')
  }
})

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  termsAgree: false
})

type FieldKey = 'firstName' | 'lastName' | 'email' | 'password' | 'terms'
const fieldErrors = reactive<Partial<Record<FieldKey, string>>>({})
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const clearFieldError = (key: FieldKey) => {
  fieldErrors[key] = undefined
  if (errorMessage.value) errorMessage.value = ''
}

const passwordScore = computed(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s += 1
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s += 1
  if (/\d/.test(p)) s += 1
  if (/[^A-Za-z0-9]/.test(p)) s += 1
  return s
})
const strengthPercent = computed(() => passwordScore.value * 25)
const strengthClass = computed(() => {
  const s = passwordScore.value
  if (s <= 1) return 'weak'
  if (s === 2) return 'fair'
  if (s === 3) return 'good'
  return 'strong'
})
const strengthLabel = computed(() => {
  const s = passwordScore.value
  if (s <= 1) return 'Weak'
  if (s === 2) return 'Fair'
  if (s === 3) return 'Good'
  return 'Strong'
})

const validate = () => {
  let ok = true
  ;(['firstName', 'lastName', 'email', 'password', 'terms'] as FieldKey[]).forEach(k => { fieldErrors[k] = undefined })
  if (!form.firstName) { fieldErrors.firstName = 'First name is required'; ok = false }
  if (!form.lastName) { fieldErrors.lastName = 'Last name is required'; ok = false }
  if (!form.email) {
    fieldErrors.email = 'Email is required'; ok = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    fieldErrors.email = 'Enter a valid email address'; ok = false
  }
  if (!form.password) {
    fieldErrors.password = 'Password is required'; ok = false
  } else if (form.password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters'; ok = false
  }
  if (!form.termsAgree) { fieldErrors.terms = 'Please accept the Terms to continue'; ok = false }
  return ok
}

const handleSignup = async () => {
  if (isLoading.value) return
  if (!validate()) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password
    })
    await navigateTo('/dashboard')
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage || error?.message || 'Unable to create your account. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleSocial = (provider: 'google' | 'github') => {
  errorMessage.value = `${provider === 'google' ? 'Google' : 'GitHub'} sign-up is coming soon.`
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: #f8fafc;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06);
}

.auth-head { text-align: center; margin-bottom: 24px; }
.auth-logo { display: inline-flex; margin-bottom: 18px; }
.auth-logo .logo { height: 34px; width: auto; }
.auth-head h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}
.subtitle { margin: 0; font-size: 14px; color: #64748b; }

.social-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}
.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.social-btn:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; }
.social-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.social-btn .social-icon { width: 18px; height: 18px; }

.divider {
  position: relative;
  text-align: center;
  margin: 18px 0;
}
.divider::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 50%;
  height: 0.5px; background: #e5e7eb;
}
.divider span {
  position: relative;
  background: #ffffff;
  padding: 0 10px;
  font-size: 12px;
  color: #94a3b8;
}

.auth-form { display: flex; flex-direction: column; gap: 14px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 500; color: #334155; }
.field input {
  width: 100%;
  padding: 10px 12px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: #0f172a;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.field input::placeholder { color: #94a3b8; }
.field input:focus {
  outline: none;
  border-color: #ff8838;
  box-shadow: 0 0 0 3px rgba(255, 136, 56, 0.15);
}
.field input[aria-invalid="true"] { border-color: #dc2626; }
.field input:disabled { background: #f9fafb; color: #94a3b8; cursor: not-allowed; }
.field-error { margin: 0; font-size: 12px; color: #dc2626; }

.password-wrap { position: relative; }
.password-wrap input { padding-right: 40px; }
.eye-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 0;
  padding: 6px;
  color: #64748b;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
}
.eye-btn:hover:not(:disabled) { color: #0f172a; }
.eye-btn :deep(svg) { width: 18px; height: 18px; }

.strength { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
.strength-bar {
  flex: 1;
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}
.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 200ms ease, background-color 200ms ease;
}
.strength-fill.weak { background: #ef4444; }
.strength-fill.fair { background: #f59e0b; }
.strength-fill.good { background: #3b82f6; }
.strength-fill.strong { background: #10b981; }
.strength-label { font-size: 11px; font-weight: 500; min-width: 42px; text-align: right; }
.strength-label.weak { color: #ef4444; }
.strength-label.fair { color: #f59e0b; }
.strength-label.good { color: #3b82f6; }
.strength-label.strong { color: #10b981; }

.terms {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  line-height: 1.5;
}
.terms input { width: 16px; height: 16px; margin-top: 2px; accent-color: #ff8838; flex-shrink: 0; }
.terms a { color: #ff8838; text-decoration: none; font-weight: 500; }
.terms a:hover { text-decoration: underline; }

.auth-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  border: 0.5px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  font-size: 13px;
}
.auth-error :deep(svg) { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  margin-top: 4px;
  background: #ff8838;
  color: #ffffff;
  border: 0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}
.submit-btn:hover:not(:disabled) { background: #f97316; }
.submit-btn:disabled { background: #fbbf77; cursor: not-allowed; }
.submit-btn :deep(svg) { width: 16px; height: 16px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.alt-link {
  margin: 22px 0 0;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}
.alt-link a {
  color: #ff8838;
  font-weight: 600;
  text-decoration: none;
}
.alt-link a:hover { text-decoration: underline; }

@media (max-width: 480px) {
  .auth-card { padding: 28px 20px; border-radius: 12px; }
  .social-row { grid-template-columns: 1fr; }
  .field-row { grid-template-columns: 1fr; }
}
</style>
