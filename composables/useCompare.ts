/**
 * useCompare — shared reactive state for the app comparison feature.
 * Synced across the marketplace and buyer dashboard via module-level state.
 * Persisted to localStorage so state survives page refreshes.
 * URL-shareable: reads/writes ?compare=id1,id2 query param on comparison pages.
 *
 * Usage:
 *   const { compareIds, addToCompare, removeFromCompare, toggleCompare, isInCompare, clearCompare } = useCompare()
 */
import { ref, computed, watch } from 'vue'

const MAX_COMPARE = 4
const LS_KEY = 'saasworld:compare'
const URL_PARAM = 'compare'

// Module-level so state is shared across all component instances
const _ids = ref<string[]>([])
let _hydrated = false

function _loadFromStorage(): string[] {
  if (globalThis.window === undefined) return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string').slice(0, MAX_COMPARE) : []
  } catch {
    return []
  }
}

function _saveToStorage(ids: string[]) {
  if (globalThis.window === undefined) return
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids))
  } catch { /* ignore */ }
}

/** Read compare IDs from the current URL ?compare=id1,id2 param */
function _loadFromUrl(): string[] {
  if (globalThis.window === undefined) return []
  const params = new URLSearchParams(globalThis.location.search)
  const raw = params.get(URL_PARAM)
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, MAX_COMPARE)
}

/** Write current compare IDs to the URL without causing navigation */
function _syncToUrl(ids: string[]) {
  if (globalThis.window === undefined) return
  try {
    const url = new URL(globalThis.location.href)
    if (ids.length > 0) {
      url.searchParams.set(URL_PARAM, ids.join(','))
    } else {
      url.searchParams.delete(URL_PARAM)
    }
    globalThis.history.replaceState({}, '', url.toString())
  } catch { /* ignore */ }
}

export function useCompare() {
  // Hydrate from URL params first (shareable link), then localStorage
  if (!_hydrated && globalThis.window !== undefined) {
    const fromUrl = _loadFromUrl()
    _ids.value = fromUrl.length > 0 ? fromUrl : _loadFromStorage()
    _hydrated = true
  }

  // Auto-sync to localStorage + URL on any change
  watch(_ids, (ids) => {
    _saveToStorage(ids)
    _syncToUrl(ids)
  }, { deep: true })

  const compareIds = computed(() => _ids.value)

  function addToCompare(id: string) {
    if (_ids.value.includes(id)) return
    if (_ids.value.length >= MAX_COMPARE) {
      console.warn(`[useCompare] Max ${MAX_COMPARE} apps can be compared at once.`)
      return
    }
    _ids.value = [..._ids.value, id]
  }

  function removeFromCompare(id: string) {
    _ids.value = _ids.value.filter(i => i !== id)
  }

  function toggleCompare(id: string) {
    if (_ids.value.includes(id)) {
      removeFromCompare(id)
    } else {
      addToCompare(id)
    }
  }

  function isInCompare(id: string) {
    return _ids.value.includes(id)
  }

  function clearCompare() {
    _ids.value = []
  }

  /**
   * Generate a shareable URL for the current compare selection.
   * e.g. https://moonmart.ai/marketplace/compare?compare=id1,id2,id3
   */
  function getShareUrl(basePath = '/marketplace/compare'): string {
    if (globalThis.window === undefined) return basePath
    const url = new URL(basePath, globalThis.location.origin)
    if (_ids.value.length > 0) url.searchParams.set(URL_PARAM, _ids.value.join(','))
    return url.toString()
  }

  const compareCount = computed(() => _ids.value.length)
  const canAddMore = computed(() => _ids.value.length < MAX_COMPARE)
  const canCompare = computed(() => _ids.value.length >= 2)

  return {
    compareIds,
    compareCount,
    canAddMore,
    canCompare,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    isInCompare,
    clearCompare,
    getShareUrl,
  }
}
