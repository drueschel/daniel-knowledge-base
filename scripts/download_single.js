const { chromium } = require('playwright');
const fs = require('fs');

const url = process.argv[2];
const outFile = process.argv[3];

if (!url || !outFile) {
  console.log("Usage: node download_single.js <url> <outFile.ts>");
  process.exit(1);
}

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  let downloadUrl = null;
  page.on('request', request => {
     const reqUrl = request.url();
     if (reqUrl.includes('.ts') && reqUrl.includes('1080p')) {
        if (!downloadUrl) downloadUrl = reqUrl;
     }
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // click center to activate player
  await page.mouse.click(500, 300);
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => {
    const v = document.querySelector('video') || document.body.shadowRoot?.querySelector('video') || document.querySelector('*').shadowRoot?.querySelector('video');
    if (v) {
      v.muted = true;
      v.playbackRate = 8.0;
      v.play();
    }
  });
  
  // Wait for the .ts chunk URL to be intercepted
  for(let i=0; i<15; i++) {
     if (downloadUrl) break;
     await page.waitForTimeout(1000);
  }
  
  if (downloadUrl) {
    console.log("Found chunk URL:", downloadUrl);
    const m3u8Url = downloadUrl.replace(/segment-\d+\.ts/, 'playlist.m3u8');
    console.log("Constructed m3u8 URL:", m3u8Url);
    
    // We can use bash curl/ffmpeg outside this script to download, or we can just log it.
    // For now, let's write it to a temp file so bash can pick it up.
    fs.writeFileSync('temp_m3u8.txt', m3u8Url);
  } else {
    console.log("Failed to find video chunks.");
  }
  
  await context.close();
})();
