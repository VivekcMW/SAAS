<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Static Thumbnails Test</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="post in testPosts" 
        :key="post.slug"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <img 
          :src="getThumbnail(post.slug)" 
          :alt="post.title"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h3 class="font-bold text-lg mb-2">{{ post.title }}</h3>
          <p class="text-gray-600 text-sm mb-2">{{ post.category }}</p>
          <p class="text-gray-700">{{ post.excerpt }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getThumbnail } = useStaticThumbnails();

const testPosts = [
  {
    title: "10 AI Tools Every Small Business Must Use in 2025",
    slug: "10-ai-tools-small-business-2025",
    excerpt: "Discover game-changing AI tools that can automate tasks and boost productivity.",
    category: "AI & Automation"
  },
  {
    title: "Slack vs Teams vs Discord: Complete 2025 Guide",
    slug: "slack-vs-teams-vs-discord-2025-guide",
    excerpt: "Comprehensive comparison of the top 3 team communication platforms.",
    category: "Communication"
  },
  {
    title: "Best Software for Remote Teams: 2025 Stack",
    slug: "best-software-remote-teams-2025-stack",
    excerpt: "Essential tools and software for building productive remote teams.",
    category: "Remote Work"
  },
  {
    title: "Free vs Paid Business Software: When to Upgrade",
    slug: "free-vs-paid-business-software-when-upgrade",
    excerpt: "Strategic guide on when to invest in premium business software.",
    category: "Business Strategy"
  },
  {
    title: "HubSpot vs Salesforce vs Pipedrive: CRM Comparison",
    slug: "hubspot-vs-salesforce-vs-pipedrive-crm-comparison",
    excerpt: "Complete CRM comparison covering features and capabilities.",
    category: "CRM & Sales"
  },
  {
    title: "Notion vs Monday vs Asana: Project Management",
    slug: "notion-vs-monday-vs-asana-project-management",
    excerpt: "In-depth analysis of leading project management tools.",
    category: "Project Management"
  }
];
</script>
