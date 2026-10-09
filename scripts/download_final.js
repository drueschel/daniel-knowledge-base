const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false, args: ['--autoplay-policy=no-user-gesture-required'] });
  
  const page = await context.newPage();
  
  const topics = [
    {
       name: "Koerperschmerzen",
       url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG",
       filenames: ["8_01_Koerperschmerzen_Verschmelzungstyp", "8_02_Koerperschmerzen_Autonomietyp"]
    },
    {
       name: "Konflikte",
       url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/PFyv76gN",
       filenames: ["9_01_Konflikte_Verschmelzungstyp", "9_02_Konflikte_Autonomietyp"]
    }
  ];
  
  if (!fs.existsSync('tmp_downloads/gopal')) fs.mkdirSync('tmp_downloads/gopal', { recursive: true });

  for (const topic of topics) {
     console.log(`\nNavigating to topic ${topic.name}...`);
     await page.goto(topic.url, { waitUntil: 'networkidle' });
     await page.waitForTimeout(5000); // wait for lessons to load
     
     const lessons = await page.locator('h6').all();
     for (let i = 0; i < topic.filenames.length && i < lessons.length; i++) {
        const filename = topic.filenames[i];
        console.log(`\nProcessing lesson ${i+1}/${topic.filenames.length}: ${filename}...`);
        
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
        
        // click the lesson in the sidebar
        await lessons[i].click({ force: true });
        await page.waitForTimeout(4000); // Wait for video to load
        
        // wait for video element
        const video = page.locator('video');
        if (await video.count() > 0) {
           console.log("\n  Setting 16x speed and playing...");
           await page.evaluate(() => {
              const v = document.querySelector('video');
              if (v) { v.muted = true; v.playbackRate = 16.0; v.play(); }
           });
        } else {
           console.log("\n  No video element found! Trying center click...");
           await page.mouse.click(500, 300);
           await page.waitForTimeout(2000);
           await page.evaluate(() => {
              const v = document.querySelector('video');
              if (v) { v.muted = true; v.playbackRate = 16.0; v.play(); }
           });
        }
        
        console.log("  Waiting for video to finish...");
        let lastChunkCount = -1;
        let sameCountWait = 0;
        
        for (let j = 0; j < 90; j++) {
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
        
        page.off('response', onResponse);
        
        const indices = Object.keys(tsBuffers).map(Number).sort((a,b) => a - b);
        console.log(`\n  Total chunks: ${indices.length}`);
        if (indices.length > 0) {
          const finalBuffer = Buffer.concat(indices.map(i => tsBuffers[i]));
          const tsPath = `tmp_downloads/gopal/${filename}.ts`;
          fs.writeFileSync(tsPath, finalBuffer);
          console.log(`  Saved to ${tsPath}`);
          console.log(`  Converting to wav...`);
          execSync(`ffmpeg -y -i "${tsPath}" -ar 16000 -ac 1 -c:a pcm_s16le "tmp_downloads/gopal/${filename}.wav"`, { stdio: 'ignore' });
          console.log(`  Conversion done.`);
        }
     }
  }
  
  await context.close();
})();
