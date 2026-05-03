/**
 * useHreflang — injects <link rel="alternate" hreflang="..."> tags into the page <head>
 * for every registered locale plus x-default.
 *
 * Usage: call once in a layout or page — `useHreflang()`
 * The current route path is automatically derived from useRoute().
 */
export function useHreflang() {
  const route = useRoute()
  const { locales } = useI18n()

  // Strip any existing locale prefix from the path to get the canonical slug.
  // e.g.  /fr/marketplace  → /marketplace
  //       /marketplace     → /marketplace
  const basePath = computed(() => {
    const allCodes = (locales.value as Array<{ code: string }>).map((l) => l.code)
    const segments = route.path.split('/')
    // segments[0] is always '' (leading slash)
    if (segments.length > 1 && allCodes.includes(segments[1])) {
      return '/' + segments.slice(2).join('/')
    }
    return route.path
  })

  const BASE_URL = 'https://moonmart.ai'

  useHead(() => {
    const links = (locales.value as Array<{ code: string }>).map((loc) => ({
      rel: 'alternate',
      hreflang: loc.code,
      href: loc.code === 'en'
        ? `${BASE_URL}${basePath.value || '/'}`
        : `${BASE_URL}/${loc.code}${basePath.value || '/'}`,
    }))

    // x-default always points to the English (default) URL
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${BASE_URL}${basePath.value || '/'}`,
    })

    return { link: links }
  })
}
