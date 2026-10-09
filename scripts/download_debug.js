const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  
  const page = await context.newPage();
  const url = `https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/Dr8RNYW9`;
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  
  // take screenshot
  await page.screenshot({ path: 'tmp_downloads/debug1.png' });
  
  const box = await page.evaluate(() => { return { w: window.innerWidth, h: window.innerHeight }; });
  await page.mouse.click(box.w / 2, box.h * 0.6);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tmp_downloads/debug2.png' });

  const hasVideo = await page.evaluate(() => {
     const v = document.querySelector('video');
     return v ? true : false;
  });
  console.log(`Has video: ${hasVideo}`);

  if (hasVideo) {
     await page.evaluate(() => {
        const v = document.querySelector('video');
        v.muted = true;
        v.currentTime = 0;
        v.play().catch(e => console.error(e));
     });
     
     for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(1000);
        const st = await page.evaluate(() => {
            const v = document.querySelector('video');
            return { time: v.currentTime, dur: v.duration, paused: v.paused, ended: v.ended, rate: v.playbackRate };
        });
        console.log(`State: ${JSON.stringify(st)}`);
     }
  }

  await context.close();
})();
