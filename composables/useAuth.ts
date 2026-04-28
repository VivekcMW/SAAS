import { computed } from 'vue'

interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  companyName?: string | null
  companySize?: string | null
  jobTitle?: string | null
  phoneNumber?: string | null
  role: 'buyer' | 'vendor' | 'admin'
  plan: string
  avatar?: string | null
  name?: string
  displayRole?: string
}

interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  companyName?: string
  companySize?: string
  jobTitle?: string
  phoneNumber?: string
  plan?: string
}

function normalizeUser(user: AuthUser | null) {
  if (!user) {
    return null
  }

  return {
    ...user,
    avatar: user.avatar || null,
    name: user.name || user.fullName,
    displayRole: user.role === 'admin' ? 'Admin' : user.role === 'vendor' ? 'Vendor' : 'Buyer'
  }
}

export const useAuth = () => {
  const currentUser = useState<AuthUser | null>('auth.currentUser', () => null)
  const isLoading = useState<boolean>('auth.isLoading', () => false)
  const initialized = useState<boolean>('auth.initialized', () => false)

  const isAuthenticated = computed(() => Boolean(currentUser.value))

  const setUser = (user: AuthUser | null) => {
    currentUser.value = normalizeUser(user) as AuthUser | null
  }

  const refreshAuth = async () => {
    if (isLoading.value) {
      return currentUser.value
    }

    isLoading.value = true

    try {
      // On the server, useRequestFetch() forwards the incoming request cookies
      // so the session cookie is included in the /api/auth/me call.
      // On the client, it falls back to regular $fetch.
      const fetchFn = import.meta.server ? useRequestFetch() : $fetch
      const response = await fetchFn<{ authenticated: boolean, user: AuthUser | null }>('/api/auth/me', {
        credentials: 'include'
      })
      setUser(response.user)
      return currentUser.value
    } catch (error) {
      setUser(null)
      return null
    } finally {
      isLoading.value = false
      initialized.value = true
    }
  }

  const login = async (payload: LoginPayload) => {
    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean, user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      })
      setUser(response.user)
      initialized.value = true
      return currentUser.value
    } finally {
      isLoading.value = false
    }
  }

  const register = async (payload: RegisterPayload) => {
    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean, user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      })
      setUser(response.user)
      initialized.value = true
      return currentUser.value
    } finally {
      isLoading.value = false
    }
  }

  const handleLogin = (userData: AuthUser) => {
    setUser(userData)
    initialized.value = true
  }

  const handleLogout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      initialized.value = true
    }
  }

  if (import.meta.client && !initialized.value && !isLoading.value) {
    refreshAuth()
  }

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    initialized,
    refreshAuth,
    login,
    register,
    handleLogin,
    handleLogout
  }
}
