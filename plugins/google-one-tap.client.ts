/**
 * Google One Tap / Sign In With Google — client-only plugin
 *
 * Shows the One Tap popup automatically for visitors who are not signed in.
 * The popup uses the Google account already signed into the browser, so the
 * user sees "Continue as Name (email@gmail.com)" without typing anything.
 *
 * Behaviour:
 *  - Skipped entirely if GOOGLE_CLIENT_ID is not configured
 *  - Skipped if the user is already authenticated
 *  - Popup is suppressed for 1 hour after the user dismisses it (Google's
 *    built-in exponential cool-down handles further suppression)
 *  - After successful One Tap sign-in, auth state is refreshed and a toast
 *    notification is shown
 */
import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#app'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          prompt: (momentListener?: (notification: OneTapNotification) => void) => void
          cancel: () => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

interface OneTapNotification {
  isNotDisplayed: () => boolean
  isSkippedMoment: () => boolean
  isDismissedMoment: () => boolean
  getNotDisplayedReason: () => string
  getSkippedReason: () => string
  getDismissedReason: () => string
}

interface OneTapCredentialResponse {
  credential: string
}

interface GoogleGisId {
  initialize: (config: Record<string, unknown>) => void
  prompt: (momentListener?: (notification: OneTapNotification) => void) => void
  cancel: () => void
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
}

function gis(): GoogleGisId | undefined {
  return (globalThis as unknown as Window).google?.accounts?.id
}

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gis()) { resolve(); return }
    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  // Server-side: do nothing
  if (!import.meta.client) return

  const config = useRuntimeConfig()
  const clientId = config.public.googleClientId as string | undefined

  // No Google client ID configured → skip
  if (!clientId) return

  const router = useRouter()

  async function handleCredentialResponse(response: OneTapCredentialResponse) {
    try {
      const result = await $fetch<{ success: boolean; user: { firstName: string; email: string } }>(
        '/api/auth/google-one-tap',
        { method: 'POST', body: { credential: response.credential } }
      )

      if (result.success) {
        // Refresh auth state so composables/Navbar reflect the new session
        const { useAuth } = await import('~/composables/useAuth')
        await useAuth().refreshAuth()

        // Redirect to dashboard unless already on a non-public page
        const currentPath = router.currentRoute.value.path
        const publicPaths = ['/', '/marketplace', '/pricing', '/blog', '/news']
        const isPublicPage = publicPaths.some(p => currentPath === p || currentPath.startsWith(`${p}/`))
        if (isPublicPage) {
          await router.push('/dashboard/overview')
        }

        nuxtApp.callHook('one-tap:signed-in' as Parameters<typeof nuxtApp.callHook>[0], {
          name: result.user.firstName,
          email: result.user.email,
        })
      }
    } catch (_e) {
      console.error('[One Tap] sign-in failed:', (e as Error).message)
    }
  }

  async function initOneTap() {
    try {
      await loadGisScript()
    } catch {
      return // Script failed to load — skip silently
    }

    const id = gis()
    if (!id) return

    id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      ux_mode: 'popup',
      auto_select: true,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: true,
    })

    id.prompt((notification: OneTapNotification) => {
      if (notification.isNotDisplayed()) {
        // Reasons: 'opt_out_or_no_session', 'suppressed_by_user', etc. — nothing to do.
      }
    })
  }

  // Wait until auth state is known, then decide whether to show One Tap
  nuxtApp.hook('app:mounted', async () => {
    // Give the auth composable time to initialise (it fetches /api/auth/me)
    await new Promise(resolve => setTimeout(resolve, 500))

    const { useAuth } = await import('~/composables/useAuth')
    const { isAuthenticated, initialized } = useAuth()

    // Poll until auth is initialized (max 3 s)
    let attempts = 0
    while (!initialized.value && attempts < 6) {
      await new Promise(resolve => setTimeout(resolve, 500))
      attempts++
    }

    // Only show One Tap for unauthenticated visitors
    if (!isAuthenticated.value) {
      await initOneTap()
    }
  })

  // Cancel prompt when user logs in elsewhere (e.g. via the modal)
  nuxtApp.hook('auth:logged-in' as Parameters<typeof nuxtApp.hook>[0], () => {
    gis()?.cancel()
  })
})
