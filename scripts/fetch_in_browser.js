const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const page = await context.newPage();
  
  console.log("Navigating directly to lesson...");
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/kY1R9dwh/Chwr8DMl', { waitUntil: 'networkidle' });
  
  const variantUrl = "https://api.learningsuite.io/api/bunny/playlist/variant/Y21yYW9tMDBkMDM3eDVhMDF4YnRxNG5sMzpjbXJvbzRnbXgwOTNxZ2YwMWlrcDZicGgz/course/07e5103e-b3e8-472d-9524-f6e1230247cc/1080p/video.m3u8?token=588gfEJUlZ4xfxfXcnl8V9S-iplI-RHYi5yaZZ2HiQM&expires=1788480000";
  
  console.log("Fetching variant playlist inside browser...");
  const m3u8 = await page.evaluate(async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.text();
  }, variantUrl);
  
  console.log("Got m3u8:");
  console.log(m3u8.substring(0, 300));
  fs.writeFileSync('variant.m3u8', m3u8);
  
  await context.close();
})();
