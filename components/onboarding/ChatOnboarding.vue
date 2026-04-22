<template>
  <div class="chat-shell">
    <!-- Conversation transcript -->
    <div ref="streamRef" class="stream">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="msg"
        :class="`msg-${msg.from}`"
      >
        <div v-if="msg.from === 'bot'" class="avatar bot-avatar">
          <Icon name="heroicons:sparkles" />
        </div>
        <div class="bubble" :class="`bubble-${msg.from}`">
          <span v-if="msg.text">{{ msg.text }}</span>
          <span v-if="msg.html" v-html="msg.html" />
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="botTyping" class="msg msg-bot">
        <div class="avatar bot-avatar">
          <Icon name="heroicons:sparkles" />
        </div>
        <div class="bubble bubble-bot typing">
          <span class="dot" />
          <span class="dot" />
          <span class="dot" />
        </div>
      </div>

      <!-- Step-specific input panel docked under transcript -->
      <div class="composer-wrap">
        <!-- Greeting choice: have URL? -->
        <div v-if="step === 'intro'" class="quick-choices">
          <button class="choice-btn primary" @click="chooseHaveUrl(true)">
            <Icon name="heroicons:globe-alt" />
            Yes, I have a website
          </button>
          <button class="choice-btn" @click="chooseHaveUrl(false)">
            <Icon name="heroicons:pencil-square" />
            No, I'll tell you about it
          </button>
        </div>

        <!-- URL paste -->
        <form v-else-if="step === 'paste-url'" class="composer" @submit.prevent="submitUrl">
          <Icon name="heroicons:globe-alt" class="composer-icon" />
          <input
            ref="urlInputRef"
            v-model.trim="rawUrl"
            type="url"
            placeholder="https://yourapp.com"
            class="composer-input"
            autocomplete="url"
            spellcheck="false"
            :disabled="busy"
            required
          >
          <button type="submit" class="send-btn" :disabled="busy || !rawUrl">
            <Icon v-if="busy" name="heroicons:arrow-path" class="spin" />
            <Icon v-else name="heroicons:arrow-up" />
          </button>
        </form>

        <!-- Free-text inputs (name, tagline, provider, custom) -->
        <form
          v-else-if="textSteps.includes(step)"
          class="composer"
          @submit.prevent="submitText"
        >
          <input
            ref="textInputRef"
            v-model.trim="textDraft"
            type="text"
            :placeholder="textPlaceholder"
            class="composer-input"
            :maxlength="step === 'tagline' ? 200 : 80"
            :disabled="busy"
            required
          >
          <button type="submit" class="send-btn" :disabled="busy || !textDraft">
            <Icon name="heroicons:arrow-up" />
          </button>
        </form>

        <!-- Email step -->
        <form v-else-if="step === 'contact-email'" class="composer" @submit.prevent="submitEmail">
          <Icon name="heroicons:envelope" class="composer-icon" />
          <input
            ref="emailInputRef"
            v-model.trim="emailDraft"
            type="email"
            placeholder="sales@yourcompany.com"
            class="composer-input"
            autocomplete="email"
            :disabled="busy"
            required
          >
          <button type="submit" class="send-btn" :disabled="busy || !isValidEmail">
            <Icon name="heroicons:arrow-up" />
          </button>
        </form>

        <!-- Paid amount -->
        <form v-else-if="step === 'paid-amount'" class="composer" @submit.prevent="submitPaidAmount">
          <span class="composer-prefix">$</span>
          <input
            v-model.number="paidDraft"
            type="number"
            min="0"
            step="1"
            placeholder="29"
            class="composer-input"
            :disabled="busy"
            required
          >
          <span class="composer-suffix">/mo</span>
          <button type="submit" class="send-btn" :disabled="busy || !paidDraft">
            <Icon name="heroicons:arrow-up" />
          </button>
        </form>

        <!-- Multi-select pills (categories) -->
        <div v-else-if="step === 'categories'" class="pill-pad">
          <div class="pill-row">
            <button
              v-for="c in CATEGORIES"
              :key="c.value"
              type="button"
              class="pill"
              :class="{ active: form.categories.includes(c.value) }"
              @click="toggleCategory(c.value)"
            >
              {{ c.label }}
            </button>
          </div>
          <div class="pill-actions">
            <span class="pill-hint">{{ form.categories.length }} selected</span>
            <button
              type="button"
              class="send-btn inline"
              :disabled="form.categories.length === 0"
              @click="confirmCategories"
            >
              Continue <Icon name="heroicons:arrow-right" />
            </button>
          </div>
        </div>

        <!-- Pricing single-select pills -->
        <div v-else-if="step === 'pricing'" class="pill-pad">
          <div class="pill-row">
            <button
              v-for="p in PRICING"
              :key="p.value"
              type="button"
              class="pill"
              :class="{ active: form.pricingType === p.value }"
              @click="confirmPricing(p.value)"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <!-- Tags chip input -->
        <div v-else-if="step === 'tags'" class="pill-pad">
          <div class="pill-row tag-pills">
            <button
              v-for="(tag, idx) in form.keywords"
              :key="tag"
              type="button"
              class="pill tag active"
              @click="form.keywords.splice(idx, 1)"
            >
              {{ tag }} <Icon name="heroicons:x-mark" />
            </button>
            <input
              v-model.trim="tagDraft"
              type="text"
              class="tag-input"
              placeholder="Add tag, press Enter"
              maxlength="32"
              @keydown.enter.prevent="addTag"
              @keydown="onTagKey"
            >
          </div>
          <div class="pill-actions">
            <span class="pill-hint">{{ form.keywords.length }} tag{{ form.keywords.length === 1 ? '' : 's' }}</span>
            <button type="button" class="send-btn inline" @click="confirmTags">
              Continue <Icon name="heroicons:arrow-right" />
            </button>
          </div>
        </div>

        <!-- Review summary card -->
        <div v-else-if="step === 'review'" class="review-pad">
          <div class="review-summary">
            <div class="rs-row">
              <div v-if="form.logo" class="rs-logo"><img :src="form.logo" :alt="form.name" @error="form.logo = ''"></div>
              <div v-else class="rs-logo rs-fallback">{{ initial }}</div>
              <div class="rs-meta">
                <div class="rs-name">{{ form.name }}</div>
                <div class="rs-by">by {{ form.provider || 'You' }}</div>
              </div>
            </div>
            <p class="rs-tagline">{{ form.tagline }}</p>
            <div class="rs-tags">
              <span v-for="cat in form.categories" :key="cat" class="rs-cat">{{ categoryLabel(cat) }}</span>
              <span class="rs-price">{{ pricingLabel }}</span>
            </div>
          </div>
          <p v-if="publishError" class="form-error">
            <Icon name="heroicons:exclamation-circle" /> {{ publishError }}
          </p>
          <div class="pill-actions">
            <button type="button" class="ghost-btn" :disabled="busy" @click="restartFromName">
              <Icon name="heroicons:pencil-square" /> Edit
            </button>
            <button type="button" class="ghost-btn" :disabled="busy" @click="submitListing(false)">
              Save draft
            </button>
            <button type="button" class="send-btn inline" :disabled="busy" @click="submitListing(true)">
              <Icon v-if="busy" name="heroicons:arrow-path" class="spin" />
              <span>Publish listing</span>
            </button>
          </div>
        </div>

        <!-- Done -->
        <div v-else-if="step === 'done'" class="done-pad">
          <NuxtLink v-if="!publishedAsDraft && publishedUrl" :to="publishedUrl" class="send-btn inline">
            <Icon name="heroicons:eye" /> View listing
          </NuxtLink>
          <button type="button" class="ghost-btn" @click="resetFlow">
            <Icon name="heroicons:plus" /> List another
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'

interface ScrapeResponse {
  ok: boolean
  url: string
  domain: string
  name?: string
  provider?: string
  tagline?: string
  description?: string
  logo?: string
  category?: string
  categories?: string[]
  pricingType?: 'free' | 'freemium' | 'paid' | 'contact'
  pricingValue?: number | null
  detectedKeywords?: string[]
  pagesCrawled?: number
  error?: string
}

type Step =
  | 'intro'
  | 'paste-url'
  | 'name'
  | 'tagline'
  | 'categories'
  | 'pricing'
  | 'paid-amount'
  | 'contact-email'
  | 'tags'
  | 'review'
  | 'done'

interface Message {
  id: number
  from: 'bot' | 'user'
  text?: string
  html?: string
}

const CATEGORIES = [
  { value: 'crm', label: 'CRM' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'support', label: 'Customer Support' },
  { value: 'payments', label: 'Payments' },
  { value: 'developer', label: 'Developer Tools' },
  { value: 'design', label: 'Design' },
  { value: 'integration', label: 'Integrations' },
  { value: 'hr', label: 'HR & People' },
  { value: 'ai', label: 'AI & ML' },
  { value: 'other', label: 'Other' }
]

const PRICING = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'contact', label: 'Contact us' }
] as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const messages = ref<Message[]>([])
const step = ref<Step>('intro')
const busy = ref(false)
const botTyping = ref(false)

const rawUrl = ref('')
const textDraft = ref('')
const emailDraft = ref('')
const paidDraft = ref<number | null>(null)
const tagDraft = ref('')

const publishError = ref('')
const publishedAsDraft = ref(false)
const publishedUrl = ref('')

const streamRef = ref<HTMLElement | null>(null)
const urlInputRef = ref<HTMLInputElement | null>(null)
const textInputRef = ref<HTMLInputElement | null>(null)
const emailInputRef = ref<HTMLInputElement | null>(null)

const form = ref({
  url: '',
  name: '',
  provider: '',
  tagline: '',
  categories: [] as string[],
  pricingType: 'freemium' as 'free' | 'freemium' | 'paid' | 'contact',
  pricingValue: null as number | null,
  contactEmail: '',
  logo: '',
  keywords: [] as string[]
})

const textSteps = ['name', 'tagline'] as const

const textPlaceholder = computed(() => {
  if (step.value === 'name') return 'e.g. Acme Analytics'
  if (step.value === 'tagline') return 'One sentence on what it does'
  return ''
})

const initial = computed(() => (form.value.name || '?').charAt(0).toUpperCase())
const isValidEmail = computed(() => EMAIL_RE.test(emailDraft.value))
const pricingLabel = computed(() => {
  const p = PRICING.find(x => x.value === form.value.pricingType)?.label ?? 'Pricing'
  if (form.value.pricingType === 'paid' && form.value.pricingValue) {
    return `Paid · from $${form.value.pricingValue}/mo`
  }
  return p
})

const categoryLabel = (v: string) => CATEGORIES.find(c => c.value === v)?.label ?? v

let nextId = 1
const pushMsg = (m: Omit<Message, 'id'>) => {
  messages.value.push({ id: nextId++, ...m })
  nextTick(scrollToEnd)
}

const scrollToEnd = () => {
  if (streamRef.value) streamRef.value.scrollTop = streamRef.value.scrollHeight
}

const botSay = async (text: string, delay = 350) => {
  botTyping.value = true
  nextTick(scrollToEnd)
  await new Promise(r => setTimeout(r, delay))
  botTyping.value = false
  pushMsg({ from: 'bot', text })
}

const userSay = (text: string) => pushMsg({ from: 'user', text })

const focusActiveInput = () => {
  nextTick(() => {
    if (step.value === 'paste-url') urlInputRef.value?.focus()
    else if (textSteps.includes(step.value as never)) textInputRef.value?.focus()
    else if (step.value === 'contact-email') emailInputRef.value?.focus()
  })
}

onMounted(async () => {
  await botSay("Hi! I'll help you list your product on SaaSWorld in about a minute.", 200)
  await botSay('Do you have a website for your product?', 400)
  focusActiveInput()
})

// ===== Branch 1: have URL =====
const chooseHaveUrl = async (yes: boolean) => {
  if (yes) {
    userSay('Yes, I have a website')
    step.value = 'paste-url'
    await botSay('Great — paste the URL and I\'ll auto-fill what I can.')
    focusActiveInput()
  } else {
    userSay("Not yet, I'll tell you about it")
    step.value = 'name'
    await botSay('No problem. What\'s your product called?')
    focusActiveInput()
  }
}

function pickCategories(data: ScrapeResponse): string[] {
  if (data.categories?.length) return [...data.categories]
  if (data.category) return [data.category]
  return []
}

async function continueAfterScrape() {
  const hasCore = !!(form.value.name && form.value.tagline && form.value.categories.length > 0)
  const isPaidOk = form.value.pricingType === 'paid' && form.value.pricingValue
  const hasPricing = form.value.pricingType === 'free' || form.value.pricingType === 'freemium' || isPaidOk

  if (hasCore && hasPricing) {
    await botSay('I\'ve filled in everything. Take a look and tap Publish if it looks right.')
    step.value = 'review'
    return
  }
  if (hasCore) {
    await botSay('Almost there — just confirm pricing and we\'re done.')
    step.value = 'pricing'
    return
  }
  if (form.value.name && form.value.tagline) { await goCategories(); return }
  if (form.value.name) { await goTagline(); return }
  await goName()
}

const submitUrl = async () => {
  if (!rawUrl.value) return
  userSay(rawUrl.value)
  busy.value = true
  await botSay('Reading your site and crawling key pages…', 100)
  try {
    const data = await $fetch<ScrapeResponse>('/api/listings/scrape', {
      method: 'POST',
      body: { url: rawUrl.value }
    })
    if (!data.ok) throw new Error(data.error || 'Could not read that URL.')

    form.value.url = data.url
    form.value.name = data.name || ''
    form.value.provider = data.provider || data.name || data.domain
    form.value.tagline = data.tagline || ''
    form.value.categories = pickCategories(data)
    form.value.pricingType = data.pricingType || 'freemium'
    form.value.pricingValue = data.pricingValue ?? null
    form.value.logo = data.logo || ''
    form.value.keywords = data.detectedKeywords || []

    if (data.error) await botSay(`Heads up: ${data.error} You can still edit anything below.`)

    const pages = data.pagesCrawled ?? 1
    const summary = pages > 1
      ? `Done — I read ${pages} pages from ${data.domain} and pulled together everything I could.`
      : `Got it — I found "${form.value.name || data.domain}".`
    await botSay(summary)

    await continueAfterScrape()
  } catch (err) {
    await botSay((err as Error).message || 'Something went wrong reading that URL. Want to type things in instead?')
    step.value = 'name'
    await botSay('What\'s your product called?')
    focusActiveInput()
  } finally {
    busy.value = false
  }
}

// ===== Shared text input handler =====
const submitText = async () => {
  if (!textDraft.value) return
  const value = textDraft.value
  userSay(value)
  textDraft.value = ''

  if (step.value === 'name') {
    form.value.name = value
    if (!form.value.provider) form.value.provider = value
    await goTagline()
  } else if (step.value === 'tagline') {
    form.value.tagline = value
    await goCategories()
  }
}

const goName = async () => {
  step.value = 'name'
  await botSay('What\'s your product called?')
  focusActiveInput()
}

const goTagline = async () => {
  step.value = 'tagline'
  if (form.value.tagline) {
    await botSay(`Auto-filled tagline: "${form.value.tagline}". Want to keep it or rewrite it? Just type the version you want, or send to keep it.`)
  } else {
    await botSay('In one sentence, what does it do?')
  }
  textDraft.value = form.value.tagline
  focusActiveInput()
}

const goCategories = async () => {
  step.value = 'categories'
  await botSay('Which categories fit? Pick one or more.')
  scrollToEnd()
}

const toggleCategory = (v: string) => {
  const i = form.value.categories.indexOf(v)
  if (i === -1) form.value.categories.push(v)
  else form.value.categories.splice(i, 1)
}

const confirmCategories = async () => {
  if (form.value.categories.length === 0) return
  userSay(form.value.categories.map(categoryLabel).join(', '))
  step.value = 'pricing'
  await botSay('How is it priced?')
}

const confirmPricing = async (value: typeof PRICING[number]['value']) => {
  form.value.pricingType = value
  userSay(PRICING.find(p => p.value === value)?.label ?? value)

  if (value === 'paid') {
    step.value = 'paid-amount'
    await botSay('What\'s the starting monthly price?')
  } else if (value === 'contact') {
    step.value = 'contact-email'
    await botSay('What email should buyers contact for sales?')
    focusActiveInput()
  } else {
    await goTags()
  }
}

const submitPaidAmount = async () => {
  if (!paidDraft.value) return
  form.value.pricingValue = paidDraft.value
  userSay(`$${paidDraft.value}/mo`)
  paidDraft.value = null
  await goTags()
}

const submitEmail = async () => {
  if (!isValidEmail.value) return
  form.value.contactEmail = emailDraft.value
  userSay(emailDraft.value)
  emailDraft.value = ''
  await goTags()
}

const goTags = async () => {
  step.value = 'tags'
  if (form.value.keywords.length) {
    await botSay(`I picked up these tags: ${form.value.keywords.join(', ')}. Add or remove any, then continue.`)
  } else {
    await botSay('Add a few tags so people can find you (optional).')
  }
}

const addTag = () => {
  const raw = tagDraft.value.trim().toLowerCase().replaceAll(/[^a-z0-9 -]/g, '')
  if (!raw) { tagDraft.value = ''; return }
  if (!form.value.keywords.includes(raw) && form.value.keywords.length < 12) {
    form.value.keywords.push(raw)
  }
  tagDraft.value = ''
}

const onTagKey = (e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !tagDraft.value && form.value.keywords.length) {
    form.value.keywords.pop()
  } else if (e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

const confirmTags = async () => {
  if (tagDraft.value) addTag()
  userSay(form.value.keywords.length ? form.value.keywords.join(', ') : '(no extra tags)')
  step.value = 'review'
  await botSay('Here\'s your listing. Looks good?')
}

const restartFromName = async () => {
  step.value = 'name'
  textDraft.value = form.value.name
  await botSay('Sure — let\'s walk through it again. Update the name or press send to keep it.')
  focusActiveInput()
}

const submitListing = async (publish: boolean) => {
  publishError.value = ''
  busy.value = true
  try {
    const data = await $fetch<{ ok: boolean; url: string; status: string }>('/api/listings/express', {
      method: 'POST',
      body: {
        url: form.value.url,
        name: form.value.name,
        provider: form.value.provider,
        tagline: form.value.tagline,
        categories: form.value.categories,
        category: form.value.categories[0],
        pricingType: form.value.pricingType,
        pricingValue: form.value.pricingValue,
        contactEmail: form.value.pricingType === 'contact' ? form.value.contactEmail : undefined,
        logo: form.value.logo,
        keywords: form.value.keywords,
        publish
      }
    })
    publishedAsDraft.value = data.status !== 'published'
    publishedUrl.value = data.url
    step.value = 'done'
    if (publishedAsDraft.value) {
      await botSay('Saved as draft. You can publish anytime from your dashboard.')
    } else {
      await botSay('Done — your listing is live!')
    }
  } catch (err) {
    publishError.value = (err as Error).message || 'Could not save listing.'
  } finally {
    busy.value = false
  }
}

const resetFlow = async () => {
  messages.value = []
  rawUrl.value = ''
  textDraft.value = ''
  emailDraft.value = ''
  paidDraft.value = null
  tagDraft.value = ''
  publishedUrl.value = ''
  publishedAsDraft.value = false
  publishError.value = ''
  form.value = {
    url: '', name: '', provider: '', tagline: '',
    categories: [], pricingType: 'freemium', pricingValue: null,
    contactEmail: '', logo: '', keywords: []
  }
  step.value = 'intro'
  await botSay("Hi! I'll help you list another product. Do you have a website for it?", 100)
}
</script>

<style scoped>
.chat-shell {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.stream {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.msg {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  animation: fadeUp 200ms ease;
}
.msg-user { justify-content: flex-end; }
.msg-bot { justify-content: flex-start; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}
.bot-avatar { background: #fff3e6; color: #ff8838; }
.bot-avatar :deep(svg) { width: 14px; height: 14px; }

.bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-wrap;
}
.bubble-bot {
  background: #ffffff;
  color: #111827;
  border: 0.5px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}
.bubble-user {
  background: #ff8838;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.typing { display: inline-flex; gap: 4px; padding: 12px 14px; }
.typing .dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: #d1d5db;
  animation: blink 1.2s infinite ease-in-out;
}
.typing .dot:nth-child(2) { animation-delay: 0.2s; }
.typing .dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

/* Composer area */
.composer-wrap {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 0.5px dashed #e5e7eb;
}

.quick-choices {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.choice-btn {
  flex: 1;
  min-width: 200px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
}
.choice-btn:hover { border-color: #ff8838; color: #ff8838; }
.choice-btn.primary { border-color: #ff8838; background: #fff3e6; color: #b45309; }
.choice-btn.primary:hover { background: #ffe5cc; }
.choice-btn :deep(svg) { width: 16px; height: 16px; }

.composer {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 4px 4px 4px 14px;
  transition: border-color 150ms ease;
}
.composer:focus-within { border-color: #ff8838; }
.composer-icon { width: 18px; height: 18px; color: #9ca3af; flex-shrink: 0; }
.composer-prefix, .composer-suffix { color: #6b7280; font-size: 14px; padding: 0 4px; }
.composer-input {
  flex: 1;
  border: 0;
  background: transparent;
  font-size: 14px;
  padding: 10px 4px;
  outline: 0;
  color: #111827;
  min-width: 0;
}

.send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #ff8838;
  color: #ffffff;
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease;
  flex-shrink: 0;
}
.send-btn:hover:not(:disabled) { background: #e57320; }
.send-btn:disabled { background: #d1d5db; cursor: not-allowed; }
.send-btn.inline { padding: 10px 16px; }
.send-btn :deep(svg) { width: 16px; height: 16px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  color: #374151;
  border: 0.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease;
}
.ghost-btn:hover:not(:disabled) { border-color: #ff8838; color: #ff8838; }
.ghost-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ghost-btn :deep(svg) { width: 14px; height: 14px; }

/* Pill panels */
.pill-pad {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
}
.pill-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.pill {
  background: #ffffff;
  color: #4b5563;
  border: 0.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}
.pill:hover { border-color: #ff8838; color: #ff8838; }
.pill.active {
  background: #fff3e6;
  border-color: #ff8838;
  color: #b45309;
  font-weight: 600;
}
.pill.tag.active:hover { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; }
.pill :deep(svg) { width: 12px; height: 12px; }

.pill-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.pill-hint { color: #6b7280; font-size: 12px; }

.tag-pills .tag-input {
  flex: 1;
  min-width: 140px;
  background: transparent;
  border: 0.5px dashed #e5e7eb;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  outline: 0;
  color: #111827;
}
.tag-pills .tag-input:focus { border-color: #ff8838; border-style: solid; }

/* Review summary */
.review-pad {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
}
.review-summary { display: flex; flex-direction: column; gap: 10px; }
.rs-row { display: flex; gap: 12px; align-items: center; }
.rs-logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.rs-logo img { width: 100%; height: 100%; object-fit: cover; }
.rs-fallback { background: #ff8838; color: #ffffff; font-weight: 700; font-size: 18px; }
.rs-name { font-weight: 600; color: #111827; font-size: 15px; }
.rs-by { color: #6b7280; font-size: 12px; }
.rs-tagline { margin: 0; color: #374151; font-size: 14px; line-height: 1.5; }
.rs-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.rs-cat, .rs-price {
  background: #f3f4f6;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 999px;
}
.rs-price { background: #fff3e6; color: #b45309; }

.form-error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 8px 0 0;
  font-size: 13px;
  color: #b91c1c;
}
.form-error :deep(svg) { width: 14px; height: 14px; }

.done-pad {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .bubble { max-width: 85%; }
  .choice-btn { min-width: 100%; }
}
</style>
