<template>
  <div class="algo-page container">
    <div class="algo-page__header">
      <NuxtLink to="/trust" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Trust &amp; Safety
      </NuxtLink>
      <h1>Review Authenticity Algorithm</h1>
      <p class="algo-page__lead">
        We are transparent about how we evaluate review quality. Every review receives an authenticity score (0–100)
        and a health score for each vendor. Here is exactly how we compute them.
      </p>
    </div>

    <!-- Authenticity score -->
    <section class="algo-section">
      <h2>Review Authenticity Score</h2>
      <p>Each individual review is scored 0–100 based on verifiable signals:</p>
      <table class="algo-table">
        <thead>
          <tr><th>Signal</th><th>Weight</th><th>Condition</th></tr>
        </thead>
        <tbody>
          <tr><td>Verified purchase token</td><td>+40</td><td>Reviewer presented a valid proof-of-purchase token</td></tr>
          <tr><td>Review length</td><td>+15</td><td>Body text is ≥ 100 characters</td></tr>
          <tr><td>Pros list</td><td>+10</td><td>At least one pro listed</td></tr>
          <tr><td>Cons list</td><td>+10</td><td>At least one con listed</td></tr>
          <tr><td>Use case</td><td>+10</td><td>Use case field is filled in</td></tr>
          <tr><td>User role</td><td>+8</td><td>Reviewer provided their role</td></tr>
          <tr><td>Company size</td><td>+7</td><td>Reviewer provided company size</td></tr>
        </tbody>
      </table>
      <div class="algo-formula">
        <strong>Formula:</strong>
        <code>score = (verified×0.40 + length_ok×0.15 + has_pros×0.10 + has_cons×0.10 + use_case×0.10 + role×0.08 + size×0.07) × 100</code>
      </div>
      <div class="algo-labels">
        <div class="label-row">
          <span class="badge badge--hv">Verified Purchase</span>
          <span>Score ≥ 80 (includes purchase token)</span>
        </div>
        <div class="label-row">
          <span class="badge badge--v">Verified</span>
          <span>Score ≥ 60</span>
        </div>
        <div class="label-row">
          <span class="badge badge--b">Basic</span>
          <span>Score ≥ 30</span>
        </div>
        <div class="label-row">
          <span class="badge badge--u">Unverified</span>
          <span>Score &lt; 30</span>
        </div>
      </div>
    </section>

    <!-- Vendor Health Score -->
    <section class="algo-section">
      <h2>Vendor Health Score</h2>
      <p>Each vendor receives a composite score (0–100) that reflects the quality and integrity of their review profile:</p>

      <div class="algo-formula">
        <strong>Formula:</strong>
        <code>score = (verified_pct × 40) + (response_rate × 30) + (freshness × 20) + (clean_flag_rate × 10)</code>
      </div>

      <table class="algo-table">
        <thead>
          <tr><th>Component</th><th>Max points</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Verified reviews %</td>
            <td>40</td>
            <td>Fraction of reviews with authenticity_label = verified or highly-verified</td>
          </tr>
          <tr>
            <td>Response rate</td>
            <td>30</td>
            <td>% of reviews where the vendor has responded (tracked as response_rate on vendor profile)</td>
          </tr>
          <tr>
            <td>Review freshness</td>
            <td>20</td>
            <td>Based on reviews published in the last 90 days; capped at full points if ≥ 5 recent reviews</td>
          </tr>
          <tr>
            <td>Clean flag rate</td>
            <td>10</td>
            <td>1 − (flagged_count / total reviews). Deductions for reviews hidden due to community flags</td>
          </tr>
        </tbody>
      </table>

      <div class="algo-labels">
        <div class="label-row"><span class="badge badge--excellent">Excellent</span><span>≥ 85</span></div>
        <div class="label-row"><span class="badge badge--good">Good</span><span>70–84</span></div>
        <div class="label-row"><span class="badge badge--fair">Fair</span><span>50–69</span></div>
        <div class="label-row"><span class="badge badge--poor">Poor</span><span>&lt; 50</span></div>
      </div>
    </section>

    <!-- Moderation -->
    <section class="algo-section">
      <h2>Community Moderation</h2>
      <p>Any user can flag a review as suspicious. Flags are categorised:</p>
      <ul>
        <li><strong>Fake review</strong> — reviewer has no apparent connection to the product</li>
        <li><strong>Spam</strong> — promotional content or irrelevant text</li>
        <li><strong>Conflict of interest</strong> — reviewer appears affiliated with the vendor</li>
        <li><strong>Offensive content</strong> — violates community guidelines</li>
      </ul>
      <p>When a review accumulates <strong>5 or more flags</strong> it is automatically hidden and queued for admin review. Our moderation team reviews flagged content within 48 hours.</p>
    </section>

    <div class="algo-page__footer">
      <p>Questions about this policy? <NuxtLink to="/contact">Contact us</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Review Authenticity Algorithm — SaasWorld Trust Center',
  description: 'Transparent explanation of how SaasWorld scores review authenticity and computes Vendor Health Scores.'
})
</script>

<style scoped>
.container { max-width: 860px; margin: 0 auto; padding: 2.5rem 1.5rem; }
.back-link { display: inline-flex; align-items: center; gap: 4px; font-size: 0.875rem; color: #6b7280; text-decoration: none; margin-bottom: 1rem; }
.back-link:hover { color: #4f46e5; }
.algo-page__header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
.algo-page__lead { color: #374151; font-size: 1rem; line-height: 1.65; margin-bottom: 2.5rem; max-width: 640px; }
.algo-section { margin-bottom: 3rem; }
.algo-section h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb; }
.algo-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
.algo-table th { text-align: left; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; }
.algo-table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
.algo-table tr:hover td { background: #f9fafb; }
.algo-formula { background: #1e1e2e; color: #cdd6f4; border-radius: 10px; padding: 1rem 1.25rem; margin: 1rem 0; font-size: 0.88rem; }
.algo-formula strong { display: block; color: #a6e3a1; margin-bottom: 4px; }
.algo-formula code { font-family: 'Fira Mono', monospace; }
.algo-labels { display: flex; flex-direction: column; gap: 8px; margin-top: 1rem; }
.label-row { display: flex; align-items: center; gap: 1rem; font-size: 0.9rem; }
.badge { display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 3px 10px; border-radius: 999px; min-width: 120px; text-align: center; }
.badge--hv       { background: #d1fae5; color: #065f46; }
.badge--v        { background: #dbeafe; color: #1d4ed8; }
.badge--b        { background: #fef3c7; color: #92400e; }
.badge--u        { background: #f3f4f6; color: #6b7280; }
.badge--excellent{ background: #d1fae5; color: #065f46; }
.badge--good     { background: #dbeafe; color: #1d4ed8; }
.badge--fair     { background: #fef3c7; color: #92400e; }
.badge--poor     { background: #fee2e2; color: #991b1b; }
.algo-section ul { padding-left: 1.5rem; line-height: 1.7; }
.algo-page__footer { border-top: 1px solid #e5e7eb; padding-top: 1.5rem; color: #6b7280; font-size: 0.9rem; }
.algo-page__footer a { color: #4f46e5; }
</style>
