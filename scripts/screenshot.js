const { chromium } = require('playwright');
(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'screenshot_test2.png' });
  
  // Dump links for debugging
  const links = await page.$$eval('a', as => as.map(a => ({ text: a.innerText.trim(), href: a.href })));
  require('fs').writeFileSync('gopal_course_links_debug.json', JSON.stringify(links, null, 2));

  await context.close();
})();
