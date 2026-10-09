const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/TdtXNps6/l/Mp7lDJv9', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  const videoExists = await page.locator('video').count();
  console.log('Video exists:', videoExists > 0);
  
  await context.close();
})();
