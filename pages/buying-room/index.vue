<template>
  <div class="br-index">
    <div class="br-index__hero">
      <div class="container">
        <h1>Buying Rooms</h1>
        <p>Collaborate with your team to evaluate and shortlist SaaS tools together.</p>
      </div>
    </div>

    <div class="container br-index__body">
      <div class="br-index__header">
        <h2>Your rooms</h2>
        <button class="btn-create" @click="showCreate = true">+ New room</button>
      </div>

      <p v-if="roomsPending" class="muted">Loading…</p>
      <p v-else-if="!rooms?.rooms?.length" class="muted empty-state">
        No buying rooms yet. Create one to start evaluating tools with your team.
      </p>

      <div v-else class="room-grid">
        <NuxtLink
          v-for="room in rooms.rooms"
          :key="room.id"
          :to="`/buying-room/${room.slug}`"
          class="room-card"
        >
          <div class="room-card__header">
            <h3>{{ room.title }}</h3>
            <span :class="['room-badge', room.status === 'active' ? 'room-badge--active' : 'room-badge--closed']">{{ room.status }}</span>
          </div>
          <p v-if="room.description" class="room-card__desc">{{ room.description }}</p>
          <div class="room-card__meta">
            <span>{{ room.app_count }} app{{ room.app_count !== 1 ? 's' : '' }}</span>
            <span>{{ room.member_count }} member{{ room.member_count !== 1 ? 's' : '' }}</span>
            <span class="room-card__role">{{ room.my_role }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Create room modal -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <h4>Create a buying room</h4>
        <form @submit.prevent="createRoom">
          <div class="form-group">
            <label>Room name <span class="req">*</span></label>
            <input v-model="newRoom.title" type="text" placeholder="e.g. Q3 CRM Evaluation" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newRoom.description" rows="3" placeholder="What are you evaluating?"></textarea>
          </div>
          <p v-if="createError" class="form-error">{{ createError }}</p>
          <div class="modal__actions">
            <button type="submit" :disabled="creating">{{ creating ? 'Creating…' : 'Create room' }}</button>
            <button type="button" @click="showCreate = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Buying Rooms — SaasWorld', description: 'Collaborate with your team to shortlist and evaluate SaaS tools.' })

const { data: rooms, pending: roomsPending, refresh } = await useAsyncData('my-buying-rooms', () => $fetch('/api/buying-rooms'))

const showCreate = ref(false)
const newRoom = reactive({ title: '', description: '' })
const creating = ref(false)
const createError = ref('')

async function createRoom() {
  createError.value = ''
  creating.value = true
  try {
    const result: any = await $fetch('/api/buying-rooms', { method: 'POST', body: newRoom })
    showCreate.value = false
    newRoom.title = ''
    newRoom.description = ''
    await navigateTo(`/buying-room/${result.slug}`)
  } catch (e: any) {
    createError.value = e?.data?.statusMessage || 'Failed to create room. Are you signed in?'
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.br-index__hero {
  background: var(--mm-surface);
  color: var(--mm-pearl);
  padding: 2.5rem 1.5rem;
  border-bottom: 0.5px solid var(--mm-border);
}
.br-index__hero h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; font-family: var(--f-ui); }
.br-index__hero p { opacity: 0.75; font-size: 0.95rem; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
.br-index__body { padding-top: 2rem; padding-bottom: 3rem; }
.br-index__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.br-index__header h2 { font-size: 1.25rem; font-weight: 700; color: var(--mm-pearl); }
.btn-create {
  background: var(--mm-gold);
  color: var(--mm-bg);
  border: none;
  border-radius: var(--r-md);
  padding: 8px 18px;
  font-size: var(--t-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--f-ui);
  transition: background 150ms ease;
}
.btn-create:hover { background: color-mix(in srgb, var(--mm-gold) 85%, #000 15%); }
.room-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.room-card {
  background: var(--mm-surface);
  border: 0.5px solid var(--mm-border);
  border-radius: var(--r-lg);
  padding: 1.25rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.room-card:hover {
  border-color: var(--mm-gold);
  box-shadow: 0 2px 12px rgba(212, 168, 67, 0.1);
}
.room-card__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
.room-card__header h3 { font-size: var(--t-sm); font-weight: 700; color: var(--mm-pearl); }
.room-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--r-full);
  text-transform: capitalize;
  flex-shrink: 0;
}
.room-badge--active { background: rgba(42, 157, 143, 0.15); color: var(--mm-teal, #2A9D8F); }
.room-badge--closed { background: var(--mm-surface-3); color: var(--mm-slate); }
.room-card__desc {
  font-size: var(--t-xs);
  color: var(--mm-silver);
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.room-card__meta { display: flex; gap: 10px; font-size: var(--t-xs); color: var(--mm-slate); }
.room-card__role {
  margin-left: auto;
  background: rgba(74, 128, 212, 0.15);
  color: var(--mm-blue, #4A80D4);
  padding: 1px 7px;
  border-radius: var(--r-full);
  font-weight: 600;
  text-transform: capitalize;
}
.empty-state { font-size: var(--t-sm); color: var(--mm-silver); }
.muted { color: var(--mm-slate); font-size: var(--t-sm); }
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal {
  background: var(--mm-surface-2);
  border: 0.5px solid var(--mm-border-md);
  border-radius: var(--r-lg);
  padding: 1.5rem;
  max-width: 440px;
  width: 100%;
}
.modal h4 { font-size: var(--t-base); font-weight: 700; margin-bottom: 1.25rem; color: var(--mm-pearl); }
.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 0.875rem; }
.form-group label { font-size: var(--t-sm); font-weight: 600; color: var(--mm-silver); }
.req { color: var(--mm-err, #dc2626); }
.form-group input,
.form-group textarea {
  background: var(--mm-surface-3);
  border: 0.5px solid var(--mm-border-md);
  border-radius: var(--r-md);
  padding: 8px 12px;
  font-size: var(--t-sm);
  font-family: var(--f-ui);
  color: var(--mm-pearl);
  outline: none;
  transition: border-color 150ms ease;
}
.form-group input::placeholder,
.form-group textarea::placeholder { color: var(--mm-slate); }
.form-group input:focus,
.form-group textarea:focus { border-color: var(--mm-gold); }
.form-group textarea { resize: vertical; }
.form-error {
  color: var(--mm-err, #dc2626);
  font-size: var(--t-sm);
  background: rgba(220, 38, 38, 0.08);
  border: 0.5px solid rgba(220, 38, 38, 0.3);
  border-radius: var(--r-md);
  padding: 8px 12px;
  margin-bottom: 0.75rem;
}
.modal__actions { display: flex; gap: 8px; margin-top: 0.25rem; }
.modal__actions button {
  border-radius: var(--r-md);
  padding: 8px 18px;
  font-size: var(--t-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--f-ui);
  transition: background 150ms ease, border-color 150ms ease;
}
.modal__actions button[type=submit] {
  background: var(--mm-gold);
  color: var(--mm-bg);
  border: none;
}
.modal__actions button[type=submit]:hover { background: color-mix(in srgb, var(--mm-gold) 85%, #000 15%); }
.modal__actions button[type=button] {
  background: none;
  border: 0.5px solid var(--mm-border-md);
  color: var(--mm-silver);
}
.modal__actions button[type=button]:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
</style>
