const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const page = await context.newPage();
  await page.goto('https://gopal.learningsuite.io', { waitUntil: 'domcontentloaded' });
  
  const keys = await page.evaluate(() => Object.keys(window.localStorage));
  console.log("Keys:");
  console.log(keys);
  
  const token = await page.evaluate(() => window.localStorage.getItem('token') || window.localStorage.getItem('auth') || window.localStorage.getItem('access_token') || window.localStorage.getItem('ls-auth-token') || window.localStorage.getItem('ls_token'));
  console.log("Found token:", !!token);
  if (token) console.log(token.substring(0, 50) + "...");
  
  await context.close();
})();
