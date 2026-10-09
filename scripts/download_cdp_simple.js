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
  console.log(`Navigating to ${url}...`);
  
  let tsBuffers = {};
  
  page.on('response', async res => {
    const resUrl = res.url();
    if (resUrl.includes('.ts') && resUrl.includes('video')) {
      try {
        const buffer = await res.body();
        const match = resUrl.match(/video(\d+)\.ts/);
        if (match) {
          const index = parseInt(match[1], 10);
          if (!tsBuffers[index]) {
             tsBuffers[index] = buffer;
             process.stdout.write(`.` + index);
          }
        }
      } catch(e) {}
    }
  });
  
  await page.goto(url);
  
  console.log("\nWaiting for 10 seconds to see what loads naturally...");
  await page.waitForTimeout(10000);
  
  // Click center of screen to simulate play button
  const box = await page.evaluate(() => { return { w: window.innerWidth, h: window.innerHeight }; });
  await page.mouse.click(box.w / 2, box.h * 0.6);
  await page.waitForTimeout(2000);
  
  console.log("\nChecking for video element...");
  const hasVideo = await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) {
          v.muted = true;
          v.currentTime = 0;
          v.playbackRate = 1.0;
          v.play().catch(()=>{});
          return true;
      }
      return false;
  });
  
  if (hasVideo) {
      console.log("\nPlaying at 1x speed for 15 seconds to collect chunks...");
      await page.waitForTimeout(15000);
      
      const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
      console.log(`\nTotal chunks: ${indices.length}`);
      
      if (indices.length > 0) {
        const finalBuffer = Buffer.concat(indices.map(idx => tsBuffers[idx]));
        const tsPath = `tmp_downloads/gopal/test.ts`;
        fs.writeFileSync(tsPath, finalBuffer);
        console.log(`Saved to ${tsPath}`);
      }
  } else {
      console.log("\nNO VIDEO ELEMENT FOUND!");
  }
  
  await context.close();
})();
