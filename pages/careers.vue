<template>
  <div class="careers-page">
    <div class="page-hero">
      <h1>Join Our Team</h1>
      <p>Help us build the world's best SaaS marketplace. We're hiring across all functions.</p>
      <div class="hero-stats">
        <div class="stat"><strong>{{ data?.total ?? 0 }}</strong><span>Open Roles</span></div>
        <div class="stat"><strong>100%</strong><span>Remote First</span></div>
        <div class="stat"><strong>30+</strong><span>Countries</span></div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-row">
        <div class="filter-group">
          <label>Department</label>
          <div class="filter-pills">
            <button
              v-for="d in departments"
              :key="d.value"
              :class="['filter-btn', activeDept === d.value && 'active']"
              @click="setDept(d.value)"
            >
              {{ d.label }}
            </button>
          </div>
        </div>
        <div class="filter-group">
          <label>Work Style</label>
          <div class="filter-pills">
            <button
              v-for="r in remotes"
              :key="r.value"
              :class="['filter-btn', activeRemote === r.value && 'active']"
              @click="setRemote(r.value)"
            >
              {{ r.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">
      <div v-for="i in 4" :key="i" class="skeleton-job" />
    </div>
    <div v-else-if="error" class="empty-state">
      <p>Unable to load job listings. Please try again.</p>
    </div>
    <div v-else-if="!jobs.length" class="empty-state">
      <p>No open positions matching your filters. Check back soon!</p>
    </div>
    <div v-else class="jobs-list">
      <article v-for="job in jobs" :key="job.id" class="job-card">
        <div class="job-header">
          <div>
            <h2 class="job-title">{{ job.title }}</h2>
            <div class="job-meta">
              <span class="dept-badge">{{ job.department }}</span>
              <span class="meta-pill">{{ job.location }}</span>
              <span :class="['meta-pill', `remote-${job.remote}`]">{{ job.remote }}</span>
              <span class="meta-pill">{{ job.type }}</span>
              <span v-if="job.salary_min && job.salary_max" class="salary">
                {{ formatSalary(job.salary_min, job.salary_max, job.salary_currency) }}
              </span>
            </div>
          </div>
          <a
            v-if="job.apply_url"
            :href="job.apply_url"
            target="_blank"
            rel="noopener noreferrer"
            class="apply-btn"
          >Apply Now</a>
        </div>

        <p class="job-desc">{{ job.description }}</p>

        <div v-if="job.requirements?.length" class="req-section">
          <h4>Requirements</h4>
          <ul>
            <li v-for="req in job.requirements" :key="req">{{ req }}</li>
          </ul>
        </div>
        <div v-if="job.nice_to_have?.length" class="req-section nice">
          <h4>Nice to Have</h4>
          <ul>
            <li v-for="n in job.nice_to_have" :key="n">{{ n }}</li>
          </ul>
        </div>
      </article>
    </div>

    <!-- Footer CTA -->
    <div class="footer-cta">
      <h2>Don't see your role?</h2>
      <p>We're always looking for exceptional people. Send us your resume.</p>
      <a href="mailto:careers@moonmart.com" class="cta-btn">Get in Touch</a>
    </div>
  </div>
</template>

<script setup lang="ts">
interface JobListing {
  id: string
  title: string
  department: string
  location: string
  type: string
  remote: string
  description: string
  requirements: string[]
  nice_to_have: string[]
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  apply_url: string | null
  created_at: string
}

interface JobsResponse {
  jobs: JobListing[]
  total: number
}

const activeDept = ref('')
const activeRemote = ref('')

const departments = [
  { value: '', label: 'All' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'product', label: 'Product' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'operations', label: 'Operations' }
]

const remotes = [
  { value: '', label: 'All' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' }
]

const url = computed(() => {
  const params = new URLSearchParams()
  if (activeDept.value) params.set('department', activeDept.value)
  if (activeRemote.value) params.set('remote', activeRemote.value)
  return `/api/careers/jobs?${params}`
})

const { data, pending, error } = await useFetch<JobsResponse>(url)
const jobs = computed(() => data.value?.jobs ?? [])

function setDept(v: string) { activeDept.value = v }
function setRemote(v: string) { activeRemote.value = v }

function formatSalary(min: number, max: number, currency: string) {
  const fmt = (n: number) => `${(n / 1000).toFixed(0)}k`
  return `${currency} ${fmt(min)}–${fmt(max)}`
}

useHead({
  title: 'Careers — Moonmart',
  meta: [{ name: 'description', content: 'Join Moonmart and help build the world\'s best SaaS marketplace. Remote-first roles across engineering, product, and more.' }]
})
</script>

<style scoped>
.careers-page { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.page-hero { text-align: center; margin-bottom: 2.5rem; }
.page-hero h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.75rem; }
.page-hero p { color: var(--mm-muted); font-size: 1.1rem; margin-bottom: 1.5rem; }
.hero-stats { display: flex; justify-content: center; gap: 2.5rem; }
.stat { display: flex; flex-direction: column; align-items: center; }
.stat strong { font-size: 2rem; font-weight: 800; color: var(--mm-gold); }
.stat span { font-size: 0.85rem; color: var(--mm-muted); }
.filters { margin-bottom: 2rem; }
.filter-row { display: flex; flex-wrap: wrap; gap: 1.5rem; }
.filter-group label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mm-muted); display: block; margin-bottom: 0.4rem; }
.filter-pills { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.filter-btn { padding: 0.3rem 0.75rem; border-radius: 999px; border: 1px solid var(--b1); background: transparent; cursor: pointer; font-size: 0.8rem; transition: all 0.15s; }
.filter-btn:hover, .filter-btn.active { background: var(--mm-gold); border-color: var(--mm-gold); color: #000; }
.loading-state { display: flex; flex-direction: column; gap: 1rem; }
.skeleton-job { height: 160px; border-radius: var(--r-sm); background: var(--mm-s2); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.empty-state { text-align: center; padding: 3rem; color: var(--mm-muted); }
.jobs-list { display: flex; flex-direction: column; gap: 1.25rem; }
.job-card { padding: 1.5rem; border: 1px solid var(--b1); border-radius: var(--r-sm); background: var(--mm-s2); }
.job-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
.job-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; }
.job-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.dept-badge { padding: 0.2rem 0.6rem; border-radius: 999px; background: var(--mm-gold); color: #000; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.meta-pill { padding: 0.2rem 0.55rem; border-radius: 999px; border: 1px solid var(--b1); font-size: 0.75rem; text-transform: capitalize; }
.meta-pill.remote-remote { border-color: #15803d; color: #15803d; }
.salary { font-size: 0.85rem; font-weight: 600; color: var(--mm-muted); }
.apply-btn { padding: 0.55rem 1.25rem; background: var(--mm-gold); color: #000; border: none; border-radius: var(--r-sm); font-weight: 600; font-size: 0.9rem; cursor: pointer; text-decoration: none; white-space: nowrap; }
.apply-btn:hover { opacity: 0.85; }
.job-desc { color: var(--mm-muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem; }
.req-section { margin-top: 0.75rem; }
.req-section h4 { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem; }
.req-section ul { list-style: disc; margin-left: 1.25rem; }
.req-section li { font-size: 0.875rem; color: var(--mm-muted); margin-bottom: 0.25rem; }
.req-section.nice h4 { color: var(--mm-muted); }
.footer-cta { margin-top: 4rem; text-align: center; padding: 3rem; border: 1px solid var(--b1); border-radius: var(--r-sm); background: var(--mm-s2); }
.footer-cta h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--mm-pearl); }
.footer-cta p { color: var(--mm-muted); margin-bottom: 1.5rem; }
.cta-btn { display: inline-block; padding: 0.65rem 1.75rem; background: var(--mm-gold); color: #000; border-radius: var(--r-sm); font-weight: 600; text-decoration: none; }
.cta-btn:hover { opacity: 0.85; }
</style>
