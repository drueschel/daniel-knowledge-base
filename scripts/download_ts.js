const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const page = await context.newPage();
  
  // We'll intercept responses for .m3u8
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('variant') && url.includes('video.m3u8')) {
      console.log('--- FOUND VARIANT M3U8 ---');
      console.log(url);
      const text = await response.text();
      console.log(text.substring(0, 300));
      fs.writeFileSync('variant.m3u8', text);
    }
  });

  console.log("Navigating directly to lesson...");
  // Navigate to one of the lessons from the JSON output
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/kY1R9dwh/Chwr8DMl', { waitUntil: 'networkidle' });
  
  console.log("Waiting 10s for video to load...");
  await page.waitForTimeout(10000);
  
  await context.close();
})();
