const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const page = await context.newPage();
  
  const url = "https://api.learningsuite.io/api/bunny/playlist/master/Y21yYW9tMDBkMDM3eDVhMDF4YnRxNG5sMzpjbXJvbzRnbXgwOTNxZ2YwMWlrcDZicGgz/course/e5060097-2f67-4e44-926d-b560a5ff737b/playlist.m3u8?token=DzdxsP4a4q2mRrPixgIGpqcVPY_EDM6HrJ_on7KYdis&expires=1788580800";
  
  console.log("Fetching URL via playwright...");
  const response = await page.goto(url);
  const text = await response.text();
  
  console.log("Response starts with:");
  console.log(text.substring(0, 300));
  
  await context.close();
})();
