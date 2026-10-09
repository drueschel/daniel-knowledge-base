const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const page = await context.newPage();
  
  page.on('request', request => {
    if (request.url().includes('api.learningsuite.io/api/bunny/playlist/master')) {
      console.log('--- FOUND REQUEST ---');
      console.log(request.url());
      console.log(request.headers());
    }
  });

  console.log("Navigating...");
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  await page.locator(`h6:has-text("Körperschmerzen beim Verschmelzungstyp")`).first().click();
  await page.waitForTimeout(8000);
  
  await context.close();
})();
