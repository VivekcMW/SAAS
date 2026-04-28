/**
 * csrf.client.ts — Auto-attach the CSRF token to every state-changing $fetch call.
 * Runs only on the client (SSR requests don't need CSRF — they share the server process).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const csrfCookie = useCookie<string>('csrf_token')

  const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

  function addCsrfToken(options: Record<string, unknown>) {
    const method = ((options?.method as string) ?? 'GET').toUpperCase()
    if (SAFE_METHODS.has(method)) return

    // Read from reactive cookie first, fall back to document.cookie directly
    const token = csrfCookie.value
      || document.cookie.split('; ').find(r => r.startsWith('csrf_token='))?.split('=')[1]

    if (!token) return

    // Handle Headers instance, plain object, or undefined
    const hdrs = options.headers
    if (hdrs instanceof Headers) {
      hdrs.set('X-CSRF-Token', token)
    } else if (hdrs && typeof hdrs === 'object') {
      (hdrs as Record<string, string>)['X-CSRF-Token'] = token
    } else {
      options.headers = { 'X-CSRF-Token': token }
    }
  }

  const csrfFetch = $fetch.create({
    onRequest({ options }) {
      addCsrfToken(options as unknown as Record<string, unknown>)
    }
  })

  // Patch both globalThis.$fetch AND Nuxt's internal $fetch so all call sites are covered
  globalThis.$fetch = csrfFetch as typeof $fetch
  nuxtApp.provide('fetch', csrfFetch)
})
