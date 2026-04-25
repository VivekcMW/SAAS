/**
 * Database Schema Types for Moonmart Application
 * These types define the structure of data stored in the database
 */

// Core Application data structure for database storage
export interface DatabaseApplication {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Basic Information
  name: string;
  website: string;
  short_description: string;
  long_description: string;
  categories: string[];
  search_keywords: string[];
  
  // Company Information
  company_name: string;
  company_website: string;
  company_size: string;
  company_location: string;
  founded: string;
  industries: string[];
  
  // Social Links (JSON field)
  social_links: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
    youtube?: string;
    tiktok?: string;
  };
  
  // Application Details
  features: string[];
  included_features: string[];
  pricing_models: string[];
  pricing_details: string;
  target_audience: string;
  
  // Technical Details
  platform_support: string[];
  application_stage: string;
  development_stage: string;
  business_model: string;
  api_available: boolean;
  webhook_support: boolean;
  
  // App-Specific Information
  app_version: string;
  supported_languages: string[];
  integrations: string[];
  
  // Distribution Links (JSON field)
  app_store_links: {
    web?: string;
    ios?: string;
    android?: string;
    windows?: string;
    mac?: string;
    linux?: string;
  };
  
  // Support Information
  support_channels: string[];
  documentation_url: string;
  help_center_url: string;
  
  // Media Assets
  logo_url: string;
  screenshots: Array<{
    url: string;
    caption: string;
    order: number;
  }>;
  
  // Videos (JSON field)
  videos: Array<{
    url: string;
    title: string;
    type: 'demo' | 'tutorial' | 'testimonial';
  }>;
  
  // Testimonials (JSON field)
  testimonials: Array<{
    author: string;
    company: string;
    role: string;
    content: string;
    rating: number;
  }>;
  
  // Team Information (JSON field)
  founder: {
    name: string;
    title: string;
    bio: string;
    profile_picture_url: string;
  };
  
  team_members: Array<{
    name: string;
    role: string;
    bio: string;
    profile_picture_url: string;
  }>;
  
  // Contact Information (JSON field)
  contact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  
  // Marketplace Display Data
  rating: number;
  review_count: number;
  featured: boolean;
  trending: boolean;
  tags: string[];
  
  // Pricing for marketplace display (JSON field)
  pricing: {
    type: 'free' | 'trial' | 'paid' | 'contact';
    value?: number;
    period?: string;
  };
  
  // Status and Review Information
  submission_date: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'published' | 'rejected';
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  
  // SEO and Analytics
  slug: string;
  meta_title?: string;
  meta_description?: string;
  view_count: number;
  click_count: number;
}

// For form submissions and API requests
export interface OnboardingSubmission {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Raw form data (JSON field containing the complete onboarding form)
  form_data: OnboardingFormData;
  
  // Transformed application data
  application_data: DatabaseApplication;
  
  // Submission metadata
  submission_ip: string;
  user_agent: string;
  
  // Processing status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_notes?: string;
  
  // File uploads tracking
  uploaded_files: Array<{
    field_name: string;
    original_name: string;
    stored_path: string;
    file_size: number;
    mime_type: string;
  }>;
}

// Import the OnboardingFormData type from our transformation composable
export type { OnboardingFormData } from '../composables/useProductTransformation';

// Database table creation SQL (for reference - adapt to your database system)
export const SQL_SCHEMA = `
-- Applications table
CREATE TABLE applications (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  short_description TEXT,
  long_description TEXT,
  categories JSON,
  search_keywords JSON,
  
  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  company_website VARCHAR(255),
  company_size VARCHAR(50),
  company_location VARCHAR(255),
  founded VARCHAR(4),
  industries JSON,
  
  -- Social Links
  social_links JSON,
  
  -- Application Details
  features JSON,
  included_features JSON,
  pricing_models JSON,
  pricing_details TEXT,
  target_audience TEXT,
  
  -- Technical Details
  platform_support JSON,
  application_stage VARCHAR(50),
  development_stage VARCHAR(50),
  business_model VARCHAR(50),
  api_available BOOLEAN DEFAULT FALSE,
  webhook_support BOOLEAN DEFAULT FALSE,
  
  -- App-Specific Information
  app_version VARCHAR(50),
  supported_languages JSON,
  integrations JSON,
  app_store_links JSON,
  
  -- Support Information
  support_channels JSON,
  documentation_url VARCHAR(255),
  help_center_url VARCHAR(255),
  
  -- Media Assets
  logo_url VARCHAR(255),
  screenshots JSON,
  videos JSON,
  testimonials JSON,
  
  -- Team Information
  founder JSON,
  team_members JSON,
  contact JSON,
  
  -- Marketplace Display Data
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  trending BOOLEAN DEFAULT FALSE,
  tags JSON,
  pricing JSON,
  
  -- Status and Review Information
  submission_date TIMESTAMP,
  status ENUM('draft', 'submitted', 'under_review', 'approved', 'published', 'rejected') DEFAULT 'draft',
  review_notes TEXT,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  
  -- SEO and Analytics
  slug VARCHAR(255) UNIQUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  view_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  
  INDEX idx_status (status),
  INDEX idx_featured (featured),
  INDEX idx_categories (categories),
  INDEX idx_slug (slug)
);

-- Onboarding submissions table
CREATE TABLE onboarding_submissions (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Raw form data
  form_data JSON NOT NULL,
  
  -- Transformed application data
  application_data JSON,
  
  -- Submission metadata
  submission_ip VARCHAR(45),
  user_agent TEXT,
  
  -- Processing status
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  processing_notes TEXT,
  
  -- File uploads
  uploaded_files JSON,
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Reviews table (for user reviews of applications)
CREATE TABLE reviews (
  id VARCHAR(255) PRIMARY KEY,
  application_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  INDEX idx_application_id (application_id),
  INDEX idx_rating (rating),
  INDEX idx_status (status)
);

-- Analytics table (for tracking application views and interactions)
CREATE TABLE analytics (
  id VARCHAR(255) PRIMARY KEY,
  application_id VARCHAR(255) NOT NULL,
  event_type ENUM('view', 'click', 'trial_start', 'download') NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  INDEX idx_application_id (application_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
);
`;

// Helper functions for database operations
export const DatabaseHelpers = {
  /**
   * Generate a unique slug from application name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },

  /**
   * Validate application data before database insertion
   */
  validateApplicationData(data: Partial<DatabaseApplication>): boolean {
    const required = ['name', 'company_name', 'short_description'];
    return required.every(field => data[field as keyof DatabaseApplication]);
  },

  /**
   * Sanitize text content for database storage
   */
  sanitizeText(text: string): string {
    return text.trim().substring(0, 5000); // Limit length and trim whitespace
  },

  /**
   * Process file uploads and return file metadata
   */
  processFileUpload(file: File, fieldName: string): Promise<{
    field_name: string;
    original_name: string;
    stored_path: string;
    file_size: number;
    mime_type: string;
  }> {
    // This would implement actual file upload logic
    // For now, return a mock response
    return Promise.resolve({
      field_name: fieldName,
      original_name: file.name,
      stored_path: `/uploads/${Date.now()}-${file.name}`,
      file_size: file.size,
      mime_type: file.type
    });
  }
};
