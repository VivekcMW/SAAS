<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Company profile</h1>
        <p class="bw-head__sub">Public company info shown on all your listings.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--primary" @click="save">Save changes</button>
      </div>
    </header>

    <div class="bw-grid bw-grid--main-aside">
      <section class="bw-card">
        <h2 class="bw-card__title">Basics</h2>
        <label class="bw-label">Company name</label>
        <input v-model="form.name" class="bw-input" />
        <label class="bw-label">Website</label>
        <input v-model="form.website" class="bw-input" />
        <label class="bw-label">Headquarters</label>
        <input v-model="form.hq" class="bw-input" />
        <label class="bw-label">Short description</label>
        <textarea v-model="form.bio" class="bw-textarea" rows="4" />
      </section>

      <aside class="bw-card">
        <h2 class="bw-card__title">Brand</h2>
        <label class="bw-label">Logo</label>
        <div class="pf-logo">
          <div class="pf-logo__preview">{{ form.name.charAt(0) }}</div>
          <button class="bw-btn bw-btn--subtle bw-btn--sm">Upload</button>
        </div>
        <label class="bw-label">Primary colour</label>
        <div class="pf-color">
          <input v-model="form.color" type="color" class="pf-color__swatch" />
          <code>{{ form.color }}</code>
        </div>
      </aside>
    </div>

    <div v-if="toast" class="bw-toast-fixed">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const form = ref({
  name: 'Acme Technologies',
  website: 'https://acme.example',
  hq: 'Austin, TX',
  bio: 'We build focused SaaS tools for growing teams — CRM, Inbox, Forms, and Analytics.',
  color: '#FF8838'
})
const toast = ref('')
function save() { toast.value = 'Profile saved'; setTimeout(() => toast.value = '', 1800) }
</script>

<style scoped>
.pf-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.pf-logo__preview {
  width: 44px; height: 44px; border-radius: 10px;
  background: var(--vw-primary); color: white; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center; font-size: 1.2rem;
}
.pf-color { display: flex; align-items: center; gap: 10px; font-family: monospace; font-size: 0.85rem; }
.pf-color__swatch { width: 40px; height: 40px; border-radius: 8px; border: 1px solid var(--vw-border); padding: 0; cursor: pointer; }
.bw-toast-fixed { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #111827; color: white; padding: 10px 16px; border-radius: 10px; font-size: 0.88rem; z-index: 1000; }
</style>
