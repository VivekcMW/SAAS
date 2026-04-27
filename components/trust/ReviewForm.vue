<template>
  <form class="review-form" @submit.prevent="submit">
    <h2 class="review-form__title">Write a Review</h2>

    <div class="review-form__group">
      <label>Rating <span class="required">*</span></label>
      <div class="review-form__stars">
        <button
          v-for="i in 5"
          :key="i"
          type="button"
          class="star-btn"
          :class="{ 'star-btn--on': i <= form.rating }"
          @click="form.rating = i"
          :aria-label="`${i} star${i > 1 ? 's' : ''}`"
        >&#9733;</button>
      </div>
    </div>

    <div class="review-form__group">
      <label>Title <span class="required">*</span></label>
      <input v-model="form.title" type="text" placeholder="Summarise your experience" maxlength="120" required />
    </div>

    <div class="review-form__group">
      <label>Review <span class="required">*</span></label>
      <textarea v-model="form.content" rows="5" placeholder="Describe your experience in detail (min 20 characters)" required minlength="20" />
    </div>

    <div class="review-form__two-col">
      <div class="review-form__group">
        <label>Role</label>
        <select v-model="form.user_role">
          <option value="">Select role</option>
          <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
      <div class="review-form__group">
        <label>Company size</label>
        <select v-model="form.company_size">
          <option value="">Select size</option>
          <option v-for="s in SIZES" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </div>

    <div class="review-form__group">
      <label>Pros <small>(up to 3)</small></label>
      <div v-for="(_, i) in form.pros" :key="i" class="review-form__list-row">
        <input v-model="form.pros[i]" type="text" placeholder="What did you love?" />
        <button type="button" class="remove-btn" @click="form.pros.splice(i, 1)">&#x2715;</button>
      </div>
      <button v-if="form.pros.length < 3" type="button" class="add-btn" @click="form.pros.push('')">+ Add pro</button>
    </div>

    <div class="review-form__group">
      <label>Cons <small>(up to 3)</small></label>
      <div v-for="(_, i) in form.cons" :key="i" class="review-form__list-row">
        <input v-model="form.cons[i]" type="text" placeholder="What could be improved?" />
        <button type="button" class="remove-btn" @click="form.cons.splice(i, 1)">&#x2715;</button>
      </div>
      <button v-if="form.cons.length < 3" type="button" class="add-btn" @click="form.cons.push('')">+ Add con</button>
    </div>

    <div class="review-form__group">
      <label>Use case</label>
      <input v-model="form.use_case" type="text" placeholder="What do you primarily use this for?" maxlength="200" />
    </div>

    <div class="review-form__group">
      <label>Outcome metric <small>(optional)</small></label>
      <input v-model="form.outcome_metric" type="text" placeholder="e.g. Reduced onboarding time by 40%" maxlength="200" />
    </div>

    <div class="review-form__group">
      <label>Purchase token <small>(optional — boosts authenticity score)</small></label>
      <input v-model="form.verified_purchase_token" type="text" placeholder="Paste your verification token" />
    </div>

    <p v-if="error" class="review-form__error">{{ error }}</p>
    <p v-if="success" class="review-form__success">{{ success }}</p>

    <button type="submit" class="review-form__submit" :disabled="loading">
      {{ loading ? 'Submitting…' : 'Submit review' }}
    </button>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{ appId: string }>()
const emit = defineEmits<{ (e: 'submitted'): void }>()

const ROLES = ['Founder/CEO', 'Product Manager', 'Developer', 'Designer', 'Marketing', 'Sales', 'Operations', 'Other']
const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

const form = reactive({
  rating: 0,
  title: '',
  content: '',
  user_role: '',
  company_size: '',
  pros: [] as string[],
  cons: [] as string[],
  use_case: '',
  outcome_metric: '',
  verified_purchase_token: ''
})
const loading = ref(false)
const error = ref('')
const success = ref('')

async function submit() {
  error.value = ''
  if (!form.rating) { error.value = 'Please select a rating.'; return }
  loading.value = true
  try {
    await $fetch('/api/reviews', {
      method: 'POST',
      body: {
        app_id: props.appId,
        ...form,
        pros: form.pros.filter(Boolean),
        cons: form.cons.filter(Boolean)
      }
    })
    success.value = 'Your review has been submitted and is pending moderation. Thank you!'
    emit('submitted')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.review-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 2rem; max-width: 640px; }
.review-form__title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; }
.review-form__group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 1.25rem; }
.review-form__group label { font-size: 0.875rem; font-weight: 600; }
.review-form__group small { font-weight: 400; color: #6b7280; }
.review-form input, .review-form select, .review-form textarea { border: 1px solid #d1d5db; border-radius: 8px; padding: 0.5rem 0.75rem; font-size: 0.9rem; font-family: inherit; transition: border-color 0.15s; }
.review-form input:focus, .review-form select:focus, .review-form textarea:focus { outline: none; border-color: #6366f1; }
.review-form__two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.review-form__list-row { display: flex; gap: 0.5rem; }
.review-form__list-row input { flex: 1; }
.remove-btn { background: none; border: none; cursor: pointer; font-size: 0.9rem; color: #9ca3af; padding: 0 6px; }
.remove-btn:hover { color: #dc2626; }
.add-btn { background: none; border: 1px dashed #d1d5db; border-radius: 6px; padding: 4px 12px; font-size: 0.8rem; color: #6b7280; cursor: pointer; width: fit-content; }
.add-btn:hover { border-color: #6366f1; color: #6366f1; }
.review-form__stars { display: flex; gap: 4px; }
.star-btn { background: none; border: none; font-size: 1.75rem; cursor: pointer; color: #d1d5db; transition: color 0.1s; padding: 0; line-height: 1; }
.star-btn--on, .star-btn:hover { color: #f59e0b; }
.review-form__error { color: #dc2626; font-size: 0.875rem; }
.review-form__success { color: #16a34a; font-size: 0.875rem; }
.review-form__submit { background: #6366f1; color: #fff; border: none; border-radius: 8px; padding: 0.625rem 1.5rem; font-size: 0.925rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.review-form__submit:hover:not(:disabled) { background: #4f46e5; }
.review-form__submit:disabled { opacity: 0.6; cursor: not-allowed; }
.required { color: #dc2626; }
</style>
