<template>
  <div class="incident-history">
    <div class="section-header">
      <h2>Incident History</h2>
      <p>Recent incidents and their resolutions</p>
    </div>

    <div v-if="currentIncidents.length === 0" class="no-incidents">
      <UIcon name="i-heroicons-check-circle" class="no-incidents-icon" />
      <h3>No Recent Incidents</h3>
      <p>All systems have been operating normally</p>
    </div>

    <div v-else class="incidents-timeline">
      <div 
        v-for="incident in currentIncidents" 
        :key="incident.id"
        class="incident-card"
        :class="[incident.status, incident.severity]"
      >
        <div class="incident-header">
          <div class="incident-info">
            <div class="incident-title-row">
              <h3 class="incident-title">{{ incident.title }}</h3>
              <div class="incident-badges">
                <span class="severity-badge" :class="incident.severity">
                  {{ incident.severity }}
                </span>
                <span class="status-badge" :class="incident.status">
                  {{ incident.status }}
                </span>
              </div>
            </div>
            <p class="incident-description">{{ incident.description }}</p>
            <div class="incident-meta">
              <div class="incident-time">
                <UIcon name="i-heroicons-clock" />
                <span>Started {{ getRelativeTime(incident.createdAt) }}</span>
              </div>
              <div class="affected-services">
                <UIcon name="i-heroicons-server" />
                <span>{{ getAffectedServicesText(incident.affectedServices) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="incident-updates">
          <h4 class="updates-title">
            <UIcon name="i-heroicons-chat-bubble-left-right" />
            Updates
          </h4>
          <div class="updates-timeline">
            <div 
              v-for="update in incident.updates" 
              :key="update.id"
              class="update-item"
              :class="update.status"
            >
              <div class="update-indicator">
                <UIcon :name="getUpdateStatusIcon(update.status)" />
              </div>
              <div class="update-content">
                <div class="update-header">
                  <span class="update-status" :class="update.status">
                    {{ update.status }}
                  </span>
                  <span class="update-time">
                    {{ formatIncidentTime(update.timestamp) }}
                  </span>
                </div>
                <p class="update-message">{{ update.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Maintenance Windows -->
    <div v-if="upcomingMaintenance.length > 0" class="maintenance-section">
      <div class="section-header">
        <h2>Scheduled Maintenance</h2>
        <p>Upcoming maintenance windows</p>
      </div>

      <div class="maintenance-list">
        <div 
          v-for="maintenance in upcomingMaintenance" 
          :key="maintenance.id"
          class="maintenance-card"
        >
          <div class="maintenance-header">
            <UIcon name="i-heroicons-wrench-screwdriver" class="maintenance-icon" />
            <div class="maintenance-info">
              <h3>{{ maintenance.title }}</h3>
              <p>{{ maintenance.description }}</p>
            </div>
          </div>
          <div class="maintenance-schedule">
            <div class="schedule-item">
              <span class="schedule-label">Start:</span>
              <span class="schedule-time">{{ formatMaintenanceTime(maintenance.scheduledStart) }}</span>
            </div>
            <div class="schedule-item">
              <span class="schedule-label">End:</span>
              <span class="schedule-time">{{ formatMaintenanceTime(maintenance.scheduledEnd) }}</span>
            </div>
            <div class="schedule-item">
              <span class="schedule-label">Duration:</span>
              <span class="schedule-duration">{{ getMaintenanceDuration(maintenance) }}</span>
            </div>
          </div>
          <div class="affected-services-list">
            <span class="services-label">Affected Services:</span>
            <div class="services-tags">
              <span 
                v-for="serviceId in maintenance.affectedServices" 
                :key="serviceId"
                class="service-tag"
              >
                {{ getServiceName(serviceId) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { 
  currentIncidents,
  upcomingMaintenance,
  getRelativeTime,
  formatIncidentTime,
  getServiceById
} = useStatusData()

const getAffectedServicesText = (serviceIds: string[]) => {
  if (serviceIds.length === 0) return 'No services affected'
  if (serviceIds.length === 1) {
    const service = getServiceById(serviceIds[0])
    return service ? service.name : serviceIds[0]
  }
  return `${serviceIds.length} services affected`
}

const getUpdateStatusIcon = (status: string) => {
  const icons = {
    investigating: 'i-heroicons-magnifying-glass',
    identified: 'i-heroicons-exclamation-triangle',
    monitoring: 'i-heroicons-eye',
    resolved: 'i-heroicons-check-circle'
  }
  return icons[status as keyof typeof icons] || 'i-heroicons-information-circle'
}

const formatMaintenanceTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(new Date(date))
}

const getMaintenanceDuration = (maintenance: any) => {
  const start = new Date(maintenance.scheduledStart)
  const end = new Date(maintenance.scheduledEnd)
  const durationMs = end.getTime() - start.getTime()
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const getServiceName = (serviceId: string) => {
  const service = getServiceById(serviceId)
  return service ? service.name : serviceId.replace(/-/g, ' ')
}
</script>

<style scoped>
.incident-history {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.section-header p {
  color: #6b7280;
  margin: 0;
}

.no-incidents {
  text-align: center;
  padding: 3rem 1.5rem;
  background: #f0fdf4;
  border-radius: 1rem;
  border: 2px dashed #10b981;
}

.no-incidents-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.no-incidents h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #065f46;
  margin: 0 0 0.5rem 0;
}

.no-incidents p {
  color: #047857;
  margin: 0;
}

.incidents-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.incident-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  border-left: 4px solid;
}

.incident-card.resolved {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.incident-card.monitoring {
  border-left-color: #3b82f6;
  background: #eff6ff;
}

.incident-card.identified {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.incident-card.investigating {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.incident-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.incident-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.incident-badges {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.severity-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.severity-badge.minor {
  background: #fef3c7;
  color: #92400e;
}

.severity-badge.major {
  background: #fee2e2;
  color: #991b1b;
}

.severity-badge.critical {
  background: #fecaca;
  color: #7f1d1d;
}

.status-badge.resolved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.monitoring {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.identified {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.investigating {
  background: #fee2e2;
  color: #991b1b;
}

.incident-description {
  color: #4b5563;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.incident-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.incident-time,
.affected-services {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.incident-updates {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.updates-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.updates-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.update-item {
  display: flex;
  gap: 0.75rem;
  position: relative;
}

.update-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 0.6875rem;
  top: 2rem;
  bottom: -1rem;
  width: 2px;
  background: #e5e7eb;
}

.update-indicator {
  flex-shrink: 0;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  margin-top: 0.125rem;
}

.update-item.resolved .update-indicator {
  background: #d1fae5;
  color: #065f46;
}

.update-item.monitoring .update-indicator {
  background: #dbeafe;
  color: #1e40af;
}

.update-item.identified .update-indicator {
  background: #fef3c7;
  color: #92400e;
}

.update-item.investigating .update-indicator {
  background: #fee2e2;
  color: #991b1b;
}

.update-content {
  flex: 1;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  gap: 1rem;
}

.update-status {
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.update-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.update-message {
  color: #4b5563;
  margin: 0;
  line-height: 1.5;
}

/* Maintenance Section */
.maintenance-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.maintenance-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.maintenance-card {
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.maintenance-header {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.maintenance-icon {
  font-size: 1.5rem;
  color: #3b82f6;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.maintenance-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 0.25rem 0;
}

.maintenance-info p {
  color: #1e40af;
  margin: 0;
  opacity: 0.8;
}

.maintenance-schedule {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.5);
  padding: 1rem;
  border-radius: 0.5rem;
}

.schedule-item {
  text-align: center;
}

.schedule-label {
  display: block;
  font-size: 0.75rem;
  color: #1e40af;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.schedule-time,
.schedule-duration {
  display: block;
  font-size: 0.875rem;
  color: #1e40af;
  font-weight: 600;
}

.affected-services-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.services-label {
  font-size: 0.875rem;
  color: #1e40af;
  font-weight: 500;
}

.services-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.service-tag {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .incident-title-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .incident-badges {
    justify-content: flex-start;
  }

  .incident-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .update-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .maintenance-schedule {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .affected-services-list {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
