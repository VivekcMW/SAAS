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
.br-index__hero { background: #0f172a; color: #fff; padding: 2.5rem 1.5rem; }
.br-index__hero h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
.br-index__hero p { opacity: 0.75; font-size: 0.95rem; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
.br-index__body { padding-top: 2rem; padding-bottom: 3rem; }
.br-index__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.br-index__header h2 { font-size: 1.25rem; font-weight: 700; }
.btn-create { background: #6366f1; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
.btn-create:hover { background: #4f46e5; }
.room-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.room-card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.25rem; text-decoration: none; color: inherit; transition: border-color 0.15s, box-shadow 0.15s; }
.room-card:hover { border-color: #6366f1; box-shadow: 0 2px 8px rgba(99,102,241,0.12); }
.room-card__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
.room-card__header h3 { font-size: 0.9rem; font-weight: 700; }
.room-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: capitalize; flex-shrink: 0; }
.room-badge--active { background: #d1fae5; color: #065f46; }
.room-badge--closed { background: #f3f4f6; color: #6b7280; }
.room-card__desc { font-size: 0.8rem; color: #6b7280; margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.room-card__meta { display: flex; gap: 10px; font-size: 0.75rem; color: #9ca3af; }
.room-card__role { margin-left: auto; background: #eff6ff; color: #1d4ed8; padding: 1px 7px; border-radius: 12px; font-weight: 600; text-transform: capitalize; }
.empty-state { font-size: 0.9rem; color: #6b7280; }
.muted { color: #9ca3af; font-size: 0.875rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal { background: #fff; border-radius: 14px; padding: 1.5rem; max-width: 440px; width: 100%; }
.modal h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 0.875rem; }
.form-group label { font-size: 0.85rem; font-weight: 600; }
.req { color: #ef4444; }
.form-group input, .form-group textarea { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-size: 0.875rem; font-family: inherit; }
.form-group textarea { resize: vertical; }
.form-error { color: #dc2626; font-size: 0.875rem; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 8px 12px; margin-bottom: 0.75rem; }
.modal__actions { display: flex; gap: 8px; margin-top: 0.25rem; }
.modal__actions button { border-radius: 7px; padding: 8px 18px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
.modal__actions button[type=submit] { background: #6366f1; color: #fff; border: none; }
.modal__actions button[type=button] { background: none; border: 1px solid #e5e7eb; }
</style>
