/**
 * Status Page Data
 * Mock data for the SaasWorld status page
 */

export interface ServiceStatus {
  id: string
  name: string
  category: 'core' | 'integration' | 'infrastructure'
  status: 'operational' | 'degraded' | 'outage' | 'maintenance'
  uptime: {
    last24h: number
    last7d: number
    last30d: number
    last90d: number
  }
  responseTime?: number
  description?: string
  icon?: string
}

export interface IncidentUpdate {
  id: string
  message: string
  timestamp: Date
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
}

export interface Incident {
  id: string
  title: string
  description: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  severity: 'minor' | 'major' | 'critical'
  createdAt: Date
  updatedAt: Date
  updates: IncidentUpdate[]
  affectedServices: string[]
}

export interface MaintenanceWindow {
  id: string
  title: string
  description: string
  scheduledStart: Date
  scheduledEnd: Date
  status: 'scheduled' | 'in-progress' | 'completed'
  affectedServices: string[]
}

export interface SystemStatus {
  overall: 'operational' | 'degraded' | 'outage' | 'maintenance'
  message: string
  lastUpdated: Date
}

// Mock Services Data
export const services: ServiceStatus[] = [
  // Core Services
  {
    id: 'api-core',
    name: 'SaasWorld API',
    category: 'core',
    status: 'operational',
    description: 'Core marketplace API for application data and search',
    uptime: { last24h: 100, last7d: 99.9, last30d: 99.8, last90d: 99.7 },
    responseTime: 145,
    icon: 'i-heroicons-cpu-chip'
  },
  {
    id: 'auth-service',
    name: 'Authentication Service',
    category: 'core',
    status: 'operational',
    description: 'User authentication and authorization system',
    uptime: { last24h: 100, last7d: 99.8, last30d: 99.6, last90d: 99.5 },
    responseTime: 89,
    icon: 'i-heroicons-shield-check'
  },
  {
    id: 'search-discovery',
    name: 'Search & Discovery',
    category: 'core',
    status: 'operational',
    description: 'Application search and discovery engine',
    uptime: { last24h: 100, last7d: 100, last30d: 99.9, last90d: 99.8 },
    responseTime: 78,
    icon: 'i-heroicons-magnifying-glass'
  },
  {
    id: 'payment-processing',
    name: 'Payment Processing',
    category: 'core',
    status: 'degraded',
    description: 'Payment gateway and subscription management',
    uptime: { last24h: 98.5, last7d: 98.2, last30d: 97.8, last90d: 98.1 },
    responseTime: 234,
    icon: 'i-heroicons-credit-card'
  },
  {
    id: 'user-dashboard',
    name: 'User Dashboard',
    category: 'core',
    status: 'operational',
    description: 'User interface and dashboard functionality',
    uptime: { last24h: 100, last7d: 99.9, last30d: 99.7, last90d: 99.6 },
    responseTime: 156,
    icon: 'i-heroicons-squares-2x2'
  },

  // Third-Party Integrations
  {
    id: 'slack-integration',
    name: 'Slack Integration',
    category: 'integration',
    status: 'operational',
    description: 'Slack workspace integration and notifications',
    uptime: { last24h: 100, last7d: 99.7, last30d: 99.5, last90d: 99.4 },
    responseTime: 189,
    icon: 'i-simple-icons-slack'
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    category: 'integration',
    status: 'operational',
    description: 'Google Workspace integration and SSO',
    uptime: { last24h: 100, last7d: 99.9, last30d: 99.8, last90d: 99.7 },
    responseTime: 123,
    icon: 'i-simple-icons-google'
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    category: 'integration',
    status: 'operational',
    description: 'Microsoft 365 integration and SSO',
    uptime: { last24h: 99.8, last7d: 99.6, last30d: 99.4, last90d: 99.3 },
    responseTime: 167,
    icon: 'i-simple-icons-microsoft'
  },
  {
    id: 'salesforce-integration',
    name: 'Salesforce',
    category: 'integration',
    status: 'operational',
    description: 'Salesforce CRM integration and data sync',
    uptime: { last24h: 99.9, last7d: 99.6, last30d: 99.3, last90d: 99.2 },
    responseTime: 201,
    icon: 'i-simple-icons-salesforce'
  },
  {
    id: 'zoom-integration',
    name: 'Zoom',
    category: 'integration',
    status: 'operational',
    description: 'Zoom video conferencing integration',
    uptime: { last24h: 100, last7d: 99.9, last30d: 99.7, last90d: 99.6 },
    responseTime: 134,
    icon: 'i-simple-icons-zoom'
  },
  {
    id: 'hubspot-integration',
    name: 'HubSpot',
    category: 'integration',
    status: 'operational',
    description: 'HubSpot CRM integration and marketing automation',
    uptime: { last24h: 99.7, last7d: 99.5, last30d: 99.2, last90d: 99.1 },
    responseTime: 178,
    icon: 'i-simple-icons-hubspot'
  },

  // Infrastructure
  {
    id: 'database',
    name: 'Database',
    category: 'infrastructure',
    status: 'operational',
    description: 'Primary database cluster and read replicas',
    uptime: { last24h: 100, last7d: 99.9, last30d: 99.8, last90d: 99.7 },
    responseTime: 45,
    icon: 'i-heroicons-circle-stack'
  },
  {
    id: 'cdn',
    name: 'CDN',
    category: 'infrastructure',
    status: 'operational',
    description: 'Global content delivery network',
    uptime: { last24h: 100, last7d: 100, last30d: 99.99, last90d: 99.98 },
    responseTime: 23,
    icon: 'i-heroicons-globe-alt'
  },
  {
    id: 'file-storage',
    name: 'File Storage',
    category: 'infrastructure',
    status: 'operational',
    description: 'Object storage for files and media',
    uptime: { last24h: 99.8, last7d: 99.6, last30d: 99.4, last90d: 99.3 },
    responseTime: 67,
    icon: 'i-heroicons-cloud'
  },
  {
    id: 'email-service',
    name: 'Email Service',
    category: 'infrastructure',
    status: 'operational',
    description: 'Transactional and marketing email delivery',
    uptime: { last24h: 100, last7d: 99.9, last30d: 99.7, last90d: 99.6 },
    responseTime: 234,
    icon: 'i-heroicons-envelope'
  }
]

// Mock Incidents Data
export const incidents: Incident[] = [
  {
    id: 'inc-001',
    title: 'Payment Processing Degraded Performance',
    description: 'Users may experience slower than normal payment processing times',
    status: 'monitoring',
    severity: 'minor',
    createdAt: new Date('2025-08-20T08:30:00Z'),
    updatedAt: new Date('2025-08-20T11:45:00Z'),
    affectedServices: ['payment-processing'],
    updates: [
      {
        id: 'upd-001',
        message: 'We have identified the cause and implemented a fix. Monitoring for stability.',
        timestamp: new Date('2025-08-20T11:45:00Z'),
        status: 'monitoring'
      },
      {
        id: 'upd-002',
        message: 'We have identified increased latency in our payment processing pipeline.',
        timestamp: new Date('2025-08-20T10:15:00Z'),
        status: 'identified'
      },
      {
        id: 'upd-003',
        message: 'We are investigating reports of slower payment processing.',
        timestamp: new Date('2025-08-20T08:30:00Z'),
        status: 'investigating'
      }
    ]
  },
  {
    id: 'inc-002',
    title: 'Scheduled Database Maintenance Completed',
    description: 'Routine database maintenance completed successfully with no service interruption',
    status: 'resolved',
    severity: 'minor',
    createdAt: new Date('2025-08-19T02:00:00Z'),
    updatedAt: new Date('2025-08-19T03:30:00Z'),
    affectedServices: ['database'],
    updates: [
      {
        id: 'upd-004',
        message: 'Database maintenance completed successfully. All services operating normally.',
        timestamp: new Date('2025-08-19T03:30:00Z'),
        status: 'resolved'
      },
      {
        id: 'upd-005',
        message: 'Database maintenance is in progress. No service disruption expected.',
        timestamp: new Date('2025-08-19T02:00:00Z'),
        status: 'monitoring'
      }
    ]
  }
]

// Mock Maintenance Windows
export const maintenanceWindows: MaintenanceWindow[] = [
  {
    id: 'maint-001',
    title: 'CDN Infrastructure Upgrade',
    description: 'Upgrading our global CDN infrastructure for improved performance. No service interruption expected.',
    scheduledStart: new Date('2025-08-25T02:00:00Z'),
    scheduledEnd: new Date('2025-08-25T04:00:00Z'),
    status: 'scheduled',
    affectedServices: ['cdn']
  },
  {
    id: 'maint-002',
    title: 'Security Patches Application',
    description: 'Applying security patches to our authentication service. Brief service interruption possible.',
    scheduledStart: new Date('2025-08-30T01:00:00Z'),
    scheduledEnd: new Date('2025-08-30T02:30:00Z'),
    status: 'scheduled',
    affectedServices: ['auth-service']
  }
]

// System Status Calculator
export function calculateOverallStatus(services: ServiceStatus[]): SystemStatus {
  const statusCounts = services.reduce((acc, service) => {
    acc[service.status] = (acc[service.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  let overall: SystemStatus['overall'] = 'operational'
  let message = 'All systems operational'

  if (statusCounts.outage > 0) {
    overall = 'outage'
    message = `${statusCounts.outage} service${statusCounts.outage > 1 ? 's' : ''} experiencing outages`
  } else if (statusCounts.maintenance > 0) {
    overall = 'maintenance'
    message = `${statusCounts.maintenance} service${statusCounts.maintenance > 1 ? 's' : ''} under maintenance`
  } else if (statusCounts.degraded > 0) {
    overall = 'degraded'
    message = `${statusCounts.degraded} service${statusCounts.degraded > 1 ? 's' : ''} experiencing degraded performance`
  }

  return {
    overall,
    message,
    lastUpdated: new Date()
  }
}

// Status Colors
export const statusColors = {
  operational: '#10B981', // Green
  degraded: '#F59E0B',    // Yellow
  outage: '#EF4444',      // Red
  maintenance: '#3B82F6', // Blue
  unknown: '#6B7280'      // Gray
}

// Generate uptime history (90 days of mock data)
export function generateUptimeHistory(days: number = 90): Array<{ date: Date; uptime: number }> {
  const history = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Generate realistic uptime data (98-100%)
    const uptime = Math.random() > 0.05 ? 
      99.5 + Math.random() * 0.5 : // 95% chance of 99.5-100%
      98 + Math.random() * 1.5     // 5% chance of 98-99.5%
    
    history.push({
      date,
      uptime: Math.round(uptime * 100) / 100
    })
  }
  
  return history
}
