<template>
  <LegalShell
    title="Subprocessors"
    eyebrow="Legal · Subprocessors"
    lede="The third-party providers Moonmart engages to deliver the service, in line with GDPR Article 28 and our Data Processing Agreement."
    :updated="updatedAt"
    contact-email="privacy@moonmart.ai"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="overview">
        <h2>1. Overview</h2>
        <p>
          A subprocessor is any third party that Moonmart uses to process customer personal
          data on our behalf. Before engaging a subprocessor, we evaluate their security,
          privacy and continuity practices, and bind them to contractual obligations at
          least as protective as our own.
        </p>
      </section>

      <section id="current">
        <h2>2. Current subprocessors</h2>
        <p>
          The table below reflects the subprocessors we engage today. Exact vendors may
          vary by region and plan; enterprise customers can request a tailored list as part
          of their <NuxtLink to="/dpa">Data Processing Agreement</NuxtLink>.
        </p>
        <div class="lic-table-wrap">
          <table class="lic-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Purpose</th>
                <th>Data location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cloud infrastructure provider</td>
                <td>Compute, storage, database hosting</td>
                <td>EU / US</td>
              </tr>
              <tr>
                <td>Content delivery network</td>
                <td>Static asset delivery, DDoS mitigation</td>
                <td>Global</td>
              </tr>
              <tr>
                <td>Transactional email provider</td>
                <td>Account, billing and product notifications</td>
                <td>EU / US</td>
              </tr>
              <tr>
                <td>Analytics provider</td>
                <td>Aggregated product usage analytics</td>
                <td>EU</td>
              </tr>
              <tr>
                <td>Error &amp; performance monitoring</td>
                <td>Diagnostic telemetry</td>
                <td>EU / US</td>
              </tr>
              <tr>
                <td>Customer support platform</td>
                <td>Support ticket management</td>
                <td>EU / US</td>
              </tr>
              <tr>
                <td>Payment processor</td>
                <td>Billing, invoicing, subscription management</td>
                <td>US / EU</td>
              </tr>
              <tr>
                <td>Identity provider</td>
                <td>Optional SSO for enterprise customers</td>
                <td>Customer-selected</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="lic-note">
          For the exact named entities in each row, request the current subprocessor
          schedule from <a href="mailto:privacy@moonmart.ai">privacy@moonmart.ai</a>.
          We treat vendor names as commercially sensitive and publish them under NDA.
        </p>
      </section>

      <section id="notifications">
        <h2>3. Change notifications</h2>
        <p>
          When we plan to engage a new subprocessor or replace an existing one, we will
          publish the change on this page and, for customers who have opted in, send an
          advance email notification at least <strong>30 days</strong> before the change
          takes effect.
        </p>
        <p>
          Enterprise customers under a signed DPA may reasonably object to a new
          subprocessor; in that case we will work with you in good faith to find a solution.
        </p>
      </section>

      <section id="subscribe">
        <h2>4. Subscribe to updates</h2>
        <p>
          To receive advance notice of subprocessor changes, email
          <a href="mailto:privacy@moonmart.ai">privacy@moonmart.ai</a> with the subject
          line "Subscribe: subprocessor updates" and the domain of your account.
        </p>
      </section>

      <section id="diligence">
        <h2>5. Due diligence</h2>
        <ul>
          <li>Security questionnaire and review of available audit reports (SOC 2, ISO 27001).</li>
          <li>Data processing terms with standard contractual clauses for international transfers.</li>
          <li>Minimum-necessary data principle: we share only what the vendor needs to function.</li>
          <li>Annual re-review of each engaged subprocessor.</li>
        </ul>
      </section>

      <section id="contact">
        <h2>6. Contact</h2>
        <div class="contact-info">
          <p><strong>Email:</strong> <a href="mailto:privacy@moonmart.ai">privacy@moonmart.ai</a></p>
          <p><strong>Related:</strong> <NuxtLink to="/dpa">Data Processing Agreement</NuxtLink> · <NuxtLink to="/privacy">Privacy Policy</NuxtLink></p>
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
  { id: 'overview', label: '1. Overview' },
  { id: 'current', label: '2. Current subprocessors' },
  { id: 'notifications', label: '3. Change notifications' },
  { id: 'subscribe', label: '4. Subscribe to updates' },
  { id: 'diligence', label: '5. Due diligence' },
  { id: 'contact', label: '6. Contact' }
]

applySEO({
  title: 'Subprocessors | Moonmart',
  description: 'The list of third-party subprocessors that Moonmart engages under GDPR Article 28.',
  canonical: 'https://moonmart.ai/subprocessors',
  ogType: 'website'
})
</script>

<style scoped>
.lic-table-wrap {
  overflow-x: auto;
  border: 0.5px solid var(--b1);
  border-radius: var(--r-md);
  margin: 0 0 1.5rem;
}
.lic-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
  margin: 0;
}
.lic-table th,
.lic-table td {
  padding: 0.7rem 0.9rem;
  text-align: left;
  border-bottom: 0.5px solid var(--b1);
}
.lic-table tbody tr:last-child td { border-bottom: none; }
.lic-table th {
  background: var(--mm-s2);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mm-slate);
}
.lic-note {
  font-size: 0.875rem;
  color: var(--mm-slate);
  font-style: italic;
}
</style>
