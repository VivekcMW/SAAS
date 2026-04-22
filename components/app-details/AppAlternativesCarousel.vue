<script setup lang="ts">
import { ref } from 'vue'

interface Alternative {
  id: string
  name: string
  logo?: string
  tagline?: string
  rating?: number
  startingPrice?: string
  slug?: string
}

interface Props {
  items: Alternative[]
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Similar Alternatives'
})

const trackRef = ref<HTMLElement>()

const scroll = (dir: 1 | -1) => {
  const track = trackRef.value
  if (!track) return
  track.scrollBy({ left: dir * 320, behavior: 'smooth' })
}
</script>

<template>
  <div class="alt-carousel">
    <div class="alt-nav">
      <button type="button" class="alt-arrow" aria-label="Scroll left" @click="scroll(-1)">
        <Icon name="heroicons:chevron-left" />
      </button>
      <button type="button" class="alt-arrow" aria-label="Scroll right" @click="scroll(1)">
        <Icon name="heroicons:chevron-right" />
      </button>
    </div>

    <div ref="trackRef" class="alt-track">
      <NuxtLink
        v-for="a in items"
        :key="a.id"
        :to="`/marketplace/app/${a.slug || a.id}`"
        class="alt-card"
      >
        <div class="alt-head">
          <div class="alt-logo">
            <img v-if="a.logo" :src="a.logo" :alt="`${a.name} logo`" />
            <span v-else class="alt-initial">{{ a.name.charAt(0) }}</span>
          </div>
          <div class="alt-main">
            <h4 class="alt-name">{{ a.name }}</h4>
            <p v-if="a.tagline" class="alt-tagline">{{ a.tagline }}</p>
          </div>
        </div>
        <div class="alt-meta">
          <span v-if="a.rating" class="alt-rating">
            <Icon name="heroicons:star-solid" />
            {{ a.rating.toFixed(1) }}
          </span>
          <span v-if="a.startingPrice" class="alt-price">{{ a.startingPrice }}</span>
        </div>
        <span class="alt-cta">View details →</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.alt-carousel { position: relative; }

.alt-nav {
  position: absolute;
  right: 0;
  top: -40px;
  display: flex;
  gap: 4px;
}
.alt-arrow {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}
.alt-arrow:hover { background: #f9fafb; color: #1f2937; }
.alt-arrow :deep(svg) { width: 14px; height: 14px; }

.alt-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 2px;
}
.alt-track::-webkit-scrollbar { display: none; }

.alt-card {
  flex: 0 0 300px;
  scroll-snap-align: start;
  padding: 14px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 10px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 150ms ease, background-color 150ms ease;
}
.alt-card:hover { border-color: #ff8838; background: #f9fafb; }

.alt-head { display: flex; gap: 10px; align-items: flex-start; }
.alt-logo {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.alt-logo img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
.alt-initial { font-size: 16px; font-weight: 600; color: #6b7280; }

.alt-main { flex: 1; min-width: 0; }
.alt-name {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.alt-tagline {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alt-meta { display: flex; gap: 10px; font-size: 12px; }
.alt-rating {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #374151;
  font-weight: 500;
}
.alt-rating :deep(svg) { width: 12px; height: 12px; color: #ff8838; }
.alt-price { color: #6b7280; }

.alt-cta {
  font-size: 12px;
  color: #ff8838;
  font-weight: 500;
}
</style>
