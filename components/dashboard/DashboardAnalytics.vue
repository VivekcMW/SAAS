<template>
  <div class="analytics-container">
    <!-- Chart Container -->
    <div class="chart-container">
      <canvas ref="chartCanvas" class="analytics-chart"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';

const props = defineProps({
  data: {
    type: Array as () => Array<{
      date: string;
      views: number;
      clicks: number;
      revenue: number;
    }>,
    required: true
  },
  period: {
    type: String,
    default: '30d'
  }
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: any = null;

// Computed statistics
const totalViews = computed(() => {
  return props.data.reduce((sum, item) => sum + item.views, 0);
});

const totalClicks = computed(() => {
  return props.data.reduce((sum, item) => sum + item.clicks, 0);
});

const totalRevenue = computed(() => {
  return props.data.reduce((sum, item) => sum + item.revenue, 0);
});

const ctr = computed(() => {
  return totalViews.value > 0 ? (totalClicks.value / totalViews.value) * 100 : 0;
});

// Utility function
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Chart creation function
const createChart = async () => {
  if (!chartCanvas.value) return;

  // Dynamically import Chart.js to avoid SSR issues
  const { Chart, registerables } = await import('chart.js');
  Chart.register(...registerables);

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = props.data.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  });

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Views',
          data: props.data.map(item => item.views),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Clicks',
          data: props.data.map(item => item.clicks),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Revenue',
          data: props.data.map(item => item.revenue),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: 500
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1f2937',
          bodyColor: '#374151',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: (context: any) => {
              const date = new Date(props.data[context[0].dataIndex].date);
              return date.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              });
            },
            label: (context: any) => {
              const label = context.dataset.label;
              const value = context.parsed.y;
              if (label === 'Revenue') {
                return `${label}: $${value}`;
              }
              return `${label}: ${value.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#6b7280'
          }
        },
        y: {
          display: true,
          position: 'left' as const,
          grid: {
            color: '#f3f4f6'
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#6b7280',
            callback: function(value: any) {
              return formatNumber(value);
            }
          }
        },
        y1: {
          display: true,
          position: 'right' as const,
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#6b7280',
            callback: function(value: any) {
              return '$' + formatNumber(value);
            }
          }
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: '#ffffff'
        }
      }
    }
  });
};

// Watch for data changes
watch(() => props.data, () => {
  nextTick(() => {
    createChart();
  });
}, { deep: true });

watch(() => props.period, () => {
  nextTick(() => {
    createChart();
  });
});

onMounted(() => {
  nextTick(() => {
    createChart();
  });
});
</script>

<style scoped>
.analytics-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  overflow: hidden; /* Prevent overflow */
}

.chart-container {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 250px;
  position: relative;
  overflow: hidden; /* Prevent chart overflow */
}

.analytics-chart {
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 640px) {
  .chart-container {
    min-height: 220px;
    width: 100%;
    height: 100%;
  }
  
  .analytics-container {
    padding: var(--spacing-md);
    width: 100%;
    height: 100%;
  }
}
</style>
