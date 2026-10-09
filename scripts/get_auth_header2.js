const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const page = await context.newPage();
  
  page.on('request', request => {
    if (request.url().includes('playlist.m3u8')) {
      console.log('--- FOUND M3U8 REQUEST ---');
      console.log(request.url());
      console.log("HEADERS:", request.headers());
    }
  });

  console.log("Navigating to topic...");
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log("Clicking lesson...");
  await page.locator(`h6:has-text("Körperschmerzen beim Verschmelzungstyp")`).first().click();
  
  console.log("Waiting 10s for video to load...");
  await page.waitForTimeout(10000);
  
  await context.close();
})();
