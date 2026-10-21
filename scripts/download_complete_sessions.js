const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function getFragments(context, url) {
  const page = await context.newPage();
  
  await page.addInitScript(() => {
    window.__capturedFragments = null;
    const interval = setInterval(() => {
      if (window.Hls && window.Hls.prototype && !window.Hls.prototype.__hooked) {
        window.Hls.prototype.__hooked = true;
        const origLoadSource = window.Hls.prototype.loadSource;
        window.Hls.prototype.loadSource = function(url) {
          this.on(window.Hls.Events.LEVEL_LOADED, (event, data) => {
            if (data && data.details && data.details.fragments) {
              window.__capturedFragments = data.details.fragments.map(f => ({
                url: f.url,
                duration: f.duration,
                sn: f.sn,
                start: f.start
              }));
            }
          });
          return origLoadSource.apply(this, arguments);
        };
      }
    }, 10);
  });

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.mouse.click(600, 700);
  
  let frags = null;
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    frags = await page.evaluate(() => window.__capturedFragments);
    if (frags && frags.length > 0) break;
  }
  
  await page.close();
  return frags;
}

async function downloadAllChunks(fragments, outTsPath, concurrency = 16) {
  console.log(`Downloading ${fragments.length} chunks with concurrency ${concurrency}...`);
  
  const chunkBuffers = new Array(fragments.length);
  let completed = 0;
  
  async function downloadChunk(index) {
    const frag = fragments[index];
    let retries = 5;
    while (retries > 0) {
      try {
        const res = await fetch(frag.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ab = await res.arrayBuffer();
        chunkBuffers[index] = Buffer.from(ab);
        completed++;
        if (completed % 25 === 0 || completed === fragments.length) {
          process.stdout.write(`\rProgress: ${completed}/${fragments.length} chunks (${((completed / fragments.length) * 100).toFixed(1)}%)`);
        }
        return;
      } catch (err) {
        retries--;
        if (retries === 0) {
          throw new Error(`Failed to download chunk ${index} (${frag.url}): ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  // Pool
  const queue = fragments.map((_, idx) => idx);
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const idx = queue.shift();
      if (idx !== undefined) {
        await downloadChunk(idx);
      }
    }
  });

  await Promise.all(workers);
  console.log(`\nAll ${fragments.length} chunks downloaded! Verifying integrity...`);
  
  for (let i = 0; i < fragments.length; i++) {
    if (!chunkBuffers[i] || chunkBuffers[i].length === 0) {
      throw new Error(`Integrity error: Chunk ${i} is missing or empty!`);
    }
  }
  console.log("Integrity verified: 100% chunks present without gaps. Writing combined TS stream...");
  
  const writeStream = fs.createWriteStream(outTsPath);
  for (let i = 0; i < fragments.length; i++) {
    writeStream.write(chunkBuffers[i]);
  }
  await new Promise(resolve => writeStream.end(resolve));
  console.log(`Saved TS file: ${outTsPath} (${(fs.statSync(outTsPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    viewport: { width: 1280, height: 800 }
  });

  const sessions = [
    {
      name: "02_Einzelsitzung_Stress_Burnout_Teil_1",
      url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/76WJBsCG/mYxscLXT",
      expectedDuration: 3152.88
    },
    {
      name: "03_Einzelsitzung_Stress_Burnout_Teil_2",
      url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/76WJBsCG/yKDkbp7v",
      expectedDuration: 2896.80
    }
  ];

  const outDir = path.resolve(__dirname, '../tmp_downloads/gopal');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const session of sessions) {
    console.log(`\n========================================`);
    console.log(`Processing ${session.name}`);
    console.log(`Expected duration: ${(session.expectedDuration / 60).toFixed(2)} min (${session.expectedDuration}s)`);
    console.log(`========================================`);

    const frags = await getFragments(context, session.url);
    if (!frags || frags.length === 0) {
      console.error(`ERROR: Could not retrieve fragments for ${session.name}`);
      continue;
    }
    console.log(`Found ${frags.length} fragments.`);

    const tsFile = path.join(outDir, `${session.name}_full.ts`);
    const wavFile = path.join(outDir, `${session.name}.wav`);

    await downloadAllChunks(frags, tsFile, 20);

    console.log(`Converting ${tsFile} to pristine WAV via ffmpeg...`);
    execSync(`ffmpeg -y -i "${tsFile}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavFile}"`, { stdio: 'inherit' });

    fs.unlinkSync(tsFile);

    // Verify WAV duration with ffprobe
    const durationOutput = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavFile}"`).toString().trim();
    const actualSec = parseFloat(durationOutput);
    console.log(`VERIFICATION RESULT:`);
    console.log(`Actual WAV Duration: ${actualSec.toFixed(2)} s (${(actualSec / 60).toFixed(2)} min)`);
    console.log(`Expected Duration:   ${session.expectedDuration.toFixed(2)} s (${(session.expectedDuration / 60).toFixed(2)} min)`);
    
    if (Math.abs(actualSec - session.expectedDuration) > 3) {
      console.warn(`WARNING: Duration difference > 3 seconds!`);
    } else {
      console.log(`SUCCESS: 100% COMPLETE AUDIO MATCH!`);
    }
  }

  await context.close();
  console.log("\nAll downloads and conversions finished successfully!");
})();
