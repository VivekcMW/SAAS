<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'

interface Section {
  id: string
  label: string
  short?: string
}

interface Props {
  sections: Section[]
  /** Additional top offset on top of the measured site header when scrolling into sections */
  offset?: number
  /** Height of the fixed site header. If 0, it will be measured from <header> on mount. */
  headerHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  offset: 12,
  headerHeight: 0
})

const activeId = ref<string>(props.sections[0]?.id ?? '')
const isSticky = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const measuredHeader = ref(0)
const navHeight = ref(48)
const mobileSelect = ref<HTMLSelectElement>()

const scrollerRef = ref<HTMLElement>()
const navRef = ref<HTMLElement>()
const sentinelRef = ref<HTMLElement>()
const itemRefs = ref<HTMLButtonElement[]>([])

let observer: IntersectionObserver | null = null
let stickyObserver: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let hashSyncTimer: ReturnType<typeof setTimeout> | undefined

const effectiveHeader = computed(() => props.headerHeight || measuredHeader.value)
const _totalTopOffset = computed(() => effectiveHeader.value + navHeight.value + props.offset)

const prefersReducedMotion = () =>
  globalThis.window !== undefined
  && globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const syncHash = (id: string) => {
  if (globalThis.window === undefined) return
  globalThis.clearTimeout(hashSyncTimer)
  hashSyncTimer = globalThis.setTimeout(() => {
    if (globalThis.location.hash.slice(1) !== id) {
      history.replaceState(null, '', `#${id}`)
    }
  }, 150)
}

const focusSection = (el: HTMLElement) => {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

const scrollToSection = (id: string, moveFocus = true) => {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + globalThis.scrollY - effectiveHeader.value - navHeight.value - props.offset
  globalThis.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  activeId.value = id
  syncHash(id)
  if (moveFocus) {
    globalThis.setTimeout(() => focusSection(el), prefersReducedMotion() ? 0 : 400)
  }
}

const updateOverflowState = () => {
  const el = scrollerRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 2
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}

const scrollTabs = (dir: 1 | -1) => {
  const el = scrollerRef.value
  if (!el) return
  el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

const focusItem = (index: number) => {
  const items = itemRefs.value
  if (!items.length) return
  const safe = (index + items.length) % items.length
  items[safe]?.focus()
  items[safe]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' })
}

const onKeydown = (e: KeyboardEvent, index: number) => {
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault()
      focusItem(index + 1)
      break
    case 'ArrowLeft':
      e.preventDefault()
      focusItem(index - 1)
      break
    case 'Home':
      e.preventDefault()
      focusItem(0)
      break
    case 'End':
      e.preventDefault()
      focusItem(itemRefs.value.length - 1)
      break
    default:
      break
  }
}

const onMobileChange = (e: Event) => {
  const id = (e.target as HTMLSelectElement).value
  if (id) scrollToSection(id)
}

const measureHeader = () => {
  const h = document.querySelector('header')
  if (h) measuredHeader.value = Math.round(h.getBoundingClientRect().height)
}

const measureNav = () => {
  if (navRef.value) navHeight.value = Math.round(navRef.value.getBoundingClientRect().height)
}

onMounted(async () => {
  await nextTick()
  measureHeader()
  measureNav()

  // Scroll-spy
  const els = props.sections
    .map(s => document.getElementById(s.id))
    .filter((el): el is HTMLElement => !!el)

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter(e => e.isIntersecting)
      if (visible.length > 0) {
        const top = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        )
        activeId.value = top.target.id
        syncHash(top.target.id)
      }
    },
    {
      rootMargin: `-${effectiveHeader.value + navHeight.value + 16}px 0px -60% 0px`,
      threshold: 0
    }
  )
  els.forEach(el => observer?.observe(el))

  // Sticky detection
  if (sentinelRef.value) {
    stickyObserver = new IntersectionObserver(
      ([e]) => { isSticky.value = !e.isIntersecting },
      { threshold: 0 }
    )
    stickyObserver.observe(sentinelRef.value)
  }

  // Overflow state
  updateOverflowState()
  scrollerRef.value?.addEventListener('scroll', updateOverflowState, { passive: true })
  globalThis.addEventListener('resize', updateOverflowState)

  // Re-measure header on resize
  resizeObserver = new ResizeObserver(() => {
    measureHeader()
    measureNav()
  })
  const header = document.querySelector('header')
  if (header) resizeObserver.observe(header)
  if (navRef.value) resizeObserver.observe(navRef.value)

  // Initial hash → scroll
  if (globalThis.location.hash) {
    const id = globalThis.location.hash.slice(1)
    if (props.sections.some(s => s.id === id)) {
      globalThis.setTimeout(() => scrollToSection(id, false), 100)
    }
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  stickyObserver?.disconnect()
  resizeObserver?.disconnect()
  scrollerRef.value?.removeEventListener('scroll', updateOverflowState)
  globalThis.removeEventListener('resize', updateOverflowState)
  globalThis.clearTimeout(hashSyncTimer)
})

const setItemRef = (el: Element | null, index: number) => {
  if (el instanceof HTMLButtonElement) itemRefs.value[index] = el
}
</script>

<template>
  <div class="sticky-nav-wrapper">
    <div ref="sentinelRef" class="nav-sentinel" aria-hidden="true" />

    <!-- Skip link for keyboard users -->
    <a class="skip-link" href="#app-main">Skip to main content</a>

    <nav
      ref="navRef"
      :class="['sub-nav', { sticky: isSticky }]"
      :style="{ '--site-header-h': effectiveHeader + 'px' }"
      aria-label="Page sections"
    >
      <!-- Mobile: native select (best a11y on touch) -->
      <div class="mobile-jump">
        <label for="section-jump" class="mobile-jump-label">
          <Icon name="heroicons:bars-3-bottom-left" />
          Jump to section
        </label>
        <select
          id="section-jump"
          ref="mobileSelect"
          class="mobile-jump-select"
          :value="activeId"
          @change="onMobileChange"
        >
          <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.label }}</option>
        </select>
      </div>

      <!-- Desktop: horizontal tabs -->
      <div class="sub-nav-row">
        <button
          type="button"
          class="edge-btn edge-left"
          :class="{ visible: canScrollLeft }"
          aria-label="Scroll tabs left"
          tabindex="-1"
          @click="scrollTabs(-1)"
        >
          <Icon name="heroicons:chevron-left" />
        </button>

        <div
          ref="scrollerRef"
          class="sub-nav-inner"
          :data-scroll-left="canScrollLeft || null"
          :data-scroll-right="canScrollRight || null"
        >
          <button
            v-for="(s, i) in sections"
            :key="s.id"
            :ref="(el) => setItemRef(el as Element | null, i)"
            type="button"
            :class="['sub-nav-item', { active: activeId === s.id }]"
            :aria-current="activeId === s.id ? 'location' : undefined"
            @click="scrollToSection(s.id)"
            @keydown="onKeydown($event, i)"
          >
            <span class="item-label-long">{{ s.label }}</span>
            <span v-if="s.short" class="item-label-short">{{ s.short }}</span>
          </button>
        </div>

        <button
          type="button"
          class="edge-btn edge-right"
          :class="{ visible: canScrollRight }"
          aria-label="Scroll tabs right"
          tabindex="-1"
          @click="scrollTabs(1)"
        >
          <Icon name="heroicons:chevron-right" />
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.sticky-nav-wrapper { display: contents; }

.nav-sentinel { height: 1px; width: 100%; }

/* Skip link — visible on focus */
.skip-link {
  position: fixed;
  left: 8px;
  top: 8px;
  transform: translateY(-140%);
  background: var(--mm-s3);
  color: var(--mm-pearl);
  padding: 8px 14px;
  border-radius: var(--r-sm);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  z-index: 60;
  transition: transform 150ms ease;
}
.skip-link:focus-visible {
  transform: translateY(0);
  outline: 2px solid var(--mm-gold);
  outline-offset: 2px;
}

/* Sticky bar */
.sub-nav {
  position: sticky;
  top: var(--site-header-h, 56px);
  background: rgba(7, 9, 15, 0.92);
  backdrop-filter: saturate(150%) blur(8px);
  border-bottom: 0.5px solid var(--b1);
  z-index: 50;
  transition: box-shadow 150ms ease, background 150ms ease;
}
.sub-nav.sticky {
  box-shadow: var(--shadow-md);
  background: rgba(15, 18, 32, 0.98);
}

/* Mobile select — visible only < 640px */
.mobile-jump {
  display: none;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
}
.mobile-jump-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--mm-pearl);
  white-space: nowrap;
}
.mobile-jump-label :deep(svg) { width: 16px; height: 16px; color: var(--mm-gold); }
.mobile-jump-select {
  flex: 1;
  min-height: 44px;
  padding: 0 36px 0 12px;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  background: var(--mm-s3);
  color: var(--mm-pearl);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8B5CC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}
.mobile-jump-select:focus-visible {
  outline: 2px solid var(--mm-gold);
  outline-offset: 2px;
  border-color: var(--mm-gold);
}

/* Desktop tab row */
.sub-nav-row {
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0 8px;
}

.edge-btn {
  flex-shrink: 0;
  width: 36px;
  background: transparent;
  border: 0;
  border-right: 0.5px solid var(--b1);
  color: var(--mm-slate);
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast), background var(--transition-fast);
}
.edge-btn.edge-right { border-right: 0; border-left: 0.5px solid var(--b1); }
.edge-btn:hover { color: var(--mm-gold); background: var(--mm-gold-soft); }
.edge-btn:focus-visible { outline: 2px solid var(--mm-gold); outline-offset: -2px; }
.edge-btn.visible { display: inline-flex; }
.edge-btn :deep(svg) { width: 16px; height: 16px; }

.sub-nav-inner {
  display: flex;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  flex: 0 1 auto;
  max-width: 100%;
  margin: 0 auto;
  justify-content: safe center;
  position: relative;
}
.sub-nav-inner::-webkit-scrollbar { display: none; }

/* Fade edges when content overflows */
.sub-nav-inner[data-scroll-left]::before,
.sub-nav-inner[data-scroll-right]::after {
  content: '';
  position: sticky;
  top: 0;
  width: 24px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  flex-shrink: 0;
}
.sub-nav-inner[data-scroll-left]::before {
  left: 0;
  background: linear-gradient(to right, rgba(7, 9, 15, 0.96), transparent);
  margin-right: -24px;
}
.sub-nav-inner[data-scroll-right]::after {
  right: 0;
  background: linear-gradient(to left, rgba(7, 9, 15, 0.96), transparent);
  margin-left: -24px;
}

.sub-nav-item {
  flex-shrink: 0;
  min-height: 44px;
  padding: 12px 10px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--mm-slate);
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.sub-nav-item:hover {
  color: var(--mm-pearl);
  background: var(--mm-s3);
}
.sub-nav-item:focus-visible {
  outline: 2px solid var(--mm-gold);
  outline-offset: -2px;
  color: var(--mm-pearl);
}
.sub-nav-item.active {
  color: var(--mm-gold);
  border-bottom-color: var(--mm-gold);
  font-weight: 600;
}

.item-label-short { display: none; }

/* Responsive */
@media (max-width: 1024px) {
  .item-label-long { display: none; }
  .item-label-short { display: inline; }
  .sub-nav-item:not(:has(.item-label-short)) .item-label-long { display: inline; }
}

@media (max-width: 640px) {
  .mobile-jump { display: flex; }
  .sub-nav-row { display: none; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .sub-nav-inner { scroll-behavior: auto; }
  .skip-link { transition: none; }
}
</style>
