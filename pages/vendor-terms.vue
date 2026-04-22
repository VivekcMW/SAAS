<template>
  <LegalShell
    title="Vendor terms"
    eyebrow="Legal · Vendors"
    lede="The rules for companies that list their SaaS products on the SaaSWorld marketplace."
    :updated="updatedAt"
    contact-email="vendors@saasworld.com"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="scope">
        <h2>1. Who these terms apply to</h2>
        <p>
          These Vendor Terms apply in addition to our <NuxtLink to="/terms">general Terms</NuxtLink>
          and <NuxtLink to="/acceptable-use">Acceptable Use Policy</NuxtLink> if you list a
          product, category, or service on SaaSWorld ("Vendor").
        </p>
      </section>

      <section id="listing">
        <h2>2. Listing requirements</h2>
        <ul>
          <li>You must be the owner of the listed product or a duly authorised representative.</li>
          <li>Listings must accurately describe features, pricing, integrations, support and limits.</li>
          <li>Screenshots and logos must be your own or properly licensed.</li>
          <li>Claims (e.g. compliance badges, customer counts, uptime) must be substantiated on request.</li>
          <li>You will update the listing promptly when material facts change.</li>
        </ul>
      </section>

      <section id="content">
        <h2>3. Content standards</h2>
        <p>Prohibited in listings, demos and ads:</p>
        <ul>
          <li>False, misleading or deceptive claims.</li>
          <li>Competitor disparagement without objective substantiation.</li>
          <li>Use of third-party trademarks in a confusing way.</li>
          <li>Content that violates our <NuxtLink to="/acceptable-use">Acceptable Use Policy</NuxtLink>.</li>
        </ul>
      </section>

      <section id="reviews">
        <h2>4. Reviews &amp; testimonials</h2>
        <ul>
          <li>You may not create, buy, trade, manipulate or incentivise reviews — except where the incentive is clearly and visibly disclosed in the review itself, in line with FTC / EU unfair-commercial-practices guidance.</li>
          <li>You may respond to reviews professionally. Personal attacks, threats or doxxing will result in vendor suspension.</li>
          <li>Verified-buyer reviews may be emphasised in our ranking algorithms.</li>
        </ul>
      </section>

      <section id="leads">
        <h2>5. Leads &amp; data</h2>
        <p>
          Leads that SaaSWorld delivers to you are personal data under GDPR / CCPA. You
          must process them under a lawful basis, honour opt-outs, respect data-subject
          rights, and refrain from onward transfer except to service providers under
          equivalent obligations. You are an <strong>independent controller</strong> with
          respect to leads, separate from any DPA that covers use of the platform itself.
        </p>
      </section>

      <section id="fees">
        <h2>6. Fees, payouts &amp; taxes</h2>
        <ul>
          <li>Subscription, listing and performance-based fees are defined in your order form or partner dashboard.</li>
          <li>Payouts are made on a recurring cycle to the bank account on file, net of fees and refunds.</li>
          <li>You are responsible for all applicable taxes on your sales and for providing valid tax documentation (W-9, W-8, VAT ID).</li>
        </ul>
      </section>

      <section id="ip">
        <h2>7. Intellectual property</h2>
        <p>
          You grant SaaSWorld a worldwide, non-exclusive, royalty-free licence to host,
          display, distribute and promote your listing content for the purposes of
          operating the marketplace. You retain ownership of your content.
        </p>
      </section>

      <section id="takedown">
        <h2>8. Takedown &amp; suspension</h2>
        <p>
          We may remove a listing or suspend a vendor account if we reasonably believe the
          vendor has breached these terms, the Acceptable Use Policy, or applicable law,
          or in response to valid legal process. We will provide notice where practical and
          allow an opportunity to remedy non-material breaches.
        </p>
      </section>

      <section id="term">
        <h2>9. Term &amp; termination</h2>
        <p>
          Either party may terminate the vendor relationship on 30 days' written notice.
          On termination, active listings are unpublished and pending payouts are settled
          according to the usual cycle, less any outstanding refunds or chargebacks.
        </p>
      </section>

      <section id="contact">
        <h2>10. Contact</h2>
        <div class="contact-info">
          <p><strong>Vendor operations:</strong> <a href="mailto:vendors@saasworld.com">vendors@saasworld.com</a></p>
          <p><strong>Billing:</strong> <a href="mailto:billing@saasworld.com">billing@saasworld.com</a></p>
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
  { id: 'listing', label: '2. Listing requirements' },
  { id: 'content', label: '3. Content standards' },
  { id: 'reviews', label: '4. Reviews & testimonials' },
  { id: 'leads', label: '5. Leads & data' },
  { id: 'fees', label: '6. Fees, payouts & taxes' },
  { id: 'ip', label: '7. Intellectual property' },
  { id: 'takedown', label: '8. Takedown & suspension' },
  { id: 'term', label: '9. Term & termination' },
  { id: 'contact', label: '10. Contact' }
]

applySEO({
  title: 'Vendor terms | SaaSWorld',
  description: 'Terms that apply to companies listing products on the SaaSWorld marketplace.',
  canonical: 'https://saasworld.com/vendor-terms',
  ogType: 'website'
})
</script>
