<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Blog Posts Debug</h1>
    
    <div class="space-y-6">
      <div v-for="post in debugPosts" :key="post.slug" class="border p-4 rounded">
        <h3 class="font-bold text-lg">{{ post.title }}</h3>
        <p><strong>Slug:</strong> {{ post.slug }}</p>
        <p><strong>Has Static Thumbnail:</strong> {{ hasThumbnail(post.slug) }}</p>
        <p><strong>Static Thumbnail URL:</strong> {{ getThumbnail(post.slug) }}</p>
        <p><strong>Post Image:</strong> {{ post.image }}</p>
        <p><strong>Final URL (Component Logic):</strong> {{ getFinalThumbnailUrl(post) }}</p>
        
        <div class="mt-4">
          <img 
            :src="getFinalThumbnailUrl(post)" 
            :alt="post.title"
            class="w-64 h-32 object-cover border"
            @error="onImageError"
            @load="onImageLoad"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getThumbnail, hasThumbnail } = useStaticThumbnails();

// Sample of the actual blog posts from the index
const debugPosts = [
  {
    title: "Slack vs Microsoft Teams vs Discord: The Ultimate 2025 Team Communication Guide",
    slug: "slack-vs-teams-vs-discord-2025-guide",
    excerpt: "Comprehensive comparison of the top 3 team communication platforms.",
    category: "Software Comparison",
    date: "2025-08-21",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "10 AI Tools Every Small Business Must Use in 2025",
    slug: "10-ai-tools-small-business-2025",
    excerpt: "Discover game-changing AI tools that can automate tasks and boost productivity.",
    category: "AI & Automation",
    date: "2025-08-16",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "HubSpot vs Salesforce vs Pipedrive: CRM Showdown 2025",
    slug: "hubspot-vs-salesforce-vs-pipedrive-crm-comparison",
    excerpt: "Complete CRM comparison covering features, capabilities, and use cases.",
    category: "Software Comparison", 
    date: "2025-08-20",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  }
];

// Replicate the component logic
const getFinalThumbnailUrl = (post) => {
  // Prioritize static thumbnails if they exist
  if (hasThumbnail(post.slug)) {
    return getThumbnail(post.slug);
  }
  // Fallback to post image or default
  return post.image || getThumbnail(post.slug);
};

const onImageError = (event) => {
  console.error('Image failed to load:', event.target.src);
};

const onImageLoad = (event) => {
  console.log('Image loaded successfully:', event.target.src);
};
</script>
