<template>
  <div class="reviews-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
      <div class="title-section">
        <h1>Customer Reviews</h1>
        <p>Monitor customer feedback and analyze global sentiment trends</p>
        <div class="reply-stats">
          <span class="stat-item">
            <UIcon dynamic name="i-heroicons-chat-bubble-left-right" />
            {{ replyStats.totalReplies }} Total Replies
          </span>
          <span class="stat-item">
            <UIcon dynamic name="i-heroicons-check-circle" />
            {{ replyStats.withReplies }}/{{ replyStats.total }} Reviews Replied
          </span>
          <span class="stat-item">
            <UIcon dynamic name="i-heroicons-calculator" />
            {{ replyStats.averageRepliesPerReview }} Avg Replies per Review
          </span>
        </div>
      </div>
      </div>
    </div>

    <!-- Sentiment Overview Cards -->
    <div class="sentiment-overview">
      <div class="sentiment-card positive">
        <div class="sentiment-icon">
          <UIcon dynamic name="i-heroicons-face-smile" />
        </div>
        <div class="sentiment-info">
          <h4>Positive</h4>
          <span class="sentiment-count">{{ sentimentData.positive }}%</span>
          <span class="sentiment-change positive">+5.2%</span>
        </div>
      </div>
      
      <div class="sentiment-card neutral">
        <div class="sentiment-icon">
          <UIcon dynamic name="i-heroicons-minus" />
        </div>
        <div class="sentiment-info">
          <h4>Neutral</h4>
          <span class="sentiment-count">{{ sentimentData.neutral }}%</span>
          <span class="sentiment-change neutral">-1.8%</span>
        </div>
      </div>
      
      <div class="sentiment-card negative">
        <div class="sentiment-icon">
          <UIcon dynamic name="i-heroicons-face-frown" />
        </div>
        <div class="sentiment-info">
          <h4>Negative</h4>
          <span class="sentiment-count">{{ sentimentData.negative }}%</span>
          <span class="sentiment-change negative">-3.4%</span>
        </div>
      </div>

      <div class="sentiment-card overall">
        <div class="sentiment-icon">
          <UIcon dynamic name="i-heroicons-star" />
        </div>
        <div class="sentiment-info">
          <h4>Overall Rating</h4>
          <span class="sentiment-count">{{ overallRating }}</span>
          <span class="sentiment-change positive">+0.3</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Filters and Controls -->
      <div class="reviews-controls">
        <div class="filter-section">
          <div class="filter-group">
            <label>Sentiment:</label>
            <select v-model="selectedSentiment" class="filter-select">
              <option value="all">All Reviews</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Product:</label>
            <select v-model="selectedProduct" class="filter-select">
              <option value="all">All Products</option>
              <option value="TaskFlow Pro">TaskFlow Pro</option>
              <option value="Analytics Hub">Analytics Hub</option>
              <option value="Design Studio">Design Studio</option>
              <option value="CRM Master">CRM Master</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Rating:</label>
            <select v-model="selectedRating" class="filter-select">
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>User Status:</label>
            <select v-model="selectedUserStatus" class="filter-select">
              <option value="all">All Users</option>
              <option value="verified">Verified Only</option>
              <option value="suspicious">Suspicious Only</option>
            </select>
          </div>
        </div>
        
        <div class="search-section">
          <div class="search-box">
            <UIcon dynamic name="i-heroicons-magnifying-glass" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search reviews..."
              class="search-input"
            >
          </div>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="reviews-list">
        <div class="reviews-header">
          <h3>Reviews ({{ filteredReviews.length }})</h3>
          <div class="sort-controls">
            <select v-model="sortBy" class="sort-select">
              <option value="date">Latest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
        
        <div class="reviews-content">
          <div 
            v-for="review in filteredReviews" 
            :key="review.id"
            class="review-item"
            :class="[review.sentiment, { 'has-reply': review.reply }]"
          >
            <!-- Review Header -->
            <div class="review-header">
              <div class="reviewer-info">
                <div class="reviewer-avatar">
                  <img :src="review.avatar" :alt="review.name" />
                  <div class="user-status" :class="review.userStatus" :title="getUserStatusText(review.userStatus)">
                    <UIcon dynamic :name="getUserStatusIcon(review.userStatus)" />
                  </div>
                </div>
                <div class="reviewer-details">
                  <div class="reviewer-name-section">
                    <h5 class="reviewer-name">{{ review.name }}</h5>
                    <button 
                      class="verify-user-btn"
                      @click="checkUserAuthenticity(review)"
                      :class="{ 'checking': review.checking }"
                      title="Check user authenticity"
                    >
                      <UIcon dynamic name="i-heroicons-shield-check" />
                      {{ review.checking ? 'Checking...' : 'Verify' }}
                    </button>
                  </div>
                  <div class="review-meta">
                    <span class="review-product">{{ review.product }}</span>
                    <span class="review-date">{{ formatDate(review.date) }}</span>
                    <span class="review-location">
                      <UIcon dynamic name="i-heroicons-map-pin" />
                      {{ review.location }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="review-rating-section">
                <div class="review-rating">
                  <div class="stars">
                    <UIcon 
                      v-for="star in 5" 
                      :key="star"
                      dynamic 
                      :name="star <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'" 
                      :class="star <= review.rating ? 'star-filled' : 'star-empty'"
                    />
                  </div>
                  <span class="rating-text">{{ review.rating }}/5</span>
                </div>
                <div class="sentiment-badge" :class="review.sentiment">
                  <UIcon dynamic :name="getSentimentIcon(review.sentiment)" />
                  <span>{{ review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Review Content -->
            <div class="review-content">
              <p class="review-text">{{ review.comment }}</p>
              
              <!-- Review Images (if any) -->
              <div v-if="review.images && review.images.length > 0" class="review-images">
                <img 
                  v-for="(image, index) in review.images" 
                  :key="index"
                  :src="image" 
                  :alt="`Review image ${index + 1}`"
                  class="review-image"
                  @click="openImageModal(image)"
                >
              </div>
            </div>
            
            <!-- Review Footer -->
            <div class="review-footer">
              <div class="review-actions">
                <button 
                  class="action-btn helpful"
                  @click="markHelpful(review)"
                  :class="{ active: review.markedHelpful }"
                >
                  <UIcon dynamic name="i-heroicons-hand-thumb-up" />
                  Helpful ({{ review.helpfulCount }})
                </button>
                
                <button class="action-btn flag" @click="flagReview(review)">
                  <UIcon dynamic name="i-heroicons-flag" />
                  Flag
                </button>
                
                <button 
                  class="action-btn reply"
                  @click="toggleReplyForm(review.id)"
                  :class="{ active: activeReplyForm === review.id }"
                >
                  <UIcon dynamic name="i-heroicons-chat-bubble-left-right" />
                  Reply ({{ review.replyCount }})
                </button>
              </div>
              
              <div class="review-insights">
                <span class="confidence-score" :class="getConfidenceClass(review.confidenceScore)">
                  <UIcon dynamic name="i-heroicons-chart-bar" />
                  {{ review.confidenceScore }}% authentic
                </span>
              </div>
            </div>

            <!-- Reply Form -->
            <div v-if="activeReplyForm === review.id" class="reply-form">
              <div class="reply-input-section">
                <div class="reply-author-info">
                  <img :src="currentUser.avatar" :alt="currentUser.name" class="reply-avatar">
                  <div class="reply-author-details">
                    <span class="reply-author-name">{{ currentUser.name }}</span>
                    <span class="reply-author-role">{{ currentUser.role }}</span>
                  </div>
                </div>
                
                <textarea 
                  v-model="replyText"
                  placeholder="Write your reply..."
                  class="reply-textarea"
                  rows="3"
                ></textarea>

                <!-- Attachment Section -->
                <div class="attachment-section">
                  <div class="attachment-controls">
                    <input 
                      ref="fileInput" 
                      type="file" 
                      multiple 
                      accept="image/*,video/*" 
                      @change="handleFileUpload"
                      class="file-input"
                      style="display: none;"
                    >
                    
                    <button 
                      type="button"
                      class="attachment-btn"
                      @click="triggerFileUpload"
                      :disabled="isUploading"
                    >
                      <UIcon dynamic name="i-heroicons-photo" />
                      Add Screenshots
                    </button>
                    
                    <button 
                      type="button"
                      class="attachment-btn video-btn"
                      @click="triggerVideoUpload"
                      :disabled="isUploading"
                    >
                      <UIcon dynamic name="i-heroicons-video-camera" />
                      Add Video
                    </button>
                    
                    <span v-if="replyAttachments.length > 0" class="attachment-count">
                      {{ replyAttachments.length }} file(s) selected
                    </span>
                  </div>

                  <!-- Upload Progress -->
                  <div v-if="isUploading" class="upload-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                    </div>
                    <span class="progress-text">Uploading... {{ uploadProgress }}%</span>
                  </div>

                  <!-- File Previews -->
                  <div v-if="previewUrls.length > 0" class="file-previews">
                    <div 
                      v-for="(url, index) in previewUrls" 
                      :key="index"
                      class="file-preview"
                    >
                      <div v-if="isImage(replyAttachments[index])" class="image-preview">
                        <img :src="url" :alt="`Preview ${index + 1}`" class="preview-image">
                        <button 
                          type="button"
                          class="remove-file-btn"
                          @click="removeFile(index)"
                        >
                          <UIcon dynamic name="i-heroicons-x-mark" />
                        </button>
                        <div class="file-info">
                          <span class="file-name">{{ replyAttachments[index].name }}</span>
                          <span class="file-size">{{ formatFileSize(replyAttachments[index].size) }}</span>
                        </div>
                      </div>
                      
                      <div v-else-if="isVideo(replyAttachments[index])" class="video-preview">
                        <video :src="url" class="preview-video" controls muted>
                          Your browser does not support the video tag.
                        </video>
                        <button 
                          type="button"
                          class="remove-file-btn"
                          @click="removeFile(index)"
                        >
                          <UIcon dynamic name="i-heroicons-x-mark" />
                        </button>
                        <div class="file-info">
                          <span class="file-name">{{ replyAttachments[index].name }}</span>
                          <span class="file-size">{{ formatFileSize(replyAttachments[index].size) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="reply-actions">
                  <button class="btn btn-secondary" @click="cancelReply">
                    Cancel
                  </button>
                  <button 
                    class="btn btn-primary" 
                    @click="submitReply(review)"
                    :disabled="!replyText.trim() || isUploading"
                  >
                    <UIcon dynamic name="i-heroicons-paper-airplane" />
                    Send Reply
                  </button>
                </div>
              </div>
            </div>

            <!-- All Replies -->
            <div v-if="review.replies && review.replies.length > 0" class="replies-section">
              <div class="replies-header">
                <h5>{{ review.replies.length }} {{ review.replies.length === 1 ? 'Reply' : 'Replies' }}</h5>
                <button 
                  class="btn btn-sm btn-secondary"
                  @click="toggleReplyForm(review.id)"
                >
                  <UIcon dynamic name="i-heroicons-plus" />
                  Add Reply
                </button>
              </div>
              
              <div class="replies-list">
                <div 
                  v-for="reply in review.replies" 
                  :key="reply.id"
                  class="reply-item"
                  :class="{ 'official-reply': reply.isOfficial }"
                >
                  <div class="reply-author-section">
                    <img :src="reply.avatar" :alt="reply.author" class="reply-author-avatar">
                    <div class="reply-author-info">
                      <div class="reply-author-name">
                        {{ reply.author }}
                        <span v-if="reply.isOfficial" class="official-badge">
                          <UIcon dynamic name="i-heroicons-check-badge" />
                          Official
                        </span>
                      </div>
                      <div class="reply-meta">
                        <span class="reply-role">{{ reply.role }}</span>
                        <span class="reply-date">{{ formatDate(reply.date) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="reply-content">
                    <p class="reply-text">{{ reply.text }}</p>
                    
                    <!-- Reply Attachments -->
                    <div v-if="reply.attachments && reply.attachments.length > 0" class="reply-attachments">
                      <div class="attachment-grid">
                        <div 
                          v-for="(attachment, idx) in reply.attachments" 
                          :key="idx"
                          class="attachment-item"
                        >
                          <div v-if="attachment.type === 'image'" class="attachment-image">
                            <img 
                              :src="attachment.url" 
                              :alt="attachment.name"
                              class="attachment-img"
                              @click="openAttachmentModal(attachment)"
                            >
                            <div class="attachment-overlay">
                              <UIcon dynamic name="i-heroicons-magnifying-glass-plus" />
                            </div>
                          </div>
                          
                          <div v-else-if="attachment.type === 'video'" class="attachment-video">
                            <video 
                              :src="attachment.url" 
                              class="attachment-vid"
                              controls
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                            <div class="video-info">
                              <UIcon dynamic name="i-heroicons-play-circle" />
                              <span>{{ attachment.name }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="reply-footer">
                    <div class="reply-actions">
                      <button 
                        class="action-btn helpful"
                        @click="markReplyHelpful(reply)"
                        :class="{ active: reply.markedHelpful }"
                      >
                        <UIcon dynamic name="i-heroicons-hand-thumb-up" />
                        Helpful{{ reply.helpfulCount > 0 ? ` (${reply.helpfulCount})` : '' }}
                      </button>
                      
                      <button 
                        v-if="reply.isOfficial"
                        class="action-btn edit"
                        @click="editReply(review, reply)"
                      >
                        <UIcon dynamic name="i-heroicons-pencil" />
                        Edit
                      </button>
                      
                      <button 
                        v-if="reply.isOfficial"
                        class="action-btn delete"
                        @click="deleteReply(review, reply)"
                      >
                        <UIcon dynamic name="i-heroicons-trash" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Reply Button (when no replies exist) -->
            <div v-else-if="review.replies && review.replies.length === 0" class="no-replies-section">
              <button 
                class="btn btn-secondary add-first-reply"
                @click="toggleReplyForm(review.id)"
              >
                <UIcon dynamic name="i-heroicons-chat-bubble-left-right" />
                Be the first to reply
              </button>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMoreReviews" class="load-more-section">
          <button class="btn btn-secondary load-more-btn" @click="loadMoreReviews">
            <UIcon dynamic name="i-heroicons-arrow-down" />
            Load More Reviews
          </button>
        </div>
      </div>
    </div>

    <!-- User Authenticity Modal -->
    <div v-if="showAuthenticityModal" class="modal-overlay" @click="closeAuthenticityModal">
      <div class="authenticity-modal" @click.stop>
        <div class="modal-header">
          <h3>User Authenticity Check</h3>
          <button class="close-btn" @click="closeAuthenticityModal">
            <UIcon dynamic name="i-heroicons-x-mark" />
          </button>
        </div>
        
        <div class="modal-content">
          <div v-if="selectedUserCheck" class="user-check-details">
            <div class="user-profile">
              <img :src="selectedUserCheck.avatar" :alt="selectedUserCheck.name" class="user-avatar-large">
              <div class="user-info">
                <h4>{{ selectedUserCheck.name }}</h4>
                <p>{{ selectedUserCheck.email }}</p>
              </div>
            </div>
            
            <div class="authenticity-checks">
              <div class="check-item">
                <div class="check-label">
                  <UIcon dynamic name="i-heroicons-envelope" />
                  Email Verification
                </div>
                <div class="check-status" :class="selectedUserCheck.checks.emailVerified ? 'verified' : 'unverified'">
                  <UIcon dynamic :name="selectedUserCheck.checks.emailVerified ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" />
                  {{ selectedUserCheck.checks.emailVerified ? 'Verified' : 'Unverified' }}
                </div>
              </div>
              
              <div class="check-item">
                <div class="check-label">
                  <UIcon dynamic name="i-heroicons-phone" />
                  Phone Verification
                </div>
                <div class="check-status" :class="selectedUserCheck.checks.phoneVerified ? 'verified' : 'unverified'">
                  <UIcon dynamic :name="selectedUserCheck.checks.phoneVerified ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" />
                  {{ selectedUserCheck.checks.phoneVerified ? 'Verified' : 'Unverified' }}
                </div>
              </div>
              
              <div class="check-item">
                <div class="check-label">
                  <UIcon dynamic name="i-heroicons-calendar" />
                  Account Age
                </div>
                <div class="check-status verified">
                  <UIcon dynamic name="i-heroicons-clock" />
                  {{ selectedUserCheck.checks.accountAge }} days
                </div>
              </div>
              
              <div class="check-item">
                <div class="check-label">
                  <UIcon dynamic name="i-heroicons-chat-bubble-left-right" />
                  Review History
                </div>
                <div class="check-status verified">
                  <UIcon dynamic name="i-heroicons-document-text" />
                  {{ selectedUserCheck.checks.reviewCount }} reviews
                </div>
              </div>
              
              <div class="check-item">
                <div class="check-label">
                  <UIcon dynamic name="i-heroicons-shield-check" />
                  Trust Score
                </div>
                <div class="check-status" :class="getTrustScoreClass(selectedUserCheck.checks.trustScore)">
                  <UIcon dynamic name="i-heroicons-star" />
                  {{ selectedUserCheck.checks.trustScore }}/100
                </div>
              </div>
            </div>
            
            <div class="authenticity-recommendation">
              <div class="recommendation-badge" :class="getRecommendationClass(selectedUserCheck.checks.trustScore)">
                <UIcon dynamic :name="getRecommendationIcon(selectedUserCheck.checks.trustScore)" />
                <span>{{ getRecommendationText(selectedUserCheck.checks.trustScore) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attachment Modal -->
    <div v-if="showAttachmentModal" class="modal-overlay" @click="closeAttachmentModal">
      <div class="attachment-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedAttachment?.name }}</h3>
          <button class="close-btn" @click="closeAttachmentModal">
            <UIcon dynamic name="i-heroicons-x-mark" />
          </button>
        </div>
        
        <div class="modal-content">
          <div v-if="selectedAttachment?.type === 'image'" class="full-image">
            <img :src="selectedAttachment.url" :alt="selectedAttachment.name" class="modal-image">
          </div>
          
          <div v-else-if="selectedAttachment?.type === 'video'" class="full-video">
            <video :src="selectedAttachment.url" class="modal-video" controls autoplay muted>
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div class="attachment-details">
            <p><strong>File Size:</strong> {{ selectedAttachment ? formatFileSize(selectedAttachment.size) : '' }}</p>
            <p><strong>Type:</strong> {{ selectedAttachment?.mimeType }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// SEO and meta tags
useSeoMeta({
  title: 'Reviews - Customer Feedback & Sentiment Analysis',
  description: 'Monitor customer reviews, feedback, and global sentiment analysis for your products and services.',
  keywords: 'reviews, customer feedback, sentiment analysis, product reviews, user experience'
});

// Page layout
definePageMeta({
  layout: 'default'
});

// State
const selectedSentiment = ref('all');
const selectedProduct = ref('all');
const selectedRating = ref('all');
const selectedUserStatus = ref('all');
const searchQuery = ref('');
const sortBy = ref('date');
const activeReplyForm = ref<number | null>(null);
const replyText = ref('');
const showAuthenticityModal = ref(false);
const selectedUserCheck = ref<any>(null);
const hasMoreReviews = ref(true);

// Enhanced reply tracking
const replyHistory = ref(new Map());
const currentUser = ref({
  name: 'Admin User',
  role: 'Support Team',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
});

// File upload state
const replyAttachments = ref<File[]>([]);
const isUploading = ref(false);
const uploadProgress = ref(0);
const previewUrls = ref<string[]>([]);
const fileInput = ref<HTMLInputElement>();
const showAttachmentModal = ref(false);
const selectedAttachment = ref<any>(null);

// Mock data for sentiment analysis
const sentimentData = ref({
  positive: 67,
  neutral: 18,
  negative: 15
});

const overallRating = ref(4.2);

// Enhanced mock reviews data with user authenticity features
const reviewsData = ref([
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
    product: 'TaskFlow Pro',
    rating: 5,
    comment: 'This productivity app has completely transformed how I manage my daily tasks. The interface is intuitive and the features are exactly what I needed. The team collaboration features are outstanding!',
    sentiment: 'positive',
    date: '2024-01-22T14:30:00Z',
    location: 'New York, USA',
    userStatus: 'verified',
    confidenceScore: 95,
    helpfulCount: 12,
    markedHelpful: false,
    checking: false,
    images: [
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop'
    ],
    checks: {
      emailVerified: true,
      phoneVerified: true,
      accountAge: 245,
      reviewCount: 18,
      trustScore: 95
    },
    reply: {
      author: 'Support Team',
      text: 'Thank you so much for your wonderful feedback! We\'re thrilled to hear that TaskFlow Pro has improved your productivity. Your suggestion about team collaboration has been noted.',
      date: '2024-01-22T16:45:00Z'
    },
    replies: [
      {
        id: 1,
        author: 'Support Team',
        role: 'Support Team',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        text: 'Thank you so much for your wonderful feedback! We\'re thrilled to hear that TaskFlow Pro has improved your productivity. Your suggestion about team collaboration has been noted.',
        date: '2024-01-22T16:45:00Z',
        isOfficial: true,
        helpfulCount: 5,
        markedHelpful: false,
        attachments: [
          {
            name: 'team-collaboration-preview.png',
            size: 245760,
            type: 'image',
            url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
            mimeType: 'image/png'
          }
        ]
      }
    ],
    replyCount: 1
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    product: 'Analytics Hub',
    rating: 4,
    comment: 'Great analytics tool with comprehensive reporting features. Could use some improvements in the mobile experience, but overall very satisfied with the desktop version.',
    sentiment: 'positive',
    date: '2024-01-21T16:45:00Z',
    location: 'Toronto, Canada',
    userStatus: 'verified',
    confidenceScore: 88,
    helpfulCount: 8,
    markedHelpful: false,
    checking: false,
    checks: {
      emailVerified: true,
      phoneVerified: false,
      accountAge: 156,
      reviewCount: 12,
      trustScore: 88
    },
    replies: [],
    replyCount: 0
  },
  {
    id: 3,
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    product: 'Design Studio',
    rating: 3,
    comment: 'The design tools are okay, but I expected more advanced features. The learning curve is steeper than anticipated. Documentation could be better.',
    sentiment: 'neutral',
    date: '2024-01-20T10:15:00Z',
    location: 'London, UK',
    userStatus: 'verified',
    confidenceScore: 82,
    helpfulCount: 5,
    markedHelpful: true,
    checking: false,
    checks: {
      emailVerified: true,
      phoneVerified: true,
      accountAge: 89,
      reviewCount: 7,
      trustScore: 82
    },
    replies: [],
    replyCount: 0
  },
  {
    id: 4,
    name: 'David Rodriguez',
    email: 'david.r@email.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    product: 'TaskFlow Pro',
    rating: 2,
    comment: 'The app crashes frequently and syncing issues make it unreliable. Customer support has been slow to respond. Very disappointed with this purchase.',
    sentiment: 'negative',
    date: '2024-01-19T09:30:00Z',
    location: 'Madrid, Spain',
    userStatus: 'suspicious',
    confidenceScore: 45,
    helpfulCount: 15,
    markedHelpful: false,
    checking: false,
    checks: {
      emailVerified: false,
      phoneVerified: false,
      accountAge: 12,
      reviewCount: 1,
      trustScore: 45
    },
    replies: [],
    replyCount: 0
  },
  {
    id: 5,
    name: 'Lisa Zhang',
    email: 'lisa.zhang@email.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    product: 'Analytics Hub',
    rating: 5,
    comment: 'Excellent data visualization capabilities. The custom dashboard feature is a game-changer for our team. Highly recommend for any data-driven organization!',
    sentiment: 'positive',
    date: '2024-01-18T13:20:00Z',
    location: 'Singapore',
    userStatus: 'verified',
    confidenceScore: 92,
    helpfulCount: 20,
    markedHelpful: false,
    checking: false,
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop'
    ],
    checks: {
      emailVerified: true,
      phoneVerified: true,
      accountAge: 367,
      reviewCount: 24,
      trustScore: 92
    },
    replies: [],
    replyCount: 0
  },
  {
    id: 6,
    name: 'James Thompson',
    email: 'j.thompson@email.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    product: 'Design Studio',
    rating: 4,
    comment: 'Solid design platform with good collaboration features. The template library could be more extensive, but the existing tools are powerful and well-designed.',
    sentiment: 'positive',
    date: '2024-01-17T11:45:00Z',
    location: 'Sydney, Australia',
    userStatus: 'verified',
    confidenceScore: 78,
    helpfulCount: 6,
    markedHelpful: false,
    checking: false,
    checks: {
      emailVerified: true,
      phoneVerified: false,
      accountAge: 198,
      reviewCount: 9,
      trustScore: 78
    },
    replies: [],
    replyCount: 0
  },
  {
    id: 7,
    name: 'Anonymous User',
    email: 'fake.user@temp.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    product: 'CRM Master',
    rating: 1,
    comment: 'Terrible product. Waste of money. Don\'t buy this. There are better alternatives available in the market.',
    sentiment: 'negative',
    date: '2024-01-16T08:20:00Z',
    location: 'Unknown',
    userStatus: 'suspicious',
    confidenceScore: 23,
    helpfulCount: 2,
    markedHelpful: false,
    checking: false,
    checks: {
      emailVerified: false,
      phoneVerified: false,
      accountAge: 3,
      reviewCount: 1,
      trustScore: 23
    },
    replies: [],
    replyCount: 0
  }
]);

// Computed properties
const filteredReviews = computed(() => {
  let filtered = [...reviewsData.value];
  
  // Initialize missing properties for reviews
  filtered.forEach(review => {
    if (!review.replies) review.replies = [];
    if (typeof review.replyCount === 'undefined') {
      review.replyCount = review.replies.length;
    }
  });
  
  // Filter by sentiment
  if (selectedSentiment.value !== 'all') {
    filtered = filtered.filter(review => review.sentiment === selectedSentiment.value);
  }
  
  // Filter by product
  if (selectedProduct.value !== 'all') {
    filtered = filtered.filter(review => review.product === selectedProduct.value);
  }
  
  // Filter by rating
  if (selectedRating.value !== 'all') {
    filtered = filtered.filter(review => review.rating.toString() === selectedRating.value);
  }
  
  // Filter by user status
  if (selectedUserStatus.value !== 'all') {
    filtered = filtered.filter(review => review.userStatus === selectedUserStatus.value);
  }
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(review => 
      review.name.toLowerCase().includes(query) ||
      review.comment.toLowerCase().includes(query) ||
      review.product.toLowerCase().includes(query) ||
      (review.replies && review.replies.some((reply: any) => 
        reply.text.toLowerCase().includes(query) || 
        reply.author.toLowerCase().includes(query)
      ))
    );
  }
  
  // Sort
  if (sortBy.value) {
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpfulCount - a.helpfulCount;
        default:
          return 0;
      }
    });
  }
  
  return filtered;
});

// Computed property for reply statistics
const replyStats = computed(() => {
  const total = reviewsData.value.length;
  const withReplies = reviewsData.value.filter(review => 
    review.replies && review.replies.length > 0
  ).length;
  const totalReplies = reviewsData.value.reduce((sum, review) => 
    sum + (review.replyCount || 0), 0
  );
  
  return {
    total,
    withReplies,
    withoutReplies: total - withReplies,
    totalReplies,
    averageRepliesPerReview: total > 0 ? (totalReplies / total).toFixed(1) : '0'
  };
});

// Helper functions
const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'i-heroicons-face-smile';
    case 'negative':
      return 'i-heroicons-face-frown';
    default:
      return 'i-heroicons-minus';
  }
};

const getUserStatusIcon = (status: string) => {
  switch (status) {
    case 'verified':
      return 'i-heroicons-check-badge';
    case 'suspicious':
      return 'i-heroicons-exclamation-triangle';
    default:
      return 'i-heroicons-question-mark-circle';
  }
};

const getUserStatusText = (status: string) => {
  switch (status) {
    case 'verified':
      return 'Verified User';
    case 'suspicious':
      return 'Suspicious Account';
    default:
      return 'Unknown Status';
  }
};

const getConfidenceClass = (score: number) => {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
};

const getTrustScoreClass = (score: number) => {
  if (score >= 80) return 'verified';
  if (score >= 60) return 'neutral';
  return 'unverified';
};

const getRecommendationClass = (score: number) => {
  if (score >= 80) return 'trusted';
  if (score >= 60) return 'caution';
  return 'suspicious';
};

const getRecommendationIcon = (score: number) => {
  if (score >= 80) return 'i-heroicons-shield-check';
  if (score >= 60) return 'i-heroicons-exclamation-triangle';
  return 'i-heroicons-shield-exclamation';
};

const getRecommendationText = (score: number) => {
  if (score >= 80) return 'Trusted User';
  if (score >= 60) return 'Exercise Caution';
  return 'Likely Fake/Suspicious';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

// Action handlers
const markHelpful = (review: any) => {
  review.markedHelpful = !review.markedHelpful;
  if (review.markedHelpful) {
    review.helpfulCount++;
  } else {
    review.helpfulCount--;
  }
};

const flagReview = (review: any) => {
  console.log('Flagging review:', review.id);
  // Implement flag functionality
};

const toggleReplyForm = (reviewId: number) => {
  if (activeReplyForm.value === reviewId) {
    activeReplyForm.value = null;
    replyText.value = '';
  } else {
    activeReplyForm.value = reviewId;
    replyText.value = '';
  }
};

const cancelReply = () => {
  activeReplyForm.value = null;
  replyText.value = '';
  
  // Clear attachments and revoke URLs
  replyAttachments.value.forEach((_, index) => {
    URL.revokeObjectURL(previewUrls.value[index]);
  });
  replyAttachments.value = [];
  previewUrls.value = [];
};

const submitReply = async (review: any) => {
  if (!replyText.value.trim()) return;
  
  let attachmentUrls: string[] = [];
  let attachmentData: any[] = [];
  
  // Handle file uploads if there are attachments
  if (replyAttachments.value.length > 0) {
    try {
      // Simulate upload process
      attachmentUrls = await simulateUpload();
      
      // Create attachment data
      attachmentData = replyAttachments.value.map((file, index) => ({
        name: file.name,
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: attachmentUrls[index] || previewUrls.value[index], // Use preview URL as fallback
        mimeType: file.type
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload attachments. Please try again.');
      return;
    }
  }
  
  // Check if we're editing an existing reply
  if (review.editingReplyId) {
    const replyIndex = review.replies.findIndex((r: any) => r.id === review.editingReplyId);
    if (replyIndex !== -1) {
      review.replies[replyIndex].text = replyText.value;
      review.replies[replyIndex].date = new Date().toISOString();
      if (attachmentData.length > 0) {
        review.replies[replyIndex].attachments = attachmentData;
      }
      console.log('Reply updated:', review.editingReplyId);
    }
    delete review.editingReplyId;
  } else {
    // Creating new reply
    const newReply = {
      id: Date.now(), // Use timestamp as simple ID
      author: currentUser.value.name,
      role: currentUser.value.role,
      avatar: currentUser.value.avatar,
      text: replyText.value,
      date: new Date().toISOString(),
      isOfficial: true,
      helpfulCount: 0,
      markedHelpful: false,
      attachments: attachmentData
    };
    
    if (!review.replies) {
      review.replies = [];
    }
    
    review.replies.push(newReply);
    review.replyCount = review.replies.length;
    
    // Update legacy reply for backward compatibility
    if (!review.reply) {
      review.reply = {
        author: currentUser.value.role,
        text: replyText.value,
        date: new Date().toISOString()
      };
    }
    
    // Track reply in history
    if (!replyHistory.value.has(review.id)) {
      replyHistory.value.set(review.id, []);
    }
    replyHistory.value.get(review.id).push(newReply);
    
    console.log('Reply submitted for review:', review.id, newReply);
  }
  
  // Clear form
  activeReplyForm.value = null;
  replyText.value = '';
  
  // Clear attachments
  replyAttachments.value.forEach((_, index) => {
    URL.revokeObjectURL(previewUrls.value[index]);
  });
  replyAttachments.value = [];
  previewUrls.value = [];
};

const editReply = (review: any, reply?: any) => {
  if (reply) {
    // Editing specific reply
    replyText.value = reply.text;
    activeReplyForm.value = review.id;
    // Store the reply being edited
    review.editingReplyId = reply.id;
  } else {
    // Legacy: editing the main reply
    if (review.reply) {
      replyText.value = review.reply.text;
      activeReplyForm.value = review.id;
    }
  }
};

const deleteReply = (review: any, reply?: any) => {
  if (reply) {
    // Deleting specific reply
    if (confirm('Are you sure you want to delete this reply?')) {
      const index = review.replies.findIndex((r: any) => r.id === reply.id);
      if (index !== -1) {
        review.replies.splice(index, 1);
        review.replyCount = review.replies.length;
        console.log('Reply deleted:', reply.id);
      }
    }
  } else {
    // Legacy: deleting main reply
    if (confirm('Are you sure you want to delete this reply?')) {
      review.reply = null;
      console.log('Reply deleted for review:', review.id);
    }
  }
};

const markReplyHelpful = (reply: any) => {
  reply.markedHelpful = !reply.markedHelpful;
  if (reply.markedHelpful) {
    reply.helpfulCount++;
  } else {
    reply.helpfulCount--;
  }
};

const checkUserAuthenticity = (review: any) => {
  review.checking = true;
  
  // Simulate API call
  setTimeout(() => {
    review.checking = false;
    selectedUserCheck.value = review;
    showAuthenticityModal.value = true;
  }, 2000);
};

const closeAuthenticityModal = () => {
  showAuthenticityModal.value = false;
  selectedUserCheck.value = null;
};

const openImageModal = (image: string) => {
  console.log('Opening image modal:', image);
  // Implement image modal
};

const loadMoreReviews = () => {
  console.log('Loading more reviews...');
  // Implement pagination
  hasMoreReviews.value = false;
};

// File handling functions
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.accept = 'image/*';
    fileInput.value.click();
  }
};

const triggerVideoUpload = () => {
  if (fileInput.value) {
    fileInput.value.accept = 'video/*';
    fileInput.value.click();
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (files) {
    const newFiles = Array.from(files);
    
    // Validate file sizes (max 10MB for images, 50MB for videos)
    const validFiles = newFiles.filter(file => {
      if (file.type.startsWith('image/')) {
        return file.size <= 10 * 1024 * 1024; // 10MB
      } else if (file.type.startsWith('video/')) {
        return file.size <= 50 * 1024 * 1024; // 50MB
      }
      return false;
    });
    
    if (validFiles.length !== newFiles.length) {
      alert('Some files were skipped due to size limits (10MB for images, 50MB for videos)');
    }
    
    replyAttachments.value = [...replyAttachments.value, ...validFiles];
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      previewUrls.value.push(url);
    });
    
    // Reset input
    target.value = '';
  }
};

const removeFile = (index: number) => {
  // Revoke the object URL to free memory
  URL.revokeObjectURL(previewUrls.value[index]);
  
  replyAttachments.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
};

const isImage = (file: File) => {
  return file.type.startsWith('image/');
};

const isVideo = (file: File) => {
  return file.type.startsWith('video/');
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const openAttachmentModal = (attachment: any) => {
  selectedAttachment.value = attachment;
  showAttachmentModal.value = true;
};

const closeAttachmentModal = () => {
  selectedAttachment.value = null;
  showAttachmentModal.value = false;
};

// Simulate file upload process
const simulateUpload = async (): Promise<string[]> => {
  isUploading.value = true;
  uploadProgress.value = 0;
  
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      uploadProgress.value += Math.random() * 20;
      if (uploadProgress.value >= 100) {
        uploadProgress.value = 100;
        clearInterval(interval);
        
        setTimeout(() => {
          isUploading.value = false;
          uploadProgress.value = 0;
          
          // Return mock URLs for the uploaded files
          const mockUrls = replyAttachments.value.map((file, index) => 
            `https://example.com/uploads/${Date.now()}-${index}-${file.name}`
          );
          resolve(mockUrls);
        }, 500);
      }
    }, 100);
  });
};

// Add some sample replies to demonstrate the system
const initializeSampleReplies = () => {
  // Add reply to Michael Chen's review
  if (reviewsData.value[1] && (!reviewsData.value[1].replies || reviewsData.value[1].replies.length === 0)) {
    reviewsData.value[1].replies = [{
      id: 2,
      author: 'Development Team',
      role: 'Development Team',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      text: 'Thank you for the feedback about mobile experience! We\'re actively working on improving the mobile version. Expect updates in the next release.',
      date: '2024-01-21T18:30:00Z',
      isOfficial: true,
      helpfulCount: 3,
      markedHelpful: false,
      attachments: []
    }];
    reviewsData.value[1].replyCount = 1;
  }
  
  // Add reply to David Rodriguez's negative review
  if (reviewsData.value[3] && (!reviewsData.value[3].replies || reviewsData.value[3].replies.length === 0)) {
    reviewsData.value[3].replies = [{
      id: 3,
      author: 'Customer Support',
      role: 'Support Team',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face',
      text: 'We sincerely apologize for the issues you\'ve experienced. Our technical team is investigating the crashes and sync problems. Please contact us directly so we can provide immediate assistance and ensure these issues are resolved.',
      date: '2024-01-19T12:15:00Z',
      isOfficial: true,
      helpfulCount: 8,
      markedHelpful: false,
      attachments: [
        {
          name: 'bug-fix-update.mp4',
          size: 8765432,
          type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          mimeType: 'video/mp4'
        },
        {
          name: 'fix-screenshot.png',
          size: 156789,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
          mimeType: 'image/png'
        }
      ]
    }];
    reviewsData.value[3].replyCount = 1;
  }
};

// Initialize sample replies on component mount
onMounted(() => {
  initializeSampleReplies();
});
</script>

<style scoped>
.reviews-page {
  min-height: 100vh;
  background: #ffffff;
  margin-top: 144px;
  padding: var(--spacing-lg);
}

/* Standardized thin border radius for all cards */
.reviews-page .card,
.reviews-page .sentiment-card,
.reviews-page .review-card,
.reviews-page .stats-card {
  border-radius: 6px !important;
}

/* Page Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 2rem;
  margin-bottom: 2rem;
  margin-top: 0;
}

.header-content {
  max-width: 100%;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.title-section p {
  color: #64748b;
  font-size: 1rem;
  margin: 0 0 1rem 0;
}

.reply-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.stat-item svg {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Sentiment Overview Cards - Compact Design */
.sentiment-overview {
  max-width: 1400px;
  margin: 0 auto 2rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem; /* Reduced gap for more compact layout */
}

.sentiment-card {
  background: white;
  padding: 1rem 1.25rem; /* Reduced padding for compact design */
  border-radius: 0.5rem; /* Slightly smaller border radius */
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Reduced gap between icon and content */
  transition: all 0.2s;
  min-height: 72px; /* Fixed compact height */
}

.sentiment-card:hover {
  transform: translateY(-1px); /* Reduced hover lift */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: currentColor;
}

.sentiment-card.positive {
  border-left: 3px solid #10b981; /* Slightly thinner accent border */
}

.sentiment-card.positive:hover {
  border-color: #10b981;
}

.sentiment-card.neutral {
  border-left: 3px solid #f59e0b;
}

.sentiment-card.neutral:hover {
  border-color: #f59e0b;
}

.sentiment-card.negative {
  border-left: 3px solid #ef4444;
}

.sentiment-card.negative:hover {
  border-color: #ef4444;
}

.sentiment-card.overall {
  border-left: 3px solid #8b5cf6;
}

.sentiment-card.overall:hover {
  border-color: #8b5cf6;
}

.sentiment-icon {
  width: 2.5rem; /* Reduced icon container size */
  height: 2.5rem;
  border-radius: 0.5rem; /* Smaller border radius for compact look */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem; /* Slightly smaller icon */
  color: white;
  flex-shrink: 0; /* Prevent icon from shrinking */
}

.sentiment-card.positive .sentiment-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.sentiment-card.neutral .sentiment-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.sentiment-card.negative .sentiment-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.sentiment-card.overall .sentiment-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.sentiment-info {
  flex: 1;
  min-width: 0; /* Allow text to wrap if needed */
}

.sentiment-info h4 {
  font-size: 0.75rem; /* Smaller label text */
  font-weight: 600;
  color: #64748b;
  margin: 0 0 0.125rem 0; /* Reduced margin for compact layout */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.sentiment-count {
  font-size: 1.5rem; /* Reduced from 1.875rem for compact design */
  font-weight: 700;
  color: #1e293b;
  display: block;
  margin-bottom: 0.125rem; /* Reduced margin */
  line-height: 1.2;
}

.sentiment-change {
  font-size: 0.625rem; /* Slightly smaller change indicator */
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  display: inline-block;
}

.sentiment-change.positive {
  background: #dcfce7;
  color: #166534;
}

.sentiment-change.negative {
  background: #fef2f2;
  color: #dc2626;
}

.sentiment-change.neutral {
  background: #fef3c7;
  color: #d97706;
}

/* Main Content */
.main-content {
  max-width: 100%;
  margin: 0;
  padding: 0 2rem 2rem 2rem;
}

/* Reviews Controls */
.reviews-controls {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-select,
.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  min-width: 120px;
}

.search-section {
  flex: 1;
  max-width: 300px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  color: #64748b;
  width: 1rem;
  height: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Reviews List */
.reviews-list {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.reviews-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reviews-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reviews-content {
  display: flex;
  flex-direction: column;
}

.review-item {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.review-item:hover {
  background: #f8fafc;
}

.review-item:last-child {
  border-bottom: none;
}

.review-item.has-reply {
  background: #fefefe;
  border-left: 3px solid #3b82f6;
}

/* Review Header */
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.reviewer-info {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.reviewer-avatar {
  position: relative;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: 2px solid white;
}

.user-status.verified {
  background: #10b981;
  color: white;
}

.user-status.suspicious {
  background: #ef4444;
  color: white;
}

.reviewer-details {
  flex: 1;
}

.reviewer-name-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.reviewer-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.verify-user-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #f1f5f9;
  color: #3b82f6;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.verify-user-btn:hover {
  background: #e2e8f0;
}

.verify-user-btn.checking {
  background: #fef3c7;
  color: #d97706;
  cursor: not-allowed;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
  flex-wrap: wrap;
}

.review-product {
  font-weight: 500;
  color: #3b82f6;
}

.review-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.review-rating-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.stars svg {
  width: 1rem;
  height: 1rem;
}

.star-filled {
  color: #fbbf24;
}

.star-empty {
  color: #d1d5db;
}

.rating-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.sentiment-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.sentiment-badge.positive {
  background: #dcfce7;
  color: #166534;
}

.sentiment-badge.neutral {
  background: #fef3c7;
  color: #d97706;
}

.sentiment-badge.negative {
  background: #fef2f2;
  color: #dc2626;
}

/* Review Content */
.review-content {
  margin-bottom: 1rem;
}

.review-text {
  color: #374151;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.review-images {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.review-image {
  width: 100px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.review-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Review Footer */
.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.review-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #374151;
}

.action-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-btn.flag:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.review-insights {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.confidence-score {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.confidence-score.high {
  background: #dcfce7;
  color: #166534;
}

.confidence-score.medium {
  background: #fef3c7;
  color: #d97706;
}

.confidence-score.low {
  background: #fef2f2;
  color: #dc2626;
}

/* Reply Forms */
.reply-form {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.reply-input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reply-author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.reply-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.reply-author-details {
  display: flex;
  flex-direction: column;
}

.reply-author-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.reply-author-role {
  font-size: 0.75rem;
  color: #64748b;
}

.reply-textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  resize: vertical;
  font-family: inherit;
  font-size: 0.875rem;
}

.reply-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Attachment Section */
.attachment-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.attachment-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.attachment-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.attachment-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #3b82f6;
  color: #3b82f6;
}

.attachment-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.video-btn {
  background: #fef3c7;
  color: #d97706;
  border-color: #f59e0b;
}

.video-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #f59e0b;
}

.attachment-count {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.upload-progress {
  margin-bottom: 0.75rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #f1f5f9;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
  display: block;
}

.file-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.75rem;
}

.file-preview {
  position: relative;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.image-preview,
.video-preview {
  position: relative;
}

.preview-image,
.preview-video {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.remove-file-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.remove-file-btn:hover {
  background: #ef4444;
}

.file-info {
  padding: 0.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.file-name {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
  word-break: break-all;
}

.file-size {
  font-size: 0.625rem;
  color: #64748b;
}

.reply-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Replies Section */
.replies-section {
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.replies-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.replies-header h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reply-item {
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.reply-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.reply-item.official-reply {
  border-left: 3px solid #3b82f6;
  background: #f8fafc;
}

.reply-author-section {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.reply-author-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.reply-author-info {
  flex: 1;
}

.reply-author-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.official-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 0.375rem;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.reply-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
}

.reply-content {
  margin-bottom: 0.75rem;
}

.reply-text {
  color: #374151;
  line-height: 1.5;
  margin: 0;
}

.reply-footer {
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.reply-footer .reply-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}

.reply-footer .action-btn {
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
}

/* Reply Attachments */
.reply-attachments {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.attachment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.attachment-item {
  position: relative;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
  transition: all 0.2s;
}

.attachment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.attachment-image {
  position: relative;
  cursor: pointer;
}

.attachment-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.attachment-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
  font-size: 1.5rem;
}

.attachment-image:hover .attachment-overlay {
  opacity: 1;
}

.attachment-video {
  position: relative;
}

.attachment-vid {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.video-info {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.video-info span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* No Replies Section */
.no-replies-section {
  margin-top: 1rem;
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}

.add-first-reply {
  padding: 0.75rem 1.5rem;
}

/* Load More */
.load-more-section {
  padding: 2rem;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}

.load-more-btn {
  padding: 1rem 2rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.authenticity-modal {
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-content {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

/* User Check Details */
.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.user-avatar-large {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
}

.user-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.user-info p {
  color: #64748b;
  margin: 0;
}

.authenticity-checks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.check-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.check-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.check-status.verified {
  color: #10b981;
}

.check-status.unverified {
  color: #ef4444;
}

.check-status.neutral {
  color: #f59e0b;
}

.authenticity-recommendation {
  text-align: center;
}

.recommendation-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
}

.recommendation-badge.trusted {
  background: #dcfce7;
  color: #166534;
}

.recommendation-badge.caution {
  background: #fef3c7;
  color: #d97706;
}

.recommendation-badge.suspicious {
  background: #fef2f2;
  color: #dc2626;
}

/* Attachment Modal */
.attachment-modal {
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.attachment-modal .modal-content {
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
}

.full-image {
  text-align: center;
  margin-bottom: 1rem;
}

.modal-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 0.5rem;
}

.full-video {
  text-align: center;
  margin-bottom: 1rem;
}

.modal-video {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 0.5rem;
}

.attachment-details {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.attachment-details p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #374151;
}

.attachment-details p:last-child {
  margin-bottom: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .header-actions {
    justify-content: space-between;
  }

  .sentiment-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem; /* Reduced gap for tablet */
  }

  .sentiment-card {
    min-height: 68px; /* Slightly smaller on tablet */
    padding: 0.875rem 1rem;
  }

  .sentiment-icon {
    width: 2.25rem;
    height: 2.25rem;
  }

  .sentiment-count {
    font-size: 1.375rem;
  }

  .reviews-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section {
    justify-content: space-between;
  }

  .search-section {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .reviews-page {
    margin-top: 136px;
    padding: var(--spacing-md);
  }

  .page-header,
  .main-content {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }

  .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .sentiment-overview {
    grid-template-columns: 1fr;
    padding: 0 var(--spacing-md);
    gap: var(--spacing-md);
  }

  .sentiment-card {
    min-height: 64px; /* Compact mobile height */
    padding: 0.75rem 1rem;
    gap: 0.625rem;
  }

  .sentiment-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .sentiment-info h4 {
    font-size: 0.6875rem; /* Extra small on mobile */
  }

  .sentiment-count {
    font-size: 1.25rem; /* Compact mobile size */
  }

  .sentiment-change {
    font-size: 0.5625rem;
    padding: 0.0625rem 0.25rem;
  }

  .reviews-controls {
    padding: 1rem;
  }

  .filter-section {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-group {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .review-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .review-rating-section {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .review-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .file-previews {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .attachment-grid {
    grid-template-columns: 1fr;
  }

  .attachment-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .attachment-btn {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .reviewer-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .reviewer-name-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .review-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .reviews-page {
    padding: var(--spacing-sm);
    margin-top: 130px;
  }

  .page-header,
  .main-content {
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
  }

  .sentiment-overview {
    padding: 0 var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .sentiment-card {
    padding: var(--spacing-sm);
  }

  .reviews-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .review-card {
    padding: var(--spacing-sm);
  }

  .review-header {
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: flex-start;
  }
}
</style>
