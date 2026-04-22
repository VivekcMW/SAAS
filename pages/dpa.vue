<template>
  <LegalShell
    title="Data Processing Agreement"
    eyebrow="Legal · DPA"
    lede="The data-processing terms that apply when SaaSWorld processes personal data on a customer's behalf."
    :updated="updatedAt"
    contact-email="privacy@saasworld.com"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="how">
        <h2>1. How to put a DPA in place</h2>
        <p>
          This page is a summary of our standard Data Processing Agreement (the "DPA"). The
          full executable document — including the EU Standard Contractual Clauses and UK
          International Data Transfer Addendum — is available as a PDF on request.
        </p>
        <div class="lic-callout">
          <p class="lic-callout__title">Request the signed DPA</p>
          <p>
            Email <a href="mailto:privacy@saasworld.com">privacy@saasworld.com</a> with
            your company name, the legal entity that will sign, and any special
            requirements. We return a pre-signed copy within <strong>2 business days</strong>.
            Most customers don't need to negotiate changes.
          </p>
        </div>
      </section>

      <section id="roles">
        <h2>2. Roles</h2>
        <p>
          For personal data you submit to the service, <strong>you are the controller</strong>
          and <strong>SaaSWorld is the processor</strong>, acting only on your documented
          instructions. For data we collect for our own purposes (e.g. billing), we are the
          independent controller — see our <NuxtLink to="/privacy">Privacy Policy</NuxtLink>.
        </p>
      </section>

      <section id="scope">
        <h2>3. Scope of processing</h2>
        <ul>
          <li><strong>Subject matter:</strong> provision of the SaaSWorld platform.</li>
          <li><strong>Duration:</strong> for the term of the underlying agreement plus any statutory retention.</li>
          <li><strong>Nature &amp; purpose:</strong> hosting, storage, backup, analytics, support and security monitoring.</li>
          <li><strong>Categories of data subjects:</strong> your employees, customers and other individuals whose data you submit.</li>
          <li><strong>Categories of personal data:</strong> identification, contact, account and usage data.</li>
        </ul>
      </section>

      <section id="obligations">
        <h2>4. Our obligations</h2>
        <ul>
          <li>Process personal data only on documented instructions from the customer.</li>
          <li>Ensure personnel are bound by confidentiality.</li>
          <li>Implement appropriate technical and organisational measures (see <NuxtLink to="/security">Security</NuxtLink>).</li>
          <li>Assist with data subject requests, DPIAs and prior consultations, to the extent reasonable.</li>
          <li>Notify the customer without undue delay of a personal data breach.</li>
          <li>Delete or return personal data on termination, except where retention is legally required.</li>
        </ul>
      </section>

      <section id="subprocessors">
        <h2>5. Subprocessors</h2>
        <p>
          Our current subprocessors are listed on the
          <NuxtLink to="/subprocessors">Subprocessors page</NuxtLink>. We will give at least
          30 days' prior notice of a new subprocessor. You may reasonably object in writing
          within that period; if we cannot resolve the objection, either party may terminate
          the relevant service.
        </p>
      </section>

      <section id="transfers">
        <h2>6. International transfers</h2>
        <p>
          Where personal data is transferred outside of its originating region, we rely on
          the following mechanisms:
        </p>
        <ul>
          <li>EU Standard Contractual Clauses (Commission Implementing Decision (EU) 2021/914).</li>
          <li>UK International Data Transfer Addendum.</li>
          <li>Swiss equivalents where applicable.</li>
          <li>Supplementary measures consistent with the <em>Schrems II</em> guidance.</li>
        </ul>
      </section>

      <section id="security">
        <h2>7. Security measures</h2>
        <p>
          The technical and organisational measures described at
          <NuxtLink to="/security">/security</NuxtLink> form Annex II of our DPA and may be
          updated from time to time, provided the overall level of protection is not
          reduced.
        </p>
      </section>

      <section id="breach">
        <h2>8. Breach notification</h2>
        <p>
          If SaaSWorld becomes aware of a personal data breach affecting your data, we will
          notify you without undue delay — in practice, within <strong>72 hours</strong> of
          confirmation. Notifications include the nature of the breach, categories and
          approximate number of affected records, likely consequences, and the measures
          taken or proposed.
        </p>
      </section>

      <section id="audit">
        <h2>9. Audit rights</h2>
        <p>
          Customers may request copies of our most recent SOC 2 / ISO 27001 reports and
          security questionnaires under NDA. On-site audits are available on reasonable
          notice and subject to mutually agreed scope and cost.
        </p>
      </section>

      <section id="term">
        <h2>10. Term &amp; deletion</h2>
        <p>
          The DPA is effective for as long as we process personal data on your behalf. On
          termination, we delete or return the personal data at your election within 30
          days, except where retention is required by law. Back-ups are overwritten on our
          regular rotation cycle.
        </p>
      </section>

      <section id="contact">
        <h2>11. Contact</h2>
        <div class="contact-info">
          <p><strong>Privacy team:</strong> <a href="mailto:privacy@saasworld.com">privacy@saasworld.com</a></p>
          <p><strong>DPO (EU):</strong> <a href="mailto:dpo@saasworld.com">dpo@saasworld.com</a></p>
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
  { id: 'how', label: '1. How to sign a DPA' },
  { id: 'roles', label: '2. Roles' },
  { id: 'scope', label: '3. Scope of processing' },
  { id: 'obligations', label: '4. Our obligations' },
  { id: 'subprocessors', label: '5. Subprocessors' },
  { id: 'transfers', label: '6. International transfers' },
  { id: 'security', label: '7. Security measures' },
  { id: 'breach', label: '8. Breach notification' },
  { id: 'audit', label: '9. Audit rights' },
  { id: 'term', label: '10. Term & deletion' },
  { id: 'contact', label: '11. Contact' }
]

applySEO({
  title: 'Data Processing Agreement | SaaSWorld',
  description: 'SaaSWorld\'s Data Processing Agreement summary, GDPR roles, transfers and subprocessors.',
  canonical: 'https://saasworld.com/dpa',
  ogType: 'website'
})
</script>

<style scoped>
.lic-callout {
  background: var(--sw-primary-soft, #fff1e6);
  border: 1px solid #f0d9bf;
  border-left: 3px solid var(--sw-primary, #ff8838);
  border-radius: 14px;
  padding: 1.25rem 1.4rem;
  margin: 0 0 1.5rem;
}
.lic-callout__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0 0 0.5rem;
}
.lic-callout p { color: #52370f; }
</style>
