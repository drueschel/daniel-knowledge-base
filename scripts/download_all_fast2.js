const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io', { waitUntil: 'networkidle' });
  
  if (await page.locator('input[type="email"]').count() > 0) {
    console.log("Logging in...");
    await page.fill('input[type="email"]', 'd.rueschel@gmail.com');
    await page.fill('input[type="password"]', 'gopalFCbayern1');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
  } else {
    console.log("Already logged in.");
  }
  
  const videos = [
    { name: "8_01_Koerperschmerzen_Verschmelzungstyp", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/C2ncs6Nw/7yMJmX1x" },
    { name: "8_02_Koerperschmerzen_Autonomietyp", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/KYTlPz89/NxhRdJQZ" },
    { name: "9_01_Konflikte_Verschmelzungstyp", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/kY1R9dwh/Chwr8DMl" },
    { name: "9_02_Konflikte_Autonomietyp", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/nBrzT8Cj/pcVBWN2D" }
  ];
  
  if (!fs.existsSync('tmp_downloads/gopal')) fs.mkdirSync('tmp_downloads/gopal', { recursive: true });

  for (const v of videos) {
    console.log(`\nProcessing ${v.name}...`);
    let tsBuffers = {};
    
    const onResponse = async res => {
      const url = res.url();
      if (url.includes('.ts') && url.includes('video')) {
        try {
          const buffer = await res.body();
          const match = url.match(/video(\d+)\.ts/);
          if (match) {
            const index = parseInt(match[1], 10);
            tsBuffers[index] = buffer;
            console.log(`  Got chunk ${index}`);
          }
        } catch(e) {}
      }
    };
    page.on('response', onResponse);
    
    await page.goto(v.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    const videoLocator = page.locator('video');
    try {
       await videoLocator.waitFor({ state: 'attached', timeout: 10000 });
       await videoLocator.click({ force: true });
       console.log("  Clicked video, setting 16x speed...");
       await page.waitForTimeout(2000);
       
       await page.evaluate(() => {
          const v = document.querySelector('video');
          if (v) { v.muted = true; v.playbackRate = 16.0; v.play(); }
       });
       
       console.log("  Waiting for video to finish...");
       let lastChunkCount = -1;
       let sameCountWait = 0;
       
       // Max wait for 10 min video at 16x = ~40s, plus buffering
       for (let i = 0; i < 90; i++) {
          await page.waitForTimeout(1000);
          const isEnded = await page.evaluate(() => {
             const v = document.querySelector('video');
             return v ? v.ended : false;
          });
          if (isEnded) {
             console.log("  Video ended!");
             break;
          }
          
          const currentCount = Object.keys(tsBuffers).length;
          if (currentCount > 0 && currentCount === lastChunkCount) {
             sameCountWait++;
             if (sameCountWait > 15) { 
                console.log("  No new chunks for 15s, assuming done or buffered.");
                break;
             }
          } else {
             sameCountWait = 0;
             lastChunkCount = currentCount;
          }
       }
    } catch (e) {
       console.log("  Error:", e.message);
    }
    
    page.off('response', onResponse);
    
    const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
    console.log(`  Total chunks: ${indices.length}`);
    if (indices.length > 0) {
      const finalBuffer = Buffer.concat(indices.map(i => tsBuffers[i]));
      const tsPath = `tmp_downloads/gopal/${v.name}.ts`;
      fs.writeFileSync(tsPath, finalBuffer);
      console.log(`  Saved to ${tsPath}`);
      console.log(`  Converting to wav...`);
      execSync(`ffmpeg -y -i "${tsPath}" -ar 16000 -ac 1 -c:a pcm_s16le "tmp_downloads/gopal/${v.name}.wav"`, { stdio: 'ignore' });
      console.log(`  Conversion done.`);
    }
  }
  
  await context.close();
})();
