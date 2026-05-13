<template>
  <div class="tfa-panel">
    <div class="tfa-panel__header">
      <h3 class="tfa-panel__title">Two-Factor Authentication</h3>
      <span v-if="isEnabled" class="tfa-badge tfa-badge--on">Enabled</span>
      <span v-else class="tfa-badge tfa-badge--off">Disabled</span>
    </div>
    <p class="tfa-panel__desc">
      Add an extra layer of security to your account by requiring a one-time code
      from an authenticator app (Google Authenticator, Authy, 1Password) at login.
    </p>

    <!-- Current: disabled → show Setup flow -->
    <template v-if="!isEnabled">
      <template v-if="!setupData">
        <button class="tfa-btn tfa-btn--primary" :disabled="loading" @click="startSetup">
          {{ loading ? 'Loading…' : 'Set up 2FA' }}
        </button>
      </template>

      <template v-else>
        <!-- Step 1: scan QR -->
        <div v-if="step === 1" class="tfa-step">
          <p class="tfa-step__label">1. Scan this QR code in your authenticator app</p>
          <div class="tfa-qr-wrap">
            <canvas ref="qrCanvas" class="tfa-qr" />
          </div>
          <details class="tfa-secret">
            <summary>Can't scan? Enter code manually</summary>
            <code class="tfa-secret__code">{{ setupData.secret }}</code>
          </details>
          <button class="tfa-btn tfa-btn--primary" @click="step = 2">Next →</button>
        </div>

        <!-- Step 2: verify -->
        <div v-if="step === 2" class="tfa-step">
          <p class="tfa-step__label">2. Enter the 6-digit code from your app to confirm</p>
          <input
            v-model="verifyCode"
            class="tfa-code-input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            placeholder="000000"
            autofocus
            @keydown.enter="confirmSetup"
          >
          <p v-if="verifyError" class="tfa-error">{{ verifyError }}</p>
          <div class="tfa-step__actions">
            <button class="tfa-btn tfa-btn--ghost" @click="step = 1">← Back</button>
            <button class="tfa-btn tfa-btn--primary" :disabled="verifyCode.length < 6 || confirming" @click="confirmSetup">
              {{ confirming ? 'Verifying…' : 'Enable 2FA' }}
            </button>
          </div>
        </div>
      </template>
    </template>

    <!-- Current: enabled → show backup codes or disable -->
    <template v-else>
      <!-- Show backup codes after setup -->
      <div v-if="backupCodes.length" class="tfa-backup">
        <p class="tfa-backup__intro">
          <strong>Save these backup codes.</strong> Each can be used once if you lose access
          to your authenticator. Store them somewhere safe — they won't be shown again.
        </p>
        <ul class="tfa-backup__list">
          <li v-for="code in backupCodes" :key="code" class="tfa-backup__code">{{ code }}</li>
        </ul>
        <button class="tfa-btn tfa-btn--ghost" @click="backupCodes = []">Done</button>
      </div>

      <!-- Disable flow -->
      <div v-if="disabling">
        <p class="tfa-step__label">Enter your current 6-digit code to disable 2FA</p>
        <input
          v-model="disableCode"
          class="tfa-code-input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          placeholder="000000"
          autofocus
          @keydown.enter="confirmDisable"
        >
        <p v-if="disableError" class="tfa-error">{{ disableError }}</p>
        <div class="tfa-step__actions">
          <button class="tfa-btn tfa-btn--ghost" @click="disabling = false">Cancel</button>
          <button class="tfa-btn tfa-btn--danger" :disabled="disableCode.length < 6 || disabling" @click="confirmDisable">
            Disable 2FA
          </button>
        </div>
      </div>
      <button v-else-if="!backupCodes.length" class="tfa-btn tfa-btn--danger" @click="disabling = true">
        Disable 2FA
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const isEnabled = ref(false)
const loading = ref(false)
const setupData = ref<{ secret: string; uri: string } | null>(null)
const step = ref(1)
const verifyCode = ref('')
const verifyError = ref('')
const confirming = ref(false)
const backupCodes = ref<string[]>([])
const disabling = ref(false)
const disableCode = ref('')
const disableError = ref('')
const qrCanvas = ref<HTMLCanvasElement | null>(null)

// Load current 2FA status
const { data: me } = await useFetch('/api/auth/me')
isEnabled.value = !!(me.value as any)?.twoFactorEnabled

async function startSetup() {
  loading.value = true
  try {
    const data = await $fetch<{ secret: string; uri: string }>('/api/auth/2fa/setup', { method: 'POST' })
    setupData.value = data
    step.value = 1
    await nextTick()
    renderQr(data.uri)
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to start 2FA setup.')
  } finally {
    loading.value = false
  }
}

function renderQr(uri: string) {
  // Use inline QR generation via canvas — lightweight, no dep
  import('qrcode').then(QRCode => {
    if (qrCanvas.value) QRCode.toCanvas(qrCanvas.value, uri, { width: 220, margin: 2 })
  }).catch(() => {
    // qrcode not installed — show text fallback
  })
}

watch(step, async (v) => {
  if (v === 1 && setupData.value) {
    await nextTick()
    renderQr(setupData.value.uri)
  }
})

async function confirmSetup() {
  if (verifyCode.value.length < 6 || confirming.value) return
  confirming.value = true
  verifyError.value = ''
  try {
    const res = await $fetch<{ backupCodes: string[] }>('/api/auth/2fa/verify', {
      method: 'POST',
      body: { code: verifyCode.value }
    })
    isEnabled.value = true
    backupCodes.value = res.backupCodes ?? []
    setupData.value = null
    verifyCode.value = ''
  } catch (err: any) {
    verifyError.value = err?.data?.statusMessage || 'Invalid code. Try again.'
  } finally {
    confirming.value = false
  }
}

async function confirmDisable() {
  if (disableCode.value.length < 6) return
  disableError.value = ''
  try {
    await $fetch('/api/auth/2fa/disable', { method: 'POST', body: { code: disableCode.value } })
    isEnabled.value = false
    disabling.value = false
    disableCode.value = ''
  } catch (err: any) {
    disableError.value = err?.data?.statusMessage || 'Invalid code. Try again.'
  }
}
</script>

<style scoped>
.tfa-panel { background: var(--mm-surface, #1e2433); border: 1px solid var(--mm-border, #2a3347); border-radius: 12px; padding: 1.5rem; max-width: 480px; }
.tfa-panel__header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
.tfa-panel__title { font-size: 1rem; font-weight: 600; color: var(--mm-pearl, #e8eaf0); margin: 0; }
.tfa-panel__desc { color: var(--mm-silver, #8892a4); font-size: 0.875rem; margin: 0 0 1.25rem; }
.tfa-badge { font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 999px; }
.tfa-badge--on { background: #14532d; color: #86efac; }
.tfa-badge--off { background: #3f1f1f; color: #fca5a5; }
.tfa-step { display: flex; flex-direction: column; gap: 1rem; }
.tfa-step__label { color: var(--mm-pearl, #e8eaf0); font-size: 0.875rem; font-weight: 500; }
.tfa-step__actions { display: flex; gap: 0.75rem; }
.tfa-qr-wrap { display: flex; justify-content: flex-start; }
.tfa-qr { border-radius: 8px; }
.tfa-secret { color: var(--mm-silver, #8892a4); font-size: 0.8rem; margin: 0; }
.tfa-secret__code { display: block; margin-top: 0.5rem; font-family: monospace; letter-spacing: 0.1em; color: var(--mm-pearl, #e8eaf0); }
.tfa-code-input { background: var(--mm-bg, #0f1623); border: 1px solid var(--mm-border, #2a3347); color: var(--mm-pearl, #e8eaf0); border-radius: 8px; padding: 0.6rem 1rem; font-size: 1.5rem; letter-spacing: 0.3em; width: 160px; text-align: center; }
.tfa-code-input:focus { outline: none; border-color: var(--mm-accent, #4f8ef7); }
.tfa-error { color: #fca5a5; font-size: 0.8rem; margin: 0; }
.tfa-btn { padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none; }
.tfa-btn--primary { background: var(--mm-accent, #4f8ef7); color: #fff; }
.tfa-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.tfa-btn--ghost { background: transparent; color: var(--mm-silver, #8892a4); border: 1px solid var(--mm-border, #2a3347); }
.tfa-btn--danger { background: #b91c1c; color: #fff; }
.tfa-backup { display: flex; flex-direction: column; gap: 0.75rem; }
.tfa-backup__intro { color: var(--mm-pearl, #e8eaf0); font-size: 0.875rem; margin: 0; }
.tfa-backup__list { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem 1rem; list-style: none; padding: 0; margin: 0; }
.tfa-backup__code { font-family: monospace; font-size: 0.9rem; color: #86efac; letter-spacing: 0.05em; }
</style>
