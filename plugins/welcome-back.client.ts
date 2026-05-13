/**
 * Welcome-back prompt plugin.
 *
 * On app mount — if the user is NOT authenticated but we have a remembered email
 * from a previous session — show a small bottom-right banner offering to open the
 * sign-in modal pre-filled with that email.
 *
 * We also watch for the user becoming authenticated and store their email so the
 * prompt can appear on their next visit.
 *
 * The prompt is suppressed if Google One Tap is already showing (checked via the
 * `one-tap:signed-in` hook which fires when One Tap succeeds, and via a short
 * window that aligns with One Tap's prompt timeout).
 */

import { ref, watch } from 'vue'

const LS_EMAIL_KEY = 'wb_last_email'

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const { isAuthenticated, currentUser, initialized } = useAuth()
  const { open: openGlobalAuth } = useGlobalAuth()

  // ---------- Store email on auth ----------
  watch(
    () => currentUser.value,
    (user) => {
      if (user?.email) {
        try { localStorage.setItem(LS_EMAIL_KEY, user.email) } catch { /* ignore */ }
      }
    }
  )

  // ---------- Prompt logic ----------
  const shown = ref(false)
  const dismissed = ref(false)
  const lastEmail = ref<string | null>(null)

  // Inject a reactive flag so the component can toggle visibility
  nuxtApp.provide('wbPrompt', {
    shown,
    dismissed,
    lastEmail,
    dismiss: () => { dismissed.value = true },
    signIn: () => {
      dismissed.value = true
      openGlobalAuth('login')
    }
  })

  // Wait for auth to be fully initialized before deciding to show
  const tryShow = () => {
    if (dismissed.value || shown.value) return
    if (isAuthenticated.value) return // already signed in

    try {
      const email = localStorage.getItem(LS_EMAIL_KEY)
      if (!email) return
      lastEmail.value = email
    } catch { return }

    // Give One Tap a 3-second window to auto-sign-in first.
    // If it succeeds, it calls refreshAuth() which sets isAuthenticated.
    setTimeout(() => {
      if (isAuthenticated.value || dismissed.value) return
      shown.value = true
    }, 3500)
  }

  // Suppress prompt if One Tap fires
  nuxtApp.hook('one-tap:signed-in' as Parameters<typeof nuxtApp.hook>[0], () => {
    dismissed.value = true
  })

  nuxtApp.hook('app:mounted', () => {
    if (initialized.value) {
      tryShow()
    } else {
      const stop = watch(initialized, (val) => {
        if (val) { stop(); tryShow() }
      })
    }
  })
})
