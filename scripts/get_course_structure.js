const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false
  });
  
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/courses', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000); // wait for dashboard to load
  
  const emailInputs = await page.locator('input[type="email"]').count();
  if (emailInputs > 0) {
    console.log("Logging in...");
    await page.fill('input[type="email"]', 'd.rueschel@gmail.com');
    await page.fill('input[type="password"]', 'gopalFCbayern1');
    if (await page.locator('button:has-text("Login")').count() > 0) {
       await page.click('button:has-text("Login")');
    } else if (await page.locator('button:has-text("Einloggen")').count() > 0) {
       await page.click('button:has-text("Einloggen")');
    } else {
       await page.click('button'); 
    }
    await page.waitForTimeout(10000);
  }

  // screenshot dashboard
  await page.screenshot({ path: 'screenshot_dashboard.png', fullPage: true });

  // Look for "Die Befreiung"
  const hasCourse = await page.locator('text="Die Befreiung"').count();
  if (hasCourse > 0) {
    await page.click('text="Die Befreiung"');
    await page.waitForTimeout(10000);
    await page.screenshot({ path: 'screenshot_course.png', fullPage: true });
    
    // Now extract links
    const links = await page.$$eval('a', as => as.map(a => ({ text: a.innerText.trim(), href: a.href })));
    fs.writeFileSync('gopal_course_links.json', JSON.stringify(links, null, 2));
    
    // Also extract div texts to see modules
    const texts = await page.$$eval('div', divs => divs.map(d => d.innerText.trim()).filter(t => t.length > 3));
    fs.writeFileSync('gopal_course_text.txt', JSON.stringify([...new Set(texts)], null, 2));
    
  } else {
    console.log("Course 'Die Befreiung' not found on dashboard.");
  }

  await context.close();
})();
