<script setup lang="ts">
useHead({
  title: 'Events & News — SaaSWorld',
  meta: [
    {
      name: 'description',
      content:
        'Upcoming webinars, product launches, meetups and workshops from SaaSWorld and our vendor community. Join a live session or submit your own event.'
    }
  ]
})

interface PublicEvent {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  eventType: 'webinar' | 'conference' | 'meetup' | 'launch' | 'workshop' | 'other'
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
  upcoming: PublicEvent[]
  past: PublicEvent[]
  featured: PublicEvent | null
}

const { data, pending, refresh } = await useFetch<EventsResponse>('/api/events', {
  key: 'public-events',
  default: () => ({ upcoming: [], past: [], featured: null })
})

const activeView = ref<'upcoming' | 'past'>('upcoming')
const activeType = ref<string>('all')

const list = computed(() => {
  const source = activeView.value === 'upcoming' ? data.value?.upcoming || [] : data.value?.past || []
  if (activeType.value === 'all') return source
  return source.filter((e) => e.eventType === activeType.value)
})

const availableTypes = computed(() => {
  const source = activeView.value === 'upcoming' ? data.value?.upcoming || [] : data.value?.past || []
  const set = new Set(source.map((e) => e.eventType))
  return Array.from(set)
})

function typeLabel(t: string): string {
  switch (t) {
    case 'webinar': return 'Webinar'
    case 'conference': return 'Conference'
    case 'meetup': return 'Meetup'
    case 'launch': return 'Launch'
    case 'workshop': return 'Workshop'
    default: return 'Event'
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return iso
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

function splitDate(iso: string): { month: string; day: string } {
  try {
    const d = new Date(iso)
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: d.toLocaleDateString('en-US', { day: '2-digit' })
    }
  } catch {
    return { month: '--', day: '--' }
  }
}

// Submit form state
const showForm = ref(false)
const form = reactive({
  title: '',
  summary: '',
  description: '',
  eventType: 'webinar',
  category: 'Product',
  location: 'Online',
  isOnline: true,
  startsAt: '',
  endsAt: '',
  timezone: 'UTC',
  registerUrl: '',
  hostName: '',
  hostEmail: ''
})
const submitting = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref(false)

async function submitEvent() {
  submitError.value = null
  submitSuccess.value = false
  submitting.value = true
  try {
    await $fetch('/api/events/submit', {
      method: 'POST',
      body: {
        title: form.title,
        summary: form.summary,
        description: form.description,
        eventType: form.eventType,
        category: form.category,
        location: form.location,
        isOnline: form.isOnline,
        startsAt: form.startsAt,
        endsAt: form.endsAt || null,
        timezone: form.timezone,
        registerUrl: form.registerUrl || null,
        hostName: form.hostName,
        hostEmail: form.hostEmail
      }
    })
    submitSuccess.value = true
    // Reset form
    form.title = ''
    form.summary = ''
    form.description = ''
    form.startsAt = ''
    form.endsAt = ''
    form.registerUrl = ''
    form.hostName = ''
    form.hostEmail = ''
  } catch (err: unknown) {
    const e = err as { statusMessage?: string; data?: { statusMessage?: string } }
    submitError.value = e.statusMessage || e.data?.statusMessage || 'Could not submit event. Please try again.'
  } finally {
    submitting.value = false
  }
}

function openSubmit() {
  showForm.value = true
  submitSuccess.value = false
  submitError.value = null
  nextTick(() => {
    const el = document.getElementById('submit-event')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>

<template>
  <div class="news">
    <!-- Intro -->
    <header class="news__intro">
      <div class="news__wrap">
        <span class="news__label">Events &amp; news</span>
        <h1 class="news__headline">What’s happening on SaaSWorld.</h1>
        <p class="news__lede">
          Live webinars, product launches, workshops and meetups from our team and the
          vendor community. Join a session, or host your own.
        </p>
        <div class="news__cta-row">
          <button type="button" class="btn btn--primary" @click="openSubmit">
            Host an event
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </button>
          <a href="#upcoming" class="btn btn--ghost">Browse upcoming</a>
        </div>
      </div>
    </header>

    <!-- Featured -->
    <section v-if="data?.featured" class="news__feature">
      <div class="news__wrap">
        <article class="feature">
          <div class="feature__date" aria-hidden="true">
            <span class="feature__date-month">{{ splitDate(data.featured.startsAt).month }}</span>
            <span class="feature__date-day">{{ splitDate(data.featured.startsAt).day }}</span>
          </div>
          <div class="feature__body">
            <div class="feature__meta">
              <span class="feature__tag">{{ typeLabel(data.featured.eventType) }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ formatDate(data.featured.startsAt) }} · {{ formatTime(data.featured.startsAt) }} {{ data.featured.timezone }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ data.featured.isOnline ? 'Online' : data.featured.location }}</span>
            </div>
            <h2 class="feature__title">{{ data.featured.title }}</h2>
            <p class="feature__summary">{{ data.featured.summary }}</p>
            <div class="feature__actions">
              <a
                v-if="data.featured.registerUrl"
                :href="data.featured.registerUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn--primary"
              >Register</a>
              <span v-if="data.featured.hostName" class="feature__host">
                Hosted by <strong>{{ data.featured.hostName }}</strong>
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Filter bar -->
    <div id="upcoming" class="news__bar">
      <div class="news__wrap">
        <div class="tabs" role="tablist" aria-label="Event timeline">
          <button
            type="button"
            role="tab"
            class="tab"
            :class="{ 'tab--on': activeView === 'upcoming' }"
            :aria-selected="activeView === 'upcoming'"
            @click="activeView = 'upcoming'; activeType = 'all'"
          >
            Upcoming
            <span class="tab__count">{{ data?.upcoming.length || 0 }}</span>
          </button>
          <button
            type="button"
            role="tab"
            class="tab"
            :class="{ 'tab--on': activeView === 'past' }"
            :aria-selected="activeView === 'past'"
            @click="activeView = 'past'; activeType = 'all'"
          >
            Past
            <span class="tab__count">{{ data?.past.length || 0 }}</span>
          </button>
        </div>

        <div v-if="availableTypes.length > 1" class="types">
          <button
            type="button"
            class="type"
            :class="{ 'type--on': activeType === 'all' }"
            @click="activeType = 'all'"
          >All types</button>
          <button
            v-for="t in availableTypes"
            :key="t"
            type="button"
            class="type"
            :class="{ 'type--on': activeType === t }"
            @click="activeType = t"
          >{{ typeLabel(t) }}</button>
        </div>
      </div>
    </div>

    <!-- List -->
    <section class="news__list">
      <div class="news__wrap">
        <div v-if="pending" class="state state--loading">
          <p>Loading events…</p>
        </div>

        <div v-else-if="list.length === 0" class="state state--empty">
          <h3 v-if="activeView === 'upcoming'">No upcoming events yet.</h3>
          <h3 v-else>No past events to show.</h3>
          <p v-if="activeView === 'upcoming'">
            Be the first to host — share your launch, webinar or workshop with the SaaSWorld community.
          </p>
          <p v-else>Check back after our first live sessions have wrapped.</p>
          <button
            v-if="activeView === 'upcoming'"
            type="button"
            class="btn btn--primary"
            @click="openSubmit"
          >Host an event</button>
        </div>

        <ul v-else class="events">
          <li v-for="ev in list" :key="ev.id" class="event">
            <div class="event__date" aria-hidden="true">
              <span class="event__date-month">{{ splitDate(ev.startsAt).month }}</span>
              <span class="event__date-day">{{ splitDate(ev.startsAt).day }}</span>
            </div>
            <div class="event__body">
              <div class="event__meta">
                <span class="event__tag">{{ typeLabel(ev.eventType) }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ formatTime(ev.startsAt) }} {{ ev.timezone }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ ev.isOnline ? 'Online' : ev.location }}</span>
              </div>
              <h3 class="event__title">{{ ev.title }}</h3>
              <p class="event__summary">{{ ev.summary }}</p>
              <div v-if="ev.hostName" class="event__host">Hosted by <strong>{{ ev.hostName }}</strong></div>
            </div>
            <div class="event__action">
              <a
                v-if="ev.registerUrl && activeView === 'upcoming'"
                :href="ev.registerUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn--primary btn--sm"
              >Register</a>
              <span v-else-if="activeView === 'past'" class="event__ended">Ended</span>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Submit form -->
    <section id="submit-event" class="news__submit">
      <div class="news__wrap">
        <div class="submit-head">
          <span class="news__label">For hosts</span>
          <h2 class="submit-title">Host an event on SaaSWorld.</h2>
          <p class="submit-sub">
            Tell us about your event and we’ll review and publish it. Approved events appear
            in the listing above and get featured in our community digest.
          </p>
        </div>

        <div v-if="submitSuccess" class="notice notice--success">
          <strong>Thanks!</strong> Your event has been submitted for review. We’ll email you once it’s approved.
        </div>

        <form v-if="!submitSuccess || showForm" class="submit-form" @submit.prevent="submitEvent">
          <div class="field">
            <label for="ev-title">Event title</label>
            <input id="ev-title" v-model="form.title" type="text" required placeholder="e.g. Scaling your SaaS pricing in 2026">
          </div>

          <div class="field">
            <label for="ev-summary">Short summary</label>
            <textarea id="ev-summary" v-model="form.summary" rows="2" required placeholder="One or two sentences attendees will see on the listing."></textarea>
          </div>

          <div class="field">
            <label for="ev-description">Description (optional)</label>
            <textarea id="ev-description" v-model="form.description" rows="4" placeholder="Agenda, speakers, what people will learn…"></textarea>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="ev-type">Type</label>
              <select id="ev-type" v-model="form.eventType">
                <option value="webinar">Webinar</option>
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="launch">Launch</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="field">
              <label for="ev-category">Category</label>
              <input id="ev-category" v-model="form.category" type="text" placeholder="e.g. Product, Marketing, Sales">
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="ev-starts">Starts at</label>
              <input id="ev-starts" v-model="form.startsAt" type="datetime-local" required>
            </div>
            <div class="field">
              <label for="ev-ends">Ends at (optional)</label>
              <input id="ev-ends" v-model="form.endsAt" type="datetime-local">
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="ev-tz">Timezone</label>
              <input id="ev-tz" v-model="form.timezone" type="text" placeholder="e.g. IST, UTC, PST">
            </div>
            <div class="field">
              <label class="field__check">
                <input v-model="form.isOnline" type="checkbox">
                <span>This is an online event</span>
              </label>
            </div>
          </div>

          <div v-if="!form.isOnline" class="field">
            <label for="ev-location">Location</label>
            <input id="ev-location" v-model="form.location" type="text" placeholder="Venue, city, country">
          </div>

          <div class="field">
            <label for="ev-url">Registration URL (optional)</label>
            <input id="ev-url" v-model="form.registerUrl" type="url" placeholder="https://…">
          </div>

          <div class="field-row">
            <div class="field">
              <label for="ev-host">Your name</label>
              <input id="ev-host" v-model="form.hostName" type="text" required placeholder="Host name">
            </div>
            <div class="field">
              <label for="ev-email">Your email</label>
              <input id="ev-email" v-model="form.hostEmail" type="email" required placeholder="you@example.com">
            </div>
          </div>

          <div v-if="submitError" class="notice notice--error">{{ submitError }}</div>

          <div class="submit-actions">
            <button type="submit" class="btn btn--primary" :disabled="submitting">
              <span v-if="submitting">Submitting…</span>
              <span v-else>Submit for review</span>
            </button>
            <p class="submit-note">We review every submission within 1–2 business days.</p>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Shell ---------------------------------------------------------- */
.news { background: #ffffff; color: #1e1e1e; }
.news__wrap { max-width: 1080px; margin: 0 auto; padding: 0 1.5rem; }
.news__label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sw-primary, #ff8838);
  margin-bottom: 1rem;
}

/* Intro ---------------------------------------------------------- */
.news__intro {
  padding: 5rem 0 3rem;
  border-bottom: 1px solid #f0efec;
}
.news__headline {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: #1e1e1e;
  margin: 0 0 1rem;
  max-width: 720px;
}
.news__lede {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: #52525b;
  margin: 0 0 1.75rem;
  max-width: 620px;
}
.news__cta-row { display: flex; flex-wrap: wrap; gap: 0.75rem; }

/* Buttons -------------------------------------------------------- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.25rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}
.btn svg { width: 14px; height: 14px; }
.btn--primary {
  background: var(--sw-primary, #ff8838);
  color: #ffffff;
  border-color: var(--sw-primary, #ff8838);
}
.btn--primary:hover:not(:disabled) {
  background: var(--sw-primary-hover, #e67326);
  border-color: var(--sw-primary-hover, #e67326);
  transform: translateY(-1px);
}
.btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn--ghost {
  background: transparent;
  color: #1e1e1e;
  border-color: #e4e4e7;
}
.btn--ghost:hover { border-color: #1e1e1e; }
.btn--sm { padding: 0.4rem 0.9rem; font-size: 0.8125rem; }

/* Featured ------------------------------------------------------- */
.news__feature { padding: 3rem 0; }
.feature {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 2rem;
  align-items: center;
  background: var(--sw-primary-soft, #fff1e6);
  border-radius: 20px;
  padding: 2rem;
}
.feature__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem 0.5rem;
  box-shadow: 0 4px 14px rgba(255, 136, 56, 0.1);
}
.feature__date-month {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--sw-primary, #ff8838);
}
.feature__date-day {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: #1e1e1e;
  margin-top: 0.25rem;
}
.feature__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #71717a;
  margin-bottom: 0.75rem;
}
.feature__tag {
  background: #ffffff;
  color: var(--sw-primary, #ff8838);
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.6875rem;
}
.feature__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: clamp(1.375rem, 2.4vw, 1.875rem);
  font-weight: 700;
  line-height: 1.2;
  color: #1e1e1e;
  margin: 0 0 0.75rem;
}
.feature__summary {
  font-size: 1rem;
  line-height: 1.6;
  color: #3f3f46;
  margin: 0 0 1.25rem;
}
.feature__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}
.feature__host { color: #52525b; font-size: 0.875rem; }

/* Filter bar ----------------------------------------------------- */
.news__bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: saturate(180%) blur(8px);
  border-top: 1px solid #f0efec;
  border-bottom: 1px solid #f0efec;
}
.news__bar .news__wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
  flex-wrap: wrap;
}
.tabs { display: flex; gap: 0.25rem; }
.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #71717a;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  position: relative;
  transition: color 0.15s ease;
}
.tab:hover { color: #1e1e1e; }
.tab--on { color: #1e1e1e; font-weight: 600; }
.tab--on::after {
  content: '';
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: -0.85rem;
  height: 2px;
  background: var(--sw-primary, #ff8838);
}
.tab__count {
  font-size: 0.75rem;
  background: #f5f5f4;
  color: #71717a;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
}
.tab--on .tab__count {
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
}

.types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.type {
  background: #ffffff;
  border: 1px solid #e4e4e7;
  color: #52525b;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}
.type:hover { border-color: var(--sw-primary, #ff8838); color: #1e1e1e; }
.type--on {
  background: #1e1e1e;
  border-color: #1e1e1e;
  color: #ffffff;
}

/* List ----------------------------------------------------------- */
.news__list { padding: 3rem 0 4rem; }
.events {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}
.event {
  display: grid;
  grid-template-columns: 88px 1fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #f0efec;
}
.event:last-child { border-bottom: none; }
.event__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fbfaf8;
  border: 1px solid #f0efec;
  border-radius: 12px;
  padding: 0.75rem 0.25rem;
}
.event__date-month {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--sw-primary, #ff8838);
}
.event__date-day {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.625rem;
  font-weight: 700;
  line-height: 1;
  color: #1e1e1e;
  margin-top: 0.2rem;
}
.event__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #71717a;
  margin-bottom: 0.4rem;
}
.event__tag {
  color: var(--sw-primary, #ff8838);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.event__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.3;
  color: #1e1e1e;
  margin: 0 0 0.35rem;
}
.event__summary {
  font-size: 0.9375rem;
  line-height: 1.55;
  color: #52525b;
  margin: 0 0 0.35rem;
}
.event__host { font-size: 0.8125rem; color: #71717a; }
.event__action { white-space: nowrap; }
.event__ended {
  font-size: 0.75rem;
  color: #a1a1aa;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 600;
}

/* State ---------------------------------------------------------- */
.state {
  text-align: center;
  padding: 4rem 1.5rem;
  border: 1px dashed #e4e4e7;
  border-radius: 16px;
  background: #fbfaf8;
}
.state h3 {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0 0 0.5rem;
}
.state p { color: #52525b; margin: 0 0 1.5rem; font-size: 0.9375rem; }
.state--loading p { color: #71717a; }

/* Submit form ---------------------------------------------------- */
.news__submit {
  padding: 4.5rem 0 6rem;
  border-top: 1px solid #f0efec;
  background: #fbfaf8;
}
.submit-head { max-width: 640px; margin: 0 auto 2rem; text-align: center; }
.submit-title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 0.75rem;
  color: #1e1e1e;
}
.submit-sub { color: #52525b; font-size: 1rem; line-height: 1.6; margin: 0; }

.submit-form {
  max-width: 640px;
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #efefef;
}
.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1e1e1e;
}
.field input[type='text'],
.field input[type='email'],
.field input[type='url'],
.field input[type='datetime-local'],
.field select,
.field textarea {
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  font-size: 0.9375rem;
  font-family: inherit;
  color: #1e1e1e;
  background: #ffffff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--sw-primary, #ff8838);
  box-shadow: 0 0 0 3px rgba(255, 136, 56, 0.12);
}
.field textarea { resize: vertical; min-height: 4rem; }
.field__check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1e1e1e;
  cursor: pointer;
  padding-top: 1.4rem;
}
.field__check input { width: 16px; height: 16px; }
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.submit-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}
.submit-note { font-size: 0.8125rem; color: #71717a; margin: 0; }

.notice {
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  max-width: 640px;
  margin: 0 auto;
}
.notice--success {
  background: var(--sw-primary-soft, #fff1e6);
  color: #52370f;
  border: 1px solid #f0d9bf;
  margin-bottom: 1.5rem;
}
.notice--error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Responsive ----------------------------------------------------- */
@media (max-width: 720px) {
  .news__intro { padding: 3.5rem 0 2.5rem; }
  .feature {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 1.5rem;
  }
  .feature__date {
    flex-direction: row;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    align-self: flex-start;
  }
  .feature__date-day { font-size: 1.75rem; margin-top: 0; }
  .event {
    grid-template-columns: 72px 1fr;
    gap: 1rem;
  }
  .event__action {
    grid-column: 1 / -1;
    padding-left: 88px;
  }
  .field-row { grid-template-columns: 1fr; }
  .news__bar .news__wrap {
    flex-direction: column;
    align-items: stretch;
  }
  .tabs { overflow-x: auto; }
}
</style>
