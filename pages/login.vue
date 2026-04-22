<template>
  <div class="auth-page">
    <div class="auth-card">
      <header class="auth-head">
        <NuxtLink to="/" class="auth-logo" aria-label="SaaSWorld home">
          <SaasworldLogo class="logo" />
        </NuxtLink>
        <h1>Welcome back</h1>
        <p class="subtitle">Sign in to your SaaSWorld account</p>
      </header>

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
          <span class="demo-label">Try a demo account</span>
          <span class="demo-hint">No signup · instant access</span>
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
            <span class="demo-btn__role">{{ d.label }}</span>
            <span class="demo-btn__desc">{{ d.desc }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watchEffect } from 'vue'

definePageMeta({ layout: false })

useHead({
  title: 'Sign in — SaaSWorld',
  meta: [
    { name: 'description', content: 'Sign in to your SaaSWorld account.' }
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
  errorMessage.value = `${provider === 'google' ? 'Google' : 'GitHub'} sign-in is coming soon.`
}

interface DemoAccount {
  role: 'buyer' | 'vendor' | 'admin'
  label: string
  desc: string
  email: string
  password: string
}

const demoAccounts: DemoAccount[] = [
  { role: 'buyer', label: 'Buyer', desc: 'Discover & compare', email: 'buyer@saasworld.com', password: 'buyer123' },
  { role: 'vendor', label: 'Vendor', desc: 'Manage your listings', email: 'demo@saasworld.com', password: 'demo123' },
  { role: 'admin', label: 'Admin', desc: 'Full platform access', email: 'admin@saasworld.com', password: 'admin123' }
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
  background: #f8fafc;
}

.auth-card {
  width: 100%;
  max-width: 420px;
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
.field { display: flex; flex-direction: column; gap: 6px; }
.field-head { display: flex; align-items: center; justify-content: space-between; }
.field label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}
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

.forgot {
  font-size: 12px;
  color: #ff8838;
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
  color: #64748b;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
}
.eye-btn:hover:not(:disabled) { color: #0f172a; }
.eye-btn :deep(svg) { width: 18px; height: 18px; }

.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  user-select: none;
}
.remember input { width: 16px; height: 16px; accent-color: #ff8838; }

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

/* Demo box */
.demo-box {
  margin-top: 20px;
  padding: 14px 14px 12px;
  background: #fff8f1;
  border: 0.5px solid #ffd9b5;
  border-radius: 10px;
}
.demo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.demo-label {
  font-size: 12px;
  font-weight: 700;
  color: #ff8838;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.demo-hint { font-size: 11px; color: #94a3b8; }
.demo-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.demo-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 9px 10px;
  background: #fff;
  border: 0.5px solid #ffd9b5;
  border-radius: 8px;
  font-family: inherit;
  cursor: pointer;
  transition: all 150ms ease;
  text-align: left;
}
.demo-btn:hover:not(:disabled) {
  border-color: #ff8838;
  background: #fff;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -10px rgba(255, 136, 56, 0.5);
}
.demo-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.demo-btn__role {
  font-size: 13px;
  font-weight: 600;
  color: #1e1e1e;
}
.demo-btn__desc { font-size: 11px; color: #71717a; }

@media (max-width: 480px) {
  .auth-card { padding: 28px 20px; border-radius: 12px; }
  .social-row { grid-template-columns: 1fr; }
}
</style>
