const { chromium } = require('playwright');
(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  let chunkTemplate = null;
  page.on('response', res => {
     const resUrl = res.url();
     if (resUrl.includes('.ts') && resUrl.includes('video')) {
        chunkTemplate = resUrl.replace(/video\d+\.ts/, 'videoINDEX.ts');
     }
  });

  await page.goto("https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/gDhqTYLr", { waitUntil: 'networkidle' });
  
  for (let i = 0; i < 10; i++) {
     if (chunkTemplate) break;
     await page.waitForTimeout(1000);
  }
  
  if (chunkTemplate) {
     console.log(`Template: ${chunkTemplate}`);
     const statuses = await page.evaluate(async (tmpl) => {
         const results = [];
         for(let i=0; i<30; i++) {
             const url = tmpl.replace('videoINDEX.ts', `video${i}.ts`);
             try {
                 const res = await window.fetch(url, {method: 'HEAD'});
                 results.push({i, status: res.status});
             } catch(e) {
                 results.push({i, error: e.message});
             }
         }
         return results;
     }, chunkTemplate);
     console.log(statuses);
  } else {
     console.log("No template found.");
  }
  
  await context.close();
})();
