<template>
  <LegalShell
    title="Security"
    eyebrow="Trust · Security"
    lede="How SaaSWorld protects customer data, responds to incidents, and welcomes reports from the security community."
    :updated="updatedAt"
    contact-email="security@saasworld.com"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="program">
        <h2>1. Our security program</h2>
        <p>
          SaaSWorld operates a defense-in-depth security program covering people, process
          and platform. Our practices are aligned with <strong>SOC 2 Type II</strong>,
          <strong>ISO 27001</strong> controls, and the principles of <strong>OWASP ASVS</strong>.
        </p>
        <p>
          Annual independent audits, continuous internal review, and a formal risk register
          keep the program current.
        </p>
      </section>

      <section id="infrastructure">
        <h2>2. Infrastructure &amp; hosting</h2>
        <ul>
          <li>Production services run in hardened, access-controlled cloud regions.</li>
          <li>All traffic is served over TLS 1.2+ with modern cipher suites only.</li>
          <li>Infrastructure is provisioned through reviewed infrastructure-as-code.</li>
          <li>Least-privilege IAM, MFA-enforced admin access, and time-bound credentials.</li>
        </ul>
      </section>

      <section id="data-protection">
        <h2>3. Data protection</h2>
        <ul>
          <li><strong>In transit:</strong> TLS 1.2+ everywhere, HSTS preloaded.</li>
          <li><strong>At rest:</strong> AES-256 encryption for databases, backups and object storage.</li>
          <li><strong>Secrets:</strong> stored in a managed secrets vault, never in source control.</li>
          <li><strong>Passwords:</strong> hashed with scrypt; never stored or transmitted in plain text.</li>
        </ul>
      </section>

      <section id="application">
        <h2>4. Application security</h2>
        <ul>
          <li>Mandatory peer review on every change shipped to production.</li>
          <li>Automated SAST, dependency scanning, and secret scanning on every commit.</li>
          <li>Periodic third-party penetration testing of public surfaces.</li>
          <li>Strict Content Security Policy, anti-CSRF tokens, and session hardening.</li>
        </ul>
      </section>

      <section id="access">
        <h2>5. Access control</h2>
        <ul>
          <li>Role-based access — staff access is limited to job function.</li>
          <li>MFA required on every internal system.</li>
          <li>Centralized identity with automatic de-provisioning on role change.</li>
          <li>All production access is logged and retained for audit.</li>
        </ul>
      </section>

      <section id="incident">
        <h2>6. Incident response</h2>
        <p>
          We maintain a written incident response plan with defined severities, an on-call
          rotation, and runbooks. Customer-impacting incidents are communicated on
          <NuxtLink to="/status">our status page</NuxtLink> and — where a security matter is
          involved — directly to affected customers within our contractual timelines.
        </p>
      </section>

      <section id="disclosure">
        <h2>7. Responsible disclosure</h2>
        <p>
          If you believe you have found a security vulnerability in SaaSWorld, we want to
          hear from you. We will not pursue legal action against researchers who act in good
          faith and follow this policy.
        </p>
        <h3>In scope</h3>
        <ul>
          <li>saasworld.com and any subdomain under our direct control</li>
          <li>Our public API endpoints</li>
        </ul>
        <h3>Out of scope</h3>
        <ul>
          <li>Third-party vendor products listed on the marketplace</li>
          <li>Denial-of-service, volumetric or social-engineering testing</li>
          <li>Findings from automated scanners without a reproducible impact</li>
        </ul>
        <h3>How to report</h3>
        <p>
          Email <a href="mailto:security@saasworld.com">security@saasworld.com</a> with a
          clear description, steps to reproduce, and any proof-of-concept. We will
          acknowledge within <strong>2 business days</strong> and aim to triage within
          <strong>5 business days</strong>. We credit reporters who request it.
        </p>
      </section>

      <section id="compliance">
        <h2>8. Compliance &amp; certifications</h2>
        <p>
          For the current list of reports, certifications, and questionnaires available
          under NDA, visit our <NuxtLink to="/trust">Trust Center</NuxtLink> or request them
          directly from <a href="mailto:security@saasworld.com">security@saasworld.com</a>.
        </p>
      </section>

      <section id="contact">
        <h2>9. Contact</h2>
        <div class="contact-info">
          <p><strong>Security team:</strong> <a href="mailto:security@saasworld.com">security@saasworld.com</a></p>
          <p><strong>PGP key:</strong> available on request</p>
          <p><strong>Response time:</strong> acknowledgement within 2 business days</p>
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
  { id: 'program', label: '1. Security program' },
  { id: 'infrastructure', label: '2. Infrastructure' },
  { id: 'data-protection', label: '3. Data protection' },
  { id: 'application', label: '4. Application security' },
  { id: 'access', label: '5. Access control' },
  { id: 'incident', label: '6. Incident response' },
  { id: 'disclosure', label: '7. Responsible disclosure' },
  { id: 'compliance', label: '8. Compliance' },
  { id: 'contact', label: '9. Contact' }
]

applySEO({
  title: 'Security | SaaSWorld',
  description: 'How SaaSWorld protects customer data, handles incidents, and works with the security community.',
  canonical: 'https://saasworld.com/security',
  ogType: 'website'
})
</script>
