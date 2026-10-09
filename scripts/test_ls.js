const { chromium } = require('playwright');
(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  // Login first since I cleared it!
  await page.goto("https://gopal.learningsuite.io/login");
  await page.waitForTimeout(3000);
  
  const isLoginPage = await page.evaluate(() => document.body.innerText.includes('Login'));
  if (isLoginPage) {
     console.log("Logging in...");
     await page.fill('input[type="email"]', 'd.rueschel@gmail.com');
     await page.fill('input[type="password"]', 'gopalFCbayern1');
     await page.click('button:has-text("Login")');
     await page.waitForTimeout(5000);
  }

  await page.goto("https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/gDhqTYLr", { waitUntil: 'networkidle' });
  const ls = await page.evaluate(() => Object.keys(localStorage));
  console.log("LocalStorage Keys:", ls);
  
  // Also check if there is a specific key for video progress
  const videoProgressKeys = ls.filter(k => k.toLowerCase().includes('video') || k.toLowerCase().includes('progress') || k.toLowerCase().includes('course'));
  for (let k of videoProgressKeys) {
     console.log(k, await page.evaluate((key) => localStorage.getItem(key), k));
  }
  
  await context.close();
})();
