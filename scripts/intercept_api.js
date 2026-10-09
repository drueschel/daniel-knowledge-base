const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  const apiResponses = [];
  
  page.on('response', async res => {
    const url = res.url();
    if (res.request().resourceType() === 'fetch' || res.request().resourceType() === 'xhr' || url.includes('json')) {
      try {
        const body = await res.text();
        if (body.includes('Abhängigkeit') || body.includes('Trigger') || body.includes('Depression')) {
           console.log("Found match in API response:", url);
           apiResponses.push({ url, body });
        }
      } catch(e) {}
    }
  });

  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc', { waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);
  
  fs.writeFileSync('gopal_api_responses.json', JSON.stringify(apiResponses, null, 2));
  console.log("Done. Saved to gopal_api_responses.json");
  await context.close();
})();
