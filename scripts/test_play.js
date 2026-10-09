const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/C2ncs6Nw/7yMJmX1x', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  console.log("Checking for iframes...");
  const frames = page.frames();
  console.log("Frames count:", frames.length);
  for (const f of frames) {
     console.log("Frame URL:", f.url());
  }

  // Try to click the center of the page
  const box = await page.evaluate(() => {
     return { w: window.innerWidth, h: window.innerHeight };
  });
  console.log(`Window size: ${box.w}x${box.h}`);
  
  // The video is usually in the main content area. Let's click at 50% width and 60% height.
  await page.mouse.click(box.w / 2, box.h * 0.6);
  await page.waitForTimeout(3000);
  
  console.log("After clicking... Frames count:", page.frames().length);
  
  const videoCount = await page.locator('video').count();
  console.log("Video elements in main frame:", videoCount);
  
  for (const f of page.frames()) {
      const v = await f.locator('video').count();
      if (v > 0) console.log(`Found ${v} video(s) in frame ${f.url()}`);
  }

  await context.close();
})();
