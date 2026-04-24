<template>
  <div class="err-page">
    <div class="err-card">
      <NuxtLink to="/" class="err-logo">
        <span class="err-logo__mark">S</span>
        <span class="err-logo__name">SaaSWorld</span>
      </NuxtLink>

      <div class="err-code">{{ error.statusCode }}</div>
      <h1 class="err-title">{{ title }}</h1>
      <p class="err-message">{{ message }}</p>

      <div class="err-actions">
        <button class="err-btn err-btn--primary" @click="handleError">
          {{ error.statusCode === 404 ? 'Go home' : 'Try again' }}
        </button>
        <NuxtLink to="/marketplace" class="err-btn err-btn--ghost">Browse marketplace</NuxtLink>
      </div>

      <p v-if="isDev && error.stack" class="err-stack">{{ error.stack }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ error: { statusCode: number; statusMessage?: string; stack?: string } }>()

const isDev = process.dev

const title = computed(() => {
  switch (props.error.statusCode) {
    case 404: return 'Page not found'
    case 401: return 'Sign in required'
    case 403: return 'Access denied'
    case 429: return 'Too many requests'
    case 500: return 'Something went wrong'
    default: return 'Unexpected error'
  }
})

const message = computed(() => {
  if (props.error.statusMessage) return props.error.statusMessage
  switch (props.error.statusCode) {
    case 404: return "The page you're looking for doesn't exist or has been moved."
    case 401: return 'You need to be signed in to view this page.'
    case 403: return "You don't have permission to access this page."
    case 429: return "You've made too many requests. Please wait a moment and try again."
    case 500: return 'An internal error occurred. Our team has been notified.'
    default: return 'An unexpected error occurred. Please try again.'
  }
})

function handleError() {
  clearError({ redirect: props.error.statusCode === 404 ? '/' : undefined })
}
</script>

<style scoped>
.err-page {
  min-height: 100vh;
  background: var(--bw-bg, #FAFAF7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: var(--font-body, 'Inter', system-ui, sans-serif);
}

.err-card {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border: 1px solid var(--bw-border, #ECEAE3);
  border-radius: var(--bw-radius, 12px);
  padding: 44px 40px;
  text-align: center;
}

.err-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  margin-bottom: 32px;
}
.err-logo__mark {
  width: 32px; height: 32px;
  background: var(--sw-primary, #FF8838);
  color: #fff;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1rem;
}
.err-logo__name { font-weight: 700; font-size: 1.1rem; color: var(--bw-text, #1E1E1E); }

.err-code {
  font-size: 5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--bw-border, #ECEAE3);
  margin-bottom: 8px;
  letter-spacing: -2px;
}

.err-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--bw-text, #1E1E1E);
  margin: 0 0 10px;
}

.err-message {
  font-size: 0.95rem;
  color: var(--bw-text-muted, #6B6B6B);
  line-height: 1.55;
  margin: 0 0 28px;
}

.err-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.err-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 20px;
  border-radius: var(--bw-radius-sm, 8px);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}
.err-btn--primary {
  background: var(--sw-primary, #FF8838);
  color: #fff;
  border-color: var(--sw-primary, #FF8838);
}
.err-btn--primary:hover { background: #e8702a; border-color: #e8702a; }
.err-btn--ghost {
  background: transparent;
  color: var(--bw-text, #1E1E1E);
  border-color: var(--bw-border, #ECEAE3);
}
.err-btn--ghost:hover { background: var(--bw-surface-2, #F6F4EF); }

.err-stack {
  margin-top: 24px;
  text-align: left;
  background: #f8f7f5;
  border: 1px solid var(--bw-border, #ECEAE3);
  border-radius: 6px;
  padding: 12px;
  font-size: 0.72rem;
  font-family: 'JetBrains Mono', monospace;
  color: #6b6b6b;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}
</style>
