/**
 * useFavorites — reactive favorites store backed by /api/user/favorites.
 * Shared across all components via a module-level singleton (state is NOT
 * reset across navigations — call `reset()` on logout).
 */
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

const favoriteIds = ref<Set<string>>(new Set())
const isLoaded = ref(false)
const isLoading = ref(false)

export function useFavorites() {
  const { isAuthenticated } = useAuth()

  async function load() {
    if (!isAuthenticated.value || isLoaded.value || isLoading.value) return
    isLoading.value = true
    try {
      const data = await $fetch<{ favorites: string[] }>('/api/user/favorites')
      favoriteIds.value = new Set(data.favorites)
      isLoaded.value = true
    } catch {
      // Not authenticated or network error — stay empty
    } finally {
      isLoading.value = false
    }
  }

  function isSaved(appId: string) {
    return computed(() => favoriteIds.value.has(appId))
  }

  async function toggle(appId: string) {
    if (!isAuthenticated.value) {
      navigateTo('/login')
      return
    }
    const isFav = favoriteIds.value.has(appId)
    // Optimistic update
    if (isFav) {
      favoriteIds.value.delete(appId)
    } else {
      favoriteIds.value.add(appId)
    }

    try {
      if (isFav) {
        await $fetch('/api/user/favorites', { method: 'DELETE', body: { appId } })
      } else {
        await $fetch('/api/user/favorites', { method: 'POST', body: { appId } })
      }
    } catch (err) {
      // Rollback optimistic update on error
      if (isFav) {
        favoriteIds.value.add(appId)
      } else {
        favoriteIds.value.delete(appId)
      }
      console.error('[useFavorites] toggle failed:', err)
    }
  }

  function reset() {
    favoriteIds.value = new Set()
    isLoaded.value = false
    isLoading.value = false
  }

  const count = computed(() => favoriteIds.value.size)
  const all = computed(() => Array.from(favoriteIds.value))

  return { load, isSaved, toggle, reset, count, all, isLoaded, isLoading }
}
