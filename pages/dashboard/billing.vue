<template>
  <div class="billing-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Billing & Payments</h1>
          <p>Manage your subscription, payments, and billing information</p>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-secondary" @click="() => downloadInvoice()">
            <UIcon dynamic name="i-heroicons-document-arrow-down" />
            Download Invoice
          </button>
          <button class="btn btn-primary" @click="upgradePlan">
            <UIcon dynamic name="i-heroicons-arrow-trending-up" />
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast toast-success" role="status">
      <UIcon dynamic name="i-heroicons-check-circle" />
      <span>{{ toast }}</span>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Billing Overview Cards -->
      <div class="billing-overview">
        <div class="overview-card current-plan">
          <div class="card-header">
            <h3>Current Plan</h3>
            <div class="plan-badge pro">Pro Plan</div>
          </div>
          <div class="card-content">
            <div class="plan-price">
              <span class="currency">$</span>
              <span class="amount">49</span>
              <span class="period">/month</span>
            </div>
            <div class="plan-features">
              <div class="feature-item">
                <UIcon dynamic name="i-heroicons-check" class="check-icon" />
                <span>Up to 10 products</span>
              </div>
              <div class="feature-item">
                <UIcon dynamic name="i-heroicons-check" class="check-icon" />
                <span>Advanced analytics</span>
              </div>
              <div class="feature-item">
                <UIcon dynamic name="i-heroicons-check" class="check-icon" />
                <span>Priority support</span>
              </div>
            </div>
            <div class="plan-actions">
              <button class="btn btn-outline" @click="managePlan">Manage Plan</button>
            </div>
          </div>
        </div>

        <div class="overview-card billing-info">
          <div class="card-header">
            <h3>Billing Information</h3>
          </div>
          <div class="card-content">
            <div class="billing-details">
              <div class="detail-item">
                <div class="detail-label">Next Payment</div>
                <div class="detail-value">{{ nextPaymentDate }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Payment Method</div>
                <div class="detail-value payment-method">
                  <UIcon dynamic name="i-heroicons-credit-card" />
                  <span>•••• •••• •••• 4242</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Billing Email</div>
                <div class="detail-value">{{ billingEmail }}</div>
              </div>
            </div>
            <div class="billing-actions">
              <button class="btn btn-outline" @click="updatePaymentMethod">Update Payment</button>
            </div>
          </div>
        </div>

        <div class="overview-card usage-stats">
          <div class="card-header">
            <h3>Usage This Month</h3>
          </div>
          <div class="card-content">
            <div class="usage-item">
              <div class="usage-info">
                <div class="usage-label">Products Listed</div>
                <div class="usage-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: (currentUsage.products / planLimits.products) * 100 + '%' }"></div>
                  </div>
                  <div class="usage-text">{{ currentUsage.products }} / {{ planLimits.products }}</div>
                </div>
              </div>
            </div>
            
            <div class="usage-item">
              <div class="usage-info">
                <div class="usage-label">API Calls</div>
                <div class="usage-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: (currentUsage.apiCalls / planLimits.apiCalls) * 100 + '%' }"></div>
                  </div>
                  <div class="usage-text">{{ formatNumber(currentUsage.apiCalls) }} / {{ formatNumber(planLimits.apiCalls) }}</div>
                </div>
              </div>
            </div>
            
            <div class="usage-item">
              <div class="usage-info">
                <div class="usage-label">Storage Used</div>
                <div class="usage-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: (currentUsage.storage / planLimits.storage) * 100 + '%' }"></div>
                  </div>
                  <div class="usage-text">{{ currentUsage.storage }}GB / {{ planLimits.storage }}GB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment History -->
      <div class="billing-section">
        <div class="section-header">
          <h2>Payment History</h2>
          <button class="btn btn-secondary btn-sm" @click="exportPayments">
            <UIcon dynamic name="i-heroicons-arrow-down-tray" />
            Export
          </button>
        </div>
        
        <div class="payment-history">
          <div class="table-container">
            <table class="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in paymentHistory" :key="payment.id">
                  <td>{{ formatDate(payment.date) }}</td>
                  <td>{{ payment.description }}</td>
                  <td>${{ payment.amount }}</td>
                  <td>
                    <span class="status-badge" :class="payment.status.toLowerCase()">
                      {{ payment.status }}
                    </span>
                  </td>
                  <td>
                    <button 
                      class="btn btn-ghost btn-sm"
                      @click="downloadInvoice(payment.invoiceId)"
                    >
                      <UIcon dynamic name="i-heroicons-arrow-down-tray" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Available Plans -->
      <div class="billing-section">
        <div class="section-header">
          <h2>Available Plans</h2>
          <p>Choose the plan that best fits your needs</p>
        </div>
        
        <div class="plans-grid">
          <div 
            v-for="plan in availablePlans" 
            :key="plan.id"
            class="plan-card"
            :class="{ 
              'current': plan.id === currentPlan.id,
              'popular': plan.popular 
            }"
          >
            <div class="plan-header">
              <h3>{{ plan.name }}</h3>
              <div v-if="plan.popular" class="popular-badge">Most Popular</div>
            </div>
            
            <div class="plan-price">
              <span class="currency">$</span>
              <span class="amount">{{ plan.price }}</span>
              <span class="period">/{{ plan.billing }}</span>
            </div>
            
            <div class="plan-features">
              <div 
                v-for="feature in plan.features" 
                :key="feature"
                class="feature-item"
              >
                <UIcon dynamic name="i-heroicons-check" class="check-icon" />
                <span>{{ feature }}</span>
              </div>
            </div>
            
            <div class="plan-actions">
              <button 
                v-if="plan.id === currentPlan.id"
                class="btn btn-outline"
                disabled
              >
                Current Plan
              </button>
              <button 
                v-else
                class="btn"
                :class="plan.popular ? 'btn-primary' : 'btn-outline'"
                @click="selectPlan(plan)"
              >
                {{ plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment method modal -->
    <div v-if="showPaymentModal" class="modal-backdrop" @click.self="showPaymentModal = false">
      <div class="modal">
        <div class="modal-head">
          <h3>Update payment method</h3>
          <button type="button" class="modal-close" @click="showPaymentModal = false">
            <UIcon dynamic name="i-heroicons-x-mark" />
          </button>
        </div>
        <form class="modal-body" @submit.prevent="savePaymentMethod">
          <div class="modal-field">
            <label>Cardholder name</label>
            <input v-model="newPaymentMethod.name" type="text" required placeholder="Jane Doe" />
          </div>
          <div class="modal-field">
            <label>Card number</label>
            <input v-model="newPaymentMethod.cardNumber" type="text" required placeholder="4242 4242 4242 4242" maxlength="19" />
          </div>
          <div class="modal-row">
            <div class="modal-field">
              <label>Expiry</label>
              <input v-model="newPaymentMethod.expiry" type="text" required placeholder="MM/YY" maxlength="5" />
            </div>
            <div class="modal-field">
              <label>CVC</label>
              <input v-model="newPaymentMethod.cvc" type="text" required placeholder="123" maxlength="4" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showPaymentModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Save card</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

// Use auth composable
const { isAuthenticated, currentUser, handleLogin, handleLogout } = useAuth();

// Meta tags
useHead({
  title: 'Billing - SaaSWorld Dashboard',
  meta: [
    { name: 'description', content: 'Manage your subscription, payments, and billing information' }
  ]
});

// State
const filtersActive = ref(false);

// Dashboard stats
const dashboardStats = ref({
  totalViews: 12540,
  revenue: 3850,
  products: 3
});

// Billing data
const currentPlan = ref({
  id: 'pro',
  name: 'Pro Plan',
  price: 49,
  billing: 'month'
});

const billingEmail = ref('demo@saasworld.com');

const nextPaymentDate = computed(() => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

// Usage tracking
const currentUsage = ref({
  products: 3,
  apiCalls: 8500,
  storage: 2.4
});

const planLimits = ref({
  products: 10,
  apiCalls: 10000,
  storage: 5
});

// Payment history
const paymentHistory = ref([
  {
    id: 1,
    date: '2024-01-01',
    description: 'Pro Plan - Monthly Subscription',
    amount: 49,
    status: 'paid',
    invoiceId: 'INV-2024-001'
  },
  {
    id: 2,
    date: '2023-12-01',
    description: 'Pro Plan - Monthly Subscription',
    amount: 49,
    status: 'paid',
    invoiceId: 'INV-2023-012'
  },
  {
    id: 3,
    date: '2023-11-01',
    description: 'Pro Plan - Monthly Subscription',
    amount: 49,
    status: 'paid',
    invoiceId: 'INV-2023-011'
  },
  {
    id: 4,
    date: '2023-10-01',
    description: 'Starter Plan - Monthly Subscription',
    amount: 19,
    status: 'paid',
    invoiceId: 'INV-2023-010'
  }
]);

// Available plans
const availablePlans = ref([
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    billing: 'month',
    popular: false,
    features: [
      'Up to 3 products',
      'Basic analytics',
      'Email support',
      '1GB storage',
      '1,000 API calls/month'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    billing: 'month',
    popular: true,
    features: [
      'Up to 10 products',
      'Advanced analytics',
      'Priority support',
      '5GB storage',
      '10,000 API calls/month',
      'Custom integrations'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    billing: 'month',
    popular: false,
    features: [
      'Unlimited products',
      'Enterprise analytics',
      'Dedicated support',
      '50GB storage',
      'Unlimited API calls',
      'Custom integrations',
      'White-label options'
    ]
  }
]);

// Methods
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Event handlers
const handleToggleFilters = () => {
  filtersActive.value = !filtersActive.value;
};

const handleSearch = (query: string) => {
  console.log('Search billing:', query);
};

const handleAddProduct = () => {
  navigateTo('/list-product');
};

const handleCreateReport = () => {
  console.log('Create billing report');
};

const handleScheduleDemo = () => {
  console.log('Schedule billing demo');
};

const handleExportData = () => {
  console.log('Export billing data');
};

// Toast feedback
const toast = ref('');
const flash = (msg: string) => {
  toast.value = msg;
  setTimeout(() => (toast.value = ''), 2800);
};

const downloadInvoice = (invoiceId?: string) => {
  const id = invoiceId || `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}`;
  const lines = [
    'SaaSWorld — Invoice',
    `Invoice ID: ${id}`,
    `Date: ${new Date().toLocaleDateString()}`,
    `Billed to: ${billingEmail.value}`,
    '',
    `Plan: ${currentPlan.value.name}`,
    `Amount: $${currentPlan.value.price}.00 / ${currentPlan.value.billing}`,
    '',
    'Thank you for your business.'
  ].join('\n');
  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  flash(`Invoice ${id} downloaded.`);
};

const upgradePlan = () => {
  const next = availablePlans.value.find(p => p.price > currentPlan.value.price);
  if (next) {
    selectPlan(next);
  } else {
    flash('You are already on the highest plan.');
  }
};

const managePlan = () => {
  document.querySelector('.plans-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  flash('Choose a plan below to change.');
};

const showPaymentModal = ref(false);
const newPaymentMethod = reactive({ cardNumber: '', expiry: '', cvc: '', name: '' });

const updatePaymentMethod = () => {
  newPaymentMethod.cardNumber = '';
  newPaymentMethod.expiry = '';
  newPaymentMethod.cvc = '';
  newPaymentMethod.name = '';
  showPaymentModal.value = true;
};

const savePaymentMethod = () => {
  showPaymentModal.value = false;
  flash('Payment method updated.');
};

const exportPayments = () => {
  const rows = [
    ['Date', 'Description', 'Amount', 'Status', 'Invoice'],
    ...paymentHistory.value.map(p => [p.date, p.description, `$${p.amount}`, p.status, p.invoiceId])
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  flash('Payment history exported.');
};

const selectPlan = (plan: any) => {
  if (plan.id === currentPlan.value.id) return;
  const direction = plan.price > currentPlan.value.price ? 'Upgraded' : 'Downgraded';
  currentPlan.value = { id: plan.id, name: plan.name, price: plan.price, billing: plan.billing };
  planLimits.value = {
    products: plan.id === 'starter' ? 3 : plan.id === 'enterprise' ? 999 : 10,
    apiCalls: plan.id === 'starter' ? 1000 : plan.id === 'enterprise' ? 999999 : 10000,
    storage: plan.id === 'starter' ? 1 : plan.id === 'enterprise' ? 50 : 5
  };
  flash(`${direction} to ${plan.name} plan.`);
};
</script>

<style scoped>
.billing-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  background: transparent;
  border-bottom: 0;
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.title-section h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  margin: 0 0 0.25rem 0;
}

.title-section p {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover {
  background: #2c5282;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #1a202c;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.billing-overview {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.overview-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.plan-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
  font-weight: 500;
}

.plan-badge.pro {
  background: var(--primary-color);
  color: white;
}

.card-content {
  padding: var(--spacing-lg);
}

.plan-price {
  display: flex;
  align-items: baseline;
  margin-bottom: var(--spacing-lg);
}

.currency {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.period {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-left: var(--spacing-xs);
}

.plan-features {
  margin-bottom: var(--spacing-lg);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.check-icon {
  color: #10b981;
  font-size: 1rem;
}

.plan-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.billing-details {
  margin-bottom: var(--spacing-lg);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.detail-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.detail-value {
  font-weight: 500;
  color: var(--text-primary);
}

.payment-method {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.usage-item {
  margin-bottom: var(--spacing-lg);
}

.usage-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.usage-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.usage-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.billing-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-header p {
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.payment-history {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.table-container {
  overflow-x: auto;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
}

.payments-table th,
.payments-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  border-bottom: 1px solid var(--color-gray-200);
}

.payments-table th {
  background: var(--bg-light);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.payments-table td {
  color: var(--text-primary);
}

.amount {
  font-weight: 600;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.paid {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.failed {
  background: #fee2e2;
  color: #991b1b;
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.85rem;
}

.btn-link:hover {
  text-decoration: underline;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.plan-card {
  background: white;
  border: 2px solid var(--color-gray-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  position: relative;
  transition: all 0.2s ease;
}

.plan-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
}

.plan-card.current {
  border-color: var(--primary-color);
  background: var(--primary-color-light);
}

.plan-card.popular {
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
  font-weight: 500;
}

.plan-header {
  margin-bottom: var(--spacing-lg);
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
}

.btn-secondary {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background: var(--bg-light);
  border-color: var(--primary-color);
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--color-gray-300);
}

.btn-outline:hover {
  background: var(--bg-light);
  border-color: var(--primary-color);
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 0.85rem;
}

@media (max-width: 1200px) {
  .billing-overview {
    grid-template-columns: 1fr 1fr;
  }
  
  .plans-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .billing-overview {
    grid-template-columns: 1fr;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .title-section h1 {
    font-size: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--spacing-sm);
  }

  .header-content {
    gap: var(--spacing-sm);
  }

  .section-header {
    gap: var(--spacing-xs);
  }
}

/* Toast */
.toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}
.toast :deep(svg) { width: 18px; height: 18px; }
.toast-success { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }

/* Payment method modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}
.modal {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.3);
  overflow: hidden;
}
.modal-head {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-head h3 { margin: 0; font-size: 1.05rem; font-weight: 600; color: #0f172a; }
.modal-close {
  background: transparent;
  border: 0;
  padding: 0.35rem;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
}
.modal-close:hover { background: #f1f5f9; color: #0f172a; }
.modal-close :deep(svg) { width: 18px; height: 18px; }
.modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; }
.modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.modal-field { display: flex; flex-direction: column; gap: 0.3rem; }
.modal-field label { font-size: 0.8rem; font-weight: 500; color: #334155; }
.modal-field input {
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #0f172a;
  background: #fff;
}
.modal-field input:focus { outline: none; border-color: #0073e6; box-shadow: 0 0 0 3px rgba(0,115,230,0.15); }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }
</style>
