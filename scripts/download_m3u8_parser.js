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
     
     let m3u8Content = null;
     let m3u8Url = null;
     
     const onResponse = async res => {
       const resUrl = res.url();
       if (resUrl.includes('video.m3u8')) {
          try {
             m3u8Content = (await res.body()).toString();
             m3u8Url = resUrl;
             console.log(`  Found m3u8: ${resUrl.split('?')[0]}`);
          } catch(e) {}
       }
     };
     page.on('response', onResponse);
     
     await page.goto(url, { waitUntil: 'networkidle' });
     
     for (let i = 0; i < 10; i++) {
        if (m3u8Content) break;
        await page.waitForTimeout(1000);
     }
     
     page.off('response', onResponse);

     if (m3u8Content) {
         // parse m3u8
         const lines = m3u8Content.split('\n');
         const tsFiles = lines.filter(line => line.trim().endsWith('.ts') || line.trim().includes('.ts?'));
         console.log(`  Playlist has ${tsFiles.length} chunks.`);
         
         const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);
         const tokenPart = m3u8Url.includes('?') ? m3u8Url.substring(m3u8Url.indexOf('?')) : '';
         
         const tsBuffers = [];
         for (let i = 0; i < tsFiles.length; i++) {
             let chunkName = tsFiles[i].trim();
             // Some m3u8 have relative URLs
             let chunkUrl = chunkName.startsWith('http') ? chunkName : baseUrl + chunkName;
             // Ensure token is attached if not already present
             if (!chunkUrl.includes('?') && tokenPart) {
                 chunkUrl += tokenPart;
             }
             
             const base64Data = await page.evaluate(async (url) => {
                 try {
                     const response = await window.fetch(url);
                     if (!response.ok) return null; 
                     const buffer = await response.arrayBuffer();
                     let binary = '';
                     const bytes = new Uint8Array(buffer);
                     const len = bytes.byteLength;
                     for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
                     return window.btoa(binary);
                 } catch(e) { return null; }
             }, chunkUrl);
             
             if (!base64Data) {
                 console.log(`\n  Failed to fetch chunk ${chunkName}`);
                 break; // stop or continue?
             }
             tsBuffers.push(Buffer.from(base64Data, 'base64'));
             process.stdout.write(`.${i}`);
         }
         
         if (tsBuffers.length > 0) {
             console.log(`\n  Total chunks downloaded: ${tsBuffers.length}`);
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
         console.log(`  No m3u8 found! Maybe no video?`);
     }
  }

  await context.close();
})();
