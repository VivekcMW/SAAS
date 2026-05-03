<template>
  <div class="qa-slug">
    <div v-if="pending" class="qa-slug__loading container">Loading…</div>
    <div v-else-if="!data" class="qa-slug__404 container">Question not found.</div>
    <template v-else>
      <div class="container qa-slug__layout">
        <main class="qa-slug__main">
          <!-- Question -->
          <div class="question-block">
            <div class="question-block__vote-col">
              <VoteWidget :score="data.question.vote_score" target-type="question" :target-id="data.question.id" />
            </div>
            <div class="question-block__body">
              <h1 class="question-block__title">{{ data.question.title }}</h1>
              <div class="question-block__meta">
                <span>Asked by <strong>{{ data.question.author_name }}</strong></span>
                <span class="muted">·</span>
                <time class="muted">{{ relDate(data.question.created_at) }}</time>
                <span class="muted">·</span>
                <span class="muted">{{ data.question.view_count }} views</span>
              </div>
              <p class="question-block__text">{{ data.question.body }}</p>
              <div v-if="data.question.tags?.length" class="tag-row">
                <NuxtLink
                  v-for="tag in data.question.tags"
                  :key="tag"
                  :to="`/qa?tag=${tag}`"
                  class="tag"
                >{{ tag }}</NuxtLink>
              </div>
            </div>
          </div>

          <!-- Answers -->
          <section class="answers-section">
            <h2 class="answers-section__heading">{{ data.answers?.length || 0 }} Answer{{ data.answers?.length !== 1 ? 's' : '' }}</h2>
            <div
              v-for="ans in data.answers"
              :key="ans.id"
              class="answer-block"
              :class="{ 'answer-block--accepted': ans.is_accepted }"
            >
              <div class="answer-block__vote-col">
                <VoteWidget :score="ans.vote_score" target-type="answer" :target-id="ans.id" />
                <div v-if="ans.is_accepted" class="accepted-badge" title="Accepted answer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <div class="answer-block__body">
                <p class="answer-block__text">{{ ans.body }}</p>
                <div class="answer-block__meta">
                  <span>{{ ans.author_name }}</span>
                  <span class="muted">·</span>
                  <time class="muted">{{ relDate(ans.created_at) }}</time>
                  <button
                    v-if="canAccept && !ans.is_accepted"
                    class="accept-btn"
                    @click="acceptAnswer(ans.id)"
                  >Accept</button>
                </div>
              </div>
            </div>
          </section>

          <!-- Answer Form -->
          <section class="add-answer-section">
            <h2>Your answer</h2>
            <form @submit.prevent="postAnswer">
              <textarea v-model="answerForm.body" rows="6" placeholder="Write your answer…" required minlength="20" />
              <div v-if="!loggedIn" class="add-answer-section__anon">
                <input v-model="answerForm.author_name" type="text" placeholder="Your name" required />
                <input v-model="answerForm.author_email" type="email" placeholder="Email (not published)" required />
              </div>
              <p v-if="answerError" class="form-error">{{ answerError }}</p>
              <button type="submit" :disabled="answerLoading" class="btn-primary">
                {{ answerLoading ? 'Posting…' : 'Post answer' }}
              </button>
            </form>
          </section>
        </main>

        <!-- Sidebar -->
        <aside class="qa-slug__sidebar">
          <div v-if="data.related?.length" class="sidebar-card">
            <h3>Related questions</h3>
            <ul class="related-list">
              <li v-for="r in data.related" :key="r.id">
                <NuxtLink :to="`/qa/${r.slug}`">{{ r.title }}</NuxtLink>
              </li>
            </ul>
          </div>
          <div class="sidebar-card sidebar-card--cta">
            <p>Have a different question?</p>
            <NuxtLink to="/qa/ask" class="btn-primary btn-primary--sm">Ask the community</NuxtLink>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import VoteWidget from '~/components/qa/VoteWidget.vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data, pending } = await useAsyncData<{ question: { id: string; title: string; body: string; author_name: string; created_at: string; view_count: number; vote_score: number; tags?: string[] }; answers: any[]; related?: { id: string; slug: string; title: string }[] }>(
  `qa-question-${slug.value}`,
  () => $fetch(`/api/qa/questions/${slug.value}`)
)

// SEO
if (data.value?.question) {
  const q = data.value.question
  useSeoMeta({
    title: `${q.title} — Community Q&A`,
    description: q.body.slice(0, 160)
  })
  const accepted = data.value.answers?.find((a: any) => a.is_accepted)
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        mainEntity: {
          '@type': 'Question',
          name: q.title,
          text: q.body,
          answerCount: data.value.answers?.length || 0,
          ...(accepted ? { acceptedAnswer: { '@type': 'Answer', text: accepted.body, upvoteCount: accepted.vote_score } } : {}),
          suggestedAnswer: (data.value.answers || [])
            .filter((a: any) => !a.is_accepted)
            .map((a: any) => ({ '@type': 'Answer', text: a.body, upvoteCount: a.vote_score }))
        }
      })
    }]
  })
}

// Auth stub
const loggedIn = false
const canAccept = false // extend: check if current user === question.user_id

const answerForm = reactive({ body: '', author_name: '', author_email: '' })
const answerLoading = ref(false)
const answerError = ref('')

async function postAnswer() {
  answerError.value = ''
  answerLoading.value = true
  try {
    await $fetch(`/api/qa/questions/${data.value!.question.id}/answers`, {
      method: 'POST',
      body: answerForm
    })
    answerForm.body = ''
    answerForm.author_name = ''
    answerForm.author_email = ''
    await refreshNuxtData(`qa-question-${slug.value}`)
  } catch (err: any) {
    answerError.value = err?.data?.statusMessage || 'Failed to post answer.'
  } finally {
    answerLoading.value = false
  }
}

async function acceptAnswer(answerId: string) {
  await $fetch(`/api/qa/answers/${answerId}/accept`, { method: 'PATCH' })
  await refreshNuxtData(`qa-question-${slug.value}`)
}

function relDate(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return useFmt().fmtDate(d, { month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.container { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }
.qa-slug__layout { display: grid; grid-template-columns: 1fr 280px; gap: 2rem; }
@media (max-width: 820px) { .qa-slug__layout { grid-template-columns: 1fr; } }
.question-block { display: flex; gap: 1rem; padding-bottom: 2rem; border-bottom: 2px solid #e5e7eb; margin-bottom: 2rem; }
.question-block__vote-col { flex-shrink: 0; }
.question-block__title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
.question-block__meta { display: flex; flex-wrap: wrap; gap: 6px; font-size: 0.8rem; margin-bottom: 1rem; }
.question-block__text { font-size: 0.95rem; line-height: 1.7; white-space: pre-wrap; }
.tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 0.75rem; }
.tag { display: inline-block; background: #e0e7ff; color: #3730a3; font-size: 0.78rem; padding: 3px 10px; border-radius: 999px; text-decoration: none; }
.tag:hover { background: #c7d2fe; }
.answers-section { margin-bottom: 2.5rem; }
.answers-section__heading { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.25rem; }
.answer-block { display: flex; gap: 1rem; padding: 1.25rem 0; border-bottom: 1px solid #f3f4f6; }
.answer-block--accepted { background: #f0fdf4; border-left: 4px solid #16a34a; padding-left: 1rem; border-radius: 8px; }
.answer-block__vote-col { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.accepted-badge { color: #16a34a; }
.answer-block__text { font-size: 0.9rem; line-height: 1.7; white-space: pre-wrap; margin-bottom: 0.5rem; }
.answer-block__meta { display: flex; flex-wrap: wrap; gap: 6px; font-size: 0.78rem; align-items: center; }
.accept-btn { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; border-radius: 6px; padding: 2px 10px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
.accept-btn:hover { background: #a7f3d0; }
.add-answer-section h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; }
.add-answer-section form { display: flex; flex-direction: column; gap: 0.75rem; }
.add-answer-section textarea, .add-answer-section input { border: 1px solid #d1d5db; border-radius: 8px; padding: 0.5rem 0.75rem; font-size: 0.9rem; font-family: inherit; }
.add-answer-section__anon { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.form-error { color: #dc2626; font-size: 0.875rem; }
.btn-primary { display: inline-block; background: #4f46e5; color: #fff; font-weight: 600; padding: 0.5rem 1.25rem; border-radius: 8px; border: none; cursor: pointer; text-decoration: none; }
.btn-primary:hover { background: #4338ca; }
.btn-primary--sm { font-size: 0.875rem; padding: 0.4rem 1rem; }
.sidebar-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
.sidebar-card h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 0.5rem; }
.sidebar-card--cta { text-align: center; }
.sidebar-card--cta p { font-size: 0.875rem; margin-bottom: 0.75rem; color: #374151; }
.related-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.related-list a { font-size: 0.85rem; text-decoration: none; color: #374151; }
.related-list a:hover { color: #4f46e5; }
.muted { color: #9ca3af; }
</style>
