const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  
  const page = await context.newPage();
  
  // Disable Cache
  const client = await context.newCDPSession(page);
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  
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
  await page.waitForTimeout(5000);
  
  const box = await page.evaluate(() => { return { w: window.innerWidth, h: window.innerHeight }; });
  await page.mouse.click(box.w / 2, box.h * 0.6);
  await page.waitForTimeout(2000);
  
  console.log("\nSearching frames for video element...");
  let found = false;
  for (const frame of page.frames()) {
      const hasVideo = await frame.evaluate(() => {
          const v = document.querySelector('video');
          if (v) {
              window.myVideo = v;
              return true;
          }
          return false;
      });
      
      if (hasVideo) {
          console.log(`\nFound video in frame: ${frame.url()}`);
          found = true;
          
          await frame.evaluate(() => {
              window.myVideo.muted = true;
              window.myVideo.currentTime = 0;
              window.myVideo.playbackRate = 8.0;
              window.myVideo.play().catch(()=>{});
          });
          
          // Wait for end
          let lastChunkCount = -1;
          let sameCountWait = 0;
          for (let j=0; j<120; j++) {
              await page.waitForTimeout(1000);
              const isEnded = await frame.evaluate(() => window.myVideo.ended);
              if (isEnded) {
                  console.log("\nVideo ended!");
                  break;
              }
              const cc = Object.keys(tsBuffers).length;
              if (cc > 0 && cc === lastChunkCount) {
                  sameCountWait++;
                  if (sameCountWait > 10) break;
              } else {
                  sameCountWait = 0;
                  lastChunkCount = cc;
              }
          }
      }
  }
  
  if (!found) {
      console.log("\nNo video element found in any frame!");
  } else {
      const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
      console.log(`\nTotal chunks: ${indices.length}`);
  }
  
  await context.close();
})();
