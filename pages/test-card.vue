<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Single StaticBlogCard Test</h1>
    
    <div class="max-w-sm">
      <StaticBlogCard :post="testPost" />
    </div>
    
    <div class="mt-8 p-4 bg-gray-100 rounded">
      <h2 class="font-bold">Debug Info:</h2>
      <p><strong>Post Slug:</strong> {{ testPost.slug }}</p>
      <p><strong>Has Thumbnail:</strong> {{ hasThumbnail(testPost.slug) }}</p>
      <p><strong>Thumbnail URL:</strong> {{ getThumbnail(testPost.slug) }}</p>
      <p><strong>Post Image:</strong> {{ testPost.image }}</p>
      
      <h3 class="font-bold mt-4">Direct Image Test:</h3>
      <img 
        :src="getThumbnail(testPost.slug)" 
        :alt="testPost.title"
        class="w-64 h-32 object-cover border mt-2"
      />
    </div>
  </div>
</template>

<script setup>
const { getThumbnail, hasThumbnail } = useStaticThumbnails();

const testPost = {
  title: "10 AI Tools Every Small Business Must Use in 2025",
  slug: "10-ai-tools-small-business-2025",
  excerpt: "Discover game-changing AI tools that can automate tasks and boost productivity for small businesses. Complete implementation guide and best practices.",
  category: "AI & Automation",
  date: "2025-08-16",
  author: "SaaSWorld Team",
  image: "/assets/images/hero-dashboard.png"
};
</script>
