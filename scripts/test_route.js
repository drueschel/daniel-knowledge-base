const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  
  const page = await context.newPage();

  const url = `https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/gDhqTYLr`;
  console.log(`\nNavigating to 10_02 at ${url}...`);
  
  let tsBuffers = {};
  
  await page.route('**/*', async route => {
      const req = route.request();
      if (req.url().includes('.ts') && req.url().includes('video')) {
          // FORCING NO CACHE!
          const headers = { ...req.headers(), 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
          const res = await route.fetch({ headers }); 
          const buffer = await res.body();
          const match = req.url().match(/video(\d+)\.ts/);
          if (match) {
              const index = parseInt(match[1], 10);
              if (!tsBuffers[index]) {
                 tsBuffers[index] = buffer;
                 process.stdout.write(`.` + index);
              }
          }
          await route.fulfill({ response: res, body: buffer });
      } else {
          route.continue();
      }
  });
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);
  
  const box = await page.evaluate(() => { return { w: window.innerWidth, h: window.innerHeight }; });
  await page.mouse.click(box.w / 2, box.h * 0.6);
  await page.waitForTimeout(3000);

  const video = page.locator('video');
  if (await video.count() > 0) {
     console.log("\n  Forcing 16x speed and resetting time to 0...");
     
     await page.evaluate(() => {
        window.speedInterval = setInterval(() => {
           const v = document.querySelector('video');
           if (v) { 
              if (v.currentTime > 0 && !window.resetDone) {
                  v.currentTime = 0;
                  window.resetDone = true;
              }
              v.muted = true; 
              if (v.playbackRate !== 16.0) v.playbackRate = 16.0; 
              v.play().catch(()=>{}); 
           }
        }, 200);
     });
     
     console.log("  Waiting for video to finish...");
     let lastChunkCount = -1;
     let sameCountWait = 0;
     
     for (let j = 0; j < 120; j++) {
        await page.waitForTimeout(1000);
        const isEnded = await page.evaluate(() => {
           const v = document.querySelector('video');
           return v ? v.ended : false;
        });
        if (isEnded) {
           console.log("\n  Video ended!");
           break;
        }
        
        const currentCount = Object.keys(tsBuffers).length;
        if (currentCount > 0 && currentCount === lastChunkCount) {
           sameCountWait++;
           if (sameCountWait > 10) { 
              console.log("\n  No new chunks for 10s, assuming done.");
              break;
           }
        } else {
           sameCountWait = 0;
           lastChunkCount = currentCount;
        }
     }
     
     await page.evaluate(() => {
        clearInterval(window.speedInterval);
        window.resetDone = false;
     });
  } else {
     console.log("\n  STILL NO VIDEO ELEMENT! Skipping.");
  }
  
  await page.unroute('**/*');
  
  const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
  console.log(`\n  Total chunks: ${indices.length}`);
  if (indices.length > 0) console.log(`  First chunk: ${indices[0]}`);

  await context.close();
})();
