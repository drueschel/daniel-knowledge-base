const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/kY1R9dwh/Chwr8DMl', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  const html = await page.content();
  fs.writeFileSync('gopal_lesson_dump.html', html);
  console.log("Dumped to gopal_lesson_dump.html");
  
  await context.close();
})();
