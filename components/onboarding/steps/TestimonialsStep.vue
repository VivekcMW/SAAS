<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Customer Testimonials</h2>
      <p>Share what your customers are saying about your product</p>
    </div>

    <form @submit.prevent="submitStep">
      <div class="testimonials-intro">
        <p>Customer testimonials help build trust and credibility for your product. Add testimonials from satisfied customers to showcase the value and impact of your solution.</p>
      </div>

      <div 
        v-for="(testimonial, index) in localData.testimonials" 
        :key="index" 
        class="testimonial-item"
      >
        <div class="testimonial-header">
          <h4>Testimonial {{ index + 1 }}</h4>
          <button 
            type="button" 
            class="remove-btn"
            v-if="localData.testimonials.length > 1"
            @click="removeTestimonial(index)"
          >
            <UIcon dynamic name="i-heroicons-trash" />
          </button>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label :for="`testimonial-author-${index}`">Author Name*</label>
            <input 
              :id="`testimonial-author-${index}`" 
              v-model="testimonial.author" 
              required 
              placeholder="John Smith"
            />
          </div>
          
          <div class="form-group">
            <label :for="`testimonial-role-${index}`">Role/Title*</label>
            <input 
              :id="`testimonial-role-${index}`" 
              v-model="testimonial.role" 
              required 
              placeholder="CEO"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label :for="`testimonial-company-${index}`">Company*</label>
          <input 
            :id="`testimonial-company-${index}`" 
            v-model="testimonial.company" 
            required 
            placeholder="Company Name"
          />
        </div>
        
        <div class="form-group">
          <label :for="`testimonial-content-${index}`">Quote*</label>
          <textarea 
            :id="`testimonial-content-${index}`" 
            v-model="testimonial.content" 
            required 
            placeholder="What did they say about your product? Include the full testimonial quote."
            rows="4"
          ></textarea>
          <p class="field-hint">Include the complete testimonial quote that highlights the value your product provided</p>
        </div>

        <!-- Optional: Testimonial Rating -->
        <div class="form-group">
          <label :for="`testimonial-rating-${index}`">Rating (Optional)</label>
          <select :id="`testimonial-rating-${index}`" v-model="testimonial.rating">
            <option value="">No rating</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 stars)</option>
            <option value="3">⭐⭐⭐ (3 stars)</option>
            <option value="2">⭐⭐ (2 stars)</option>
            <option value="1">⭐ (1 star)</option>
          </select>
          <p class="field-hint">If the customer provided a star rating, you can include it here</p>
        </div>

        <!-- Optional: Customer Photo -->
        <div class="form-group">
          <label>Customer Photo (Optional)</label>
          <p class="field-hint">A professional photo of the customer can add credibility to the testimonial</p>
          
          <div v-if="!testimonial.photo" class="upload-container" @click="triggerPhotoUpload(index)">
            <div class="upload-placeholder">
              <UIcon dynamic name="i-heroicons-user-circle" />
              <span>Upload Customer Photo</span>
              <p>Click to browse or drag and drop<br>PNG, JPG (max 2MB)</p>
            </div>
            <input 
              type="file" 
              :ref="el => { if(el) photoInputsMap[index] = el as HTMLInputElement }"
              accept="image/png, image/jpeg"
              @change="(event) => handlePhotoUpload(event, index)"
              hidden
            />
          </div>
          
          <div v-else class="upload-container has-file">
            <div class="upload-preview">
              <img :src="testimonial.photoPreview" :alt="`${testimonial.author} photo`" />
              <button type="button" class="remove-file" @click="removePhoto(index)">
                <UIcon dynamic name="i-heroicons-x-mark" />
              </button>
            </div>
          </div>
        </div>

        <!-- Screenshot/Proof Upload -->
        <div class="form-group">
          <label>Testimonial Proof/Screenshot (Optional)</label>
          <p class="field-hint">Upload a screenshot, email, or document that validates this testimonial (e.g., review screenshot, email conversation, social media post)</p>
          
          <div v-if="!testimonial.screenshot" class="upload-container" @click="triggerScreenshotUpload(index)">
            <div class="upload-placeholder">
              <UIcon dynamic name="i-heroicons-camera" />
              <span>Upload Proof Screenshot</span>
              <p>Click to browse or drag and drop<br>PNG, JPG, PDF (max 5MB)</p>
            </div>
            <input 
              type="file" 
              :ref="el => { if(el) screenshotInputsMap[index] = el as HTMLInputElement }"
              accept="image/png, image/jpeg, application/pdf"
              @change="(event) => handleScreenshotUpload(event, index)"
              hidden
            />
          </div>
          
          <div v-else class="upload-container has-file">
            <div class="upload-preview">
              <div v-if="testimonial.screenshotType === 'image'" class="screenshot-preview">
                <img :src="testimonial.screenshotPreview" :alt="`Testimonial proof for ${testimonial.author}`" />
                <div class="screenshot-overlay">
                  <UIcon dynamic name="i-heroicons-eye" />
                  <span>Screenshot Proof</span>
                </div>
              </div>
              <div v-else-if="testimonial.screenshotType === 'pdf'" class="pdf-preview">
                <UIcon dynamic name="i-heroicons-document" />
                <div class="file-info">
                  <span class="file-name">{{ testimonial.screenshot?.name }}</span>
                  <span class="file-type">PDF Document</span>
                </div>
              </div>
              <button type="button" class="remove-file" @click="removeScreenshot(index)">
                <UIcon dynamic name="i-heroicons-x-mark" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        type="button" 
        class="add-btn"
        @click="addTestimonial"
      >
        <UIcon dynamic name="i-heroicons-plus-circle" />
        Add Another Testimonial
      </button>

      <div class="testimonials-tips">
        <h4>💡 Tips for Great Testimonials</h4>
        <ul>
          <li><strong>Specific results:</strong> Include numbers, percentages, or specific outcomes when possible</li>
          <li><strong>Authentic voice:</strong> Use the customer's actual words and speaking style</li>
          <li><strong>Relevant context:</strong> Choose testimonials from customers similar to your target audience</li>
          <li><strong>Visual proof:</strong> Screenshots of reviews, emails, or social media posts add credibility</li>
          <li><strong>Permission:</strong> Always get permission before using customer testimonials and screenshots</li>
        </ul>
        
        <div class="proof-examples">
          <h5>📷 Good Proof Examples:</h5>
          <ul>
            <li>Screenshot of a positive review on Google/Yelp</li>
            <li>Social media post mentioning your product</li>
            <li>Email testimonial from the customer</li>
            <li>App store review screenshot</li>
            <li>LinkedIn recommendation or post</li>
          </ul>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

// Define interfaces for our data structures
interface Testimonial {
  author: string;
  company: string;
  role: string;
  content: string;
  rating?: string;
  photo?: File | null;
  photoPreview?: string;
  screenshot?: File | null;
  screenshotPreview?: string;
  screenshotType?: 'image' | 'pdf' | null;
}

interface TestimonialsFormData {
  testimonials: Testimonial[];
}

const props = defineProps({
  formData: {
    type: Object as () => TestimonialsFormData,
    required: true
  }
});

const emit = defineEmits(['update-data', 'submit-step', 'go-back']);

// References to file inputs
const photoInputsMap: {[key: number]: HTMLInputElement | null} = {};
const screenshotInputsMap: {[key: number]: HTMLInputElement | null} = {};

// Create a local copy of the data
const localData = reactive<TestimonialsFormData>({
  testimonials: props.formData.testimonials && props.formData.testimonials.length > 0 
    ? [...props.formData.testimonials.map(t => ({
        author: t.author || '',
        company: t.company || '',
        role: t.role || '',
        content: t.content || '',
        rating: (t as any).rating || '',
        photo: (t as any).photo || null,
        photoPreview: (t as any).photoPreview || undefined,
        screenshot: (t as any).screenshot || null,
        screenshotPreview: (t as any).screenshotPreview || undefined,
        screenshotType: (t as any).screenshotType || null
      }))]
    : [{ 
        author: '', 
        company: '', 
        role: '', 
        content: '', 
        rating: '', 
        photo: null, 
        photoPreview: undefined,
        screenshot: null,
        screenshotPreview: undefined,
        screenshotType: null
      }]
});

// Add a new testimonial
const addTestimonial = () => {
  localData.testimonials.push({ 
    author: '', 
    company: '', 
    role: '', 
    content: '', 
    rating: '', 
    photo: null, 
    photoPreview: undefined,
    screenshot: null,
    screenshotPreview: undefined,
    screenshotType: null
  });
};

// Remove a testimonial
const removeTestimonial = (index: number) => {
  // Clean up photo preview URL if exists to avoid memory leaks
  const testimonial = localData.testimonials[index];
  if (testimonial.photoPreview) {
    URL.revokeObjectURL(testimonial.photoPreview);
  }
  // Clean up screenshot preview URL if exists
  if (testimonial.screenshotPreview) {
    URL.revokeObjectURL(testimonial.screenshotPreview);
  }
  localData.testimonials.splice(index, 1);
};

// Trigger file input click for photo upload
const triggerPhotoUpload = (index: number) => {
  if (photoInputsMap[index]) {
    photoInputsMap[index]?.click();
  }
};

// Handle photo upload
const handlePhotoUpload = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPEG, etc.)');
      return;
    }
    
    // Clean up old preview URL if exists
    if (localData.testimonials[index].photoPreview) {
      URL.revokeObjectURL(localData.testimonials[index].photoPreview!);
    }
    
    // Update testimonial photo
    localData.testimonials[index].photo = file;
    localData.testimonials[index].photoPreview = URL.createObjectURL(file);
  }
};

// Remove photo
const removePhoto = (index: number) => {
  // Clean up preview URL if exists
  if (localData.testimonials[index].photoPreview) {
    URL.revokeObjectURL(localData.testimonials[index].photoPreview!);
  }
  
  // Reset photo
  localData.testimonials[index].photo = null;
  localData.testimonials[index].photoPreview = undefined;
  
  // Reset input value if exists
  if (photoInputsMap[index]) {
    photoInputsMap[index]!.value = '';
  }
};

// Screenshot/Proof Upload Functions
// Trigger file input click for screenshot upload
const triggerScreenshotUpload = (index: number) => {
  if (screenshotInputsMap[index]) {
    screenshotInputsMap[index]?.click();
  }
};

// Handle screenshot upload
const handleScreenshotUpload = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    
    if (!isImage && !isPdf) {
      alert('Please select an image file (PNG, JPEG) or PDF document');
      return;
    }
    
    // Clean up old preview URL if exists
    if (localData.testimonials[index].screenshotPreview) {
      URL.revokeObjectURL(localData.testimonials[index].screenshotPreview!);
    }
    
    // Update testimonial screenshot
    localData.testimonials[index].screenshot = file;
    localData.testimonials[index].screenshotType = isImage ? 'image' : 'pdf';
    
    // Generate preview URL for image
    if (isImage) {
      localData.testimonials[index].screenshotPreview = URL.createObjectURL(file);
    }
  }
};

// Remove screenshot
const removeScreenshot = (index: number) => {
  // Clean up preview URL if exists
  if (localData.testimonials[index].screenshotPreview) {
    URL.revokeObjectURL(localData.testimonials[index].screenshotPreview!);
  }
  
  // Reset screenshot
  localData.testimonials[index].screenshot = null;
  localData.testimonials[index].screenshotPreview = undefined;
  localData.testimonials[index].screenshotType = null;
  
  // Reset input value if exists
  if (screenshotInputsMap[index]) {
    screenshotInputsMap[index]!.value = '';
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
  const testimonialsValid = localData.testimonials.every(
    testimonial => testimonial.author.trim() !== '' && 
                   testimonial.company.trim() !== '' && 
                   testimonial.role.trim() !== '' && 
                   testimonial.content.trim() !== ''
  );
  
  return testimonialsValid;
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

.testimonials-intro {
  background-color: rgba(var(--primary-color-rgb), 0.05);
  border-left: 4px solid var(--primary-color);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
}

.testimonials-intro p {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.6;
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

.testimonial-item {
  background-color: var(--bg-gray);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-gray-200);
}

.testimonial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.testimonial-header h4 {
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
  margin-bottom: var(--spacing-xl);
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

/* Upload container styles */
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
  max-height: 100px;
  object-fit: cover;
  border-radius: 50%;
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

/* Tips section */
.testimonials-tips {
  background-color: var(--light-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-xl);
  border: 1px solid var(--color-gray-200);
}

.testimonials-tips h4 {
  color: var(--primary-color);
  font-size: 1.1rem;
  margin-bottom: var(--spacing-md);
}

.testimonials-tips ul {
  margin: 0;
  padding-left: var(--spacing-lg);
}

.testimonials-tips li {
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
}

.testimonials-tips li:last-child {
  margin-bottom: 0;
}

.proof-examples {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-gray-200);
}

.proof-examples h5 {
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.proof-examples ul {
  margin: 0;
  padding-left: var(--spacing-lg);
}

.proof-examples li {
  margin-bottom: var(--spacing-xs);
  font-size: 0.9rem;
  line-height: 1.5;
}

.proof-examples li:last-child {
  margin-bottom: 0;
}

/* Screenshot/Proof Upload Styles */
.screenshot-preview {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-radius: var(--border-radius-sm);
}

.screenshot-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.screenshot-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
}

.pdf-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-gray);
  border-radius: var(--border-radius-sm);
  width: 100%;
}

.pdf-preview UIcon {
  color: var(--primary-color);
  font-size: 2rem;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.file-name {
  font-weight: 500;
  color: var(--text-primary);
  word-break: break-all;
  font-size: 0.9rem;
}

.file-type {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 500;
}

@media (max-width: 768px) {
  .step-container {
    padding: var(--spacing-lg);
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .testimonial-item {
    padding: var(--spacing-md);
  }
  
  .screenshot-preview {
    height: 120px;
  }
  
  .pdf-preview {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .pdf-preview UIcon {
    font-size: 1.5rem;
  }
}
</style>
