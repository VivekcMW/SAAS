<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Review requests</h1>
        <p class="bw-head__sub">Nudge happy customers to leave a review. More reviews → better ranking.</p>
      </div>
      <div class="bw-head__actions">
        <span class="vw-ai-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
          {{ pendingReviewers.length }} prospects to nudge
        </span>
      </div>
    </header>

    <!-- KPIs -->
    <div class="bw-kpis">
      <div class="bw-kpi">
        <div class="bw-kpi__label">Closed leads</div>
        <div class="bw-kpi__value">{{ closedLeads.length }}</div>
        <div class="bw-kpi__foot">Potential reviewers</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Requests sent</div>
        <div class="bw-kpi__value">{{ sentCount }}</div>
        <div class="bw-kpi__foot">This month</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Reviews on listings</div>
        <div class="bw-kpi__value">{{ totalReviews }}</div>
        <div class="bw-kpi__foot">Across all products</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Avg rating</div>
        <div class="bw-kpi__value">★ {{ kpis.avgRating }}</div>
        <div class="bw-kpi__foot">Keep it above 4.5</div>
      </div>
    </div>

    <!-- Review link generator -->
    <div class="vw-ai-card rr-link-gen bw-section">
      <div class="vw-ai-card__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        Your direct review link
      </div>
      <div class="rr-link-row">
        <select v-model="selectedListingId" class="bw-select rr-select">
          <option value="">All listings</option>
          <option v-for="l in listings" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
        <div class="rr-link-box">
          <code class="rr-link-text">{{ reviewLink }}</code>
          <button class="bw-btn bw-btn--primary bw-btn--sm" @click="copyLink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            {{ linkCopied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
      <p class="rr-link-hint">Share this link in post-sale emails, onboarding flows, or in-app nudges.</p>
    </div>

    <!-- Customers to nudge -->
    <section class="bw-card bw-section">
      <div class="bw-card__head">
        <h2 class="bw-card__title">Closed deals — ready to review</h2>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input v-model="search" class="bw-input" placeholder="Search by name…" style="max-width: 220px;" >
        </div>
      </div>

      <div v-if="leadsLoading" class="bw-empty" style="border: none; padding: 24px 0;">
        <p class="bw-empty__desc">Loading…</p>
      </div>

      <div v-else-if="pendingReviewers.length === 0" class="bw-empty" style="border: none; padding: 24px 0;">
        <div class="bw-empty__icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <h3 class="bw-empty__title">No prospects yet</h3>
        <p class="bw-empty__desc">Closed leads will appear here once you've replied and marked them resolved.</p>
      </div>

      <table v-else class="bw-table">
        <thead>
          <tr>
            <th scope="col">Customer</th>
            <th scope="col">Product</th>
            <th scope="col">Closed</th>
            <th scope="col">Status</th>
            <th scope="col"/>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in pendingReviewers" :key="l.id">
            <td>
              <div class="rr-buyer">
                <div class="rr-avatar">{{ l.buyerName.charAt(0) }}</div>
                <div>
                  <div class="rr-name">{{ l.buyerName }}</div>
                  <div class="rr-company">{{ l.buyerCompany }}</div>
                </div>
              </div>
            </td>
            <td>{{ l.listingName }}</td>
            <td class="rr-date">{{ l.updatedAt }}</td>
            <td>
              <span v-if="sent.has(l.id)" class="bw-chip bw-chip--success">Sent</span>
              <span v-else class="bw-chip bw-chip--neutral">Pending</span>
            </td>
            <td>
              <div class="rr-actions">
                <a
                  :href="mailtoLink(l)"
                  class="bw-btn bw-btn--primary bw-btn--sm"
                  target="_blank"
                  rel="noopener"
                  @click="markSent(l.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Email request
                </a>
                <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="copyPersonalLink(l)">
                  {{ personalCopied === l.id ? 'Copied!' : 'Copy link' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Email template preview -->
    <section class="bw-card bw-section">
      <div class="bw-card__head">
        <h2 class="bw-card__title">Email template</h2>
        <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="copyTemplate">
          {{ templateCopied ? 'Copied!' : 'Copy template' }}
        </button>
      </div>
      <div class="rr-template">
        <p><strong>Subject:</strong> Would you share your experience with {{ selectedListingName || '[Product Name]' }}?</p>
        <hr class="rr-template__hr" >
        <p>Hi [First Name],</p>
        <p>Thanks for using {{ selectedListingName || '[Product Name]' }} — I hope it's been useful for your team.</p>
        <p>If you've had a positive experience, I'd love it if you could take 2 minutes to leave a review on Moonmart. Honest reviews help other buyers make better decisions and mean a lot to us.</p>
        <p>→ <a :href="reviewLink" class="bw-link">{{ reviewLink }}</a></p>
        <p>No worries if now isn't a good time — and feel free to reply if there's anything I can help with.</p>
        <p>Thanks,<br>[Your name]</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { leads, listings, kpis, leadsLoading, loadLeads } = useVendorData()

onMounted(loadLeads)

const search = ref('')
const selectedListingId = ref('')
const linkCopied = ref(false)
const personalCopied = ref<string | null>(null)
const templateCopied = ref(false)
const sent = ref(new Set<string>())

// Closed leads not already reviewed (approximated as leads with status === 'closed')
const closedLeads = computed(() => leads.value.filter(l => l.status === 'closed'))
const sentCount = computed(() => sent.value.size)
const totalReviews = computed(() => listings.value.reduce((s, l) => s + l.reviewsCount, 0))

const pendingReviewers = computed(() => {
  let list = closedLeads.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(l =>
      l.buyerName.toLowerCase().includes(q) ||
      l.buyerCompany.toLowerCase().includes(q) ||
      l.listingName.toLowerCase().includes(q)
    )
  }
  return list
})

const selectedListingName = computed(() =>
  listings.value.find(l => l.id === selectedListingId.value)?.name ?? ''
)

const reviewBaseUrl = computed(() => {
  if (typeof window === 'undefined') return 'https://moonmart.ai/review'
  return `${window.location.origin}/review`
})

const reviewLink = computed(() => {
  if (selectedListingId.value) return `${reviewBaseUrl.value}/${selectedListingId.value}`
  return `${reviewBaseUrl.value}/acme-crm`
})

function personalLink(l: { listingId: string }) {
  return `${reviewBaseUrl.value}/${l.listingId}`
}

function mailtoLink(l: { buyerName: string; listingName: string; listingId: string }) {
  const firstName = l.buyerName.split(' ')[0]
  const subject = encodeURIComponent(`Would you share your experience with ${l.listingName}?`)
  const body = encodeURIComponent(
    `Hi ${firstName},\n\nThanks for using ${l.listingName} — I hope it's been useful for your team.\n\nIf you've had a positive experience, I'd love it if you could take 2 minutes to leave a review on Moonmart:\n\n${personalLink(l)}\n\nNo worries if now isn't a good time. Feel free to reply with any questions.\n\nThanks,\n[Your name]`
  )
  return `mailto:?subject=${subject}&body=${body}`
}

function markSent(id: string) {
  sent.value = new Set([...sent.value, id])
}

async function copyLink() {
  await navigator.clipboard.writeText(reviewLink.value).catch(() => null)
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 1800)
}

async function copyPersonalLink(l: { id: string; listingId: string }) {
  await navigator.clipboard.writeText(personalLink(l)).catch(() => null)
  personalCopied.value = l.id
  setTimeout(() => { personalCopied.value = null }, 1800)
}

const emailTemplate = computed(() => {
  const name = selectedListingName.value || '[Product Name]'
  return `Subject: Would you share your experience with ${name}?\n\nHi [First Name],\n\nThanks for using ${name} — I hope it's been useful for your team.\n\nIf you've had a positive experience, I'd love it if you could take 2 minutes to leave a review on Moonmart. Honest reviews help other buyers make better decisions and mean a lot to us.\n\n→ ${reviewLink.value}\n\nNo worries if now isn't a good time — and feel free to reply if there's anything I can help with.\n\nThanks,\n[Your name]`
})

async function copyTemplate() {
  await navigator.clipboard.writeText(emailTemplate.value).catch(() => null)
  templateCopied.value = true
  setTimeout(() => { templateCopied.value = false }, 1800)
}
</script>

<style scoped>
.rr-link-gen { margin-bottom: 0; }
.rr-link-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
.rr-select { max-width: 200px; }
.rr-link-box {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px;
  padding: 8px 10px 8px 14px;
  background: var(--vw-surface-2);
  border: 1px dashed var(--vw-border-strong);
  border-radius: 8px;
}
.rr-link-text { font-family: 'SF Mono', Menlo, monospace; font-size: 0.82rem; color: var(--vw-text-muted); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rr-link-hint { font-size: 0.82rem; color: var(--vw-text-subtle); margin: 0; }

.rr-buyer { display: flex; align-items: center; gap: 10px; }
.rr-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: var(--vw-primary); color: white; font-weight: 700; font-size: 0.85rem;
  display: inline-flex; align-items: center; justify-content: center;
}
.rr-name { font-weight: 600; font-size: 0.88rem; }
.rr-company { font-size: 0.76rem; color: var(--vw-text-subtle); }
.rr-date { font-size: 0.82rem; color: var(--vw-text-muted); }
.rr-actions { display: flex; gap: 6px; align-items: center; }

.rr-template {
  background: var(--vw-surface-2);
  border: 1px solid var(--vw-border);
  border-radius: 10px;
  padding: 16px 18px;
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--vw-text-muted);
}
.rr-template p { margin: 0 0 12px; }
.rr-template p:last-child { margin: 0; }
.rr-template__hr { border: none; border-top: 1px solid var(--vw-border); margin: 12px 0; }
.rr-template strong { color: var(--vw-text); }
</style>
