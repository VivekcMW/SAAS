<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <NuxtLink to="/">
            <SaasworldLogo />
          </NuxtLink>
        </div>
        <h2>Welcome Back</h2>
        <p>Sign in to access your SaaSWorld dashboard</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            placeholder="Enter your password"
            required
          />
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.rememberMe" />
            <span class="checkmark"></span>
            Remember me
          </label>
          <a href="#" class="forgot-link">Forgot password?</a>
        </div>

        <button type="submit" class="btn-login" :disabled="isLoading">
          <template v-if="isLoading">
            <UIcon dynamic name="i-heroicons-arrow-path" class="loading-icon" />
            Signing in...
          </template>
          <template v-else>
            Sign In
          </template>
        </button>

        <div class="auth-divider">
          <span>or</span>
        </div>

        <div class="social-login">
          <button type="button" class="btn-social google" @click="signInWithGoogle">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

        <div class="auth-footer">
          <p>Don't have an account? <NuxtLink to="/list-product" class="signup-link">Sign up here</NuxtLink></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

// Form state
const { login } = useAuth();
const isLoading = ref(false);
const errorMessage = ref('');
const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    });

    await navigateTo('/dashboard');
  } catch (error: any) {
    console.error('Login error:', error);
    errorMessage.value = error?.data?.statusMessage || error?.message || 'Login failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const signInWithGoogle = () => {
  errorMessage.value = 'Google sign-in will be connected in a later phase.';
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: var(--spacing-lg);
}

.auth-card {
  background: white;
  border-radius: var(--border-radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-xxl);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.logo {
  margin-bottom: var(--spacing-lg);
}

.auth-header h2 {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.auth-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-group input {
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-gray-300);
  border-radius: 3px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  font-weight: bold;
  top: -2px;
  left: 2px;
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--primary-color-dark);
}

.btn-login {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.btn-login:hover:not(:disabled) {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.auth-error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #fef2f2;
  color: #b91c1c;
}

.auth-divider {
  text-align: center;
  position: relative;
  margin: var(--spacing-md) 0;
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-gray-300);
}

.auth-divider span {
  background: white;
  padding: 0 var(--spacing-md);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background: white;
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-social:hover {
  border-color: var(--color-gray-400);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-footer {
  text-align: center;
  margin-top: var(--spacing-lg);
}

.auth-footer p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.signup-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.signup-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-container {
    padding: var(--spacing-md);
  }
  
  .auth-card {
    padding: var(--spacing-xl);
  }
  
  .form-options {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
}
</style>
