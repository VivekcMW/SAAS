/**
 * Status Data Composable
 * Manages status page data and real-time updates
 */

import { 
  services, 
  incidents, 
  maintenanceWindows, 
  calculateOverallStatus,
  generateUptimeHistory,
  type ServiceStatus,
  type Incident,
  type MaintenanceWindow,
  type SystemStatus
} from '~/utils/statusData'

export function useStatusData() {
  // Reactive data
  const currentServices = ref<ServiceStatus[]>([...services])
  const currentIncidents = ref<Incident[]>([...incidents])
  const currentMaintenance = ref<MaintenanceWindow[]>([...maintenanceWindows])
  const systemStatus = ref<SystemStatus>(calculateOverallStatus(currentServices.value))
  const uptimeHistory = ref(generateUptimeHistory(90))
  const lastRefresh = ref(new Date())
  const isLoading = ref(false)

  // Auto-refresh interval (30 seconds)
  const refreshInterval = ref<NodeJS.Timeout | null>(null)

  // Computed values
  const servicesByCategory = computed(() => {
    return {
      core: currentServices.value.filter(s => s.category === 'core'),
      integration: currentServices.value.filter(s => s.category === 'integration'),
      infrastructure: currentServices.value.filter(s => s.category === 'infrastructure')
    }
  })

  const activeIncidents = computed(() => {
    return currentIncidents.value.filter(i => i.status !== 'resolved')
  })

  const upcomingMaintenance = computed(() => {
    const now = new Date()
    return currentMaintenance.value.filter(m => m.scheduledStart > now && m.status === 'scheduled')
  })

  const overallUptime = computed(() => {
    const total = currentServices.value.reduce((sum, service) => sum + service.uptime.last30d, 0)
    return Math.round((total / currentServices.value.length) * 100) / 100
  })

  const averageResponseTime = computed(() => {
    const services = currentServices.value.filter(s => s.responseTime)
    const total = services.reduce((sum, service) => sum + (service.responseTime || 0), 0)
    return Math.round(total / services.length)
  })

  // Methods
  const refreshStatus = async () => {
    isLoading.value = true
    try {
      const data = await $fetch<{
        overall: string
        services: Array<{ name: string; status: string; latencyMs: number | null; message: string }>
        checkedAt: string
      }>('/api/status/health')

      // Update services with real data
      data.services.forEach(realSvc => {
        const existing = currentServices.value.find(s => s.name === realSvc.name)
        if (existing) {
          existing.status = realSvc.status as any
          if (realSvc.latencyMs !== null) existing.responseTime = realSvc.latencyMs
        }
      })

      systemStatus.value = calculateOverallStatus(currentServices.value)
      lastRefresh.value = new Date(data.checkedAt)
    } catch (error) {
      // Silently continue on error — stale data is better than a broken page
    } finally {
      isLoading.value = false
    }
  }

  const startAutoRefresh = () => {
    if (refreshInterval.value) return
    
    refreshInterval.value = setInterval(() => {
      refreshStatus()
    }, 30000) // 30 seconds
  }

  const stopAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  const getServiceById = (id: string) => {
    return currentServices.value.find(service => service.id === id)
  }

  const getIncidentById = (id: string) => {
    return currentIncidents.value.find(incident => incident.id === id)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      operational: '#10B981',
      degraded: '#F59E0B',
      outage: '#EF4444',
      maintenance: '#3B82F6',
      unknown: '#6B7280'
    }
    return colors[status as keyof typeof colors] || colors.unknown
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      operational: 'i-heroicons-check-circle',
      degraded: 'i-heroicons-exclamation-triangle',
      outage: 'i-heroicons-x-circle',
      maintenance: 'i-heroicons-wrench-screwdriver',
      unknown: 'i-heroicons-question-mark-circle'
    }
    return icons[status as keyof typeof icons] || icons.unknown
  }

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`
  }

  const formatResponseTime = (responseTime: number) => {
    return `${responseTime}ms`
  }

  const getIncidentSeverityColor = (severity: string) => {
    const colors = {
      minor: '#F59E0B',
      major: '#EF4444',
      critical: '#DC2626'
    }
    return colors[severity as keyof typeof colors] || colors.minor
  }

  const formatIncidentTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(new Date(date))
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  // Lifecycle
  onMounted(() => {
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    // Data
    currentServices: readonly(currentServices),
    currentIncidents: readonly(currentIncidents),
    currentMaintenance: readonly(currentMaintenance),
    systemStatus: readonly(systemStatus),
    uptimeHistory: readonly(uptimeHistory),
    lastRefresh: readonly(lastRefresh),
    isLoading: readonly(isLoading),

    // Computed
    servicesByCategory,
    activeIncidents,
    upcomingMaintenance,
    overallUptime,
    averageResponseTime,

    // Methods
    refreshStatus,
    startAutoRefresh,
    stopAutoRefresh,
    getServiceById,
    getIncidentById,
    getStatusColor,
    getStatusIcon,
    formatUptime,
    formatResponseTime,
    getIncidentSeverityColor,
    formatIncidentTime,
    getRelativeTime
  }
}
