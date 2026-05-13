/**
 * useListingEditor — reactive state for the vendor listing preview & publish flow
 * Loaded from sessionStorage (written by ChatOnboarding) or direct prop seeding.
 */
import { ref, computed, reactive } from 'vue'

export const SESSION_KEY = 'mm_listing_draft'

export interface ListingDraft {
  // Basics
  url: string
  name: string
  provider: string
  tagline: string
  description: string
  // Categorisation
  categories: string[]
  keywords: string[]
  // Pricing
  pricingType: 'free' | 'freemium' | 'paid' | 'contact'
  pricingValue: number | null
  pricingPeriod: 'month' | 'year' | ''
  contactEmail: string
  // Media
  logo: string
  screenshots: string[]
  // Features
  features: string[]
  // Links
  websiteUrl: string
}

const EMPTY: ListingDraft = {
  url: '',
  name: '',
  provider: '',
  tagline: '',
  description: '',
  categories: [],
  keywords: [],
  pricingType: 'freemium',
  pricingValue: null,
  pricingPeriod: 'month',
  contactEmail: '',
  logo: '',
  screenshots: [],
  features: [],
  websiteUrl: '',
}

export function useListingEditor() {
  const draft = reactive<ListingDraft>({ ...EMPTY })
  const saving = ref(false)
  const publishing = ref(false)
  const saveError = ref('')
  const lastSaved = ref<Date | null>(null)
  const publishedUrl = ref('')
  const publishedAsDraft = ref(false)
  const publishedId = ref('')
  const publishedName = ref('')

  // ── Load from sessionStorage ───────────────────────────────────────────────
  function loadFromSession(): boolean {
    if (!import.meta.client) return false
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (!raw) return false
      const parsed = JSON.parse(raw) as Partial<ListingDraft>
      Object.assign(draft, EMPTY, parsed)
      return true
    } catch {
      return false
    }
  }

  // ── Persist to sessionStorage ──────────────────────────────────────────────
  function persist() {
    if (!import.meta.client) return
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(draft))
    } catch { /* ignore quota */ }
  }

  // ── Seed from ChatOnboarding form ──────────────────────────────────────────
  function seedFromChat(data: {
    url?: string
    name?: string
    provider?: string
    tagline?: string
    categories?: string[]
    pricingType?: 'free' | 'freemium' | 'paid' | 'contact'
    pricingValue?: number | null
    contactEmail?: string
    logo?: string
    keywords?: string[]
  }) {
    Object.assign(draft, EMPTY, {
      url: data.url ?? '',
      name: data.name ?? '',
      provider: data.provider ?? '',
      tagline: data.tagline ?? '',
      categories: data.categories ?? [],
      pricingType: data.pricingType ?? 'freemium',
      pricingValue: data.pricingValue ?? null,
      pricingPeriod: 'month',
      contactEmail: data.contactEmail ?? '',
      logo: data.logo ?? '',
      keywords: data.keywords ?? [],
      screenshots: [],
      features: [],
      websiteUrl: data.url ?? '',
    })
    persist()
  }

  // ── Completeness score 0–100 ───────────────────────────────────────────────
  const completeness = computed(() => {
    const checks = [
      !!draft.name,
      !!draft.provider,
      !!draft.tagline,
      draft.categories.length > 0,
      !!draft.pricingType,
      !!draft.logo,
      draft.screenshots.length > 0,
      draft.features.length >= 3,
      !!draft.description,
      draft.keywords.length > 0,
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  })

  // ── Pretty pricing label ───────────────────────────────────────────────────
  const pricingLabel = computed(() => {
    if (draft.pricingType === 'free') return 'Free'
    if (draft.pricingType === 'freemium') return 'Free · Paid plans'
    if (draft.pricingType === 'contact') return 'Contact us'
    if (draft.pricingValue) {
      const period = draft.pricingPeriod ? `/${draft.pricingPeriod}` : ''
      return `From $${draft.pricingValue}${period}`
    }
    return 'Paid'
  })

  // ── Feature helpers ────────────────────────────────────────────────────────
  function addFeature(text: string) {
    const clean = text.trim()
    if (clean && !draft.features.includes(clean)) {
      draft.features.push(clean)
      persist()
    }
  }
  function removeFeature(index: number) {
    draft.features.splice(index, 1)
    persist()
  }

  // ── Screenshot helpers ─────────────────────────────────────────────────────
  function addScreenshot(url: string) {
    const clean = url.trim()
    if (clean && draft.screenshots.length < 8 && !draft.screenshots.includes(clean)) {
      draft.screenshots.push(clean)
      persist()
    }
  }
  function removeScreenshot(index: number) {
    draft.screenshots.splice(index, 1)
    persist()
  }

  // ── API: Save as draft ─────────────────────────────────────────────────────
  async function saveDraft(): Promise<boolean> {
    saving.value = true
    saveError.value = ''
    persist()
    try {
      const data = await $fetch<{ ok: boolean; url: string; status: string }>('/api/listings/express', {
        method: 'POST',
        body: {
          url: draft.url,
          name: draft.name,
          provider: draft.provider,
          tagline: draft.tagline,
          categories: draft.categories,
          category: draft.categories[0],
          pricingType: draft.pricingType,
          pricingValue: draft.pricingValue,
          contactEmail: draft.pricingType === 'contact' ? draft.contactEmail : undefined,
          logo: draft.logo,
          keywords: draft.keywords,
          publish: false,
        }
      })
      publishedAsDraft.value = true
      publishedUrl.value = data.url
      lastSaved.value = new Date()
      return true
    } catch (err) {
      saveError.value = (err as Error).message || 'Could not save.'
      return false
    } finally {
      saving.value = false
    }
  }

  // ── API: Publish ───────────────────────────────────────────────────────────
  async function publish(): Promise<boolean> {
    publishing.value = true
    saveError.value = ''
    try {
      const data = await $fetch<{ ok: boolean; url: string; status: string; listing?: { id: string; slug: string } }>('/api/listings/express', {
        method: 'POST',
        body: {
          url: draft.url,
          name: draft.name,
          provider: draft.provider,
          tagline: draft.tagline,
          categories: draft.categories,
          category: draft.categories[0],
          pricingType: draft.pricingType,
          pricingValue: draft.pricingValue,
          contactEmail: draft.pricingType === 'contact' ? draft.contactEmail : undefined,
          logo: draft.logo,
          keywords: draft.keywords,
          publish: true,
        }
      })
      publishedAsDraft.value = false
      publishedUrl.value = data.url
      if (data.listing?.id) publishedId.value = data.listing.id
      publishedName.value = draft.name
      lastSaved.value = new Date()
      // Clear session draft after publish
      if (import.meta.client) sessionStorage.removeItem(SESSION_KEY)
      return true
    } catch (err) {
      saveError.value = (err as Error).message || 'Could not publish.'
      return false
    } finally {
      publishing.value = false
    }
  }

  return {
    draft,
    saving,
    publishing,
    saveError,
    lastSaved,
    publishedUrl,
    publishedAsDraft,
    publishedId,
    publishedName,
    completeness,
    pricingLabel,
    loadFromSession,
    persist,
    seedFromChat,
    addFeature,
    removeFeature,
    addScreenshot,
    removeScreenshot,
    saveDraft,
    publish,
  }
}
