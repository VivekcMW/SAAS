<template>
  <LoginModal
    :is-visible="isAuthModalOpen"
    :title="authModalConfig.title"
    :user-type="authModalConfig.userType"
    :initial-mode="authModalConfig.mode"
    :show-user-type-selection="authModalConfig.showUserTypeSelection"
    :show-forgot-password-tab="authModalConfig.showForgotPasswordTab"
    :use-legacy-forgot-password="authModalConfig.useLegacyForgotPassword"
    @update:is-visible="closeAuthModal"
    @close="closeAuthModal"
    @login-success="handleLoginSuccess"
    @register-success="handleRegisterSuccess"
    @forgot-password="handleForgotPassword"
    @mode-change="handleModeChange"
  />
</template>

<script setup lang="ts">
import { useGlobalAuth } from '~/composables/useGlobalAuth';
import LoginModal from '~/components/auth/LoginModal.vue';

// Use global auth composable
const {
  isAuthModalOpen,
  authModalConfig,
  closeAuthModal,
  handleLoginSuccess,
  handleRegisterSuccess,
  handleForgotPassword
} = useGlobalAuth();

// Handle mode changes
const handleModeChange = (mode: 'login' | 'register' | 'forgot-password') => {
  // Note: We can't directly modify authModalConfig.mode as it's readonly
  // The mode change is handled by the AuthForm internally
};
</script>
