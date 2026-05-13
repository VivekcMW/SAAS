<template>
  <div class="ab-wrap">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Blog CMS</h1>
        <p class="bw-head__sub">Create, edit, and publish blog posts.</p>
      </div>
      <button class="bw-btn bw-btn--primary" @click="openCreate">+ New post</button>
    </header>

    <div v-if="pending" class="bw-card" style="padding: 2rem; color: var(--vw-text-muted);">Loading…</div>
    <div v-else-if="!posts.length" class="bw-card bw-empty">
      <h3 class="bw-empty__title">No posts yet</h3>
      <p class="bw-empty__desc">Create your first blog post to get started.</p>
    </div>
    <div v-else class="bw-card" style="overflow: auto;">
      <table class="bw-table">
        <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Published</th><th/></tr></thead>
        <tbody>
          <tr v-for="p in posts" :key="p.id">
            <td>{{ p.title }}</td>
            <td>{{ p.category }}</td>
            <td><span class="bw-chip" :class="p.status === 'published' ? 'bw-chip--success' : 'bw-chip--muted'">{{ p.status }}</span></td>
            <td>{{ fmtDate(p.published_at) }}</td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="openEdit(p)">Edit</button>
                <button class="bw-btn bw-btn--subtle bw-btn--sm" @click="deletePost(p.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Editor modal -->
    <div v-if="modal" class="ab-overlay" @click.self="modal = false">
      <div class="ab-modal">
        <h2 class="ab-modal__title">{{ editing ? 'Edit post' : 'New post' }}</h2>
        <div class="ab-form">
          <label class="bw-label">Title *</label>
          <input v-model="form.title" class="bw-input" placeholder="How to choose the right CRM" >

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="bw-label">Category *</label>
              <input v-model="form.category" class="bw-input" placeholder="product-news" >
            </div>
            <div>
              <label class="bw-label">Status</label>
              <select v-model="form.status" class="bw-select">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <label class="bw-label">Excerpt *</label>
          <textarea v-model="form.excerpt" class="bw-input" rows="2" style="resize: vertical;" />

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
            <div>
              <label class="bw-label">Author</label>
              <input v-model="form.author" class="bw-input" placeholder="Moonmart Editorial" >
            </div>
            <div>
              <label class="bw-label">Read time (min)</label>
              <input v-model.number="form.read_minutes" class="bw-input" type="number" min="1" >
            </div>
            <div>
              <label class="bw-label">Published at</label>
              <input v-model="form.published_at" class="bw-input" type="date" >
            </div>
          </div>

          <label class="bw-label">Cover image URL</label>
          <input v-model="form.image" class="bw-input" placeholder="https://…" >

          <label class="bw-label">Tags (comma-separated)</label>
          <input v-model="tagsRaw" class="bw-input" placeholder="crm, saas, review" >

          <label class="bw-label">Content (Markdown)</label>
          <textarea v-model="form.content" class="bw-input ab-editor" rows="12" style="font-family: monospace; resize: vertical;" placeholder="## Introduction&#10;Write your post content here…" />
        </div>
        <p v-if="formError" class="ab-error">{{ formError }}</p>
        <div class="ab-modal__actions">
          <button class="bw-btn bw-btn--ghost" @click="modal = false">Cancel</button>
          <button class="bw-btn bw-btn--primary" :disabled="saving" @click="submit">
            {{ saving ? 'Saving…' : editing ? 'Save changes' : 'Publish' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string; category: string
  author: string; read_minutes: number; image: string | null; tags: string
  content: string; status: string; published_at: string; created_at: string
}

const { data: rawPosts, pending, refresh } = await useFetch<BlogPost[]>('/api/admin/blog')
const posts = computed(() => rawPosts.value ?? [])

const modal = ref(false)
const editing = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const tagsRaw = ref('')

const emptyForm = () => ({
  title: '', excerpt: '', category: '', content: '',
  author: 'Moonmart Editorial', read_minutes: 8,
  image: '', status: 'draft',
  published_at: new Date().toISOString().slice(0, 10)
})
const form = reactive(emptyForm())

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function openCreate() {
  Object.assign(form, emptyForm())
  tagsRaw.value = ''
  editing.value = null
  formError.value = ''
  modal.value = true
}

function openEdit(p: BlogPost) {
  Object.assign(form, {
    title: p.title, excerpt: p.excerpt, category: p.category,
    content: p.content, author: p.author, read_minutes: p.read_minutes,
    image: p.image ?? '', status: p.status,
    published_at: p.published_at.slice(0, 10)
  })
  try { tagsRaw.value = JSON.parse(p.tags).join(', ') } catch { tagsRaw.value = '' }
  editing.value = p.id
  formError.value = ''
  modal.value = true
}

async function submit() {
  if (!form.title.trim()) { formError.value = 'Title is required'; return }
  if (!form.excerpt.trim()) { formError.value = 'Excerpt is required'; return }
  if (!form.category.trim()) { formError.value = 'Category is required'; return }
  saving.value = true
  formError.value = ''
  const tags = tagsRaw.value.split(',').map(t => t.trim()).filter(Boolean)
  try {
    const body = { ...form, tags, image: form.image || undefined }
    if (editing.value) {
      await $fetch(`/api/admin/blog/${editing.value}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/admin/blog', { method: 'POST', body })
    }
    modal.value = false
    await refresh()
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || 'Could not save post.'
  } finally {
    saving.value = false
  }
}

async function deletePost(id: string) {
  if (!confirm('Delete this post permanently?')) return
  await $fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<style scoped>
.ab-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.ab-modal { background: var(--vw-surface, #1a2035); border: 1px solid var(--vw-border, #2a3347); border-radius: 14px; padding: 1.75rem; width: 700px; max-width: 100%; max-height: 90vh; overflow-y: auto; }
.ab-modal__title { font-size: 1.1rem; font-weight: 700; margin: 0 0 1.25rem; }
.ab-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1rem; }
.ab-modal__actions { display: flex; justify-content: flex-end; gap: .75rem; margin-top: 1rem; }
.ab-error { color: #fca5a5; font-size: .82rem; margin: 4px 0 0; }
</style>
