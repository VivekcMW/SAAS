<template>
  <div class="vendor-news">
    <!-- Header -->
    <div class="vn-header">
      <div>
        <h2 class="vn-title">News Posts</h2>
        <p class="vn-sub">Write and publish news about your products for the Moonmart community.</p>
      </div>
      <button class="vn-btn vn-btn--primary" @click="openCreate">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        New Post
      </button>
    </div>

    <!-- Status tabs -->
    <div class="vn-tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="vn-tab"
        :class="{ 'vn-tab--active': activeTab === tab.value }"
        role="tab"
        :aria-selected="activeTab === tab.value"
        @click="setTab(tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.count != null" class="vn-tab__count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="vn-state">
      <div class="vn-spinner" aria-label="Loading…"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!posts.length" class="vn-state vn-state--empty">
      <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <p>No {{ activeTab === 'all' ? '' : activeTab }} posts yet.</p>
      <button class="vn-btn vn-btn--ghost" @click="openCreate">Write your first post</button>
    </div>

    <!-- Post list -->
    <ul v-else class="vn-list">
      <li v-for="post in posts" :key="post.id" class="vn-item">
        <div class="vn-item__left">
          <span class="vn-item__badge" :data-type="post.postType">{{ typeLabel(post.postType) }}</span>
          <div>
            <p class="vn-item__title">{{ post.title }}</p>
            <p class="vn-item__meta">
              Updated {{ relativeDate(post.updatedAt) }}
              <span v-if="post.adminNote" class="vn-item__note">· {{ post.adminNote }}</span>
            </p>
          </div>
        </div>
        <div class="vn-item__right">
          <span class="vn-item__status" :data-status="post.status">{{ post.status }}</span>
          <button v-if="post.status !== 'published'" class="vn-icon-btn" title="Edit" @click="openEdit(post)">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button v-if="post.status === 'draft'" class="vn-icon-btn vn-icon-btn--gold" title="Submit for review" @click="submitPost(post)">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button v-if="post.status !== 'published'" class="vn-icon-btn vn-icon-btn--danger" title="Delete" @click="deletePost(post)">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <NuxtLink v-if="post.status === 'published'" :to="`/news/${post.slug}`" class="vn-icon-btn" title="View live">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </NuxtLink>
        </div>
      </li>
    </ul>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="modalOpen" class="vn-modal-backdrop" @click.self="closeModal">
        <div class="vn-modal" role="dialog" :aria-label="editingPost ? 'Edit post' : 'New post'">
          <div class="vn-modal__header">
            <h3 class="vn-modal__title">{{ editingPost ? 'Edit Post' : 'New Post' }}</h3>
            <button class="vn-modal__close" aria-label="Close" @click="closeModal">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="vn-modal__body">
            <NewsEditor v-model="form" :loading="saving" :submit-label="editingPost ? 'Save Changes' : 'Save Draft'" @submit="savePost" @save-draft="savePost" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { NewsEditorValue } from '~/components/news/NewsEditor.vue'

interface VendorPost {
  id: string
  postType: string
  title: string
  slug: string
  excerpt: string
  status: string
  upvoteCount: number
  viewCount: number
  adminNote: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

const TYPE_LABELS: Record<string, string> = {
  'product-update': 'Update',
  'feature': 'Feature',
  'case-study': 'Case Study',
  'culture': 'Culture',
  'announcement': 'Announce'
}

const activeTab = ref<string>('all')
const tabs = computed(() => [
  { value: 'all',       label: 'All',       count: posts.value.length },
  { value: 'draft',     label: 'Drafts',    count: null },
  { value: 'submitted', label: 'In Review', count: null },
  { value: 'published', label: 'Published', count: null },
  { value: 'rejected',  label: 'Rejected',  count: null }
])

function setTab(val: string) {
  activeTab.value = val
  refresh()
}

const { data, pending, refresh } = await useFetch('/api/vendor/news', {
  query: computed(() => activeTab.value === 'all' ? {} : { status: activeTab.value })
})

const posts = computed<VendorPost[]>(() => (data.value as { posts: VendorPost[] })?.posts || [])

// Modal state
const modalOpen = ref(false)
const editingPost = ref<VendorPost | null>(null)
const saving = ref(false)
const emptyForm = (): NewsEditorValue => ({ postType: 'announcement', title: '', excerpt: '', bodyMarkdown: '', coverImage: null, tags: [], appId: null })
const form = ref<NewsEditorValue>(emptyForm())

function openCreate() {
  editingPost.value = null
  form.value = emptyForm()
  modalOpen.value = true
}

function openEdit(post: VendorPost) {
  editingPost.value = post
  form.value = {
    postType: post.postType,
    title: post.title,
    excerpt: post.excerpt,
    bodyMarkdown: '',   // will be fetched if needed — for MVP keep empty (vendor re-enters)
    coverImage: null,
    tags: post.tags,
    appId: null
  }
  modalOpen.value = true
}

function closeModal() { modalOpen.value = false }

async function savePost() {
  saving.value = true
  try {
    if (editingPost.value) {
      await $fetch(`/api/news/${editingPost.value.id}`, { method: 'PUT', body: { ...form.value } })
    } else {
      await $fetch('/api/news', { method: 'POST', body: { ...form.value } })
    }
    closeModal()
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; message?: string }
    alert(err?.data?.statusMessage || err?.message || 'Failed to save post')
  } finally {
    saving.value = false
  }
}

async function submitPost(post: VendorPost) {
  if (!confirm(`Submit "${post.title}" for review? You cannot edit it while under review.`)) return
  try {
    await $fetch(`/api/news/${post.id}`, { method: 'PUT', body: { submit: true } })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; message?: string }
    alert(err?.data?.statusMessage || err?.message || 'Failed to submit post')
  }
}

async function deletePost(post: VendorPost) {
  if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
  try {
    await $fetch(`/api/news/${post.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; message?: string }
    alert(err?.data?.statusMessage || err?.message || 'Failed to delete post')
  }
}

function typeLabel(t: string) { return TYPE_LABELS[t] || t }

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
</script>

<style scoped>
.vendor-news { display: flex; flex-direction: column; gap: 24px; }

/* Header */
.vn-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.vn-title { font-size: 20px; font-weight: 700; color: var(--mm-pearl); margin: 0; }
.vn-sub { font-size: 13px; color: var(--mm-slate); margin: 4px 0 0; }

/* Buttons */
.vn-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 18px; border-radius: var(--r-md); font-size: 13px; font-weight: 600;
  cursor: pointer; border: none; transition: opacity var(--transition-fast), background var(--transition-fast);
}
.vn-btn--primary { background: var(--mm-gold); color: #07090F; }
.vn-btn--primary:hover { background: var(--mm-goldl); }
.vn-btn--ghost { background: transparent; border: 1px solid var(--b1); color: var(--mm-silver); }
.vn-btn--ghost:hover { border-color: var(--b2); color: var(--mm-pearl); }

/* Tabs */
.vn-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--b1); padding-bottom: 0; }
.vn-tab {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  border: none; background: transparent; color: var(--mm-slate);
  font-size: 13px; font-weight: 500; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}
.vn-tab:hover { color: var(--mm-silver); }
.vn-tab--active { color: var(--mm-pearl); border-bottom-color: var(--mm-gold); }
.vn-tab__count {
  background: var(--mm-s3); color: var(--mm-silver);
  padding: 1px 7px; border-radius: var(--r-full); font-size: 11px;
}

/* State */
.vn-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px 0; color: var(--mm-slate); }
.vn-state--empty { font-size: 14px; }
.vn-spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid var(--b1); border-top-color: var(--mm-gold);
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* List */
.vn-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.vn-item {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 16px; border-radius: var(--r-md); background: var(--mm-s1);
  border: 1px solid var(--b1); transition: border-color var(--transition-fast);
}
.vn-item:hover { border-color: var(--b2); }
.vn-item__left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.vn-item__badge {
  padding: 3px 8px; border-radius: var(--r-sm); font-size: 10px; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; flex-shrink: 0;
}
.vn-item__badge[data-type="product-update"] { background: rgba(74,128,212,.18); color: #6fa0e8; }
.vn-item__badge[data-type="feature"]        { background: rgba(212,168,67,.18); color: var(--mm-goldl); }
.vn-item__badge[data-type="case-study"]     { background: rgba(42,157,143,.18); color: var(--mm-sea); }
.vn-item__badge[data-type="culture"]        { background: rgba(148,103,189,.18); color: #c39de0; }
.vn-item__badge[data-type="announcement"]   { background: rgba(229,101,74,.18); color: #f08070; }
.vn-item__title { font-size: 14px; font-weight: 600; color: var(--mm-pearl); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40ch; }
.vn-item__meta { font-size: 12px; color: var(--mm-slate); margin: 2px 0 0; }
.vn-item__note { color: #f08070; }
.vn-item__right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.vn-item__status {
  font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
  padding: 2px 8px; border-radius: var(--r-sm);
}
.vn-item__status[data-status="draft"]     { background: rgba(104,120,143,.15); color: var(--mm-slate); }
.vn-item__status[data-status="submitted"] { background: rgba(74,128,212,.15); color: #6fa0e8; }
.vn-item__status[data-status="published"] { background: rgba(42,157,143,.15); color: var(--mm-sea); }
.vn-item__status[data-status="rejected"]  { background: rgba(229,101,74,.15); color: #f08070; }

.vn-icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: var(--r-sm);
  background: transparent; border: 1px solid var(--b1); color: var(--mm-slate);
  cursor: pointer; text-decoration: none;
  transition: color var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}
.vn-icon-btn:hover { color: var(--mm-pearl); border-color: var(--b2); }
.vn-icon-btn--gold:hover { color: var(--mm-gold); border-color: var(--mm-gold); }
.vn-icon-btn--danger:hover { color: #f08070; border-color: #e5654a; }

/* Modal */
.vn-modal-backdrop {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(7,9,15,.75); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.vn-modal {
  background: var(--mm-s1); border: 1px solid var(--b2);
  border-radius: var(--r-xl); width: 100%; max-width: 680px;
  max-height: 90dvh; overflow-y: auto;
  box-shadow: var(--shadow-lg);
}
.vn-modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--b1); position: sticky; top: 0;
  background: var(--mm-s1); z-index: 1;
}
.vn-modal__title { font-size: 17px; font-weight: 700; color: var(--mm-pearl); margin: 0; }
.vn-modal__close {
  background: transparent; border: none; color: var(--mm-slate); cursor: pointer;
  display: flex; align-items: center; padding: 4px; border-radius: var(--r-sm);
}
.vn-modal__close:hover { color: var(--mm-pearl); }
.vn-modal__body { padding: 24px; }
</style>
