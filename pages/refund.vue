<template>
  <LegalShell
    title="Refund &amp; cancellation policy"
    eyebrow="Legal · Billing"
    lede="How cancellations, refunds and proration work on SaaSWorld subscriptions."
    :updated="updatedAt"
    contact-email="billing@saasworld.com"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="overview">
        <h2>1. Overview</h2>
        <p>
          We want you to be confident signing up. This page explains when you can cancel,
          when you're entitled to a refund, and how to request one. Anything not covered
          here defaults to the terms of your <NuxtLink to="/terms">subscription agreement</NuxtLink>.
        </p>
      </section>

      <section id="cooling">
        <h2>2. 14-day cooling-off (EU / UK consumers)</h2>
        <p>
          If you are a consumer in the European Union or United Kingdom, you may withdraw
          from your subscription within <strong>14 days</strong> of purchase without giving
          any reason. We will refund the full amount within 14 days of receiving your
          withdrawal notice.
        </p>
        <p>
          By starting to use the Service during the cooling-off period you expressly
          consent to immediate performance and acknowledge that you lose the right of
          withdrawal once the service has been fully performed. If you used the service
          in part, we may deduct a proportionate amount.
        </p>
      </section>

      <section id="monthly">
        <h2>3. Monthly subscriptions</h2>
        <p>
          Monthly plans renew automatically until cancelled. You can cancel at any time
          from <em>Billing → Manage subscription</em>. Cancellation takes effect at the end
          of the current billing period, and you retain access until then. Monthly
          subscriptions are <strong>not</strong> refunded on a pro-rata basis for the
          remainder of the paid period.
        </p>
      </section>

      <section id="annual">
        <h2>4. Annual subscriptions</h2>
        <p>
          Annual plans are paid up-front at a discount. If you cancel an annual plan:
        </p>
        <ul>
          <li>Within 14 days of a new purchase or an annual renewal: we will refund the unused portion in full.</li>
          <li>After 14 days: cancellation takes effect at the end of the annual term and no partial refund is due, unless local law requires otherwise.</li>
          <li>Enterprise agreements: refer to the commercial terms in your order form.</li>
        </ul>
      </section>

      <section id="non-refundable">
        <h2>5. Non-refundable items</h2>
        <p>The following are not eligible for refund:</p>
        <ul>
          <li>One-off professional services and onboarding fees, once delivery has started.</li>
          <li>Third-party fees (payment processor fees, marketplace payouts).</li>
          <li>Add-ons consumed in the billing period (e.g. additional seats already used, usage-based overages).</li>
          <li>Subscriptions terminated by us for breach of the <NuxtLink to="/acceptable-use">Acceptable Use Policy</NuxtLink>.</li>
        </ul>
      </section>

      <section id="cancel">
        <h2>6. How to cancel</h2>
        <ol>
          <li>Sign in and open <em>Billing → Manage subscription</em>.</li>
          <li>Choose <em>Cancel subscription</em>.</li>
          <li>You'll receive an email confirming the effective date.</li>
        </ol>
        <p>
          If you can't access the billing UI (e.g. the account owner left your company),
          email <a href="mailto:billing@saasworld.com">billing@saasworld.com</a> from a
          domain email address and we will help.
        </p>
      </section>

      <section id="request">
        <h2>7. How to request a refund</h2>
        <p>
          Email <a href="mailto:billing@saasworld.com">billing@saasworld.com</a> with your
          account identifier, the invoice or payment reference, and a brief reason. Refunds
          are issued to the original payment method within <strong>5–10 business days</strong>
          of approval. Processing times on your bank's side may add a few additional days.
        </p>
      </section>

      <section id="chargeback">
        <h2>8. Chargebacks</h2>
        <p>
          Please contact us before filing a chargeback — most disputes can be resolved
          faster by email. We reserve the right to suspend accounts with an open
          chargeback until it is resolved.
        </p>
      </section>

      <section id="contact">
        <h2>9. Contact</h2>
        <div class="contact-info">
          <p><strong>Billing:</strong> <a href="mailto:billing@saasworld.com">billing@saasworld.com</a></p>
          <p><strong>Related:</strong> <NuxtLink to="/terms">Terms</NuxtLink> · <NuxtLink to="/sla">SLA</NuxtLink></p>
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
  { id: 'cooling', label: '2. 14-day cooling-off' },
  { id: 'monthly', label: '3. Monthly subscriptions' },
  { id: 'annual', label: '4. Annual subscriptions' },
  { id: 'non-refundable', label: '5. Non-refundable items' },
  { id: 'cancel', label: '6. How to cancel' },
  { id: 'request', label: '7. Request a refund' },
  { id: 'chargeback', label: '8. Chargebacks' },
  { id: 'contact', label: '9. Contact' }
]

applySEO({
  title: 'Refund & cancellation policy | SaaSWorld',
  description: 'SaaSWorld refund, cancellation and proration rules.',
  canonical: 'https://saasworld.com/refund',
  ogType: 'website'
})
</script>
