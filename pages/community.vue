<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Community Forum</h1>
      <p>Join our vibrant community — ask questions, share ideas, and connect with other users.</p>
    </div>

    <!-- Category tabs -->
    <div class="forum-tabs">
      <button
        v-for="cat in categories"
        :key="cat.value"
        class="forum-tab"
        :class="{ active: activeCategory === cat.value }"
        @click="setCategory(cat.value)"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- New thread form -->
    <div class="new-thread-section">
      <button class="btn-new-thread" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : '+ Start a new thread' }}
      </button>
      <form v-if="showForm" class="thread-form" @submit.prevent="submitThread">
        <input v-model="form.title" class="form-input" placeholder="Thread title" required maxlength="200" />
        <textarea v-model="form.body" class="form-textarea" placeholder="What's on your mind?" required rows="4" />
        <select v-model="form.category" class="form-select" required>
          <option value="" disabled>Select category</option>
          <option v-for="cat in categories.filter(c => c.value !== '')" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
        <div v-if="!isLoggedIn" class="anon-fields">
          <input v-model="form.author_name" class="form-input" placeholder="Your name (optional)" />
          <input v-model="form.author_email" class="form-input" type="email" placeholder="Your email (optional)" />
        </div>
        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? 'Posting...' : 'Post Thread' }}
        </button>
        <p v-if="formError" class="form-error">{{ formError }}</p>
      </form>
    </div>

    <!-- Thread list -->
    <div v-if="pending" class="forum-loading">Loading threads...</div>
    <div v-else-if="!threads.length" class="forum-empty">
      No threads yet in this category. Be the first to post!
    </div>
    <div v-else class="thread-list">
      <NuxtLink
        v-for="thread in threads"
        :key="thread.id"
        :to="`/community/${thread.id}`"
        class="thread-card"
      >
        <div class="thread-main">
          <span v-if="thread.pinned" class="badge badge-pinned">Pinned</span>
          <span v-if="thread.locked" class="badge badge-locked">Locked</span>
          <h3 class="thread-title">{{ thread.title }}</h3>
          <p class="thread-meta">
            by <strong>{{ thread.author_name }}</strong>
            &middot; {{ formatDate(thread.created_at) }}
            &middot; <span class="cat-tag">{{ thread.category }}</span>
          </p>
        </div>
        <div class="thread-stats">
          <span>{{ thread.reply_count }} replies</span>
          <span>{{ thread.view_count }} views</span>
        </div>
      </NuxtLink>
    </div>

    <!-- Pagination -->
    <div v-if="pages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--">Previous</button>
      <span>Page {{ page }} of {{ pages }}</span>
      <button :disabled="page >= pages" @click="page++">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Community Forum' })

const categories = [
  { value: '', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'product-reviews', label: 'Product Reviews' },
  { value: 'help', label: 'Help & Support' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'show-and-tell', label: 'Show & Tell' }
]

const activeCategory = ref('')
const page = ref(1)
const showForm = ref(false)
const submitting = ref(false)
const formError = ref('')
const { currentUser } = useAuth()
const isLoggedIn = computed(() => !!currentUser.value)

const form = reactive({
  title: '',
  body: '',
  category: '',
  author_name: '',
  author_email: ''
})

const { data, pending, refresh } = await useAsyncData(
  () => `forum-${activeCategory.value}-${page.value}`,
  () => $fetch<{ threads: any[]; total: number; page: number; pages: number }>('/api/forum/threads', {
    query: { category: activeCategory.value || undefined, page: page.value, limit: 20 }
  })
)

const threads = computed(() => data.value?.threads || [])
const pages = computed(() => data.value?.pages || 1)

function setCategory(cat: string) {
  activeCategory.value = cat
  page.value = 1
}

watch([activeCategory, page], () => refresh())

async function submitThread() {
  formError.value = ''
  submitting.value = true
  try {
    await $fetch('/api/forum/threads', {
      method: 'POST',
      body: { ...form }
    })
    form.title = ''
    form.body = ''
    form.category = ''
    form.author_name = ''
    form.author_email = ''
    showForm.value = false
    await refresh()
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || 'Failed to post thread.'
  } finally {
    submitting.value = false
  }
}

function formatDate(iso: string) {
  if (!iso) return ''
  return useFmt().fmtDate(iso, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.page-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
.page-header { text-align: center; margin-bottom: 2rem; }
.page-header h1 { font-size: 2.25rem; margin-bottom: 0.5rem; }

.forum-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
.forum-tab { padding: 0.4rem 1rem; border: 1px solid #d1d5db; border-radius: 999px; background: #f9fafb; cursor: pointer; font-size: 0.875rem; }
.forum-tab.active { background: var(--color-primary, #0073e6); color: #fff; border-color: transparent; }

.new-thread-section { margin-bottom: 1.5rem; }
.btn-new-thread { padding: 0.6rem 1.25rem; background: var(--color-primary, #0073e6); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
.thread-form { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.form-input, .form-textarea, .form-select { padding: 0.6rem 0.9rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; width: 100%; }
.anon-fields { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.anon-fields .form-input { flex: 1; min-width: 180px; }
.btn-submit { padding: 0.6rem 1.25rem; background: #16a34a; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.form-error { color: #dc2626; font-size: 0.875rem; }

.forum-loading, .forum-empty { padding: 2rem; text-align: center; color: #6b7280; }
.thread-list { display: flex; flex-direction: column; gap: 0.75rem; }
.thread-card { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border: 1px solid #e5e7eb; border-radius: 10px; text-decoration: none; color: inherit; transition: background 0.15s; }
.thread-card:hover { background: #f9fafb; }
.thread-title { font-size: 1rem; font-weight: 600; margin: 0.25rem 0; }
.thread-meta { font-size: 0.8rem; color: #6b7280; }
.thread-stats { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8rem; color: #9ca3af; text-align: right; white-space: nowrap; }
.badge { display: inline-block; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 4px; margin-right: 4px; }
.badge-pinned { background: #fef3c7; color: #92400e; }
.badge-locked { background: #fee2e2; color: #991b1b; }
.cat-tag { background: #dbeafe; color: #1d4ed8; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.75rem; }

.pagination { display: flex; gap: 1rem; justify-content: center; align-items: center; margin-top: 2rem; }
.pagination button { padding: 0.4rem 0.9rem; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>

