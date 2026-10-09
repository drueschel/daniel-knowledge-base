const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const page = await context.newPage();
  
  page.on('request', req => {
    if (req.url().includes('.ts') || req.url().includes('chunk')) {
      console.log('TS CHUNK:', req.url());
    }
  });

  await page.goto('https://gopal.learningsuite.io', { waitUntil: 'networkidle' });
  
  if (await page.locator('input[type="email"]').count() > 0) {
    console.log("Logging in...");
    await page.fill('input[type="email"]', 'd.rueschel@gmail.com');
    await page.fill('input[type="password"]', 'gopalFCbayern1');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
  }

  console.log("Navigating directly to lesson...");
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/C2ncs6Nw/7yMJmX1x', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(5000);
  
  // Click the video to play
  const video = page.locator('video');
  if (await video.count() > 0) {
    console.log("Clicking video to play...");
    await video.click({ force: true });
    await page.waitForTimeout(5000);
  } else {
    // maybe a play button
    console.log("No video element found, trying to click center...");
    await page.mouse.click(500, 300);
    await page.waitForTimeout(5000);
  }
  
  await context.close();
})();
