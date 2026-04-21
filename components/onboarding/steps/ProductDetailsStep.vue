<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Product Details</h2>
      <p>Provide detailed information about your product or service</p>
    </div>

    <form @submit.prevent="submitStep">
      <div class="form-group">
        <label for="fullDescription">Full Description*</label>
        <textarea 
          id="fullDescription" 
          v-model="localData.fullDescription" 
          required 
          placeholder="Describe your product in detail, including its features, benefits, and value proposition"
          rows="5"
        ></textarea>
        <p class="field-hint">Use this space to fully explain what your product does, its benefits, and value proposition</p>
      </div>

      <div class="form-group">
        <label>Key Features*</label>
        <p class="field-hint">List the main features of your product or service</p>
        
        <div 
          v-for="(feature, index) in localData.features" 
          :key="index" 
          class="feature-item"
        >
          <div class="feature-header">
            <h4>Feature {{ index + 1 }}</h4>
            <button 
              type="button" 
              class="remove-btn"
              v-if="localData.features.length > 1"
              @click="removeFeature(index)"
            >
              🗑️
            </button>
          </div>
          
          <div class="form-group">
            <label :for="`feature-title-${index}`">Title*</label>
            <input 
              :id="`feature-title-${index}`" 
              v-model="feature.title" 
              required 
              placeholder="Feature name"
            />
          </div>
          
          <div class="form-group">
            <label :for="`feature-description-${index}`">Description*</label>
            <textarea 
              :id="`feature-description-${index}`" 
              v-model="feature.description" 
              required 
              placeholder="Describe this feature and its benefits"
              rows="3"
            ></textarea>
          </div>
          
          <!-- Feature Media Section -->
          <div class="form-group">
            <label>Feature Media (Optional)</label>
            
            <div class="media-type-selector">
              <div class="media-type-option">
                <input 
                  type="radio" 
                  :id="`feature-media-none-${index}`" 
                  :name="`feature-media-type-${index}`" 
                  :checked="feature.media.mediaType === null"
                  @change="setFeatureMediaType(index, null)" 
                />
                <label :for="`feature-media-none-${index}`">None</label>
              </div>
              
              <div class="media-type-option">
                <input 
                  type="radio" 
                  :id="`feature-media-image-${index}`" 
                  :name="`feature-media-type-${index}`" 
                  :checked="feature.media.mediaType === 'image'"
                  @change="setFeatureMediaType(index, 'image')" 
                />
                <label :for="`feature-media-image-${index}`">Image</label>
              </div>
              
              <div class="media-type-option">
                <input 
                  type="radio" 
                  :id="`feature-media-video-${index}`" 
                  :name="`feature-media-type-${index}`" 
                  :checked="feature.media.mediaType === 'video'"
                  @change="setFeatureMediaType(index, 'video')" 
                />
                <label :for="`feature-media-video-${index}`">Video</label>
              </div>
            </div>
            
            <div v-if="feature.media.mediaType" class="feature-media-container">
              <!-- Upload UI when no file is selected -->
              <div 
                v-if="!feature.media.file" 
                class="upload-container"
                @click="triggerFeatureMediaUpload(index)"
              >
                <div class="upload-placeholder">
                  <span>{{ feature.media.mediaType === 'image' ? '📷' : '🎥' }}</span>
                  <span>Upload {{ feature.media.mediaType === 'image' ? 'Image' : 'Video' }}</span>
                  <p>Click to browse or drag and drop<br>{{ feature.media.mediaType === 'image' ? 'PNG, JPG (max 5MB)' : 'MP4, WebM (max 5MB)' }}</p>
                </div>
                <input 
                  type="file" 
                  :ref="el => { if(el) featureMediaInputsMap[index] = el as HTMLInputElement }"
                  :accept="feature.media.mediaType === 'image' ? 'image/png, image/jpeg' : 'video/*'"
                  @change="(event) => handleFeatureMediaUpload(event, index)"
                  hidden
                />
              </div>
              
              <!-- Preview UI when file is selected -->
              <div v-else class="upload-container has-file">
                <!-- Image preview -->
                <div v-if="feature.media.mediaType === 'image' && feature.media.previewUrl" class="upload-preview">
                  <img :src="feature.media.previewUrl" :alt="`Feature ${index + 1} Image`" />
                  <button type="button" class="remove-file" @click="removeFeatureMedia(index)">
                    ✕
                  </button>
                </div>
                
                <!-- Video preview -->
                <div v-else-if="feature.media.mediaType === 'video'" class="upload-preview">
                  <div class="video-file-name">
                    🎥
                    <span>{{ feature.media.file?.name }}</span>
                  </div>
                  <button type="button" class="remove-file" @click="removeFeatureMedia(index)">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          type="button" 
          class="add-btn"
          @click="addFeature"
        >
          <UIcon dynamic name="i-heroicons-plus-circle" />
          Add Another Feature
        </button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="pricingModels">Pricing Models*</label>
          <div class="multi-select-container">
            <div class="multi-select-dropdown" @click="togglePricingDropdown" :class="{ 'open': isPricingDropdownOpen }">
              <div class="selected-items">
                <span v-if="localData.pricingModels.length === 0" class="placeholder">Select pricing models</span>
                <div v-else class="selected-tags">
                  <span 
                    v-for="selectedModel in localData.pricingModels" 
                    :key="selectedModel" 
                    class="tag"
                  >
                    {{ selectedModel }}
                    <button type="button" @click.stop="removePricingModel(selectedModel)" class="tag-remove">×</button>
                  </span>
                </div>
              </div>
              <div class="dropdown-arrow">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div v-if="isPricingDropdownOpen" class="dropdown-options">
              <div 
                v-for="model in availablePricingModels" 
                :key="model" 
                class="dropdown-option"
                :class="{ 'selected': localData.pricingModels.includes(model) }"
                @click="togglePricingModel(model)"
              >
                <input 
                  type="checkbox" 
                  :checked="localData.pricingModels.includes(model)"
                  @change="togglePricingModel(model)"
                />
                <span>{{ model }}</span>
              </div>
            </div>
          </div>
          <p class="field-hint">Choose one or more pricing models that apply to your product</p>
        </div>

        <div class="form-group">
          <label for="targetAudience">Target Audience*</label>
          <div class="multi-select-container">
            <div class="multi-select-dropdown" @click="toggleAudienceDropdown" :class="{ 'open': isAudienceDropdownOpen }">
              <div class="selected-items">
                <span v-if="localData.targetAudience.length === 0" class="placeholder">Select target audience</span>
                <div v-else class="selected-tags">
                  <span 
                    v-for="selectedAudience in localData.targetAudience" 
                    :key="selectedAudience" 
                    class="tag"
                  >
                    {{ selectedAudience }}
                    <button type="button" @click.stop="removeTargetAudience(selectedAudience)" class="tag-remove">×</button>
                  </span>
                </div>
              </div>
              <div class="dropdown-arrow">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div v-if="isAudienceDropdownOpen" class="dropdown-options">
              <div 
                v-for="audience in availableTargetAudiences" 
                :key="audience" 
                class="dropdown-option"
                :class="{ 'selected': localData.targetAudience.includes(audience) }"
                @click="toggleTargetAudience(audience)"
              >
                <input 
                  type="checkbox" 
                  :checked="localData.targetAudience.includes(audience)"
                  @change="toggleTargetAudience(audience)"
                />
                <span>{{ audience }}</span>
              </div>
            </div>
          </div>
          <p class="field-hint">Choose one or more target audiences for your product</p>
        </div>
      </div>

      <div class="form-group">
        <label for="pricingDetails">Pricing Details</label>
        <textarea 
          id="pricingDetails" 
          v-model="localData.pricingDetails" 
          placeholder="Provide details about your pricing tiers, plans, or options"
          rows="3"
        ></textarea>
      </div>

      <div class="section-divider">
        <h3>Platform Support & Availability</h3>
        <p>Tell us which platforms your application or service supports</p>
      </div>

      <div class="form-group">
        <label>Platform Availability*</label>
        <p class="field-hint">Select all platforms where your application is available or plans to be available</p>
        
        <div class="platform-grid">
          <div 
            v-for="platform in availablePlatforms" 
            :key="platform.key" 
            class="platform-option"
            :class="{ 'selected': localData.platformSupport.includes(platform.key) }"
            @click="togglePlatform(platform.key)"
          >
            <div class="platform-header">
              <input 
                type="checkbox" 
                :checked="localData.platformSupport.includes(platform.key)"
                @change="togglePlatform(platform.key)"
              />
              <UIcon dynamic :name="platform.icon" />
              <span class="platform-name">{{ platform.name }}</span>
            </div>
            <p class="platform-description">{{ platform.description }}</p>
          </div>
        </div>
      </div>

      <div class="section-divider">
        <h3>App Information & Technical Details</h3>
        <p>Provide technical information about your application</p>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="appVersion">App Version*</label>
          <input 
            id="appVersion" 
            v-model="localData.appVersion" 
            required 
            placeholder="e.g., 1.0.0, 2.1.3"
          />
          <p class="field-hint">Current version of your application</p>
        </div>

        <div class="form-group">
          <label for="lastUpdated">Last Updated</label>
          <input 
            id="lastUpdated" 
            v-model="localData.lastUpdated" 
            type="date"
          />
          <p class="field-hint">When was your app last updated?</p>
        </div>
      </div>

      <div class="form-group">
        <label>Supported Languages*</label>
        <p class="field-hint">Languages your application interface supports</p>
        <div class="multi-select-container">
          <div class="multi-select-dropdown" @click="toggleLanguagesDropdown" :class="{ 'open': isLanguagesDropdownOpen }">
            <div class="selected-items">
              <span v-if="localData.supportedLanguages.length === 0" class="placeholder">Select supported languages</span>
              <div v-else class="selected-tags">
                <span 
                  v-for="language in localData.supportedLanguages" 
                  :key="language" 
                  class="tag"
                >
                  {{ language }}
                  <button type="button" @click.stop="removeLanguage(language)" class="tag-remove">×</button>
                </span>
              </div>
            </div>
            <div class="dropdown-arrow">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div v-if="isLanguagesDropdownOpen" class="dropdown-options">
            <div 
              v-for="language in availableLanguages" 
              :key="language" 
              class="dropdown-option"
              :class="{ 'selected': localData.supportedLanguages.includes(language) }"
              @click="toggleLanguage(language)"
            >
              <input 
                type="checkbox" 
                :checked="localData.supportedLanguages.includes(language)"
                @change="toggleLanguage(language)"
              />
              <span>{{ language }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Third-party Integrations</label>
        <p class="field-hint">Services and tools your application integrates with</p>
        <div class="multi-select-container">
          <div class="multi-select-dropdown" @click="toggleIntegrationsDropdown" :class="{ 'open': isIntegrationsDropdownOpen }">
            <div class="selected-items">
              <span v-if="localData.integrations.length === 0" class="placeholder">Select integrations (optional)</span>
              <div v-else class="selected-tags">
                <span 
                  v-for="integration in localData.integrations" 
                  :key="integration" 
                  class="tag"
                >
                  {{ integration }}
                  <button type="button" @click.stop="removeIntegration(integration)" class="tag-remove">×</button>
                </span>
              </div>
            </div>
            <div class="dropdown-arrow">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div v-if="isIntegrationsDropdownOpen" class="dropdown-options">
            <div 
              v-for="integration in availableIntegrations" 
              :key="integration" 
              class="dropdown-option"
              :class="{ 'selected': localData.integrations.includes(integration) }"
              @click="toggleIntegration(integration)"
            >
              <input 
                type="checkbox" 
                :checked="localData.integrations.includes(integration)"
                @change="toggleIntegration(integration)"
              />
              <span>{{ integration }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="businessModel">Business Model*</label>
          <select id="businessModel" v-model="localData.businessModel" required>
            <option value="">Select business model</option>
            <option value="freemium">Freemium</option>
            <option value="subscription">Subscription</option>
            <option value="one-time">One-time Purchase</option>
            <option value="usage-based">Usage-based</option>
            <option value="enterprise">Enterprise Only</option>
            <option value="free">Free</option>
            <option value="contact-sales">Contact for Pricing</option>
          </select>
          <p class="field-hint">How do you monetize your application?</p>
        </div>

        <div class="form-group">
          <label>API & Development Features</label>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input 
                type="checkbox" 
                id="apiAvailable" 
                v-model="localData.apiAvailable"
              />
              <label for="apiAvailable">API Available</label>
            </div>
            <div class="checkbox-item">
              <input 
                type="checkbox" 
                id="webhookSupport" 
                v-model="localData.webhookSupport"
              />
              <label for="webhookSupport">Webhook Support</label>
            </div>
          </div>
        </div>
      </div>

      <div class="section-divider">
        <h3>App Store Links & Distribution</h3>
        <p>Where can users download or access your application?</p>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="appStoreIOS">iOS App Store</label>
          <input 
            id="appStoreIOS" 
            v-model="localData.appStoreLinks.ios" 
            type="url"
            placeholder="https://apps.apple.com/app/..."
          />
        </div>

        <div class="form-group">
          <label for="appStoreAndroid">Google Play Store</label>
          <input 
            id="appStoreAndroid" 
            v-model="localData.appStoreLinks.android" 
            type="url"
            placeholder="https://play.google.com/store/apps/..."
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="appStoreWeb">Web Application URL</label>
          <input 
            id="appStoreWeb" 
            v-model="localData.appStoreLinks.web" 
            type="url"
            placeholder="https://yourdomain.com"
          />
        </div>

        <div class="form-group">
          <label for="appStoreDesktop">Desktop Download</label>
          <input 
            id="appStoreDesktop" 
            v-model="localData.appStoreLinks.desktop" 
            type="url"
            placeholder="https://yourdomain.com/download"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="appStoreChrome">Chrome Web Store</label>
          <input 
            id="appStoreChrome" 
            v-model="localData.appStoreLinks.chrome" 
            type="url"
            placeholder="https://chrome.google.com/webstore/..."
          />
        </div>

        <div class="form-group">
          <label for="appStoreFirefox">Firefox Add-ons</label>
          <input 
            id="appStoreFirefox" 
            v-model="localData.appStoreLinks.firefox" 
            type="url"
            placeholder="https://addons.mozilla.org/..."
          />
        </div>
      </div>

      <div class="section-divider">
        <h3>Features & Support Information</h3>
        <p>Additional information for users about your application</p>
      </div>

      <div class="form-group">
        <label>What's Included (Base Features)*</label>
        <p class="field-hint">List the key features included in your basic/free tier</p>
        <div 
          v-for="(feature, index) in localData.includedFeatures" 
          :key="index" 
          class="feature-input-item"
        >
          <input 
            v-model="localData.includedFeatures[index]" 
            placeholder="e.g., Unlimited contacts, Email templates"
            @input="handleIncludedFeatureInput(index)"
          />
          <button 
            type="button" 
            class="remove-feature-btn"
            v-if="localData.includedFeatures.length > 1"
            @click="removeIncludedFeature(index)"
          >
            ✕
          </button>
        </div>
        <button 
          type="button" 
          class="add-feature-btn"
          @click="addIncludedFeature"
        >
          + Add Feature
        </button>
      </div>

      <div class="form-group">
        <label>Support Channels</label>
        <p class="field-hint">How do you provide customer support?</p>
        <div class="multi-select-container">
          <div class="multi-select-dropdown" @click="toggleSupportDropdown" :class="{ 'open': isSupportDropdownOpen }">
            <div class="selected-items">
              <span v-if="localData.supportChannels.length === 0" class="placeholder">Select support channels</span>
              <div v-else class="selected-tags">
                <span 
                  v-for="channel in localData.supportChannels" 
                  :key="channel" 
                  class="tag"
                >
                  {{ channel }}
                  <button type="button" @click.stop="removeSupportChannel(channel)" class="tag-remove">×</button>
                </span>
              </div>
            </div>
            <div class="dropdown-arrow">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div v-if="isSupportDropdownOpen" class="dropdown-options">
            <div 
              v-for="channel in availableSupportChannels" 
              :key="channel" 
              class="dropdown-option"
              :class="{ 'selected': localData.supportChannels.includes(channel) }"
              @click="toggleSupportChannel(channel)"
            >
              <input 
                type="checkbox" 
                :checked="localData.supportChannels.includes(channel)"
                @change="toggleSupportChannel(channel)"
              />
              <span>{{ channel }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="documentationLink">Documentation URL</label>
          <input 
            id="documentationLink" 
            v-model="localData.documentationLink" 
            type="url"
            placeholder="https://docs.yourdomain.com"
          />
        </div>

        <div class="form-group">
          <label for="helpCenterLink">Help Center URL</label>
          <input 
            id="helpCenterLink" 
            v-model="localData.helpCenterLink" 
            type="url"
            placeholder="https://help.yourdomain.com"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="applicationStage">Application Development Stage*</label>
        <select 
          id="applicationStage" 
          v-model="localData.applicationStage" 
          required
        >
          <option value="">Select your current stage</option>
          <option v-for="stage in applicationStages" :key="stage.value" :value="stage.value">
            {{ stage.label }}
          </option>
        </select>
        <p class="field-hint">Choose the stage that best describes your current development progress</p>
      </div>

      <!-- Conditional Questions Based on Stage -->
      <div v-if="localData.applicationStage" class="stage-specific-questions">
        <!-- Idea Stage Questions -->
        <div v-if="localData.applicationStage === 'idea'" class="stage-questions">
          <h4>Idea Stage Details</h4>
          <div class="form-group">
            <label for="ideaValidation">Have you validated your idea with potential users?*</label>
            <select id="ideaValidation" v-model="localData.stageDetails.ideaValidation" required>
              <option value="">Select validation status</option>
              <option value="no-validation">No validation yet</option>
              <option value="informal-feedback">Informal feedback from friends/colleagues</option>
              <option value="surveys">Conducted surveys or interviews</option>
              <option value="market-research">Comprehensive market research</option>
            </select>
          </div>
          <div class="form-group">
            <label for="expectedLaunch">When do you plan to launch your MVP?*</label>
            <select id="expectedLaunch" v-model="localData.stageDetails.expectedLaunch" required>
              <option value="">Select timeline</option>
              <option value="1-3-months">1-3 months</option>
              <option value="3-6-months">3-6 months</option>
              <option value="6-12-months">6-12 months</option>
              <option value="over-12-months">Over 12 months</option>
              <option value="uncertain">Timeline uncertain</option>
            </select>
          </div>
        </div>

        <!-- MVP Stage Questions -->
        <div v-if="localData.applicationStage === 'mvp'" class="stage-questions">
          <h4>MVP Stage Details</h4>
          <div class="form-group">
            <label for="mvpFeatures">How many core features does your MVP include?*</label>
            <select id="mvpFeatures" v-model="localData.stageDetails.mvpFeatures" required>
              <option value="">Select feature count</option>
              <option value="1-3">1-3 core features</option>
              <option value="4-6">4-6 core features</option>
              <option value="7-10">7-10 core features</option>
              <option value="over-10">More than 10 features</option>
            </select>
          </div>
          <div class="form-group">
            <label for="userTesting">Are you currently conducting user testing?*</label>
            <select id="userTesting" v-model="localData.stageDetails.userTesting" required>
              <option value="">Select testing status</option>
              <option value="no-testing">No user testing yet</option>
              <option value="internal-testing">Internal team testing only</option>
              <option value="closed-beta">Closed beta with select users</option>
              <option value="open-beta">Open beta testing</option>
            </select>
          </div>
        </div>

        <!-- Beta Stage Questions -->
        <div v-if="localData.applicationStage === 'beta'" class="stage-questions">
          <h4>Beta Stage Details</h4>
          <div class="form-group">
            <label for="betaUsers">How many beta users do you currently have?*</label>
            <select id="betaUsers" v-model="localData.stageDetails.betaUsers" required>
              <option value="">Select user count</option>
              <option value="1-10">1-10 users</option>
              <option value="11-50">11-50 users</option>
              <option value="51-100">51-100 users</option>
              <option value="101-500">101-500 users</option>
              <option value="over-500">Over 500 users</option>
            </select>
          </div>
          <div class="form-group">
            <label for="feedbackCollection">How do you collect user feedback?*</label>
            <div class="multi-select-container">
              <div class="multi-select-dropdown" @click="toggleFeedbackDropdown" :class="{ 'open': isFeedbackDropdownOpen }">
                <div class="selected-items">
                  <span v-if="!localData.stageDetails.feedbackMethods || localData.stageDetails.feedbackMethods.length === 0" class="placeholder">Select feedback methods</span>
                  <div v-else class="selected-tags">
                    <span 
                      v-for="method in localData.stageDetails.feedbackMethods" 
                      :key="method" 
                      class="tag"
                    >
                      {{ method }}
                      <button type="button" @click.stop="removeFeedbackMethod(method)" class="tag-remove">×</button>
                    </span>
                  </div>
                </div>
                <div class="dropdown-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div v-if="isFeedbackDropdownOpen" class="dropdown-options">
                <div 
                  v-for="method in availableFeedbackMethods" 
                  :key="method" 
                  class="dropdown-option"
                  :class="{ 'selected': localData.stageDetails.feedbackMethods?.includes(method) }"
                  @click="toggleFeedbackMethod(method)"
                >
                  <input 
                    type="checkbox" 
                    :checked="localData.stageDetails.feedbackMethods?.includes(method)"
                    @change="toggleFeedbackMethod(method)"
                  />
                  <span>{{ method }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Stage Questions -->
        <div v-if="localData.applicationStage === 'live'" class="stage-questions">
          <h4>Live Application Details</h4>
          <div class="form-group">
            <label for="activeUsers">How many active users do you have?*</label>
            <select id="activeUsers" v-model="localData.stageDetails.activeUsers" required>
              <option value="">Select user count</option>
              <option value="1-100">1-100 users</option>
              <option value="101-1000">101-1,000 users</option>
              <option value="1001-10000">1,001-10,000 users</option>
              <option value="10001-50000">10,001-50,000 users</option>
              <option value="over-50000">Over 50,000 users</option>
            </select>
          </div>
          <div class="form-group">
            <label for="revenueGeneration">Are you generating revenue?*</label>
            <select id="revenueGeneration" v-model="localData.stageDetails.revenueGeneration" required>
              <option value="">Select revenue status</option>
              <option value="no-revenue">No revenue yet</option>
              <option value="minimal-revenue">Minimal revenue (under $1K/month)</option>
              <option value="growing-revenue">Growing revenue ($1K-$10K/month)</option>
              <option value="established-revenue">Established revenue ($10K+/month)</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <!-- Mature Stage Questions -->
        <div v-if="localData.applicationStage === 'mature'" class="stage-questions">
          <h4>Mature Application Details</h4>
          <div class="form-group">
            <label for="marketPosition">How would you describe your market position?*</label>
            <select id="marketPosition" v-model="localData.stageDetails.marketPosition" required>
              <option value="">Select market position</option>
              <option value="emerging-player">Emerging player</option>
              <option value="established-competitor">Established competitor</option>
              <option value="market-leader">Market leader</option>
              <option value="niche-specialist">Niche specialist</option>
            </select>
          </div>
          <div class="form-group">
            <label for="expansionPlans">What are your expansion plans?*</label>
            <div class="multi-select-container">
              <div class="multi-select-dropdown" @click="toggleExpansionDropdown" :class="{ 'open': isExpansionDropdownOpen }">
                <div class="selected-items">
                  <span v-if="!localData.stageDetails.expansionPlans || localData.stageDetails.expansionPlans.length === 0" class="placeholder">Select expansion plans</span>
                  <div v-else class="selected-tags">
                    <span 
                      v-for="plan in localData.stageDetails.expansionPlans" 
                      :key="plan" 
                      class="tag"
                    >
                      {{ plan }}
                      <button type="button" @click.stop="removeExpansionPlan(plan)" class="tag-remove">×</button>
                    </span>
                  </div>
                </div>
                <div class="dropdown-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div v-if="isExpansionDropdownOpen" class="dropdown-options">
                <div 
                  v-for="plan in availableExpansionPlans" 
                  :key="plan" 
                  class="dropdown-option"
                  :class="{ 'selected': localData.stageDetails.expansionPlans?.includes(plan) }"
                  @click="toggleExpansionPlan(plan)"
                >
                  <input 
                    type="checkbox" 
                    :checked="localData.stageDetails.expansionPlans?.includes(plan)"
                    @change="toggleExpansionPlan(plan)"
                  />
                  <span>{{ plan }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

// Define interfaces for our data structures
interface FeatureMedia {
  file: File | null;
  mediaType: 'image' | 'video' | null;
  previewUrl?: string;
}

interface Feature {
  title: string;
  description: string;
  media: FeatureMedia;
}

interface Testimonial {
  author: string;
  company: string;
  role: string;
  content: string;
}

interface StageDetails {
  // Idea stage
  ideaValidation?: string;
  expectedLaunch?: string;
  
  // MVP stage
  mvpFeatures?: string;
  userTesting?: string;
  
  // Beta stage
  betaUsers?: string;
  feedbackMethods?: string[];
  
  // Live stage
  activeUsers?: string;
  revenueGeneration?: string;
  
  // Mature stage
  marketPosition?: string;
  expansionPlans?: string[];
}

interface ProductDetailsFormData {
  fullDescription: string;
  features: Feature[];
  pricingModels: string[];
  pricingDetails: string;
  targetAudience: string[];
  platformSupport: string[];
  applicationStage: string;
  stageDetails: StageDetails;
  // New app landing page fields
  appVersion: string;
  lastUpdated: string;
  supportedLanguages: string[];
  integrations: string[];
  businessModel: string;
  apiAvailable: boolean;
  webhookSupport: boolean;
  appStoreLinks: {
    ios: string;
    android: string;
    web: string;
    desktop: string;
    chrome: string;
    firefox: string;
  };
  includedFeatures: string[];
  supportChannels: string[];
  documentationLink: string;
  helpCenterLink: string;
}

const props = defineProps({
  formData: {
    type: Object as () => ProductDetailsFormData,
    required: true
  }
});

const emit = defineEmits(['update-data', 'submit-step', 'go-back']);

// References to file inputs
// Store input refs
const featureMediaInputsMap: {[key: number]: HTMLInputElement | null} = {};

// Convert existing features to new format if needed
const convertFeaturesToNewFormat = (): Feature[] => {
  if (props.formData.features && Array.isArray(props.formData.features) && props.formData.features.length > 0) {
    return props.formData.features.map(feature => {
      const featureObj = feature as any;
      // If feature already has media property, use it
      if (featureObj && typeof featureObj === 'object' && 'media' in featureObj) {
        return {
          title: featureObj.title || '',
          description: featureObj.description || '',
          media: {
            file: featureObj.media.file || null,
            mediaType: featureObj.media.mediaType || null,
            previewUrl: featureObj.media.previewUrl
          }
        };
      }
      // Otherwise add the media property
      return {
        title: featureObj?.title || '',
        description: featureObj?.description || '',
        media: {
          file: null,
          mediaType: null,
          previewUrl: undefined
        }
      };
    });
  }
  
  // Default empty feature
  return [{ 
    title: '', 
    description: '', 
    media: {
      file: null,
      mediaType: null,
      previewUrl: undefined
    }
  }];
};

// Create a local copy of the data
const localData = reactive<ProductDetailsFormData>({
  fullDescription: props.formData.fullDescription || '',
  features: convertFeaturesToNewFormat(),
  pricingModels: props.formData.pricingModels && props.formData.pricingModels.length > 0
    ? [...props.formData.pricingModels]
    : [],
  pricingDetails: props.formData.pricingDetails || '',
  targetAudience: props.formData.targetAudience && props.formData.targetAudience.length > 0
    ? [...props.formData.targetAudience]
    : [],
  platformSupport: (props.formData as any).platformSupport && (props.formData as any).platformSupport.length > 0
    ? [...(props.formData as any).platformSupport]
    : [],
  applicationStage: (props.formData as any).applicationStage || '',
  stageDetails: (props.formData as any).stageDetails || {
    feedbackMethods: [],
    expansionPlans: [],
    ideaValidation: '',
    expectedLaunch: '',
    mvpFeatures: '',
    userTesting: '',
    betaUsers: '',
    activeUsers: '',
    revenueGeneration: '',
    marketPosition: ''
  },
  // New app landing page fields
  appVersion: (props.formData as any).appVersion || '1.0.0',
  lastUpdated: (props.formData as any).lastUpdated || '',
  supportedLanguages: (props.formData as any).supportedLanguages && (props.formData as any).supportedLanguages.length > 0
    ? [...(props.formData as any).supportedLanguages]
    : [],
  integrations: (props.formData as any).integrations && (props.formData as any).integrations.length > 0
    ? [...(props.formData as any).integrations]
    : [],
  businessModel: (props.formData as any).businessModel || '',
  apiAvailable: (props.formData as any).apiAvailable || false,
  webhookSupport: (props.formData as any).webhookSupport || false,
  appStoreLinks: {
    ios: (props.formData as any).appStoreLinks?.ios || '',
    android: (props.formData as any).appStoreLinks?.android || '',
    web: (props.formData as any).appStoreLinks?.web || '',
    desktop: (props.formData as any).appStoreLinks?.desktop || '',
    chrome: (props.formData as any).appStoreLinks?.chrome || '',
    firefox: (props.formData as any).appStoreLinks?.firefox || ''
  },
  includedFeatures: (props.formData as any).includedFeatures && (props.formData as any).includedFeatures.length > 0
    ? [...(props.formData as any).includedFeatures]
    : [''],
  supportChannels: (props.formData as any).supportChannels && (props.formData as any).supportChannels.length > 0
    ? [...(props.formData as any).supportChannels]
    : [],
  documentationLink: (props.formData as any).documentationLink || '',
  helpCenterLink: (props.formData as any).helpCenterLink || ''
});

// Platform Support Configuration
const availablePlatforms = [
  {
    key: 'web',
    name: 'Web Application',
    icon: 'i-heroicons-globe-alt',
    description: 'Browser-based web application accessible via website'
  },
  {
    key: 'mobile-ios',
    name: 'iOS Mobile App',
    icon: 'i-heroicons-device-phone-mobile',
    description: 'Native iOS application available on App Store'
  },
  {
    key: 'mobile-android',
    name: 'Android Mobile App',
    icon: 'i-heroicons-device-phone-mobile',
    description: 'Native Android application available on Google Play'
  },
  {
    key: 'desktop-windows',
    name: 'Windows Desktop',
    icon: 'i-heroicons-computer-desktop',
    description: 'Native Windows desktop application'
  },
  {
    key: 'desktop-mac',
    name: 'macOS Desktop',
    icon: 'i-heroicons-computer-desktop',
    description: 'Native macOS desktop application'
  },
  {
    key: 'desktop-linux',
    name: 'Linux Desktop',
    icon: 'i-heroicons-computer-desktop',
    description: 'Native Linux desktop application'
  },
  {
    key: 'api',
    name: 'API/SDK',
    icon: 'i-heroicons-code-bracket',
    description: 'RESTful API or SDK for developers'
  },
  {
    key: 'browser-extension',
    name: 'Browser Extension',
    icon: 'i-heroicons-puzzle-piece',
    description: 'Browser extension for Chrome, Firefox, etc.'
  }
];

// Application Stage Configuration
const applicationStages = [
  { value: 'idea', label: 'Idea Stage - Concept development and planning' },
  { value: 'mvp', label: 'MVP - Minimum Viable Product in development' },
  { value: 'beta', label: 'Beta - Testing with limited users' },
  { value: 'live', label: 'Live - Publicly available and operational' },
  { value: 'mature', label: 'Mature - Established with significant user base' }
];

// Feedback Methods for Beta Stage
const availableFeedbackMethods = [
  'In-app feedback forms',
  'Email surveys',
  'User interviews',
  'Analytics tracking',
  'Support tickets',
  'Social media monitoring',
  'Beta testing platforms',
  'Focus groups'
];

// Expansion Plans for Mature Stage
const availableExpansionPlans = [
  'New geographic markets',
  'Additional platform support',
  'Enterprise features',
  'API/Integration expansion',
  'Acquisition strategy',
  'New product lines',
  'Partnership programs',
  'White-label solutions'
];

// Dropdown states for stage-specific questions
const isFeedbackDropdownOpen = ref(false);
const isExpansionDropdownOpen = ref(false);

// Pricing models dropdown
const isPricingDropdownOpen = ref(false);

// New dropdown states for app landing page fields
const isLanguagesDropdownOpen = ref(false);
const isIntegrationsDropdownOpen = ref(false);
const isSupportDropdownOpen = ref(false);

const availablePricingModels = [
  'Free',
  'Freemium', 
  'One-time Purchase',
  'Subscription',
  'Usage-Based',
  'Enterprise',
  'Contact Sales'
];

// Available languages for multi-language support
const availableLanguages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Russian',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Polish',
  'Czech',
  'Hungarian',
  'Romanian',
  'Bulgarian',
  'Croatian',
  'Turkish',
  'Greek',
  'Hebrew',
  'Thai',
  'Vietnamese',
  'Indonesian',
  'Malay'
];

// Available integrations
const availableIntegrations = [
  'Slack',
  'Microsoft Teams',
  'Discord',
  'Zapier',
  'Salesforce',
  'HubSpot',
  'Pipedrive',
  'Zoho CRM',
  'Gmail',
  'Outlook',
  'Google Workspace',
  'Microsoft 365',
  'Trello',
  'Asana',
  'Monday.com',
  'Notion',
  'Airtable',
  'Google Sheets',
  'Excel',
  'Stripe',
  'PayPal',
  'Square',
  'QuickBooks',
  'Xero',
  'FreshBooks',
  'Mailchimp',
  'ConvertKit',
  'ActiveCampaign',
  'SendGrid',
  'Twilio',
  'Zoom',
  'Google Meet',
  'Calendly',
  'Acuity Scheduling',
  'Shopify',
  'WooCommerce',
  'Magento',
  'WordPress',
  'Webflow',
  'GitHub',
  'GitLab',
  'Bitbucket',
  'Jira',
  'Linear',
  'Figma',
  'Adobe Creative Cloud',
  'Canva',
  'Google Analytics',
  'Mixpanel',
  'Amplitude',
  'Intercom',
  'Zendesk',
  'Freshdesk',
  'Help Scout',
  'Crisp',
  'LiveChat',
  'Drift',
  'AWS',
  'Google Cloud',
  'Microsoft Azure',
  'Heroku',
  'Vercel',
  'Netlify'
];

// Available support channels
const availableSupportChannels = [
  'Email Support',
  'Live Chat',
  'Phone Support',
  'Video Calls',
  'Help Center/FAQ',
  'Community Forum',
  'Knowledge Base',
  'Ticket System',
  'Social Media',
  'In-app Messaging',
  'Screen Sharing',
  'Remote Assistance',
  '24/7 Support',
  'Priority Support'
];

// Add a new feature
const addFeature = () => {
  localData.features.push({ 
    title: '', 
    description: '', 
    media: {
      file: null,
      mediaType: null,
      previewUrl: undefined
    }
  });
};

// Remove a feature
const removeFeature = (index: number) => {
  // Clean up preview URL if exists to avoid memory leaks
  const feature = localData.features[index];
  if (feature.media && feature.media.previewUrl) {
    URL.revokeObjectURL(feature.media.previewUrl);
  }
  localData.features.splice(index, 1);
};

// Set media type for a feature
const setFeatureMediaType = (index: number, mediaType: 'image' | 'video' | null) => {
  // If changing media type, clear existing media
  if (localData.features[index].media.mediaType !== mediaType && localData.features[index].media.file) {
    if (localData.features[index].media.previewUrl) {
      URL.revokeObjectURL(localData.features[index].media.previewUrl);
    }
    
    localData.features[index].media = {
      file: null,
      mediaType: mediaType,
      previewUrl: undefined
    };
  } else {
    localData.features[index].media.mediaType = mediaType;
  }
};

// Trigger file input click
const triggerFeatureMediaUpload = (index: number) => {
  if (featureMediaInputsMap[index]) {
    featureMediaInputsMap[index]?.click();
  }
};

// Handle feature media upload
const handleFeatureMediaUpload = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    const mediaType = localData.features[index].media.mediaType;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPEG, etc.)');
      return;
    }
    
    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a video file (MP4, WebM, etc.)');
      return;
    }
    
    // Clean up old preview URL if exists
    if (localData.features[index].media.previewUrl) {
      URL.revokeObjectURL(localData.features[index].media.previewUrl);
    }
    
    // Update feature media
    localData.features[index].media.file = file;
    
    // Generate preview URL for image
    if (mediaType === 'image') {
      localData.features[index].media.previewUrl = URL.createObjectURL(file);
    }
  }
};

// Remove feature media
const removeFeatureMedia = (index: number) => {
  // Clean up preview URL if exists
  if (localData.features[index].media.previewUrl) {
    URL.revokeObjectURL(localData.features[index].media.previewUrl);
  }
  
  // Reset media
  localData.features[index].media = {
    file: null,
    mediaType: localData.features[index].media.mediaType,
    previewUrl: undefined
  };
  
  // Reset input value if exists
  if (featureMediaInputsMap[index]) {
    featureMediaInputsMap[index]!.value = '';
  }
};

// Pricing models dropdown functions
const togglePricingDropdown = () => {
  isPricingDropdownOpen.value = !isPricingDropdownOpen.value;
};

const togglePricingModel = (model: string) => {
  const index = localData.pricingModels.indexOf(model);
  if (index > -1) {
    localData.pricingModels.splice(index, 1);
  } else {
    localData.pricingModels.push(model);
  }
};

const removePricingModel = (model: string) => {
  const index = localData.pricingModels.indexOf(model);
  if (index > -1) {
    localData.pricingModels.splice(index, 1);
  }
};

// Languages dropdown functions
const toggleLanguagesDropdown = () => {
  isLanguagesDropdownOpen.value = !isLanguagesDropdownOpen.value;
};

const toggleLanguage = (language: string) => {
  const index = localData.supportedLanguages.indexOf(language);
  if (index > -1) {
    localData.supportedLanguages.splice(index, 1);
  } else {
    localData.supportedLanguages.push(language);
  }
};

const removeLanguage = (language: string) => {
  const index = localData.supportedLanguages.indexOf(language);
  if (index > -1) {
    localData.supportedLanguages.splice(index, 1);
  }
};

// Integrations dropdown functions
const toggleIntegrationsDropdown = () => {
  isIntegrationsDropdownOpen.value = !isIntegrationsDropdownOpen.value;
};

const toggleIntegration = (integration: string) => {
  const index = localData.integrations.indexOf(integration);
  if (index > -1) {
    localData.integrations.splice(index, 1);
  } else {
    localData.integrations.push(integration);
  }
};

const removeIntegration = (integration: string) => {
  const index = localData.integrations.indexOf(integration);
  if (index > -1) {
    localData.integrations.splice(index, 1);
  }
};

// Support channels dropdown functions
const toggleSupportDropdown = () => {
  isSupportDropdownOpen.value = !isSupportDropdownOpen.value;
};

const toggleSupportChannel = (channel: string) => {
  const index = localData.supportChannels.indexOf(channel);
  if (index > -1) {
    localData.supportChannels.splice(index, 1);
  } else {
    localData.supportChannels.push(channel);
  }
};

const removeSupportChannel = (channel: string) => {
  const index = localData.supportChannels.indexOf(channel);
  if (index > -1) {
    localData.supportChannels.splice(index, 1);
  }
};

// Included features management
const addIncludedFeature = () => {
  localData.includedFeatures.push('');
};

const removeIncludedFeature = (index: number) => {
  if (localData.includedFeatures.length > 1) {
    localData.includedFeatures.splice(index, 1);
  }
};

const handleIncludedFeatureInput = (index: number) => {
  // If this is the last item and it's not empty, add a new empty item
  if (index === localData.includedFeatures.length - 1 && localData.includedFeatures[index].trim() !== '') {
    localData.includedFeatures.push('');
  }
};

// Target Audience dropdown
const isAudienceDropdownOpen = ref(false);

const availableTargetAudiences = [
  'Small Businesses',
  'Enterprises',
  'Startups',
  'Freelancers',
  'Developers',
  'Designers',
  'Marketers',
  'Sales Teams',
  'HR Teams',
  'Students',
  'Educators',
  'Non-profits',
  'Government',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Content Creators',
  'Consultants'
];

const toggleAudienceDropdown = () => {
  isAudienceDropdownOpen.value = !isAudienceDropdownOpen.value;
};

const toggleTargetAudience = (audience: string) => {
  const index = localData.targetAudience.indexOf(audience);
  if (index > -1) {
    localData.targetAudience.splice(index, 1);
  } else {
    localData.targetAudience.push(audience);
  }
};

const removeTargetAudience = (audience: string) => {
  const index = localData.targetAudience.indexOf(audience);
  if (index > -1) {
    localData.targetAudience.splice(index, 1);
  }
};

// Platform Support Functions
const togglePlatform = (platformKey: string) => {
  const index = localData.platformSupport.indexOf(platformKey);
  if (index > -1) {
    localData.platformSupport.splice(index, 1);
  } else {
    localData.platformSupport.push(platformKey);
  }
};

// Stage-specific Question Functions
const toggleFeedbackDropdown = () => {
  isFeedbackDropdownOpen.value = !isFeedbackDropdownOpen.value;
};

const toggleFeedbackMethod = (method: string) => {
  if (!localData.stageDetails.feedbackMethods) {
    localData.stageDetails.feedbackMethods = [];
  }
  const index = localData.stageDetails.feedbackMethods.indexOf(method);
  if (index > -1) {
    localData.stageDetails.feedbackMethods.splice(index, 1);
  } else {
    localData.stageDetails.feedbackMethods.push(method);
  }
};

const removeFeedbackMethod = (method: string) => {
  if (!localData.stageDetails.feedbackMethods) return;
  const index = localData.stageDetails.feedbackMethods.indexOf(method);
  if (index > -1) {
    localData.stageDetails.feedbackMethods.splice(index, 1);
  }
};

const toggleExpansionDropdown = () => {
  isExpansionDropdownOpen.value = !isExpansionDropdownOpen.value;
};

const toggleExpansionPlan = (plan: string) => {
  if (!localData.stageDetails.expansionPlans) {
    localData.stageDetails.expansionPlans = [];
  }
  const index = localData.stageDetails.expansionPlans.indexOf(plan);
  if (index > -1) {
    localData.stageDetails.expansionPlans.splice(index, 1);
  } else {
    localData.stageDetails.expansionPlans.push(plan);
  }
};

const removeExpansionPlan = (plan: string) => {
  if (!localData.stageDetails.expansionPlans) return;
  const index = localData.stageDetails.expansionPlans.indexOf(plan);
  if (index > -1) {
    localData.stageDetails.expansionPlans.splice(index, 1);
  }
};

// Watch for changes in the local data and emit updates
watch(localData, (newVal) => {
  emit('update-data', { ...newVal });
}, { deep: true });

// Submit the form data
const submitStep = () => {
  emit('update-data', { ...localData });
  emit('submit-step');
};

// Validate the form
const validateForm = () => {
  // Check if required fields are present
  const baseFieldsValid = localData.fullDescription && 
                         localData.fullDescription.trim() !== '' && 
                         localData.targetAudience && 
                         localData.targetAudience.length > 0 &&
                         localData.pricingModels &&
                         localData.pricingModels.length > 0 &&
                         localData.platformSupport &&
                         localData.platformSupport.length > 0 &&
                         localData.applicationStage &&
                         localData.applicationStage.trim() !== '';
  
  // Check new required fields for app landing page
  const appFieldsValid = localData.appVersion &&
                        localData.appVersion.trim() !== '' &&
                        localData.supportedLanguages &&
                        localData.supportedLanguages.length > 0 &&
                        localData.businessModel &&
                        localData.businessModel.trim() !== '' &&
                        localData.includedFeatures &&
                        localData.includedFeatures.filter(f => f.trim() !== '').length > 0;
  
  const featuresValid = localData.features.every(feature => {
    // Basic validation for title and description
    const basicValid = feature.title.trim() !== '' && feature.description.trim() !== '';
    
    // If a media type is selected, a file should be attached
    const mediaValid = !feature.media.mediaType || 
      (feature.media.mediaType && feature.media.file !== null);
      
    return basicValid && mediaValid;
  });
  
  // Stage-specific validation
  let stageSpecificValid = true;
  if (localData.applicationStage) {
    switch (localData.applicationStage) {
      case 'idea':
        stageSpecificValid = !!(localData.stageDetails.ideaValidation && 
                           localData.stageDetails.expectedLaunch);
        break;
      case 'mvp':
        stageSpecificValid = !!(localData.stageDetails.mvpFeatures && 
                           localData.stageDetails.userTesting);
        break;
      case 'beta':
        stageSpecificValid = !!(localData.stageDetails.betaUsers && 
                           localData.stageDetails.feedbackMethods && 
                           localData.stageDetails.feedbackMethods.length > 0);
        break;
      case 'live':
        stageSpecificValid = !!(localData.stageDetails.activeUsers && 
                           localData.stageDetails.revenueGeneration);
        break;
      case 'mature':
        stageSpecificValid = !!(localData.stageDetails.marketPosition && 
                           localData.stageDetails.expansionPlans && 
                           localData.stageDetails.expansionPlans.length > 0);
        break;
    }
  }
  
  return baseFieldsValid && appFieldsValid && featuresValid && stageSpecificValid;
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

.field-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.feature-item, .testimonial-item {
  background-color: var(--bg-gray);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.feature-header, .testimonial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.feature-header h4, .testimonial-header h4 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  border: 1px dashed var(--color-gray-300);
  background-color: transparent;
  color: var(--primary-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: rgb(220, 53, 69);
}

.section-divider {
  margin: var(--spacing-xl) 0;
  border-top: 1px solid var(--color-gray-200);
  padding-top: var(--spacing-md);
}

.section-divider h3 {
  color: var(--text-primary);
  font-size: 1.25rem;
  margin-bottom: var(--spacing-xs);
}

.section-divider p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Multi-select dropdown styles */
.multi-select-container {
  position: relative;
}

.multi-select-dropdown {
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
  transition: border-color var(--transition-fast);
}

.multi-select-dropdown:hover {
  border-color: var(--color-gray-400);
}

.multi-select-dropdown.open {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 136, 56, 0.1);
}

.selected-items {
  flex: 1;
}

.placeholder {
  color: var(--color-gray-500);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.tag-remove {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-remove:hover {
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
}

.dropdown-arrow {
  color: var(--color-gray-500);
  transition: transform var(--transition-fast);
}

.multi-select-dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--color-gray-300);
  border-top: none;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: var(--shadow-md);
}

.dropdown-option {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: background-color var(--transition-fast);
}

.dropdown-option:hover {
  background: var(--color-gray-50);
}

.dropdown-option.selected {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.dropdown-option input[type="checkbox"] {
  width: auto;
  margin: 0;
}

/* Feature Media Styling */
.media-type-selector {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.media-type-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.media-type-option input[type="radio"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.media-type-option label {
  margin-bottom: 0;
  cursor: pointer;
}

.feature-media-container {
  margin-top: var(--spacing-md);
}

.upload-container {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
  min-height: 120px;
}

.upload-container:hover {
  border-color: var(--primary-color);
}

.upload-container.has-file {
  border-style: solid;
  border-color: var(--color-gray-300);
}

.upload-placeholder {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  text-align: center;
  height: 100%;
  min-height: 120px;
}

.upload-placeholder:hover {
  background-color: var(--bg-gray);
}

.upload-placeholder Icon {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.upload-placeholder span {
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.upload-placeholder p {
  font-size: 0.875rem;
  margin: 0;
}

.upload-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: var(--spacing-md);
}

.upload-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.video-file-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--bg-gray);
  border-radius: var(--border-radius-sm);
  width: 100%;
}

.video-file-name Icon {
  color: var(--text-secondary);
}

.video-file-name span {
  font-size: 0.9rem;
  word-break: break-all;
}

.remove-file {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--text-secondary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.remove-file:hover {
  background-color: rgba(255, 255, 255, 1);
  color: rgb(220, 53, 69);
  transform: scale(1.1);
}

/* Platform Support Styles */
.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.platform-option {
  border: 2px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--light-color);
}

.platform-option:hover {
  border-color: var(--color-gray-300);
  box-shadow: var(--shadow-sm);
}

.platform-option.selected {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.platform-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.platform-header input[type="checkbox"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.platform-name {
  font-weight: 500;
  color: var(--text-primary);
}

.platform-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  margin-left: calc(var(--spacing-sm) + 16px + var(--spacing-sm)); /* Align with the text after checkbox and icon */
}

/* Stage-specific Question Styles */
.stage-specific-questions {
  margin-top: var(--spacing-lg);
  background-color: var(--bg-gray);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.stage-questions h4 {
  color: var(--primary-color);
  font-size: 1.1rem;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-gray-200);
}

/* Responsive Platform Grid */
@media (max-width: 1024px) {
  .platform-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

/* Checkbox Group Styles */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.checkbox-item input[type="checkbox"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.checkbox-item label {
  margin-bottom: 0;
  cursor: pointer;
  font-weight: 400;
}

/* Feature Input Item Styles */
.feature-input-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.feature-input-item input {
  flex: 1;
}

.remove-feature-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid var(--color-gray-300);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.remove-feature-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  border-color: rgb(220, 53, 69);
  color: rgb(220, 53, 69);
}

.add-feature-btn {
  background: none;
  border: 1px dashed var(--color-gray-300);
  color: var(--primary-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.add-feature-btn:hover {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

@media (max-width: 768px) {
  .step-container {
    padding: var(--spacing-lg);
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .feature-item, .testimonial-item {
    padding: var(--spacing-md);
  }
  
  .media-type-selector {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .platform-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .platform-option {
    padding: var(--spacing-sm);
  }
  
  .platform-description {
    margin-left: calc(var(--spacing-xs) + 16px + var(--spacing-xs));
  }
  
  .stage-specific-questions {
    padding: var(--spacing-md);
  }
}
</style>
