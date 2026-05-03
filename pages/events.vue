<template>
  <div class="events-page">
    <section class="events-page__hero">
      <div class="events-page__hero-inner">
        <h1 class="events-page__title">Events</h1>
        <p class="events-page__subtitle">Webinars, demos, and industry meetups for SaaS buyers and vendors.</p>
      </div>
    </section>

    <!-- Featured event -->
    <section v-if="data?.featured" class="events-page__featured">
      <div class="events-page__container">
        <div class="event-featured">
          <img v-if="data.featured.coverImage" :src="data.featured.coverImage" :alt="data.featured.title" class="event-featured__img" />
          <div class="event-featured__body">
            <span class="bw-chip bw-chip--primary">Featured</span>
            <h2 class="event-featured__title">{{ data.featured.title }}</h2>
            <p class="event-featured__summary">{{ data.featured.summary }}</p>
            <div class="event-featured__meta">
              <span>{{ fmtDate(data.featured.startsAt) }}</span>
              <span v-if="!data.featured.isOnline"> · {{ data.featured.location }}</span>
              <span v-else> · Online</span>
              <span v-if="data.featured.hostName"> · Hosted by {{ data.featured.hostName }}</span>
            </div>
            <a
              v-if="data.featured.registerUrl"
              :href="data.featured.registerUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="bw-btn bw-btn--primary"
            >Register now</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Tabs -->
    <section class="events-page__list">
      <div class="events-page__container">
        <div class="events-page__tabs">
          <button
            class="events-page__tab"
            :class="{ 'events-page__tab--active': tab === 'upcoming' }"
            @click="tab = 'upcoming'"
          >Upcoming ({{ data?.upcoming?.length ?? 0 }})</button>
          <button
            class="events-page__tab"
            :class="{ 'events-page__tab--active': tab === 'past' }"
            @click="tab = 'past'"
          >Past ({{ data?.past?.length ?? 0 }})</button>
        </div>

        <div v-if="pending" class="events-page__loading">Loading events…</div>
        <div v-else-if="error" class="events-page__error">Could not load events. Please try again later.</div>
        <div v-else>
          <div class="events-grid">
            <div
              v-for="ev in activeList"
              :key="ev.id"
              class="event-card"
            >
              <img v-if="ev.coverImage" :src="ev.coverImage" :alt="ev.title" class="event-card__img" />
              <div class="event-card__body">
                <div class="event-card__chips">
                  <span class="bw-chip bw-chip--neutral bw-chip--sm">{{ ev.category }}</span>
                  <span class="bw-chip bw-chip--neutral bw-chip--sm">{{ ev.isOnline ? 'Online' : 'In-person' }}</span>
                </div>
                <h3 class="event-card__title">{{ ev.title }}</h3>
                <p class="event-card__summary">{{ ev.summary }}</p>
                <div class="event-card__meta">
                  <span>{{ fmtDate(ev.startsAt) }}</span>
                  <span v-if="!ev.isOnline"> · {{ ev.location }}</span>
                  <span v-if="ev.hostName"> · {{ ev.hostName }}</span>
                </div>
                <a
                  v-if="ev.registerUrl && tab === 'upcoming'"
                  :href="ev.registerUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="bw-btn bw-btn--ghost bw-btn--sm"
                  style="margin-top: 12px;"
                >Register</a>
              </div>
            </div>
            <div v-if="activeList.length === 0" class="events-page__empty">
              No {{ tab }} events right now. Check back soon!
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

useSeoMeta({
  title: 'Events — SaasWorld',
  description: 'Discover upcoming SaaS webinars, product demos, and industry meetups.',
})

interface EventItem {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  eventType: string
  location: string
  isOnline: boolean
  startsAt: string
  endsAt: string | null
  timezone: string
  coverImage: string | null
  registerUrl: string | null
  hostName: string | null
  featured: boolean
}

interface EventsResponse {
  upcoming: EventItem[]
  past: EventItem[]
  featured: EventItem | null
}

const { data, pending, error } = await useFetch<EventsResponse>('/api/events', {
  default: () => ({ upcoming: [], past: [], featured: null }),
})

const tab = ref<'upcoming' | 'past'>('upcoming')
const activeList = computed(() => tab.value === 'upcoming' ? (data.value?.upcoming ?? []) : (data.value?.past ?? []))

function fmtDate(iso: string) {
  const { fmtDate: fmt } = useFmt()
  return fmt(iso, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.events-page { }

.events-page__hero {
  background: var(--bw-surface-2, #f8f9fb);
  padding: 56px 24px 32px;
  border-bottom: 1px solid var(--bw-border, #e5e7eb);
}
.events-page__hero-inner { max-width: 900px; margin: 0 auto; }
.events-page__title { font-size: 2rem; font-weight: 700; margin: 0 0 8px; }
.events-page__subtitle { color: var(--bw-text-2, #6b7280); margin: 0; }

.events-page__container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

.events-page__featured { padding: 40px 0; }
.event-featured {
  display: flex;
  gap: 32px;
  background: var(--bw-surface, #fff);
  border: 1px solid var(--bw-border, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
}
.event-featured__img { width: 40%; object-fit: cover; }
.event-featured__body { padding: 32px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
.event-featured__title { font-size: 1.4rem; font-weight: 700; margin: 0; }
.event-featured__summary { color: var(--bw-text-2, #6b7280); margin: 0; }
.event-featured__meta { font-size: 0.82rem; color: var(--bw-text-3, #9ca3af); }

.events-page__list { padding: 40px 0 64px; }
.events-page__tabs { display: flex; gap: 4px; margin-bottom: 24px; }
.events-page__tab {
  padding: 8px 20px; border-radius: 8px; border: 1px solid var(--bw-border, #e5e7eb);
  background: none; cursor: pointer; font-size: 0.875rem; color: var(--bw-text-2, #6b7280);
  transition: background 0.15s;
}
.events-page__tab--active {
  background: var(--bw-primary, #2563eb); color: #fff; border-color: var(--bw-primary, #2563eb);
}
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.event-card {
  background: var(--bw-surface, #fff);
  border: 1px solid var(--bw-border, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.event-card__img { width: 100%; height: 160px; object-fit: cover; }
.event-card__body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.event-card__chips { display: flex; gap: 6px; flex-wrap: wrap; }
.event-card__title { font-weight: 600; font-size: 0.95rem; margin: 0; }
.event-card__summary { font-size: 0.82rem; color: var(--bw-text-2, #6b7280); margin: 0; flex: 1; }
.event-card__meta { font-size: 0.75rem; color: var(--bw-text-3, #9ca3af); }

.events-page__loading,
.events-page__error,
.events-page__empty { color: var(--bw-text-2, #6b7280); padding: 32px 0; text-align: center; }

@media (max-width: 640px) {
  .event-featured { flex-direction: column; }
  .event-featured__img { width: 100%; height: 200px; }
}
</style>
