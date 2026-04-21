<template>
  <div class="geo-map-container">
    <!-- Enhanced World Map Visualization -->
    <div class="enhanced-world-map">
      <!-- Map Controls -->
      <div class="map-controls">
        <div class="view-toggle">
          <button 
            :class="['control-btn', { active: viewMode === 'map' }]"
            @click="viewMode = 'map'"
          >
            <UIcon dynamic name="i-heroicons-map" />
            Map View
          </button>
          <button 
            :class="['control-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            <UIcon dynamic name="i-heroicons-list-bullet" />
            List View
          </button>
        </div>
      </div>

      <!-- Map View -->
      <div v-if="viewMode === 'map'" class="world-map-enhanced">
        <div class="map-container">
          <svg viewBox="0 0 1000 500" class="world-map-svg">
            <!-- Gradient Definitions for Enhanced Visuals -->
            <defs>
              <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#e0f2fe;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#b3e5fc;stop-opacity:1" />
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
              </filter>
            </defs>

            <!-- Ocean Background -->
            <rect width="1000" height="500" fill="url(#oceanGradient)" />

            <!-- North America -->
            <g class="continent" data-continent="north-america">
              <path 
                d="M150 120 L280 110 L300 140 L320 160 L310 200 L280 220 L240 210 L200 190 L160 170 Z" 
                class="country usa"
                :class="getCountryIntensity('United States')"
                @mouseenter="showCountryTooltip($event, getCountryData('United States'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('United States')"
              />
              <path 
                d="M150 80 L300 70 L320 100 L280 110 L150 120 Z" 
                class="country canada"
                :class="getCountryIntensity('Canada')"
                @mouseenter="showCountryTooltip($event, getCountryData('Canada'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Canada')"
              />
              <path 
                d="M180 220 L280 220 L300 250 L250 270 L200 260 L170 240 Z" 
                class="country mexico"
                :class="getCountryIntensity('Mexico')"
                @mouseenter="showCountryTooltip($event, getCountryData('Mexico'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Mexico')"
              />
            </g>

            <!-- South America -->
            <g class="continent" data-continent="south-america">
              <path 
                d="M220 280 L280 270 L300 320 L290 380 L260 400 L230 380 L210 340 Z" 
                class="country brazil"
                :class="getCountryIntensity('Brazil')"
                @mouseenter="showCountryTooltip($event, getCountryData('Brazil'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Brazil')"
              />
              <path 
                d="M180 350 L230 380 L220 420 L190 410 L170 380 Z" 
                class="country argentina"
                :class="getCountryIntensity('Argentina')"
                @mouseenter="showCountryTooltip($event, getCountryData('Argentina'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Argentina')"
              />
            </g>

            <!-- Europe -->
            <g class="continent" data-continent="europe">
              <path 
                d="M420 140 L480 130 L500 150 L490 170 L450 180 L420 160 Z" 
                class="country uk"
                :class="getCountryIntensity('United Kingdom')"
                @mouseenter="showCountryTooltip($event, getCountryData('United Kingdom'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('United Kingdom')"
              />
              <path 
                d="M480 150 L520 140 L540 160 L530 180 L500 190 L480 170 Z" 
                class="country germany"
                :class="getCountryIntensity('Germany')"
                @mouseenter="showCountryTooltip($event, getCountryData('Germany'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Germany')"
              />
              <path 
                d="M460 180 L500 170 L520 190 L500 210 L470 200 Z" 
                class="country france"
                :class="getCountryIntensity('France')"
                @mouseenter="showCountryTooltip($event, getCountryData('France'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('France')"
              />
              <path 
                d="M480 210 L520 200 L540 220 L520 240 L490 230 Z" 
                class="country spain"
                :class="getCountryIntensity('Spain')"
                @mouseenter="showCountryTooltip($event, getCountryData('Spain'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Spain')"
              />
              <path 
                d="M540 160 L580 150 L600 170 L590 190 L560 180 Z" 
                class="country italy"
                :class="getCountryIntensity('Italy')"
                @mouseenter="showCountryTooltip($event, getCountryData('Italy'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Italy')"
              />
              <path 
                d="M500 140 L540 130 L560 150 L550 170 L520 160 Z" 
                class="country netherlands"
                :class="getCountryIntensity('Netherlands')"
                @mouseenter="showCountryTooltip($event, getCountryData('Netherlands'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Netherlands')"
              />
            </g>

            <!-- Africa -->
            <g class="continent" data-continent="africa">
              <path 
                d="M450 250 L520 240 L560 280 L550 340 L520 380 L480 370 L450 330 Z" 
                class="country south-africa"
                :class="getCountryIntensity('South Africa')"
                @mouseenter="showCountryTooltip($event, getCountryData('South Africa'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('South Africa')"
              />
              <path 
                d="M480 250 L520 240 L540 260 L530 280 L500 270 Z" 
                class="country nigeria"
                :class="getCountryIntensity('Nigeria')"
                @mouseenter="showCountryTooltip($event, getCountryData('Nigeria'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Nigeria')"
              />
            </g>

            <!-- Asia -->
            <g class="continent" data-continent="asia">
              <path 
                d="M650 140 L720 130 L750 160 L740 200 L700 210 L660 180 Z" 
                class="country china"
                :class="getCountryIntensity('China')"
                @mouseenter="showCountryTooltip($event, getCountryData('China'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('China')"
              />
              <path 
                d="M620 180 L680 170 L700 200 L680 230 L640 220 Z" 
                class="country india"
                :class="getCountryIntensity('India')"
                @mouseenter="showCountryTooltip($event, getCountryData('India'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('India')"
              />
              <path 
                d="M780 160 L820 150 L840 180 L830 200 L800 190 Z" 
                class="country japan"
                :class="getCountryIntensity('Japan')"
                @mouseenter="showCountryTooltip($event, getCountryData('Japan'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Japan')"
              />
              <path 
                d="M740 200 L780 190 L800 210 L790 230 L760 220 Z" 
                class="country south-korea"
                :class="getCountryIntensity('South Korea')"
                @mouseenter="showCountryTooltip($event, getCountryData('South Korea'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('South Korea')"
              />
            </g>

            <!-- Australia -->
            <g class="continent" data-continent="oceania">
              <path 
                d="M750 340 L820 330 L850 360 L840 390 L780 380 L750 360 Z" 
                class="country australia"
                :class="getCountryIntensity('Australia')"
                @mouseenter="showCountryTooltip($event, getCountryData('Australia'))"
                @mouseleave="hideTooltip"
                @click="focusCountry('Australia')"
              />
            </g>

            <!-- Data Points/Markers for High Activity Countries -->
            <g class="data-markers">
              <circle 
                v-for="marker in topCountryMarkers" 
                :key="marker.country"
                :cx="marker.x" 
                :cy="marker.y" 
                :r="marker.size"
                class="activity-marker"
                :class="marker.intensity"
                @mouseenter="showCountryTooltip($event, getCountryData(marker.country))"
                @mouseleave="hideTooltip"
              />
            </g>
          </svg>
        </div>

        <!-- Enhanced Map Legend -->
        <div class="enhanced-legend">
          <div class="legend-header">
            <h4>User Views Distribution</h4>
          </div>
          <div class="legend-content">
            <div class="legend-scale">
              <div class="legend-item">
                <div class="legend-color intensity-very-low"></div>
                <span>{{ getLegendRange('very-low') }}</span>
              </div>
              <div class="legend-item">
                <div class="legend-color intensity-low"></div>
                <span>{{ getLegendRange('low') }}</span>
              </div>
              <div class="legend-item">
                <div class="legend-color intensity-medium"></div>
                <span>{{ getLegendRange('medium') }}</span>
              </div>
              <div class="legend-item">
                <div class="legend-color intensity-high"></div>
                <span>{{ getLegendRange('high') }}</span>
              </div>
              <div class="legend-item">
                <div class="legend-color intensity-very-high"></div>
                <span>{{ getLegendRange('very-high') }}</span>
              </div>
            </div>
            <div class="legend-stats">
              <div class="stat-item">
                <span class="stat-label">Total Users:</span>
                <span class="stat-value">{{ formatViews(totalViews) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Countries:</span>
                <span class="stat-value">{{ props.countries.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="country-list-view">
        <div class="list-header">
          <h4>Geographic Distribution</h4>
          <div class="sort-controls">
            <select v-model="sortBy" class="sort-select">
              <option value="visitors">Sort by Users</option>
              <option value="percentage">Sort by Percentage</option>
              <option value="country">Sort by Country</option>
            </select>
          </div>
        </div>
        <div class="country-list">
          <div 
            v-for="country in sortedCountries" 
            :key="country.country"
            class="country-item"
            @click="focusCountry(country.country)"
          >
            <div class="country-info">
              <span class="country-flag">{{ getCountryFlag(country.country) }}</span>
              <span class="country-name">{{ country.country }}</span>
            </div>
            <div class="country-stats">
              <div class="stat-bar">
                <div 
                  class="stat-fill" 
                  :style="{ width: country.percentage + '%' }"
                  :class="getCountryIntensity(country.country)"
                ></div>
              </div>
              <div class="stat-numbers">
                <span class="visitors">{{ formatViews(country.visitors) }}</span>
                <span class="percentage">{{ country.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Tooltip -->
    <div 
      v-if="showTooltipData" 
      class="enhanced-tooltip"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
    >
      <div class="tooltip-header">
        <span class="country-flag">{{ tooltipData.flag }}</span>
        <strong class="country-name">{{ tooltipData.name }}</strong>
      </div>
      <div class="tooltip-stats">
        <div class="tooltip-stat">
          <span class="stat-icon">👥</span>
          <span class="stat-text">{{ formatViews(tooltipData.views) }} users</span>
        </div>
        <div class="tooltip-stat">
          <span class="stat-icon">📊</span>
          <span class="stat-text">{{ tooltipData.percentage }}% of total</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  countries: {
    type: Array as () => Array<{
      country: string;
      visitors: number;
      percentage: number;
    }>,
    required: true
  }
});

// Enhanced State Management
const viewMode = ref<'map' | 'list'>('map');
const sortBy = ref<'visitors' | 'percentage' | 'country'>('visitors');
const focusedCountry = ref<string | null>(null);

// Tooltip state
const showTooltipData = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const tooltipData = ref({
  name: '',
  views: 0,
  percentage: 0,
  flag: ''
});

// Computed properties
const totalViews = computed(() => {
  return props.countries.reduce((sum, country) => sum + country.visitors, 0);
});

const maxViews = computed(() => {
  return Math.max(...props.countries.map(c => c.visitors));
});

const sortedCountries = computed(() => {
  const sorted = [...props.countries].sort((a, b) => {
    switch (sortBy.value) {
      case 'visitors':
        return b.visitors - a.visitors;
      case 'percentage':
        return b.percentage - a.percentage;
      case 'country':
        return a.country.localeCompare(b.country);
      default:
        return 0;
    }
  });
  return sorted;
});

// Enhanced country coordinates for markers
const countryCoordinates: Record<string, { x: number; y: number }> = {
  'United States': { x: 250, y: 160 },
  'Canada': { x: 225, y: 95 },
  'Mexico': { x: 240, y: 245 },
  'Brazil': { x: 250, y: 325 },
  'Argentina': { x: 200, y: 385 },
  'United Kingdom': { x: 450, y: 145 },
  'Germany': { x: 510, y: 155 },
  'France': { x: 480, y: 185 },
  'Spain': { x: 510, y: 225 },
  'Italy': { x: 565, y: 175 },
  'Netherlands': { x: 525, y: 145 },
  'China': { x: 700, y: 165 },
  'India': { x: 650, y: 205 },
  'Japan': { x: 810, y: 175 },
  'South Korea': { x: 765, y: 215 },
  'Australia': { x: 800, y: 365 },
  'South Africa': { x: 500, y: 355 },
  'Nigeria': { x: 510, y: 265 }
};

const topCountryMarkers = computed(() => {
  return props.countries
    .filter(country => country.visitors > 1000) // Only show markers for countries with significant traffic
    .map(country => {
      const coords = countryCoordinates[country.country];
      if (!coords) return null;
      
      const size = Math.max(3, Math.min(15, (country.visitors / maxViews.value) * 15));
      const intensity = getCountryIntensity(country.country);
      
      return {
        country: country.country,
        x: coords.x,
        y: coords.y,
        size,
        intensity
      };
    })
    .filter((marker): marker is NonNullable<typeof marker> => marker !== null);
});

const mapRegions = computed(() => {
  // Group countries into major regions
  const regionData: Record<string, { views: number; countries: string[] }> = {
    'North America': { views: 0, countries: ['United States', 'Canada', 'Mexico'] },
    'Europe': { views: 0, countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'] },
    'Asia Pacific': { views: 0, countries: ['Japan', 'Australia', 'China', 'India', 'South Korea'] },
    'South America': { views: 0, countries: ['Brazil', 'Argentina', 'Chile'] },
    'Africa': { views: 0, countries: ['South Africa', 'Nigeria', 'Egypt'] },
    'Others': { views: 0, countries: [] }
  };

  // Aggregate views by region
  props.countries.forEach(country => {
    let assigned = false;
    for (const [regionName, regionInfo] of Object.entries(regionData)) {
      if (regionInfo.countries.includes(country.country)) {
        regionInfo.views += country.visitors;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      regionData.Others.views += country.visitors;
    }
  });

  return Object.entries(regionData)
    .filter(([_, data]) => data.views > 0)
    .map(([name, data]) => ({
      name,
      views: data.views,
      class: `region-${name.toLowerCase().replace(/\s+/g, '-')}`,
      percentage: Math.round((data.views / totalViews.value) * 100)
    }));
});

// Enhanced Methods
const formatViews = (views: number) => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
};

const getViewIntensity = (views: number) => {
  const intensity = views / maxViews.value;
  return Math.min(intensity, 1);
};

const getCountryFlag = (country: string) => {
  const flags: { [key: string]: string } = {
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Japan': '🇯🇵',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Brazil': '🇧🇷',
    'India': '🇮🇳',
    'China': '🇨🇳',
    'Mexico': '🇲🇽',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'Netherlands': '🇳🇱',
    'Argentina': '🇦🇷',
    'South Africa': '🇿🇦',
    'Chile': '🇨🇱',
    'South Korea': '🇰🇷',
    'Singapore': '🇸🇬',
    'Nigeria': '🇳🇬',
    'Egypt': '🇪🇬',
    'UAE': '🇦🇪',
    'Saudi Arabia': '🇸🇦',
    'Israel': '🇮🇱'
  };
  return flags[country] || '🌍';
};

const getLegendRange = (intensity: string) => {
  const ranges = {
    'very-low': '0-1K',
    'low': '1K-5K',
    'medium': '5K-10K',
    'high': '10K-20K',
    'very-high': '20K+'
  };
  return ranges[intensity as keyof typeof ranges] || '';
};

const showRegionTooltip = (event: MouseEvent, region: any) => {
  tooltipData.value = {
    name: region.name,
    views: region.views,
    percentage: region.percentage,
    flag: '🌍'
  };
  tooltipX.value = event.clientX + 10;
  tooltipY.value = event.clientY - 10;
  showTooltipData.value = true;
};

const hideTooltip = () => {
  showTooltipData.value = false;
};

const getCountryData = (countryName: string) => {
  const country = props.countries.find(c => c.country === countryName);
  return country ? {
    ...country,
    flag: getCountryFlag(countryName)
  } : {
    country: countryName,
    visitors: 0,
    percentage: 0,
    flag: getCountryFlag(countryName)
  };
};

const getCountryIntensity = (countryName: string) => {
  const country = getCountryData(countryName);
  const views = country.visitors;
  
  if (views === 0) return 'intensity-none';
  if (views < 1000) return 'intensity-very-low';
  if (views < 5000) return 'intensity-low';
  if (views < 10000) return 'intensity-medium';
  if (views < 20000) return 'intensity-high';
  return 'intensity-very-high';
};

const showCountryTooltip = (event: MouseEvent, country: any) => {
  tooltipData.value = {
    name: country.country,
    views: country.visitors,
    percentage: country.percentage,
    flag: country.flag
  };
  tooltipX.value = event.clientX + 10;
  tooltipY.value = event.clientY - 10;
  showTooltipData.value = true;
};

const focusCountry = (countryName: string) => {
  focusedCountry.value = countryName;
  const countryData = getCountryData(countryName);
  
  // Show detailed tooltip for focused country
  showTooltipData.value = true;
  tooltipData.value = {
    name: countryData.country,
    views: countryData.visitors,
    percentage: countryData.percentage,
    flag: countryData.flag
  };
  
  // Center tooltip on screen
  tooltipX.value = window.innerWidth / 2;
  tooltipY.value = window.innerHeight / 2;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    if (focusedCountry.value === countryName) {
      hideTooltip();
      focusedCountry.value = null;
    }
  }, 3000);
};
</script>

<style scoped>
.geo-map-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Enhanced World Map Styles */
.enhanced-world-map {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Map Controls */
.map-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.control-btn.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.metric-select:focus,
.sort-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Enhanced World Map SVG Styles */
.world-map-enhanced {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: white;
  overflow: hidden;
}

.map-container {
  flex: 1;
  width: 100%;
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.world-map-svg {
  width: 100%;
  max-width: 100%;
  height: auto;
  background: #f0f9ff;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.country {
  fill: #e5e7eb;
  stroke: #ffffff;
  stroke-width: 1.5;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-origin: center;
}

.country:hover {
  stroke: #3b82f6;
  stroke-width: 2.5;
  filter: brightness(1.1) drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3));
  transform: scale(1.02);
}

.country:active {
  transform: scale(0.98);
}

/* Enhanced Intensity Color Classes with Google-like styling */
.intensity-none {
  fill: #f3f4f6;
}

.intensity-very-low {
  fill: #dbeafe;
}

.intensity-low {
  fill: #93c5fd;
}

.intensity-medium {
  fill: #60a5fa;
}

.intensity-high {
  fill: #3b82f6;
}

.intensity-very-high {
  fill: #1d4ed8;
}

/* Activity Markers */
.data-markers {
  pointer-events: none;
}

.activity-marker {
  fill: #ef4444;
  stroke: #ffffff;
  stroke-width: 2;
  opacity: 0.8;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

.activity-marker:hover {
  opacity: 1;
  stroke-width: 3;
  transform: scale(1.2);
}

@keyframes pulse {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
}

/* Enhanced Legend */
.enhanced-legend {
  background: white;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.legend-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legend-scale {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.legend-color {
  width: 20px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.legend-stats {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

/* List View Styles */
.country-list-view {
  background: white;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.list-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.country-list {
  max-height: 400px;
  overflow-y: auto;
}

.country-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.country-item:hover {
  background: #f8fafc;
  transform: translateX(4px);
}

.country-item:last-child {
  border-bottom: none;
}

.country-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.country-flag {
  font-size: 20px;
}

.country-name {
  font-weight: 500;
  color: #374151;
}

.country-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-bar {
  width: 80px;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stat-numbers {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 60px;
}

.visitors {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.percentage {
  font-size: 12px;
  color: #6b7280;
}

/* Enhanced Tooltip */
.enhanced-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  max-width: 250px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-header .country-flag {
  font-size: 16px;
}

.tooltip-header .country-name {
  font-weight: 600;
  font-size: 14px;
}

.tooltip-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tooltip-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 14px;
  opacity: 0.8;
}

.stat-text {
  font-size: 13px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .view-toggle {
    justify-content: center;
  }

  .legend-scale {
    justify-content: center;
  }

  .legend-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .map-container {
    min-height: 280px;
  }

  .control-btn {
    padding: 6px 10px;
    font-size: 13px;
  }

  .country-item {
    padding: 10px 16px;
  }

  .country-stats {
    gap: 12px;
  }

  .stat-bar {
    width: 60px;
  }

  .legend-scale {
    gap: 12px;
  }

  .legend-stats {
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .country-stats {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .stat-numbers {
    flex-direction: row;
    gap: 8px;
  }

  .enhanced-tooltip {
    max-width: 200px;
    padding: 10px 12px;
  }
}
</style>
    gap: var(--spacing-md);
  }
  
  .heat-map-grid {
    min-height: 150px;
    padding: var(--spacing-md);
  }
  
  .heat-cell {
    width: var(--size, 60px);
    height: var(--size, 60px);
  }
}

@media (max-width: 768px) {
  .heat-map-grid {
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
  }
  
  .heat-cell {
    width: var(--size, 50px);
    height: var(--size, 50px);
  }
  
  .country-code {
    font-size: 0.7rem;
  }
  

