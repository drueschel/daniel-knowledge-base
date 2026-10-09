const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc', { waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);
  
  const modulesToScrape = ['Einsamkeit', 'Übergewicht', 'Hinweise für die Praxis', 'Zusammenfassung & Ausblick'];
  const newLessons = [];

  for (const moduleName of modulesToScrape) {
     console.log(`Navigating to ${moduleName}...`);
     try {
       await page.click(`text="${moduleName}"`);
       await page.waitForTimeout(5000);
       
       const lessonLinks = await page.$$eval('a', as => as.map(a => ({ text: a.innerText.trim(), href: a.href })).filter(a => a.href.includes('/lesson/')));
       
       const uniqueLinks = [];
       const seen = new Set();
       for (const l of lessonLinks) {
          if (!seen.has(l.href) && l.text.length > 0) {
             seen.add(l.href);
             uniqueLinks.push({ module: moduleName, ...l });
          }
       }
       newLessons.push(...uniqueLinks);
     } catch (e) {
       console.log(`Failed to click on ${moduleName}: ${e.message}`);
     }
  }
  
  fs.writeFileSync('gopal_new_modules.json', JSON.stringify(newLessons, null, 2));
  console.log("Saved to gopal_new_modules.json");
  await context.close();
})();
