<template>
  <LegalShell
    title="Your privacy choices"
    eyebrow="Legal · Privacy rights"
    lede="Exercise the rights you have over your personal data under GDPR, CCPA/CPRA, and similar laws — in one place."
    :updated="updatedAt"
    contact-email="privacy@moonmart.ai"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="summary">
        <h2>1. At a glance</h2>
        <p>
          No matter where you live, you can ask us to tell you what personal data we hold
          about you, correct it, export it, or delete it. If you are in the EU/EEA/UK or
          California, additional rights apply — summarised below. To exercise any of them,
          email <a href="mailto:privacy@moonmart.ai">privacy@moonmart.ai</a> from the
          address associated with your account.
        </p>
      </section>

      <section id="gdpr">
        <h2>2. Rights under GDPR (EU / EEA / UK)</h2>
        <p>If you are in the European Union, European Economic Area or United Kingdom:</p>
        <ul>
          <li><strong>Access</strong> — receive a copy of the personal data we hold about you.</li>
          <li><strong>Rectification</strong> — correct inaccurate or incomplete data.</li>
          <li><strong>Erasure</strong> — request deletion ("right to be forgotten").</li>
          <li><strong>Restriction</strong> — limit how we use your data while a dispute is resolved.</li>
          <li><strong>Portability</strong> — receive your data in a machine-readable format.</li>
          <li><strong>Objection</strong> — object to processing based on legitimate interests, or to direct marketing.</li>
          <li><strong>Withdraw consent</strong> — where processing is based on consent, withdraw it at any time.</li>
        </ul>
        <p>
          Our lawful bases are contained in our <NuxtLink to="/privacy">Privacy Policy</NuxtLink>.
          You also have the right to lodge a complaint with your supervisory authority.
        </p>
      </section>

      <section id="ccpa">
        <h2>3. Rights under CCPA / CPRA (California)</h2>
        <p>If you are a California resident:</p>
        <ul>
          <li><strong>Right to know</strong> — what personal information we collect, use, disclose, and (if applicable) sell or share.</li>
          <li><strong>Right to delete</strong> — personal information we collected from you.</li>
          <li><strong>Right to correct</strong> — inaccurate personal information.</li>
          <li><strong>Right to opt out</strong> — of the "sale" or "sharing" of personal information for cross-context behavioral advertising.</li>
          <li><strong>Right to limit</strong> — use and disclosure of sensitive personal information.</li>
          <li><strong>Right to non-discrimination</strong> — we will not penalise you for exercising these rights.</li>
        </ul>
        <p>
          <strong>We do not sell personal information</strong> in the traditional sense.
          Where the CCPA's broader definitions of "sale" or "share" could apply (for
          example, use of analytics cookies), you can opt out from our
          <NuxtLink to="/cookies">Cookie Settings</NuxtLink> or by sending a Global Privacy
          Control (GPC) signal.
        </p>
      </section>

      <section id="other">
        <h2>4. Other jurisdictions</h2>
        <p>
          Residents of <strong>Brazil</strong> (LGPD), <strong>Canada</strong> (PIPEDA) and
          a growing list of US states (Colorado, Virginia, Connecticut, Utah and others)
          have broadly similar rights. Contact us at
          <a href="mailto:privacy@moonmart.ai">privacy@moonmart.ai</a> and we will apply
          the protections your local law requires.
        </p>
      </section>

      <section id="how">
        <h2>5. How to submit a request</h2>
        <ol>
          <li>Email <a href="mailto:privacy@moonmart.ai">privacy@moonmart.ai</a> from the address on your account.</li>
          <li>Tell us which right you're exercising and, if relevant, the data you're asking about.</li>
          <li>We will confirm receipt within <strong>5 business days</strong>.</li>
          <li>We will respond substantively within the statutory window — generally <strong>30 days</strong> (GDPR) or <strong>45 days</strong> (CCPA), extendable once when necessary.</li>
        </ol>
        <p>
          An authorized agent may submit a request on your behalf; we will require proof of
          authorization.
        </p>
      </section>

      <section id="verification">
        <h2>6. Identity verification</h2>
        <p>
          To protect your data we need to confirm your identity. For account holders,
          replying from the registered email is usually sufficient. For sensitive requests
          or unauthenticated visitors, we may ask for additional information strictly to
          verify your identity.
        </p>
      </section>

      <section id="appeals">
        <h2>7. Appeals</h2>
        <p>
          If we decline a request, you may appeal by replying to our decision with the word
          "Appeal" in the subject. A senior member of our privacy team will review and
          respond within the statutory deadline.
        </p>
      </section>

      <section id="contact">
        <h2>8. Contact</h2>
        <div class="contact-info">
          <p><strong>Privacy team:</strong> <a href="mailto:privacy@moonmart.ai">privacy@moonmart.ai</a></p>
          <p><strong>Data Protection Officer (EU):</strong> <a href="mailto:dpo@moonmart.ai">dpo@moonmart.ai</a></p>
          <p><strong>Related:</strong> <NuxtLink to="/privacy">Privacy Policy</NuxtLink> · <NuxtLink to="/cookies">Cookie Policy</NuxtLink> · <NuxtLink to="/dpa">DPA</NuxtLink></p>
        </div>
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
  { id: 'summary', label: '1. At a glance' },
  { id: 'gdpr', label: '2. GDPR rights' },
  { id: 'ccpa', label: '3. CCPA / CPRA rights' },
  { id: 'other', label: '4. Other jurisdictions' },
  { id: 'how', label: '5. How to submit' },
  { id: 'verification', label: '6. Identity verification' },
  { id: 'appeals', label: '7. Appeals' },
  { id: 'contact', label: '8. Contact' }
]

applySEO({
  title: 'Your privacy choices | Moonmart',
  description: 'Exercise your rights under GDPR, CCPA and similar privacy laws.',
  canonical: 'https://moonmart.ai/privacy-choices',
  ogType: 'website'
})
</script>
