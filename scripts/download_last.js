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
  
  const client = await context.newCDPSession(page);
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  
  const lessons = [
    { name: "15_01_Meine_Handlungen", sid: "hfT5xY1z" },
    { name: "16_01_Zusammenfassung", sid: "KTcB85rM" },
    { name: "16_02_Gopals_Welt", sid: "dFgJb5LB" },
    { name: "16_03_Ausblick_und_Vertiefung", sid: "S5dcMRwk" },
    { name: "16_04_Bevor_du_gehst", sid: "NSm2k9lr" }
  ];

  for (const lesson of lessons) {
     const url = `https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/${lesson.sid}`;
     console.log(`\nNavigating to ${lesson.name}... URL: ${url}`);
     
     let tsBuffers = {};
     
     const onResponse = async res => {
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
     };
     page.on('response', onResponse);
     
     await page.goto(url, { waitUntil: 'domcontentloaded' });
     await page.waitForTimeout(5000);
     
     const box = await page.evaluate(() => { return { w: window.innerWidth, h: window.innerHeight }; });
     await page.mouse.click(box.w / 2, box.h * 0.6);
     await page.waitForTimeout(2000);

     const videoLocator = page.locator('video').first();
     
     try {
         await videoLocator.waitFor({ state: 'attached', timeout: 5000 });
         
         console.log("\n  Forcing 8x speed and resetting time to 0...");
         await videoLocator.evaluate((v) => {
             v.muted = true;
             v.currentTime = 0;
             v.playbackRate = 8.0;
             v.play().catch(()=>{});
         });
         
         let lastChunkCount = -1;
         let sameCountWait = 0;
         
         for (let j = 0; j < 120; j++) {
             await page.waitForTimeout(1000);
             
             // Enforce playback inside the loop just in case
             await videoLocator.evaluate((v) => {
                 if (v.playbackRate !== 8.0) v.playbackRate = 8.0;
                 if (v.paused) v.play().catch(()=>{});
             });
             
             const isEnded = await videoLocator.evaluate((v) => v.ended);
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
     } catch (e) {
         console.log("\n  STILL NO VIDEO ELEMENT! Skipping. Error: " + e.message);
     }
     
     page.off('response', onResponse);
     
     const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
     console.log(`\n  Total chunks: ${indices.length}`);
     
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
