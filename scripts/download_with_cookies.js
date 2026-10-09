const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  const userDataDir = '/Users/danielrueschel/.gemini/antigravity/brain/28c5d4e2-236e-4239-bde8-c035eb0b91ea/scratch/gopal_chrome_profile';
  const context = await chromium.launchPersistentContext(userDataDir, { headless: true });
  
  const cookies = await context.cookies('https://api.learningsuite.io');
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  console.log("Cookie string ready.");
  
  const videoUrls = [
    { name: "8_01_Koerperschmerzen_Verschmelzungstyp", url: "https://api.learningsuite.io/api/bunny/playlist/master/Y21yYW9tMDBkMDM3eDVhMDF4YnRxNG5sMzpjbXJvbzRnbXgwOTNxZ2YwMWlrcDZicGgz/course/e5060097-2f67-4e44-926d-b560a5ff737b/playlist.m3u8?token=DzdxsP4a4q2mRrPixgIGpqcVPY_EDM6HrJ_on7KYdis&expires=1788580800" },
    { name: "8_02_Koerperschmerzen_Autonomietyp", url: "https://api.learningsuite.io/api/bunny/playlist/master/Y21yYW9tMDBkMDM3eDVhMDF4YnRxNG5sMzpjbXJvbzRnbXgwOTNxZ2YwMWlrcDZicGgz/course/36b74437-f6b6-4a06-bbcc-fd2bdb092bf2/playlist.m3u8?token=pNmvQ-dN1v309rcuCM9C_KwNMt_piNJ5ml-VuZbOJwE&expires=1788782400" },
    { name: "9_01_Konflikte_Verschmelzungstyp", url: "https://api.learningsuite.io/api/bunny/playlist/master/Y21yYW9tMDBkMDM3eDVhMDF4YnRxNG5sMzpjbXJvbzRnbXgwOTNxZ2YwMWlrcDZicGgz/course/07e5103e-b3e8-472d-9524-f6e1230247cc/playlist.m3u8?token=Wg-CilXfFalT4lQBrvWZqupYhBsMwafEk_D-E8a-zF8&expires=1788681600" },
    { name: "9_02_Konflikte_Autonomietyp", url: "https://api.learningsuite.io/api/bunny/playlist/master/Y21yYW9tMDBkMDM3eDVhMDF4YnRxNG5sMzpjbXJvbzRnbXgwOTNxZ2YwMWlrcDZicGgz/course/9ecd109c-bcdf-4ded-8c9c-d3e8554aa748/playlist.m3u8?token=ynWDUDDRsX9aJMwBK8afzFFF4YZ4h5NCNjgLTAnhuwk&expires=1788984000" }
  ];
  
  for (const v of videoUrls) {
     console.log(`Downloading ${v.name}...`);
     try {
       const cmd = `ffmpeg -y -cookies "${cookieString}" -headers "Referer: https://gopal.learningsuite.io/\r\nOrigin: https://gopal.learningsuite.io/\r\n" -user_agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -i "${v.url}" -c copy "tmp_downloads/gopal/${v.name}.mp4"`;
       execSync(cmd, { stdio: 'inherit' });
       console.log(`Success: ${v.name}`);
     } catch (e) {
       console.log(`Error downloading ${v.name}:`, e.message);
     }
  }
  
  await context.close();
})();
