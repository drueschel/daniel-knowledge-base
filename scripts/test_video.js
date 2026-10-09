const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  
  const page = await context.newPage();
  
  console.log("Navigating directly to lesson...");
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/kY1R9dwh/Chwr8DMl', { waitUntil: 'networkidle' });
  
  console.log("Waiting for video element...");
  await page.waitForTimeout(5000);
  
  const videoExists = await page.evaluate(() => {
    const video = document.querySelector('video');
    return !!video;
  });
  
  console.log("Video element found:", videoExists);
  
  if (videoExists) {
    const duration = await page.evaluate(() => {
       const video = document.querySelector('video');
       return video.duration;
    });
    console.log("Video duration:", duration);
  }
  
  await context.close();
})();
