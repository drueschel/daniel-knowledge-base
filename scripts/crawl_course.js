const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc', { waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);
  
  const modules = await page.$$eval('a', as => as.filter(a => a.href.includes('/student/course/die-befreiung/FSJ6ryZc/t/')).map(a => ({ text: a.innerText.trim(), href: a.href })));
  
  const uniqueModules = [];
  const seen = new Set();
  for (const m of modules) {
    if (m.text.length > 3 && !seen.has(m.href)) {
       seen.add(m.href);
       uniqueModules.push(m);
    }
  }
  
  console.log("Modules found:", uniqueModules.length);
  const lessons = {};
  
  for (const m of uniqueModules) {
     console.log(`Checking ${m.text}`);
     await page.goto(m.href, { waitUntil: 'networkidle' });
     await page.waitForTimeout(4000);
     
     const lessonLinks = await page.$$eval('a', as => as.map(a => a.href).filter(href => href.includes('/lesson/')));
     lessons[m.text.split('\n')[0]] = [...new Set(lessonLinks)];
  }
  
  console.log("Lessons:", JSON.stringify(lessons, null, 2));
  fs.writeFileSync('gopal_course_tree.json', JSON.stringify(lessons, null, 2));
  await context.close();
})();
