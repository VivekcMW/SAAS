<template>
  <div class="vote-widget">
    <button class="vote-btn vote-btn--up" :class="{ 'vote-btn--active': currentVote === 1 }" @click="vote(1)" aria-label="Upvote">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
    <span class="vote-widget__score">{{ localScore }}</span>
    <button class="vote-btn vote-btn--down" :class="{ 'vote-btn--active': currentVote === -1 }" @click="vote(-1)" aria-label="Downvote">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  score: number
  targetType: 'question' | 'answer'
  targetId: string
}>()

const localScore = ref(props.score)
const currentVote = ref<1 | -1 | 0>(0)

async function vote(value: 1 | -1) {
  try {
    const res = await $fetch<{ vote_score_delta: number; action: string }>('/api/qa/vote', {
      method: 'POST',
      body: { target_type: props.targetType, target_id: props.targetId, value }
    })
    localScore.value += res.vote_score_delta
    if (res.action === 'removed') currentVote.value = 0
    else if (res.action === 'changed') currentVote.value = value
    else currentVote.value = value
  } catch {
    // silently fail (rate limit etc.)
  }
}
</script>

<style scoped>
.vote-widget { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.vote-btn { background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 6px; cursor: pointer; color: #9ca3af; transition: color 0.1s, border-color 0.1s; display: flex; align-items: center; justify-content: center; }
.vote-btn:hover { color: #4f46e5; border-color: #6366f1; }
.vote-btn--active { color: #4f46e5; border-color: #6366f1; background: #eef2ff; }
.vote-btn--up.vote-btn--active { color: #16a34a; border-color: #16a34a; background: #d1fae5; }
.vote-btn--down.vote-btn--active { color: #dc2626; border-color: #dc2626; background: #fee2e2; }
.vote-widget__score { font-size: 1rem; font-weight: 700; line-height: 1; }
</style>
