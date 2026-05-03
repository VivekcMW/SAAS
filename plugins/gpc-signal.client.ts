/**
 * Plugin: gpc-signal.client.ts
 * Detects the Global Privacy Control (GPC) signal (navigator.globalPrivacyControl === true)
 * and sends a privacy opt-out request to the server, then sets a local cookie.
 * Spec: https://globalprivacycontrol.org/
 */
export default defineNuxtPlugin(() => {
  // Only run in a browser context
  if (typeof navigator === 'undefined') return

  // Check GPC signal — cast to any since it's not in standard TS types yet
  const hasGPC = (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  if (!hasGPC) return

  // Check if we already processed this session
  const OPT_OUT_COOKIE = 'privacy_opt_out'
  if (document.cookie.split(';').some(c => c.trim().startsWith(`${OPT_OUT_COOKIE}=1`))) return

  // Set cookie client-side immediately so the flag is available right away
  document.cookie = `${OPT_OUT_COOKIE}=1; max-age=31536000; path=/; SameSite=Strict`

  // Notify the server (best effort, non-blocking)
  $fetch('/api/user/privacy-opt-out', {
    method: 'POST',
    body: { signal: 'GPC' },
  }).catch(() => {
    // Non-critical — server may be unavailable
  })
})
