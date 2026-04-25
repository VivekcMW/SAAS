<script setup lang="ts">
interface TocItem { id: string; label: string }

interface Props {
  title: string
  eyebrow?: string
  lede?: string
  updated?: string
  sections?: TocItem[]
  contactEmail?: string
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: 'Legal',
  lede: '',
  updated: '',
  sections: () => [] as TocItem[],
  contactEmail: 'legal@moonmart.ai'
})

const activeId = ref<string>(props.sections[0]?.id || '')

function onTocClick(ev: MouseEvent, id: string) {
  const target = document.getElementById(id)
  if (!target) return
  ev.preventDefault()
  activeId.value = id
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (history && typeof history.replaceState === 'function') {
    history.replaceState(null, '', `#${id}`)
  }
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (typeof window === 'undefined' || !props.sections.length) return
  const ids = props.sections.map((s) => s.id)
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible && visible.target.id) activeId.value = visible.target.id
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.25, 0.5, 1] }
  )
  ids.forEach((id) => {
    const el = document.getElementById(id)
    if (el && observer) observer.observe(el)
  })
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="legal">
    <!-- Hero -->
    <header class="legal__hero">
      <div class="legal__wrap">
        <span class="legal__eyebrow">{{ eyebrow }}</span>
        <h1 class="legal__title">{{ title }}</h1>
        <p v-if="lede" class="legal__lede">{{ lede }}</p>
        <p v-if="updated" class="legal__updated">Last updated: {{ updated }}</p>
      </div>
    </header>

    <div class="legal__body">
      <div class="legal__wrap legal__grid">
        <!-- Sidebar TOC -->
        <aside v-if="sections.length" class="legal__toc" aria-label="On this page">
          <p class="legal__toc-label">On this page</p>
          <ul class="legal__toc-list">
            <li v-for="s in sections" :key="s.id">
              <a
                :href="`#${s.id}`"
                :class="['legal__toc-link', activeId === s.id ? 'legal__toc-link--on' : '']"
                @click="onTocClick($event, s.id)"
              >{{ s.label }}</a>
            </li>
          </ul>

          <div class="legal__toc-card">
            <p class="legal__toc-card-title">Questions?</p>
            <p class="legal__toc-card-body">
              Reach our legal team — we usually reply within two business days.
            </p>
            <a :href="`mailto:${contactEmail}`" class="legal__toc-card-link">{{ contactEmail }}</a>
          </div>
        </aside>

        <!-- Article -->
        <article class="legal__article">
          <slot />

          <div class="legal__peers">
            <NuxtLink to="/terms" class="legal__peer">Terms of Service</NuxtLink>
            <NuxtLink to="/privacy" class="legal__peer">Privacy Policy</NuxtLink>
            <NuxtLink to="/cookies" class="legal__peer">Cookie Policy</NuxtLink>
            <NuxtLink to="/licenses" class="legal__peer">Licenses</NuxtLink>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal {
  background: #ffffff;
  color: #1e1e1e;
  font-family: var(--font-body, 'Outfit', system-ui, -apple-system, sans-serif);
}
.legal__wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Hero */
.legal__hero {
  padding: 5rem 0 3rem;
  border-bottom: 1px solid #f0efec;
  background: var(--sw-primary-soft, #fff1e6);
}
.legal__eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sw-primary, #ff8838);
  margin-bottom: 1rem;
}
.legal__title {
  font-family: var(--font-heading, 'Syne', system-ui, sans-serif);
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: #1e1e1e;
  margin: 0 0 1rem;
  max-width: 780px;
}
.legal__lede {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: #52525b;
  margin: 0 0 1rem;
  max-width: 680px;
}
.legal__updated {
  font-size: 0.8125rem;
  color: #71717a;
  margin: 0;
  letter-spacing: 0.02em;
}

/* Body grid */
.legal__body { padding: 3rem 0 5rem; }
.legal__grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 3rem;
  align-items: flex-start;
}

/* TOC */
.legal__toc {
  position: sticky;
  top: 2rem;
  align-self: flex-start;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  padding-right: 0.25rem;
}
.legal__toc-label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #71717a;
  margin: 0 0 0.75rem;
}
.legal__toc-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  border-left: 1px solid #f0efec;
}
.legal__toc-list li { margin: 0; }
.legal__toc-link {
  display: block;
  padding: 0.4rem 0.85rem;
  margin-left: -1px;
  border-left: 2px solid transparent;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #52525b;
  text-decoration: none;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.legal__toc-link:hover { color: #1e1e1e; }
.legal__toc-link--on {
  color: var(--sw-primary, #ff8838);
  border-left-color: var(--sw-primary, #ff8838);
  font-weight: 600;
}

.legal__toc-card {
  background: #fbfaf8;
  border: 1px solid #f0efec;
  border-radius: 14px;
  padding: 1.1rem 1.2rem;
}
.legal__toc-card-title {
  font-family: var(--font-heading, 'Syne', system-ui, sans-serif);
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0 0 0.35rem;
}
.legal__toc-card-body {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #52525b;
  margin: 0 0 0.6rem;
}
.legal__toc-card-link {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--sw-primary, #ff8838);
  text-decoration: none;
  word-break: break-all;
}
.legal__toc-card-link:hover { text-decoration: underline; }

/* Article — scoped deep selectors so legacy content inherits new styling */
.legal__article {
  max-width: 760px;
  min-width: 0;
  color: #3f3f46;
  font-size: 1rem;
  line-height: 1.7;
}

/* Universal heading normalization inside the article */
.legal__article :deep(h1) {
  display: none; /* hide any content-duplicated h1; hero already shows title */
}
.legal__article :deep(h2) {
  font-family: var(--font-heading, 'Syne', system-ui, sans-serif);
  font-size: clamp(1.375rem, 2.2vw, 1.75rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.005em;
  color: #1e1e1e;
  margin: 3rem 0 1rem;
  padding: 0;
  border: none;
  scroll-margin-top: 6rem;
}
.legal__article :deep(section:first-child h2),
.legal__article :deep(h2:first-child) { margin-top: 0; }
.legal__article :deep(h3) {
  font-family: var(--font-heading, 'Syne', system-ui, sans-serif);
  font-size: 1.0625rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 1.75rem 0 0.65rem;
  scroll-margin-top: 6rem;
}
.legal__article :deep(p) {
  margin: 0 0 1.1rem;
  color: #3f3f46;
  text-align: left;
}
.legal__article :deep(p:last-child) { margin-bottom: 0; }
.legal__article :deep(strong) { color: #1e1e1e; font-weight: 600; }

.legal__article :deep(a) {
  color: var(--sw-primary, #ff8838);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  font-weight: 500;
  transition: color 0.15s ease;
}
.legal__article :deep(a:hover) { color: var(--sw-primary-hover, #e67326); }

.legal__article :deep(ul),
.legal__article :deep(ol) {
  margin: 0 0 1.25rem;
  padding-left: 1.35rem;
}
.legal__article :deep(ul) { list-style: disc; }
.legal__article :deep(ol) { list-style: decimal; }
.legal__article :deep(li) {
  margin: 0 0 0.35rem;
  line-height: 1.6;
  padding-left: 0.25rem;
}
.legal__article :deep(li::marker) { color: var(--sw-primary, #ff8838); }

/* Section spacing */
.legal__article :deep(section) {
  margin: 0 0 2.5rem;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}
.legal__article :deep(section:last-child) { margin-bottom: 0; }

/* Neutralize legacy decorative wrappers */
.legal__article :deep(.legal-section),
.legal__article :deep(.content-section) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  margin: 0 0 2.5rem;
  animation: none;
  transform: none;
}
.legal__article :deep(.legal-header),
.legal__article :deep(.legal-footer),
.legal__article :deep(.toc-section) { display: none; }

/* Tailwind utility overrides for pages that use them inline */
.legal__article :deep(.text-blue-600),
.legal__article :deep(.text-blue-700),
.legal__article :deep(.text-blue-800),
.legal__article :deep(.text-blue-900) { color: var(--sw-primary, #ff8838) !important; }
.legal__article :deep(.bg-blue-50),
.legal__article :deep(.bg-blue-100) { background: var(--sw-primary-soft, #fff1e6) !important; }
.legal__article :deep(.bg-blue-600),
.legal__article :deep(.bg-blue-700) {
  background: var(--sw-primary, #ff8838) !important;
  color: #ffffff !important;
}
.legal__article :deep(.border-blue-200) { border-color: #f0d9bf !important; }
.legal__article :deep(.text-gray-900) { color: #1e1e1e !important; }
.legal__article :deep(.text-gray-700),
.legal__article :deep(.text-gray-600) { color: #3f3f46 !important; }
.legal__article :deep(.text-gray-500) { color: #71717a !important; }

/* Definition / contact blocks */
.legal__article :deep(.definition-list) {
  display: grid;
  gap: 0.5rem;
  margin: 0 0 1.25rem;
}
.legal__article :deep(.definition-item) {
  background: #fbfaf8;
  border: 1px solid #f0efec;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font-size: 0.9375rem;
}
.legal__article :deep(.contact-info),
.legal__article :deep(.contact-box) {
  background: var(--sw-primary-soft, #fff1e6);
  border: 1px solid #f0d9bf;
  border-radius: 14px;
  padding: 1.25rem 1.35rem;
  margin-top: 1rem;
}
.legal__article :deep(.contact-info p),
.legal__article :deep(.contact-box p) {
  margin: 0 0 0.35rem;
  font-size: 0.9375rem;
  color: #3f3f46;
}
.legal__article :deep(.contact-info p:last-child),
.legal__article :deep(.contact-box p:last-child) { margin-bottom: 0; }

/* Callout / notice blocks */
.legal__article :deep(.important-notice) {
  background: var(--sw-primary-soft, #fff1e6);
  border: 1px solid #f0d9bf;
  border-left: 3px solid var(--sw-primary, #ff8838);
  border-radius: 10px;
  padding: 1rem 1.15rem;
  margin: 1.25rem 0;
}
.legal__article :deep(.important-notice p) {
  color: #52370f;
  margin: 0;
  font-weight: 500;
}

/* Tables */
.legal__article :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 1.5rem;
  font-size: 0.9375rem;
}
.legal__article :deep(th),
.legal__article :deep(td) {
  text-align: left;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid #f0efec;
  vertical-align: top;
}
.legal__article :deep(th) {
  background: #fbfaf8;
  font-weight: 600;
  color: #1e1e1e;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Peers footer */
.legal__peers {
  margin-top: 3.5rem;
  padding-top: 2rem;
  border-top: 1px solid #f0efec;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
}
.legal__peer {
  font-size: 0.875rem;
  color: #52525b;
  text-decoration: none;
  font-weight: 500;
}
.legal__peer:hover { color: var(--sw-primary, #ff8838); }

/* Responsive */
@media (max-width: 960px) {
  .legal__grid { grid-template-columns: 1fr; gap: 2rem; }
  .legal__toc {
    position: static;
    max-height: none;
    overflow: visible;
  }
  .legal__toc-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    border-left: none;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f0efec;
  }
  .legal__toc-link {
    border-left: none;
    border-radius: 999px;
    padding: 0.35rem 0.8rem;
    background: #fbfaf8;
    border: 1px solid #f0efec;
    margin-left: 0;
    font-size: 0.8125rem;
  }
  .legal__toc-link--on {
    background: var(--sw-primary, #ff8838);
    color: #ffffff;
    border-color: var(--sw-primary, #ff8838);
  }
  .legal__toc-card { display: none; }
}
@media (max-width: 600px) {
  .legal__hero { padding: 3.5rem 0 2.5rem; }
  .legal__body { padding: 2rem 0 3.5rem; }
}
</style>
