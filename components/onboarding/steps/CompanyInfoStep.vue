<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Company, Contact & Creator Information</h2>
      <p>Tell us about your company, contact details, and the team behind your product</p>
    </div>

    <form @submit.prevent="submitStep">
      <!-- Company Information Section -->
      <AccordionSection
        title="Company Information"
        :default-expanded="true"
        :show-status="true"
        :status="companyInfoStatus"
        :required="true"
      >
        <div class="form-group">
          <label for="companyName">Company Name*</label>
          <input 
            type="text" 
            id="companyName" 
            v-model="localData.companyName" 
            required 
            placeholder="Enter your company name"
          />
        </div>

        <div class="form-group">
          <label for="companyWebsite">Company Website*</label>
          <input 
            type="url" 
            id="companyWebsite" 
            v-model="localData.companyWebsite" 
            required 
            placeholder="https://yourcompany.com"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="companySize">Company Size*</label>
            <select id="companySize" v-model="localData.companySize" required>
              <option value="" disabled>Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1001+">1001+ employees</option>
            </select>
          </div>

          <div class="form-group">
            <label for="founded">Year Founded*</label>
            <input 
              type="number" 
              id="founded" 
              v-model="localData.founded" 
              required 
              placeholder="YYYY"
              min="1900"
              :max="currentYear"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="companyLocation">Company Location*</label>
          <input 
            type="text" 
            id="companyLocation" 
            v-model="localData.companyLocation" 
            required 
            placeholder="City, Country"
          />
        </div>

        <div class="form-group">
          <label for="industries">Industries*</label>
          <div class="custom-multiselect" :class="{ active: isDropdownOpen }" ref="multiselectRef">
            <div class="multiselect-input" @click="toggleDropdown">
              <div v-if="localData.industries.length === 0" class="placeholder">
                Select industries
              </div>
              <div v-else class="selected-options">
                <span class="selected-count">{{ localData.industries.length }} selected</span>
              </div>
              <div class="dropdown-icon">
                <span>{{ isDropdownOpen ? '▲' : '▼' }}</span>
              </div>
            </div>
            
            <div v-if="isDropdownOpen" class="dropdown-container">
              <div class="search-container">
                <input 
                  type="text" 
                  placeholder="Search industries..." 
                  v-model="searchQuery" 
                  @click.stop
                  ref="searchInput"
                />
                <div class="dropdown-actions">
                  <button 
                    type="button" 
                    class="action-btn" 
                    @click.stop="selectAllIndustries"
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    class="action-btn" 
                    @click.stop="clearAllIndustries"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div class="options-container">
                <div 
                  v-for="industry in filteredIndustries" 
                  :key="industry" 
                  class="option-item"
                  @click.stop="toggleIndustry(industry)"
                >
                  <div class="checkbox" :class="{ checked: isIndustrySelected(industry) }">
                    <span v-if="isIndustrySelected(industry)">✓</span>
                  </div>
                  <span>{{ industry }}</span>
                </div>
                
                <div v-if="filteredIndustries.length === 0" class="no-results">
                  No industries found matching your search
                </div>
              </div>
            </div>
          </div>
          
          <div class="selected-industries" v-if="localData.industries.length > 0">
            <div 
              v-for="(industry, index) in localData.industries" 
              :key="index" 
              class="industry-tag"
            >
              <span>{{ industry }}</span>
                            <button 
                type="button" 
                class="remove-industry-btn"
                @click="removeIndustry(industry)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </AccordionSection>

      <!-- Social Media Links Section -->
      <AccordionSection
        title="Social Media Links"
        :default-expanded="false"
        :show-status="true"
        :status="socialMediaStatus"
      >
        <p class="section-description">Add your company's social media profiles to increase visibility and credibility</p>
        
        <div class="form-group">
          <label for="twitter">Twitter/X</label>
          <div class="input-with-icon">
            <span class="input-prefix">https://twitter.com/</span>
            <input 
              type="text" 
              id="twitter" 
              v-model="localData.socialLinks.twitter" 
              placeholder="username"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="linkedin">LinkedIn</label>
          <div class="input-with-icon">
            <span class="input-prefix">https://linkedin.com/company/</span>
            <input 
              type="text" 
              id="linkedin" 
              v-model="localData.socialLinks.linkedin" 
              placeholder="company-name"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="facebook">Facebook</label>
            <div class="input-with-icon">
              <span class="input-prefix">https://facebook.com/</span>
              <input 
                type="text" 
                id="facebook" 
                v-model="localData.socialLinks.facebook" 
                placeholder="username"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="instagram">Instagram</label>
            <div class="input-with-icon">
              <span class="input-prefix">https://instagram.com/</span>
              <input 
                type="text" 
                id="instagram" 
                v-model="localData.socialLinks.instagram" 
                placeholder="username"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="github">GitHub</label>
          <div class="input-with-icon">
            <span class="input-prefix">https://github.com/</span>
            <input 
              type="text" 
              id="github" 
              v-model="localData.socialLinks.github" 
              placeholder="organization"
            />
          </div>
        </div>
      </AccordionSection>

      <!-- Contact Information Section -->
      <AccordionSection
        title="Contact Information"
        :default-expanded="true"
        :show-status="true"
        :status="contactInfoStatus"
        :required="true"
      >
        <p class="section-description">Primary contact details for this product listing</p>
        
        <div class="form-row">
          <div class="form-group">
            <label for="contactName">Contact Name*</label>
            <input 
              type="text" 
              id="contactName" 
              v-model="localData.contactName" 
              required 
              placeholder="Enter your full name"
            />
          </div>

          <div class="form-group">
            <label for="contactRole">Role/Title*</label>
            <input 
              type="text" 
              id="contactRole" 
              v-model="localData.contactRole" 
              required 
              placeholder="E.g., CEO, Marketing Director"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="contactEmail">Email Address*</label>
            <input 
              type="email" 
              id="contactEmail" 
              v-model="localData.contactEmail" 
              required 
              placeholder="Enter your work email"
            />
          </div>

          <div class="form-group">
            <label for="contactPhone">Phone Number</label>
            <input 
              type="tel" 
              id="contactPhone" 
              v-model="localData.contactPhone" 
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="preferredContact">Preferred Contact Method*</label>
          <select id="preferredContact" v-model="localData.preferredContact" required>
            <option value="">Select preferred method</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="both">Both Email and Phone</option>
          </select>
        </div>
      </AccordionSection>

      <!-- Creator & Team Information Section -->
      <AccordionSection
        title="Creator & Team Information"
        :default-expanded="true"
        :show-status="true"
        :status="creatorInfoStatus"
        :required="true"
      >
        <p class="section-description">Tell us about the team behind your product</p>
        
        <div class="form-row">
          <div class="form-group">
            <label for="founderName">Founder Name*</label>
            <input 
              type="text" 
              id="founderName" 
              v-model="localData.founderName" 
              required 
              placeholder="Enter founder's name"
            />
          </div>

          <div class="form-group">
            <label for="founderTitle">Founder Title*</label>
            <input 
              type="text" 
              id="founderTitle" 
              v-model="localData.founderTitle" 
              required 
              placeholder="E.g., CEO & Founder, Co-Founder"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="founderBio">Founder Background*</label>
          <textarea 
            id="founderBio" 
            v-model="localData.founderBio" 
            required 
            placeholder="Tell us about the founder's background and experience"
            rows="3"
          ></textarea>
        </div>

        <!-- Founder Profile Picture -->
        <div class="form-group">
          <label for="founderProfilePicture">Founder Profile Picture (Optional)</label>
          <div class="profile-upload-area">
            <div v-if="localData.founderProfilePicture" class="profile-preview">
              <img :src="localData.founderProfilePicture" alt="Founder profile" class="profile-image" />
              <button type="button" class="remove-image-btn" @click="removeFounderProfilePicture">✕</button>
            </div>
            <div v-else class="upload-placeholder">
              <input 
                type="file" 
                id="founderProfilePicture" 
                @change="handleFounderProfilePictureUpload"
                accept="image/*"
                class="file-input"
              />
              <label for="founderProfilePicture" class="upload-label">
                Upload Profile Picture
              </label>
              <p class="upload-hint">JPG, PNG or GIF (max 5MB)</p>
            </div>
          </div>
        </div>

        <!-- Founder Social Media Links -->
        <div class="form-group">
          <label>Founder Social Media & Website (Optional)</label>
          <p class="field-hint">Professional profiles and personal website/blog</p>
          
          <div class="form-row">
            <div class="form-group">
              <label for="founderLinkedIn">LinkedIn</label>
              <div class="input-with-icon">
                <span class="input-prefix">linkedin.com/in/</span>
                <input 
                  id="founderLinkedIn"
                  v-model="localData.founderSocial.linkedin" 
                  placeholder="username"
                  type="text"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="founderTwitter">Twitter/X</label>
              <div class="input-with-icon">
                <span class="input-prefix">@</span>
                <input 
                  id="founderTwitter"
                  v-model="localData.founderSocial.twitter" 
                  placeholder="username"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="founderGithub">GitHub</label>
              <div class="input-with-icon">
                <span class="input-prefix">github.com/</span>
                <input 
                  id="founderGithub"
                  v-model="localData.founderSocial.github" 
                  placeholder="username"
                  type="text"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="founderInstagram">Instagram</label>
              <div class="input-with-icon">
                <span class="input-prefix">@</span>
                <input 
                  id="founderInstagram"
                  v-model="localData.founderSocial.instagram" 
                  placeholder="username"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="founderWebsite">Personal Website</label>
              <input 
                id="founderWebsite"
                v-model="localData.founderSocial.website" 
                placeholder="https://yourwebsite.com"
                type="url"
              />
            </div>

            <div class="form-group">
              <label for="founderBlog">Blog/Portfolio</label>
              <input 
                id="founderBlog"
                v-model="localData.founderSocial.blog" 
                placeholder="https://yourblog.com"
                type="url"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="teamSize">Team Size*</label>
          <select id="teamSize" v-model="localData.teamSize" required>
            <option value="">Select team size</option>
            <option value="solo">Solo founder</option>
            <option value="2-3">2-3 members</option>
            <option value="4-10">4-10 members</option>
            <option value="11-25">11-25 members</option>
            <option value="26-50">26-50 members</option>
            <option value="51+">51+ members</option>
          </select>
        </div>

        <div class="form-group">
          <label for="whyCreated">Why was this product created?*</label>
          <textarea 
            id="whyCreated" 
            v-model="localData.whyCreated" 
            required 
            placeholder="What problem does your product solve? What inspired you to create it?"
            rows="3"
          ></textarea>
        </div>
      </AccordionSection>

      <!-- Team Members & Co-Creators Section -->
      <AccordionSection
        title="Team Members & Co-Creators"
        :default-expanded="false"
        :show-status="true"
        :status="teamMembersStatus"
      >
        <p class="section-description">Add key team members and co-creators to showcase your team</p>
        
        <div 
          v-for="(member, index) in localData.teamMembers" 
          :key="index" 
          class="team-member-card"
        >
          <div class="team-member-header">
            <h4>{{ index === 0 ? 'Co-Creator / Key Team Member 1' : `Team Member ${index + 1}` }}</h4>
            <button 
              type="button" 
              class="remove-member-btn"
              v-if="localData.teamMembers.length > 1"
              @click="removeMember(index)"
              title="Remove team member"
            >
              ✕
            </button>
          </div>
          
          <!-- Team Member Profile Picture -->
          <div class="form-group">
            <label :for="`member-profile-${index}`">Profile Picture (Optional)</label>
            <div class="profile-upload-area">
              <div v-if="member.profilePicture" class="profile-preview">
                <img :src="member.profilePicture" :alt="`${member.name} profile`" class="profile-image" />
                <button type="button" class="remove-image-btn" @click="removeMemberProfilePicture(index)">✕</button>
              </div>
              <div v-else class="upload-placeholder">
                <input 
                  type="file" 
                  :id="`member-profile-${index}`" 
                  @change="handleMemberProfilePictureUpload($event, index)"
                  accept="image/*"
                  class="file-input"
                />
                <label :for="`member-profile-${index}`" class="upload-label">
                  Upload Profile Picture
                </label>
                <p class="upload-hint">JPG, PNG or GIF (max 5MB)</p>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label :for="`member-name-${index}`">Name</label>
              <input 
                :id="`member-name-${index}`" 
                v-model="member.name" 
                placeholder="Team member name"
                type="text"
              />
            </div>
            
            <div class="form-group">
              <label :for="`member-role-${index}`">Role/Title</label>
              <input 
                :id="`member-role-${index}`" 
                v-model="member.role" 
                placeholder="E.g., CTO, Co-Founder, Lead Designer"
                type="text"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label :for="`member-bio-${index}`">Background (Optional)</label>
            <textarea 
              :id="`member-bio-${index}`" 
              v-model="member.bio" 
              placeholder="Brief description of their background and contribution to the project"
              rows="2"
            ></textarea>
          </div>

          <!-- Social Media Links for Team Member -->
          <div class="form-group">
            <label>Social Media & Website (Optional)</label>
            <p class="field-hint">Professional profiles and personal websites/blogs</p>
            
            <div class="form-row">
              <div class="form-group">
                <label :for="`member-linkedin-${index}`">LinkedIn</label>
                <div class="input-with-icon">
                  <span class="input-prefix">linkedin.com/in/</span>
                  <input 
                    :id="`member-linkedin-${index}`"
                    v-model="member.social.linkedin" 
                    placeholder="username"
                    type="text"
                  />
                </div>
              </div>

              <div class="form-group">
                <label :for="`member-twitter-${index}`">Twitter/X</label>
                <div class="input-with-icon">
                  <span class="input-prefix">@</span>
                  <input 
                    :id="`member-twitter-${index}`"
                    v-model="member.social.twitter" 
                    placeholder="username"
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label :for="`member-github-${index}`">GitHub</label>
                <div class="input-with-icon">
                  <span class="input-prefix">github.com/</span>
                  <input 
                    :id="`member-github-${index}`"
                    v-model="member.social.github" 
                    placeholder="username"
                    type="text"
                  />
                </div>
              </div>

              <div class="form-group">
                <label :for="`member-instagram-${index}`">Instagram</label>
                <div class="input-with-icon">
                  <span class="input-prefix">@</span>
                  <input 
                    :id="`member-instagram-${index}`"
                    v-model="member.social.instagram" 
                    placeholder="username"
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label :for="`member-website-${index}`">Personal Website</label>
                <input 
                  :id="`member-website-${index}`"
                  v-model="member.social.website" 
                  placeholder="https://yourwebsite.com"
                  type="url"
                />
              </div>

              <div class="form-group">
                <label :for="`member-blog-${index}`">Blog/Portfolio</label>
                <input 
                  :id="`member-blog-${index}`"
                  v-model="member.social.blog" 
                  placeholder="https://yourblog.com"
                  type="url"
                />
              </div>
            </div>
          </div>
        </div>
        
        <button 
          type="button" 
          class="add-member-btn"
          @click="addMember"
        >
          + Add Team Member
        </button>
      </AccordionSection>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import AccordionSection from '~/components/AccordionSection.vue';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-data', 'submit-step', 'go-back']);

// Create a local copy of the data
const localData = reactive({
  companyName: props.formData.companyName || '',
  companyWebsite: props.formData.companyWebsite || '',
  companySize: props.formData.companySize || '',
  founded: props.formData.founded || '',
  companyLocation: props.formData.companyLocation || '',
  industries: props.formData.industries && props.formData.industries.length > 0 
    ? [...props.formData.industries] 
    : [],
  socialLinks: {
    twitter: props.formData.socialLinks?.twitter || '',
    facebook: props.formData.socialLinks?.facebook || '',
    linkedin: props.formData.socialLinks?.linkedin || '',
    instagram: props.formData.socialLinks?.instagram || '',
    github: props.formData.socialLinks?.github || ''
  },
  // Contact Information
  contactName: props.formData.contactName || '',
  contactRole: props.formData.contactRole || '',
  contactEmail: props.formData.contactEmail || '',
  contactPhone: props.formData.contactPhone || '',
  preferredContact: props.formData.preferredContact || '',
  // Creator/Team Information
  founderName: props.formData.founderName || '',
  founderTitle: props.formData.founderTitle || '',
  founderBio: props.formData.founderBio || '',
  founderProfilePicture: props.formData.founderProfilePicture || '',
  founderSocial: {
    linkedin: props.formData.founderSocial?.linkedin || '',
    twitter: props.formData.founderSocial?.twitter || '',
    github: props.formData.founderSocial?.github || '',
    instagram: props.formData.founderSocial?.instagram || '',
    website: props.formData.founderSocial?.website || '',
    blog: props.formData.founderSocial?.blog || ''
  },
  teamSize: props.formData.teamSize || '',
  whyCreated: props.formData.whyCreated || '',
  // Team Members
  teamMembers: props.formData.teamMembers && props.formData.teamMembers.length > 0 
    ? [...props.formData.teamMembers] 
    : [{ 
        name: '', 
        role: '', 
        bio: '',
        profilePicture: '',
        social: {
          linkedin: '',
          twitter: '',
          github: '',
          instagram: '',
          website: '',
          blog: ''
        }
      }]
});

// Get current year for the founded field max value
const currentYear = new Date().getFullYear();

// Industry options
const industriesList = [
  'Agriculture',
  'Automotive',
  'Banking & Finance',
  'Biotechnology',
  'Construction',
  'Consulting',
  'Consumer Goods',
  'Education',
  'Energy',
  'Entertainment',
  'Fashion',
  'Food & Beverage',
  'Gaming',
  'Government',
  'Healthcare',
  'Hospitality',
  'Information Technology',
  'Insurance',
  'Legal',
  'Manufacturing',
  'Marketing & Advertising',
  'Media',
  'Non-profit',
  'Pharmaceuticals',
  'Real Estate',
  'Retail',
  'Telecommunications',
  'Transportation',
  'Travel & Tourism',
  'Other'
];

// Multi-select dropdown functionality
const isDropdownOpen = ref(false);
const searchQuery = ref('');
const searchInput = ref<HTMLInputElement | null>(null);

// Filter industries based on search query
const filteredIndustries = computed(() => {
  if (!searchQuery.value) {
    return industriesList;
  }
  
  const query = searchQuery.value.toLowerCase();
  return industriesList.filter(industry => 
    industry.toLowerCase().includes(query)
  );
});

// Toggle dropdown visibility
const toggleDropdown = (event: Event) => {
  // Prevent event from bubbling up to document click handler
  event.stopPropagation();
  
  isDropdownOpen.value = !isDropdownOpen.value;
  
  // Focus on search input when dropdown opens
  if (isDropdownOpen.value) {
    setTimeout(() => {
      if (searchInput.value) {
        searchInput.value.focus();
      }
    }, 100);
  } else {
    searchQuery.value = '';
  }
};

// Check if an industry is selected
const isIndustrySelected = (industry: string) => {
  return localData.industries.includes(industry);
};

// Toggle industry selection
const toggleIndustry = (industry: string) => {
  const index = localData.industries.indexOf(industry);
  if (index === -1) {
    // Add industry
    localData.industries.push(industry);
  } else {
    // Remove industry
    localData.industries.splice(index, 1);
  }
};

// Remove an industry from the selection
const removeIndustry = (industry: string) => {
  const index = localData.industries.indexOf(industry);
  if (index !== -1) {
    localData.industries.splice(index, 1);
  }
};

// Select all industries (filtered ones if search is active)
const selectAllIndustries = () => {
  const industriesToAdd = filteredIndustries.value.filter(
    industry => !localData.industries.includes(industry)
  );
  
  if (industriesToAdd.length > 0) {
    localData.industries.push(...industriesToAdd);
  }
};

// Clear all selected industries
const clearAllIndustries = () => {
  localData.industries = [];
};

// Reference to the multiselect container
const multiselectRef = ref<HTMLElement | null>(null);

// Close dropdown when clicking outside
const closeDropdownOnClickOutside = (event: MouseEvent) => {
  if (!isDropdownOpen.value) return;
  
  // Check if click is inside the multiselect component
  if (multiselectRef.value && !multiselectRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
    searchQuery.value = '';
  }
};

// Register and unregister click event listener
onMounted(() => {
  document.addEventListener('click', closeDropdownOnClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdownOnClickOutside);
});

// Watch for changes in the local data and emit updates
watch(localData, (newVal) => {
  emit('update-data', { ...newVal });
}, { deep: true });

// Computed properties for section status
const companyInfoStatus = computed(() => {
  const requiredFields = ['companyName', 'companyWebsite', 'companySize', 'founded', 'companyLocation'];
  const basicFieldsValid = requiredFields.every(field => {
    const value = localData[field as keyof typeof localData];
    return value && value.toString().trim() !== '';
  });
  const industriesValid = localData.industries && localData.industries.length > 0;
  return (basicFieldsValid && industriesValid) ? 'complete' : 'required';
});

const socialMediaStatus = computed(() => {
  const socialLinks = Object.values(localData.socialLinks);
  const hasAnySocial = socialLinks.some(link => link && link.trim() !== '');
  return hasAnySocial ? 'complete' : 'incomplete';
});

const contactInfoStatus = computed(() => {
  const contactFields = ['contactName', 'contactRole', 'contactEmail', 'preferredContact'];
  const contactFieldsValid = contactFields.every(field => {
    const value = localData[field as keyof typeof localData];
    return value && value.toString().trim() !== '';
  });
  return contactFieldsValid ? 'complete' : 'required';
});

const creatorInfoStatus = computed(() => {
  const creatorFields = ['founderName', 'founderTitle', 'founderBio', 'teamSize', 'whyCreated'];
  const creatorFieldsValid = creatorFields.every(field => {
    const value = localData[field as keyof typeof localData];
    return value && value.toString().trim() !== '';
  });
  return creatorFieldsValid ? 'complete' : 'required';
});

const teamMembersStatus = computed(() => {
  const hasMembers = localData.teamMembers && localData.teamMembers.length > 0;
  const hasCompleteMember = localData.teamMembers.some(member => 
    member.name && member.name.trim() !== '' && member.role && member.role.trim() !== ''
  );
  if (hasMembers && hasCompleteMember) return 'complete';
  if (hasMembers) return 'incomplete';
  return 'incomplete';
});

// Submit the form data
const submitStep = () => {
  emit('update-data', { ...localData });
  emit('submit-step');
};

// Validate the form
const validateForm = () => {
  // Check basic required fields
  const requiredFields = ['companyName', 'companyWebsite', 'companySize', 'founded', 'companyLocation'];
  const basicFieldsValid = requiredFields.every(field => {
    const value = localData[field as keyof typeof localData];
    return value && value.toString().trim() !== '';
  });
  
  // Check contact required fields
  const contactFields = ['contactName', 'contactRole', 'contactEmail', 'preferredContact'];
  const contactFieldsValid = contactFields.every(field => {
    const value = localData[field as keyof typeof localData];
    return value && value.toString().trim() !== '';
  });
  
  // Check creator required fields
  const creatorFields = ['founderName', 'founderTitle', 'founderBio', 'teamSize', 'whyCreated'];
  const creatorFieldsValid = creatorFields.every(field => {
    const value = localData[field as keyof typeof localData];
    return value && value.toString().trim() !== '';
  });
  
  // Check if at least one industry is selected
  const industriesValid = localData.industries && localData.industries.length > 0;
  
  return basicFieldsValid && contactFieldsValid && creatorFieldsValid && industriesValid;
};

// Team member management methods
const addMember = () => {
  localData.teamMembers.push({
    name: '',
    role: '',
    bio: '',
    profilePicture: '',
    social: {
      linkedin: '',
      twitter: '',
      github: '',
      instagram: '',
      website: '',
      blog: ''
    }
  });
};

const removeMember = (index: number) => {
  if (localData.teamMembers.length > 1) {
    localData.teamMembers.splice(index, 1);
  }
};

// Profile picture upload methods
const handleFounderProfilePictureUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      localData.founderProfilePicture = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removeFounderProfilePicture = () => {
  localData.founderProfilePicture = '';
};

const handleMemberProfilePictureUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      localData.teamMembers[index].profilePicture = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removeMemberProfilePicture = (index: number) => {
  localData.teamMembers[index].profilePicture = '';
};

// Expose validateForm to parent
defineExpose({
  validateForm
});
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

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-row {
  display: flex;
  gap: var(--spacing-lg);
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

input, textarea, select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

/* Custom multi-select dropdown styling */
.custom-multiselect {
  position: relative;
  width: 100%;
}

.multiselect-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background-color: var(--light-color);
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  height: calc(1rem + 2 * var(--spacing-md) + 2px); /* Match input height: font-size + padding + border */
}

.multiselect-input:hover {
  border-color: var(--color-gray-400);
}

.custom-multiselect.active .multiselect-input {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.placeholder {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: normal;
}

.selected-options {
  display: flex;
  align-items: center;
  height: 100%;
}

.selected-count {
  font-size: 1rem; /* Match the font size of regular inputs */
  color: var(--text-primary);
  font-weight: 500;
  line-height: normal;
}

.dropdown-icon {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--spacing-sm);
  transition: transform 0.2s ease;
  height: 100%;
}

.active .dropdown-icon {
  color: var(--primary-color);
}

.dropdown-container {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 350px;
  background-color: var(--light-color);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  z-index: 100; /* Ensure it appears above other elements */
  overflow: hidden;
  animation: dropdown-fade-in 0.2s ease;
}

.search-container {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  background-color: var(--light-color);
  z-index: 1;
}

.search-container input {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  width: 100%;
  border: 1px solid var(--color-gray-300);
  font-size: 0.95rem;
}

.dropdown-actions {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  margin-top: var(--spacing-xs);
}

.action-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  text-decoration: underline;
}

.no-results {
  padding: var(--spacing-md);
  color: var(--text-secondary);
  font-style: italic;
  text-align: center;
}

.options-container {
  max-height: 280px;
  overflow-y: auto;
}

.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: var(--bg-gray);
}

.options-container::-webkit-scrollbar-thumb {
  background-color: var(--color-gray-400);
  border-radius: 6px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.option-item:hover {
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-gray-400);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.option-item:hover .checkbox:not(.checked) {
  border-color: var(--primary-color);
}

.checkbox.checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.selected-industries {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.industry-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 10px;
  background-color: rgba(var(--primary-color-rgb), 0.08);
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: var(--border-radius-md);
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.industry-tag:hover {
  background-color: rgba(var(--primary-color-rgb), 0.12);
}

.remove-industry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  margin-left: 2px;
}

.remove-industry-btn:hover {
  background-color: rgba(var(--primary-color-rgb), 0.15);
  color: var(--color-primary-dark);
}

@keyframes dropdown-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.input-with-icon {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.input-with-icon input {
  border: none;
  border-radius: 0;
}

.input-with-icon input:focus {
  box-shadow: none;
}

.input-with-icon:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.input-prefix {
  background-color: var(--bg-gray);
  padding: var(--spacing-md);
  color: var(--text-secondary);
  font-size: 0.9rem;
  white-space: nowrap;
  border-right: 1px solid var(--color-gray-300);
}

/* Team Member Styles */
.team-member-card {
  background-color: var(--bg-gray);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.team-member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-gray-200);
}

.team-member-header h4 {
  color: var(--text-primary);
  font-size: 1rem;
  margin: 0;
}

.remove-member-btn {
  background: none;
  border: none;
  color: var(--color-red-500);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  font-size: 1.2rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-member-btn:hover {
  background-color: var(--color-red-50);
  transform: scale(1.1);
}

.add-member-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  margin-top: var(--spacing-md);
}

.add-member-btn:hover {
  background-color: var(--primary-color-dark);
  transform: translateY(-1px);
}

.field-hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-md);
  margin-top: var(--spacing-xs);
}

.section-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-sm) 0;
  font-style: italic;
}

/* Profile Picture Upload Styles */
.profile-upload-area {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  transition: border-color 0.2s ease;
}

.profile-upload-area:hover {
  border-color: var(--primary-color);
}

.profile-preview {
  position: relative;
  display: inline-block;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-gray-200);
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-red-500);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-image-btn:hover {
  background: var(--color-red-600);
  transform: scale(1.1);
}

.upload-placeholder {
  padding: var(--spacing-md);
}

.file-input {
  display: none;
}

.upload-label {
  display: inline-block;
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-sm);
}

.upload-label:hover {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
}

.upload-hint {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin: 0;
}

@media (max-width: 768px) {
  .step-container {
    padding: var(--spacing-lg);
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .input-prefix {
    font-size: 0.8rem;
    padding: var(--spacing-sm);
  }
}
</style>
