<template>
  <div class="qa-ask container">
    <div class="qa-ask__header">
      <NuxtLink to="/qa" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Q&amp;A
      </NuxtLink>
      <h1>Ask a question</h1>
      <p class="qa-ask__subtitle">Share your question with the community and get expert answers.</p>
    </div>

    <div class="qa-ask__body">
      <form class="qa-ask__form" @submit.prevent="submit">
        <div class="form-group">
          <label for="title">Title <span class="required">*</span></label>
          <p class="form-hint">Be specific. Imagine you are asking a friend.</p>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="e.g. Does Notion support SSO on the Team plan?"
            required
            minlength="10"
            maxlength="200"
            @input="onTitleInput"
          />
        </div>

        <!-- Similar questions preview -->
        <div v-if="similar.length" class="qa-ask__similar">
          <p class="form-hint">Similar questions — check if yours is already answered:</p>
          <ul>
            <li v-for="q in similar" :key="q.id">
              <NuxtLink :to="`/qa/${q.slug}`" target="_blank">{{ q.title }}</NuxtLink>
              <span v-if="q.solved" class="solved-badge">Solved</span>
            </li>
          </ul>
        </div>

        <div class="form-group">
          <label for="body">Details <span class="required">*</span></label>
          <p class="form-hint">Include context — what are you trying to do, and what have you tried?</p>
          <textarea id="body" v-model="form.body" rows="8" placeholder="Describe your question in detail…" required minlength="20" />
        </div>

        <div class="form-group">
          <label>Tags <small>(up to 5)</small></label>
          <div class="tag-input">
            <div class="tag-input__current">
              <span v-for="(tag, i) in form.tags" :key="i" class="tag">
                {{ tag }}
                <button type="button" @click="form.tags.splice(i, 1)">&#x2715;</button>
              </span>
            </div>
            <input
              v-if="form.tags.length < 5"
              v-model="newTag"
              type="text"
              placeholder="Add a tag…"
              @keydown.enter.prevent="addTag"
              @keydown.comma.prevent="addTag"
            />
          </div>
        </div>

        <div v-if="!loggedIn" class="form-group form-group--row">
          <div class="form-group">
            <label for="name">Your name <span class="required">*</span></label>
            <input id="name" v-model="form.author_name" type="text" required />
          </div>
          <div class="form-group">
            <label for="email">Email <small>(not published)</small></label>
            <input id="email" v-model="form.author_email" type="email" />
          </div>
        </div>

        <div class="form-group">
          <label for="app">App <small>(optional)</small></label>
          <input id="app" v-model="form.app_id" type="text" placeholder="App ID if your question is about a specific app" />
        </div>

        <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

        <div class="qa-ask__actions">
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Posting…' : 'Post question' }}
          </button>
          <NuxtLink to="/qa" class="btn-cancel">Cancel</NuxtLink>
        </div>
      </form>

      <aside class="qa-ask__tips">
        <div class="tips-card">
          <h3>Writing a good question</h3>
          <ul>
            <li>Summarise your problem in the title</li>
            <li>Add relevant context in the details</li>
            <li>Describe what you have already tried</li>
            <li>Proofread before posting</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Ask a Question — SaasWorld Community', description: 'Post your SaaS question and get answers from the community.' })

const route = useRoute()
const router = useRouter()

const loggedIn = false

const form = reactive({
  title: '',
  body: '',
  tags: [] as string[],
  author_name: '',
  author_email: '',
  app_id: (route.query.app as string) || ''
})

const newTag = ref('')
const similar = ref<{ id: string; slug: string; title: string; solved: boolean }[]>([])
const loading = ref(false)
const errorMsg = ref('')

function addTag() {
  const t = newTag.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (t && !form.tags.includes(t)) form.tags.push(t)
  newTag.value = ''
}

let titleTimer: ReturnType<typeof setTimeout>
async function onTitleInput() {
  clearTimeout(titleTimer)
  if (form.title.length < 8) { similar.value = []; return }
  titleTimer = setTimeout(async () => {
    try {
      const res = await $fetch<{ questions: any[] }>('/api/qa/questions', { params: { q: form.title, limit: 4 } })
      similar.value = res.questions || []
    } catch { similar.value = [] }
  }, 400)
}

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await $fetch<{ slug: string }>('/api/qa/questions', {
      method: 'POST',
      body: form
    })
    await router.push(`/qa/${res.slug}`)
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || 'Failed to post question. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }
.qa-ask__header { margin-bottom: 2rem; }
.back-link { display: inline-flex; align-items: center; gap: 4px; font-size: 0.875rem; text-decoration: none; color: #6b7280; margin-bottom: 0.75rem; }
.back-link:hover { color: #4f46e5; }
.qa-ask__header h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
.qa-ask__subtitle { color: #6b7280; }
.qa-ask__body { display: grid; grid-template-columns: 1fr 260px; gap: 2rem; }
@media (max-width: 768px) { .qa-ask__body { grid-template-columns: 1fr; } }
.qa-ask__form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 0.875rem; font-weight: 600; }
.form-group small { font-weight: 400; color: #6b7280; }
.form-hint { font-size: 0.8rem; color: #6b7280; margin-bottom: 4px; }
.form-group input, .form-group textarea { border: 1px solid #d1d5db; border-radius: 8px; padding: 0.5rem 0.75rem; font-size: 0.9rem; font-family: inherit; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #6366f1; }
.form-group--row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.tag-input { border: 1px solid #d1d5db; border-radius: 8px; padding: 6px 8px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.tag-input input { border: none; outline: none; font-size: 0.875rem; padding: 2px 4px; min-width: 120px; }
.tag { display: inline-flex; align-items: center; gap: 4px; background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 999px; font-size: 0.78rem; }
.tag button { background: none; border: none; cursor: pointer; color: inherit; padding: 0; line-height: 1; }
.qa-ask__similar { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 0.75rem 1rem; }
.qa-ask__similar ul { margin: 0.25rem 0 0; padding-left: 1.2rem; }
.qa-ask__similar li { font-size: 0.875rem; display: flex; align-items: center; gap: 6px; }
.qa-ask__similar a { color: #374151; text-decoration: none; }
.qa-ask__similar a:hover { color: #4f46e5; }
.solved-badge { background: #d1fae5; color: #065f46; font-size: 0.68rem; font-weight: 600; padding: 1px 6px; border-radius: 99px; }
.form-error { color: #dc2626; font-size: 0.875rem; }
.qa-ask__actions { display: flex; align-items: center; gap: 1rem; }
.btn-primary { background: #4f46e5; color: #fff; border: none; border-radius: 8px; padding: 0.625rem 1.5rem; font-size: 0.925rem; font-weight: 600; cursor: pointer; text-decoration: none; }
.btn-primary:hover:not(:disabled) { background: #4338ca; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { font-size: 0.875rem; color: #6b7280; text-decoration: none; }
.tips-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 1rem 1.25rem; }
.tips-card h3 { font-size: 0.875rem; font-weight: 700; margin-bottom: 0.5rem; color: #0369a1; }
.tips-card ul { padding-left: 1.2rem; margin: 0; }
.tips-card li { font-size: 0.85rem; color: #374151; margin-bottom: 4px; }
.required { color: #dc2626; }
</style>
