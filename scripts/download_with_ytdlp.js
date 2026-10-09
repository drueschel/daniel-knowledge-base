const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const page = await context.newPage();
  await page.goto('https://gopal.learningsuite.io/student/course/die-befreiung/FSJ6ryZc/t/h6lRcXVG', { waitUntil: 'domcontentloaded' });
  
  const cookies = await context.cookies();
  console.log(`Found ${cookies.length} cookies`);
  
  // Format for Netscape cookies.txt
  let cookieContent = "# Netscape HTTP Cookie File\n# http://curl.haxx.se/rfc/cookie_spec.html\n# This is a generated file!  Do not edit.\n\n";
  for (const c of cookies) {
    const domain = c.domain.startsWith('.') ? c.domain : `.${c.domain}`;
    cookieContent += `${domain}\tTRUE\t${c.path}\t${c.secure ? 'TRUE' : 'FALSE'}\t${Math.floor(c.expires)}\t${c.name}\t${c.value}\n`;
  }
  
  fs.writeFileSync('gopal_cookies.txt', cookieContent);
  console.log("Cookies exported to gopal_cookies.txt");
  
  const videoUrls = [
    { name: "8_01_Koerperschmerzen_Verschmelzungstyp", url: "https://api.learningsuite.io/api/bunny/playlist/master/Y21yYW9tMDBkMDM3eDVhMDF4YnRxNG5sMzpjbXJvbzRnbXgwOTNxZ2YwMWlrcDZicGgz/course/e5060097-2f67-4e44-926d-b560a5ff737b/playlist.m3u8?token=DzdxsP4a4q2mRrPixgIGpqcVPY_EDM6HrJ_on7KYdis&expires=1788580800" },
    { name: "8_02_Koerperschmerzen_Autonomietyp", url: "https://api.learningsuite.io/api/bunny/playlist/master/Y21yYW9tMDBkMDM3eDVhMDF4YnRxNG5sMzpjbXJvbzRnbXgwOTNxZ2YwMWlrcDZicGgz/course/36b74437-f6b6-4a06-bbcc-fd2bdb092bf2/playlist.m3u8?token=pNmvQ-dN1v309rcuCM9C_KwNMt_piNJ5ml-VuZbOJwE&expires=1788782400" },
    { name: "9_01_Konflikte_Verschmelzungstyp", url: "https://api.learningsuite.io/api/bunny/playlist/master/Y21yYW9tMDBkMDM3eDVhMDF4YnRxNG5sMzpjbXJvbzRnbXgwOTNxZ2YwMWlrcDZicGgz/course/07e5103e-b3e8-472d-9524-f6e1230247cc/playlist.m3u8?token=Wg-CilXfFalT4lQBrvWZqupYhBsMwafEk_D-E8a-zF8&expires=1788681600" },
    { name: "9_02_Konflikte_Autonomietyp", url: "https://api.learningsuite.io/api/bunny/playlist/master/Y21yYW9tMDBkMDM3eDVhMDF4YnRxNG5sMzpjbXJvbzRnbXgwOTNxZ2YwMWlrcDZicGgz/course/9ecd109c-bcdf-4ded-8c9c-d3e8554aa748/playlist.m3u8?token=ynWDUDDRsX9aJMwBK8afzFFF4YZ4h5NCNjgLTAnhuwk&expires=1788984000" }
  ];
  
  for (const v of videoUrls) {
     console.log(`Downloading ${v.name}...`);
     try {
       const cmd = `yt-dlp --cookies gopal_cookies.txt --referer "https://gopal.learningsuite.io/" --add-header "Origin: https://gopal.learningsuite.io" -o "tmp_downloads/gopal/${v.name}.%(ext)s" "${v.url}"`;
       execSync(cmd, { stdio: 'inherit' });
       console.log(`Success: ${v.name}`);
     } catch (e) {
       console.log(`Error downloading ${v.name}:`, e.message);
     }
  }
  
  await context.close();
})();
