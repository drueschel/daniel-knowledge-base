const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/neo_chrome_profile';
  
  if (!fs.existsSync(userDataDir)) {
    console.error('Profile not found at:', userDataDir);
    process.exit(1);
  }

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true
  });
  
  const page = await context.newPage();
  
  console.log('Navigating to course content...');
  try {
    await page.goto('https://members.emotionalreleases.com/spaces/11012077/content', { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch(e) {
    console.log('Navigation timeout, continuing anyway...');
  }
  
  // Wait for the list of modules to appear
  console.log('Waiting 10s for modules to render...');
  await page.waitForTimeout(10000); 

  // Take a screenshot for debugging
  await page.screenshot({ path: '/Users/danielrueschel/DEV/daniel-knowledge-base/scripts/scraper_debug.png' });

  // Extract the DOM tree of links
  const modules = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('a'));
    
    return items.map(a => ({
        text: a.innerText.trim(),
        href: a.href
    })).filter(a => a.text.includes('Lessons') || a.text.includes('Introduction') || a.text.includes('WEEK') || a.text.includes('Guided'));
  });

  console.log('Extracted modules:', modules);
  
  await context.close();
})();
