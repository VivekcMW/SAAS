import { ref, reactive, readonly } from 'vue';

// Global state for authentication modal
const isAuthModalOpen = ref(false);
const authModalConfig = reactive({
  mode: 'login' as 'login' | 'register' | 'forgot-password',
  userType: null as 'vendor' | 'buyer' | 'admin' | 'superadmin' | null,
  title: '',
  showUserTypeSelection: true,
  showForgotPasswordTab: true,
  useLegacyForgotPassword: false
});

// Global authentication state
const authState = reactive({
  isAuthenticated: false,
  user: null as any,
  userType: null as string | null,
  token: null as string | null
});

export const useGlobalAuth = () => {
  // Open authentication modal
  const openAuthModal = (config?: Partial<typeof authModalConfig>) => {
    // Reset to defaults first
    authModalConfig.mode = 'login';
    authModalConfig.userType = null;
    authModalConfig.title = '';
    authModalConfig.showUserTypeSelection = true;
    authModalConfig.showForgotPasswordTab = true;
    authModalConfig.useLegacyForgotPassword = false;
    
    // Apply custom config
    if (config) {
      Object.assign(authModalConfig, config);
    }
    
    isAuthModalOpen.value = true;
  };

  // Close authentication modal
  const closeAuthModal = () => {
    isAuthModalOpen.value = false;
  };

  // Open login modal
  const openLogin = (userType?: 'vendor' | 'buyer' | 'admin' | 'superadmin' | null) => {
    openAuthModal({
      mode: 'login',
      userType,
      title: 'Welcome Back',
      showUserTypeSelection: false
    });
  };

  // Open register modal
  const openRegister = (userType?: 'vendor' | 'buyer' | 'admin' | 'superadmin' | null) => {
    openAuthModal({
      mode: 'register',
      userType,
      title: 'Create Your Account',
      showUserTypeSelection: !userType
    });
  };

  // Open forgot password modal
  const openForgotPassword = (_email?: string) => {
    openAuthModal({
      mode: 'forgot-password',
      title: 'Reset Password',
      showUserTypeSelection: false
    });
  };

  // Open vendor registration
  const openVendorRegistration = () => {
    openRegister('vendor');
  };

  // Open buyer registration
  const openBuyerRegistration = () => {
    openRegister('buyer');
  };

  // Open admin login
  const openAdminLogin = () => {
    openLogin('admin');
  };

  // Open super admin login
  const openSuperAdminLogin = () => {
    openLogin('superadmin');
  };

  // Handle login success
  const handleLoginSuccess = (userData: any) => {
    authState.isAuthenticated = true;
    authState.user = userData;
    authState.userType = userData.userType || userData.provider || 'buyer';
    authState.token = userData.token || 'mock-token';
    
    // Store in localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(userData));
      if (authState.token) localStorage.setItem('auth_token', authState.token);
      if (authState.userType) localStorage.setItem('auth_user_type', authState.userType);
    }
    
    closeAuthModal();
    
    // Emit global event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:login', { detail: userData }));
    }
  };

  // Handle register success
  const handleRegisterSuccess = (userData: any) => {
    authState.isAuthenticated = true;
    authState.user = userData;
    authState.userType = userData.userType || 'buyer';
    authState.token = 'mock-token';
    
    // Store in localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(userData));
      if (authState.token) localStorage.setItem('auth_token', authState.token);
      if (authState.userType) localStorage.setItem('auth_user_type', authState.userType);
    }
    
    closeAuthModal();
    
    // Emit global event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:register', { detail: userData }));
    }
  };

  // Handle forgot password
  const handleForgotPassword = (email: string) => {
    // Emit global event for handling
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:forgot-password', { detail: { email } }));
    }
    
    // For now, just close the modal
    closeAuthModal();
  };

  // Logout function
  const logout = () => {
    authState.isAuthenticated = false;
    authState.user = null;
    authState.userType = null;
    authState.token = null;
    
    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user_type');
    }
    
    // Emit global event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  };

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      const storedUserType = localStorage.getItem('auth_user_type');
      
      if (storedUser && storedToken) {
        authState.isAuthenticated = true;
        authState.user = JSON.parse(storedUser);
        authState.token = storedToken;
        authState.userType = storedUserType;
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      // Clear corrupted data
      logout();
    }
  };

  // Check if user has specific role
  const hasRole = (role: string | string[]) => {
    if (!authState.isAuthenticated || !authState.userType) return false;
    
    if (Array.isArray(role)) {
      return role.includes(authState.userType);
    }
    
    return authState.userType === role;
  };

  // Check if user is admin or super admin
  const isAdmin = () => {
    return hasRole(['admin', 'superadmin']);
  };

  // Check if user is vendor
  const isVendor = () => {
    return hasRole('vendor');
  };

  // Check if user is buyer
  const isBuyer = () => {
    return hasRole('buyer');
  };

  return {
    // State
    isAuthModalOpen: readonly(isAuthModalOpen),
    authModalConfig: readonly(authModalConfig),
    authState: readonly(authState),
    
    // Modal controls
    openAuthModal,
    closeAuthModal,
    openLogin,
    openRegister,
    openForgotPassword,
    openVendorRegistration,
    openBuyerRegistration,
    openAdminLogin,
    openSuperAdminLogin,
    
    // Auth handlers
    handleLoginSuccess,
    handleRegisterSuccess,
    handleForgotPassword,
    logout,
    initializeAuth,
    
    // Role checks
    hasRole,
    isAdmin,
    isVendor,
    isBuyer
  };
};

// Auto-initialize auth state
if (typeof window !== 'undefined') {
  const { initializeAuth } = useGlobalAuth();
  initializeAuth();
}
