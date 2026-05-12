<script setup lang="ts">
interface FAQItem { q: string; a: string }
interface Props { items: FAQItem[] }
defineProps<Props>()
</script>

<template>
  <div class="faq-wrap">
    <div class="faq-list">
      <Accordion
        v-for="(it, i) in items"
        :key="i"
        :title="it.q"
        :default-open="i === 0"
      >
        <div class="faq-answer-wrap">
          <p class="faq-answer">{{ it.a }}</p>
        </div>
      </Accordion>
    </div>

    <div class="faq-footer">
      <div class="faq-footer-icon">
        <Icon name="heroicons:chat-bubble-left-ellipsis" />
      </div>
      <div class="faq-footer-body">
        <span class="faq-footer-title">Still have questions?</span>
        <span class="faq-footer-sub">Our support team replies within a few hours.</span>
      </div>
      <a href="#contact" class="faq-footer-cta">Contact Support</a>
    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper ───────────────────────────────────────────────── */
.faq-wrap {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── List container ────────────────────────────────────────── */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--mm-s1);
  counter-reset: faq-counter;
}

/* ── Item overrides (deep into Accordion) ──────────────────── */
.faq-list :deep(.accordion) {
  border: none;
  border-radius: 0;
  background: transparent;
  border-bottom: 0.5px solid var(--b1);
  transition: background 0.18s;
  counter-increment: faq-counter;
}
.faq-list :deep(.accordion:last-child) {
  border-bottom: none;
}
.faq-list :deep(.accordion.open) {
  background: var(--mm-s2);
}

/* ── Header row ────────────────────────────────────────────── */
.faq-list :deep(.accordion-header) {
  padding: 18px 20px 18px 56px;
  position: relative;
  font-size: 15px;
  font-weight: 600;
  color: var(--mm-pearl);
  border-left: 3px solid transparent;
  transition: background 0.15s, border-color 0.18s;
}
.faq-list :deep(.accordion.open .accordion-header) {
  border-left-color: var(--mm-gold);
}
.faq-list :deep(.accordion-header:hover:not(:disabled)) {
  background: rgba(255,255,255,0.03);
  border-left-color: var(--b3);
}
/* Number badge via CSS counter */
.faq-list :deep(.accordion-header)::before {
  content: counter(faq-counter, decimal-leading-zero);
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--mm-slate);
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  transition: background 0.18s, color 0.18s, border-color 0.18s;
}
.faq-list :deep(.accordion.open .accordion-header)::before {
  background: rgba(212, 168, 67, 0.12);
  border-color: var(--mm-gold);
  color: var(--mm-gold);
}

/* ── Chevron ───────────────────────────────────────────────── */
.faq-list :deep(.accordion-icon) {
  width: 18px;
  height: 18px;
  color: var(--mm-slate);
  flex-shrink: 0;
}
.faq-list :deep(.accordion.open .accordion-icon) {
  color: var(--mm-gold);
}

/* ── Body ──────────────────────────────────────────────────── */
.faq-list :deep(.accordion-body) {
  padding: 0 20px 20px 56px;
  border-top: 0.5px solid var(--b1);
}

/* ── Answer text ───────────────────────────────────────────── */
.faq-answer-wrap {
  padding-top: 14px;
}
.faq-answer {
  margin: 0;
  font-size: 14.5px;
  color: var(--mm-silver);
  line-height: 1.75;
}

/* ── Footer CTA ────────────────────────────────────────────── */
.faq-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
}
.faq-footer-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--r-md);
  background: rgba(212, 168, 67, 0.1);
  border: 0.5px solid rgba(212, 168, 67, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mm-gold);
  flex-shrink: 0;
}
.faq-footer-icon :deep(svg) { width: 20px; height: 20px; }
.faq-footer-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.faq-footer-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--mm-pearl);
}
.faq-footer-sub {
  font-size: 13px;
  color: var(--mm-slate);
}
.faq-footer-cta {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--r-md);
  border: 0.5px solid var(--mm-gold);
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--mm-gold);
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
.faq-footer-cta:hover {
  background: rgba(212, 168, 67, 0.1);
}

@media (max-width: 600px) {
  .faq-footer { flex-wrap: wrap; }
  .faq-footer-cta { width: 100%; justify-content: center; }
  .faq-list :deep(.accordion-body) { padding-left: 20px; }
  .faq-list :deep(.accordion-header) { padding-left: 52px; }
}
</style>
