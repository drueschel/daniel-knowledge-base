const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false
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
     console.log(`\nNavigating to ${lesson.name}...`);
     
     let m3u8Url = null;
     
     const onResponse = res => {
       const resUrl = res.url();
       if (resUrl.includes('.m3u8')) {
          m3u8Url = resUrl;
       }
     };
     page.on('response', onResponse);
     
     await page.goto(url, { waitUntil: 'networkidle' });
     
     for (let i = 0; i < 10; i++) {
        if (m3u8Url) break;
        await page.waitForTimeout(1000);
     }
     page.off('response', onResponse);

     if (m3u8Url) {
         console.log(`  Found m3u8: ${m3u8Url.split('?')[0]}...`);
         try {
             execSync(`ffmpeg -y -i "${m3u8Url}" -ar 16000 -ac 1 -c:a pcm_s16le "tmp_downloads/gopal/${lesson.name}.wav"`, { stdio: 'ignore' });
             console.log(`  Successfully downloaded and converted via ffmpeg!`);
         } catch(e) {
             console.log(`  ffmpeg failed!`);
         }
     } else {
         console.log(`  No m3u8 found! Maybe no video?`);
     }
  }

  await context.close();
})();
