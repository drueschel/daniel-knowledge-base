const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];
const outputFile = process.argv[3] || 'neo_video.ts';

if (!url) {
  console.log('Usage: node neo_download_video.js <mighty-networks-url> [output-file]');
  process.exit(1);
}

(async () => {
  // Use the persistent profile from the scratch directory
  const userDataDir = path.resolve(__dirname, '../../../.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/neo_chrome_profile');
  
  if (!fs.existsSync(userDataDir)) {
    console.error('ERROR: neo_chrome_profile not found! Please run the scratch login script first.');
    process.exit(1);
  }

  console.log('Launching persistent context headless...');
  const isHeadless = process.env.PLAYWRIGHT_HEADLESS === 'true';
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: isHeadless,
    args: ['--disable-web-security', '--autoplay-policy=no-user-gesture-required']
  });
  
  const page = await context.newPage();
  
  let m3u8Url = null;
  let headers = null;

  page.on('request', request => {
    const reqUrl = request.url();
    if (reqUrl.includes('.m3u8') && reqUrl.includes('/videos/') && !reqUrl.includes('playlist.m3u8')) {
      if (!m3u8Url) {
        m3u8Url = reqUrl;
        console.log(`[INTERCEPTED] Found m3u8 URL: ${m3u8Url}`);
      }
    }
  });

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  console.log('Waiting for video to load...');
  await page.waitForTimeout(8000);

  console.log('Attempting to click the Play button by coordinates...');
  await page.mouse.click(770, 450);
  await page.waitForTimeout(1000);
  await page.mouse.click(800, 450);
  await page.waitForTimeout(1000);
  await page.mouse.click(750, 400);
  
  console.log('Waiting for m3u8 request...');
  await page.waitForTimeout(5000);

  if (!m3u8Url) {
    console.log('Could not intercept m3u8. Ensure the video exists and auto-plays or play button coordinates are correct.');
    await context.close();
    process.exit(1);
  }

  if (fs.existsSync(outputFile)) {
    console.log('Removing existing output file...');
    fs.unlinkSync(outputFile);
  }

  console.log('Fetching m3u8 using page.evaluate (in-browser context)...');
  
  async function fetchInBrowser(urlToFetch) {
    return await page.evaluate(async (fetchUrl) => {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    }, urlToFetch);
  }

  async function fetchBinaryInBrowser(urlToFetch) {
    return await page.evaluate(async (fetchUrl) => {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    }, urlToFetch);
  }

  let masterPlaylist;
  try {
    masterPlaylist = await fetchInBrowser(m3u8Url);
  } catch (e) {
    console.log('Failed to fetch m3u8 in browser context:', e);
    await context.close();
    process.exit(1);
  }
  
  let targetPlaylistUrl = null;
  const lines = masterPlaylist.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // Prefer higher resolutions but grab any if none match exactly
    if (lines[i].includes('RESOLUTION=')) {
      targetPlaylistUrl = lines[i + 1].trim();
      if (lines[i].includes('720p') || lines[i].includes('1080p')) {
        break; // Stop at highest quality
      }
    }
  }

  if (!targetPlaylistUrl) targetPlaylistUrl = m3u8Url;
  else if (!targetPlaylistUrl.startsWith('http')) {
    const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);
    targetPlaylistUrl = baseUrl + targetPlaylistUrl;
  }

  console.log(`Fetching target playlist: ${targetPlaylistUrl}`);
  let targetPlaylist = await fetchInBrowser(targetPlaylistUrl);
  
  const segments = [];
  const pLines = targetPlaylist.split('\n');
  const baseUrl = targetPlaylistUrl.substring(0, targetPlaylistUrl.lastIndexOf('/') + 1);
  
  for (const line of pLines) {
    if (line && !line.startsWith('#')) {
      segments.push(line.startsWith('http') ? line : baseUrl + line);
    }
  }

  console.log(`Found ${segments.length} segments to download.`);
  
  for (let i = 0; i < segments.length; i++) {
    process.stdout.write(`\rDownloading segment ${i + 1}/${segments.length}...`);
    try {
      let b64 = await fetchBinaryInBrowser(segments[i]);
      fs.appendFileSync(outputFile, Buffer.from(b64, 'base64'));
    } catch(err) {
      console.error(`\nFailed to download segment ${i+1}:`, err);
    }
  }
  console.log('\nDownload complete!');
  await context.close();
})();
