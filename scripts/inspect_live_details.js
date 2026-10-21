const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  const page = await context.newPage();
  
  const lessons = [
    { name: "30_August", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/Bv9ZY5g7" },
    { name: "04_Oktober", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/VNy1xB7s" }
  ];
  
  for (const l of lessons) {
    console.log(`Loading ${l.name}...`);
    await page.goto(l.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    
    const text = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync(`/tmp/gopal_${l.name}.txt`, text);
    console.log(`Saved /tmp/gopal_${l.name}.txt (${text.length} chars)`);
  }
  
  await context.close();
})();
