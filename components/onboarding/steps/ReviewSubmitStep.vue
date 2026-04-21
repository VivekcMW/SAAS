<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Review & Submit</h2>
      <p>Please review all the information below before submitting</p>
    </div>

    <div class="review-content">
      <!-- Basic Information Section -->
      <AccordionSection
        title="Basic Information"
        :default-expanded="true"
        :show-status="true"
        status="complete"
        :required="true"
      >
        <div class="section-header">
          <p class="section-description">Essential product information</p>
          <button class="edit-button" @click="goToStep(0)">
            Edit
          </button>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Product/Service Name</span>
            <span class="info-value">{{ formData.productName }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Product Website</span>
            <span class="info-value">
              <a :href="formData.productWebsite" target="_blank" rel="noopener noreferrer">
                {{ formData.productWebsite }}
              </a>
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">Category</span>
            <span class="info-value">
              <div class="categories-list">
                <span 
                  v-for="(category, index) in Array.isArray(formData.category) ? formData.category : [formData.category]" 
                  :key="index"
                  class="category-tag"
                >
                  {{ category }}
                </span>
              </div>
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">Search Keywords</span>
            <span class="info-value">
              <div class="keywords-list">
                <span 
                  v-for="(keyword, index) in formData.searchKeywords" 
                  :key="index"
                  class="keyword-tag"
                >
                  {{ keyword }}
                </span>
              </div>
            </span>
          </div>

          <div class="info-item full-width">
            <span class="info-label">Short Description</span>
            <span class="info-value">{{ formData.shortDescription }}</span>
          </div>
        </div>
      </AccordionSection>

      <!-- Product Details Section -->
      <AccordionSection
        title="Product Details"
        :default-expanded="false"
        :show-status="true"
        status="complete"
        :required="true"
      >
        <div class="section-header">
          <p class="section-description">Detailed product information and features</p>
          <button class="edit-button" @click="goToStep(2)">
            Edit
          </button>
        </div>

        <div class="info-item full-width">
          <span class="info-label">Full Description</span>
          <span class="info-value">{{ formData.fullDescription }}</span>
        </div>

        <!-- Platform Support -->
        <div class="info-grid" v-if="formData.platforms && formData.platforms.length > 0">
          <div class="info-item">
            <span class="info-label">Platform Support</span>
            <span class="info-value">
              <div class="platforms-list">
                <span 
                  v-for="(platform, index) in formData.platforms" 
                  :key="index"
                  class="platform-tag"
                >
                  {{ platform }}
                </span>
              </div>
            </span>
          </div>

          <div class="info-item" v-if="formData.applicationStage">
            <span class="info-label">Application Stage</span>
            <span class="info-value">{{ formData.applicationStage }}</span>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Pricing Models</span>
            <span class="info-value">
              <div class="pricing-models-list">
                <span 
                  v-for="(model, index) in formData.pricingModels" 
                  :key="index"
                  class="pricing-model-tag"
                >
                  {{ model }}
                </span>
              </div>
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">Target Audience</span>
            <span class="info-value">{{ formData.targetAudience }}</span>
          </div>
        </div>

        <div class="info-item full-width" v-if="formData.pricingDetails">
          <span class="info-label">Pricing Details</span>
          <span class="info-value">{{ formData.pricingDetails }}</span>
        </div>

        <!-- Features -->
        <div class="subsection">
          <h4>Key Features</h4>
          <div class="features-list">
            <div 
              v-for="(feature, index) in formData.features" 
              :key="index" 
              class="feature-card"
            >
              <h5>{{ feature.title }}</h5>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </AccordionSection>

      <!-- Company & Team Information Section -->
      <AccordionSection
        title="Company & Team Information"
        :default-expanded="false"
        :show-status="true"
        status="complete"
        :required="true"
      >
        <div class="section-header">
          <p class="section-description">Company details, contact information, and team members</p>
          <button class="edit-button" @click="goToStep(1)">
            Edit
          </button>
        </div>

        <!-- Company Information -->
        <div class="subsection">
          <h4>Company Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Company Name</span>
              <span class="info-value">{{ formData.companyName }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Company Website</span>
              <span class="info-value">
                <a :href="formData.companyWebsite" target="_blank" rel="noopener noreferrer">
                  {{ formData.companyWebsite }}
                </a>
              </span>
            </div>

            <div class="info-item">
              <span class="info-label">Company Size</span>
              <span class="info-value">{{ formData.companySize }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Year Founded</span>
              <span class="info-value">{{ formData.founded }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Location</span>
              <span class="info-value">{{ formData.companyLocation }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Industries</span>
              <span class="info-value">
                <div class="industries-list">
                  <span 
                    v-for="(industry, index) in formData.industries" 
                    :key="index"
                    class="industry-tag"
                  >
                    {{ industry }}
                  </span>
                </div>
              </span>
            </div>
          </div>
        </div>

        <!-- Social Media Links -->
        <div class="subsection" v-if="hasSocialLinks">
          <h4>Social Media Links</h4>
          <div class="social-links">
            <div class="social-link" v-if="formData.socialLinks.twitter">
              <a :href="`https://twitter.com/${formData.socialLinks.twitter}`" target="_blank">
                @{{ formData.socialLinks.twitter }}
              </a>
            </div>
            <div class="social-link" v-if="formData.socialLinks.facebook">
              <a :href="`https://facebook.com/${formData.socialLinks.facebook}`" target="_blank">
                {{ formData.socialLinks.facebook }}
              </a>
            </div>
            <div class="social-link" v-if="formData.socialLinks.linkedin">
              <a :href="`https://linkedin.com/company/${formData.socialLinks.linkedin}`" target="_blank">
                {{ formData.socialLinks.linkedin }}
              </a>
            </div>
            <div class="social-link" v-if="formData.socialLinks.instagram">
              <a :href="`https://instagram.com/${formData.socialLinks.instagram}`" target="_blank">
                @{{ formData.socialLinks.instagram }}
              </a>
            </div>
            <div class="social-link" v-if="formData.socialLinks.github">
              <a :href="`https://github.com/${formData.socialLinks.github}`" target="_blank">
                {{ formData.socialLinks.github }}
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="subsection">
          <h4>Contact Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Contact Name</span>
              <span class="info-value">{{ formData.contactName }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Role/Title</span>
              <span class="info-value">{{ formData.contactRole }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Email Address</span>
              <span class="info-value">
                <a :href="`mailto:${formData.contactEmail}`">{{ formData.contactEmail }}</a>
              </span>
            </div>

            <div class="info-item" v-if="formData.contactPhone">
              <span class="info-label">Phone Number</span>
              <span class="info-value">{{ formData.contactPhone }}</span>
            </div>

            <div class="info-item" v-if="formData.preferredContact">
              <span class="info-label">Preferred Contact Method</span>
              <span class="info-value">{{ formData.preferredContact }}</span>
            </div>
          </div>
        </div>

        <!-- Creator & Team Information -->
        <div class="subsection" v-if="hasCreatorInfo">
          <h4>Creator & Team Information</h4>
          
          <!-- Founder Information -->
          <div class="creator-info">
            <div class="founder-profile" v-if="formData.founderProfilePicture">
              <img :src="formData.founderProfilePicture" :alt="`${formData.founderName} profile`" class="profile-image" />
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Founder Name</span>
                <span class="info-value">{{ formData.founderName }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Founder Title</span>
                <span class="info-value">{{ formData.founderTitle }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Team Size</span>
                <span class="info-value">{{ formData.teamSize }}</span>
              </div>
            </div>

            <div class="info-item full-width" v-if="formData.founderBio">
              <span class="info-label">Founder Background</span>
              <span class="info-value">{{ formData.founderBio }}</span>
            </div>

            <div class="info-item full-width" v-if="formData.whyCreated">
              <span class="info-label">Why was this product created?</span>
              <span class="info-value">{{ formData.whyCreated }}</span>
            </div>

            <!-- Founder Social Media -->
            <div class="founder-social" v-if="hasFounderSocial">
              <h5>Founder Social Media & Website</h5>
              <div class="social-links">
                <div class="social-link" v-if="formData.founderSocial?.linkedin">
                  <a :href="`https://linkedin.com/in/${formData.founderSocial.linkedin}`" target="_blank">
                    {{ formData.founderSocial.linkedin }}
                  </a>
                </div>
                <div class="social-link" v-if="formData.founderSocial?.twitter">
                  <a :href="`https://twitter.com/${formData.founderSocial.twitter}`" target="_blank">
                    @{{ formData.founderSocial.twitter }}
                  </a>
                </div>
                <div class="social-link" v-if="formData.founderSocial?.github">
                  <a :href="`https://github.com/${formData.founderSocial.github}`" target="_blank">
                    {{ formData.founderSocial.github }}
                  </a>
                </div>
                <div class="social-link" v-if="formData.founderSocial?.instagram">
                  <a :href="`https://instagram.com/${formData.founderSocial.instagram}`" target="_blank">
                    @{{ formData.founderSocial.instagram }}
                  </a>
                </div>
                <div class="social-link" v-if="formData.founderSocial?.website">
                  <a :href="formData.founderSocial.website" target="_blank">
                    Personal Website
                  </a>
                </div>
                <div class="social-link" v-if="formData.founderSocial?.blog">
                  <a :href="formData.founderSocial.blog" target="_blank">
                    Blog/Portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Team Members -->
          <div class="team-members" v-if="hasTeamMembers">
            <h5>Team Members</h5>
            <div class="team-members-grid">
              <div 
                v-for="(member, index) in formData.teamMembers.filter((m: any) => m.name && m.name.trim() !== '')" 
                :key="index" 
                class="team-member-card"
              >
                <div class="member-profile" v-if="member.profilePicture">
                  <img :src="member.profilePicture" :alt="`${member.name} profile`" class="profile-image small" />
                </div>
                <div class="member-info">
                  <h6>{{ member.name }}</h6>
                  <p class="member-role" v-if="member.role">{{ member.role }}</p>
                  <p class="member-bio" v-if="member.bio">{{ member.bio }}</p>
                  
                  <!-- Member Social Links -->
                  <div class="member-social" v-if="hasMemberSocial(member)">
                    <div class="social-links small">
                      <a v-if="member.social?.linkedin" :href="`https://linkedin.com/in/${member.social.linkedin}`" target="_blank" class="social-link small">
                        LinkedIn
                      </a>
                      <a v-if="member.social?.twitter" :href="`https://twitter.com/${member.social.twitter}`" target="_blank" class="social-link small">
                        Twitter
                      </a>
                      <a v-if="member.social?.github" :href="`https://github.com/${member.social.github}`" target="_blank" class="social-link small">
                        GitHub
                      </a>
                      <a v-if="member.social?.instagram" :href="`https://instagram.com/${member.social.instagram}`" target="_blank" class="social-link small">
                        Instagram
                      </a>
                      <a v-if="member.social?.website" :href="member.social.website" target="_blank" class="social-link small">
                        Website
                      </a>
                      <a v-if="member.social?.blog" :href="member.social.blog" target="_blank" class="social-link small">
                        Blog
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AccordionSection>

      <!-- Testimonials Section -->
      <AccordionSection
        title="Testimonials"
        :default-expanded="false"
        :show-status="true"
        :status="hasTestimonials ? 'complete' : 'incomplete'"
        v-if="hasTestimonials"
      >
        <div class="section-header">
          <p class="section-description">Customer testimonials and social proof</p>
          <button class="edit-button" @click="goToStep(3)">
            Edit
          </button>
        </div>

        <div class="testimonials-list">
          <div 
            v-for="(item, index) in formData.testimonials.filter((t: any) => t && t.author && t.content)" 
            :key="index" 
            class="testimonial-card"
          >
            <div class="testimonial-header" v-if="item.customerPhoto">
              <img :src="item.customerPhoto" :alt="`${item.author} photo`" class="customer-photo" />
            </div>
            <div class="testimonial-content">
              <p>"{{ item.content }}"</p>
            </div>
            <div class="testimonial-author">
              <div>
                <strong>{{ item.author }}</strong>
                <span v-if="item.role || item.company">
                  - {{ item.role }}{{ item.role && item.company ? ', ' : '' }}{{ item.company }}
                </span>
              </div>
            </div>
            <div class="testimonial-proof" v-if="item.proofScreenshot">
              <img :src="item.proofScreenshot" alt="Testimonial proof" class="proof-screenshot" />
            </div>
          </div>
        </div>
      </AccordionSection>

      <!-- Media Assets Section -->
      <AccordionSection
        title="Media Assets"
        :default-expanded="false"
        :show-status="true"
        :status="hasMediaAssets ? 'complete' : 'incomplete'"
      >
        <div class="section-header">
          <p class="section-description">Product logo, screenshots, and promotional materials</p>
          <button class="edit-button" @click="goToStep(4)">
            Edit
          </button>
        </div>

        <!-- Logo -->
        <div class="subsection">
          <h4>Product Logo</h4>
          <div class="media-preview logo-preview" v-if="logoPreview">
            <img :src="logoPreview" alt="Product Logo" />
          </div>
          <p v-else class="empty-media">No logo uploaded</p>
        </div>

        <!-- Screenshots -->
        <div class="subsection">
          <h4>Product Screenshots</h4>
          <div class="screenshots-grid" v-if="screenshotPreviews.length > 0">
            <div 
              v-for="(preview, index) in screenshotPreviews" 
              :key="index" 
              class="screenshot-item"
            >
              <img :src="preview" :alt="`Screenshot ${index + 1}`" />
            </div>
          </div>
          <p v-else class="empty-media">No screenshots uploaded</p>
        </div>

        <!-- Video -->
        <div class="subsection" v-if="hasVideo">
          <h4>Product Video</h4>
          <div v-if="formData.videos && formData.videos.length > 0" class="video-info">
            <p>
              <strong>Source:</strong> {{ videoSourceName }}
              <br>
              <strong>URL:</strong> <a :href="formData.videos[0].url" target="_blank">{{ formData.videos[0].url }}</a>
            </p>
          </div>
        </div>
      </AccordionSection>

      <!-- Agreements & Submission Section -->
      <AccordionSection
        title="Agreements & Submission"
        :default-expanded="true"
        :show-status="true"
        status="complete"
        :required="true"
      >
        <div class="section-header">
          <p class="section-description">Review agreements and additional notes</p>
        </div>

        <div class="info-item full-width" v-if="formData.additionalNotes">
          <span class="info-label">Additional Notes</span>
          <span class="info-value">{{ formData.additionalNotes }}</span>
        </div>

        <div class="subsection">
          <h4>Agreements</h4>
          <div class="agreements-list">
            <div class="agreement-item">
              <span class="agreement-status">{{ formData.termsAgreement ? '✓' : '✗' }}</span>
              <span>Terms of Service and Privacy Policy</span>
            </div>

            <div class="agreement-item">
              <span class="agreement-status">{{ formData.marketingConsent ? '✓' : '✗' }}</span>
              <span>Marketing Communications</span>
            </div>
          </div>
        </div>

        <div class="submission-note">
          <p>
            Please review all information above carefully before submitting. 
            Once submitted, your product listing will be reviewed by our team 
            before being published on the SaaSWorld platform.
          </p>
        </div>
      </AccordionSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import AccordionSection from '~/components/AccordionSection.vue';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-data', 'submit-step', 'go-back']);

// Computed properties for checking data
const hasSocialLinks = computed(() => {
  const { socialLinks } = props.formData;
  return socialLinks && (
    socialLinks.twitter || 
    socialLinks.facebook || 
    socialLinks.linkedin || 
    socialLinks.instagram || 
    socialLinks.github
  );
});

const hasTestimonials = computed(() => {
  return props.formData.testimonials && 
    Array.isArray(props.formData.testimonials) && 
    props.formData.testimonials.some(
      (t: { author?: string, content?: string }) => t && t.author && t.content
    );
});

const hasVideo = computed(() => {
  return props.formData.videos && props.formData.videos.length > 0;
});

const hasMediaAssets = computed(() => {
  return props.formData.logo || 
    (props.formData.screenshots && props.formData.screenshots.length > 0) ||
    hasVideo.value;
});

const hasCreatorInfo = computed(() => {
  return props.formData.founderName || 
    props.formData.founderTitle || 
    props.formData.founderBio ||
    props.formData.teamSize ||
    props.formData.whyCreated;
});

const hasFounderSocial = computed(() => {
  const social = props.formData.founderSocial;
  return social && (
    social.linkedin || 
    social.twitter || 
    social.github || 
    social.instagram ||
    social.website ||
    social.blog
  );
});

const hasTeamMembers = computed(() => {
  return props.formData.teamMembers && 
    Array.isArray(props.formData.teamMembers) && 
    props.formData.teamMembers.some(
      (member: { name?: string, role?: string }) => member && member.name && member.name.trim() !== ''
    );
});

const hasMemberSocial = (member: any) => {
  const social = member.social;
  return social && (
    social.linkedin || 
    social.twitter || 
    social.github || 
    social.instagram ||
    social.website ||
    social.blog
  );
};

const videoSourceName = computed(() => {
  if (!props.formData.videos || props.formData.videos.length === 0) return '';
  return props.formData.videos[0].type === 'youtube' ? 'YouTube' : 'Vimeo';
});

// Create preview URLs for logo and screenshots
const logoPreview = ref<string | null>(null);
const screenshotPreviews = ref<string[]>([]);

onMounted(() => {
  // Create preview URLs for images
  if (props.formData.logo) {
    logoPreview.value = URL.createObjectURL(props.formData.logo);
  }
  
  if (props.formData.screenshots && props.formData.screenshots.length > 0) {
    screenshotPreviews.value = props.formData.screenshots.map((file: File) => URL.createObjectURL(file));
  }
});

// Navigation to edit specific sections
const goToStep = (stepIndex: number) => {
  emit('go-back');
  // The parent will handle actual navigation to the requested step
  // We just need to emit the go-back event
};

// Submit the form
const submitStep = () => {
  emit('submit-step');
};
</script>

<style scoped>
.step-container {
  padding: var(--spacing-xl);
}

.step-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.step-header h2 {
  font-size: 1.75rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.step-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.review-content {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.section-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
  font-style: italic;
}

.edit-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-300);
  background-color: var(--light-color);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.edit-button:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg) var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.info-value {
  font-size: 1rem;
  color: var(--text-primary);
}

.info-value a {
  color: var(--primary-color);
  text-decoration: none;
}

.info-value a:hover {
  text-decoration: underline;
}

.subsection {
  margin-top: var(--spacing-lg);
}

.subsection h4 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.social-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-gray);
}

.social-link a {
  color: var(--text-primary);
  text-decoration: none;
}

.social-link a:hover {
  text-decoration: underline;
}

.features-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.feature-card {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-gray);
}

.feature-card h5 {
  font-size: 1rem;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.feature-card p {
  font-size: 0.95rem;
  margin: 0;
  color: var(--text-secondary);
}

.testimonials-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.testimonial-card {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-gray);
}

.testimonial-content {
  margin-bottom: var(--spacing-sm);
}

.testimonial-content p {
  font-style: italic;
  font-size: 0.95rem;
  margin: 0;
  color: var(--text-secondary);
}

.testimonial-author {
  font-size: 0.9rem;
  text-align: right;
}

.media-preview {
  margin-top: var(--spacing-sm);
}

.logo-preview {
  width: 150px;
  height: 150px;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.screenshot-item {
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 1px solid var(--color-gray-300);
  aspect-ratio: 16 / 9;
}

.screenshot-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-media {
  color: var(--text-secondary);
  font-style: italic;
  margin: var(--spacing-md) 0;
}

.video-info {
  background-color: var(--bg-gray);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-sm);
}

.video-info p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.agreements-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.agreement-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.agreement-status {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.agreement-status:contains('✓') {
  background-color: var(--color-success);
  color: white;
}

.agreement-status:contains('✗') {
  background-color: var(--color-error);
  color: white;
}

.submission-note {
  background-color: var(--bg-gray);
  border-left: 4px solid var(--primary-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin: var(--spacing-xl) 0;
}

.submission-note p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: var(--light-color);
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--light-color);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

/* Custom styled tags for pricing models, industries, categories, keywords, and platforms */
.pricing-models-list,
.industries-list,
.categories-list,
.keywords-list,
.platforms-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.pricing-model-tag,
.industry-tag,
.category-tag,
.keyword-tag,
.platform-tag {
  display: inline-block;
  padding: 4px 10px;
  background-color: rgba(var(--primary-color-rgb), 0.08);
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  color: var(--primary-color);
  font-weight: 500;
}

/* Profile Images */
.profile-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-gray-200);
}

.profile-image.small {
  width: 50px;
  height: 50px;
}

/* Creator Information */
.creator-info {
  background-color: var(--bg-gray);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

.founder-profile {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.founder-social {
  margin-top: var(--spacing-lg);
}

.founder-social h5 {
  font-size: 1rem;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

/* Team Members */
.team-members {
  margin-top: var(--spacing-lg);
}

.team-members h5 {
  font-size: 1rem;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.team-members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.team-member-card {
  background-color: var(--light-color);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.member-profile {
  margin-bottom: var(--spacing-md);
}

.member-info h6 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
}

.member-role {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  font-weight: 500;
}

.member-bio {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.4;
}

.member-social {
  margin-top: var(--spacing-sm);
}

/* Social Links */
.social-links.small {
  gap: var(--spacing-xs);
  justify-content: center;
}

.social-link.small {
  padding: var(--spacing-xs);
  font-size: 0.8rem;
}

/* Testimonial enhancements */
.testimonial-header {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.customer-photo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-gray-200);
}

.testimonial-proof {
  margin-top: var(--spacing-md);
  text-align: center;
}

.proof-screenshot {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-300);
  max-height: 200px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .step-container {
    padding: var(--spacing-lg);
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .edit-button {
    align-self: flex-end;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .features-list,
  .testimonials-list,
  .screenshots-grid,
  .team-members-grid {
    grid-template-columns: 1fr;
  }

  .social-links {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .social-links.small {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .team-member-card {
    text-align: left;
    align-items: flex-start;
  }

  .member-profile {
    align-self: center;
  }

  .creator-info {
    padding: var(--spacing-md);
  }

  .founder-profile {
    margin-bottom: var(--spacing-md);
  }
}
</style>
