<template>
  <LegalShell
    title="Accessibility statement"
    eyebrow="Trust · Accessibility"
    lede="Moonmart is committed to making our marketplace usable by everyone, regardless of ability or assistive technology."
    :updated="updatedAt"
    contact-email="accessibility@moonmart.ai"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="commitment">
        <h2>1. Our commitment</h2>
        <p>
          Accessibility is a first-class requirement in our design, engineering and content
          reviews. We target conformance with the
          <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">
            Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA
          </a>
          across every public page and the core in-product experience.
        </p>
      </section>

      <section id="conformance">
        <h2>2. Conformance status</h2>
        <p>
          <strong>Partially conformant</strong> with WCAG 2.1 AA. Most of the site meets
          the standard, but we actively track and remediate known gaps as part of every
          release.
        </p>
      </section>

      <section id="features">
        <h2>3. Accessibility features</h2>
        <ul>
          <li>Semantic HTML landmarks and heading structure on every page.</li>
          <li>Keyboard-navigable interactive elements with visible focus rings.</li>
          <li>Minimum contrast ratios of 4.5:1 for body text and 3:1 for large text.</li>
          <li>Alt text on informative images; decorative images marked as such.</li>
          <li>Forms with associated labels, clear error messages, and ARIA live regions.</li>
          <li>Responsive layouts that reflow at 400% zoom without loss of content.</li>
          <li>Motion respects <code>prefers-reduced-motion</code>.</li>
        </ul>
      </section>

      <section id="technologies">
        <h2>4. Compatible technologies</h2>
        <p>Moonmart is tested against current versions of:</p>
        <ul>
          <li>Safari + VoiceOver (macOS, iOS)</li>
          <li>Chrome + NVDA (Windows)</li>
          <li>Firefox + JAWS (Windows)</li>
          <li>Chrome + TalkBack (Android)</li>
        </ul>
        <p>
          The site is built with standards-compliant HTML, CSS and JavaScript, and
          progressively enhances for older browsers.
        </p>
      </section>

      <section id="limitations">
        <h2>5. Known limitations</h2>
        <p>Some areas may not yet meet AA in full:</p>
        <ul>
          <li>
            <strong>Vendor-supplied content</strong> (product screenshots, embedded demos)
            is controlled by listing vendors; we provide authoring guidance but cannot
            guarantee conformance.
          </li>
          <li>
            <strong>Third-party embeds</strong> (video players, external forms) may vary in
            their own accessibility support.
          </li>
          <li>
            Complex interactive components are continuously re-tested as they evolve.
          </li>
        </ul>
      </section>

      <section id="assessment">
        <h2>6. Assessment approach</h2>
        <p>
          We combine three methods to evaluate accessibility:
        </p>
        <ul>
          <li>Automated scanning on every build (axe-core, Lighthouse).</li>
          <li>Manual keyboard and screen-reader testing for new features.</li>
          <li>Periodic independent audits.</li>
        </ul>
      </section>

      <section id="feedback">
        <h2>7. Feedback &amp; requests</h2>
        <p>
          If you encounter an accessibility barrier, need content in an alternative format,
          or have suggestions, please contact us. We treat accessibility reports with the
          same priority as security reports.
        </p>
        <div class="contact-info">
          <p><strong>Email:</strong> <a href="mailto:accessibility@moonmart.ai">accessibility@moonmart.ai</a></p>
          <p><strong>Response time:</strong> within 5 business days</p>
          <p><strong>Alternative formats:</strong> available on request</p>
        </div>
      </section>

      <section id="enforcement">
        <h2>8. Enforcement procedure</h2>
        <p>
          If your concern is not resolved to your satisfaction, residents of the EU may
          contact their national enforcement body under the European Accessibility Act;
          residents of the US may contact the Department of Justice under the ADA.
        </p>
      </section>
    </div>
  </LegalShell>
</template>

<script setup lang="ts">
const { applySEO } = useSEO()

const updatedAt = new Date().toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
})

const tocSections = [
  { id: 'commitment', label: '1. Our commitment' },
  { id: 'conformance', label: '2. Conformance status' },
  { id: 'features', label: '3. Accessibility features' },
  { id: 'technologies', label: '4. Compatible technologies' },
  { id: 'limitations', label: '5. Known limitations' },
  { id: 'assessment', label: '6. Assessment approach' },
  { id: 'feedback', label: '7. Feedback & requests' },
  { id: 'enforcement', label: '8. Enforcement' }
]

applySEO({
  title: 'Accessibility statement | Moonmart',
  description: 'Moonmart\'s accessibility statement, WCAG 2.1 AA conformance, and how to report barriers.',
  canonical: 'https://moonmart.ai/accessibility',
  ogType: 'website'
})
</script>
