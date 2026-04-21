<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Media Assets</h2>
      <p>Upload images and videos to showcase your product</p>
    </div>

    <form @submit.prevent="submitStep">
      <div class="form-group">
        <label>Product Logo*</label>
        <div class="upload-container" :class="{ 'has-file': logoPreview }">
          <div class="upload-preview" v-if="logoPreview">
            <img :src="logoPreview" alt="Logo preview" />
            <button type="button" class="remove-file" @click="removeLogo">
              <UIcon dynamic name="i-heroicons-x-mark" />
            </button>
          </div>
          <div class="upload-placeholder" v-else @click="triggerLogoUpload">
            <UIcon dynamic name="i-heroicons-photo" />
            <span>Upload your product logo</span>
            <p>Click to browse or drag and drop<br>PNG, JPG, or SVG (max 2MB)</p>
          </div>
          <input 
            type="file" 
            id="logo-upload" 
            ref="logoInput"
            accept="image/png, image/jpeg, image/svg+xml"
            @change="handleLogoUpload"
            hidden
          />
        </div>
        <p class="field-hint">Your logo will appear prominently in your product listing</p>
      </div>

      <div class="form-group">
        <label>Product Screenshots*</label>
        <p class="field-hint">Upload at least one screenshot of your product in action (max 5 images)</p>
        
        <div class="upload-grid">
          <div 
            v-for="(preview, index) in screenshotPreviews" 
            :key="index" 
            class="upload-container has-file small"
          >
            <div class="upload-preview">
              <img :src="preview" :alt="`Screenshot ${index + 1}`" />
              <button type="button" class="remove-file" @click="removeScreenshot(index)">
                <UIcon dynamic name="i-heroicons-x-mark" />
              </button>
            </div>
          </div>

          <div 
            v-if="screenshotPreviews.length < 5" 
            class="upload-container small"
            @click="triggerScreenshotUpload"
          >
            <div class="upload-placeholder">
              <UIcon dynamic name="i-heroicons-plus" />
              <span>Add Screenshot</span>
            </div>
            <input 
              type="file" 
              id="screenshot-upload" 
              ref="screenshotInput"
              accept="image/png, image/jpeg"
              @change="handleScreenshotUpload"
              hidden
            />
          </div>
        </div>
      </div>

      <div class="section-divider">
        <h3>Product Videos (Optional)</h3>
        <p>Add demo or promotional videos to showcase your product</p>
      </div>

      <!-- Existing Videos Display -->
      <div v-if="localData.videos.length > 0 || localData.uploadedVideos.length > 0" class="videos-list">
        <!-- URL-based videos -->
        <div v-for="(video, index) in localData.videos" :key="`url-${index}`" class="video-item">
          <div class="video-header">
            <span class="video-type-badge">{{ video.type.toUpperCase() }}</span>
            <button type="button" class="remove-video-btn" @click="removeUrlVideo(index)">
              <UIcon dynamic name="i-heroicons-x-mark" />
            </button>
          </div>
          <div class="video-preview">
            <div v-if="video.type === 'youtube'" class="video-embed">
              <iframe 
                :src="`https://www.youtube.com/embed/${video.id}`"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <div v-else-if="video.type === 'vimeo'" class="video-embed">
              <iframe 
                :src="`https://player.vimeo.com/video/${video.id}`"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
          <p class="video-url">{{ video.url }}</p>
        </div>

        <!-- Uploaded videos -->
        <div v-for="(videoData, index) in localData.uploadedVideos" :key="`upload-${index}`" class="video-item">
          <div class="video-header">
            <span class="video-type-badge">UPLOADED</span>
            <button type="button" class="remove-video-btn" @click="removeUploadedVideoByIndex(index)">
              <UIcon dynamic name="i-heroicons-x-mark" />
            </button>
          </div>
          <div class="video-thumbnail" @click="openVideoModal(videoData.preview)">
            <video :src="videoData.preview" preload="metadata" class="video-thumbnail-player" muted>
              Your browser does not support the video tag.
            </video>
            <div class="play-overlay">
              <UIcon dynamic name="i-heroicons-play-circle" class="play-icon" />
              <span>Click to preview</span>
            </div>
          </div>
          <p class="video-name">{{ videoData.file.name }}</p>
        </div>
      </div>

      <!-- Add Video Buttons -->
      <div class="add-video-section">
        <div class="add-video-buttons">
          <button type="button" class="add-video-btn" @click="showAddVideoModal = true">
            <UIcon dynamic name="i-heroicons-plus" />
            Add Video URL
          </button>
          <button type="button" class="add-video-btn" @click="triggerVideoUpload">
            <UIcon dynamic name="i-heroicons-arrow-up-tray" />
            Upload Video
          </button>
        </div>
      </div>

      <!-- Hidden video upload input -->
      <input 
        type="file" 
        id="video-upload" 
        ref="videoInput"
        accept="video/mp4, video/webm, video/mov, video/avi"
        @change="handleVideoUpload"
        hidden
      />

      <!-- Add Video URL Modal -->
      <div v-if="showAddVideoModal" class="video-modal-overlay" @click="closeAddVideoModal">
        <div class="video-modal add-video-modal" @click.stop>
          <div class="video-modal-header">
            <h3>Add Video URLs</h3>
            <button type="button" class="modal-close" @click="closeAddVideoModal">
              <UIcon dynamic name="i-heroicons-x-mark" />
            </button>
          </div>
          <div class="video-modal-content">
            <div class="video-urls-container">
              <!-- Existing Video URLs List -->
              <div v-if="videoUrlsToAdd.length > 0" class="video-urls-list">
                <h4>Videos to Add:</h4>
                <div v-for="(videoUrl, index) in videoUrlsToAdd" :key="index" class="video-url-item">
                  <div class="video-url-preview">
                    <span class="video-type-badge">{{ videoUrl.type.toUpperCase() }}</span>
                    <div class="video-url-text">{{ videoUrl.url }}</div>
                    <button type="button" class="remove-url-btn" @click="removeVideoUrlFromList(index)">
                      <UIcon dynamic name="i-heroicons-trash" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add New Video URL Form -->
              <div class="add-video-form">
                <h4>{{ videoUrlsToAdd.length > 0 ? 'Add Another Video' : 'Add Video URL' }}</h4>
                <div class="form-group">
                  <label for="newVideoType">Video Source</label>
                  <select id="newVideoType" v-model="newVideo.type" class="form-select">
                    <option value="">Select source</option>
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                  </select>
                </div>
                <div class="form-group" v-if="newVideo.type">
                  <label for="newVideoUrl">Video URL</label>
                  <input 
                    type="text" 
                    id="newVideoUrl" 
                    v-model="newVideo.url" 
                    class="form-input"
                    :placeholder="`Enter ${newVideo.type === 'youtube' ? 'YouTube' : 'Vimeo'} video URL`"
                    @keyup.enter="addVideoToList"
                  />
                  <p class="field-hint">
                    {{ newVideo.type === 'youtube' 
                      ? 'Example: https://www.youtube.com/watch?v=abcd1234' 
                      : 'Example: https://vimeo.com/123456789' 
                    }}
                  </p>
                  <button 
                    type="button" 
                    class="btn-add-url" 
                    @click="addVideoToList" 
                    :disabled="!isNewVideoValid"
                  >
                    <UIcon dynamic name="i-heroicons-plus" />
                    Add to List
                  </button>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeAddVideoModal">Cancel</button>
              <button 
                type="button" 
                class="btn-primary" 
                @click="addAllVideoUrls" 
                :disabled="videoUrlsToAdd.length === 0"
              >
                Add {{ videoUrlsToAdd.length }} Video{{ videoUrlsToAdd.length !== 1 ? 's' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Video Preview Modal -->
    <div v-if="isVideoModalOpen" class="video-modal-overlay" @click="closeVideoModal">
      <div class="video-modal" @click.stop>
        <div class="video-modal-header">
          <h3>Video Preview</h3>
          <button type="button" class="modal-close" @click="closeVideoModal">
            <UIcon dynamic name="i-heroicons-x-mark" />
          </button>
        </div>
        <div class="video-modal-content">
          <video v-if="currentVideoPreview" :src="currentVideoPreview" controls autoplay class="modal-video-player">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';

interface MediaAssetFormData {
  logo: File | null;
  screenshots: File[];
  videos: Array<{
    type: string;
    url: string;
    id: string;
  }>;
  uploadedVideos: Array<{
    file: File;
    preview: string;
  }>;
  [key: string]: any; // For any other properties
}

const props = defineProps({
  formData: {
    type: Object as () => MediaAssetFormData,
    required: true
  }
});

const emit = defineEmits(['update-data', 'submit-step', 'go-back']);

// References to file inputs
const logoInput = ref<HTMLInputElement | null>(null);
const screenshotInput = ref<HTMLInputElement | null>(null);
const videoInput = ref<HTMLInputElement | null>(null);

// Create a local copy of the data
const localData = reactive<{
  logo: File | null;
  screenshots: File[];
  videos: Array<{type: string; url: string; id: string}>;
  uploadedVideos: Array<{file: File; preview: string}>;
}>({
  logo: props.formData.logo || null,
  screenshots: props.formData.screenshots || [],
  videos: props.formData.videos || [],
  uploadedVideos: props.formData.uploadedVideos || []
});

// Image previews
const logoPreview = ref<string | null>(props.formData.logo ? URL.createObjectURL(props.formData.logo) : null);
const screenshotPreviews = ref<string[]>([]);

// Video modal state
const isVideoModalOpen = ref(false);
const currentVideoPreview = ref<string | null>(null);

// Add video modal state
const showAddVideoModal = ref(false);
const newVideo = reactive({
  type: '',
  url: ''
});
const videoUrlsToAdd = ref<Array<{type: string; url: string; id: string}>>([]);

// Initialize screenshot previews if any exist
if (props.formData.screenshots && props.formData.screenshots.length > 0) {
  screenshotPreviews.value = props.formData.screenshots.map((file: File) => URL.createObjectURL(file));
}

// Logo upload handlers
const triggerLogoUpload = () => {
  logoInput.value?.click();
};

const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }
    
    localData.logo = file;
    logoPreview.value = URL.createObjectURL(file);
    
    emit('update-data', { logo: file });
  }
};

const removeLogo = () => {
  localData.logo = null;
  logoPreview.value = null;
  if (logoInput.value) logoInput.value.value = '';
  
  emit('update-data', { logo: null });
};

// Screenshot upload handlers
const triggerScreenshotUpload = () => {
  screenshotInput.value?.click();
};

const handleScreenshotUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Screenshot file size must be less than 5MB');
      return;
    }
    
    // Add to local data
    localData.screenshots.push(file);
    screenshotPreviews.value.push(URL.createObjectURL(file));
    
    // Reset input
    if (screenshotInput.value) screenshotInput.value.value = '';
    
    emit('update-data', { screenshots: [...localData.screenshots] });
  }
};

const removeScreenshot = (index: number) => {
  localData.screenshots.splice(index, 1);
  screenshotPreviews.value.splice(index, 1);
  
  emit('update-data', { screenshots: [...localData.screenshots] });
};

// Video upload handlers
const triggerVideoUpload = () => {
  videoInput.value?.click();
};

const handleVideoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video file size must be less than 100MB');
      return;
    }
    
    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid video file (MP4, WebM, MOV, or AVI)');
      return;
    }
    
    const preview = URL.createObjectURL(file);
    const videoData = { file, preview };
    
    localData.uploadedVideos.push(videoData);
    
    // Reset input
    if (videoInput.value) videoInput.value.value = '';
    
    emit('update-data', { uploadedVideos: [...localData.uploadedVideos] });
  }
};

const removeUploadedVideoByIndex = (index: number) => {
  const videoData = localData.uploadedVideos[index];
  if (videoData && videoData.preview) {
    URL.revokeObjectURL(videoData.preview);
  }
  localData.uploadedVideos.splice(index, 1);
  
  emit('update-data', { uploadedVideos: [...localData.uploadedVideos] });
};

const removeUrlVideo = (index: number) => {
  localData.videos.splice(index, 1);
  emit('update-data', { videos: [...localData.videos] });
};

// Video modal functions
const openVideoModal = (videoSrc?: string) => {
  if (videoSrc) {
    currentVideoPreview.value = videoSrc;
  }
  isVideoModalOpen.value = true;
};

const closeVideoModal = () => {
  isVideoModalOpen.value = false;
  currentVideoPreview.value = null;
};

// Add video URL modal functions
const closeAddVideoModal = () => {
  showAddVideoModal.value = false;
  newVideo.type = '';
  newVideo.url = '';
  videoUrlsToAdd.value = [];
};

const isNewVideoValid = computed(() => {
  if (!newVideo.type || !newVideo.url) return false;
  
  if (newVideo.type === 'youtube') {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(newVideo.url);
  }
  
  if (newVideo.type === 'vimeo') {
    return /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/.test(newVideo.url);
  }
  
  return false;
});

const addVideoToList = () => {
  if (!isNewVideoValid.value) return;
  
  const videoId = newVideo.type === 'youtube' ? getYoutubeId(newVideo.url) : getVimeoId(newVideo.url);
  const videoObj = {
    type: newVideo.type,
    url: newVideo.url,
    id: videoId
  };
  
  videoUrlsToAdd.value.push(videoObj);
  
  // Clear form for next video
  newVideo.type = '';
  newVideo.url = '';
};

const removeVideoUrlFromList = (index: number) => {
  videoUrlsToAdd.value.splice(index, 1);
};

const addAllVideoUrls = () => {
  if (videoUrlsToAdd.value.length === 0) return;
  
  // Add all videos from the list to the main videos array
  localData.videos.push(...videoUrlsToAdd.value);
  emit('update-data', { videos: [...localData.videos] });
  
  closeAddVideoModal();
};

const addVideoUrl = () => {
  // Legacy function - now just calls addVideoToList and addAllVideoUrls
  addVideoToList();
  if (videoUrlsToAdd.value.length > 0) {
    addAllVideoUrls();
  }
};

// Extract video IDs for embedding
const getYoutubeId = (url: string): string => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : '';
};

const getVimeoId = (url: string): string => {
  const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
  const match = url.match(regExp);
  return match ? match[5] : '';
};

// Submit the form data
const submitStep = () => {
  // All data is already being updated via watchers
  emit('submit-step');
};

// Validate the form
const validateForm = () => {
  const logoValid = localData.logo !== null;
  const screenshotsValid = localData.screenshots.length > 0;
  
  // Videos are optional, so validation always passes
  const videoValid = true;
  
  return logoValid && screenshotsValid && videoValid;
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
  margin-bottom: var(--spacing-xl);
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

.upload-container {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
}

.upload-container:hover {
  border-color: var(--primary-color);
}

.upload-container.has-file {
  border-style: solid;
  border-color: var(--color-gray-300);
}

.upload-placeholder {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  text-align: center;
}

.upload-placeholder:hover {
  background-color: var(--bg-gray);
}

.upload-placeholder Icon {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.upload-placeholder span {
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
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
}

.upload-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
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

.upload-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.upload-container.small {
  height: 150px;
}

.upload-container.small .upload-placeholder {
  padding: var(--spacing-md);
}

.upload-container.small .upload-placeholder span {
  font-size: 0.9rem;
}

.upload-container.small .upload-placeholder p {
  display: none;
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

.video-preview {
  margin-top: var(--spacing-md);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.video-embed {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.video-embed iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  cursor: pointer;
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.video-thumbnail-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background-color 0.3s ease;
}

.play-overlay:hover {
  background: rgba(0, 0, 0, 0.7);
}

.play-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-sm);
}

.play-overlay span {
  font-size: 0.9rem;
  font-weight: 500;
}

.video-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.video-modal {
  background: white;
  border-radius: var(--border-radius-lg);
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.video-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
}

.video-modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: var(--bg-gray);
  color: var(--text-primary);
}

.video-modal-content {
  padding: 0;
}

.modal-video-player {
  width: 100%;
  height: auto;
  max-height: 70vh;
  display: block;
}

.videos-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.video-item {
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background: white;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-gray);
  border-bottom: 1px solid var(--color-gray-200);
}

.video-type-badge {
  background: var(--primary-color);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.remove-video-btn {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.remove-video-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: rgb(220, 53, 69);
}

.video-url, .video-name {
  padding: var(--spacing-sm) var(--spacing-md);
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: var(--bg-gray);
  border-top: 1px solid var(--color-gray-200);
  word-break: break-all;
}

.add-video-section {
  margin: var(--spacing-xl) 0;
}

.add-video-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.add-video-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.add-video-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.05);
}

.add-video-modal {
  max-width: 700px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.add-video-modal .video-modal-content {
  padding: var(--spacing-lg);
}

.video-urls-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.video-urls-list {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  background: var(--bg-gray);
}

.video-urls-list h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.video-url-item {
  margin-bottom: var(--spacing-md);
}

.video-url-item:last-child {
  margin-bottom: 0;
}

.video-url-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-sm);
}

.video-url-text {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-secondary);
  word-break: break-all;
}

.remove-url-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.remove-url-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: rgb(220, 53, 69);
}

.add-video-form {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.add-video-form h4 {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.form-select, .form-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-select:focus, .form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.btn-add-url {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  margin-top: var(--spacing-md);
}

.btn-add-url:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.btn-add-url:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-video-modal .form-group {
  margin-bottom: var(--spacing-lg);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
}

.btn-secondary {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-gray);
}

.btn-primary {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-md);
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .step-container {
    padding: var(--spacing-lg);
  }
  
  .upload-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .videos-list {
    grid-template-columns: 1fr;
  }

  .add-video-buttons {
    flex-direction: column;
    align-items: center;
  }

  .add-video-btn {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }

  .video-modal {
    width: 95vw;
    max-height: 95vh;
  }

  .add-video-modal {
    width: 95vw;
    max-height: 90vh;
  }

  .video-urls-container {
    gap: var(--spacing-lg);
  }

  .video-url-preview {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .video-url-text {
    text-align: center;
    word-break: break-word;
  }

  .video-modal-overlay {
    padding: var(--spacing-md);
  }
}

@media (max-width: 576px) {
  .upload-grid {
    grid-template-columns: 1fr 1fr;
  }

  .video-modal-header {
    padding: var(--spacing-md);
  }

  .video-modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-secondary, .btn-primary {
    width: 100%;
  }

  .add-video-form, .video-urls-list {
    padding: var(--spacing-md);
  }

  .video-url-preview {
    padding: var(--spacing-sm);
  }

  .btn-add-url {
    width: 100%;
    justify-content: center;
  }
}
</style>
