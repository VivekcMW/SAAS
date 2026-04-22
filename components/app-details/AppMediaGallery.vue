<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface MediaItem {
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  caption?: string
}

interface Props {
  items: MediaItem[]
  appName?: string
}

const props = defineProps<Props>()

const activeTab = ref<'screenshots' | 'video'>('screenshots')
const lightboxIndex = ref<number | null>(null)

const screenshots = computed(() => props.items.filter(i => i.type === 'image'))
const videos = computed(() => props.items.filter(i => i.type === 'video'))

const currentList = computed(() =>
  activeTab.value === 'video' ? videos.value : screenshots.value
)

const openLightbox = (i: number) => { lightboxIndex.value = i }
const closeLightbox = () => { lightboxIndex.value = null }

const prev = () => {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value - 1 + currentList.value.length) % currentList.value.length
}
const next = () => {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value + 1) % currentList.value.length
}

const onKey = (e: KeyboardEvent) => {
  if (lightboxIndex.value === null) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

onMounted(() => {
  if (import.meta.client) document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (import.meta.client) document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="media-gallery">
    <div v-if="videos.length > 0" class="gallery-tabs">
      <button
        type="button"
        :class="['gallery-tab', { active: activeTab === 'screenshots' }]"
        @click="activeTab = 'screenshots'"
      >
        Screenshots ({{ screenshots.length }})
      </button>
      <button
        type="button"
        :class="['gallery-tab', { active: activeTab === 'video' }]"
        @click="activeTab = 'video'"
      >
        Video Demos ({{ videos.length }})
      </button>
    </div>

    <div v-if="activeTab === 'screenshots'" class="gallery-grid">
      <button
        v-for="(item, i) in screenshots"
        :key="i"
        type="button"
        class="gallery-item"
        @click="openLightbox(i)"
      >
        <img :src="item.thumbnail || item.url" :alt="item.caption || `${appName} screenshot ${i + 1}`" />
        <span class="gallery-zoom" aria-hidden="true">
          <Icon name="heroicons:magnifying-glass-plus" />
        </span>
      </button>
    </div>

    <div v-else class="gallery-videos">
      <div v-for="(v, i) in videos" :key="i" class="gallery-video">
        <video
          :src="v.url"
          :poster="v.thumbnail"
          controls
          preload="metadata"
        >
          <track kind="captions" />
        </video>
        <p v-if="v.caption" class="video-caption">{{ v.caption }}</p>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lb">
        <div
          v-if="lightboxIndex !== null"
          class="lightbox"
          @click.self="closeLightbox"
        >
          <button type="button" class="lb-close" aria-label="Close" @click="closeLightbox">
            <Icon name="heroicons:x-mark" />
          </button>
          <button
            v-if="currentList.length > 1"
            type="button"
            class="lb-nav lb-prev"
            aria-label="Previous"
            @click="prev"
          >
            <Icon name="heroicons:chevron-left" />
          </button>
          <div class="lb-content">
            <img
              v-if="currentList[lightboxIndex]?.type === 'image'"
              :src="currentList[lightboxIndex]?.url"
              :alt="currentList[lightboxIndex]?.caption"
            />
            <p v-if="currentList[lightboxIndex]?.caption" class="lb-caption">
              {{ currentList[lightboxIndex]?.caption }}
            </p>
            <p class="lb-counter">{{ lightboxIndex + 1 }} / {{ currentList.length }}</p>
          </div>
          <button
            v-if="currentList.length > 1"
            type="button"
            class="lb-nav lb-next"
            aria-label="Next"
            @click="next"
          >
            <Icon name="heroicons:chevron-right" />
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.gallery-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  border-bottom: 0.5px solid #e5e7eb;
}
.gallery-tab {
  padding: 8px 14px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: color 150ms ease, border-color 150ms ease;
}
.gallery-tab:hover { color: #1f2937; }
.gallery-tab.active { color: #b45309; border-bottom-color: #ff8838; }

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.gallery-item {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  padding: 0;
  cursor: pointer;
  transition: border-color 150ms ease;
}
.gallery-item:hover { border-color: #ff8838; }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
.gallery-zoom {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(17, 24, 39, 0.7);
  color: #ffffff;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 150ms ease;
}
.gallery-zoom :deep(svg) { width: 14px; height: 14px; }
.gallery-item:hover .gallery-zoom { opacity: 1; }

.gallery-videos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.gallery-video video {
  width: 100%;
  aspect-ratio: 16/9;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  background: #000;
}
.video-caption {
  margin: 6px 0 0;
  font-size: 12px;
  color: #6b7280;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.92);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.lb-close, .lb-nav {
  position: absolute;
  background: rgba(255, 255, 255, 0.08);
  border: 0.5px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 150ms ease;
}
.lb-close :deep(svg), .lb-nav :deep(svg) { width: 20px; height: 20px; }
.lb-close:hover, .lb-nav:hover { background: rgba(255, 255, 255, 0.16); }
.lb-close { top: 20px; right: 20px; }
.lb-prev { left: 20px; top: 50%; transform: translateY(-50%); }
.lb-next { right: 20px; top: 50%; transform: translateY(-50%); }

.lb-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.lb-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}
.lb-caption { color: #ffffff; font-size: 14px; margin: 0; }
.lb-counter { color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0; }

.lb-enter-from, .lb-leave-to { opacity: 0; }
.lb-enter-active, .lb-leave-active { transition: opacity 200ms ease; }

@media (max-width: 700px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .gallery-videos { grid-template-columns: 1fr; }
  .lightbox { padding: 16px; }
  .lb-close { top: 12px; right: 12px; }
  .lb-prev { left: 8px; }
  .lb-next { right: 8px; }
}
</style>
