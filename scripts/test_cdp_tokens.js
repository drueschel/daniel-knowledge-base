const { chromium } = require('playwright');
(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  page.on('response', res => {
     const resUrl = res.url();
     if (resUrl.includes('.ts') && resUrl.includes('video')) {
        console.log("TS: " + resUrl.split('?')[1]);
     }
  });

  await page.goto("https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/gDhqTYLr", { waitUntil: 'networkidle' });
  
  await page.evaluate(() => {
       const v = document.querySelector('video');
       if (v) {
           v.playbackRate = 16.0;
           v.play();
       }
  });

  await page.waitForTimeout(5000);
  await context.close();
})();
