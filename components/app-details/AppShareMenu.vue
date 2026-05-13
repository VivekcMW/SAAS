<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

interface Props {
  url: string
  title: string
  description?: string
  hashtags?: string[]
}

const props = defineProps<Props>()

const open = ref(false)
const copied = ref(false)
const qrShown = ref(false)
const menuRef = ref<HTMLElement>()
const triggerRef = ref<HTMLButtonElement>()
const panelStyle = ref<Record<string, string>>({})

const PANEL_WIDTH = 340
const PANEL_GAP = 6

const updatePanelPosition = () => {
  if (!import.meta.client || !triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  let left = rect.right - PANEL_WIDTH
  if (left < 8) left = 8
  if (left + PANEL_WIDTH > vw - 8) left = Math.max(8, vw - PANEL_WIDTH - 8)
  let top = rect.bottom + PANEL_GAP
  // If not enough room below, flip above
  const estHeight = 420
  if (top + estHeight > vh - 8 && rect.top - PANEL_GAP - estHeight > 8) {
    top = rect.top - PANEL_GAP - estHeight
  }
  panelStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${PANEL_WIDTH}px`
  }
}

const encodedUrl = computed(() => encodeURIComponent(props.url))
const encodedTitle = computed(() => encodeURIComponent(props.title))
const encodedDesc = computed(() => encodeURIComponent(props.description || ''))
const hashString = computed(() => (props.hashtags || []).join(','))

const shareLinks = computed(() => ({
  x: `https://x.com/intent/tweet?url=${encodedUrl.value}&text=${encodedTitle.value}&hashtags=${hashString.value}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`,
  whatsapp: `https://wa.me/?text=${encodedTitle.value}%20${encodedUrl.value}`,
  telegram: `https://t.me/share/url?url=${encodedUrl.value}&text=${encodedTitle.value}`,
  reddit: `https://reddit.com/submit?url=${encodedUrl.value}&title=${encodedTitle.value}`,
  email: `mailto:?subject=${encodedTitle.value}&body=${encodedDesc.value}%0A%0A${encodedUrl.value}`
}))

const qrUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl.value}`
)

const embedCode = computed(
  () => `<iframe src="${props.url.replace('/marketplace/app/', '/embed/app/')}" width="100%" height="320" frameborder="0"></iframe>`
)

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch {
      /* ignore legacy copy failure */
    }
    ta.remove()
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

const nativeShare = async () => {
  if (!navigator.share) return
  try {
    await navigator.share({
      title: props.title,
      text: props.description,
      url: props.url
    })
  } catch {
    /* user cancelled */
  }
}

const hasNativeShare = computed(() => import.meta.client && !!(navigator as Navigator & { share?: unknown }).share)

const toggle = () => {
  open.value = !open.value
  if (open.value) {
    nextTick(updatePanelPosition)
  }
}

watch(open, (v) => {
  if (!import.meta.client) return
  if (v) {
    window.addEventListener('scroll', updatePanelPosition, true)
    window.addEventListener('resize', updatePanelPosition)
  } else {
    window.removeEventListener('scroll', updatePanelPosition, true)
    window.removeEventListener('resize', updatePanelPosition)
    qrShown.value = false
  }
})

const onDocClick = (e: MouseEvent) => {
  if (!open.value) return
  const target = e.target as Node
  if (menuRef.value?.contains(target)) return
  if (triggerRef.value?.contains(target)) return
  open.value = false
  qrShown.value = false
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') { open.value = false; qrShown.value = false }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
  }
})

defineExpose({ toggle, open: () => { open.value = true; nextTick(updatePanelPosition) } })
</script>

<template>
  <div class="share-menu">
    <button
      ref="triggerRef"
      type="button"
      class="share-trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
    >
      <Icon name="heroicons:share" />
      <span>Share</span>
    </button>

    <Teleport to="body">
      <Transition name="sm">
        <div v-if="open" ref="menuRef" class="share-panel" role="menu" :style="panelStyle">
        <div class="share-head">
          <h4 class="share-title">Share this app</h4>
          <button
            v-if="hasNativeShare"
            type="button"
            class="share-native"
            @click="nativeShare"
          >
            Device share
          </button>
        </div>

        <div class="share-url-row">
          <input class="share-url" readonly :value="url" >
          <button
            type="button"
            :class="['share-copy', { copied }]"
            @click="copy(url)"
          >
            <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard'" />
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>

        <div class="share-socials">
          <a :href="shareLinks.x" target="_blank" rel="noopener noreferrer" class="share-btn">
            <Icon name="simple-icons:x" />
            <span>X</span>
          </a>
          <a :href="shareLinks.linkedin" target="_blank" rel="noopener noreferrer" class="share-btn">
            <Icon name="simple-icons:linkedin" />
            <span>LinkedIn</span>
          </a>
          <a :href="shareLinks.facebook" target="_blank" rel="noopener noreferrer" class="share-btn">
            <Icon name="simple-icons:facebook" />
            <span>Facebook</span>
          </a>
          <a :href="shareLinks.whatsapp" target="_blank" rel="noopener noreferrer" class="share-btn">
            <Icon name="simple-icons:whatsapp" />
            <span>WhatsApp</span>
          </a>
          <a :href="shareLinks.telegram" target="_blank" rel="noopener noreferrer" class="share-btn">
            <Icon name="simple-icons:telegram" />
            <span>Telegram</span>
          </a>
          <a :href="shareLinks.reddit" target="_blank" rel="noopener noreferrer" class="share-btn">
            <Icon name="simple-icons:reddit" />
            <span>Reddit</span>
          </a>
          <a :href="shareLinks.email" class="share-btn">
            <Icon name="heroicons:envelope" />
            <span>Email</span>
          </a>
          <button type="button" class="share-btn" @click="qrShown = !qrShown">
            <Icon name="heroicons:qr-code" />
            <span>QR Code</span>
          </button>
        </div>

        <Transition name="sm">
          <div v-if="qrShown" class="share-qr">
            <img :src="qrUrl" alt="QR code for this app" >
            <p class="share-qr-hint">Scan to open on another device</p>
          </div>
        </Transition>

        <details class="share-embed">
          <summary>Embed this on your site</summary>
          <div class="embed-wrap">
            <textarea readonly rows="3" :value="embedCode"/>
            <button type="button" class="share-copy" @click="copy(embedCode)">
              <Icon name="heroicons:clipboard" />
              Copy embed
            </button>
          </div>
        </details>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.share-menu { position: relative; display: inline-block; }

.share-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--mm-silver);
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}
.share-trigger:hover { background: var(--mm-s2); border-color: var(--mm-gold); }
.share-trigger :deep(svg) { width: 16px; height: 16px; }

.share-panel {
  position: fixed;
  width: 340px;
  background: var(--mm-s1);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  padding: 14px;
}

.share-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.share-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--mm-pearl); }
.share-native {
  background: transparent;
  border: 0.5px solid var(--b1);
  border-radius: var(--r-xs);
  padding: 3px 8px;
  font-family: inherit;
  font-size: 11px;
  color: var(--mm-slate);
  cursor: pointer;
}
.share-native:hover { background: var(--mm-s3); color: var(--mm-pearl); }

.share-url-row {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}
.share-url {
  flex: 1;
  min-width: 0;
  padding: 7px 10px;
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 12px;
  color: var(--mm-silver);
}
.share-copy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  color: var(--mm-silver);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}
.share-copy:hover { background: var(--mm-s2); }
.share-copy.copied { background: var(--mm-sea-soft); color: var(--mm-seal); border-color: var(--mm-sea); }
.share-copy :deep(svg) { width: 12px; height: 12px; }

.share-socials {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-bottom: 10px;
}
.share-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
  font-family: inherit;
  font-size: 11px;
  color: var(--mm-silver);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}
.share-btn:hover { background: var(--mm-s2); border-color: var(--b2); }
.share-btn :deep(svg) { width: 16px; height: 16px; color: var(--mm-slate); }

.share-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-md);
  margin-bottom: 10px;
}
.share-qr img { width: 140px; height: 140px; border-radius: var(--r-xs); }
.share-qr-hint { margin: 0; font-size: 11px; color: var(--mm-slate); }

.share-embed {
  border-top: 0.5px solid var(--b1);
  padding-top: 10px;
}
.share-embed summary {
  font-size: 12px;
  font-weight: 500;
  color: var(--mm-slate);
  cursor: pointer;
  padding: 4px 0;
}
.share-embed summary:hover { color: var(--mm-pearl); }

.embed-wrap { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
.embed-wrap textarea {
  padding: 8px;
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 11px;
  color: var(--mm-silver);
  resize: vertical;
}

.sm-enter-from, .sm-leave-to { opacity: 0; transform: translateY(-4px); }
.sm-enter-active, .sm-leave-active { transition: opacity var(--transition-fast), transform var(--transition-fast); }
</style>
