<template>
  <section class="ai-match-section">
    <div class="container">
      <div class="ai-match-card">
        <div class="ai-match-header">
          <div class="ai-badge">
            <UIcon name="i-heroicons-sparkles" dynamic />
            <span>AI Match</span>
          </div>
          <h2>Tell us what you need. We'll shortlist the tools.</h2>
          <p>Describe your problem in plain English. Our AI scans 1,200+ apps across 167 categories and returns the 3 best fits — with reasons.</p>
        </div>

        <div class="ai-match-input">
          <textarea
            v-model="prompt"
            placeholder="e.g. We're a 12-person remote agency. Need a project tool that handles client portals and time tracking. Budget under $15/user."
            rows="3"
            :disabled="loading"
          />
          <button class="match-btn" :disabled="!prompt.trim() || loading" @click="runMatch">
            <UIcon v-if="!loading" name="i-heroicons-bolt" dynamic />
            <UIcon v-else name="i-heroicons-arrow-path" dynamic class="spin" />
            <span>{{ loading ? 'Matching…' : 'Find my tools' }}</span>
          </button>
        </div>

        <div class="ai-match-chips">
          <span class="chip-label">Try:</span>
          <button
            v-for="(example, i) in examples"
            :key="i"
            class="chip"
            @click="prompt = example"
          >{{ example }}</button>
        </div>

        <div v-if="results.length" class="ai-match-results">
          <h3>Top picks for you</h3>
          <ul>
            <li v-for="r in results" :key="r.name">
              <strong>{{ r.name }}</strong>
              <span>— {{ r.reason }}</span>
            </li>
          </ul>
          <p class="results-note">Demo results. Live AI matching launches soon.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const prompt = ref('')
const loading = ref(false)
const results = ref<Array<{ name: string; reason: string }>>([])

const examples = [
  'CRM for a 10-person sales team',
  'Async video for a distributed engineering team',
  'All-in-one HR + payroll under $200/mo',
]

// Stub matcher — returns canned trending picks. Wire to /api/ai-match in Phase 2.
function runMatch() {
  if (!prompt.value.trim()) return
  loading.value = true
  results.value = []
  setTimeout(() => {
    results.value = [
      { name: 'Notion', reason: 'Flexible docs + lightweight project tracking for small teams' },
      { name: 'Linear', reason: 'Fast issue tracking loved by product-led teams' },
      { name: 'HubSpot', reason: 'Free CRM tier that scales to full revenue stack' },
    ]
    loading.value = false
  }, 900)
}
</script>

<style scoped>
.ai-match-section {
  padding: var(--spacing-xxl) 0;
  background: #fff;
}

.ai-match-card {
  max-width: 860px;
  margin: 0 auto;
  background: var(--sw-ai-soft);
  border: 1px solid rgba(99, 102, 241, 0.18);
  border-radius: 20px;
  padding: var(--spacing-xxl);
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04);
}

.ai-match-header { text-align: center; margin-bottom: var(--spacing-xl); }

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--sw-ai);
  color: #fff;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: var(--fs-caption);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}

.ai-match-header h2 {
  font-size: 1.875rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--sw-text);
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.ai-match-header p {
  color: var(--sw-text-muted);
  max-width: 620px;
  margin: 0 auto;
}

.ai-match-input {
  display: flex;
  gap: 12px;
  align-items: stretch;
  margin-bottom: var(--spacing-md);
}

.ai-match-input textarea {
  flex: 1;
  resize: none;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 14px 16px;
  font-family: inherit;
  font-size: 1rem;
  color: var(--sw-text);
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.ai-match-input textarea:focus {
  outline: none;
  border-color: var(--sw-ai);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}

.match-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--sw-ai);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0 22px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  min-height: 56px;
  white-space: nowrap;
}

.match-btn:hover:not(:disabled) { background: #4F46E5; }
.match-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spin { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.ai-match-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.chip-label {
  font-size: var(--fs-caption);
  color: var(--sw-text-subtle);
  font-weight: 500;
}

.chip {
  border: 1px solid #E5E7EB;
  background: #fff;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.875rem;
  color: var(--sw-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  border-color: var(--sw-ai);
  color: var(--sw-ai);
  background: #fff;
}

.ai-match-results {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px dashed rgba(99, 102, 241, 0.25);
}

.ai-match-results h3 {
  margin: 0 0 12px;
  font-size: 1.125rem;
  color: var(--sw-text);
}

.ai-match-results ul {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-match-results li {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 12px 16px;
  color: var(--sw-text-muted);
}

.ai-match-results strong { color: var(--sw-text); margin-right: 4px; }

.results-note {
  font-size: var(--fs-caption);
  color: var(--sw-text-subtle);
  margin: 0;
}

@media (max-width: 640px) {
  .ai-match-card { padding: var(--spacing-xl); border-radius: 16px; }
  .ai-match-input { flex-direction: column; }
  .match-btn { justify-content: center; min-height: 48px; padding: 12px; }
  .ai-match-header h2 { font-size: 1.5rem; }
}
</style>
