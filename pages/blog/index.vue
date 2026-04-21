<template>
  <div class="blog-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="container">
        <div class="page-hero-content">
          <h1>The Software Insider</h1>
          <p>Expert insights, industry trends, and actionable strategies to help you navigate the world of business software.</p>
        </div>
      </div>
    </section>

    <!-- Featured Post -->
    <section class="featured-post" v-if="featuredPost">
      <div class="container">
        <div class="featured-post-card">
          <div class="featured-post-image">
            <img :src="featuredPost.image" :alt="featuredPost.title">
            <div class="featured-tag">Featured</div>
          </div>
          <div class="featured-post-content">
            <div class="post-meta">
              <span class="post-category">{{ featuredPost.category }}</span>
              <span class="post-date">{{ formatDate(featuredPost.date) }}</span>
              <span class="post-author">{{ featuredPost.author }}</span>
            </div>
            <h2>{{ featuredPost.title }}</h2>
            <p class="post-excerpt">{{ featuredPost.excerpt }}</p>
            <NuxtLink :to="`/blog/${featuredPost.slug}`" class="btn btn-primary">Read More</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog Posts Grid -->
    <section class="blog-posts">
      <div class="container">
        <!-- Category Filter -->
        <div class="blog-filters">
          <div class="category-filter">
            <span 
              class="category-item" 
              :class="{ 'active': activeCategory === 'all' }" 
              @click="setCategory('all')"
            >
              All
            </span>
            <span 
              v-for="category in categories" 
              :key="category" 
              class="category-item" 
              :class="{ 'active': activeCategory === category }" 
              @click="setCategory(category)"
            >
              {{ category }}
            </span>
          </div>
          
          <div class="search-filter">
            <div class="search-input">
              <UIcon dynamic name="i-heroicons-magnifying-glass" />
              <input 
                type="text" 
                placeholder="Search articles..." 
                v-model="searchQuery" 
                @input="filterPosts"
              >
            </div>
          </div>
        </div>
        
        <!-- Posts Grid -->
        <div v-if="filteredPosts.length > 0" class="posts-grid">
          <StaticBlogCard 
            v-for="post in displayedPosts" 
            :key="post.slug" 
            :post="post"
          />
        </div>
        
        <!-- No Results -->
        <div v-else class="no-results">
          <UIcon dynamic name="i-heroicons-document-search" />
          <h2>No articles found</h2>
          <p>Try adjusting your search or filter to find what you're looking for.</p>
          <button class="btn btn-outline" @click="resetFilters">Reset Filters</button>
        </div>
        
        <!-- Pagination -->
        <div v-if="filteredPosts.length > 0" class="pagination">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="setPage(currentPage - 1)"
          >
            <UIcon dynamic name="i-heroicons-arrow-left" /> Previous
          </button>
          
          <span class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          
          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages"
            @click="setPage(currentPage + 1)"
          >
            Next <UIcon dynamic name="i-heroicons-arrow-right" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Import the static thumbnails composable
const { getThumbnail } = useStaticThumbnails();

// Featured Post
const featuredPost = {
  title: "Slack vs Microsoft Teams vs Discord: The Ultimate 2025 Team Communication Guide",
  slug: "slack-vs-teams-vs-discord-2025-guide",
  excerpt: "Comprehensive comparison of the top 3 team communication platforms. Find out which tool is perfect for your team's needs, budget, and workflow.",
  category: "Software Comparison",
  date: "2025-08-21",
  author: "SaaSWorld Team",
  image: getThumbnail("slack-vs-teams-vs-discord-2025-guide")
};

// Blog posts data - 60 SEO-optimized articles
const allPosts = ref([
  // Week 1-2: Foundation Articles (High-Impact Comparisons)
  {
    title: "Slack vs Microsoft Teams vs Discord: The Ultimate 2025 Team Communication Guide",
    slug: "slack-vs-teams-vs-discord-2025-guide",
    excerpt: "Comprehensive comparison of the top 3 team communication platforms. Find out which tool is perfect for your team's needs, budget, and workflow.",
    category: "Software Comparison",
    date: "2025-08-21",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "HubSpot vs Salesforce vs Pipedrive: CRM Showdown 2025",
    slug: "hubspot-vs-salesforce-vs-pipedrive-crm-comparison",
    excerpt: "Complete CRM comparison covering features, capabilities, and use cases. Discover which customer relationship management platform delivers the best ROI for your business.",
    category: "Software Comparison", 
    date: "2025-08-20",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Notion vs Monday.com vs Asana: Project Management Platform Battle",
    slug: "notion-vs-monday-vs-asana-project-management",
    excerpt: "In-depth analysis of leading project management tools. Compare features, integrations, collaboration, and team collaboration capabilities to make the right choice.",
    category: "Software Comparison",
    date: "2025-08-19", 
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Zoom vs Google Meet vs Skype: Video Conferencing Software Comparison 2025",
    slug: "zoom-vs-google-meet-vs-skype-video-conferencing",
    excerpt: "Detailed comparison of top video conferencing platforms. Evaluate features, security, reliability, and performance to choose the best solution for remote meetings.",
    category: "Software Comparison",
    date: "2025-08-18",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Shopify vs WooCommerce vs BigCommerce: E-commerce Platform Guide 2025",
    slug: "shopify-vs-woocommerce-vs-bigcommerce-ecommerce",
    excerpt: "Complete e-commerce platform comparison covering features, capabilities, customization, and scalability. Find the perfect solution for your online store.",
    category: "Software Comparison",
    date: "2025-08-17",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "10 AI Tools Every Small Business Must Use in 2025",
    slug: "10-ai-tools-small-business-2025",
    excerpt: "Discover game-changing AI tools that can automate tasks, boost productivity, and boost productivity for small businesses. Complete implementation guide and best practices.",
    category: "AI & Automation",
    date: "2025-08-16",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Best Software for Remote Teams: Complete 2025 Stack Guide",
    slug: "best-software-remote-teams-2025-stack",
    excerpt: "Essential software stack for remote team success. Covers communication, project management, file sharing, time tracking, and productivity tools with detailed recommendations.",
    category: "Business Growth",
    date: "2025-08-15",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Free vs Paid Business Software: When to Upgrade (ROI Calculator Included)",
    slug: "free-vs-paid-business-software-when-upgrade",
    excerpt: "Strategic guide to choosing between free and paid software. Includes ROI calculator, feature comparison analysis, and upgrade timing recommendations for maximum value.",
    category: "Software Selection",
    date: "2025-08-14",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Cybersecurity Software Stack for Small Business: 2025 Protection Guide",
    slug: "cybersecurity-software-stack-small-business-2025",
    excerpt: "Complete cybersecurity software guide covering antivirus, firewalls, VPNs, password managers, and backup solutions. Protect your business from cyber threats.",
    category: "Security & Compliance",
    date: "2025-08-13",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Software Buying Guide: 20 Critical Questions Before Any Purchase",
    slug: "software-buying-guide-20-questions-before-purchase",
    excerpt: "Comprehensive software evaluation checklist. Avoid implementation mistakes with our proven framework for assessing features, security, scalability, and vendor reliability.",
    category: "Buying Guides",
    date: "2025-08-12",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },

  // Week 3-4: Industry-Specific Guides
  {
    title: "Best Software for Real Estate Agents: Complete 2025 Toolkit",
    slug: "best-software-real-estate-agents-2025-toolkit",
    excerpt: "Essential software tools for real estate professionals. CRM, lead generation, virtual tours, document management, and transaction tools reviewed and compared.",
    category: "Industry Guides",
    date: "2025-08-11",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Essential Software Tools for Digital Marketing Agencies in 2025",
    slug: "essential-software-digital-marketing-agencies-2025",
    excerpt: "Complete software stack for marketing agencies. SEO tools, social media management, analytics, project management, and client reporting solutions compared.",
    category: "Industry Guides", 
    date: "2025-08-10",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "E-commerce Success Software Stack: 2025 Complete Guide",
    slug: "ecommerce-success-software-stack-2025-guide",
    excerpt: "Build a profitable online store with the right software. Platforms, payment processing, inventory management, marketing automation, and analytics tools reviewed.",
    category: "Industry Guides",
    date: "2025-08-09",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Healthcare Practice Management Software: 2025 Comprehensive Review",
    slug: "healthcare-practice-management-software-2025",
    excerpt: "EMR, patient scheduling, billing, telehealth, and compliance software for healthcare practices. HIPAA-compliant solutions compared with features and capabilities.",
    category: "Industry Guides",
    date: "2025-08-08",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Restaurant Management Software: Complete 2025 Buyer's Guide",
    slug: "restaurant-management-software-2025-buyers-guide",
    excerpt: "POS systems, inventory management, staff scheduling, delivery integration, and customer management tools for restaurants. Features, capabilities, and implementation analysis.",
    category: "Industry Guides",
    date: "2025-08-07",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Law Firm Software: Legal Practice Management Guide 2025",
    slug: "law-firm-software-legal-practice-management-2025",
    excerpt: "Case management, document automation, time tracking, billing, and client communication software for law firms. Bar-compliant solutions with security focus.",
    category: "Industry Guides",
    date: "2025-08-06",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Accounting Firm Software: Complete Technology Stack 2025",
    slug: "accounting-firm-software-technology-stack-2025",
    excerpt: "Tax preparation, bookkeeping, audit management, client portals, and workflow automation software for accounting firms. Cloud-based solutions compared.",
    category: "Industry Guides",
    date: "2025-08-05",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Construction Management Software: 2025 Industry Comparison",
    slug: "construction-management-software-2025-comparison",
    excerpt: "Project management, scheduling, project tracking, equipment management, and field reporting software for construction companies. Mobile-first solutions reviewed.",
    category: "Industry Guides",
    date: "2025-08-04",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Nonprofit Organization Software: Essential Tools for Impact",
    slug: "nonprofit-organization-software-essential-tools-impact",
    excerpt: "Donor management, fundraising, volunteer coordination, grant tracking, and financial management software for nonprofits. Budget-friendly solutions prioritized.",
    category: "Industry Guides",
    date: "2025-08-03",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Education Technology Software: 2025 Guide for Schools",
    slug: "education-technology-software-2025-guide-schools",
    excerpt: "Learning management systems, student information systems, communication tools, and assessment software for educational institutions. K-12 and higher ed solutions.",
    category: "Industry Guides",
    date: "2025-08-02",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },

  // Week 5-6: Business Growth & Strategy
  {
    title: "15 Must-Have SaaS Tools for Scaling Your Startup in 2025",
    slug: "15-must-have-saas-tools-scaling-startup-2025",
    excerpt: "Essential software stack for startup growth. From MVP to scale-up, discover tools for product development, marketing, sales, operations, and team management.",
    category: "Business Growth",
    date: "2025-08-01",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Digital Transformation: Software Tools That Actually Drive Growth",
    slug: "digital-transformation-software-tools-drive-growth",
    excerpt: "Strategic guide to digital transformation. Process automation, data analytics, customer experience, and productivity tools that deliver measurable business results.",
    category: "Business Growth",
    date: "2025-07-31",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "SaaS Metrics Every Business Should Track: 2025 KPI Guide",
    slug: "saas-metrics-every-business-track-2025-kpi",
    excerpt: "Master SaaS analytics with our comprehensive metrics guide. Track MRR, churn, CAC, LTV, and other critical KPIs with recommended software tools and dashboards.",
    category: "Business Growth", 
    date: "2025-07-30",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Workflow Automation: 25 Time-Saving Ideas for Business Efficiency",
    slug: "workflow-automation-25-time-saving-ideas-efficiency",
    excerpt: "Practical automation workflows that save hours weekly. Marketing, sales, operations, and administrative process automation with step-by-step implementation guides.",
    category: "Integration & Workflow",
    date: "2025-07-29",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "No-Code Platforms: Building Business Apps Without Programming",
    slug: "no-code-platforms-building-business-apps-programming",
    excerpt: "Comprehensive guide to no-code development. Compare platforms, learn best practices, and discover how to build custom business applications without coding skills.",
    category: "Integration & Workflow",
    date: "2025-07-28",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "API Integration Guide: Connecting Your Business Tools Seamlessly",
    slug: "api-integration-guide-connecting-business-tools",
    excerpt: "Master API integrations for business efficiency. Connect apps, automate data sync, and create unified workflows with practical examples and best practices.",
    category: "Integration & Workflow",
    date: "2025-07-27",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Data Backup Solutions: Preventing Business Disasters in 2025",
    slug: "data-backup-solutions-preventing-business-disasters",
    excerpt: "Comprehensive backup strategy guide. Cloud backup, local backup, hybrid solutions, and disaster recovery planning to protect your business data and operations.",
    category: "Security & Compliance",
    date: "2025-07-26",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Password Management for Teams: Security Best Practices 2025",
    slug: "password-management-teams-security-best-practices",
    excerpt: "Enterprise password management guide. Compare business password managers, implement security policies, and protect your organization from credential-based attacks.",
    category: "Security & Compliance",
    date: "2025-07-25",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "GDPR Compliance Software: Essential Tools for EU Business",
    slug: "gdpr-compliance-software-essential-tools-eu-business",
    excerpt: "Navigate GDPR requirements with the right software. Data mapping, consent management, privacy impact assessments, and compliance monitoring tools reviewed.",
    category: "Security & Compliance",
    date: "2025-07-24",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Software Budget Planning: Software Selection Strategies 2025",
    slug: "software-budget-planning-strategic-selection-2025",
    excerpt: "Strategic approach to software spending. Budget allocation, project tracking, license optimization, and vendor negotiation tactics to maximize software ROI.",
    category: "Software Selection",
    date: "2025-07-23",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },

  // Week 7-8: Advanced Features & Comparisons
  {
    title: "Software License Management: Avoiding Compliance Nightmares",
    slug: "software-license-management-compliance-guide",
    excerpt: "Complete guide to software license management. Avoid audits, reduce costs, and ensure compliance with enterprise license tracking and optimization strategies.",
    category: "Software Selection",
    date: "2025-07-22",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "SaaS vs On-Premise: Total Cost of Ownership Analysis 2025",
    slug: "saas-vs-on-premise-total-cost-ownership-2025",
    excerpt: "Comprehensive TCO analysis comparing SaaS and on-premise solutions. Hidden costs, scalability, security, and maintenance considerations for informed decisions.",
    category: "Software Selection",
    date: "2025-07-21",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "AI-Powered Customer Service: Software Tools Comparison 2025",
    slug: "ai-powered-customer-service-software-comparison",
    excerpt: "Compare AI customer service platforms. Chatbots, sentiment analysis, automated ticketing, and omnichannel support solutions for superior customer experience.",
    category: "AI & Automation",
    date: "2025-07-20",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Marketing Automation Platforms: HubSpot vs Marketo vs Pardot",
    slug: "marketing-automation-hubspot-marketo-pardot-comparison",
    excerpt: "Detailed comparison of enterprise marketing automation platforms. Lead scoring, email marketing, campaign management, and integration capabilities analyzed.",
    category: "Software Comparison",
    date: "2025-07-19",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Document Management Systems: SharePoint vs Box vs Google Drive",
    slug: "document-management-sharepoint-box-google-drive",
    excerpt: "Enterprise document management comparison. Collaboration features, security, compliance, storage limits, and integration capabilities for business file management.",
    category: "Software Comparison",
    date: "2025-07-18",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Business Intelligence Tools: Tableau vs Power BI vs Looker",
    slug: "business-intelligence-tableau-power-bi-looker",
    excerpt: "Comprehensive BI platform comparison. Data visualization, reporting, analytics capabilities, pricing, and ease of use for data-driven business decisions.",
    category: "Software Comparison",
    date: "2025-07-17",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Time Tracking Software: RescueTime vs Toggl vs Clockify Comparison",
    slug: "time-tracking-software-rescuetime-toggl-clockify",
    excerpt: "Compare top time tracking tools for productivity and billing. Features, integrations, reporting, team management, and pricing for optimal time management.",
    category: "Software Comparison",
    date: "2025-07-16",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Email Marketing Platforms: Mailchimp vs ConvertKit vs ActiveCampaign",
    slug: "email-marketing-mailchimp-convertkit-activecampaign",
    excerpt: "In-depth email marketing software comparison. Automation, segmentation, deliverability, pricing, and integration features for effective email campaigns.",
    category: "Software Comparison",
    date: "2025-07-15",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Inventory Management Software: TradeGecko vs Cin7 vs Fishbowl",
    slug: "inventory-management-tradegecko-cin7-fishbowl",
    excerpt: "Comprehensive inventory management software comparison. Multi-channel selling, warehouse management, reporting, and integration capabilities for growing businesses.",
    category: "Software Comparison",
    date: "2025-07-14",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },

  // Week 9-10: AI & Automation Deep Dive
  {
    title: "ChatGPT vs Claude vs Gemini: AI Assistant Business Comparison",
    slug: "chatgpt-claude-gemini-ai-assistant-business",
    excerpt: "Compare leading AI assistants for business use. Features, pricing, API access, security, and enterprise capabilities for workplace productivity enhancement.",
    category: "AI & Automation",
    date: "2025-07-13",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "RPA Tools for Business: UiPath vs Automation Anywhere vs Blue Prism",
    slug: "rpa-tools-uipath-automation-anywhere-blue-prism",
    excerpt: "Robotic Process Automation platform comparison. Bot development, scalability, maintenance, and ROI analysis for business process automation.",
    category: "AI & Automation",
    date: "2025-07-12",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "AI Writing Tools for Business: Jasper vs Copy.ai vs Writesonic",
    slug: "ai-writing-tools-business-jasper-copy-writesonic",
    excerpt: "AI writing software comparison for business content. Marketing copy, blog posts, social media, and email content generation tools evaluated.",
    category: "AI & Automation",
    date: "2025-07-11",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Machine Learning Platforms: AWS SageMaker vs Google AI vs Azure ML",
    slug: "machine-learning-platforms-aws-google-azure",
    excerpt: "Enterprise ML platform comparison. Model development, deployment, scalability, pricing, and integration capabilities for business AI implementation.",
    category: "AI & Automation",
    date: "2025-07-10",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Predictive Analytics Software: SAS vs SPSS vs R vs Python",
    slug: "predictive-analytics-software-sas-spss-r-python",
    excerpt: "Compare predictive analytics tools for business forecasting. Statistical analysis, data mining, model building, and visualization capabilities reviewed.",
    category: "AI & Automation",
    date: "2025-07-09",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Voice AI for Business: Amazon Alexa vs Google Assistant vs Microsoft Cortana",
    slug: "voice-ai-business-alexa-google-cortana",
    excerpt: "Enterprise voice AI comparison. Voice commands, smart office integration, productivity features, and security considerations for business environments.",
    category: "AI & Automation",
    date: "2025-07-08",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Computer Vision Software: AWS Rekognition vs Google Vision vs Azure",
    slug: "computer-vision-software-aws-google-azure",
    excerpt: "Computer vision API comparison for business applications. Image recognition, OCR, facial recognition, and object detection capabilities analyzed.",
    category: "AI & Automation",
    date: "2025-07-07",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Natural Language Processing Tools: OpenAI vs Hugging Face vs IBM Watson",
    slug: "nlp-tools-openai-hugging-face-ibm-watson",
    excerpt: "NLP platform comparison for business text analysis. Sentiment analysis, language translation, chatbots, and document processing capabilities reviewed.",
    category: "AI & Automation",
    date: "2025-07-06",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Automation Testing Tools: Selenium vs Cypress vs Playwright",
    slug: "automation-testing-tools-selenium-cypress-playwright",
    excerpt: "Web automation testing framework comparison. Browser compatibility, ease of use, performance, and CI/CD integration for quality assurance teams.",
    category: "AI & Automation",
    date: "2025-07-05",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Smart Home Business Integration: IoT Platforms for Offices",
    slug: "smart-home-business-integration-iot-platforms",
    excerpt: "IoT platform comparison for smart office environments. Device management, security, automation, and energy efficiency solutions for modern workplaces.",
    category: "AI & Automation", 
    date: "2025-07-04",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },

  // Week 11-12: Integration, Security & Future Trends
  {
    title: "API Management Platforms: Kong vs Apigee vs Amazon API Gateway",
    slug: "api-management-platforms-kong-apigee-amazon",
    excerpt: "Enterprise API management comparison. Gateway features, security, analytics, developer portal, and scalability for API-first business architecture.",
    category: "Integration & Workflow",
    date: "2025-07-03",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Microservices Architecture: Docker vs Kubernetes vs Serverless",
    slug: "microservices-architecture-docker-kubernetes-serverless",
    excerpt: "Containerization and orchestration platform comparison. Deployment strategies, scalability, cost optimization, and management tools for microservices.",
    category: "Integration & Workflow",
    date: "2025-07-02",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Database Management Systems: PostgreSQL vs MySQL vs MongoDB",
    slug: "database-management-postgresql-mysql-mongodb",
    excerpt: "Database platform comparison for business applications. Performance, scalability, security, query capabilities, and use case recommendations.",
    category: "Integration & Workflow",
    date: "2025-07-01",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Cloud Storage Solutions: AWS S3 vs Google Cloud vs Azure Blob",
    slug: "cloud-storage-aws-s3-google-cloud-azure",
    excerpt: "Enterprise cloud storage comparison. Cost analysis, performance, security, compliance, and integration features for business data storage needs.",
    category: "Integration & Workflow",
    date: "2025-06-30",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "VPN Solutions for Business: NordLayer vs ExpressVPN vs Cisco",
    slug: "vpn-solutions-business-nordlayer-expressvpn-cisco",
    excerpt: "Business VPN service comparison. Security protocols, server networks, performance, team management, and compliance features for remote work security.",
    category: "Security & Compliance",
    date: "2025-06-29",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Endpoint Security Software: CrowdStrike vs SentinelOne vs Microsoft Defender",
    slug: "endpoint-security-crowdstrike-sentinelone-microsoft",
    excerpt: "Enterprise endpoint protection comparison. Threat detection, response capabilities, management console, and pricing for comprehensive endpoint security.",
    category: "Security & Compliance",
    date: "2025-06-28",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Identity Access Management: Okta vs Azure AD vs Auth0",
    slug: "identity-access-management-okta-azure-auth0",
    excerpt: "IAM platform comparison for enterprise security. Single sign-on, multi-factor authentication, user provisioning, and compliance features analyzed.",
    category: "Security & Compliance",
    date: "2025-06-27",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "SIEM Solutions: Splunk vs IBM QRadar vs Microsoft Sentinel",
    slug: "siem-solutions-splunk-qradar-microsoft-sentinel",
    excerpt: "Security Information and Event Management comparison. Log analysis, threat detection, incident response, and compliance reporting for enterprise security.",
    category: "Security & Compliance",
    date: "2025-06-26",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "DevOps Tools: Jenkins vs GitLab CI vs GitHub Actions",
    slug: "devops-tools-jenkins-gitlab-github-actions",
    excerpt: "CI/CD platform comparison for development teams. Pipeline automation, integration capabilities, ease of use, and scaling considerations.",
    category: "Integration & Workflow",
    date: "2025-06-25",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  },
  {
    title: "Future of Work: Emerging Software Trends for 2026",
    slug: "future-of-work-emerging-software-trends-2026",
    excerpt: "Explore upcoming software innovations shaping the workplace. AI integration, virtual collaboration, automation trends, and technology predictions for businesses.",
    category: "Business Growth",
    date: "2025-06-24",
    author: "SaaSWorld Team",
    image: "/assets/images/hero-dashboard.png"
  }
]);

// Extract unique categories from posts
const categories = computed(() => {
  const categoriesSet = new Set(allPosts.value.map(post => post.category));
  return Array.from(categoriesSet);
});

// Filtering and pagination state
const activeCategory = ref('all');
const searchQuery = ref('');
const filteredPosts = ref([]);
const currentPage = ref(1);
const postsPerPage = 6;

// Computed total pages
const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / postsPerPage);
});

// Display posts for current page
const displayedPosts = computed(() => {
  const startIndex = (currentPage.value - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  return filteredPosts.value.slice(startIndex, endIndex);
});

// Filter posts based on category and search query
const filterPosts = () => {
  let filtered = [...allPosts.value];
  
  // Filter by category
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(post => post.category === activeCategory.value);
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(query) || 
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query)
    );
  }
  
  // Update filtered posts
  filteredPosts.value = filtered;
  
  // Reset to first page when filters change
  currentPage.value = 1;
};

// Set active category
const setCategory = (category) => {
  activeCategory.value = category;
  filterPosts();
};

// Reset all filters
const resetFilters = () => {
  activeCategory.value = 'all';
  searchQuery.value = '';
  filterPosts();
};

// Set current page
const setPage = (page) => {
  if (page < 1) page = 1;
  if (page > totalPages.value) page = totalPages.value;
  currentPage.value = page;
};

// Format date
const formatDate = (dateStr) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
};

// Initialize filtered posts on mount
onMounted(() => {
  filterPosts();
});
</script>

<style scoped>
.blog-page {
  padding-top: 80px;
}

.page-hero {
  background-color: var(--color-primary-light);
  padding: 80px 0;
  text-align: center;
}

.page-hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.page-hero p {
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto;
  color: var(--color-gray-700);
}

/* Featured Post */
.featured-post {
  padding: 60px 0;
}

.featured-post-card {
  display: flex;
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.featured-post-image {
  flex: 1;
  min-height: 400px;
  position: relative;
  overflow: hidden;
}

.featured-post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 15% center;
  transition: transform 0.3s ease;
}

.featured-post-card:hover .featured-post-image img {
  transform: scale(1.02);
}

.featured-tag {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 6px 12px;
  border-radius: 30px;
}

.featured-post-content {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.post-category {
  color: var(--color-primary);
  font-weight: 600;
}

.post-date, .post-author {
  color: var(--color-gray-600);
}

.featured-post-content h2 {
  font-size: 2.25rem;
  margin-bottom: 16px;
  color: var(--color-gray-900);
}

.post-excerpt {
  margin-bottom: 24px;
  color: var(--color-gray-700);
  font-size: 1.125rem;
  line-height: 1.6;
}

/* Blog Posts Section */
.blog-posts {
  padding: 80px 0;
  background-color: var(--color-gray-50);
}

.blog-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
  gap: 20px;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-item {
  padding: 8px 16px;
  border-radius: 30px;
  background-color: white;
  color: var(--color-gray-700);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-item:hover {
  background-color: var(--color-gray-100);
}

.category-item.active {
  background-color: var(--color-primary);
  color: white;
}

.search-input {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: var(--border-radius-input);
  padding: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input input {
  border: none;
  padding: 12px;
  outline: none;
  font-size: 0.95rem;
  width: 200px;
}

.search-input svg {
  color: var(--color-gray-500);
}

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.post-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
}

.post-image {
  height: 200px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.post-card:hover .post-image img {
  transform: scale(1.05);
}

.post-content {
  padding: 24px;
}

.post-content h3 {
  font-size: 1.375rem;
  margin-bottom: 12px;
}

.post-content h3 a {
  color: var(--color-gray-900);
  text-decoration: none;
  transition: color 0.3s;
}

.post-content h3 a:hover {
  color: var(--color-primary);
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--color-gray-700);
}

.read-more {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.read-more:hover {
  text-decoration: underline;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 60px 0;
  color: var(--color-gray-600);
}

.no-results svg {
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-results h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.no-results p {
  margin-bottom: 20px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 60px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  background-color: var(--color-gray-100);
  color: var(--color-gray-800);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--color-gray-600);
}

/* Responsive styles */
@media (max-width: 992px) {
  .featured-post-card {
    flex-direction: column;
  }
  
  .featured-post-image {
    height: 300px;
  }
  
  .featured-post-image img {
    object-position: center center;
  }
  
  .featured-post-content {
    padding: 30px;
  }
  
  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .newsletter-card {
    padding: 40px 20px;
  }
}

@media (max-width: 768px) {
  .page-hero h1 {
    font-size: 2.5rem;
  }
  
  .featured-post-content h2 {
    font-size: 1.75rem;
  }
  
  .blog-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-input {
    flex-direction: column;
  }
  
  .form-input input {
    border-radius: 8px;
    margin-bottom: 10px;
  }
  
  .form-input button {
    border-radius: 8px;
    justify-content: center;
    padding: 12px;
  }
}

@media (max-width: 576px) {
  .category-filter {
    justify-content: center;
  }
  
  .post-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
