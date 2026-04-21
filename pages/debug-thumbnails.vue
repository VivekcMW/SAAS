<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Debug Thumbnail System</h1>
    
    <div class="space-y-4">
      <h2 class="text-xl font-bold">Test Cases:</h2>
      
      <div v-for="testSlug in testSlugs" :key="testSlug" class="border p-4 rounded">
        <h3 class="font-bold">Slug: {{ testSlug }}</h3>
        <p>Has thumbnail: {{ hasThumbnail(testSlug) }}</p>
        <p>Thumbnail URL: {{ getThumbnail(testSlug) }}</p>
        <img 
          :src="getThumbnail(testSlug)" 
          :alt="testSlug"
          class="w-64 h-32 object-cover border mt-2"
          @error="onImageError"
          @load="onImageLoad"
        />
      </div>
    </div>
    
    <div class="mt-8">
      <h2 class="text-xl font-bold">All available thumbnails:</h2>
      <ul class="list-disc pl-5">
        <li v-for="[slug, url] of getAllThumbnails()" :key="slug">
          {{ slug }} → {{ url }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const { getThumbnail, hasThumbnail, getAllThumbnails } = useStaticThumbnails();

const testSlugs = [
  '10-ai-tools-small-business-2025',
  'slack-vs-teams-vs-discord-2025-guide',
  'best-software-remote-teams-2025-stack',
  'non-existent-slug'
];

const onImageError = (event) => {
  console.error('Image failed to load:', event.target.src);
};

const onImageLoad = (event) => {
  console.log('Image loaded successfully:', event.target.src);
};
</script>
