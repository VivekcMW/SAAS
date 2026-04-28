<script setup lang="ts">
import { computed, ref } from 'vue'

interface QuestionOption {
  label: string
  score: number
}
interface Question {
  id: string
  prompt: string
  options: QuestionOption[]
}

const props = defineProps<{
  appName: string
  appRating?: number
}>()

const emit = defineEmits<{
  (e: 'cta-trial'): void
  (e: 'cta-compare'): void
}>()

const questions: Question[] = [
  {
    id: 'team',
    prompt: 'How big is your team?',
    options: [
      { label: 'Just me (1)', score: 1 },
      { label: 'Small team (2–10)', score: 3 },
      { label: 'Mid-size (11–50)', score: 4 },
      { label: 'Large (50+)', score: 4 }
    ]
  },
  {
    id: 'budget',
    prompt: "What's your monthly budget per user?",
    options: [
      { label: 'Free only', score: 1 },
      { label: 'Under $20', score: 3 },
      { label: '$20–$100', score: 4 },
      { label: 'No limit', score: 4 }
    ]
  },
  {
    id: 'priority',
    prompt: "What's your top priority?",
    options: [
      { label: 'Ease of use', score: 4 },
      { label: 'Power & flexibility', score: 4 },
      { label: 'Integrations', score: 3 },
      { label: 'Lowest price', score: 2 }
    ]
  }
]

const step = ref(0)
const answers = ref<Record<string, number>>({})
const completed = ref(false)

const progress = computed(() => Math.round(((step.value) / questions.length) * 100))

const fitScore = computed(() => {
  const total = Object.values(answers.value).reduce((sum, s) => sum + s, 0)
  const max = questions.length * 4
  const baseline = (props.appRating || 4) / 5
  const raw = (total / max) * 100
  // Blend fit-score with app rating to reflect overall confidence
  return Math.min(100, Math.round(raw * 0.7 + baseline * 100 * 0.3))
})

const fitVerdict = computed(() => {
  const s = fitScore.value
  if (s >= 80) return { label: 'Strong fit', tone: 'good', emoji: '✓' }
  if (s >= 60) return { label: 'Good fit', tone: 'good', emoji: '✓' }
  if (s >= 40) return { label: 'Possible fit', tone: 'warn', emoji: '~' }
  return { label: 'Not the best fit', tone: 'bad', emoji: '!' }
})

const fitMessage = computed(() => {
  const s = fitScore.value
  if (s >= 80) return `${props.appName} looks like a strong match for your needs. We'd recommend starting a free trial.`
  if (s >= 60) return `${props.appName} should work well for your team — try it out and see how it feels.`
  if (s >= 40) return `${props.appName} could work, but you should also compare with alternatives before committing.`
  return `${props.appName} may not be the best fit. Consider lighter or more specialised alternatives.`
})

function selectOption(qId: string, score: number) {
  answers.value = { ...answers.value, [qId]: score }
  if (step.value < questions.length - 1) {
    step.value++
  } else {
    completed.value = true
  }
}

function reset() {
  answers.value = {}
  step.value = 0
  completed.value = false
}

const currentQuestion = computed(() => questions[step.value])
</script>

<template>
  <section class="fit-check" aria-labelledby="fit-check-title">
    <header class="fc-head">
      <span class="fc-badge">
        <Icon name="heroicons:sparkles" />
        AI Decision Helper
      </span>
      <h2 id="fit-check-title" class="fc-title">
        Is {{ appName }} right for you?
      </h2>
      <p class="fc-sub">Answer 3 quick questions for a personalised fit score.</p>
    </header>

    <!-- In-progress -->
    <div v-if="!completed" class="fc-quiz">
      <div class="fc-progress" :aria-label="`Question ${step + 1} of ${questions.length}`">
        <div class="fc-progress-bar" :style="{ width: `${progress}%` }"></div>
        <span class="fc-progress-label">{{ step + 1 }} / {{ questions.length }}</span>
      </div>

      <div class="fc-question">
        <h3 class="fc-prompt">{{ currentQuestion.prompt }}</h3>
        <div class="fc-options">
          <button
            v-for="opt in currentQuestion.options"
            :key="opt.label"
            class="fc-option"
            @click="selectOption(currentQuestion.id, opt.score)"
          >
            {{ opt.label }}
            <Icon name="heroicons:arrow-right" class="opt-arrow" />
          </button>
        </div>
      </div>
    </div>

    <!-- Result -->
    <div v-else class="fc-result" :class="`tone-${fitVerdict.tone}`">
      <div class="fc-score-ring">
        <svg viewBox="0 0 100 100" class="ring-svg">
          <circle cx="50" cy="50" r="45" class="ring-bg" />
          <circle
            cx="50"
            cy="50"
            r="45"
            class="ring-fg"
            :style="{ strokeDashoffset: 283 - (283 * fitScore) / 100 }"
          />
        </svg>
        <div class="ring-text">
          <span class="ring-num">{{ fitScore }}</span>
          <span class="ring-pct">%</span>
        </div>
      </div>

      <div class="fc-result-body">
        <span class="fc-verdict-pill">{{ fitVerdict.emoji }} {{ fitVerdict.label }}</span>
        <p class="fc-message">{{ fitMessage }}</p>

        <div class="fc-result-actions">
          <Button v-if="fitScore >= 60" variant="primary" size="md" @click="emit('cta-trial')">
            <Icon name="heroicons:rocket-launch" />
            Start Free Trial
          </Button>

          <button class="fc-retry" @click="reset">
            <Icon name="heroicons:arrow-path" />
            Retake quiz
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fit-check {
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  background: var(--mm-s2);
  padding: 20px;
  margin: 24px 0;
}

.fc-head { margin-bottom: 16px; }

.fc-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: var(--r-sm);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.fc-title { font-size: 20px; font-weight: 700; color: var(--mm-pearl); margin: 0 0 4px; }
.fc-sub { font-size: 13px; color: var(--mm-slate); margin: 0; }

/* Quiz */
.fc-progress {
  position: relative;
  height: 6px;
  background: var(--mm-s3);
  border-radius: var(--r-sm);
  overflow: hidden;
  margin-bottom: 20px;
}
.fc-progress-bar {
  height: 100%;
  background: var(--mm-gold);
  transition: width 250ms ease;
}
.fc-progress-label {
  position: absolute;
  right: 0;
  top: -22px;
  font-size: 11px;
  font-weight: 600;
  color: var(--mm-slate);
}

.fc-prompt {
  font-size: 16px;
  font-weight: 600;
  color: var(--mm-pearl);
  margin: 0 0 12px;
}

.fc-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.fc-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-md);
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--mm-silver);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.fc-option:hover {
  border-color: var(--mm-gold);
  background: var(--mm-gold-soft);
}

.opt-arrow { color: var(--mm-slate); font-size: 16px; }
.fc-option:hover .opt-arrow { color: var(--mm-gold); }

/* Result */
.fc-result {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 16px;
  border-radius: var(--r-lg);
  background: var(--mm-s3);
}

.tone-good { background: var(--mm-sea-soft); }
.tone-warn { background: var(--mm-gold-soft); }
.tone-bad { background: rgba(248,113,113,0.08); }

.fc-score-ring {
  position: relative;
  width: 96px;
  height: 96px;
  flex-shrink: 0;
}

.ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: var(--b2); stroke-width: 8; }
.ring-fg {
  fill: none;
  stroke: var(--mm-gold);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 600ms ease;
}
.tone-good .ring-fg { stroke: var(--mm-seal); }
.tone-warn .ring-fg { stroke: var(--mm-gold); }
.tone-bad .ring-fg { stroke: #f87171; }

.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--mm-pearl);
}
.ring-num { font-size: 24px; }
.ring-pct { font-size: 13px; color: var(--mm-slate); margin-left: 1px; }

.fc-result-body { flex: 1; min-width: 0; }

.fc-verdict-pill {
  display: inline-block;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  padding: 3px 10px;
  border-radius: var(--r-full);
  font-size: 12px;
  font-weight: 700;
  color: var(--mm-pearl);
  margin-bottom: 6px;
}

.fc-message {
  font-size: 14px;
  color: var(--mm-silver);
  line-height: 1.5;
  margin: 0 0 12px;
}

.fc-result-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

.fc-retry {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--mm-slate);
  cursor: pointer;
  padding: 4px 8px;
  transition: color var(--transition-fast);
}
.fc-retry:hover { color: var(--mm-gold); }

@media (max-width: 640px) {
  .fc-options { grid-template-columns: 1fr; }
  .fc-result { flex-direction: column; align-items: flex-start; }
}
</style>
