const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  // Headless false so we bypass Cloudflare or DRM rendering blocks
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await context.newPage();
  
  const lessons = [
    { name: "8_01_Koerperschmerzen_Verschmelzungstyp", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/C2ncs6Nw/7yMJmX1x" },
    { name: "8_02_Koerperschmerzen_Autonomietyp", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/KYTlPz89/NxhRdJQZ" },
    { name: "9_01_Konflikte_Verschmelzungstyp", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/kY1R9dwh/Chwr8DMl" },
    { name: "9_02_Konflikte_Autonomietyp", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/nBrzT8Cj/pcVBWN2D" }
  ];
  
  if (!fs.existsSync('tmp_downloads/gopal')) fs.mkdirSync('tmp_downloads/gopal', { recursive: true });

  console.log("Waking up session on main page...");
  await page.goto('https://gopal.learningsuite.io', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  for (const lesson of lessons) {
     console.log(`\nNavigating directly to lesson: ${lesson.name}...`);
     
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
             process.stdout.write(`.` + index);
           }
         } catch(e) {}
       }
     };
     page.on('response', onResponse);
     
     await page.goto(lesson.url, { waitUntil: 'networkidle' });
     await page.waitForTimeout(8000); // Give it plenty of time to render the video player
     
     const video = page.locator('video');
     if (await video.count() > 0) {
        console.log("\n  Setting 16x speed and playing...");
        await page.evaluate(() => {
           const v = document.querySelector('video');
           if (v) { v.muted = true; v.playbackRate = 16.0; v.play(); }
        });
     } else {
        console.log("\n  No video element found! Checking if we need to click play...");
        await page.mouse.click(500, 300);
        await page.waitForTimeout(3000);
        await page.evaluate(() => {
           const v = document.querySelector('video');
           if (v) { v.muted = true; v.playbackRate = 16.0; v.play(); }
        });
     }
     
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
           if (sameCountWait > 15) { 
              console.log("\n  No new chunks for 15s, assuming done.");
              break;
           }
        } else {
           sameCountWait = 0;
           lastChunkCount = currentCount;
        }
     }
     
     page.off('response', onResponse);
     
     const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
     console.log(`\n  Total chunks: ${indices.length}`);
     if (indices.length > 0) {
       const finalBuffer = Buffer.concat(indices.map(i => tsBuffers[i]));
       const tsPath = `tmp_downloads/gopal/${lesson.name}.ts`;
       fs.writeFileSync(tsPath, finalBuffer);
       console.log(`  Saved to ${tsPath}`);
       console.log(`  Converting to wav...`);
       execSync(`ffmpeg -y -i "${tsPath}" -ar 16000 -ac 1 -c:a pcm_s16le "tmp_downloads/gopal/${lesson.name}.wav"`, { stdio: 'ignore' });
       console.log(`  Conversion done.`);
     }
  }
  
  await context.close();
})();
