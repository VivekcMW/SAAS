<template>
  <div class="blog-post-page">
    <!-- Hero Section with Featured Image -->
    <section class="post-hero" :style="{ backgroundImage: `url(${post.image})` }">
      <div class="post-hero-overlay">
        <div class="container">
          <div class="post-hero-content">
            <div class="post-meta">
              <span class="post-category">{{ post.category }}</span>
              <span class="post-date">{{ formatDate(post.date) }}</span>
            </div>
            <h1>{{ post.title }}</h1>
            <div class="post-author">
              <div class="author-info">
                <span class="author-name">{{ post.author }}</span>
                <span class="author-title">{{ post.authorTitle }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Post Content -->
    <section class="post-content">
      <div class="container">
        <div class="content-wrapper">
          <!-- Main Content -->
          <div class="main-content">
            <p class="post-lead">{{ post.excerpt }}</p>
            
            <!-- Rendered Content from Markdown -->
            <div class="post-body" v-html="post.content"></div>
            
            <!-- Tags -->
            <div class="post-tags">
              <span class="tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
            </div>
            
            <!-- Share Links -->
            <div class="post-share">
              <p>Share this article:</p>
              <div class="share-buttons">
                <a href="#" class="share-button twitter">
                  <UIcon dynamic name="i-mdi-twitter" />
                  Twitter
                </a>
                <a href="#" class="share-button facebook">
                  <UIcon dynamic name="i-mdi-facebook" />
                  Facebook
                </a>
                <a href="#" class="share-button linkedin">
                  <UIcon dynamic name="i-mdi-linkedin" />
                  LinkedIn
                </a>
                <button @click="copyUrl" class="share-button copy">
                  <UIcon dynamic name="i-heroicons-link" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
          
          <!-- Sidebar -->
          <div class="sidebar">
            <!-- Table of Contents -->
            <div class="sidebar-widget toc-widget" v-if="post.tableOfContents && post.tableOfContents.length > 0">
              <h3>Table of Contents</h3>
              <ul class="toc-list">
                <li v-for="(item, index) in post.tableOfContents" :key="index" :class="{ 'active': activeTocItem === item.id }">
                  <a :href="`#${item.id}`" @click="scrollToSection(item.id)">{{ item.title }}</a>
                </li>
              </ul>
            </div>
            
            <!-- Related Posts -->
            <div class="sidebar-widget related-posts-widget">
              <h3>Related Articles</h3>
              <div class="related-posts">
                <div v-for="(relatedPost, index) in post.relatedPosts" :key="index" class="related-post">
                  <NuxtLink :to="`/blog/${relatedPost.slug}`" class="related-post-link">
                    <div class="related-post-image">
                      <img :src="relatedPost.image" :alt="relatedPost.title">
                    </div>
                    <h4>{{ relatedPost.title }}</h4>
                    <div class="related-post-meta">
                      <span class="post-date">{{ formatDate(relatedPost.date) }}</span>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>
            
            <!-- Newsletter Widget -->
            <div class="sidebar-widget newsletter-widget">
              <h3>Subscribe to our newsletter</h3>
              <p>Get the latest articles and resources straight to your inbox.</p>
              <form @submit.prevent="subscribeNewsletter" class="sidebar-newsletter-form">
                <input 
                  type="email" 
                  v-model="newsletterEmail" 
                  placeholder="Your email address" 
                  required
                >
                <button type="submit" class="btn btn-primary btn-block">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Next & Previous Posts Navigation -->
    <section class="post-navigation">
      <div class="container">
        <div class="navigation-links">
          <div class="prev-post" v-if="post.prevPost">
            <NuxtLink :to="`/blog/${post.prevPost.slug}`" class="nav-link">
              <div class="nav-direction">
                <UIcon dynamic name="i-heroicons-arrow-left" />
                Previous Article
              </div>
              <h4>{{ post.prevPost.title }}</h4>
            </NuxtLink>
          </div>
          
          <div class="back-to-blog">
            <NuxtLink to="/blog" class="btn btn-outline">
              <UIcon dynamic name="i-heroicons-squares-2x2" />
              All Articles
            </NuxtLink>
          </div>
          
          <div class="next-post" v-if="post.nextPost">
            <NuxtLink :to="`/blog/${post.nextPost.slug}`" class="nav-link">
              <div class="nav-direction">
                Next Article
                <UIcon dynamic name="i-heroicons-arrow-right" />
              </div>
              <h4>{{ post.nextPost.title }}</h4>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- More Articles Section -->
    <section class="more-articles">
      <div class="container">
        <div class="section-header centered">
          <h2>More Articles</h2>
          <p>Explore our latest resources and insights</p>
        </div>
        
        <div class="articles-grid">
          <div v-for="(article, index) in post.moreArticles" :key="index" class="article-card">
            <div class="article-image">
              <NuxtLink :to="`/blog/${article.slug}`">
                <img :src="article.image" :alt="article.title">
              </NuxtLink>
            </div>
            <div class="article-content">
              <div class="article-meta">
                <span class="article-category">{{ article.category }}</span>
                <span class="article-date">{{ formatDate(article.date) }}</span>
              </div>
              <h3>
                <NuxtLink :to="`/blog/${article.slug}`">{{ article.title }}</NuxtLink>
              </h3>
            </div>
          </div>
        </div>
        
        <div class="more-articles-link">
          <NuxtLink to="/blog" class="btn btn-primary">View All Articles</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const slug = route.params.slug;
const newsletterEmail = ref('');
const activeTocItem = ref(null);

// This is sample data - in a real application this would come from a CMS or API
const post = {
  title: "10 Essential SaaS Metrics Every Startup Should Track",
  slug: "saas-metrics-for-startups",
  excerpt: "Learn the key performance indicators that will help you measure and grow your SaaS business effectively.",
  category: "Business",
  date: "2023-11-15",
  author: "SaaSWorld Team",
  authorTitle: "Content Team",
  authorBio: "Sarah has 15+ years of experience in the software industry and previously founded two successful startups. She is passionate about helping businesses leverage technology to grow and scale.",
  authorSocial: [
    { platform: "twitter", url: "https://twitter.com/", icon: "mdi:twitter" },
    { platform: "linkedin", url: "https://linkedin.com/", icon: "mdi:linkedin" }
  ],
  image: "/assets/images/blog/featured-metrics.jpg",
  tags: ["SaaS", "Metrics", "Startups", "Analytics", "Business Growth"],
  tableOfContents: [
    { id: "introduction", title: "Introduction" },
    { id: "mrr-arr", title: "Monthly & Annual Recurring Revenue" },
    { id: "churn-rate", title: "Customer Churn Rate" },
    { id: "cac", title: "Customer Acquisition Cost" },
    { id: "ltv", title: "Customer Lifetime Value" },
    { id: "gross-margin", title: "Gross Margin" }
  ],
  content: `
    <h2 id="introduction">Introduction</h2>
    <p>For SaaS startups, tracking the right metrics is crucial for understanding your business health, making informed decisions, and demonstrating value to investors. In this article, we'll explore the essential metrics that every SaaS startup should be monitoring.</p>
    
    <p>The SaaS business model is unique because it focuses on recurring revenue rather than one-time sales. This means that understanding customer behavior, retention, and long-term value becomes particularly important.</p>
    
    <h2 id="mrr-arr">Monthly & Annual Recurring Revenue (MRR/ARR)</h2>
    <p>MRR and ARR are the lifeblood of any SaaS business. These metrics represent the predictable revenue your business generates every month or year from subscription customers.</p>
    
    <p>To calculate MRR, simply add up all the revenue from your paying customers for a month. ARR is typically MRR multiplied by 12, though some businesses with annual plans may calculate it differently.</p>
    
    <p>Breaking down MRR into sub-metrics can provide even more valuable insights:</p>
    <ul>
      <li><strong>New MRR:</strong> Revenue from new customers</li>
      <li><strong>Expansion MRR:</strong> Additional revenue from existing customers (upgrades, add-ons)</li>
      <li><strong>Contraction MRR:</strong> Lost revenue from downgrades</li>
      <li><strong>Churned MRR:</strong> Lost revenue from cancellations</li>
      <li><strong>Net New MRR:</strong> New MRR + Expansion MRR - Contraction MRR - Churned MRR</li>
    </ul>
    
    <h2 id="churn-rate">Customer Churn Rate</h2>
    <p>Churn rate measures the percentage of customers who cancel or don't renew their subscriptions during a given period. This metric is crucial because it's often easier and more cost-effective to retain existing customers than to acquire new ones.</p>
    
    <p>To calculate customer churn rate, divide the number of customers lost during a period by the total number of customers at the beginning of that period, then multiply by 100.</p>
    
    <p>For example, if you had 200 customers at the beginning of the month and lost 10 customers, your monthly churn rate would be 5%.</p>
    
    <p>A healthy churn rate varies by industry and target market, but generally, you should aim for a monthly churn rate under 2% for B2B and under 5% for B2C SaaS products.</p>
    
    <h2 id="cac">Customer Acquisition Cost (CAC)</h2>
    <p>CAC represents the total cost of acquiring a new customer, including marketing expenses, sales team salaries, commissions, and related overhead.</p>
    
    <p>To calculate CAC, divide your total sales and marketing expenses for a period by the number of new customers acquired in that same period.</p>
    
    <p>For example, if you spent $10,000 on sales and marketing in a month and acquired 20 new customers, your CAC would be $500 per customer.</p>
    
    <p>This metric is most useful when compared to the lifetime value of a customer (LTV), which we'll discuss next.</p>
    
    <h2 id="ltv">Customer Lifetime Value (LTV)</h2>
    <p>LTV predicts the total revenue a business can expect from a single customer account throughout their relationship with the company.</p>
    
    <p>A simple way to calculate LTV is to multiply the average revenue per account (ARPA) by the average customer lifespan (which is 1 divided by your churn rate).</p>
    
    <p>For example, if your ARPA is $100 per month and your monthly churn rate is 5%, the average customer lifespan is 20 months (1/0.05), making the LTV $2,000.</p>
    
    <p>The LTV:CAC ratio is a critical metric for SaaS businesses. A healthy business typically has an LTV that's at least 3 times greater than its CAC, indicating sustainable growth and profitability.</p>
    
    <h2 id="gross-margin">Gross Margin</h2>
    <p>Gross margin represents the percentage of revenue that exceeds your cost of goods sold (COGS). For SaaS businesses, COGS typically includes hosting costs, customer support, and other expenses directly related to delivering your service.</p>
    
    <p>To calculate gross margin, subtract your COGS from your revenue, divide by revenue, and multiply by 100.</p>
    
    <p>SaaS businesses often enjoy high gross margins, typically 70-80% or higher, due to the relatively low cost of delivering software services compared to physical products.</p>
    
    <h2>Conclusion</h2>
    <p>Tracking these fundamental metrics provides a solid foundation for understanding your SaaS business health and making data-driven decisions. As your business matures, you might want to add more sophisticated metrics, but these core KPIs should remain central to your performance monitoring.</p>
    
    <p>Remember that metrics should be viewed holistically rather than in isolation. The relationships between these numbers often tell a more complete story than any single metric can on its own.</p>
  `,
  prevPost: {
    title: "How to Build a Product-Led Growth Strategy",
    slug: "product-led-growth"
  },
  nextPost: {
    title: "Customer Retention Strategies That Actually Work",
    slug: "customer-retention-strategies"
  },
  relatedPosts: [
    {
      title: "The State of SaaS in 2024: Trends and Predictions",
      slug: "saas-trends-2024",
      date: "2023-12-28",
      image: "/assets/images/blog/saas-trends.jpg"
    },
    {
      title: "Optimizing Your SaaS Pricing Strategy",
      slug: "optimizing-saas-pricing",
      date: "2023-09-20",
      image: "/assets/images/blog/pricing.jpg"
    },
    {
      title: "Leveraging Data Analytics for SaaS Growth",
      slug: "data-analytics-saas-growth",
      date: "2023-08-25",
      image: "/assets/images/blog/analytics.jpg"
    }
  ],
  moreArticles: [
    {
      title: "How AI is Transforming SaaS Products in 2024",
      slug: "ai-transforming-saas",
      excerpt: "Discover how artificial intelligence is revolutionizing SaaS products and creating new opportunities for businesses.",
      category: "Technology",
      date: "2024-01-10",
      image: "/assets/images/blog/ai-saas.jpg"
    },
    {
      title: "Customer Retention Strategies That Actually Work",
      slug: "customer-retention-strategies",
      excerpt: "Explore proven strategies to retain customers and reduce churn in your SaaS business.",
      category: "Business",
      date: "2023-12-05",
      image: "/assets/images/blog/retention.jpg"
    },
    {
      title: "Security Best Practices for SaaS Applications",
      slug: "security-best-practices",
      excerpt: "Learn essential security practices to protect your SaaS application and customer data.",
      category: "Security",
      date: "2023-11-28",
      image: "/assets/images/blog/security.jpg"
    }
  ]
};

// SEO Configuration
useSeoMeta({
  title: post.title,
  description: post.excerpt,
  ogTitle: post.title,
  ogDescription: post.excerpt,
  ogImage: post.image,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: post.title,
  twitterDescription: post.excerpt,
  twitterImage: post.image,
  articleAuthor: 'SaaSWorld Team',
  articlePublishedTime: post.date,
  articleSection: post.category,
  keywords: post.tags.join(', ')
});

// Structured Data for Rich Snippets
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.image,
        author: {
          '@type': 'Organization',
          name: 'SaaSWorld Team'
        },
        publisher: {
          '@type': 'Organization',
          name: 'SaaSWorld',
          logo: {
            '@type': 'ImageObject',
            url: 'https://saasworld.com/logo.png'
          }
        },
        datePublished: post.date,
        dateModified: post.date,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://saasworld.com/blog/${post.slug}`
        },
        articleSection: post.category,
        keywords: post.tags,
        articleBody: post.content.replace(/<[^>]*>/g, '').substring(0, 500) + '...'
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://saasworld.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://saasworld.com/blog'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: `https://saasworld.com/blog/${post.slug}`
          }
        ]
      })
    }
  ]
});

// Format date
const formatDate = (dateStr) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
};

// Copy current URL to clipboard
const copyUrl = () => {
  navigator.clipboard.writeText(window.location.href);
  alert('Link copied to clipboard!');
};

// Subscribe to newsletter
const subscribeNewsletter = () => {
  // In a real implementation, this would send the email to your API
  console.log('Newsletter subscription:', newsletterEmail.value);
  alert('Thank you for subscribing!');
  newsletterEmail.value = '';
};

// Scroll to section when TOC link is clicked
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// Observe headings for TOC highlighting
const observeHeadings = () => {
  if (typeof window === 'undefined') return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeTocItem.value = entry.target.id;
        }
      });
    },
    { rootMargin: '-100px 0px -80% 0px' }
  );
  
  post.tableOfContents.forEach(item => {
    const heading = document.getElementById(item.id);
    if (heading) {
      observer.observe(heading);
    }
  });
  
  return observer;
};

let observer;

onMounted(() => {
  observer = observeHeadings();
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.blog-post-page {
  padding-top: 80px;
}

.post-hero {
  position: relative;
  height: 500px;
  background-size: cover;
  background-position: center;
  color: white;
}

.post-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8));
  display: flex;
  align-items: flex-end;
  padding-bottom: 60px;
}

.post-hero-content {
  max-width: 800px;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.post-category {
  background-color: var(--color-primary);
  color: white;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 30px;
}

.post-date {
  opacity: 0.9;
}

.post-hero h1 {
  font-size: 3rem;
  margin-bottom: 24px;
  line-height: 1.2;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
  font-size: 1.125rem;
}

.author-title {
  font-size: 0.875rem;
  opacity: 0.9;
}

.post-content {
  padding: 60px 0;
}

.content-wrapper {
  display: flex;
  gap: 60px;
}

.main-content {
  flex: 2;
}

.sidebar {
  flex: 1;
}

.post-lead {
  font-size: 1.25rem;
  color: var(--color-gray-700);
  margin-bottom: 30px;
  line-height: 1.6;
  font-weight: 500;
}

.post-body {
  margin-bottom: 40px;
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--color-gray-800);
}

.post-body h2 {
  font-size: 1.75rem;
  margin: 40px 0 20px;
  color: var(--color-gray-900);
}

.post-body p {
  margin-bottom: 20px;
}

.post-body ul,
.post-body ol {
  margin-bottom: 20px;
  padding-left: 20px;
}

.post-body li {
  margin-bottom: 10px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.tag {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
  padding: 6px 12px;
  border-radius: 30px;
  font-size: 0.875rem;
}

.post-share {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--color-gray-200);
}

.post-share p {
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--color-gray-700);
}

.share-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.share-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s;
}

.share-button.twitter {
  background-color: #1da1f2;
  color: white;
}

.share-button.facebook {
  background-color: #1877f2;
  color: white;
}

.share-button.linkedin {
  background-color: #0077b5;
  color: white;
}

.share-button.copy {
  background-color: var(--color-gray-200);
  color: var(--color-gray-800);
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.share-button:hover {
  opacity: 0.9;
}

.author-bio {
  display: flex;
  gap: 24px;
  background-color: var(--color-gray-50);
  padding: 30px;
  border-radius: 12px;
}

.author-bio-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.author-bio-content {
  flex: 1;
}

.author-bio h3 {
  font-size: 1.25rem;
  margin-bottom: 5px;
  color: var(--color-gray-900);
}

.author-bio .author-title {
  font-size: 0.875rem;
  color: var(--color-primary);
  margin-bottom: 12px;
  font-weight: 500;
}

.author-description {
  font-size: 0.95rem;
  color: var(--color-gray-700);
  margin-bottom: 15px;
  line-height: 1.6;
}

.author-social {
  display: flex;
  gap: 12px;
}

.author-social a {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-gray-200);
  color: var(--color-gray-700);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.author-social a:hover {
  background-color: var(--color-primary);
  color: white;
}

.sidebar-widget {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.sidebar-widget h3 {
  font-size: 1.25rem;
  margin-bottom: 20px;
  color: var(--color-gray-900);
}

.toc-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  margin-bottom: 12px;
  border-left: 2px solid var(--color-gray-200);
  padding-left: 15px;
  transition: all 0.3s;
}

.toc-list li.active {
  border-left-color: var(--color-primary);
}

.toc-list a {
  color: var(--color-gray-700);
  text-decoration: none;
  font-size: 0.95rem;
  display: block;
  line-height: 1.4;
  transition: all 0.3s;
}

.toc-list li.active a {
  color: var(--color-primary);
  font-weight: 500;
}

.toc-list a:hover {
  color: var(--color-primary);
}

.related-posts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.related-post {
  display: flex;
  flex-direction: column;
}

.related-post-link {
  text-decoration: none;
  color: inherit;
}

.related-post-image {
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.related-post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.related-post:hover .related-post-image img {
  transform: scale(1.05);
}

.related-post h4 {
  font-size: 1rem;
  margin-bottom: 8px;
  line-height: 1.4;
  color: var(--color-gray-900);
  transition: color 0.3s;
}

.related-post:hover h4 {
  color: var(--color-primary);
}

.related-post-meta {
  font-size: 0.8125rem;
  color: var(--color-gray-600);
}

.sidebar-newsletter-form {
  margin-top: 15px;
}

.sidebar-newsletter-form input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-input);
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.btn-block {
  display: block;
  width: 100%;
  text-align: center;
}

.post-navigation {
  padding: 60px 0;
  background-color: var(--color-gray-50);
}

.navigation-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.prev-post, .next-post {
  flex: 1;
  max-width: 300px;
}

.next-post {
  text-align: right;
}

.nav-link {
  text-decoration: none;
  color: inherit;
  display: block;
  padding: 20px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.nav-link:hover {
  transform: translateY(-5px);
}

.nav-direction {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: var(--color-gray-600);
  margin-bottom: 8px;
}

.next-post .nav-direction {
  justify-content: flex-end;
}

.nav-link h4 {
  font-size: 1rem;
  color: var(--color-gray-900);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.more-articles {
  padding: 80px 0;
}

.section-header.centered {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 40px;
}

.section-header h2 {
  font-size: 2.25rem;
  margin-bottom: 16px;
  color: var(--color-gray-900);
}

.section-header p {
  font-size: 1.125rem;
  color: var(--color-gray-700);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 40px;
}

.article-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.article-card:hover {
  transform: translateY(-5px);
}

.article-image {
  height: 200px;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.article-card:hover .article-image img {
  transform: scale(1.05);
}

.article-content {
  padding: 20px;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 0.8125rem;
}

.article-category {
  color: var(--color-primary);
  font-weight: 500;
}

.article-date {
  color: var(--color-gray-600);
}

.article-content h3 {
  font-size: 1.125rem;
  line-height: 1.4;
}

.article-content h3 a {
  color: var(--color-gray-900);
  text-decoration: none;
  transition: color 0.3s;
}

.article-content h3 a:hover {
  color: var(--color-primary);
}

.more-articles-link {
  text-align: center;
  margin-top: 20px;
}

/* Responsive styles */
@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .post-hero {
    height: 400px;
  }
  
  .post-hero h1 {
    font-size: 2.25rem;
  }
  
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .post-hero {
    height: 350px;
  }
  
  .post-hero h1 {
    font-size: 2rem;
  }
  
  .author-bio {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .author-social {
    justify-content: center;
  }
  
  .navigation-links {
    flex-direction: column;
    gap: 20px;
  }
  
  .prev-post, .next-post, .back-to-blog {
    max-width: none;
    width: 100%;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .share-buttons {
    flex-direction: column;
  }
  
  .share-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
