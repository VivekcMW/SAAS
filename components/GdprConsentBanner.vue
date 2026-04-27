<template>
  <Transition name="gdpr-slide">
    <div v-if="show" class="gdpr-banner" role="dialog" aria-modal="true" aria-label="Cookie consent">
      <div class="gdpr-inner">
        <div class="gdpr-text">
          <p class="gdpr-title">We use cookies</p>
          <p class="gdpr-body">
            We use essential cookies to make our site work. With your consent we also use analytics cookies
            to improve our service.
            <NuxtLink to="/cookies" class="gdpr-link">Cookie Policy</NuxtLink>
            ·
            <NuxtLink to="/privacy" class="gdpr-link">Privacy Policy</NuxtLink>
          </p>
        </div>
        <div class="gdpr-actions">
          <button class="gdpr-btn gdpr-btn--ghost" @click="acceptEssential">Essential only</button>
          <button class="gdpr-btn gdpr-btn--primary" @click="acceptAll">Accept all</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const CONSENT_KEY = 'mm_consent_v1'

const show = ref(false)

onMounted(() => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) show.value = true
  } catch {
    // localStorage unavailable (SSR or privacy mode)
  }
})

function saveConsent(analytics: boolean) {
  try {
    const payload = { analytics, marketing: false, timestamp: Date.now() }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload))

    // Fire-and-forget — log consent server-side
    $fetch('/api/consent', {
      method: 'POST',
      body: { analytics, marketing: false }
    }).catch(() => {})
  } catch {
    // ignore
  }
  show.value = false
}

function acceptAll() { saveConsent(true) }
function acceptEssential() { saveConsent(false) }
</script>

<style scoped>
.gdpr-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: #fff;
  border-top: 1px solid var(--bw-border, #ECEAE3);
  box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
}
.gdpr-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.gdpr-text { flex: 1; min-width: 260px; }
.gdpr-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--bw-text, #1E1E1E);
  margin: 0 0 4px;
}
.gdpr-body {
  font-size: 0.82rem;
  color: var(--bw-text-muted, #6B6B6B);
  margin: 0;
  line-height: 1.5;
}
.gdpr-link {
  color: var(--sw-primary, #FF8838);
  text-decoration: none;
}
.gdpr-link:hover { text-decoration: underline; }
.gdpr-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.gdpr-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.15s;
}
.gdpr-btn--primary {
  background: var(--sw-primary, #FF8838);
  color: #fff;
  border-color: var(--sw-primary, #FF8838);
}
.gdpr-btn--primary:hover { background: #e8702a; border-color: #e8702a; }
.gdpr-btn--ghost {
  background: transparent;
  color: var(--bw-text, #1E1E1E);
  border-color: var(--bw-border, #ECEAE3);
}
.gdpr-btn--ghost:hover { background: var(--bw-surface-2, #F6F4EF); }

.gdpr-slide-enter-active,
.gdpr-slide-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.gdpr-slide-enter-from,
.gdpr-slide-leave-to { transform: translateY(100%); opacity: 0; }
</style>
