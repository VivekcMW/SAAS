<script setup lang="ts">
interface CompanyInfo {
  name: string
  founded?: number | string
  headquarters?: string
  employees?: string
  fundingTotal?: string
  latestRound?: string
  investors?: string[]
  website?: string
  twitter?: string
  linkedin?: string
}

interface Props { info: CompanyInfo }
defineProps<Props>()
</script>

<template>
  <div class="company-card">
    <h3 class="company-title">About the company</h3>
    <dl class="company-list">
      <template v-if="info.founded">
        <dt>Founded</dt><dd>{{ info.founded }}</dd>
      </template>
      <template v-if="info.headquarters">
        <dt>Headquarters</dt><dd>{{ info.headquarters }}</dd>
      </template>
      <template v-if="info.employees">
        <dt>Employees</dt><dd>{{ info.employees }}</dd>
      </template>
      <template v-if="info.fundingTotal">
        <dt>Total funding</dt><dd>{{ info.fundingTotal }}</dd>
      </template>
      <template v-if="info.latestRound">
        <dt>Latest round</dt><dd>{{ info.latestRound }}</dd>
      </template>
    </dl>

    <div v-if="info.investors?.length" class="company-investors">
      <span class="inv-label">Investors</span>
      <div class="inv-list">
        <Tag v-for="i in info.investors" :key="i" size="sm">{{ i }}</Tag>
      </div>
    </div>

    <div class="company-links">
      <a v-if="info.website" :href="info.website" target="_blank" rel="noopener noreferrer" class="company-link">
        <Icon name="heroicons:globe-alt" />
        Website
      </a>
      <a v-if="info.linkedin" :href="info.linkedin" target="_blank" rel="noopener noreferrer" class="company-link">
        <Icon name="simple-icons:linkedin" />
        LinkedIn
      </a>
      <a v-if="info.twitter" :href="info.twitter" target="_blank" rel="noopener noreferrer" class="company-link">
        <Icon name="simple-icons:x" />
        X / Twitter
      </a>
    </div>
  </div>
</template>

<style scoped>
.company-card {
  padding: 20px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 10px;
}
.company-title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
.company-list {
  margin: 0 0 14px;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px 12px;
}
.company-list dt { font-size: 12px; color: #6b7280; }
.company-list dd { margin: 0; font-size: 13px; color: #1f2937; font-weight: 500; }

.company-investors { margin-bottom: 14px; }
.inv-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}
.inv-list { display: flex; flex-wrap: wrap; gap: 4px; }

.company-links {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 0.5px solid #e5e7eb;
}
.company-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  text-decoration: none;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.company-link:hover { background: #f9fafb; border-color: #d1d5db; }
.company-link :deep(svg) { width: 12px; height: 12px; color: #6b7280; }
</style>
