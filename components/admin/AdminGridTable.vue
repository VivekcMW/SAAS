<template>
  <div ref="rootEl" class="agt">

    <!-- ─── Toolbar ──────────────────────────────────────────────── -->
    <div class="agt-toolbar">
      <!-- Global search -->
      <div v-if="searchable" class="agt-search">
        <svg class="agt-search__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="bw-input agt-search__input"
          :placeholder="searchPlaceholder ?? 'Search…'"
          @input="currentPage = 1"
        >
        <button v-if="searchQuery" class="agt-clear-btn" title="Clear search" @click="searchQuery = ''; currentPage = 1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Slot for extra toolbar filters (status dropdowns, etc.) -->
      <slot name="toolbar-extra" />

      <div class="agt-toolbar__right">
        <!-- Row density toggle -->
        <div class="agt-density-group" title="Row density">
          <button
            v-for="d in DENSITIES"
            :key="d.val"
            :title="d.label"
            :class="['agt-density-btn', { 'is-active': densityMode === d.val }]"
            @click="densityMode = d.val"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <template v-if="d.val === 'compact'">
                <line x1="3" y1="5" x2="21" y2="5"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="13" x2="21" y2="13"/>
                <line x1="3" y1="17" x2="21" y2="17"/>
              </template>
              <template v-else-if="d.val === 'default'">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </template>
              <template v-else>
                <line x1="3" y1="5" x2="21" y2="5"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="19" x2="21" y2="19"/>
              </template>
            </svg>
          </button>
        </div>

        <!-- Column visibility toggle -->
        <div v-if="hideableColumns.length > 0" ref="colMenuEl" class="agt-col-wrap">
          <button class="bw-btn bw-btn--ghost bw-btn--sm agt-col-btn" @click.stop="showColMenu = !showColMenu">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Columns
          </button>
          <div v-if="showColMenu" class="agt-dropdown" @click.stop>
            <p class="agt-dropdown__title">Toggle columns</p>
            <label v-for="col in hideableColumns" :key="col.key" class="agt-dropdown__item">
              <input v-model="visibleKeys" type="checkbox" :value="col.key" >
              {{ col.label }}
            </label>
          </div>
        </div>

        <!-- Export CSV -->
        <button v-if="exportable" class="bw-btn bw-btn--ghost bw-btn--sm" :title="hiddenColumnsCount > 0 ? `Export visible columns as CSV (${hiddenColumnsCount} column${hiddenColumnsCount > 1 ? 's' : ''} hidden)` : 'Export visible columns as CSV'" @click="exportCSV">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- ─── Bulk action bar (animated) ───────────────────────────── -->
    <Transition name="agt-slide">
      <div v-if="selectable && selectedIds.length > 0" class="agt-bulk-bar">
        <span class="agt-bulk-bar__count">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="margin-right:4px;vertical-align:middle"><polyline points="20 6 9 17 4 12"/></svg>
          {{ selectedIds.length }} row{{ selectedIds.length > 1 ? 's' : '' }} selected
        </span>
        <div class="agt-bulk-bar__actions">
          <slot name="bulk-actions" :selected-rows="selectedRows" :clear-selection="clearSelection">
            <button
              v-for="action in bulkActions"
              :key="action.action"
              :class="['bw-btn', 'bw-btn--sm', `bw-btn--${action.variant ?? 'ghost'}`]"
              @click="$emit('bulk-action', { action: action.action, rows: selectedRows }); clearSelection()"
            >
              {{ action.label }}
            </button>
          </slot>
        </div>
        <button class="bw-btn bw-btn--subtle bw-btn--sm agt-bulk-deselect" @click="clearSelection">
          Deselect all
        </button>
      </div>
    </Transition>

    <!-- ─── Table ─────────────────────────────────────────────────── -->
    <div class="agt-scroll-wrap">

      <!-- Loading skeleton -->
      <template v-if="loading">
        <div class="agt-skeleton">
          <div class="agt-skeleton__header" />
          <div v-for="i in Math.min(currentPageSize, 8)" :key="i" class="agt-skeleton__row">
            <div v-for="col in visibleColumns" :key="col.key" class="agt-skeleton__cell" :style="{ flex: col.width ? '0 0 ' + col.width : '1' }" />
          </div>
        </div>
      </template>

      <table v-else class="agt-table" :class="`agt-table--${densityMode}`">
        <thead class="agt-thead">
          <tr>
            <!-- Select-all checkbox -->
            <th v-if="selectable" class="agt-th agt-th--check">
              <input
                type="checkbox"
                class="agt-checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                @change="toggleAll"
              >
            </th>
            <!-- Column headers -->
            <th
              v-for="col in visibleColumns"
              :key="col.key"
              class="agt-th"
              :class="[
                col.sortable !== false && 'agt-th--sortable',
                sortKey === col.key && 'agt-th--sorted'
              ]"
              :style="col.width ? { width: col.width, minWidth: col.width } : col.minWidth ? { minWidth: col.minWidth } : {}"
              @click="col.sortable !== false ? setSort(col.key) : null"
            >
              <div
                class="agt-th__inner"
                :style="col.align ? { justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' } : {}"
              >
                <span>{{ col.label }}</span>
                <span v-if="col.sortable !== false && col.label" class="agt-sort">
                  <svg
                    class="agt-sort__up"
                    :class="{ 'is-active': sortKey === col.key && sortDir === 'asc' }"
                    width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                  ><polyline points="18 15 12 9 6 15"/></svg>
                  <svg
                    class="agt-sort__dn"
                    :class="{ 'is-active': sortKey === col.key && sortDir === 'desc' }"
                    width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                  ><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- Empty state -->
          <tr v-if="pagedRows.length === 0">
            <td :colspan="visibleColumns.length + (selectable ? 1 : 0)" class="agt-empty-cell">
              <div class="agt-empty">
                <div class="agt-empty__icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </div>
                <div class="agt-empty__title">No results found</div>
                <div class="agt-empty__desc">Try adjusting your search or filters to find what you're looking for.</div>
                <button v-if="hasActiveFilters" class="bw-btn bw-btn--ghost bw-btn--sm" style="margin-top:12px" @click="clearFilters">
                  Clear filters
                </button>
              </div>
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-for="row in pagedRows"
            :key="row[rowKey]"
            class="agt-row"
            :class="{ 'agt-row--selected': selectedIds.includes(row[rowKey]) }"
            @click="$emit('row-click', row)"
          >
            <td v-if="selectable" class="agt-td agt-td--check" @click.stop>
              <input v-model="selectedIds" type="checkbox" class="agt-checkbox" :value="row[rowKey]" >
            </td>
            <td
              v-for="col in visibleColumns"
              :key="col.key"
              class="agt-td"
              :style="col.align ? { textAlign: col.align } : {}"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ─── Footer: count + pagination ───────────────────────────── -->
    <div class="agt-footer">
      <div class="agt-footer__info">
        <template v-if="filteredRows.length === 0">No results</template>
        <template v-else>
          Showing <strong>{{ rangeStart }}–{{ rangeEnd }}</strong> of <strong>{{ filteredRows.length }}</strong> results
          <span v-if="filteredRows.length < rows.length" class="agt-footer__filtered"> (filtered from {{ rows.length }})</span>
        </template>
      </div>

      <div class="agt-footer__pager">
        <label class="agt-footer__label">
          Rows per page
          <select v-model.number="currentPageSize" class="bw-select agt-page-size-sel" @change="currentPage = 1">
            <option v-for="n in PAGE_SIZES" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <div class="agt-pages">
          <button class="bw-btn bw-btn--ghost bw-btn--sm agt-page-btn" :disabled="currentPage === 1" title="First page" @click="currentPage = 1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
          </button>
          <button class="bw-btn bw-btn--ghost bw-btn--sm agt-page-btn" :disabled="currentPage === 1" title="Previous page" @click="currentPage--">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="agt-page-indicator">{{ currentPage }} / {{ totalPages || 1 }}</span>
          <button class="bw-btn bw-btn--ghost bw-btn--sm agt-page-btn" :disabled="currentPage >= totalPages" title="Next page" @click="currentPage++">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="bw-btn bw-btn--ghost bw-btn--sm agt-page-btn" :disabled="currentPage >= totalPages" title="Last page" @click="currentPage = totalPages">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

// ── Types ────────────────────────────────────────────────────────────
export interface GridColumn {
  key: string
  label: string
  sortable?: boolean   // default: true (set false to disable sort)
  hideable?: boolean   // default: true (set false to always show)
  width?: string       // e.g. '140px'
  minWidth?: string    // e.g. '100px'
  align?: 'left' | 'center' | 'right'
}

export interface BulkAction {
  action: string
  label: string
  variant?: 'primary' | 'ghost' | 'subtle' | 'danger'
}

// ── Props ────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  columns: GridColumn[]
  rows: Record<string, any>[]
  rowKey?: string
  searchable?: boolean
  selectable?: boolean
  bulkActions?: BulkAction[]
  exportable?: boolean
  exportFileName?: string
  loading?: boolean
  searchPlaceholder?: string
  initialPageSize?: number
}>(), {
  rowKey: 'id',
  searchable: true,
  selectable: false,
  exportable: false,
  exportFileName: 'export',
  loading: false,
  initialPageSize: 25,
})

// ── Emits ────────────────────────────────────────────────────────────
const _emit = defineEmits<{
  'row-click': [row: Record<string, any>]
  'bulk-action': [payload: { action: string; rows: Record<string, any>[] }]
}>()

// ── Constants ────────────────────────────────────────────────────────
const PAGE_SIZES = [10, 25, 50, 100]
const DENSITIES = [
  { val: 'compact', label: 'Compact' },
  { val: 'default', label: 'Default' },
  { val: 'comfortable', label: 'Comfortable' },
] as const

// ── State ────────────────────────────────────────────────────────────
const searchQuery     = ref('')
const sortKey         = ref('')
const sortDir         = ref<'asc' | 'desc'>('asc')
const currentPage     = ref(1)
const currentPageSize = ref(props.initialPageSize)
const selectedIds     = ref<string[]>([])
const densityMode     = ref<'compact' | 'default' | 'comfortable'>('default')
const showColMenu     = ref(false)
const rootEl          = ref<HTMLElement | null>(null)
const colMenuEl       = ref<HTMLElement | null>(null)

// Start with all hideable columns visible
const visibleKeys = ref<string[]>(
  props.columns.filter(c => c.hideable !== false).map(c => c.key)
)

// ── Computed: columns ─────────────────────────────────────────────────
const hideableColumns = computed(() =>
  props.columns.filter(c => c.hideable !== false && c.label)
)

const visibleColumns = computed(() =>
  props.columns.filter(c =>
    c.hideable === false || visibleKeys.value.includes(c.key)
  )
)

// ── Computed: filtered + sorted rows ─────────────────────────────────
const filteredRows = computed(() => {
  let result = [...props.rows]

  // Global search — checks every value in the row object
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter(row =>
      Object.values(row).some(v =>
        v !== null && v !== undefined && String(v).toLowerCase().includes(q)
      )
    )
  }

  // Sort
  if (sortKey.value) {
    result.sort((a, b) => {
      const av = a[sortKey.value] ?? ''
      const bv = b[sortKey.value] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
        sensitivity: 'base',
      })
      return sortDir.value === 'asc' ? cmp : -cmp
    })
  }

  return result
})

// ── Computed: pagination ──────────────────────────────────────────────
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / currentPageSize.value))
)
const rangeStart = computed(() =>
  filteredRows.value.length === 0 ? 0 : (currentPage.value - 1) * currentPageSize.value + 1
)
const rangeEnd = computed(() =>
  Math.min(currentPage.value * currentPageSize.value, filteredRows.value.length)
)
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * currentPageSize.value
  return filteredRows.value.slice(start, start + currentPageSize.value)
})

// ── Computed: selection ───────────────────────────────────────────────
const allSelected = computed(() =>
  pagedRows.value.length > 0 &&
  pagedRows.value.every(r => selectedIds.value.includes(r[props.rowKey]))
)
const someSelected = computed(() =>
  pagedRows.value.some(r => selectedIds.value.includes(r[props.rowKey])) && !allSelected.value
)
const selectedRows = computed(() =>
  props.rows.filter(r => selectedIds.value.includes(r[props.rowKey]))
)

// ── Computed: misc ────────────────────────────────────────────────────
const hasActiveFilters = computed(() => searchQuery.value.trim() !== '')
const hiddenColumnsCount = computed(() =>
  props.columns.filter(c => c.hideable !== false && c.label && !visibleKeys.value.includes(c.key)).length
)

// ── Methods ───────────────────────────────────────────────────────────
function setSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
  currentPage.value = 1
}

function toggleAll() {
  if (allSelected.value) {
    const pageIds = new Set(pagedRows.value.map(r => r[props.rowKey]))
    selectedIds.value = selectedIds.value.filter(id => !pageIds.has(id))
  } else {
    const pageIds = new Set(pagedRows.value.map(r => r[props.rowKey]))
    selectedIds.value = [...new Set([...selectedIds.value, ...pageIds])]
  }
}

function clearSelection() {
  selectedIds.value = []
}

function clearFilters() {
  searchQuery.value = ''
  currentPage.value = 1
}

function exportCSV() {
  const cols = visibleColumns.value.filter(c => c.label)
  const header = cols.map(c => `"${c.label}"`).join(',')
  const body = filteredRows.value.map(row =>
    cols.map(c => {
      const val = row[c.key] ?? ''
      return `"${String(val).replaceAll('"', '""')}"`
    }).join(',')
  )
  const csv = [header, ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.exportFileName}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Close column dropdown on outside click
function handleDocClick(e: MouseEvent) {
  if (colMenuEl.value && !colMenuEl.value.contains(e.target as Node)) {
    showColMenu.value = false
  }
}

// Reset to page 1 when rows/search changes
watch(() => props.rows.length, () => { currentPage.value = 1 })
watch(searchQuery, () => { currentPage.value = 1 })

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════
   Admin Grid Table — self-contained, builds on bw-* tokens
═══════════════════════════════════════════════════════════════════ */

.agt { display: block; width: 100%; min-width: 0; box-sizing: border-box; }

/* ── Toolbar ──────────────────────────────────────────────────── */
.agt-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.agt-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-wrap: wrap;
}

/* Search */
.agt-search {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 340px;
}
.agt-search__icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--bw-text-subtle, #9A968E);
  pointer-events: none;
}
.agt-search__input {
  padding-left: 34px !important;
  padding-right: 34px !important;
}
.agt-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--bw-text-subtle, #9A968E);
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 4px;
  transition: color .12s;
}
.agt-clear-btn:hover { color: var(--bw-text, #1E1E1E); }

/* Density toggle group */
.agt-density-group {
  display: flex;
  gap: 2px;
  border: 1px solid var(--bw-border-strong, #D9D5CB);
  border-radius: 8px;
  padding: 2px;
  background: var(--bw-surface, #fff);
}
.agt-density-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--bw-text-subtle, #9A968E);
  border-radius: 6px;
  transition: all .12s ease;
}
.agt-density-btn.is-active {
  background: var(--aw-accent-50, #f5f3ff);
  color: var(--aw-accent, #7c3aed);
}
.agt-density-btn:hover:not(.is-active) {
  background: var(--bw-surface-2, #F6F4EF);
  color: var(--bw-text, #1E1E1E);
}

/* Column visibility dropdown */
.agt-col-wrap { position: relative; }
.agt-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 200;
  background: var(--bw-surface, #fff);
  border: 1px solid var(--bw-border, #ECEAE3);
  border-radius: 10px;
  box-shadow: 0 8px 28px -6px rgba(15,23,42,.16);
  min-width: 190px;
  padding: 8px;
  animation: agt-pop .12s ease;
}
@keyframes agt-pop {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
.agt-dropdown__title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--bw-text-subtle, #9A968E);
  padding: 4px 10px 8px;
  margin: 0;
  border-bottom: 1px solid var(--bw-border, #ECEAE3);
}
.agt-dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  font-size: 0.88rem;
  cursor: pointer;
  border-radius: 6px;
  user-select: none;
  color: var(--bw-text, #1E1E1E);
  margin-top: 2px;
}
.agt-dropdown__item:hover { background: var(--bw-surface-2, #F6F4EF); }
.agt-dropdown__item input {
  accent-color: var(--aw-accent, #7c3aed);
  width: 15px;
  height: 15px;
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Bulk action bar ──────────────────────────────────────────── */
.agt-bulk-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: var(--aw-accent-50, #f5f3ff);
  border: 1px solid #ede9fe;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: 0.88rem;
}
.agt-bulk-bar__count {
  font-weight: 700;
  color: var(--aw-accent-text, #5b21b6);
  display: flex;
  align-items: center;
  white-space: nowrap;
}
.agt-bulk-bar__actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.agt-bulk-deselect { margin-left: auto; }

/* Slide transition */
.agt-slide-enter-active, .agt-slide-leave-active { transition: all .18s ease; }
.agt-slide-enter-from, .agt-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── Scroll wrapper ───────────────────────────────────────────── */
.agt-scroll-wrap {
  display: block;
  overflow-x: auto;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid var(--bw-border, #ECEAE3);
  border-radius: var(--bw-radius, 12px) var(--bw-radius, 12px) 0 0;
  background: var(--bw-surface, #fff);
}

/* ── Skeleton loader ──────────────────────────────────────────── */
/* Checkbox — indeterminate visual */
.agt-checkbox:indeterminate {
  accent-color: var(--aw-accent, #7c3aed);
  opacity: 0.7;
}
.agt-skeleton { padding: 0; }
.agt-skeleton__header {
  height: 42px;
  background: var(--bw-surface-2, #F6F4EF);
  border-bottom: 1px solid var(--bw-border, #ECEAE3);
}
.agt-skeleton__row {
  display: flex;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--bw-border, #ECEAE3);
}
.agt-skeleton__row:last-child { border-bottom: none; }
.agt-skeleton__cell {
  height: 14px;
  flex: 1;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--bw-surface-2, #F6F4EF) 25%,
    var(--bw-border, #ECEAE3) 50%,
    var(--bw-surface-2, #F6F4EF) 75%
  );
  background-size: 200% 100%;
  animation: agt-shimmer 1.5s infinite;
}
@keyframes agt-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Table ────────────────────────────────────────────────────── */
.agt-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

/* Sticky header */
.agt-thead { position: sticky; top: 0; z-index: 10; }

/* Density */
.agt-table--compact  .agt-th, .agt-table--compact  .agt-td { padding: 7px 12px; }
.agt-table--default  .agt-th, .agt-table--default  .agt-td { padding: 12px 14px; }
.agt-table--comfortable .agt-th, .agt-table--comfortable .agt-td { padding: 18px 16px; }

/* TH */
.agt-th {
  text-align: left;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--bw-text-subtle, #9A968E);
  font-weight: 600;
  background: var(--bw-surface-2, #F6F4EF);
  border-bottom: 1px solid var(--bw-border, #ECEAE3);
  white-space: nowrap;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
}
.agt-th--check { width: 44px; min-width: 44px; text-align: center; }
.agt-th--sortable { cursor: pointer; }
.agt-th--sortable:hover { color: var(--bw-text, #1E1E1E); background: var(--bw-border, #ECEAE3); }
.agt-th--sorted { color: var(--aw-accent, #7c3aed); }

.agt-th__inner {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
}

/* Sort arrows */
.agt-sort {
  display: inline-flex;
  flex-direction: column;
  gap: 1px;
  opacity: 0.3;
  transition: opacity .12s;
}
.agt-th--sortable:hover .agt-sort { opacity: 0.55; }
.agt-th--sorted .agt-sort { opacity: 1; }
.agt-sort__up, .agt-sort__dn { color: var(--bw-text-subtle, #9A968E); transition: color .12s; display: block; }
.agt-sort__up.is-active { color: var(--aw-accent, #7c3aed); }
.agt-sort__dn.is-active { color: var(--aw-accent, #7c3aed); }

/* TD */
.agt-td {
  vertical-align: middle;
  border-bottom: 1px solid var(--bw-border, #ECEAE3);
  font-size: 0.9rem;
  color: var(--bw-text, #1E1E1E);
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agt-td--check { width: 44px; min-width: 44px; text-align: center; max-width: unset; overflow: visible; }

.agt-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--aw-accent, #7c3aed);
}

/* Rows */
.agt-row { transition: background .1s ease; cursor: default; }
.agt-row:last-child .agt-td { border-bottom: none; }
.agt-row:hover .agt-td { background: var(--bw-surface-2, #F6F4EF); }
.agt-row--selected .agt-td { background: var(--aw-accent-50, #f5f3ff) !important; }

/* Empty state */
.agt-empty-cell {
  text-align: center;
  padding: 56px 20px !important;
  border: none !important;
  background: transparent !important;
}
.agt-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.agt-empty__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  border: 1px solid var(--bw-border, #ECEAE3);
  background: var(--bw-surface-2, #F6F4EF);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--bw-text-subtle, #9A968E);
  margin-bottom: 4px;
}
.agt-empty__title {
  font-family: var(--f-ui);
  font-weight: 700;
  font-size: 1rem;
  color: var(--bw-text, #1E1E1E);
}
.agt-empty__desc {
  font-size: 0.88rem;
  color: var(--bw-text-muted, #6B6B6B);
  max-width: 280px;
  text-align: center;
  line-height: 1.5;
}

/* ── Footer ───────────────────────────────────────────────────── */
.agt-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  margin-top: 0;
  border: 1px solid var(--bw-border, #ECEAE3);
  border-top: none;
  border-radius: 0 0 var(--bw-radius, 12px) var(--bw-radius, 12px);
  background: var(--bw-surface-2, #F6F4EF);
  font-size: 0.82rem;
  color: var(--bw-text-muted, #6B6B6B);
}
.agt-footer__info strong { color: var(--bw-text, #1E1E1E); }
.agt-footer__filtered { color: var(--bw-text-subtle, #9A968E); font-size: 0.82rem; }
.agt-footer__pager { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.agt-footer__label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.82rem;
  color: var(--bw-text-muted, #6B6B6B);
}
.agt-page-size-sel {
  width: auto !important;
  padding: 5px 28px 5px 10px !important;
  height: 32px !important;
  font-size: 0.82rem !important;
  min-width: 60px;
}
.agt-pages { display: flex; align-items: center; gap: 4px; }
.agt-page-btn {
  width: 30px !important;
  height: 30px !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
}
.agt-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.agt-page-indicator {
  font-size: 0.82rem;
  color: var(--bw-text-muted, #6B6B6B);
  white-space: nowrap;
  padding: 0 6px;
  min-width: 52px;
  text-align: center;
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 640px) {
  .agt-toolbar__right { margin-left: 0; }
  .agt-search { max-width: 100%; }
  .agt-footer { flex-direction: column; align-items: flex-start; }
  .agt-bulk-deselect { margin-left: 0; }
}
</style>
