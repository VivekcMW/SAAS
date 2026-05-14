<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
await navigateTo(`/marketplace/app/${route.params.id}`, { redirectCode: 301, replace: true })
</script>
