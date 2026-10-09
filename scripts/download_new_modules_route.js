const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  
  const page = await context.newPage();

  const lessons = [
    { name: "10_02_Abhaengigkeit_Autonomietyp", sid: "gDhqTYLr" },
    { name: "11_01_Trigger_Unterscheidung", sid: "Dr8RNYW9" },
    { name: "11_02_Trigger_Entschaerfen", sid: "xmcC5GkV" },
    { name: "12_01_Depression_Verschmelzungstyp", sid: "RKlhB8nx" },
    { name: "12_02_Depression_Autonomietyp", sid: "jFNy4ts9" }
  ];

  for (const lesson of lessons) {
     const url = `https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/${lesson.sid}`;
     console.log(`\nNavigating to ${lesson.name} at ${url}...`);
     
     let tsBuffers = {};
     
     await page.route('**/*.ts', async route => {
         const req = route.request();
         const res = await route.fetch(); // this bypasses cache!
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
     
     await page.unroute('**/*.ts');
     
     const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
     console.log(`\n  Total chunks: ${indices.length}`);
     
     if (indices.length > 0 && indices[0] > 1) {
        console.log(`  WARNING: MISSING INITIAL CHUNKS! First chunk is ${indices[0]}`);
     }

     if (indices.length > 0) {
       const finalBuffer = Buffer.concat(indices.map(idx => tsBuffers[idx]));
       const tsPath = `tmp_downloads/gopal/${lesson.name}.ts`;
       fs.writeFileSync(tsPath, finalBuffer);
       console.log(`  Saved to ${tsPath}`);
       console.log(`  Converting to wav...`);
       execSync(`ffmpeg -y -i "${tsPath}" -ar 16000 -ac 1 -c:a pcm_s16le "tmp_downloads/gopal/${lesson.name}.wav"`, { stdio: 'ignore' });
       console.log(`  Conversion done.`);
       fs.unlinkSync(tsPath);
     }
  }

  await context.close();
})();
