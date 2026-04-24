<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <div class="forgot-password-form-wrapper">
        <!-- Header -->
        <div class="forgot-password-header">
          <NuxtLink to="/" class="logo-link">
            <SaasworldLogo class="logo" />
          </NuxtLink>
          <h1>Reset your password</h1>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <!-- Success State -->
        <div v-if="emailSent" class="success-state">
          <div class="success-icon">
            <UIcon dynamic name="i-heroicons-check-circle" />
          </div>
          <h2>Check your email</h2>
          <p>We've sent a password reset link to <strong>{{ form.email }}</strong></p>
          <p class="help-text">Didn't receive the email? Check your spam folder or try again.</p>
          
          <div class="success-actions">
            <button @click="resetForm" class="btn-secondary">
              Try different email
            </button>
            <NuxtLink to="/login" class="btn-primary">
              Back to login
            </NuxtLink>
          </div>
        </div>

        <!-- Form State -->
        <div v-else>
          <form @submit.prevent="handleSubmit" class="forgot-password-form">
            <div class="form-group">
              <label for="email">Email address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="Enter your email address"
                :disabled="isLoading"
              />
            </div>

            <button type="submit" class="btn-submit" :disabled="isLoading">
              <span v-if="isLoading">
                <UIcon dynamic name="i-heroicons-arrow-path" class="spinning" />
                Sending...
              </span>
              <span v-else>Send reset link</span>
            </button>

            <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
          </form>

          <div class="back-to-login">
            <NuxtLink to="/login">
              <UIcon dynamic name="i-heroicons-arrow-left" />
              Back to login
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="forgot-password-info">
        <div class="info-content">
          <h2>Need help?</h2>
          <p>If you're having trouble resetting your password, contact our support team.</p>
          
          <div class="help-options">
            <div class="help-item">
              <UIcon dynamic name="i-heroicons-envelope" class="help-icon" />
              <div>
                <h3>Email Support</h3>
                <p>support@saasworld.com</p>
              </div>
            </div>
            <div class="help-item">
              <UIcon dynamic name="i-heroicons-chat-bubble-left-right" class="help-icon" />
              <div>
                <h3>Live Chat</h3>
                <p>Available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// SEO
useHead({
  title: 'Reset Password - SaaSWorld',
  meta: [
    { name: 'description', content: 'Reset your SaaSWorld account password. Enter your email to receive a password reset link.' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

// Form state
const form = reactive({
  email: ''
})

const isLoading = ref(false)
const emailSent = ref(false)
const errorMessage = ref('')

// Handle form submission
const handleSubmit = async () => {
  if (isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: form.email }
    })
    emailSent.value = true
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Reset form to try again
const resetForm = () => {
  emailSent.value = false
  errorMessage.value = ''
  form.email = ''
}
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.forgot-password-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 500px;
}

.forgot-password-form-wrapper {
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.forgot-password-header {
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

.forgot-password-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.forgot-password-header p {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
}

.success-state {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 24px;
}

.success-state h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.success-state p {
  color: #6b7280;
  margin-bottom: 12px;
  line-height: 1.5;
}

.help-text {
  font-size: 0.9rem;
  margin-bottom: 32px !important;
  color: #9ca3af;
  font-style: italic;
}

.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-secondary,
.btn-primary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.btn-primary {
  background: #6366f1;
  color: white;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.btn-primary:hover {
  background: #4f46e5;
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
}

.forgot-password-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
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

.btn-submit {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.btn-submit:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

.btn-submit:disabled {
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

.back-to-login {
  text-align: center;
}

.back-to-login a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 8px 12px;
  border-radius: 6px;
}

.back-to-login a:hover {
  color: #374151;
  background: #f9fafb;
}

.forgot-password-info {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 60px 50px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.forgot-password-info::before {
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
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.info-content > p {
  font-size: 1.1rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.help-options {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.help-icon {
  color: #10b981;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.help-item h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.help-item p {
  opacity: 0.8;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .forgot-password-container {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
  
  .forgot-password-info {
    display: none;
  }
  
  .forgot-password-form-wrapper {
    padding: 40px 30px;
  }
}

@media (max-width: 640px) {
  .forgot-password-page {
    padding: 10px;
  }
  
  .forgot-password-form-wrapper {
    padding: 30px 20px;
  }
  
  .forgot-password-header h1 {
    font-size: 1.75rem;
  }
  
  .success-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
