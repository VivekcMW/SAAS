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

    // Inject analytics resources now that consent is granted
    if (analytics && typeof document !== 'undefined') {
      const addDnsPrefetch = (href: string) => {
        if (document.querySelector(`link[href="${href}"]`)) return
        const link = document.createElement('link')
        link.rel = 'dns-prefetch'
        link.href = href
        document.head.appendChild(link)
      }
      addDnsPrefetch('//www.google-analytics.com')
      addDnsPrefetch('//www.googletagmanager.com')
    }
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
  background: var(--mm-surface-2);
  border-top: 0.5px solid var(--mm-border-md);
  box-shadow: 0 -4px 24px rgba(0,0,0,0.5);
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
  font-size: var(--t-sm);
  color: var(--mm-pearl);
  margin: 0 0 4px;
}
.gdpr-body {
  font-size: var(--t-sm);
  color: var(--mm-silver);
  margin: 0;
  line-height: 1.5;
}
.gdpr-link {
  color: var(--mm-gold);
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
  border-radius: var(--r-full);
  font-size: var(--t-sm);
  font-weight: 600;
  cursor: pointer;
  border: 0.5px solid transparent;
  font-family: var(--f-ui);
  white-space: nowrap;
  transition: all var(--transition-fast);
}
.gdpr-btn--primary {
  background: var(--mm-gold);
  color: var(--mm-bg);
  border-color: var(--mm-gold);
}
.gdpr-btn--primary:hover { background: var(--mm-goldl); border-color: var(--mm-goldl); }
.gdpr-btn--ghost {
  background: transparent;
  color: var(--mm-silver);
  border-color: var(--mm-border-md);
}
.gdpr-btn--ghost:hover { background: var(--mm-surface-3); color: var(--mm-pearl); }

.gdpr-slide-enter-active,
.gdpr-slide-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.gdpr-slide-enter-from,
.gdpr-slide-leave-to { transform: translateY(100%); opacity: 0; }
</style>
