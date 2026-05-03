const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/marketplace');
  await page.waitForLoadState('networkidle');
  
  const info = await page.evaluate(() => {
    // Find spans specifically  
    const spans = document.querySelectorAll('span[data-v-5e332f39]');
    if (spans.length > 0) {
      return Array.from(spans).map(el => {
        const cs = window.getComputedStyle(el);
        let bgEl = el;
        let bg = cs.backgroundColor;
        let depth = 0;
        while ((bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && depth < 10) {
          bgEl = bgEl.parentElement;
          if (!bgEl) break;
          bg = window.getComputedStyle(bgEl).backgroundColor;
          depth++;
        }
        return { color: cs.color, bg, text: el.textContent.trim().slice(0,30), visible: cs.display !== 'none' };
      });
    }
    // Search all spans for dark colors
    const allSpans = document.querySelectorAll('span');
    const results = [];
    for (const span of allSpans) {
      const cs = window.getComputedStyle(span);
      const m = cs.color.match(/rgb\((\d+), (\d+), (\d+)\)/);
      if (m) {
        const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
        if (r < 180 && g < 180 && b < 180 && span.textContent.trim()) {
          results.push({ class: span.className, color: cs.color, bg: cs.backgroundColor, text: span.textContent.trim().slice(0,20) });
        }
      }
      if (results.length >= 10) break;
    }
    return results;
  });
  console.log(JSON.stringify(info, null, 2));
  
  await browser.close();
})().catch(e => console.error(e.message));
