const { chromium } = require('playwright');
(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/rVLbXGvQ', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: 'screenshot_test4.png' });
  await context.close();
})();
