<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

    <!-- Loading -->
    <div v-if="pending" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      <p class="text-gray-500">Validating your claim link...</p>
    </div>

    <!-- Invalid / expired -->
    <div v-else-if="error" class="max-w-md w-full text-center">
      <div class="bg-white rounded-2xl shadow-sm border border-red-100 p-8">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-x-circle" class="w-8 h-8 text-red-500" />
        </div>
        <h1 class="text-xl font-bold text-gray-900 mb-2">Link Invalid or Expired</h1>
        <p class="text-gray-500 mb-6">
          {{ errorMessage }}
        </p>
        <UButton to="/" variant="outline" size="lg">Go to Homepage</UButton>
      </div>
    </div>

    <!-- Valid — show listing preview + claim form -->
    <div v-else-if="claimData" class="max-w-2xl w-full space-y-6">

      <!-- Header -->
      <div class="text-center">
        <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <UIcon name="i-lucide-sparkles" class="w-4 h-4" />
          Free listing claim
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Claim <span class="text-blue-600">{{ claimData.app.name }}</span></h1>
        <p class="text-gray-500 mt-2">Review your auto-generated listing and go live in minutes</p>
      </div>

      <!-- Listing Preview Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Your Listing Preview</h2>
        <div class="flex gap-4 items-start">
          <img
            v-if="claimData.app.logo_url"
            :src="claimData.app.logo_url"
            :alt="claimData.app.name"
            class="w-16 h-16 rounded-xl object-contain border border-gray-100 bg-gray-50 flex-shrink-0"
          >
          <div v-else class="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-box" class="w-8 h-8 text-blue-500" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-semibold text-gray-900 text-lg">{{ claimData.app.name }}</h3>
              <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{{ claimData.app.category }}</span>
              <span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full capitalize">{{ claimData.app.pricing_type }}</span>
            </div>
            <p class="text-gray-500 text-sm mt-1 line-clamp-2">{{ claimData.app.short_description || claimData.app.tagline }}</p>
            <a :href="claimData.app.website_url" target="_blank" rel="noopener" class="text-blue-600 text-sm hover:underline mt-1 inline-flex items-center gap-1">
              {{ claimData.app.website_url }}
              <UIcon name="i-lucide-external-link" class="w-3 h-3" />
            </a>
          </div>
        </div>

        <div v-if="claimData.app.key_features?.length" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Key Features</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="feat in claimData.app.key_features.slice(0, 6)"
              :key="feat"
              class="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100"
            >{{ feat }}</span>
          </div>
        </div>

        <p class="text-xs text-gray-400 mt-4">
          You can edit all details after claiming. This is an auto-generated preview.
        </p>
      </div>

      <!-- Claim Form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Claim this listing</h2>
        <p class="text-sm text-gray-500 mb-6">Create a free account or log in to an existing one</p>

        <!-- Mode toggle -->
        <div class="flex rounded-xl border border-gray-200 p-1 mb-6">
          <button
            type="button"
            class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="mode === 'register' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'"
            @click="mode = 'register'"
          >
            Create Account
          </button>
          <button
            type="button"
            class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="mode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'"
            @click="mode = 'login'"
          >
            Log In
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="submitClaim">
          <div v-if="mode === 'register'" class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <UInput v-model="form.first_name" placeholder="Jane" required size="lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <UInput v-model="form.last_name" placeholder="Smith" required size="lg" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
            <UInput v-model="form.email" type="email" placeholder="jane@company.com" required size="lg" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <UInput v-model="form.password" type="password" placeholder="Min. 8 characters" required size="lg" />
          </div>

          <p v-if="submitError" class="text-red-600 text-sm">{{ submitError }}</p>

          <UButton
            type="submit"
            size="lg"
            :loading="submitting"
            :disabled="submitting"
            block
            class="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {{ mode === 'register' ? 'Create Account & Claim Listing' : 'Log In & Claim Listing' }}
          </UButton>
        </form>

        <p class="text-center text-xs text-gray-400 mt-4">
          By claiming, you confirm you are authorised to represent this company.
          No credit card required.
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route  = useRoute()
const token  = route.params.token as string

const mode   = ref<'register' | 'login'>('register')
const form   = reactive({ first_name: '', last_name: '', email: '', password: '' })
const submitting  = ref(false)
const submitError = ref('')

// Fetch and validate the claim token
const { data: claimData, pending, error } = await useFetch<{ app: { name: string; logo_url?: string; category: string; pricing_type: string; short_description?: string; tagline?: string; website_url: string; key_features?: string[] } }>(`/api/claim/${token}`, {
  key: `claim-${token}`
})

const errorMessage = computed(() => {
  const status = (error.value as { statusCode?: number })?.statusCode
  if (status === 410) return 'This claim link has expired. Please contact us for a new one.'
  if (status === 409) return 'This listing has already been claimed.'
  return 'This claim link is invalid or has been revoked.'
})

async function submitClaim() {
  submitError.value = ''
  submitting.value  = true

  try {
    await $fetch(`/api/claim/${token}`, {
      method: 'POST',
      body: {
        mode: mode.value,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name
      }
    })

    // Redirect to vendor dashboard
    await navigateTo('/dashboard/vendor/listings?claimed=1')
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    submitError.value = e?.data?.statusMessage || e?.message || 'Something went wrong. Please try again.'
  }
  finally {
    submitting.value = false
  }
}

useHead({
  title: claimData.value?.app?.name
    ? `Claim ${claimData.value.app.name} — SaasWorld`
    : 'Claim Listing — SaasWorld'
})
</script>
