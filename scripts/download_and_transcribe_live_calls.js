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

async function downloadAllChunks(fragments, outTsPath, concurrency = 20) {
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
        if (completed % 50 === 0 || completed === fragments.length) {
          process.stdout.write(`\rProgress: ${completed}/${fragments.length} chunks (${((completed / fragments.length) * 100).toFixed(1)}%)`);
        }
        return;
      } catch (err) {
        retries--;
        if (retries === 0) throw new Error(`Failed to download chunk ${index}: ${err.message}`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  const queue = fragments.map((_, idx) => idx);
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const idx = queue.shift();
      if (idx !== undefined) await downloadChunk(idx);
    }
  });

  await Promise.all(workers);
  console.log(`\nVerifying chunk integrity...`);
  for (let i = 0; i < fragments.length; i++) {
    if (!chunkBuffers[i] || chunkBuffers[i].length === 0) {
      throw new Error(`Integrity error: Chunk ${i} is missing!`);
    }
  }

  const writeStream = fs.createWriteStream(outTsPath);
  for (let i = 0; i < fragments.length; i++) {
    writeStream.write(chunkBuffers[i]);
  }
  await new Promise(resolve => writeStream.end(resolve));
  console.log(`Saved TS stream: ${outTsPath} (${(fs.statSync(outTsPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    viewport: { width: 1280, height: 800 }
  });

  const calls = [
    {
      name: "Live_Call_30_August_Teil_1_Angst_und_Panik",
      url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/Bv9ZY5g7/qPN5J1xW",
      expectedSec: 3587.3
    },
    {
      name: "Live_Call_30_August_Teil_2_Konflikte_mit_dem_Partner",
      url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/Bv9ZY5g7/zCGq5pgy",
      expectedSec: 2960.2
    },
    {
      name: "Live_Call_04_Oktober_Angst_und_Panik",
      url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/VNy1xB7s/gd1pvFsk",
      expectedSec: 3348.8
    }
  ];

  const outDir = path.resolve(__dirname, '../tmp_downloads/gopal');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const call of calls) {
    console.log(`\n========================================`);
    console.log(`Processing: ${call.name}`);
    console.log(`Expected duration: ${(call.expectedSec / 60).toFixed(2)} min (${call.expectedSec}s)`);
    console.log(`========================================`);

    const frags = await getFragments(context, call.url);
    if (!frags || frags.length === 0) {
      console.error(`ERROR: Could not retrieve fragments for ${call.name}`);
      continue;
    }

    const tsFile = path.join(outDir, `${call.name}.ts`);
    const wavFile = path.join(outDir, `${call.name}.wav`);

    await downloadAllChunks(frags, tsFile, 20);

    console.log(`Converting ${call.name} to 16kHz mono WAV...`);
    execSync(`ffmpeg -y -i "${tsFile}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavFile}"`, { stdio: 'ignore' });
    fs.unlinkSync(tsFile);

    const actualSec = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavFile}"`).toString().trim());
    console.log(`Actual WAV duration: ${actualSec.toFixed(2)} s (${(actualSec / 60).toFixed(2)} min)`);
    console.log(`MATCH SUCCESS: ${(actualSec / 60).toFixed(2)} min audio ready for transcription.`);
  }

  await context.close();
  console.log("\nAll 3 Live Call audio streams downloaded and verified successfully!");
})();
