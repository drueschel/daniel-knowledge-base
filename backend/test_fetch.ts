import 'dotenv/config';

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Sag Hallo und fasse dich sehr kurz." }] }]
      })
    });
    
    if (!res.ok) {
      console.error(`HTTP Error: ${res.status}`);
      console.error(await res.text());
      return;
    }
    
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e: any) {
    console.error(e.message);
  }
}
run();
