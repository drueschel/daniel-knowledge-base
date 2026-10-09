const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
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
     console.log(`\nNavigating to ${lesson.name}...`);
     
     const tsBuffers = {};
     let duration = 0;
     let isFinished = false;
     
     page.on('response', async res => {
       const resUrl = res.url();
       if (resUrl.includes('.ts') && resUrl.includes('video')) {
          const match = resUrl.match(/video(\d+)\.ts/);
          if (match) {
             const idx = parseInt(match[1]);
             try {
                const buffer = await res.body();
                if (!tsBuffers[idx]) {
                   tsBuffers[idx] = buffer;
                   process.stdout.write(`.${idx}`);
                }
             } catch(e) {}
          }
       }
     });
     
     await page.goto(url, { waitUntil: 'networkidle' });
     
     // Wait for video element and duration
     for(let i=0; i<10; i++) {
         duration = await page.evaluate(() => {
             const v = document.querySelector('video');
             return (v && !isNaN(v.duration)) ? v.duration : 0;
         });
         if (duration > 0) break;
         await page.waitForTimeout(1000);
     }
     
     if (duration === 0) {
         console.log("Could not get video duration. Skipping.");
         continue;
     }
     console.log(`\n  Duration: ${duration}s. Stepping through...`);
     
     await page.evaluate(() => {
         const v = document.querySelector('video');
         v.pause(); // ensure paused while stepping
     });
     
     // Step through the video to force HLS.js to download chunks
     let currentTime = 0;
     while (currentTime < duration) {
         await page.evaluate((time) => {
             const v = document.querySelector('video');
             if (v) v.currentTime = time;
         }, currentTime);
         await page.waitForTimeout(1000); // wait for chunk to load
         currentTime += 4; // chunks are usually 4 seconds
     }
     
     // Give it a little time to finish last downloads
     await page.waitForTimeout(3000);
     
     const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
     console.log(`\n  Downloaded ${indices.length} chunks.`);
     
     if (indices.length > 0) {
         const finalBuffer = Buffer.concat(indices.map(idx => tsBuffers[idx]));
         const tsPath = `tmp_downloads/gopal/${lesson.name}.ts`;
         fs.writeFileSync(tsPath, finalBuffer);
         console.log(`  Converting...`);
         execSync(`ffmpeg -y -i "${tsPath}" -ar 16000 -ac 1 -c:a pcm_s16le "tmp_downloads/gopal/${lesson.name}.wav"`, { stdio: 'ignore' });
         console.log(`  Done.`);
         fs.unlinkSync(tsPath);
     }
  }

  await context.close();
})();
