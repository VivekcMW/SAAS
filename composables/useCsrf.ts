/**
 * useCsrf — reads the CSRF token from the `csrf_token` cookie set by the
 * server middleware and returns fetch options that include the `X-CSRF-Token`
 * header.
 *
 * Usage in a component or page:
 *   const { csrfHeaders } = useCsrf()
 *   await $fetch('/api/some-endpoint', { method: 'POST', headers: csrfHeaders.value, body: payload })
 *
 * Or install it globally via a Nuxt plugin that patches $fetch defaults.
 */
import { computed } from 'vue'
import { useCookie } from '#app'

export function useCsrf() {
  const csrfCookie = useCookie<string>('csrf_token')

  const csrfHeaders = computed<Record<string, string>>(() => {
    if (!csrfCookie.value) return {} as Record<string, string>
    return { 'X-CSRF-Token': csrfCookie.value } as Record<string, string>
  })

  return { csrfHeaders, csrfToken: csrfCookie }
}
