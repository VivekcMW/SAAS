<template>
  <div class="br-detail" v-if="roomData">
    <div class="br-detail__hero">
      <div class="container">
        <NuxtLink to="/buying-room" class="back-link">← Buying Rooms</NuxtLink>
        <div class="br-detail__title-row">
          <h1>{{ roomData.room.title }}</h1>
          <span :class="['room-badge', roomData.room.status === 'active' ? 'room-badge--active' : 'room-badge--closed']">{{ roomData.room.status }}</span>
        </div>
        <p v-if="roomData.room.description" class="br-detail__desc">{{ roomData.room.description }}</p>
      </div>
    </div>

    <div class="container br-detail__body">
      <div class="br-layout">
        <!-- Main: Apps -->
        <main class="br-main">
          <div class="section-header">
            <h2>Shortlisted apps</h2>
            <button class="btn-sm-primary" @click="showAddApp = !showAddApp">+ Add app</button>
          </div>

          <!-- Add app form -->
          <form v-if="showAddApp" class="add-app-form" @submit.prevent="addApp">
            <input v-model="addAppId" type="text" placeholder="App ID (from marketplace URL)" required />
            <textarea v-model="addAppNotes" placeholder="Notes (optional)" rows="2"></textarea>
            <div class="add-app-form__actions">
              <button type="submit" :disabled="addingApp">{{ addingApp ? 'Adding…' : 'Add app' }}</button>
              <button type="button" @click="showAddApp = false">Cancel</button>
            </div>
            <p v-if="addAppError" class="form-error">{{ addAppError }}</p>
          </form>

          <p v-if="!roomData.apps?.length" class="muted">No apps shortlisted yet.</p>
          <div v-else class="app-grid">
            <div v-for="app in roomData.apps" :key="app.id" class="app-card">
              <div class="app-card__header">
                <img v-if="app.logo_url" :src="app.logo_url" :alt="app.name" width="32" height="32" class="app-card__logo" />
                <div v-else class="app-card__logo-placeholder">{{ app.name?.[0] }}</div>
                <NuxtLink :to="`/app/${app.app_id}`" class="app-card__name">{{ app.name }}</NuxtLink>
                <span :class="['app-status', `app-status--${app.status}`]">{{ app.status }}</span>
              </div>
              <p v-if="app.notes" class="app-card__notes">{{ app.notes }}</p>
              <div class="app-card__footer">
                <button class="vote-btn" @click="voteApp(app.id)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                  {{ app.vote_score }}
                </button>
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div class="comments-section">
            <h3>Discussion</h3>
            <p v-if="!roomData.comments?.length" class="muted">No comments yet.</p>
            <div v-else class="comment-list">
              <div v-for="c in roomData.comments" :key="c.id" class="comment">
                <div class="comment__header">
                  <span class="comment__author">{{ c.author_name }}</span>
                  <span v-if="c.app_name" class="comment__app">re: {{ c.app_name }}</span>
                  <span class="comment__date">{{ fmtDate(c.created_at) }}</span>
                </div>
                <p class="comment__body">{{ c.body }}</p>
              </div>
            </div>
            <form class="comment-form" @submit.prevent="postComment">
              <textarea v-model="newComment" rows="2" placeholder="Add a comment…" required></textarea>
              <button type="submit" :disabled="postingComment">{{ postingComment ? 'Posting…' : 'Post' }}</button>
              <p v-if="commentError" class="form-error">{{ commentError }}</p>
            </form>
          </div>
        </main>

        <!-- Sidebar: Members & Invite -->
        <aside class="br-sidebar">
          <div class="sidebar-card">
            <h3>Members</h3>
            <ul class="member-list">
              <li class="member-item">
                <span class="member-avatar">You</span>
                <span class="member-role">owner</span>
              </li>
              <li v-for="m in roomData.members" :key="m.id" class="member-item">
                <span class="member-avatar">{{ (m.name || m.email)?.[0]?.toUpperCase() }}</span>
                <div class="member-info">
                  <span class="member-name">{{ m.name || m.email }}</span>
                </div>
                <span class="member-role">{{ m.role }}</span>
              </li>
            </ul>

            <div v-if="roomData.is_owner" class="invite-form">
              <h4>Invite member</h4>
              <form @submit.prevent="inviteMember">
                <input v-model="inviteEmail" type="email" placeholder="Email address" required />
                <button type="submit" :disabled="inviting">{{ inviting ? 'Inviting…' : 'Invite' }}</button>
              </form>
              <p v-if="inviteError" class="form-error">{{ inviteError }}</p>
              <p v-if="inviteSuccess" class="form-success">{{ inviteSuccess }}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: roomData, refresh } = await useAsyncData(`br-${slug.value}`, () => $fetch(`/api/buying-rooms/${slug.value}`))
useSeoMeta({ title: computed(() => roomData.value ? `${(roomData.value as any).room.title} — Buying Room` : 'Buying Room') })

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Add app
const showAddApp = ref(false)
const addAppId = ref('')
const addAppNotes = ref('')
const addingApp = ref(false)
const addAppError = ref('')

async function addApp() {
  addAppError.value = ''
  addingApp.value = true
  try {
    await $fetch(`/api/buying-rooms/${slug.value}/apps`, { method: 'POST', body: { app_id: addAppId.value, notes: addAppNotes.value } })
    addAppId.value = ''
    addAppNotes.value = ''
    showAddApp.value = false
    await refresh()
  } catch (e: any) {
    addAppError.value = e?.data?.statusMessage || 'Failed to add app.'
  } finally {
    addingApp.value = false
  }
}

async function voteApp(roomAppId: string) {
  try {
    await $fetch(`/api/buying-rooms/${slug.value}/apps/${roomAppId}/vote`, { method: 'POST' })
    await refresh()
  } catch {}
}

// Comments
const newComment = ref('')
const postingComment = ref(false)
const commentError = ref('')

async function postComment() {
  commentError.value = ''
  postingComment.value = true
  try {
    await $fetch(`/api/buying-rooms/${slug.value}/comments`, { method: 'POST', body: { body: newComment.value } })
    newComment.value = ''
    await refresh()
  } catch (e: any) {
    commentError.value = e?.data?.statusMessage || 'Failed to post comment.'
  } finally {
    postingComment.value = false
  }
}

// Invite
const inviteEmail = ref('')
const inviting = ref(false)
const inviteError = ref('')
const inviteSuccess = ref('')

async function inviteMember() {
  inviteError.value = ''
  inviteSuccess.value = ''
  inviting.value = true
  try {
    await $fetch(`/api/buying-rooms/${slug.value}/invite`, { method: 'POST', body: { email: inviteEmail.value } })
    inviteSuccess.value = `Invited ${inviteEmail.value}`
    inviteEmail.value = ''
    await refresh()
  } catch (e: any) {
    inviteError.value = e?.data?.statusMessage || 'Failed to invite.'
  } finally {
    inviting.value = false
  }
}
</script>

<style scoped>
.br-detail__hero { background: #0f172a; color: #fff; padding: 2rem 1.5rem; }
.back-link { display: inline-block; color: #a5b4fc; font-size: 0.8rem; text-decoration: none; margin-bottom: 0.75rem; }
.br-detail__title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 0.25rem; }
.br-detail__title-row h1 { font-size: 1.5rem; font-weight: 800; }
.room-badge { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: capitalize; }
.room-badge--active { background: #d1fae5; color: #065f46; }
.room-badge--closed { background: #e5e7eb; color: #4b5563; }
.br-detail__desc { opacity: 0.7; font-size: 0.875rem; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
.br-detail__body { padding-top: 2rem; padding-bottom: 3rem; }
.br-layout { display: grid; grid-template-columns: 1fr 260px; gap: 2rem; }
@media (max-width: 768px) { .br-layout { grid-template-columns: 1fr; } }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section-header h2 { font-size: 1.1rem; font-weight: 700; }
.btn-sm-primary { background: #6366f1; color: #fff; border: none; border-radius: 7px; padding: 6px 14px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.add-app-form { border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 8px; }
.add-app-form input, .add-app-form textarea { border: 1px solid #d1d5db; border-radius: 7px; padding: 7px 10px; font-size: 0.875rem; font-family: inherit; }
.add-app-form__actions { display: flex; gap: 8px; }
.add-app-form__actions button { border-radius: 6px; padding: 6px 14px; font-size: 0.8rem; cursor: pointer; font-weight: 600; }
.add-app-form__actions button[type=submit] { background: #6366f1; color: #fff; border: none; }
.add-app-form__actions button[type=button] { background: none; border: 1px solid #d1d5db; }
.app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 2rem; }
.app-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.875rem; }
.app-card__header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.app-card__logo { border-radius: 6px; object-fit: contain; }
.app-card__logo-placeholder { width: 32px; height: 32px; background: #e0e7ff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #4f46e5; font-size: 0.875rem; }
.app-card__name { font-weight: 600; font-size: 0.85rem; text-decoration: none; color: #111827; flex: 1; }
.app-card__name:hover { color: #4f46e5; }
.app-status { font-size: 0.68rem; padding: 1px 7px; border-radius: 12px; font-weight: 600; flex-shrink: 0; }
.app-status--shortlisted { background: #eff6ff; color: #1d4ed8; }
.app-status--approved { background: #d1fae5; color: #065f46; }
.app-status--rejected { background: #fef2f2; color: #b91c1c; }
.app-card__notes { font-size: 0.78rem; color: #6b7280; margin-bottom: 6px; }
.app-card__footer { display: flex; justify-content: flex-end; }
.vote-btn { display: flex; align-items: center; gap: 4px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 10px; font-size: 0.8rem; font-weight: 600; cursor: pointer; color: #374151; }
.vote-btn:hover { background: #e0e7ff; color: #4f46e5; border-color: #a5b4fc; }
.comments-section { margin-top: 2rem; }
.comments-section h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; }
.comment-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1rem; }
.comment { border: 1px solid #f3f4f6; border-radius: 8px; padding: 0.75rem; }
.comment__header { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
.comment__author { font-weight: 600; font-size: 0.82rem; }
.comment__app { font-size: 0.75rem; color: #6366f1; }
.comment__date { margin-left: auto; font-size: 0.72rem; color: #9ca3af; }
.comment__body { font-size: 0.85rem; line-height: 1.5; color: #374151; }
.comment-form { display: flex; flex-direction: column; gap: 8px; }
.comment-form textarea { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-size: 0.875rem; font-family: inherit; resize: none; }
.comment-form button { background: #6366f1; color: #fff; border: none; border-radius: 7px; padding: 7px 18px; font-size: 0.85rem; font-weight: 600; cursor: pointer; align-self: flex-start; }
.sidebar-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; }
.sidebar-card h3 { font-size: 0.875rem; font-weight: 700; margin-bottom: 0.75rem; }
.member-list { list-style: none; padding: 0; margin: 0 0 1rem; display: flex; flex-direction: column; gap: 8px; }
.member-item { display: flex; align-items: center; gap: 8px; }
.member-avatar { width: 28px; height: 28px; background: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; color: #4f46e5; flex-shrink: 0; }
.member-info { flex: 1; }
.member-name { font-size: 0.82rem; font-weight: 500; }
.member-role { font-size: 0.7rem; background: #f3f4f6; color: #6b7280; padding: 1px 7px; border-radius: 12px; text-transform: capitalize; }
.invite-form h4 { font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; color: #374151; }
.invite-form form { display: flex; flex-direction: column; gap: 6px; }
.invite-form input { border: 1px solid #d1d5db; border-radius: 7px; padding: 7px 10px; font-size: 0.82rem; font-family: inherit; }
.invite-form button { background: #6366f1; color: #fff; border: none; border-radius: 6px; padding: 7px 14px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.form-error { color: #dc2626; font-size: 0.78rem; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 6px 10px; margin-top: 4px; }
.form-success { color: #065f46; font-size: 0.78rem; background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 6px; padding: 6px 10px; margin-top: 4px; }
.muted { color: #9ca3af; font-size: 0.875rem; }
</style>
