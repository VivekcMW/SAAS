const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Blog posts configuration
const blogPosts = [
  {
    slug: '10-ai-tools-small-business-2025',
    title: '10 AI Tools Every Small Business Must Use in 2025',
    category: 'AI & Automation',
    gradient: ['#667eea', '#764ba2']
  },
  {
    slug: 'slack-vs-teams-vs-discord-2025-guide',
    title: 'Slack vs Teams vs Discord: Complete 2025 Guide',
    category: 'Communication',
    gradient: ['#f093fb', '#f5576c']
  },
  {
    slug: 'best-software-remote-teams-2025-stack',
    title: 'Best Software for Remote Teams: 2025 Stack',
    category: 'Remote Work',
    gradient: ['#4facfe', '#00f2fe']
  },
  {
    slug: 'free-vs-paid-business-software-when-upgrade',
    title: 'Free vs Paid Business Software: When to Upgrade',
    category: 'Business Strategy',
    gradient: ['#43e97b', '#38f9d7']
  },
  {
    slug: 'hubspot-vs-salesforce-vs-pipedrive-crm-comparison',
    title: 'HubSpot vs Salesforce vs Pipedrive: CRM Comparison',
    category: 'CRM & Sales',
    gradient: ['#fa709a', '#fee140']
  },
  {
    slug: 'notion-vs-monday-vs-asana-project-management',
    title: 'Notion vs Monday vs Asana: Project Management',
    category: 'Project Management',
    gradient: ['#a8edea', '#fed6e3']
  }
];

// Color schemes for different categories
const categoryColors = {
  'AI & Automation': ['#667eea', '#764ba2'],
  'Communication': ['#f093fb', '#f5576c'],
  'Remote Work': ['#4facfe', '#00f2fe'],
  'Business Strategy': ['#43e97b', '#38f9d7'],
  'CRM & Sales': ['#fa709a', '#fee140'],
  'Project Management': ['#a8edea', '#fed6e3']
};

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = [];
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  
  // Draw each line
  for (let i = 0; i < lines.length; i++) {
    context.fillText(lines[i], x, y + (i * lineHeight));
  }
  
  return lines.length * lineHeight;
}

function createGradient(ctx, width, height, colors) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
}

async function generateThumbnail(post) {
  const width = 1200;
  const height = 630;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = createGradient(ctx, width, height, post.gradient);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add subtle overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, width, height);
  
  // Add geometric shapes for visual interest
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(width - 100, 100, 150, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.arc(100, height - 100, 200, 0, Math.PI * 2);
  ctx.fill();
  
  // Add Moonmart logo/brand
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Moonmart', 60, 60);
  
  // Add category tag
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(60, 100, 200, 40);
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(post.category, 80, 125);
  
  // Add main title
  ctx.fillStyle = 'white';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'left';
  
  // Wrap text for title
  const titleHeight = wrapText(ctx, post.title, 60, 220, width - 120, 60);
  
  // Add subtle shadow to text for better readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Add date/read time
  ctx.font = '18px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('2025 • Moonmart Blog', 60, height - 60);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  
  // Save the thumbnail
  const outputPath = path.join(__dirname, '..', 'public', 'assets', 'images', 'blog', 'thumbnails', `${post.slug}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Generated thumbnail for: ${post.title}`);
}

async function generateAllThumbnails() {
  console.log('🎨 Generating static thumbnails for blog posts...\n');
  
  for (const post of blogPosts) {
    try {
      await generateThumbnail(post);
    } catch (error) {
      console.error(`❌ Failed to generate thumbnail for ${post.slug}:`, error.message);
    }
  }
  
  console.log('\n🎉 All thumbnails generated successfully!');
  console.log(`📁 Thumbnails saved to: public/assets/images/blog/thumbnails/\n`);
}

// Run the generator
generateAllThumbnails().catch(console.error);
