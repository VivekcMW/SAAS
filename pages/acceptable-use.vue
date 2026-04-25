<template>
  <LegalShell
    title="Acceptable Use Policy"
    eyebrow="Legal · Acceptable use"
    lede="The rules that keep Moonmart safe, useful and trustworthy for every buyer, vendor and visitor."
    :updated="updatedAt"
    contact-email="trust@moonmart.ai"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="scope">
        <h2>1. Scope</h2>
        <p>
          This Acceptable Use Policy (the "AUP") applies to everyone who interacts with
          Moonmart: buyers browsing the marketplace, vendors listing products, authors
          posting reviews, and developers using our APIs. It supplements our
          <NuxtLink to="/terms">Terms of Service</NuxtLink>.
        </p>
      </section>

      <section id="prohibited">
        <h2>2. Prohibited conduct</h2>
        <p>You agree not to use Moonmart to:</p>
        <ul>
          <li>Violate any applicable law, regulation or third-party right.</li>
          <li>Post false, misleading, defamatory, harassing, hateful, or sexually explicit content.</li>
          <li>Impersonate any person, company or affiliation you do not represent.</li>
          <li>Upload malware, exploits, or content that damages, disables or overburdens systems.</li>
          <li>Attempt to gain unauthorized access to any account, system, or data.</li>
          <li>Scrape, crawl, or harvest content at a rate or scale that disrupts the service.</li>
          <li>Interfere with security features, rate limits, or authentication mechanisms.</li>
          <li>Send unsolicited bulk messages, chain letters, or any form of spam.</li>
          <li>Resell, sublicense, or commercially exploit the service without written permission.</li>
        </ul>
      </section>

      <section id="content">
        <h2>3. Content standards</h2>
        <p>
          Reviews, listings and community posts must be truthful and based on first-hand
          experience. We remove content that is paid-for without disclosure, deceptive,
          violates the rights of others, or misrepresents a product's capabilities.
        </p>
      </section>

      <section id="vendor">
        <h2>4. Vendor conduct</h2>
        <p>Vendors additionally agree not to:</p>
        <ul>
          <li>Submit fake reviews or incentivize reviews without clear disclosure.</li>
          <li>Mislead buyers about pricing, availability, compliance, or integrations.</li>
          <li>Contact leads obtained through Moonmart for purposes unrelated to the listing.</li>
          <li>List products that infringe trademarks, patents, or copyrights.</li>
        </ul>
      </section>

      <section id="api">
        <h2>5. API &amp; automation</h2>
        <ul>
          <li>Respect documented rate limits and retry semantics.</li>
          <li>Do not train machine-learning models on our content without written permission.</li>
          <li>Identify your client with a descriptive User-Agent string.</li>
        </ul>
      </section>

      <section id="reporting">
        <h2>6. Reporting violations</h2>
        <p>
          If you see content or behavior that violates this policy, report it to
          <a href="mailto:trust@moonmart.ai">trust@moonmart.ai</a>. For security
          vulnerabilities, follow the
          <NuxtLink to="/security">responsible disclosure process</NuxtLink> instead.
        </p>
      </section>

      <section id="enforcement">
        <h2>7. Enforcement</h2>
        <p>
          Depending on severity and history, we may remove content, warn the account,
          temporarily suspend access, or permanently terminate the account and forward
          information to law-enforcement authorities. We aim to be proportionate, but
          egregious or repeated violations will result in permanent removal.
        </p>
      </section>

      <section id="changes">
        <h2>8. Changes</h2>
        <p>
          We may update this AUP as the service evolves. Material changes will be announced
          via the site and, for active accounts, by email.
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
  { id: 'scope', label: '1. Scope' },
  { id: 'prohibited', label: '2. Prohibited conduct' },
  { id: 'content', label: '3. Content standards' },
  { id: 'vendor', label: '4. Vendor conduct' },
  { id: 'api', label: '5. API & automation' },
  { id: 'reporting', label: '6. Reporting violations' },
  { id: 'enforcement', label: '7. Enforcement' },
  { id: 'changes', label: '8. Changes' }
]

applySEO({
  title: 'Acceptable Use Policy | Moonmart',
  description: 'The conduct, content and API rules that apply to every Moonmart user.',
  canonical: 'https://moonmart.ai/acceptable-use',
  ogType: 'website'
})
</script>
