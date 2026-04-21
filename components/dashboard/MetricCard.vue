<!--
  MetricCard Component
  Displays individual metrics with icons, trends, and status indicators
-->
<template>
  <div class="metric-card bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-lg">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <!-- Title -->
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {{ title }}
        </h3>
        
        <!-- Value -->
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ value }}
          </span>
          <span v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400">
            {{ subtitle }}
          </span>
        </div>
        
        <!-- Trend/Status -->
        <div class="mt-2 flex items-center gap-2">
          <!-- Trend Indicator -->
          <div v-if="trend" class="flex items-center gap-1">
            <svg 
              class="w-4 h-4"
              :class="trendColor"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                v-if="isPositiveTrend"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M7 17l10-10M17 7v10M17 7H7" 
              />
              <path 
                v-else
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M17 7l-10 10M7 17l10-10M7 17V7" 
              />
            </svg>
            <span class="text-sm font-medium" :class="trendColor">
              {{ trend }}
            </span>
          </div>
          
          <!-- Status Indicator -->
          <div v-if="status" class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="statusColor"></div>
            <span class="text-sm capitalize" :class="statusTextColor">
              {{ status }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Icon -->
      <div class="flex-shrink-0">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="iconBackground">
          <!-- Eye Icon -->
          <svg v-if="icon === 'eye'" class="w-6 h-6" :class="iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          
          <!-- Download Icon -->
          <svg v-else-if="icon === 'download'" class="w-6 h-6" :class="iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          
          <!-- Users Icon -->
          <svg v-else-if="icon === 'users'" class="w-6 h-6" :class="iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          
          <!-- Server Icon -->
          <svg v-else-if="icon === 'server'" class="w-6 h-6" :class="iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          
          <!-- Chart Icon (default) -->
          <svg v-else class="w-6 h-6" :class="iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon?: 'eye' | 'download' | 'users' | 'server' | 'chart'
  trend?: string
  status?: 'healthy' | 'warning' | 'critical' | string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'chart',
  color: 'blue'
})

// Computed properties
const isPositiveTrend = computed(() => {
  if (!props.trend) return true
  return props.trend.includes('+') || props.trend.includes('↑')
})

const trendColor = computed(() => {
  if (!props.trend) return ''
  return isPositiveTrend.value 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400'
})

const statusColor = computed(() => {
  switch (props.status) {
    case 'healthy': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'critical': return 'bg-red-500'
    default: return 'bg-gray-400'
  }
})

const statusTextColor = computed(() => {
  switch (props.status) {
    case 'healthy': return 'text-green-600 dark:text-green-400'
    case 'warning': return 'text-yellow-600 dark:text-yellow-400'
    case 'critical': return 'text-red-600 dark:text-red-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
})

const iconBackground = computed(() => {
  const backgrounds = {
    blue: 'bg-blue-100 dark:bg-blue-900',
    green: 'bg-green-100 dark:bg-green-900',
    purple: 'bg-purple-100 dark:bg-purple-900',
    orange: 'bg-orange-100 dark:bg-orange-900',
    red: 'bg-red-100 dark:bg-red-900'
  }
  return backgrounds[props.color]
})

const iconColor = computed(() => {
  const colors = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400'
  }
  return colors[props.color]
})
</script>

<style scoped>
.metric-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
}

.dark .metric-card {
  background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%);
}
</style>
