<template>
  <div class="uptime-chart">
    <div class="chart-header">
      <h3>System Uptime - Last 90 Days</h3>
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-dot excellent"/>
          <span>99.5-100%</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot good"/>
          <span>99-99.4%</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot fair"/>
          <span>98-98.9%</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot poor"/>
          <span>&lt; 98%</span>
        </div>
      </div>
    </div>
    
    <div class="chart-container">
      <div class="chart-grid">
        <div 
          v-for="(day, index) in uptimeHistory" 
          :key="index"
          class="chart-bar"
          :class="getUptimeClass(day.uptime)"
          :title="`${formatChartDate(day.date)}: ${day.uptime}% uptime`"
          :style="{ height: `${Math.max(20, day.uptime)}%` }"
        />
      </div>
      
      <div class="chart-labels">
        <span>90 days ago</span>
        <span>60 days ago</span>
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
    
    <div class="chart-summary">
      <div class="summary-stat">
        <div class="stat-value">{{ averageUptime }}%</div>
        <div class="stat-label">Average Uptime</div>
      </div>
      <div class="summary-stat">
        <div class="stat-value">{{ excellentDays }}</div>
        <div class="stat-label">Excellent Days</div>
      </div>
      <div class="summary-stat">
        <div class="stat-value">{{ incidentCount }}</div>
        <div class="stat-label">Incidents</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { uptimeHistory } = useStatusData()

const averageUptime = computed(() => {
  const total = uptimeHistory.value.reduce((sum, day) => sum + day.uptime, 0)
  return (total / uptimeHistory.value.length).toFixed(2)
})

const excellentDays = computed(() => {
  return uptimeHistory.value.filter(day => day.uptime >= 99.5).length
})

const incidentCount = computed(() => {
  return uptimeHistory.value.filter(day => day.uptime < 99).length
})

const getUptimeClass = (uptime: number) => {
  if (uptime >= 99.5) return 'excellent'
  if (uptime >= 99) return 'good'
  if (uptime >= 98) return 'fair'
  return 'poor'
}

const formatChartDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}
</script>

<style scoped>
.uptime-chart {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin: 2rem 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-dot.excellent {
  background: #10B981;
}

.legend-dot.good {
  background: #06b6d4;
}

.legend-dot.fair {
  background: #f59e0b;
}

.legend-dot.poor {
  background: #ef4444;
}

.chart-container {
  position: relative;
}

.chart-grid {
  display: flex;
  gap: 1px;
  height: 120px;
  align-items: end;
  background: #f9fafb;
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.chart-bar {
  flex: 1;
  min-width: 2px;
  border-radius: 1px 1px 0 0;
  cursor: pointer;
  transition: opacity 0.2s ease;
  position: relative;
}

.chart-bar:hover {
  opacity: 0.8;
}

.chart-bar.excellent {
  background: #10B981;
}

.chart-bar.good {
  background: #06b6d4;
}

.chart-bar.fair {
  background: #f59e0b;
}

.chart-bar.poor {
  background: #ef4444;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
  padding: 0 0.5rem;
}

.chart-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.summary-stat {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-legend {
    justify-content: center;
  }

  .chart-summary {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .chart-labels {
    font-size: 0.625rem;
  }
}
</style>
