/**
 * auth.ts — Async Nuxt plugin that initializes auth before any component renders.
 *
 * On the SERVER: awaits refreshAuth() which uses useRequestFetch() to forward the
 * incoming request cookies to /api/auth/me. This means SSR renders with the real
 * currentUser already populated — no flash, no empty state on hard refresh.
 *
 * On the CLIENT: if initialized = true (transferred via Nuxt state payload from SSR),
 * the fetch is skipped entirely. If not initialized (rare edge case), it fetches.
 */
export default defineNuxtPlugin(async () => {
  const { initialized, refreshAuth } = useAuth()
  if (!initialized.value) {
    await refreshAuth()
  }
})
