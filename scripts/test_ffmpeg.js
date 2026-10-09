const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  let m3u8Url = null;
  let headersStr = "";
  let ua = "";
  let referer = "";
  let cookies = "";
  
  page.on('request', req => {
     if (req.url().includes('.m3u8')) {
        m3u8Url = req.url();
        const headers = req.headers();
        for (let k in headers) {
           if (k.toLowerCase() === 'cookie') cookies = headers[k];
           if (k.toLowerCase() === 'referer') referer = headers[k];
           if (k.toLowerCase() === 'user-agent') ua = headers[k];
        }
     }
  });

  await page.goto("https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/gDhqTYLr", { waitUntil: 'networkidle' });
  
  for (let i = 0; i < 10; i++) {
     if (m3u8Url) break;
     await page.waitForTimeout(1000);
  }

  if (m3u8Url) {
      console.log(`Found m3u8!`);
      const cmd = `yt-dlp --no-check-certificates --user-agent "${ua}" --referer "${referer}" --add-header "Cookie:${cookies}" "${m3u8Url}" -o tmp_downloads/gopal/test.mp4`;
      console.log("Running yt-dlp...");
      try {
          execSync(cmd, { stdio: 'pipe' });
          console.log(`Successfully downloaded!`);
      } catch(e) {
          console.log(`yt-dlp failed!`);
          console.log(e.stderr.toString());
      }
  }

  await context.close();
})();
