<template>
  <LegalShell
    title="Service Level Agreement"
    eyebrow="Legal · SLA"
    lede="Our uptime commitment, exclusions and service-credit remedy for eligible paid plans."
    :updated="updatedAt"
    contact-email="support@saasworld.com"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="scope">
        <h2>1. Scope</h2>
        <p>
          This Service Level Agreement ("SLA") applies to customers on a <strong>paid</strong>
          SaaSWorld plan that is in good standing. It does not apply to free trials, beta
          features or add-ons expressly labelled as "early access".
        </p>
      </section>

      <section id="definitions">
        <h2>2. Definitions</h2>
        <ul>
          <li><strong>Service</strong> — the core SaaSWorld web application and API available under the customer's plan.</li>
          <li><strong>Downtime</strong> — minutes during which the Service is unavailable, excluding the events listed in §5.</li>
          <li><strong>Monthly uptime %</strong> = (total minutes in month − downtime) ÷ total minutes × 100.</li>
          <li><strong>Monthly fee</strong> — the recurring fee paid for the affected service in the month of the incident.</li>
        </ul>
      </section>

      <section id="commitment">
        <h2>3. Uptime commitment</h2>
        <p>
          SaaSWorld commits to a monthly uptime percentage of <strong>99.9%</strong> for
          Business and Enterprise plans, and <strong>99.5%</strong> for Starter plans.
          Real-time status is published at <NuxtLink to="/status">/status</NuxtLink>.
        </p>
      </section>

      <section id="credits">
        <h2>4. Service credits</h2>
        <p>
          If we fall below the committed uptime in a calendar month, you may request a
          service credit calculated as a percentage of that month's fee:
        </p>
        <div class="lic-table-wrap">
          <table class="lic-table">
            <thead>
              <tr>
                <th>Monthly uptime</th>
                <th>Service credit</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>&lt; 99.9% and ≥ 99.0%</td><td>10% of monthly fee</td></tr>
              <tr><td>&lt; 99.0% and ≥ 95.0%</td><td>25% of monthly fee</td></tr>
              <tr><td>&lt; 95.0%</td><td>50% of monthly fee</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Credits are issued against future invoices and cannot be redeemed for cash. The
          aggregate credit in any month will not exceed the monthly fee for that service.
          Credits are your <strong>sole and exclusive remedy</strong> for any failure to
          meet the SLA.
        </p>
      </section>

      <section id="exclusions">
        <h2>5. Exclusions</h2>
        <p>Downtime does <strong>not</strong> include unavailability caused by:</p>
        <ul>
          <li>Scheduled maintenance announced at least 48 hours in advance.</li>
          <li>Emergency maintenance necessary to preserve the security or integrity of the Service.</li>
          <li>Factors outside our reasonable control (force majeure, internet outages, third-party network or DNS failures upstream of our network).</li>
          <li>Customer equipment, software, or other technology, including third-party integrations.</li>
          <li>Customer's acts or omissions, including breach of the Acceptable Use policy.</li>
          <li>Suspensions for non-payment or material breach.</li>
        </ul>
      </section>

      <section id="claim">
        <h2>6. How to claim a credit</h2>
        <p>
          To receive a credit you must request it within <strong>30 days</strong> of the end
          of the month in which the downtime occurred. Email
          <a href="mailto:support@saasworld.com">support@saasworld.com</a> with:
        </p>
        <ul>
          <li>Your account identifier.</li>
          <li>The dates and times of each downtime incident.</li>
          <li>A brief description of the impact on your use of the Service.</li>
        </ul>
        <p>We will respond within 10 business days.</p>
      </section>

      <section id="changes">
        <h2>7. Changes</h2>
        <p>
          We may update this SLA from time to time. Material changes for Enterprise
          customers will be communicated at least 30 days in advance and will not apply
          retroactively to the current term.
        </p>
      </section>

      <section id="contact">
        <h2>8. Contact</h2>
        <div class="contact-info">
          <p><strong>Support:</strong> <a href="mailto:support@saasworld.com">support@saasworld.com</a></p>
          <p><strong>Status:</strong> <NuxtLink to="/status">saasworld.com/status</NuxtLink></p>
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
  { id: 'scope', label: '1. Scope' },
  { id: 'definitions', label: '2. Definitions' },
  { id: 'commitment', label: '3. Uptime commitment' },
  { id: 'credits', label: '4. Service credits' },
  { id: 'exclusions', label: '5. Exclusions' },
  { id: 'claim', label: '6. How to claim' },
  { id: 'changes', label: '7. Changes' },
  { id: 'contact', label: '8. Contact' }
]

applySEO({
  title: 'Service Level Agreement | SaaSWorld',
  description: 'SaaSWorld uptime commitment, exclusions and service-credit remedy.',
  canonical: 'https://saasworld.com/sla',
  ogType: 'website'
})
</script>

<style scoped>
.lic-table-wrap {
  overflow-x: auto;
  border: 1px solid #f0efec;
  border-radius: 12px;
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
  border-bottom: 1px solid #f0efec;
}
.lic-table tbody tr:last-child td { border-bottom: none; }
.lic-table th {
  background: #fbfaf8;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #71717a;
}
</style>
