const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true
  });
  
  const page = await context.newPage();
  const videoData = {};
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('wistia.com') || url.includes('vimeo') || url.includes('.m3u8')) {
      const currentUrl = page.url();
      if (!videoData[currentUrl]) videoData[currentUrl] = [];
      videoData[currentUrl].push(url);
    }
  });

  const topics = [
    { id: "8_Körperschmerzen", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG" },
    { id: "9_Konflikte_mit_dem_Partner", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/PFyv76gN" }
  ];
  
  for (const topic of topics) {
    console.log(`\nNavigating to Topic: ${topic.id}...`);
    await page.goto(topic.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Only grab h6 that are likely lessons
    let lessonTitles = await page.$$eval('h6', h6s => h6s.map(h => h.innerText));
    lessonTitles = lessonTitles.filter(t => t.length > 15 && !t.includes('Live Call') && !t.includes('Live Event') && !t.includes('Lektionen'));
    
    console.log("Filtered lesson titles:", lessonTitles);
    
    for (const title of lessonTitles) {
      console.log(`Clicking lesson: ${title}`);
      await page.locator(`h6:has-text("${title}")`).first().click();
      
      // Wait for navigation to complete
      await page.waitForTimeout(8000); // 8 seconds to load video player
      const currentUrl = page.url();
      console.log(`Now at: ${currentUrl}`);
      
      if (currentUrl === topic.url) {
         console.log("Did not navigate to a lesson, skipping.");
         continue;
      }
      
      // Look for iframes
      const frames = await page.$$eval('iframe', iframes => iframes.map(f => f.src));
      console.log("Iframes:", frames);
      
      if (!videoData[title]) videoData[title] = {};
      videoData[title].url = currentUrl;
      videoData[title].iframes = frames;
      
      // If wistia is found
      const html = await page.content();
      if (html.includes('wistia') || html.includes('vimeo')) {
         videoData[title].hasVideoPlayer = true;
      }
      
      // Go back to topic page
      await page.goto(topic.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }
  }
  
  console.log("\nFinal Extracted Data:", JSON.stringify(videoData, null, 2));
  fs.writeFileSync('gopal_extracted_videos.json', JSON.stringify(videoData, null, 2));
  
  await context.close();
})();
