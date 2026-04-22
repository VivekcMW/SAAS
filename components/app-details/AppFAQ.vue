<script setup lang="ts">
interface FAQItem { q: string; a: string }
interface Props { items: FAQItem[] }
defineProps<Props>()
</script>

<template>
  <div class="faq-accordion">
    <Accordion
      v-for="(it, i) in items"
      :key="i"
      :title="it.q"
      :default-open="i === 0"
    >
      <p class="faq-answer">{{ it.a }}</p>
    </Accordion>
  </div>
</template>

<style scoped>
.faq-accordion {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 0.5px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  background: #ffffff;
}
.faq-accordion :deep(.accordion) { border-bottom: 0.5px solid #e5e7eb; }
.faq-accordion :deep(.accordion:last-child) { border-bottom: none; }
.faq-answer {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}
</style>
