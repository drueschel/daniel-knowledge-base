const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true
  });
  
  const page = await context.newPage();
  
  console.log("Navigating to course page directly...");
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG', { waitUntil: 'networkidle' });
  
  // Wait to see if we are redirected to login
  await page.waitForTimeout(3000);
  
  if (page.url().includes('login')) {
    console.log("Redirected to login! Filling credentials...");
    await page.fill('input[type="email"]', 'd.rueschel@gmail.com');
    await page.fill('input[type="password"]', 'gopalFCbayern1');
    await page.click('button[type="submit"]');
    console.log("Waiting for navigation after login...");
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => console.log("Navigation timeout, continuing..."));
    
    // Try going to the course page again
    await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
  }
  
  const urls = [
    { name: "Körperschmerzen", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG" },
    { name: "Konflikte_mit_dem_Partner", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/PFyv76gN" }
  ];
  
  for (const item of urls) {
    console.log(`\nNavigating to ${item.name}...`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    
    // Wait for the main content to load
    await page.waitForTimeout(5000);
    
    // LearningSuite often uses Wistia or custom players that have API endpoints.
    // Let's capture the raw HTML.
    const html = await page.content();
    fs.writeFileSync(`gopal_${item.name}.html`, html);
    
    const frames = await page.$$eval('iframe', iframes => iframes.map(f => f.src));
    console.log("Found iframes:", frames);
    const videos = await page.$$eval('video', vids => vids.map(v => v.src));
    console.log("Found videos:", videos);
  }
  
  await context.close();
})();
