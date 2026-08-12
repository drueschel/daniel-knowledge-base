const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/neo_chrome_profile';
  
  if (!fs.existsSync(userDataDir)) {
    console.error('Profile not found at:', userDataDir);
    process.exit(1);
  }

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false
  });
  
  const page = await context.newPage();
  
  const responses = [];

  page.on('response', async response => {
    try {
      const url = response.url();
      if (url.includes('graphql') || url.includes('api')) {
        const text = await response.text();
        if (text.includes('Introduction into Neo Emotional Release') || text.includes('somatic-evolution-')) {
          console.log(`Found matching payload in URL: ${url}`);
          responses.push(text);
        }
      }
    } catch (e) {
      // ignore
    }
  });

  console.log('Navigating to course content...');
  try {
    await page.goto('https://members.emotionalreleases.com/spaces/11012077/content', { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch(e) {
    console.log('Timeout, continuing...');
  }
  
  console.log('Waiting 10s for modules to render & APIs to load...');
  await page.waitForTimeout(10000); 

  fs.writeFileSync('scripts/api_payloads.json', JSON.stringify(responses, null, 2));
  console.log(`Saved ${responses.length} payloads to scripts/api_payloads.json`);
  
  // Also dump full HTML body
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('scripts/neo_body_dump.html', bodyHTML);

  await context.close();
})();
