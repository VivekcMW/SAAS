import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Types
export interface SearchResult {
  id: string
  title: string
  type: 'category' | 'subcategory' | 'tool' | 'page' | 'feature'
  path: string
  icon: string
  description?: string
  categoryParent?: string
  tags?: string[]
  priority?: number
}

export interface SearchOptions {
  types?: Array<'category' | 'subcategory' | 'tool' | 'page' | 'feature'>
  limit?: number
  includeDescription?: boolean
}

export const useGlobalSearch = () => {
  const router = useRouter()
  
  // State
  const isSearching = ref(false)
  const searchHistory = ref<string[]>([])
  
  // Categories data (from your existing CategoriesMenu)
  const categories = [
    {
      id: 'productivity',
      name: 'Productivity & Business',
      icon: 'heroicons:briefcase',
      subcategories: [
        { name: 'Time Tracking Apps', path: '/marketplace/category/time-tracking' },
        { name: 'Project Management', path: '/marketplace/category/project-management' },
        { name: 'Team Collaboration', path: '/marketplace/category/team-collaboration' },
        { name: 'Document Management', path: '/marketplace/category/document-management' },
        { name: 'Email Clients', path: '/marketplace/category/email-clients' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing & Sales',
      icon: 'heroicons:megaphone',
      subcategories: [
        { name: 'Email Marketing', path: '/marketplace/category/email-marketing' },
        { name: 'Social Media Management', path: '/marketplace/category/social-media-management' },
        { name: 'CRM Software', path: '/marketplace/category/crm' },
        { name: 'Marketing Automation', path: '/marketplace/category/marketing-automation' },
        { name: 'Analytics Tools', path: '/marketplace/category/marketing-analytics-tools' }
      ]
    },
    {
      id: 'design',
      name: 'Design & Creative',
      icon: 'heroicons:pencil-square',
      subcategories: [
        { name: 'Photo Editing', path: '/marketplace/category/photo-editing' },
        { name: 'Video Editing', path: '/marketplace/category/video-editing' },
        { name: 'Graphic Design Tools', path: '/marketplace/category/graphic-design-tools' },
        { name: 'UI Frameworks', path: '/marketplace/category/ui-frameworks' },
        { name: 'Animation Tools', path: '/marketplace/category/3d-animation' }
      ]
    },
    {
      id: 'engineering',
      name: 'Engineering & Development',
      icon: 'heroicons:wrench-screwdriver',
      subcategories: [
        { name: 'Code Editors', path: '/marketplace/category/code-editors' },
        { name: 'Version Control', path: '/marketplace/category/version-control' },
        { name: 'Testing Tools', path: '/marketplace/category/testing-tools' },
        { name: 'API Management', path: '/marketplace/category/api-management' },
        { name: 'Cloud Computing Platforms', path: '/marketplace/category/cloud-computing-platforms' }
      ]
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: 'heroicons:currency-dollar',
      subcategories: [
        { name: 'Accounting Software', path: '/marketplace/category/accounting' },
        { name: 'Investment Tracking', path: '/marketplace/category/investment-tracking' },
        { name: 'Expense Management', path: '/marketplace/category/expense-management' },
        { name: 'Financial Planning', path: '/marketplace/category/financial-planning' },
        { name: 'Payment Processing', path: '/marketplace/category/payment-processing' }
      ]
    },
    {
      id: 'ai',
      name: 'AI',
      icon: 'heroicons:cpu-chip',
      subcategories: [
        { name: 'AI Writing Assistants', path: '/marketplace/category/ai-writing' },
        { name: 'AI Image Generators', path: '/marketplace/category/ai-image-generation' },
        { name: 'Chatbots', path: '/marketplace/category/chatbots' },
        { name: 'Machine Learning', path: '/marketplace/category/machine-learning' },
        { name: 'AI Automation', path: '/marketplace/category/ai-automation' }
      ]
    }
  ]

  // Pages data
  const pages = [
    { id: 'home', title: 'Home', path: '/', icon: 'i-heroicons-home', description: 'Welcome to Moonmart' },
    { id: 'marketplace', title: 'Marketplace', path: '/marketplace', icon: 'i-heroicons-shopping-bag', description: 'Discover tools and integrations' },
    { id: 'dashboard', title: 'Dashboard', path: '/dashboard', icon: 'i-heroicons-chart-bar', description: 'Analytics and insights' },
    { id: 'features', title: 'Features', path: '/features', icon: 'i-heroicons-sparkles', description: 'Explore our features' },
    { id: 'pricing', title: 'Pricing', path: '/pricing', icon: 'i-heroicons-currency-dollar', description: 'View pricing plans' },
    { id: 'about', title: 'About', path: '/about', icon: 'i-heroicons-information-circle', description: 'Learn about us' },
    { id: 'contact', title: 'Contact', path: '/contact', icon: 'i-heroicons-envelope', description: 'Get in touch' },
    { id: 'help', title: 'Help', path: '/help', icon: 'i-heroicons-question-mark-circle', description: 'Help and documentation' },
    { id: 'settings', title: 'Settings', path: '/settings', icon: 'i-heroicons-cog-6-tooth', description: 'Account settings' },
    { id: 'integrations', title: 'Integrations', path: '/integrations', icon: 'i-heroicons-squares-plus', description: 'Connect your tools' }
  ]

  // Build searchable data
  const buildSearchData = (): SearchResult[] => {
    const results: SearchResult[] = []

    // Add categories
    categories.forEach(category => {
      results.push({
        id: `cat-${category.id}`,
        title: category.name,
        type: 'category',
        path: `/marketplace/category/${category.id}`,
        icon: category.icon,
        description: `Browse ${category.name.toLowerCase()} tools`,
        priority: 1
      })

      // Add subcategories
      category.subcategories.forEach((sub, index) => {
        results.push({
          id: `sub-${category.id}-${index}`,
          title: sub.name,
          type: 'subcategory',
          path: sub.path,
          icon: 'i-heroicons-document-text',
          categoryParent: category.name,
          priority: 2
        })
      })
    })

    // Add pages
    pages.forEach(page => {
      results.push({
        id: page.id,
        title: page.title,
        type: 'page',
        path: page.path,
        icon: page.icon,
        description: page.description,
        priority: 3
      })
    })

    return results
  }

  // Search function
  const performSearch = async (query: string, options: SearchOptions = {}): Promise<SearchResult[]> => {
    isSearching.value = true

    try {
      const {
        types = ['category', 'subcategory', 'page'],
        limit = 50,
        includeDescription = true
      } = options

      const searchData = buildSearchData()
      const queryLower = query.toLowerCase().trim()

      if (!queryLower) {
        return []
      }

      const results = searchData.filter(item => {
        // Filter by type
        if (!types.includes(item.type)) return false

        // Search in title
        if (item.title.toLowerCase().includes(queryLower)) return true

        // Search in description if available
        if (includeDescription && item.description?.toLowerCase().includes(queryLower)) return true

        // Search in category parent
        if (item.categoryParent?.toLowerCase().includes(queryLower)) return true

        // Search in tags if available
        if (item.tags?.some(tag => tag.toLowerCase().includes(queryLower))) return true

        return false
      })

      // Sort by relevance (priority + title match)
      results.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, queryLower)
        const bScore = calculateRelevanceScore(b, queryLower)
        return bScore - aScore
      })

      return results.slice(0, limit)
    } finally {
      isSearching.value = false
    }
  }

  // Calculate relevance score for sorting
  const calculateRelevanceScore = (item: SearchResult, query: string): number => {
    let score = 0

    // Exact title match gets highest score
    if (item.title.toLowerCase() === query) {
      score += 100
    }
    // Title starts with query
    else if (item.title.toLowerCase().startsWith(query)) {
      score += 80
    }
    // Title contains query
    else if (item.title.toLowerCase().includes(query)) {
      score += 60
    }

    // Description match
    if (item.description?.toLowerCase().includes(query)) {
      score += 30
    }

    // Category parent match
    if (item.categoryParent?.toLowerCase().includes(query)) {
      score += 20
    }

    // Priority bonus (categories get higher priority)
    score += (4 - (item.priority || 3)) * 10

    return score
  }

  // Get quick actions with VC focus
  const getQuickActions = () => [
    {
      id: 'investment-opportunities',
      title: 'Investment Opportunities',
      description: 'Discover startups seeking funding',
      icon: 'i-heroicons-banknotes',
      action: () => navigateTo('/marketplace?filter=seeking-funding')
    },
    {
      id: 'high-growth-companies',
      title: 'High-Growth Companies',
      description: 'Explore fast-scaling SaaS companies',
      icon: 'i-heroicons-arrow-trending-up',
      action: () => navigateTo('/marketplace?filter=high-growth')
    },
    {
      id: 'market-leaders',
      title: 'Market Leaders',
      description: 'Find established industry leaders',
      icon: 'i-heroicons-trophy',
      action: () => navigateTo('/marketplace?filter=market-leaders')
    },
    {
      id: 'unicorn-companies',
      title: 'Unicorn Companies',
      description: 'Billion-dollar SaaS companies',
      icon: 'i-heroicons-sparkles',
      action: () => navigateTo('/marketplace?filter=unicorns')
    },
    {
      id: 'emerging-startups',
      title: 'Emerging Startups',
      description: 'Early-stage companies with potential',
      icon: 'i-heroicons-star',
      action: () => navigateTo('/marketplace?filter=emerging')
    },
    {
      id: 'browse-categories',
      title: 'Browse Categories',
      description: 'Explore all available categories',
      icon: 'i-heroicons-squares-2x2',
      action: () => navigateTo('/marketplace')
    },
    {
      id: 'market-intelligence',
      title: 'Market Intelligence',
      description: 'Access market trends and insights',
      icon: 'i-heroicons-chart-bar',
      action: () => navigateTo('/insights')
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get help and documentation',
      icon: 'i-heroicons-question-mark-circle',
      action: () => navigateTo('/help')
    }
  ]

  // Navigation helper
  const navigateTo = (path: string) => {
    router.push(path)
  }

  // Search history management
  const saveToHistory = (query: string) => {
    if (!query.trim()) return

    const existing = searchHistory.value.indexOf(query)
    if (existing !== -1) {
      searchHistory.value.splice(existing, 1)
    }

    searchHistory.value.unshift(query)

    if (searchHistory.value.length > 10) {
      searchHistory.value.pop()
    }

    try {
      localStorage.setItem('globalSearchHistory', JSON.stringify(searchHistory.value))
    } catch (e) {
      console.error('Failed to save search history:', e)
    }
  }

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('globalSearchHistory')
      if (saved) {
        searchHistory.value = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load search history:', e)
      searchHistory.value = []
    }
  }

  const clearHistory = () => {
    searchHistory.value = []
    try {
      localStorage.removeItem('globalSearchHistory')
    } catch (e) {
      console.error('Failed to clear search history:', e)
    }
  }

  // Get popular searches/suggestions
  const getPopularSearches = (): string[] => [
    'Email Marketing',
    'Project Management',
    'AI Writing',
    'Photo Editing',
    'CRM',
    'Analytics',
    'Code Editors',
    'Video Editing'
  ]

  // Debounced search function
  let searchTimeout: NodeJS.Timeout
  const debouncedSearch = (query: string, callback: (results: SearchResult[]) => void, delay = 300) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      const results = await performSearch(query)
      callback(results)
    }, delay)
  }

  return {
    // State
    isSearching: computed(() => isSearching.value),
    searchHistory: computed(() => searchHistory.value),

    // Methods
    performSearch,
    debouncedSearch,
    getQuickActions,
    navigateTo,
    saveToHistory,
    loadHistory,
    clearHistory,
    getPopularSearches,

    // Helpers
    calculateRelevanceScore
  }
}
