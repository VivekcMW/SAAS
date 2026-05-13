<template>
  <main class="mk-page">
    <!-- Hero -->
    <section class="mk-hero">
      <div class="mk-hero__inner">
        <span class="mk-eyebrow">Contact</span>
        <h1 class="mk-hero__title">Talk to a human, get real answers.</h1>
        <p class="mk-hero__lede">
          Buying software, listing a product, or just stuck on a question — pick the
          channel that suits you. Most replies land in your inbox within one business hour.
        </p>
        <div class="mk-hero__cta">
          <a href="#contact-form" class="mk-btn mk-btn--primary">Send a message</a>
          <NuxtLink to="/demo" class="mk-btn mk-btn--ghost">Book a live demo</NuxtLink>
        </div>
        <ul class="ct-trust">
          <li>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            &lt; 1&nbsp;business-hour response
          </li>
          <li>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Real people, no chatbots
          </li>
        </ul>
      </div>
    </section>

    <!-- Quick-route cards -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">What can we help you with?</h2>
        <p class="mk-section__lede">Pick the fastest path — we'll route you to the right team.</p>
        <div class="mk-grid ct-routes">
          <article v-for="r in routes" :key="r.title" class="mk-card ct-route">
            <div class="ct-route__icon" aria-hidden="true">
              <component :is="r.icon" />
            </div>
            <h3 class="ct-route__title">{{ r.title }}</h3>
            <p class="ct-route__desc">{{ r.desc }}</p>
            <a :href="r.href" class="mk-card__link">{{ r.cta }} &rarr;</a>
          </article>
        </div>
      </div>
    </section>

    <!-- Form + Sidebar -->
    <section id="contact-form" class="mk-section mk-section--soft">
      <div class="mk-section__inner ct-layout">
        <div class="ct-form-col">
          <span class="mk-eyebrow">Send us a message</span>
          <h2 class="ct-form__title">Tell us what you need</h2>
          <p class="ct-form__lede">
            The more context you share, the faster we can help. Fields marked
            <span class="ct-req">*</span> are required.
          </p>

          <form v-if="!sent" class="ct-form" novalidate @submit.prevent="onSubmit">
            <div class="ct-row">
              <label class="ct-field">
                <span>First name <span class="ct-req">*</span></span>
                <input v-model="form.firstName" type="text" required autocomplete="given-name" >
              </label>
              <label class="ct-field">
                <span>Last name <span class="ct-req">*</span></span>
                <input v-model="form.lastName" type="text" required autocomplete="family-name" >
              </label>
            </div>

            <div class="ct-row">
              <label class="ct-field">
                <span>Work email <span class="ct-req">*</span></span>
                <input v-model="form.email" type="email" required autocomplete="email" placeholder="you@company.com" >
              </label>
              <label class="ct-field">
                <span>Company</span>
                <input v-model="form.company" type="text" autocomplete="organization" >
              </label>
            </div>

            <div class="ct-row">
              <label class="ct-field">
                <span>I'm contacting as <span class="ct-req">*</span></span>
                <select v-model="form.persona" required>
                  <option value="" disabled>Select...</option>
                  <option value="buyer">Buyer / evaluating software</option>
                  <option value="vendor">Vendor / want to list</option>
                  <option value="partner">Agency or partner</option>
                  <option value="press">Press / analyst</option>
                  <option value="support">Existing account support</option>
                  <option value="other">Something else</option>
                </select>
              </label>
              <label class="ct-field">
                <span>Topic</span>
                <select v-model="form.topic">
                  <option value="">General question</option>
                  <option value="pricing">Pricing &amp; plans</option>
                  <option value="onboarding">Onboarding help</option>
                  <option value="integrations">Integrations</option>
                  <option value="billing">Billing</option>
                  <option value="security">Security / DPA</option>
                  <option value="bug">Bug report</option>
                </select>
              </label>
            </div>

            <label class="ct-field">
              <span>How can we help? <span class="ct-req">*</span></span>
              <textarea
                v-model="form.message"
                rows="5"
                required
                maxlength="2000"
                placeholder="A few sentences about your goal, stack, and timeline help us reply with something useful."
              />
              <small class="ct-hint">{{ form.message.length }} / 2000</small>
            </label>

            <label class="ct-consent">
              <input v-model="form.consent" type="checkbox" required >
              <span>
                I agree to Moonmart processing my details under the
                <NuxtLink to="/privacy">Privacy Policy</NuxtLink>.
              </span>
            </label>

            <div class="ct-actions">
              <button type="submit" class="mk-btn mk-btn--primary" :disabled="submitting">
                {{ submitting ? 'Sending…' : 'Send message' }}
              </button>
              <span class="ct-actions__note">We usually reply within one business hour.</span>
            </div>
          </form>

          <output v-else class="ct-success" aria-live="polite">
            <div class="ct-success__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="32" height="32"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h3>Message sent.</h3>
            <p>Thanks, {{ form.firstName || 'friend' }}. We've logged your request and you'll hear back at <strong>{{ form.email }}</strong> shortly.</p>
            <div class="ct-success__ctas">
              <NuxtLink to="/marketplace" class="mk-btn mk-btn--primary">Browse the marketplace</NuxtLink>
              <button type="button" class="mk-btn mk-btn--ghost" @click="resetForm">Send another</button>
            </div>
          </output>
        </div>

        <aside class="ct-side">
          <div class="ct-side__card">
            <h3>Prefer email?</h3>
            <ul class="ct-contacts">
              <li>
                <span class="ct-contacts__label">Sales</span>
                <a href="mailto:sales@moonmart.ai">sales@moonmart.ai</a>
              </li>
              <li>
                <span class="ct-contacts__label">Support</span>
                <a href="mailto:support@moonmart.ai">support@moonmart.ai</a>
              </li>
              <li>
                <span class="ct-contacts__label">Press</span>
                <a href="mailto:press@moonmart.ai">press@moonmart.ai</a>
              </li>
              <li>
                <span class="ct-contacts__label">Security</span>
                <a href="mailto:security@moonmart.ai">security@moonmart.ai</a>
              </li>
            </ul>
          </div>

          <div class="ct-side__card">
            <h3>Offices</h3>
            <ul class="ct-offices">
              <li><strong>San Francisco</strong><span>548 Market St · HQ</span></li>
              <li><strong>Berlin</strong><span>Friedrichstraße 68 · EU</span></li>
              <li><strong>Singapore</strong><span>1 Raffles Place · APAC</span></li>
            </ul>
          </div>

          <div class="ct-side__card ct-side__card--quote">
            <p>"Replied inside 20 minutes with a tailored shortlist. No other directory has done that for us."</p>
            <footer>— Priya Rao, Head of Ops @ Mercury Market</footer>
          </div>
        </aside>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mk-section">
      <div class="mk-section__inner">
        <h2 class="mk-section__title">Common questions</h2>
        <div class="mk-faq">
          <details v-for="q in faqs" :key="q.q" class="mk-faq__item">
            <summary>{{ q.q }}</summary>
            <p>{{ q.a }}</p>
          </details>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { h, reactive, ref } from 'vue'

const { applySEO } = useSEO()
applySEO({
  title: 'Contact Moonmart — Talk to our team',
  description:
    'Get answers from real humans at Moonmart. Sales, support, press, and partner contacts. Replies within one business hour on weekdays.',
  canonical: '/contact',
  ogType: 'website'
})

// Inline brand-color icons — no external deps
const IconDoc = () => h('svg', { viewBox: '0 0 24 24', width: 24, height: 24 }, [
  h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.75, 'stroke-linejoin': 'round' }),
  h('path', { d: 'M14 2v6h6 M16 13H8 M16 17H8 M10 9H9', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.75, 'stroke-linecap': 'round' })
])
const IconStore = () => h('svg', { viewBox: '0 0 24 24', width: 24, height: 24 }, [
  h('path', { d: 'M3 9l2-5h14l2 5 M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9 M3 9h18 M8 13h8', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.75, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
])
const IconShield = () => h('svg', { viewBox: '0 0 24 24', width: 24, height: 24 }, [
  h('path', { d: 'M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6z M9 12l2 2 4-4', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.75, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
])

type Route = { title: string; desc: string; cta: string; href: string; icon: () => ReturnType<typeof h> }
const routes: Route[] = [
  { title: 'I already have an account', desc: 'Account, billing, or product questions — our support team replies fast.', cta: 'Email support', href: 'mailto:support@moonmart.ai', icon: IconDoc },
  { title: 'I want to list my product', desc: 'Reach buyers actively searching in your category. Free plan available.', cta: 'List your product', href: '/list-product', icon: IconStore },
  { title: 'Security or legal enquiry', desc: 'DPAs, security reviews, and responsible disclosure.', cta: 'Visit Trust Center', href: '/trust', icon: IconShield }
]

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  persona: '',
  topic: '',
  message: '',
  consent: false
})
const submitting = ref(false)
const sent = ref(false)

function resetForm() {
  form.firstName = ''
  form.lastName = ''
  form.email = ''
  form.company = ''
  form.persona = ''
  form.topic = ''
  form.message = ''
  form.consent = false
  sent.value = false
}

async function onSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        subject: form.topic || undefined,
        message: form.message
      }
    })
    sent.value = true
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Something went wrong. Please try again.')
  } finally {
    submitting.value = false
  }
}

const faqs = [
  { q: 'How fast will I get a reply?', a: 'Under one business hour on weekdays (Mon–Fri, 07:00–19:00 UTC). Weekend and holiday messages are answered first thing Monday morning.' },
  { q: 'Is there a cost to talk to your team?', a: 'No. Buyer advisory — including shortlists and demos — is 100% free. We earn revenue from vendor subscriptions, not from buyers.' },
  { q: 'Can I request an NDA before a sales call?', a: 'Yes. Email legal@moonmart.ai with your NDA template and we\'ll countersign within one business day.' },
  { q: 'Do you offer phone support?', a: 'Scale-plan customers get a dedicated CSM with a direct line. Everyone else can book a call via /demo or email sales@moonmart.ai.' },
  { q: 'What information should I include?', a: 'Your stack, team size, budget range, and the problem you\'re solving. The more specifics, the sharper our recommendation.' },
  { q: 'How do you protect my data?', a: 'All form submissions are encrypted in transit and at rest. We do not sell contact data. Read our full policy at /privacy.' }
]
</script>

<style scoped>
/* Trust strip under hero */
.ct-trust {
  list-style: none;
  padding: 0;
  margin: 1.5rem auto 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem 1.5rem;
  color: var(--mm-silver);
  font-size: 0.9rem;
}
.ct-trust li { display: inline-flex; align-items: center; gap: 0.45rem; }
.ct-trust svg { color: var(--mm-gold); flex-shrink: 0; }

/* Route cards */
.ct-routes {
  margin-top: 2rem;
  /* Lock to 3 columns so the cards center nicely; shared .mk-grid uses auto-fill which would left-align 3 cards in a 4-slot row */
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
}
@media (max-width: 820px) {
  .ct-routes { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 640px; }
}
@media (max-width: 560px) {
  .ct-routes { grid-template-columns: 1fr; max-width: 400px; }
}
.ct-route { padding: 1.75rem 1.5rem; display: flex; flex-direction: column; gap: 0.6rem; }
.ct-route__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--r-md);
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}
.ct-route__title {
  font-family: var(--f-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0;
}
.ct-route__desc { color: var(--mm-silver); font-size: 0.92rem; line-height: 1.55; margin: 0; flex: 1; }

/* Form + sidebar layout */
.ct-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 2.5rem;
  align-items: start;
}
@media (max-width: 960px) {
  .ct-layout { grid-template-columns: 1fr; gap: 2rem; }
}

.ct-form-col { background: var(--mm-s1); border: 0.5px solid var(--b2); border-radius: var(--r-lg); padding: 2rem 2rem 2.25rem; }
.ct-form__title {
  font-family: var(--f-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0.35rem 0 0.4rem;
}
.ct-form__lede { color: var(--mm-silver); font-size: 0.94rem; line-height: 1.55; margin: 0 0 1.5rem; }
.ct-req { color: var(--mm-gold); font-weight: 600; }

.ct-form { display: flex; flex-direction: column; gap: 1.1rem; }
.ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 600px) { .ct-row { grid-template-columns: 1fr; } }

.ct-field { display: flex; flex-direction: column; gap: 0.4rem; }
.ct-field > span:first-child { font-size: 0.82rem; font-weight: 600; color: var(--mm-silver); }
.ct-field input,
.ct-field select,
.ct-field textarea {
  font: inherit;
  color: var(--mm-pearl);
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  padding: 0.7rem 0.85rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  width: 100%;
}
.ct-field textarea { resize: vertical; min-height: 120px; }
.ct-field input:focus,
.ct-field select:focus,
.ct-field textarea:focus {
  outline: none;
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 3px var(--mm-gold-soft);
}
.ct-field input::placeholder,
.ct-field textarea::placeholder { color: var(--mm-slate); }
.ct-hint { color: var(--mm-slate); font-size: 0.75rem; text-align: right; }

.ct-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: var(--mm-silver);
  line-height: 1.5;
}
.ct-consent input { margin-top: 0.2rem; accent-color: var(--mm-gold); }
.ct-consent a { color: var(--mm-gold); font-weight: 600; }

.ct-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
}
.ct-actions__note { color: var(--mm-slate); font-size: 0.82rem; }

.ct-success { text-align: center; padding: 2rem 1rem; }
.ct-success__icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
.ct-success h3 {
  font-family: var(--f-display);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 0.5rem;
}
.ct-success p { color: var(--mm-silver); font-size: 0.96rem; line-height: 1.55; margin: 0 auto 1.5rem; max-width: 440px; }
.ct-success__ctas { display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap; }

/* Sidebar */
.ct-side { display: flex; flex-direction: column; gap: 1rem; }
.ct-side__card { background: var(--mm-s1); border: 0.5px solid var(--b1); border-radius: var(--r-lg); padding: 1.4rem 1.5rem; }
.ct-side__card h3 {
  font-family: var(--f-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 1rem;
}

.ct-contacts { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.7rem; }
.ct-contacts li { display: flex; flex-direction: column; gap: 0.1rem; }
.ct-contacts__label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--mm-slate); }
.ct-contacts a { color: var(--mm-silver); font-weight: 500; font-size: 0.94rem; text-decoration: none; border-bottom: 0.5px dashed var(--b2); padding-bottom: 1px; width: fit-content; }
.ct-contacts a:hover { color: var(--mm-gold); border-bottom-color: var(--mm-gold); }

.ct-offices { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.ct-offices li { display: flex; flex-direction: column; gap: 0.1rem; font-size: 0.9rem; color: var(--mm-silver); }
.ct-offices strong { color: var(--mm-pearl); font-weight: 600; font-size: 0.95rem; }

.ct-side__card--quote {
  background: var(--mm-s2);
  border: 0.5px solid var(--mm-gold);
  box-shadow: 0 10px 30px -22px var(--mm-gold-soft);
}
.ct-side__card--quote p {
  color: var(--mm-silver);
  font-size: 0.96rem;
  line-height: 1.55;
  font-style: italic;
  margin: 0 0 0.75rem;
}
.ct-side__card--quote footer { color: var(--mm-slate); font-size: 0.82rem; font-style: normal; }
</style>
