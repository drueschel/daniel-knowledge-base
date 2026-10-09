const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/neo_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true
  });
  
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG', { waitUntil: 'networkidle' });
  
  console.log("Page title:", await page.title());
  
  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('gopal_debug.html', html);
  
  await context.close();
})();
