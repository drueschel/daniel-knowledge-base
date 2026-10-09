const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/5CPHBDlS', { waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);
  
  const allLinks = await page.$$eval('a', as => as.map(a => a.href));
  console.log("All Links:", allLinks);
  
  // also take screenshot
  await page.screenshot({ path: '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/topic_page.png', fullPage: true });

  await context.close();
})();
