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
.br-detail__hero {
  background: var(--mm-surface);
  color: var(--mm-pearl);
  padding: 2rem 1.5rem;
  border-bottom: 0.5px solid var(--mm-border);
}
.back-link {
  display: inline-block;
  color: var(--mm-gold);
  font-size: var(--t-xs);
  text-decoration: none;
  margin-bottom: 0.75rem;
  opacity: 0.8;
}
.back-link:hover { opacity: 1; }
.br-detail__title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 0.25rem; }
.br-detail__title-row h1 { font-size: 1.5rem; font-weight: 800; color: var(--mm-pearl); font-family: var(--f-ui); }
.room-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--r-full);
  text-transform: capitalize;
}
.room-badge--active { background: rgba(42, 157, 143, 0.15); color: var(--mm-teal, #2A9D8F); }
.room-badge--closed { background: var(--mm-surface-3); color: var(--mm-slate); }
.br-detail__desc { opacity: 0.7; font-size: var(--t-sm); color: var(--mm-silver); }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
.br-detail__body { padding-top: 2rem; padding-bottom: 3rem; }
.br-layout { display: grid; grid-template-columns: 1fr 260px; gap: 2rem; }
@media (max-width: 768px) { .br-layout { grid-template-columns: 1fr; } }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section-header h2 { font-size: 1.1rem; font-weight: 700; color: var(--mm-pearl); }
.btn-sm-primary {
  background: var(--mm-gold);
  color: var(--mm-bg);
  border: none;
  border-radius: var(--r-md);
  padding: 6px 14px;
  font-size: var(--t-xs);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--f-ui);
  transition: background 150ms ease;
}
.btn-sm-primary:hover { background: color-mix(in srgb, var(--mm-gold) 85%, #000 15%); }
.add-app-form {
  background: var(--mm-surface-2);
  border: 0.5px solid var(--mm-border-md);
  border-radius: var(--r-lg);
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.add-app-form input,
.add-app-form textarea {
  background: var(--mm-surface-3);
  border: 0.5px solid var(--mm-border-md);
  border-radius: var(--r-md);
  padding: 7px 10px;
  font-size: var(--t-sm);
  font-family: var(--f-ui);
  color: var(--mm-pearl);
  outline: none;
  transition: border-color 150ms ease;
}
.add-app-form input::placeholder,
.add-app-form textarea::placeholder { color: var(--mm-slate); }
.add-app-form input:focus,
.add-app-form textarea:focus { border-color: var(--mm-gold); }
.add-app-form__actions { display: flex; gap: 8px; }
.add-app-form__actions button {
  border-radius: var(--r-md);
  padding: 6px 14px;
  font-size: var(--t-xs);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--f-ui);
  transition: background 150ms ease, border-color 150ms ease;
}
.add-app-form__actions button[type=submit] { background: var(--mm-gold); color: var(--mm-bg); border: none; }
.add-app-form__actions button[type=submit]:hover { background: color-mix(in srgb, var(--mm-gold) 85%, #000 15%); }
.add-app-form__actions button[type=button] {
  background: none;
  border: 0.5px solid var(--mm-border-md);
  color: var(--mm-silver);
}
.add-app-form__actions button[type=button]:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
.app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 2rem; }
.app-card {
  background: var(--mm-surface);
  border: 0.5px solid var(--mm-border);
  border-radius: var(--r-lg);
  padding: 0.875rem;
}
.app-card__header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.app-card__logo { border-radius: var(--r-sm); object-fit: contain; }
.app-card__logo-placeholder {
  width: 32px; height: 32px;
  background: rgba(74, 128, 212, 0.15);
  border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  color: var(--mm-blue, #4A80D4);
  font-size: var(--t-sm);
}
.app-card__name { font-weight: 600; font-size: var(--t-sm); text-decoration: none; color: var(--mm-pearl); flex: 1; }
.app-card__name:hover { color: var(--mm-gold); }
.app-status { font-size: 0.68rem; padding: 1px 7px; border-radius: var(--r-full); font-weight: 600; flex-shrink: 0; }
.app-status--shortlisted { background: rgba(74, 128, 212, 0.12); color: var(--mm-blue, #4A80D4); }
.app-status--approved { background: rgba(42, 157, 143, 0.12); color: var(--mm-teal, #2A9D8F); }
.app-status--rejected { background: rgba(220, 38, 38, 0.1); color: var(--mm-err, #dc2626); }
.app-card__notes { font-size: 0.78rem; color: var(--mm-slate); margin-bottom: 6px; }
.app-card__footer { display: flex; justify-content: flex-end; }
.vote-btn {
  display: flex; align-items: center; gap: 4px;
  background: var(--mm-surface-3);
  border: 0.5px solid var(--mm-border);
  border-radius: var(--r-sm);
  padding: 4px 10px;
  font-size: var(--t-xs);
  font-weight: 600;
  cursor: pointer;
  color: var(--mm-silver);
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
}
.vote-btn:hover {
  background: rgba(212, 168, 67, 0.1);
  color: var(--mm-gold);
  border-color: var(--mm-gold);
}
.comments-section { margin-top: 2rem; }
.comments-section h3 { font-size: var(--t-base); font-weight: 700; margin-bottom: 0.75rem; color: var(--mm-pearl); }
.comment-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1rem; }
.comment {
  background: var(--mm-surface);
  border: 0.5px solid var(--mm-border);
  border-radius: var(--r-md);
  padding: 0.75rem;
}
.comment__header { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
.comment__author { font-weight: 600; font-size: var(--t-xs); color: var(--mm-pearl); }
.comment__app { font-size: 0.75rem; color: var(--mm-gold); }
.comment__date { margin-left: auto; font-size: 0.72rem; color: var(--mm-slate); }
.comment__body { font-size: var(--t-sm); line-height: 1.5; color: var(--mm-silver); }
.comment-form { display: flex; flex-direction: column; gap: 8px; }
.comment-form textarea {
  background: var(--mm-surface-2);
  border: 0.5px solid var(--mm-border-md);
  border-radius: var(--r-md);
  padding: 8px 12px;
  font-size: var(--t-sm);
  font-family: var(--f-ui);
  color: var(--mm-pearl);
  resize: none;
  outline: none;
  transition: border-color 150ms ease;
}
.comment-form textarea::placeholder { color: var(--mm-slate); }
.comment-form textarea:focus { border-color: var(--mm-gold); }
.comment-form button {
  background: var(--mm-gold);
  color: var(--mm-bg);
  border: none;
  border-radius: var(--r-md);
  padding: 7px 18px;
  font-size: var(--t-sm);
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  font-family: var(--f-ui);
  transition: background 150ms ease;
}
.comment-form button:hover { background: color-mix(in srgb, var(--mm-gold) 85%, #000 15%); }
.sidebar-card {
  background: var(--mm-surface-2);
  border: 0.5px solid var(--mm-border-md);
  border-radius: var(--r-lg);
  padding: 1rem;
}
.sidebar-card h3 { font-size: var(--t-sm); font-weight: 700; margin-bottom: 0.75rem; color: var(--mm-pearl); }
.member-list { list-style: none; padding: 0; margin: 0 0 1rem; display: flex; flex-direction: column; gap: 8px; }
.member-item { display: flex; align-items: center; gap: 8px; }
.member-avatar {
  width: 28px; height: 28px;
  background: rgba(74, 128, 212, 0.15);
  border-radius: var(--r-full);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--mm-blue, #4A80D4);
  flex-shrink: 0;
}
.member-info { flex: 1; }
.member-name { font-size: 0.82rem; font-weight: 500; color: var(--mm-pearl); }
.member-role {
  font-size: 0.7rem;
  background: var(--mm-surface-3);
  color: var(--mm-slate);
  padding: 1px 7px;
  border-radius: var(--r-full);
  text-transform: capitalize;
}
.invite-form h4 { font-size: 0.82rem; font-weight: 700; margin-bottom: 6px; color: var(--mm-silver); }
.invite-form form { display: flex; flex-direction: column; gap: 6px; }
.invite-form input {
  background: var(--mm-surface-3);
  border: 0.5px solid var(--mm-border-md);
  border-radius: var(--r-md);
  padding: 7px 10px;
  font-size: 0.82rem;
  font-family: var(--f-ui);
  color: var(--mm-pearl);
  outline: none;
  transition: border-color 150ms ease;
}
.invite-form input::placeholder { color: var(--mm-slate); }
.invite-form input:focus { border-color: var(--mm-gold); }
.invite-form button {
  background: var(--mm-gold);
  color: var(--mm-bg);
  border: none;
  border-radius: var(--r-sm);
  padding: 7px 14px;
  font-size: var(--t-xs);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--f-ui);
  transition: background 150ms ease;
}
.invite-form button:hover { background: color-mix(in srgb, var(--mm-gold) 85%, #000 15%); }
.form-error {
  color: var(--mm-err, #dc2626);
  font-size: 0.78rem;
  background: rgba(220, 38, 38, 0.08);
  border: 0.5px solid rgba(220, 38, 38, 0.3);
  border-radius: var(--r-sm);
  padding: 6px 10px;
  margin-top: 4px;
}
.form-success {
  color: var(--mm-teal, #2A9D8F);
  font-size: 0.78rem;
  background: rgba(42, 157, 143, 0.1);
  border: 0.5px solid rgba(42, 157, 143, 0.3);
  border-radius: var(--r-sm);
  padding: 6px 10px;
  margin-top: 4px;
}
.muted { color: var(--mm-slate); font-size: var(--t-sm); }
</style>
