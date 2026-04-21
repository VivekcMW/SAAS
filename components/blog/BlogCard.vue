/**
 * Enhanced Blog Card Component with AI Thumbnail Generation
 */

<template>
  <article class="blog-card" :class="{ 'generating': isGenerating }">
    <div class="blog-card-image">
      <!-- Loading State -->
      <div v-if="isGenerating" class="thumbnail-loading">
        <div class="loading-spinner"></div>
        <p>Generating AI thumbnail...</p>
      </div>
      
      <!-- Generated/Cached Thumbnail -->
      <img 
        v-else-if="thumbnailUrl" 
        :src="thumbnailUrl" 
        :alt="post.title"
        class="thumbnail-image"
        @error="handleImageError"
        loading="lazy"
      />
      
      <!-- Fallback Placeholder -->
      <div v-else class="thumbnail-placeholder">
        <Icon name="ph:image" size="48" />
        <span>{{ post.category }}</span>
      </div>

      <!-- Regenerate Button (Admin/Dev) -->
      <button 
        v-if="showControls && !isGenerating" 
        @click="regenerateThumbnail"
        class="regenerate-btn"
        title="Regenerate thumbnail"
      >
        <Icon name="ph:arrow-clockwise" />
      </button>

      <!-- Category Badge -->
      <span class="category-badge">{{ post.category }}</span>
    </div>

    <div class="blog-card-content">
      <div class="post-meta">
        <span class="post-date">{{ formatDate(post.date) }}</span>
        <span class="read-time">{{ post.readTime || '5 min read' }}</span>
      </div>
      
      <h3 class="post-title">
        <NuxtLink :to="`/blog/${post.slug}`">
          {{ post.title }}
        </NuxtLink>
      </h3>
      
      <p class="post-excerpt">{{ post.excerpt }}</p>
      
      <div class="post-footer">
        <span class="post-author">By {{ post.author || 'SaaSWorld Team' }}</span>
        <NuxtLink :to="`/blog/${post.slug}`" class="read-more">
          Read More <Icon name="ph:arrow-right" />
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
interface BlogPost {
  title: string
  slug: string
  excerpt: string
  category: string
  date: string
  author?: string
  readTime?: string
  thumbnailStyle?: 'modern' | 'minimal' | 'colorful' | 'professional'
}

interface Props {
  post: BlogPost
  showControls?: boolean
  autoGenerate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showControls: false,
  autoGenerate: true
})

const { getThumbnail, generateBlogThumbnail, isGenerating } = useAIThumbnail()
const thumbnailUrl = ref<string>('')

// Generate thumbnail on mount
onMounted(async () => {
  if (props.autoGenerate) {
    await loadThumbnail()
  }
})

const loadThumbnail = async () => {
  try {
    const url = await getThumbnail({
      title: props.post.title,
      category: props.post.category,
      slug: props.post.slug,
      style: props.post.thumbnailStyle || 'modern'
    })
    thumbnailUrl.value = url
  } catch (error) {
    console.error('Failed to load thumbnail:', error)
  }
}

const regenerateThumbnail = async () => {
  try {
    // Clear cache
    if (process.client) {
      localStorage.removeItem(`thumbnail-${props.post.slug}`)
    }
    
    const url = await generateBlogThumbnail({
      title: props.post.title,
      category: props.post.category,
      slug: props.post.slug,
      style: props.post.thumbnailStyle || 'modern'
    })
    thumbnailUrl.value = url
  } catch (error) {
    console.error('Failed to regenerate thumbnail:', error)
  }
}

const handleImageError = () => {
  // Fallback to placeholder
  thumbnailUrl.value = ''
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.blog-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02];
}

.blog-card.generating {
  @apply opacity-75;
}

.blog-card-image {
  @apply relative aspect-video bg-gray-100;
}

.thumbnail-loading {
  @apply absolute inset-0 flex flex-col items-center justify-center bg-gray-50;
}

.loading-spinner {
  @apply w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2;
}

.thumbnail-loading p {
  @apply text-sm text-gray-600;
}

.thumbnail-image {
  @apply w-full h-full object-cover;
}

.thumbnail-placeholder {
  @apply absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500;
}

.regenerate-btn {
  @apply absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors;
}

.category-badge {
  @apply absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full;
}

.blog-card-content {
  @apply p-6;
}

.post-meta {
  @apply flex items-center gap-3 text-sm text-gray-500 mb-3;
}

.post-title {
  @apply text-xl font-bold text-gray-900 mb-3 leading-tight;
}

.post-title a {
  @apply hover:text-primary transition-colors;
}

.post-excerpt {
  @apply text-gray-600 mb-4 line-clamp-3;
}

.post-footer {
  @apply flex items-center justify-between;
}

.post-author {
  @apply text-sm text-gray-500;
}

.read-more {
  @apply inline-flex items-center gap-1 text-primary font-medium text-sm hover:gap-2 transition-all;
}

/* Admin controls */
.blog-card:hover .regenerate-btn {
  @apply opacity-100;
}

.regenerate-btn {
  @apply opacity-0 transition-opacity;
}
</style>
