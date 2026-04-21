/**
 * Open Graph Image Generator API
 * Dynamically generates OG images for better social media sharing
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const title = query.title as string || 'SaaSWorld'
  const category = query.category as string
  const theme = query.theme as string || 'default'
  
  // Set appropriate headers for image response
  setHeader(event, 'Content-Type', 'text/html')
  setHeader(event, 'Cache-Control', 'public, max-age=86400') // Cache for 24 hours
  
  // Generate HTML that can be used with Puppeteer or similar to create an image
  // This is a simple implementation - you might want to integrate with a service like Vercel OG
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=1200, height=630">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }
          
          .background-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%);
            opacity: 0.3;
          }
          
          .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 60px;
            text-align: center;
            max-width: 900px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
          }
          
          .logo {
            font-size: 36px;
            font-weight: 800;
            color: #1a73e8;
            margin-bottom: 20px;
            letter-spacing: -1px;
          }
          
          .title {
            font-size: 48px;
            font-weight: 700;
            color: #202124;
            line-height: 1.2;
            margin-bottom: 20px;
            word-wrap: break-word;
          }
          
          .category {
            display: inline-block;
            background: #1a73e8;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .subtitle {
            font-size: 24px;
            color: #5f6368;
            font-weight: 400;
            line-height: 1.4;
          }
          
          .decorative-elements {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }
          
          .circle {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
          }
          
          .circle-1 {
            width: 200px;
            height: 200px;
            top: -100px;
            right: -100px;
          }
          
          .circle-2 {
            width: 150px;
            height: 150px;
            bottom: -75px;
            left: -75px;
          }
          
          .circle-3 {
            width: 100px;
            height: 100px;
            top: 50%;
            left: -50px;
            transform: translateY(-50%);
          }
        </style>
      </head>
      <body>
        <div class="background-pattern"></div>
        <div class="decorative-elements">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
        <div class="container">
          <div class="logo">SaaSWorld</div>
          ${category ? `<div class="category">${category}</div>` : ''}
          <h1 class="title">${title}</h1>
          <p class="subtitle">Discover and compare the best business software solutions worldwide</p>
        </div>
      </body>
    </html>
  `
  
  return html
})
