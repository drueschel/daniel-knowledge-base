const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // scroll to bottom slowly to load all modules
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);
  }
  
  await page.screenshot({ path: 'screenshot_test3_scrolled.png' });
  
  // Extract all elements that look like module cards (they might be divs, not just a tags)
  const modules = await page.$$eval('*', els => {
    return els
      .filter(el => el.innerText && (
         el.innerText.includes('Einsamkeit') || 
         el.innerText.includes('Übergewicht') || 
         el.innerText.includes('Hinweise für die Praxis') ||
         el.innerText.includes('Zusammenfassung & Ausblick')
      ))
      .map(el => ({ tag: el.tagName, text: el.innerText.substring(0, 100).trim(), className: el.className }))
  });
  
  console.log("Found matches:", modules.length);
  require('fs').writeFileSync('gopal_module_elements.json', JSON.stringify(modules, null, 2));

  await context.close();
})();
