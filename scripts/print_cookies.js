const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const cookies = await context.cookies();
  console.log("Total cookies:", cookies.length);
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  console.log(cookieString);
  
  await context.close();
})();
