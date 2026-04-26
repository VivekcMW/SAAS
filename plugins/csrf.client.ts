/**
 * csrf.client.ts — Auto-attach the CSRF token to every state-changing $fetch call.
 * Runs only on the client (SSR requests don't need CSRF — they share the server process).
 */
export default defineNuxtPlugin(() => {
  const csrfCookie = useCookie<string>('csrf_token')

  // Patch the global $fetch instance with a request interceptor
  globalThis.$fetch = $fetch.create({
    onRequest({ options }) {
      const method = (options.method ?? 'GET').toString().toUpperCase()
      const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS'])
      if (safeMethods.has(method)) return

      const token = csrfCookie.value
      if (!token) return

      const hdrs = options.headers as Record<string, string> | undefined
      if (hdrs) {
        hdrs['X-CSRF-Token'] = token
      } else {
        options.headers = { 'X-CSRF-Token': token }
      }
    }
  })
})
