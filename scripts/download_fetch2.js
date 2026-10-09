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
        // try playing it
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
         
         const tsBuffers = [];
         let chunkIndex = 0;
         
         while (true) {
             const chunkUrl = chunkTemplate.replace('videoINDEX.ts', `video${chunkIndex}.ts`);
             // evaluate fetch in browser context and return arrayBuffer as base64
             const base64Data = await page.evaluate(async (url) => {
                 try {
                     const response = await window.fetch(url);
                     if (!response.ok) return null; // 403/404 if ended
                     const buffer = await response.arrayBuffer();
                     let binary = '';
                     const bytes = new Uint8Array(buffer);
                     const len = bytes.byteLength;
                     for (let i = 0; i < len; i++) {
                         binary += String.fromCharCode(bytes[i]);
                     }
                     return window.btoa(binary);
                 } catch(e) {
                     return null;
                 }
             }, chunkUrl);
             
             if (!base64Data) {
                 console.log(`\n  Chunk ${chunkIndex} not found, assuming end of video.`);
                 break;
             }
             
             tsBuffers.push(Buffer.from(base64Data, 'base64'));
             process.stdout.write(`.${chunkIndex}`);
             chunkIndex++;
         }
         
         if (tsBuffers.length > 0) {
             console.log(`\n  Total chunks: ${tsBuffers.length}`);
             const finalBuffer = Buffer.concat(tsBuffers);
             const tsPath = `tmp_downloads/gopal/${lesson.name}.ts`;
             fs.writeFileSync(tsPath, finalBuffer);
             console.log(`  Saved to ${tsPath}`);
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
