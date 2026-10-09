const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  if (await page.locator('input[type="email"]').count() > 0) {
    console.log("Logging in...");
    await page.fill('input[type="email"]', 'd.rueschel@gmail.com');
    await page.fill('input[type="password"]', 'gopalFCbayern1');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);
  }
  
  await page.goto("https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG", { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('gopal_lesson_text.txt', text);
  console.log("Dumped text.");
  
  await context.close();
})();
