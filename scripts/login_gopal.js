const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  
  console.log("Öffne Browser für Login...");
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // Dies öffnet den Browser sichtbar
    channel: 'chrome' // Nutzt das normale installierte Google Chrome
  });
  
  const page = await context.newPage();
  await page.goto('https://gopal.learningsuite.io');
  
  console.log("Bitte logge dich im geöffneten Chrome-Fenster ein. Schließe das Browser-Fenster, wenn du fertig bist.");
  
  // Wait for the browser to be closed by the user
  context.on('close', () => {
    console.log("Browser geschlossen. Session gespeichert!");
    process.exit(0);
  });
})();
