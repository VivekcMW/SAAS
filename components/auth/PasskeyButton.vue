<template>
  <div class="passkey-wrap">
    <!-- Register a new passkey (shown when authenticated) -->
    <template v-if="mode === 'register'">
      <button
        class="passkey-btn"
        :disabled="loading"
        @click="registerPasskey"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 1L3 5v6c0 5.25 3.75 10.17 9 11.33C17.25 21.17 21 16.25 21 11V5l-9-4z"/>
          <circle cx="12" cy="11" r="2.5"/>
          <path d="M12 13.5V17"/>
        </svg>
        <span>{{ loading ? 'Setting up passkey…' : 'Add a passkey' }}</span>
      </button>
      <p v-if="error" class="passkey-error">{{ error }}</p>
      <p v-if="success" class="passkey-success">Passkey added! You can now sign in with biometrics.</p>
    </template>

    <!-- Sign in with passkey (shown on login form) -->
    <template v-else>
      <button
        class="passkey-btn passkey-btn--login"
        :disabled="loading"
        @click="loginWithPasskey"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 1L3 5v6c0 5.25 3.75 10.17 9 11.33C17.25 21.17 21 16.25 21 11V5l-9-4z"/>
          <circle cx="12" cy="11" r="2.5"/>
          <path d="M12 13.5V17"/>
        </svg>
        <span>{{ loading ? 'Authenticating…' : 'Sign in with passkey' }}</span>
      </button>
      <p v-if="error" class="passkey-error">{{ error }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

const props = defineProps<{
  mode: 'register' | 'login'
  email?: string
}>()

const emit = defineEmits<{
  (e: 'login-success' | 'registered'): void
}>()

const loading = ref(false)
const error = ref('')
const success = ref(false)

const registerPasskey = async () => {
  loading.value = true
  error.value = ''
  success.value = false
  try {
    const options = await $fetch('/api/auth/passkey/register-options', { method: 'POST' })
    const credential = await startRegistration({ optionsJSON: options as any })
    await $fetch('/api/auth/passkey/register-verify', { method: 'POST', body: credential })
    success.value = true
    emit('registered')
  } catch (err: any) {
    if (err?.name === 'NotAllowedError') {
      error.value = 'Passkey registration was cancelled.'
    } else {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to add passkey.'
    }
  } finally {
    loading.value = false
  }
}

const loginWithPasskey = async () => {
  loading.value = true
  error.value = ''
  try {
    const options = await $fetch('/api/auth/passkey/login-options', {
      method: 'POST',
      body: props.email ? { email: props.email } : {}
    })
    const assertion = await startAuthentication({ optionsJSON: options as any })
    await $fetch('/api/auth/passkey/login-verify', { method: 'POST', body: assertion })
    emit('login-success')
    await navigateTo('/dashboard')
  } catch (err: any) {
    if (err?.name === 'NotAllowedError') {
      error.value = 'Passkey sign-in was cancelled.'
    } else {
      error.value = err?.data?.statusMessage || err?.message || 'Passkey sign-in failed.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.passkey-wrap { width: 100%; }

.passkey-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #111827;
  color: #d1d5db;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.passkey-btn:hover:not(:disabled) {
  background: #1a1400;
  border-color: rgba(255, 200, 80, 0.5);
  color: #FFC850;
}

.passkey-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.passkey-btn--login {
  border-color: rgba(255, 200, 80, 0.25);
}

.passkey-error {
  margin: 6px 0 0;
  font-size: 0.8rem;
  color: #ff7875;
  text-align: center;
}

.passkey-success {
  margin: 6px 0 0;
  font-size: 0.8rem;
  color: #52c41a;
  text-align: center;
}
</style>
