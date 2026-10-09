const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();

  page.on('response', async res => {
     if (res.url().includes('video.m3u8')) {
        console.log("Found URL: " + res.url());
        try {
           const text = await res.text();
           console.log(text);
        } catch(e) {}
     }
  });

  await page.goto("https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/gDhqTYLr", { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await context.close();
})();
