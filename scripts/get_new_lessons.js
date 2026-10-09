const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false
  });
  
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/courses', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000); // wait for dashboard
  
  const hasCourse = await page.locator('text="Die Befreiung"').count();
  if (hasCourse > 0) {
    await page.click('text="Die Befreiung"');
    await page.waitForTimeout(10000);
    
    // Dump all links
    const links = await page.$$eval('a', as => as.map(a => ({ text: a.innerText.trim(), href: a.href })));
    fs.writeFileSync('gopal_course_links2.json', JSON.stringify(links, null, 2));
    
    // Dump HTML
    const html = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('gopal_course_html.html', html);
  } else {
    console.log("Could not find course on dashboard.");
  }

  await context.close();
})();
