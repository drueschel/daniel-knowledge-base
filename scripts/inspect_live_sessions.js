const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true
  });
  
  const page = await context.newPage();
  const targetUrl = 'https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/vSxKbmpw';
  
  console.log("Navigating to target URL:", targetUrl);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  
  if (page.url().includes('login')) {
    console.log("Logging in...");
    await page.fill('input[type="email"]', 'd.rueschel@gmail.com');
    await page.fill('input[type="password"]', 'gopalFCbayern1');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
  }
  
  const title = await page.title();
  console.log("Page title:", title);
  
  // Find all links and lesson items
  const data = await page.evaluate(() => {
    const header = document.querySelector('h1, h2')?.innerText || '';
    const bodyText = document.body.innerText.slice(0, 2000);
    const links = Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim(),
      href: a.href
    })).filter(l => l.text.length > 0 && l.href.includes('learningsuite.io'));
    return { header, bodyText, links };
  });
  
  console.log("Header:", data.header);
  console.log("Links found:", data.links.length);
  data.links.forEach(l => console.log(`- ${l.text} -> ${l.href}`));
  
  fs.writeFileSync('/tmp/gopal_live_sessions_info.json', JSON.stringify(data, null, 2));
  await context.close();
})();
