<template>
  <div class="blog">
    <!-- Intro -->
    <header class="blog__intro">
      <div class="blog__wrap">
        <span class="blog__label">Journal</span>
        <h1 class="blog__headline">The Software Insider.</h1>
        <p class="blog__lede">
          Plain-spoken guides, honest comparisons, and practical playbooks for choosing
          software that actually fits your business.
        </p>
      </div>
    </header>

    <!-- Featured -->
    <section v-if="featuredPost" class="blog__feature">
      <div class="blog__wrap">
        <NuxtLink :to="`/blog/${featuredPost.slug}`" class="feature">
          <div class="feature__text">
            <span class="feature__kicker">This week’s read</span>
            <h2 class="feature__title">{{ featuredPost.title }}</h2>
            <p class="feature__excerpt">{{ featuredPost.excerpt }}</p>
            <div class="feature__meta">
              <span>{{ featuredPost.category }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ formatDate(featuredPost.date) }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ featuredPost.author }}</span>
            </div>
          </div>
          <div class="feature__media">
            <img :src="getThumbnail(featuredPost.slug)" :alt="featuredPost.title" loading="lazy" @error="onImgError">
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Topics bar -->
    <div class="blog__bar">
      <div class="blog__wrap">
        <div class="topics" role="tablist" aria-label="Filter articles by topic">
          <button
            type="button"
            role="tab"
            class="topic"
            :class="{ 'topic--on': activeCategory === 'all' }"
            :aria-selected="activeCategory === 'all'"
            @click="setCategory('all')"
          >All</button>
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            role="tab"
            class="topic"
            :class="{ 'topic--on': activeCategory === category }"
            :aria-selected="activeCategory === category"
            @click="setCategory(category)"
          >{{ category }}</button>
        </div>

        <label class="find">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search articles"
            aria-label="Search articles"
            @input="filterPosts"
          >
        </label>
      </div>
    </div>

    <!-- List -->
    <section class="blog__list">
      <div class="blog__wrap">
        <div v-if="filteredPosts.length > 0" class="blog__meta-row">
          <span>
            Showing <strong>{{ displayedPosts.length }}</strong>
            of {{ filteredPosts.length }} article<span v-if="filteredPosts.length !== 1">s</span>
          </span>
          <span v-if="activeCategory !== 'all' || searchQuery" class="blog__meta-reset">
            <button type="button" @click="resetFilters">Clear filters</button>
          </span>
        </div>

        <div v-if="filteredPosts.length > 0" class="grid">
          <article
            v-for="post in displayedPosts"
            :key="post.slug"
            class="post"
          >
            <NuxtLink :to="`/blog/${post.slug}`" class="post__link">
              <div class="post__media">
                <img :src="getThumbnail(post.slug)" :alt="post.title" loading="lazy" @error="onImgError">
              </div>
              <div class="post__body">
                <div class="post__meta">
                  <span class="post__tag">{{ post.category }}</span>
                  <span class="post__date">{{ formatDate(post.date) }}</span>
                </div>
                <h3 class="post__title">{{ post.title }}</h3>
                <p class="post__excerpt">{{ post.excerpt }}</p>
                <span class="post__cta">
                  Read article
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Empty -->
        <div v-else class="empty">
          <h3>Nothing matches that search.</h3>
          <p>Try a different keyword, or browse all articles.</p>
          <button type="button" class="empty__btn" @click="resetFilters">Browse all</button>
        </div>

        <!-- Pagination -->
        <nav v-if="filteredPosts.length > 0 && totalPages > 1" class="pager" aria-label="Pagination">
          <button
            type="button"
            class="pager__btn"
            :disabled="currentPage === 1"
            @click="setPage(currentPage - 1)"
            aria-label="Previous page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="M11 6l-6 6 6 6" />
            </svg>
          </button>
          <span class="pager__info">
            <strong>{{ currentPage }}</strong> / {{ totalPages }}
          </span>
          <button
            type="button"
            class="pager__btn"
            :disabled="currentPage === totalPages"
            @click="setPage(currentPage + 1)"
            aria-label="Next page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </button>
        </nav>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Import the static thumbnails composable
const { getThumbnail } = useStaticThumbnails();

// Graceful fallback when a thumbnail fails to load
const FALLBACK_THUMB = '/assets/images/hero-dashboard.png';
const onImgError = (e) => {
  const img = e.target;
  if (img && img.src && !img.src.endsWith(FALLBACK_THUMB)) {
    img.src = FALLBACK_THUMB;
  }
};

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
/* Shell ---------------------------------------------------------- */
.blog { background: #ffffff; color: #1e1e1e; }
.blog__wrap { max-width: 1160px; margin: 0 auto; padding: 0 1.5rem; }

/* Intro ---------------------------------------------------------- */
.blog__intro {
  padding: 5rem 0 2.75rem;
  border-bottom: 1px solid #f0efec;
}
.blog__label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sw-primary, #ff8838);
  margin-bottom: 1rem;
}
.blog__headline {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: #1e1e1e;
  margin: 0 0 1rem;
  max-width: 720px;
}
.blog__lede {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: #52525b;
  margin: 0;
  max-width: 620px;
}

/* Featured ------------------------------------------------------- */
.blog__feature { padding: 3rem 0 1rem; }
.feature {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 3rem;
  align-items: center;
  color: inherit;
  text-decoration: none;
}
.feature__kicker {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sw-primary, #ff8838);
  margin-bottom: 1rem;
}
.feature__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: clamp(1.625rem, 3vw, 2.25rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.005em;
  color: #1e1e1e;
  margin: 0 0 1rem;
  transition: color 0.2s ease;
}
.feature:hover .feature__title { color: var(--sw-primary, #ff8838); }
.feature__excerpt {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: #3f3f46;
  margin: 0 0 1.25rem;
}
.feature__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #71717a;
}
.feature__meta span:first-child { font-weight: 600; color: #1e1e1e; }
.feature__media {
  aspect-ratio: 4 / 3;
  background: var(--sw-primary-soft, #fff1e6);
  border-radius: 18px;
  overflow: hidden;
  display: grid;
  place-items: center;
}
.feature__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  padding: 1.25rem;
  transition: transform 0.5s ease;
}
.feature:hover .feature__media img { transform: scale(1.03); }

/* Topics bar ----------------------------------------------------- */
.blog__bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(180%) blur(8px);
  border-top: 1px solid #f0efec;
  border-bottom: 1px solid #f0efec;
  margin-top: 2rem;
}
.blog__bar .blog__wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
.topics {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1 1 auto;
  min-width: 0;
}
.topics::-webkit-scrollbar { display: none; }
.topic {
  background: transparent;
  border: none;
  color: #71717a;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 0;
  position: relative;
  font-family: inherit;
  transition: color 0.15s ease;
}
.topic:hover { color: #1e1e1e; }
.topic--on {
  color: #1e1e1e;
  font-weight: 600;
}
.topic--on::after {
  content: '';
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: -0.75rem;
  height: 2px;
  background: var(--sw-primary, #ff8838);
}
.find {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 40px;
  padding: 0 0.85rem;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  transition: border-color 0.15s ease;
  flex-shrink: 0;
  width: 240px;
}
.find:focus-within {
  border-color: var(--sw-primary, #ff8838);
}
.find svg {
  width: 16px;
  height: 16px;
  color: #a1a1aa;
  flex-shrink: 0;
}
.find input {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  font-size: 0.9375rem;
  color: #1e1e1e;
  font-family: inherit;
}
.find input::placeholder { color: #a1a1aa; }

/* List ----------------------------------------------------------- */
.blog__list { padding: 3rem 0 6rem; }
.blog__meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #71717a;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.blog__meta-row strong { color: #1e1e1e; font-weight: 700; }
.blog__meta-reset button {
  background: none;
  border: none;
  padding: 0;
  color: var(--sw-primary, #ff8838);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem 2rem;
}

.post { border: none; background: transparent; }
.post__link {
  display: block;
  color: inherit;
  text-decoration: none;
}
.post__media {
  aspect-ratio: 16 / 10;
  background: var(--sw-primary-soft, #fff1e6);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1rem;
  display: grid;
  place-items: center;
}
.post__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  padding: 0.75rem;
  transition: transform 0.4s ease;
}
.post__link:hover .post__media img { transform: scale(1.04); }
.post__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}
.post__tag {
  font-weight: 700;
  color: var(--sw-primary, #ff8838);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.post__date { color: #a1a1aa; }
.post__title {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
  color: #1e1e1e;
  margin: 0 0 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s ease;
}
.post__link:hover .post__title { color: var(--sw-primary, #ff8838); }
.post__excerpt {
  font-size: 0.9375rem;
  line-height: 1.55;
  color: #52525b;
  margin: 0 0 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e1e1e;
  transition: color 0.15s ease, gap 0.15s ease;
}
.post__cta svg { width: 14px; height: 14px; }
.post__link:hover .post__cta {
  color: var(--sw-primary, #ff8838);
  gap: 0.55rem;
}

/* Empty ---------------------------------------------------------- */
.empty {
  text-align: center;
  padding: 4.5rem 1.5rem;
  border: 1px dashed #e4e4e7;
  border-radius: 16px;
  background: #fbfaf8;
}
.empty h3 {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0 0 0.5rem;
}
.empty p { color: #52525b; margin: 0 0 1.5rem; font-size: 0.9375rem; }
.empty__btn {
  background: #1e1e1e;
  color: #ffffff;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;
}
.empty__btn:hover { background: var(--sw-primary, #ff8838); }

/* Pager ---------------------------------------------------------- */
.pager {
  margin-top: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}
.pager__btn {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid #e4e4e7;
  background: #ffffff;
  color: #1e1e1e;
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}
.pager__btn:hover:not(:disabled) {
  border-color: var(--sw-primary, #ff8838);
  color: var(--sw-primary, #ff8838);
}
.pager__btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pager__btn svg { width: 16px; height: 16px; }
.pager__info {
  font-size: 0.9375rem;
  color: #71717a;
  font-variant-numeric: tabular-nums;
}
.pager__info strong { color: #1e1e1e; font-weight: 700; }

/* Responsive ----------------------------------------------------- */
@media (max-width: 960px) {
  .feature { grid-template-columns: 1fr; gap: 1.75rem; }
  .feature__media { order: -1; aspect-ratio: 16 / 10; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 2rem 1.5rem; }
}
@media (max-width: 640px) {
  .blog__intro { padding: 3.5rem 0 2rem; }
  .blog__feature { padding: 2rem 0 0.5rem; }
  .blog__list { padding: 2.5rem 0 4rem; }
  .blog__bar .blog__wrap { flex-direction: column; align-items: stretch; gap: 0.75rem; }
  .find { width: 100%; }
  .topic--on::after { bottom: -0.5rem; }
  .grid { grid-template-columns: 1fr; gap: 2rem; }
}
</style>
