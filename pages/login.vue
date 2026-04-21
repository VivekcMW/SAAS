<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-form-wrapper">
        <!-- Login Header -->
        <div class="login-header">
          <NuxtLink to="/" class="logo-link">
            <SaasworldLogo class="logo" />
          </NuxtLink>
          <h1>Welcome back</h1>
          <p>Sign in to your SaaSWorld account</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              placeholder="Enter your email"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Enter your password"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :disabled="isLoading"
              >
                <UIcon dynamic :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" />
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-wrapper">
              <input type="checkbox" v-model="form.rememberMe" :disabled="isLoading">
              <span class="checkmark"></span>
              Remember me
            </label>
            <NuxtLink to="/forgot-password" class="forgot-link">
              Forgot password?
            </NuxtLink>
          </div>

          <button type="submit" class="btn-login" :disabled="isLoading">
            <span v-if="isLoading">
              <UIcon dynamic name="i-heroicons-arrow-path" class="spinning" />
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <!-- Social Login -->
          <div class="social-login">
            <button type="button" class="social-btn google" @click="handleSocialLogin('google')" :disabled="isLoading">
              <UIcon dynamic name="i-logos-google-icon" />
              Continue with Google
            </button>
            <button type="button" class="social-btn github" @click="handleSocialLogin('github')" :disabled="isLoading">
              <UIcon dynamic name="i-logos-github-icon" />
              Continue with GitHub
            </button>
          </div>
        </form>

        <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

        <!-- Sign up link -->
        <div class="signup-link">
          <p>Don't have an account? <NuxtLink to="/signup">Sign up</NuxtLink></p>
        </div>
      </div>

      <!-- Login Illustration/Info -->
      <div class="login-info">
        <div class="info-content">
          <h2>Join thousands of businesses</h2>
          <p>Discover, compare, and integrate the best SaaS tools for your business needs.</p>
          
          <div class="features-list">
            <div class="feature-item">
              <UIcon dynamic name="i-heroicons-check-circle" class="check-icon" />
              <span>Access to 1000+ verified SaaS tools</span>
            </div>
            <div class="feature-item">
              <UIcon dynamic name="i-heroicons-check-circle" class="check-icon" />
              <span>Detailed analytics and insights</span>
            </div>
            <div class="feature-item">
              <UIcon dynamic name="i-heroicons-check-circle" class="check-icon" />
              <span>Seamless integrations</span>
            </div>
            <div class="feature-item">
              <UIcon dynamic name="i-heroicons-check-circle" class="check-icon" />
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watchEffect } from 'vue'

// Use auth composable
const { isAuthenticated, login, isLoading: authLoading } = useAuth()

// SEO
useHead({
  title: 'Login - SaaSWorld',
  meta: [
    { name: 'description', content: 'Sign in to your SaaSWorld account to access thousands of verified SaaS tools, analytics, and integrations.' },
    { name: 'keywords', content: 'login, sign in, SaaSWorld, SaaS tools, business software' }
  ]
})

// Redirect if already authenticated (only after auth loading is complete)
watchEffect(() => {
  if (!authLoading.value && isAuthenticated.value) {
    console.log('User is authenticated, redirecting to dashboard...')
    navigateTo('/dashboard')
  }
})

// Form state
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

// Handle form submission
const handleLogin = async () => {
  if (isLoading.value) return

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
    console.error('Login error:', error)
    errorMessage.value = error?.data?.statusMessage || error?.message || 'Unable to sign in. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Handle social login
const handleSocialLogin = async (provider: string) => {
  errorMessage.value = `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in will be connected in a later phase.`
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  width: 100%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 600px;
}

.login-form-wrapper {
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-link {
  display: inline-block;
  margin-bottom: 20px;
}

.logo {
  height: 40px;
  width: auto;
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.login-header p {
  color: #6b7280;
  font-size: 1rem;
}

.login-form {
  flex: 1;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #111827;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  color: #374151;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  color: #9ca3af;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover:not(:disabled) {
  color: #374151;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6b7280;
}

.checkbox-wrapper input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.forgot-link {
  color: #6366f1;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 14px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.btn-login:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

.btn-login:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.divider {
  text-align: center;
  position: relative;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  background: white;
  padding: 0 16px;
  color: #6b7280;
  font-size: 0.9rem;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.social-btn {
  width: 100%;
  padding: 12px 24px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.social-btn:hover:not(:disabled) {
  border-color: #d1d5db;
  background: #f9fafb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.social-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.auth-error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.95rem;
}

.signup-link {
  text-align: center;
  margin-top: auto;
}

.signup-link p {
  color: #6b7280;
  font-size: 0.9rem;
}

.signup-link a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}

.login-info {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 60px 50px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-info::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.info-content {
  position: relative;
  z-index: 1;
}

.info-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.info-content > p {
  font-size: 1.1rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1rem;
}

.check-icon {
  color: #10b981;
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
  
  .login-info {
    display: none;
  }
  
  .login-form-wrapper {
    padding: 40px 30px;
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 10px;
  }
  
  .login-form-wrapper {
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 1.75rem;
  }
  
  .social-login {
    flex-direction: column;
  }
}
</style>
