const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: false });
  const page = await context.newPage();
  
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/C2ncs6Nw/7yMJmX1x', { waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);
  
  // Find iframe and its content
  const iframes = page.frames();
  for (let i = 0; i < iframes.length; i++) {
    const frame = iframes[i];
    try {
        const frameContent = await frame.content();
        fs.writeFileSync(`tmp_lesson_dump_frame_${i}.html`, frameContent);
    } catch(e) {}
  }
  
  const content = await page.content();
  fs.writeFileSync('tmp_lesson_dump.html', content);
  console.log("HTML dumped.");
  
  await context.close();
})();
