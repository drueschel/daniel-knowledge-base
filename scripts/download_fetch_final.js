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
     
     let chunkTemplate = null;
     
     const onResponse = res => {
       const resUrl = res.url();
       if (resUrl.includes('.ts') && resUrl.includes('video')) {
          chunkTemplate = resUrl.replace(/video\d+\.ts/, 'videoINDEX.ts');
       }
     };
     page.on('response', onResponse);
     
     await page.goto(url, { waitUntil: 'networkidle' });
     
     for (let i = 0; i < 10; i++) {
        if (chunkTemplate) break;
        await page.waitForTimeout(1000);
     }
     
     if (!chunkTemplate) {
        await page.evaluate(() => {
           const v = document.querySelector('video');
           if (v) v.play().catch(()=>{});
        });
        for (let i = 0; i < 10; i++) {
           if (chunkTemplate) break;
           await page.waitForTimeout(1000);
        }
     }
     page.off('response', onResponse);

     if (chunkTemplate) {
         console.log(`  Found template: ${chunkTemplate}`);
         
         const tsBuffers = {};
         let chunkIndex = 0;
         let consecutiveMisses = 0;
         
         while (consecutiveMisses < 50) { // allow gaps up to 50 chunks (e.g. 1 to 20)
             const chunkUrl = chunkTemplate.replace('videoINDEX.ts', `video${chunkIndex}.ts`);
             
             const base64Data = await page.evaluate(async (url) => {
                 try {
                     const response = await window.fetch(url);
                     if (!response.ok) return null;
                     const buffer = await response.arrayBuffer();
                     let binary = '';
                     const bytes = new Uint8Array(buffer);
                     for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                     return window.btoa(binary);
                 } catch(e) { return null; }
             }, chunkUrl);
             
             if (!base64Data) {
                 consecutiveMisses++;
             } else {
                 consecutiveMisses = 0; // reset misses
                 tsBuffers[chunkIndex] = Buffer.from(base64Data, 'base64');
                 process.stdout.write(`.${chunkIndex}`);
             }
             chunkIndex++;
         }
         
         const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
         if (indices.length > 0) {
             console.log(`\n  Total chunks downloaded: ${indices.length}`);
             const finalBuffer = Buffer.concat(indices.map(idx => tsBuffers[idx]));
             const tsPath = `tmp_downloads/gopal/${lesson.name}.ts`;
             fs.writeFileSync(tsPath, finalBuffer);
             console.log(`  Converting to wav...`);
             execSync(`ffmpeg -y -i "${tsPath}" -ar 16000 -ac 1 -c:a pcm_s16le "tmp_downloads/gopal/${lesson.name}.wav"`, { stdio: 'ignore' });
             console.log(`  Conversion done.`);
             fs.unlinkSync(tsPath);
         }
     } else {
         console.log(`  No video chunks found! Maybe no video?`);
     }
  }

  await context.close();
})();
