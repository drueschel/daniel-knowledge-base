const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true
  });
  
  const page = await context.newPage();
  
  let currentLesson = "";
  const videoUrls = {};
  
  page.on('response', async response => {
    const url = response.url();
    if ((url.includes('.m3u8') || url.includes('.mp4') || url.includes('vimeo') || url.includes('wistia')) && !url.includes('google-analytics')) {
      if (currentLesson) {
        if (!videoUrls[currentLesson]) videoUrls[currentLesson] = [];
        videoUrls[currentLesson].push(url);
      }
    }
  });

  const topics = [
    { name: "8_Körperschmerzen", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG" },
    { name: "9_Konflikte_mit_dem_Partner", url: "https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/PFyv76gN" }
  ];
  
  for (const topic of topics) {
    console.log(`\nNavigating to Topic: ${topic.name}...`);
    await page.goto(topic.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Find all lesson links
    // The links are usually in an 'a' tag wrapping the lesson title, or we can just find the titles and click them
    const lessonElements = await page.$$('text=Minuten >> xpath=../..'); // The lesson block has a span with "4 Minuten"
    
    // Actually, let's just grab all hrefs that look like a lesson
    const links = await page.$$eval('a', as => as.map(a => a.href).filter(href => href.includes('/lesson/')));
    console.log("Found lesson links:", links);
    
    // Deduplicate
    const uniqueLinks = [...new Set(links)];
    
    for (let i = 0; i < uniqueLinks.length; i++) {
      const link = uniqueLinks[i];
      console.log(`Navigating to lesson ${i + 1}: ${link}`);
      
      currentLesson = `${topic.name}_Lesson_${i + 1}`;
      await page.goto(link, { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
      
      const title = await page.title();
      console.log(`Lesson Title: ${title}`);
      
      // We wait for the video to start or load. LearningSuite sometimes requires a click to play, or auto-plays.
      // Let's check if there's an iframe
      const frames = await page.$$eval('iframe', iframes => iframes.map(f => f.src));
      if (frames.length > 0) {
        console.log("Found iframes in lesson:", frames);
        videoUrls[currentLesson] = frames;
      }
    }
  }
  
  console.log("\nExtracted Data:", JSON.stringify(videoUrls, null, 2));
  fs.writeFileSync('gopal_extracted_videos.json', JSON.stringify(videoUrls, null, 2));
  
  await context.close();
})();
