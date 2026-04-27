<template>
  <div class="auth-page">
    <div class="auth-card">
      <header class="auth-head">
        <NuxtLink to="/" class="auth-logo" aria-label="Moonmart home">
          <SaasworldLogo class="logo" />
        </NuxtLink>
        <h1>Welcome back</h1>
        <p class="subtitle">Sign in to your Moonmart account</p>
      </header>

      <!-- Email verified banner -->
      <div v-if="route.query.verified === '1'" class="verified-banner" role="status">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Email verified! You can now sign in.
      </div>

      <!-- Social login -->
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

      <div class="divider"><span>or continue with email</span></div>

      <form class="auth-form" novalidate @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">Email</label>
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
          <div class="field-head">
            <label for="password">Password</label>
            <NuxtLink to="/forgot-password" class="forgot">Forgot?</NuxtLink>
          </div>
          <div class="password-wrap">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Your password"
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
          <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
        </div>

        <label class="remember">
          <input v-model="form.rememberMe" type="checkbox" :disabled="isLoading" />
          <span>Remember me for 30 days</span>
        </label>

        <p v-if="errorMessage" class="auth-error" role="alert">
          <Icon name="heroicons:exclamation-triangle" />
          <span>{{ errorMessage }}</span>
        </p>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <Icon v-if="isLoading" name="heroicons:arrow-path" class="spin" />
          <span>{{ isLoading ? 'Signing in…' : 'Sign in' }}</span>
        </button>
      </form>

      <p class="alt-link">
        Don't have an account?
        <NuxtLink to="/signup">Create one</NuxtLink>
      </p>

      <!-- Try demo -->
      <div class="demo-box">
        <div class="demo-head">
          <span class="demo-label">Demo accounts</span>
          <span class="demo-hint">Click to sign in instantly</span>
        </div>
        <div class="demo-row">
          <button
            v-for="d in demoAccounts"
            :key="d.role"
            type="button"
            class="demo-btn"
            :disabled="isLoading"
            @click="tryDemo(d)"
          >
            <div class="demo-btn__top">
              <span class="demo-btn__role">{{ d.label }}</span>
              <span class="demo-btn__badge">{{ d.desc }}</span>
            </div>
            <div class="demo-btn__creds">
              <span class="demo-btn__cred">
                <Icon name="heroicons:envelope" />
                <code>{{ d.email }}</code>
              </span>
              <span class="demo-btn__cred">
                <Icon name="heroicons:key" />
                <code>{{ d.password }}</code>
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watchEffect } from 'vue'

definePageMeta({ layout: false })

const route = useRoute()

useHead({
  title: 'Sign in — Moonmart',
  meta: [
    { name: 'description', content: 'Sign in to your Moonmart account.' }
  ]
})

const { isAuthenticated, login, isLoading: authLoading } = useAuth()

watchEffect(() => {
  if (!authLoading.value && isAuthenticated.value) {
    navigateTo('/dashboard')
  }
})

const form = reactive({
  email: '',
  password: '',
  rememberMe: true
})

const fieldErrors = reactive<{ email?: string; password?: string }>({})
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const clearFieldError = (key: 'email' | 'password') => {
  fieldErrors[key] = undefined
  if (errorMessage.value) errorMessage.value = ''
}

const validate = () => {
  let ok = true
  fieldErrors.email = undefined
  fieldErrors.password = undefined
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  if (!form.email) { fieldErrors.email = 'Email is required'; ok = false }
  else if (!emailOk) { fieldErrors.email = 'Enter a valid email address'; ok = false }
  if (!form.password) { fieldErrors.password = 'Password is required'; ok = false }
  return ok
}

const handleLogin = async () => {
  if (isLoading.value) return
  if (!validate()) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    await login({
      email: form.email,
      password: form.password,
      rememberMe: form.rememberMe
    })
    await navigateTo('/dashboard')
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage || error?.message || 'Unable to sign in. Please check your credentials.'
  } finally {
    isLoading.value = false
  }
}

const handleSocial = (provider: 'google' | 'github') => {
  // Redirect to server-side OAuth handler
  window.location.href = `/api/auth/oauth/${provider}`
}

interface DemoAccount {
  role: 'buyer' | 'vendor' | 'admin'
  label: string
  desc: string
  email: string
  password: string
}

const demoAccounts: DemoAccount[] = [
  { role: 'buyer', label: 'Buyer', desc: 'Discover & compare', email: 'buyer@moonmart.ai', password: 'buyer123' },
  { role: 'vendor', label: 'Vendor', desc: 'Manage your listings', email: 'demo@moonmart.ai', password: 'demo123' },
  { role: 'admin', label: 'Admin', desc: 'Full platform access', email: 'admin@moonmart.ai', password: 'admin123' }
]

const tryDemo = async (d: DemoAccount) => {
  if (isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    await login({ email: d.email, password: d.password, rememberMe: true })
    await navigateTo('/dashboard')
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage || error?.message || 'Unable to start demo session.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--mm-bg);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--mm-s1);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  padding: 36px 32px;
  box-shadow: var(--shadow-lg);
}

.auth-head { text-align: center; margin-bottom: 24px; }

.verified-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--mm-sea-soft);
  border: 0.5px solid var(--mm-sea);
  border-radius: var(--r-sm);
  color: var(--mm-seal);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 10px 14px;
  margin-bottom: 20px;
}
.auth-logo { display: inline-flex; margin-bottom: 18px; }
.auth-logo .logo { height: 34px; width: auto; }
.auth-head h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: var(--mm-pearl);
  letter-spacing: -0.01em;
}
.subtitle { margin: 0; font-size: 14px; color: var(--mm-slate); }

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
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--mm-silver);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.social-btn:hover:not(:disabled) { background: var(--mm-s3); border-color: var(--b3); }
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
  height: 0.5px; background: var(--b2);
}
.divider span {
  position: relative;
  background: var(--mm-s1);
  padding: 0 10px;
  font-size: 12px;
  color: var(--mm-slate);
}

.auth-form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-head { display: flex; align-items: center; justify-content: space-between; }
.field label {
  font-size: 13px;
  font-weight: 500;
  color: var(--mm-silver);
}
.field input {
  width: 100%;
  padding: 10px 12px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-family: inherit;
  font-size: 14px;
  color: var(--mm-pearl);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.field input::placeholder { color: var(--mm-slate); }
.field input:focus {
  outline: none;
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 3px var(--mm-gold-soft);
}
.field input[aria-invalid="true"] { border-color: #dc2626; }
.field input:disabled { background: var(--mm-s3); color: var(--mm-slate); cursor: not-allowed; }
.field-error { margin: 0; font-size: 12px; color: #dc2626; }

.forgot {
  font-size: 12px;
  color: var(--mm-gold);
  text-decoration: none;
  font-weight: 500;
}
.forgot:hover { text-decoration: underline; }

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
  color: var(--mm-slate);
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
}
.eye-btn:hover:not(:disabled) { color: var(--mm-pearl); }
.eye-btn :deep(svg) { width: 18px; height: 18px; }

.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--mm-silver);
  cursor: pointer;
  user-select: none;
}
.remember input { width: 16px; height: 16px; accent-color: var(--mm-gold); }

.auth-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  border: 0.5px solid rgba(220, 38, 38, 0.4);
  background: rgba(220, 38, 38, 0.08);
  color: #fca5a5;
  border-radius: var(--r-sm);
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
  background: var(--mm-gold);
  color: #0A0700;
  border: 0;
  border-radius: var(--r-sm);
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}
.submit-btn:hover:not(:disabled) { background: var(--mm-goldl); }
.submit-btn:disabled { background: var(--mm-s3); color: var(--mm-slate); cursor: not-allowed; }
.submit-btn :deep(svg) { width: 16px; height: 16px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.alt-link {
  margin: 22px 0 0;
  text-align: center;
  font-size: 14px;
  color: var(--mm-slate);
}
.alt-link a {
  color: var(--mm-gold);
  font-weight: 600;
  text-decoration: none;
}
.alt-link a:hover { text-decoration: underline; }

.demo-box {
  margin-top: 20px;
  padding: 14px 14px 12px;
  background: var(--mm-gold-soft);
  border: 0.5px solid var(--mm-gold);
  border-radius: var(--r-md);
}
.demo-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--mm-gold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.demo-hint { font-size: 11px; color: var(--mm-slate); }
.demo-btn {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  padding: 10px 12px;
  background: var(--mm-s3);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-family: inherit;
  cursor: pointer;
  transition: all 150ms ease;
  text-align: left;
}
.demo-btn:hover:not(:disabled) {
  border-color: var(--mm-gold);
  background: var(--mm-s3);
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -10px var(--mm-gold-soft);
}
.demo-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.demo-btn__role {
  font-size: 13px;
  font-weight: 600;
  color: var(--mm-pearl);
}
.demo-btn__badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--mm-gold);
  background: var(--mm-gold-soft);
  padding: 2px 6px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.demo-btn__cred {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: var(--mm-silver);
}
.demo-btn__cred :deep(svg) { width: 12px; height: 12px; color: var(--mm-slate); }
.demo-btn__cred code {
  font-family: var(--f-mon);
  font-size: 11.5px;
  color: var(--mm-pearl);
  background: transparent;
  padding: 0;
}

@media (max-width: 480px) {
  .auth-card { padding: 28px 20px; border-radius: 12px; }
  .social-row { grid-template-columns: 1fr; }
}
</style>
