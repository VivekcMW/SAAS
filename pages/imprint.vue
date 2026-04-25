<template>
  <LegalShell
    title="Imprint"
    eyebrow="Legal · Imprint"
    lede="Legal notice and provider identification in accordance with § 5 TMG and § 55 RStV."
    :updated="updatedAt"
    contact-email="legal@moonmart.ai"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="provider">
        <h2>1. Provider</h2>
        <div class="contact-info">
          <p><strong>Moonmart Inc.</strong></p>
          <p>123 Tech Street<br>San Francisco, CA 94105<br>United States</p>
          <p><strong>Email:</strong> <a href="mailto:legal@moonmart.ai">legal@moonmart.ai</a></p>
          <p><strong>Phone:</strong> +1 (555) 123-4567</p>
        </div>
        <p>
          EU establishment for the purposes of Art. 27 GDPR and the Digital Services Act:
        </p>
        <div class="contact-info">
          <p><strong>Moonmart Europe B.V.</strong></p>
          <p>Herengracht 1, 1015 BA Amsterdam, Netherlands</p>
          <p><strong>Email:</strong> <a href="mailto:eu@moonmart.ai">eu@moonmart.ai</a></p>
        </div>
      </section>

      <section id="representatives">
        <h2>2. Authorised representatives</h2>
        <p>Managing directors: the current officers listed with the Chamber of Commerce.</p>
        <p>
          Responsible for content under § 55 (2) RStV: the managing directors at the
          address above.
        </p>
      </section>

      <section id="registration">
        <h2>3. Registration &amp; VAT</h2>
        <ul>
          <li><strong>Commercial register (US):</strong> Delaware Division of Corporations, File No. 0000000.</li>
          <li><strong>EU Chamber of Commerce:</strong> KvK Amsterdam 00000000.</li>
          <li><strong>VAT ID (EU):</strong> NL000000000B01.</li>
        </ul>
      </section>

      <section id="dispute">
        <h2>4. EU online dispute resolution</h2>
        <p>
          The European Commission provides a platform for online dispute resolution (ODR),
          available at
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener">
            https://ec.europa.eu/consumers/odr/
          </a>.
        </p>
        <p>
          We are not obliged and not willing to take part in dispute-resolution procedures
          before a consumer arbitration board.
        </p>
      </section>

      <section id="liability">
        <h2>5. Liability for content &amp; links</h2>
        <p>
          The contents of our pages have been created with the utmost care. However, we
          cannot guarantee the contents' accuracy, completeness or topicality. In
          accordance with § 7 (1) TMG we are responsible for our own content on these
          pages under the general laws. Under §§ 8 to 10 TMG, however, we are not under
          obligation to monitor transmitted or stored third-party information or to
          investigate circumstances that indicate illegal activity.
        </p>
        <p>
          Our website may contain links to external websites of third parties. We have no
          influence on their contents and therefore cannot assume any liability for them.
          If we become aware of legal violations we will remove such links immediately.
        </p>
      </section>

      <section id="copyright">
        <h2>6. Copyright</h2>
        <p>
          The content and works created by the site operators on these pages are subject
          to German copyright law. Duplication, processing, distribution, or any form of
          commercialisation of such material beyond the scope of copyright law requires
          the prior written consent of its respective author or creator. See our
          <NuxtLink to="/copyright">Copyright &amp; DMCA policy</NuxtLink> for reporting
          infringement.
        </p>
      </section>

      <section id="contact">
        <h2>7. Contact</h2>
        <div class="contact-info">
          <p><strong>Legal:</strong> <a href="mailto:legal@moonmart.ai">legal@moonmart.ai</a></p>
          <p><strong>Privacy:</strong> <a href="mailto:privacy@moonmart.ai">privacy@moonmart.ai</a></p>
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
  { id: 'provider', label: '1. Provider' },
  { id: 'representatives', label: '2. Representatives' },
  { id: 'registration', label: '3. Registration & VAT' },
  { id: 'dispute', label: '4. EU dispute resolution' },
  { id: 'liability', label: '5. Liability' },
  { id: 'copyright', label: '6. Copyright' },
  { id: 'contact', label: '7. Contact' }
]

applySEO({
  title: 'Imprint | Moonmart',
  description: 'Legal notice and provider identification for Moonmart.',
  canonical: 'https://moonmart.ai/imprint',
  ogType: 'website'
})
</script>
