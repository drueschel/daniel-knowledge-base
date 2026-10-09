const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  
  const page = await context.newPage();
  const tsBuffers = {};
  
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('.ts') && url.includes('video')) {
      try {
        const buffer = await res.body();
        // Extract chunk index (e.g., video0.ts -> 0)
        const match = url.match(/video(\d+)\.ts/);
        if (match) {
          const index = parseInt(match[1], 10);
          tsBuffers[index] = buffer;
          console.log(`Downloaded chunk ${index}`);
        }
      } catch(e) {
        // body not available or aborted
      }
    }
  });

  console.log("Navigating directly to lesson...");
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/kY1R9dwh/Chwr8DMl', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(3000);
  
  // Click the video to play
  const video = page.locator('video');
  if (await video.count() > 0) {
    console.log("Setting playback rate to 16x and playing...");
    await page.evaluate(() => {
       const v = document.querySelector('video');
       v.muted = true;
       v.playbackRate = 16.0;
       v.play();
    });
  } else {
    console.log("Clicking center...");
    await page.mouse.click(500, 300);
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
       const v = document.querySelector('video');
       if (v) { v.muted = true; v.playbackRate = 16.0; v.play(); }
    });
  }
  
  console.log("Waiting for video to finish (max 40s)...");
  for (let i = 0; i < 40; i++) {
     await page.waitForTimeout(1000);
     const isEnded = await page.evaluate(() => {
        const v = document.querySelector('video');
        return v ? v.ended : false;
     });
     if (isEnded) {
        console.log("Video ended!");
        break;
     }
  }
  
  // Combine all buffers
  const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
  console.log(`Got ${indices.length} chunks. Combining...`);
  
  const buffers = indices.map(i => tsBuffers[i]);
  const finalBuffer = Buffer.concat(buffers);
  
  fs.writeFileSync('tmp_downloads/gopal/9_01_Konflikte_Verschmelzungstyp.ts', finalBuffer);
  console.log("Saved to tmp_downloads/gopal/9_01_Konflikte_Verschmelzungstyp.ts");
  
  await context.close();
})();
