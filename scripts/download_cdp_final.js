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
     let lastChunkTime = Date.now();
     
     const onResponse = async res => {
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
                   lastChunkTime = Date.now();
                }
             } catch(e) {}
          }
       }
     };
     page.on('response', onResponse);
     
     await page.goto(url, { waitUntil: 'networkidle' });
     
     console.log("  Forcing playback and stepping time...");
     
     let stepped = false;
     let attempts = 0;
     while (attempts < 20) { // wait up to 20 seconds for video to be ready
         const duration = await page.evaluate(() => {
             const v = document.querySelector('video');
             return (v && !isNaN(v.duration) && v.duration > 0) ? v.duration : 0;
         });
         if (duration > 0) {
             console.log(`\n  Video ready. Duration: ${duration}s. Downloading...`);
             let time = 0;
             while (time < duration) {
                 await page.evaluate((t) => {
                     const v = document.querySelector('video');
                     if (v) { v.pause(); v.currentTime = t; }
                 }, time);
                 await page.waitForTimeout(500); // 0.5s is usually enough to trigger a chunk fetch
                 time += 2; // step by 2s to catch every chunk
             }
             stepped = true;
             break;
         }
         await page.waitForTimeout(1000);
         attempts++;
     }
     
     if (!stepped) {
         console.log("\n  Could not find video or get duration. Retrying with play()...");
         await page.evaluate(() => {
             const v = document.querySelector('video');
             if (v) { v.playbackRate = 4.0; v.play().catch(()=>{}); }
         });
         
         // wait for chunks to stop downloading for 10 seconds
         while (Date.now() - lastChunkTime < 10000) {
             await page.waitForTimeout(1000);
         }
     }
     
     page.off('response', onResponse);
     
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
