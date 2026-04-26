<template>
  <main class="mk-page">
    <section class="mk-hero demo-hero">
      <div class="mk-hero__inner">
        <p class="mk-eyebrow">Book a demo</p>
        <h1 class="mk-hero__title">See Moonmart on your stack</h1>
        <p class="mk-hero__lede">
          30 minutes with a product specialist. We'll walk through the marketplace, your
          shortlist, and how vendor distribution works — then you decide what's useful.
        </p>
      </div>
    </section>

    <section class="mk-section demo-grid-section">
      <div class="mk-section__inner demo-grid">
        <!-- Left: form -->
        <form class="demo-form" @submit.prevent="onSubmit">
          <h2 class="demo-form__title">Tell us a bit about you</h2>

          <div class="demo-form__row">
            <label>
              <span>First name</span>
              <input v-model="form.firstName" type="text" required autocomplete="given-name">
            </label>
            <label>
              <span>Last name</span>
              <input v-model="form.lastName" type="text" required autocomplete="family-name">
            </label>
          </div>

          <label>
            <span>Work email</span>
            <input v-model="form.email" type="email" required autocomplete="email" placeholder="you@company.com">
          </label>

          <div class="demo-form__row">
            <label>
              <span>Company</span>
              <input v-model="form.company" type="text" required autocomplete="organization">
            </label>
            <label>
              <span>Role</span>
              <select v-model="form.role" required>
                <option value="" disabled>Select…</option>
                <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
              </select>
            </label>
          </div>

          <label>
            <span>Team size</span>
            <select v-model="form.size" required>
              <option value="" disabled>Select…</option>
              <option v-for="s in sizes" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>

          <label>
            <span>What are you hoping to solve? <em>(optional)</em></span>
            <textarea v-model="form.goal" rows="3" placeholder="e.g. replacing our CRM, centralising SaaS procurement…" />
          </label>

          <label class="demo-form__consent">
            <input v-model="form.consent" type="checkbox" required>
            <span>
              I agree to Moonmart's <NuxtLink to="/privacy">Privacy Policy</NuxtLink> and to
              being contacted about my request.
            </span>
          </label>

          <button type="submit" class="mk-btn mk-btn--primary" :disabled="submitting">
            {{ submitting ? 'Sending…' : 'Request demo' }}
          </button>
          <p v-if="sent" class="demo-form__success">
            Thanks — we'll reach out within one business day.
          </p>
        </form>

        <!-- Right: sidebar -->
        <aside class="demo-side">
          <h3 class="demo-side__title">What to expect</h3>
          <ul class="demo-side__list">
            <li v-for="b in bullets" :key="b">{{ b }}</li>
          </ul>

          <div class="demo-side__quote">
            <p class="demo-side__quote-text">"We went from 'long list of 17 tools' to signed contract in 19 days. Our CFO is on board."</p>
            <p class="demo-side__quote-attr">— Priya Rao, VP RevOps, Atlas Robotics</p>
          </div>

          <div class="demo-side__badges">
            <span class="mk-tag">SOC 2 Type II</span>
            <span class="mk-tag">ISO 27001</span>
            <span class="mk-tag">GDPR ready</span>
          </div>

          <p class="demo-side__alt">
            Just looking? <NuxtLink to="/marketplace">Browse the marketplace</NuxtLink> — no
            signup required.
          </p>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { applySEO } = useSEO()
applySEO({
  title: 'Book a demo | Moonmart',
  description: 'Book a 30-minute demo with a Moonmart product specialist.',
  canonical: 'https://moonmart.ai/demo',
  ogType: 'website'
})

const roles = [
  'Founder / CEO', 'RevOps / Sales Ops', 'Marketing', 'Product', 'Engineering',
  'IT / Security', 'Finance', 'People / HR', 'Procurement', 'Other'
]
const sizes = ['1–10', '11–50', '51–200', '201–1000', '1000+']

const form = reactive({
  firstName: '', lastName: '', email: '', company: '', role: '', size: '', goal: '', consent: false
})
const submitting = ref(false)
const sent = ref(false)

async function onSubmit () {
  submitting.value = true
  try {
    await $fetch('/api/demos', {
      method: 'POST',
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        company: form.company,
        role: form.role,
        size: form.size,
        goal: form.goal,
        consent: form.consent
      }
    })
    sent.value = true
  } finally {
    submitting.value = false
  }
}

const bullets = [
  '30-minute live walkthrough, camera optional.',
  'Bring your current stack — we\'ll benchmark it live.',
  'We answer pricing, security and privacy questions on the call.',
  'No pushy follow-ups. If it\'s not a fit, we\'ll say so.'
]
</script>

<style scoped>
.demo-hero { padding-bottom: 2rem; }

.demo-grid-section { padding-top: 3rem; }
.demo-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 2rem; align-items: start; }
@media (max-width: 900px) { .demo-grid { grid-template-columns: 1fr; } }

/* Form */
.demo-form { background: var(--mm-s2); border: 0.5px solid var(--b1); border-radius: var(--r-xl); padding: 2rem; display: flex; flex-direction: column; gap: 1rem; }
.demo-form__title { font-family: var(--f-display); font-size: 1.25rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 0.25rem; }
.demo-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 540px) { .demo-form__row { grid-template-columns: 1fr; } }

.demo-form label { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.875rem; color: var(--mm-silver); font-weight: 500; }
.demo-form label span em { color: var(--mm-slate); font-style: normal; font-weight: 400; }
.demo-form input, .demo-form select, .demo-form textarea {
  padding: 0.7rem 0.9rem; border: 0.5px solid var(--b2); border-radius: var(--r-md); font-size: 0.95rem;
  background: var(--mm-s3); color: var(--mm-pearl); outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
}
.demo-form input:focus, .demo-form select:focus, .demo-form textarea:focus {
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 3px var(--mm-gold-soft);
}
.demo-form textarea { resize: vertical; min-height: 80px; }

.demo-form__consent { flex-direction: row !important; align-items: flex-start; gap: 0.6rem !important; font-size: 0.82rem !important; color: var(--mm-silver) !important; }
.demo-form__consent input { margin-top: 0.15rem; }
.demo-form__consent a { color: var(--mm-gold); text-decoration: none; font-weight: 600; }

.demo-form__success { color: var(--mm-seal); background: var(--mm-sea-soft); border: 0.5px solid var(--mm-sea); border-radius: var(--r-md); padding: 0.7rem 0.9rem; font-size: 0.88rem; margin: 0; }

/* Sidebar */
.demo-side { background: var(--mm-gold-soft); border: 0.5px solid var(--b1); border-radius: var(--r-xl); padding: 2rem; }
.demo-side__title { font-family: var(--f-display); font-size: 1.1rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 1rem; }
.demo-side__list { list-style: none; padding: 0; margin: 0 0 1.5rem; }
.demo-side__list li { padding: 0.5rem 0 0.5rem 1.5rem; position: relative; color: var(--mm-silver); font-size: 0.92rem; line-height: 1.5; }
.demo-side__list li::before { content: '✓'; position: absolute; left: 0; top: 0.5rem; color: var(--mm-gold); font-weight: 700; }

.demo-side__quote { background: var(--mm-s2); border-radius: var(--r-md); padding: 1.1rem 1.25rem; margin-bottom: 1.25rem; border-left: 2px solid var(--mm-gold); }
.demo-side__quote-text { font-size: 0.9rem; color: var(--mm-silver); line-height: 1.55; font-style: italic; margin: 0 0 0.5rem; }
.demo-side__quote-attr { font-size: 0.78rem; color: var(--mm-slate); margin: 0; }

.demo-side__badges { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }

.demo-side__alt { font-size: 0.85rem; color: var(--mm-silver); margin: 0; }
.demo-side__alt a { color: var(--mm-gold); font-weight: 600; text-decoration: none; }
</style>
