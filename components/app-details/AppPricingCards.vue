<script setup lang="ts">
import { ref, computed } from 'vue'

interface PricingPlan {
  name: string
  price: number | null
  currency?: string
  period?: string
  description?: string
  features: string[]
  cta?: string
  popular?: boolean
  custom?: boolean
}

interface Props {
  plans: PricingPlan[]
  currency?: string
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'USD'
})

defineEmits<{ select: [plan: PricingPlan] }>()

const billing = ref<'monthly' | 'annual'>('monthly')

const currencySymbol = computed(() => {
  const sym: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  return sym[props.currency] || '$'
})

const adjustedPlans = computed(() =>
  props.plans.map(p => {
    if (p.price === null || p.custom) return p
    const annualPrice = Math.round(p.price * 12 * 0.8) // 20% annual discount
    return {
      ...p,
      displayPrice: billing.value === 'annual' ? Math.round(annualPrice / 12) : p.price,
      annualTotal: annualPrice,
      savings: billing.value === 'annual' ? Math.round(p.price * 12 * 0.2) : 0
    }
  })
)
</script>

<template>
  <div class="pricing-cards">
    <div class="pricing-header">
      <div class="billing-toggle" aria-label="Billing cycle">
        <button
          type="button"
          :class="['billing-btn', { active: billing === 'monthly' }]"
          @click="billing = 'monthly'"
        >
          Monthly
        </button>
        <button
          type="button"
          :class="['billing-btn', { active: billing === 'annual' }]"
          @click="billing = 'annual'"
        >
          Annual
          <span class="save-badge">Save 20%</span>
        </button>
      </div>
    </div>

    <div class="plans-grid" :class="`cols-${plans.length}`">
      <article
        v-for="plan in adjustedPlans"
        :key="plan.name"
        :class="['plan-card', { popular: plan.popular }]"
      >
        <div v-if="plan.popular" class="plan-badge">Most Popular</div>
        <h3 class="plan-name">{{ plan.name }}</h3>
        <p v-if="plan.description" class="plan-desc">{{ plan.description }}</p>

        <div class="plan-price">
          <template v-if="plan.custom">
            <span class="price-custom">Custom</span>
          </template>
          <template v-else-if="plan.price === 0">
            <span class="price-amount">Free</span>
          </template>
          <template v-else>
            <span class="price-currency">{{ currencySymbol }}</span>
            <span class="price-amount">{{ (plan as any).displayPrice ?? plan.price }}</span>
            <span class="price-period">/{{ plan.period || 'month' }}</span>
          </template>
        </div>
        <p v-if="billing === 'annual' && (plan as any).savings > 0" class="plan-save">
          Save {{ currencySymbol }}{{ (plan as any).savings }}/year
        </p>

        <button
          type="button"
          :class="['plan-cta', { primary: plan.popular }]"
          @click="$emit('select', plan)"
        >
          {{ plan.cta || (plan.custom ? 'Contact Sales' : plan.price === 0 ? 'Get Started' : 'Start Free Trial') }}
        </button>

        <ul class="plan-features">
          <li v-for="(f, i) in plan.features" :key="i" class="plan-feature">
            <Icon name="heroicons:check" class="plan-feature-icon" />
            <span>{{ f }}</span>
          </li>
        </ul>
      </article>
    </div>
  </div>
</template>

<style scoped>
.pricing-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.billing-toggle {
  display: inline-flex;
  padding: 3px;
  background: #f3f4f6;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
}
.billing-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}
.billing-btn:hover { color: #1f2937; }
.billing-btn.active {
  background: #ffffff;
  color: #1f2937;
  border: 0.5px solid #e5e7eb;
}
.save-badge {
  padding: 1px 6px;
  background: #fff3e6;
  color: #b45309;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.plans-grid {
  display: grid;
  gap: 16px;
}
.plans-grid.cols-1 { grid-template-columns: 1fr; max-width: 360px; margin: 0 auto; }
.plans-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
.plans-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
.plans-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }

.plan-card {
  position: relative;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: border-color 150ms ease;
}
.plan-card:hover { border-color: #d1d5db; }
.plan-card.popular {
  border-color: #ff8838;
  border-width: 1px;
}

.plan-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff8838;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.plan-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.plan-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #6b7280;
  min-height: 34px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: 4px;
}
.price-currency { font-size: 20px; font-weight: 600; color: #1f2937; }
.price-amount { font-size: 32px; font-weight: 700; color: #1f2937; }
.price-period { font-size: 14px; color: #6b7280; margin-left: 2px; }
.price-custom { font-size: 24px; font-weight: 700; color: #1f2937; }

.plan-save {
  margin: 0 0 16px;
  font-size: 12px;
  color: #b45309;
  font-weight: 500;
}

.plan-cta {
  width: 100%;
  padding: 10px 16px;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  margin: 12px 0;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}
.plan-cta:hover { background: #f9fafb; border-color: #d1d5db; }
.plan-cta.primary {
  background: #ff8838;
  color: #ffffff;
  border-color: #ff8838;
}
.plan-cta.primary:hover { background: #e57320; border-color: #e57320; }

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.plan-feature {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
}
.plan-feature-icon {
  width: 14px;
  height: 14px;
  color: #ff8838;
  flex-shrink: 0;
  margin-top: 2px;
}

@media (max-width: 900px) {
  .plans-grid.cols-3, .plans-grid.cols-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .plans-grid.cols-2, .plans-grid.cols-3, .plans-grid.cols-4 { grid-template-columns: 1fr; }
}
</style>
