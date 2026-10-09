const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true
  });
  
  const page = await context.newPage();
  
  const videoUrls = {};
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('.m3u8') || url.includes('.mp4') || url.includes('vimeo') || url.includes('wistia')) {
      console.log("Found video request:", url);
      videoUrls[page.url()] = url;
    }
    if (url.includes('graphql') || url.includes('api')) {
       // just checking
    }
  });

  const urls = [
    { name: "Körperschmerzen", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG" },
    { name: "Konflikte_mit_dem_Partner", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/PFyv76gN" }
  ];
  
  for (const item of urls) {
    console.log(`\nNavigating to ${item.name}...`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);
    console.log("Current URL after load:", page.url());
    const title = await page.title();
    console.log("Title:", title);
  }
  
  console.log("\nVideo URLs found:", videoUrls);
  
  await context.close();
})();
