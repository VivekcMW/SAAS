<template>
  <div class="auth-test-page">
    <div class="container">
      <h1>Authentication System Test</h1>
      
      <div class="auth-status">
        <h2>Current Auth Status</h2>
        <div class="status-card">
          <p><strong>Authenticated:</strong> {{ authState.isAuthenticated ? 'Yes' : 'No' }}</p>
          <p v-if="authState.user"><strong>User:</strong> {{ authState.user.firstName }} {{ authState.user.lastName }}</p>
          <p v-if="authState.userType"><strong>User Type:</strong> {{ authState.userType }}</p>
          <p v-if="authState.user"><strong>Email:</strong> {{ authState.user.email }}</p>
        </div>
      </div>

      <div class="auth-controls">
        <h2>Authentication Controls</h2>
        <div class="button-grid">
          <button @click="openLogin()" class="test-button login">
            Open Login Modal
          </button>
          
          <button @click="openRegister()" class="test-button register">
            Open Register Modal
          </button>
          
          <button @click="openForgotPassword()" class="test-button forgot">
            Open Forgot Password
          </button>
          
          <button @click="openVendorRegistration()" class="test-button vendor">
            Vendor Registration
          </button>
          
          <button @click="openBuyerRegistration()" class="test-button buyer">
            Buyer Registration
          </button>
          
          <button @click="openAdminLogin()" class="test-button admin">
            Admin Login
          </button>
          
          <button @click="openSuperAdminLogin()" class="test-button superadmin">
            Super Admin Login
          </button>
          
          <button 
            v-if="authState.isAuthenticated" 
            @click="logout" 
            class="test-button logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div class="role-checks" v-if="authState.isAuthenticated">
        <h2>Role Checks</h2>
        <div class="role-status">
          <p><strong>Is Admin:</strong> {{ isAdmin() ? 'Yes' : 'No' }}</p>
          <p><strong>Is Vendor:</strong> {{ isVendor() ? 'Yes' : 'No' }}</p>
          <p><strong>Is Buyer:</strong> {{ isBuyer() ? 'Yes' : 'No' }}</p>
          <p><strong>Has Admin Role:</strong> {{ hasRole(['admin', 'superadmin']) ? 'Yes' : 'No' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalAuth } from '~/composables/useGlobalAuth';

// Use global auth
const {
  authState,
  openLogin,
  openRegister,
  openForgotPassword,
  openVendorRegistration,
  openBuyerRegistration,
  openAdminLogin,
  openSuperAdminLogin,
  logout,
  hasRole,
  isAdmin,
  isVendor,
  isBuyer
} = useGlobalAuth();

// Set page meta
definePageMeta({
  title: 'Authentication Test'
});
</script>

<style scoped>
.auth-test-page {
  padding: 2rem;
  min-height: 100vh;
  background: #f8fafc;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #1a202c;
  margin-bottom: 2rem;
}

h2 {
  color: #2d3748;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.status-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.status-card p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.test-button {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.test-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.test-button.login {
  background: #3182ce;
}

.test-button.register {
  background: #38a169;
}

.test-button.forgot {
  background: #d69e2e;
}

.test-button.vendor {
  background: #805ad5;
}

.test-button.buyer {
  background: #319795;
}

.test-button.admin {
  background: #e53e3e;
}

.test-button.superadmin {
  background: #2d3748;
}

.test-button.logout {
  background: #e53e3e;
}

.role-status {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.role-status p {
  margin: 0.5rem 0;
  font-size: 1rem;
}
</style>
