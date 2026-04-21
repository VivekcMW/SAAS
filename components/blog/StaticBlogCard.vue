<template>
  <article class="blog-card group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
    <NuxtLink :to="`/blog/${post.slug}`" class="block">
      <!-- Thumbnail Image -->
      <div class="relative overflow-hidden">
        <img 
          :src="thumbnailUrl" 
          :alt="post.title"
          class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <!-- Card Content -->
      <div class="card-content">
        <!-- Title -->
        <h3 class="card-title">
          {{ post.title }}
        </h3>
      </div>
      
      <!-- Footer -->
      <div class="card-footer">
        <div class="footer-center">
          <!-- Read More Button -->
          <div class="read-more-btn group cursor-pointer">
            <span class="read-more-text">Read Blog</span>
            <UIcon name="i-heroicons-arrow-right" class="read-more-icon" />
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  description?: string;
  category: string;
  date: string;
  author?: string;
  readTime?: string;
  image?: string;
}

interface Props {
  post: BlogPost;
}

const props = defineProps<Props>();

// Use static thumbnails composable
const { getThumbnail, hasThumbnail } = useStaticThumbnails();

// Get thumbnail URL for this post
const thumbnailUrl = computed(() => {
  // Prioritize static thumbnails if they exist
  if (hasThumbnail(props.post.slug)) {
    return getThumbnail(props.post.slug);
  }
  // Fallback to post image or default
  return props.post.image || getThumbnail(props.post.slug);
});

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get author initials
const getAuthorInitials = (author?: string) => {
  if (!author) return 'SW';
  return author
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
</script>

<style scoped>
.blog-card {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px -2px rgb(0 0 0 / 0.1), 0 1px 4px -1px rgb(0 0 0 / 0.06);
  border: 1px solid rgb(229 231 235);
  overflow: hidden;
  transition: all 0.3s ease;
}

.blog-card:hover {
  box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
  border-color: rgb(209 213 219);
  transform: translateY(-1px);
}

.card-content {
  padding: 1.25rem;
  background-color: white;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(17 24 39);
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.5rem;
  line-height: 1.375;
  transition: color 0.2s ease;
}

.group:hover .card-title {
  color: rgb(37 99 235);
}

.card-footer {
  padding: 1rem 1.25rem;
  background-color: rgba(249, 250, 251, 0.5);
  border-top: 1px solid rgb(229 231 235);
}

.footer-center {
  display: flex;
  justify-content: center;
}

.read-more-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.read-more-btn:hover {
  background-color: rgb(239 246 255);
}

.read-more-text {
  color: rgb(37 99 235);
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.read-more-icon {
  margin-left: 0.25rem;
  width: 1rem;
  height: 1rem;
  color: rgb(37 99 235);
  transition: all 0.2s ease;
}

.read-more-btn:hover .read-more-text {
  color: rgb(29 78 216);
}

.read-more-btn:hover .read-more-icon {
  color: rgb(29 78 216);
  transform: translateX(0.125rem);
}

/* Improved image styling */
.blog-card img {
  transition: transform 0.4s ease;
}

.group:hover img {
  transform: scale(1.02);
}
</style>
