/**
 * useCompare — shared reactive state for the app comparison feature.
 * Synced across the marketplace and buyer dashboard via module-level state.
 *
 * Usage:
 *   const { compareIds, addToCompare, removeFromCompare, toggleCompare, isInCompare, clearCompare } = useCompare()
 */
import { ref, computed } from 'vue'

const MAX_COMPARE = 4

// Module-level so state is shared across all component instances
const _ids = ref<string[]>([])

export function useCompare() {
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
  }
}
