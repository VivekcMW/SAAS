<template>
  <LegalShell
    title="Copyright &amp; DMCA policy"
    eyebrow="Legal · Copyright"
    lede="How to report copyright infringement on SaaSWorld and how we respond under the Digital Millennium Copyright Act."
    :updated="updatedAt"
    contact-email="dmca@saasworld.com"
    :sections="tocSections"
  >
    <div class="prose prose-lg max-w-none">
      <section id="overview">
        <h2>1. Overview</h2>
        <p>
          SaaSWorld respects the intellectual property of others and expects its users to
          do the same. We respond to clear notices of alleged copyright infringement that
          comply with the Digital Millennium Copyright Act ("DMCA").
        </p>
      </section>

      <section id="notice">
        <h2>2. Filing a DMCA notice</h2>
        <p>
          If you believe content on SaaSWorld infringes your copyright, send a written
          notice to our Designated Agent (below) that includes <strong>all</strong> of the
          following:
        </p>
        <ol>
          <li>A physical or electronic signature of the copyright owner or authorized agent.</li>
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>
            Identification of the material that is claimed to be infringing, with sufficient
            detail (URLs) for us to locate it.
          </li>
          <li>Your contact information — address, telephone number and email.</li>
          <li>
            A statement that you have a good-faith belief that the use is not authorized by
            the copyright owner, its agent or the law.
          </li>
          <li>
            A statement, under penalty of perjury, that the information in the notice is
            accurate and that you are the owner or authorized to act on behalf of the owner.
          </li>
        </ol>
        <p>
          Incomplete notices will be returned unprocessed. Filing a knowingly false notice
          may result in liability for damages under 17 U.S.C. § 512(f).
        </p>
      </section>

      <section id="agent">
        <h2>3. Designated agent</h2>
        <div class="contact-info">
          <p><strong>Name:</strong> SaaSWorld DMCA Agent</p>
          <p><strong>Email:</strong> <a href="mailto:dmca@saasworld.com">dmca@saasworld.com</a></p>
          <p><strong>Address:</strong> SaaSWorld Inc., Attn: DMCA Agent, 123 Tech Street, San Francisco, CA 94105</p>
          <p><strong>Phone:</strong> +1 (555) 123-4567</p>
        </div>
      </section>

      <section id="counter">
        <h2>4. Counter-notice</h2>
        <p>
          If you believe your content was removed (or disabled) by mistake or
          misidentification, you may file a counter-notice containing:
        </p>
        <ol>
          <li>Your physical or electronic signature.</li>
          <li>Identification of the material removed and its former location.</li>
          <li>
            A statement, under penalty of perjury, that you have a good-faith belief the
            material was removed as a result of mistake or misidentification.
          </li>
          <li>
            Your name, address and telephone number; and a statement that you consent to the
            jurisdiction of the federal court where you reside (or, if outside the US, the
            Northern District of California) and that you will accept service from the
            original complainant.
          </li>
        </ol>
        <p>
          On receipt of a valid counter-notice we will forward it to the original
          complainant. If the complainant does not file suit within <strong>10–14 business
          days</strong>, we may restore the removed material.
        </p>
      </section>

      <section id="repeat">
        <h2>5. Repeat infringer policy</h2>
        <p>
          Consistent with 17 U.S.C. § 512(i), accounts that are the subject of repeated
          valid infringement notices will be terminated. We keep records of notices and
          apply this policy at our reasonable discretion.
        </p>
      </section>

      <section id="trademark">
        <h2>6. Trademark complaints</h2>
        <p>
          For trademark concerns — logos, brand names, confusingly similar listings — email
          <a href="mailto:legal@saasworld.com">legal@saasworld.com</a> with the registered
          mark, jurisdiction, the URL of the listing, and a description of the alleged
          infringement.
        </p>
      </section>

      <section id="contact">
        <h2>7. Contact</h2>
        <div class="contact-info">
          <p><strong>DMCA:</strong> <a href="mailto:dmca@saasworld.com">dmca@saasworld.com</a></p>
          <p><strong>Trademarks:</strong> <a href="mailto:legal@saasworld.com">legal@saasworld.com</a></p>
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
  { id: 'notice', label: '2. Filing a DMCA notice' },
  { id: 'agent', label: '3. Designated agent' },
  { id: 'counter', label: '4. Counter-notice' },
  { id: 'repeat', label: '5. Repeat infringer policy' },
  { id: 'trademark', label: '6. Trademark complaints' },
  { id: 'contact', label: '7. Contact' }
]

applySEO({
  title: 'Copyright & DMCA policy | SaaSWorld',
  description: 'How to report copyright infringement on SaaSWorld under the DMCA.',
  canonical: 'https://saasworld.com/copyright',
  ogType: 'website'
})
</script>
