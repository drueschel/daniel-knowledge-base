const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0) {
      process.env[key.trim()] = val.join('=').trim();
    }
  });
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is required.");
  process.exit(1);
}

const txtFile = process.argv[2];
const deOutFile = process.argv[3];
const enOutFile = process.argv[4];

if (!txtFile || !deOutFile || !enOutFile) {
  console.error("Usage: node neo_generate_summary.js <transcript.txt> <de_out.md> <en_out.md>");
  process.exit(1);
}

async function generateSummary() {
  const transcript = fs.readFileSync(txtFile, 'utf8');
  
  const systemPrompt = `You are a professional educational summarizer for the "Somatic Evolution - Neo Emotional Release" course. 
Your task is to take a raw video transcript and output a beautifully formatted Markdown article.
You must output a JSON object containing two strings: 'de' (the German markdown) and 'en' (the English markdown).

The Markdown article MUST include:
1. An H1 title (extracted/inferred from the content)
2. **Kurzzusammenfassung / Summary**: 2-3 sentences max.
3. **Kernaussagen / Core Topics**: Bullet points of the main lessons.
4. **Wichtige Zitate / Key Quotes**: 1-2 impactful quotes from the speaker, translated or in English.
5. **Praxistipps / Practical Steps**: Actionable takeaways for the student.

Format the markdown cleanly with proper headings (H2, H3). Do not include markdown codeblocks (\`\`\`markdown) in the string values, just the raw markdown text.`;

  const payload = {
    contents: [{
      parts: [
        { text: systemPrompt },
        { text: "\n\nRaw Transcript:\n" + transcript }
      ]
    }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          de: { type: "string" },
          en: { type: "string" }
        },
        required: ["de", "en"]
      }
    }
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("API Error:", response.status, err);
      process.exit(1);
    }

    const jsonRes = await response.json();
    const textOutput = jsonRes.candidates[0].content.parts[0].text;
    
    let parsed;
    try {
      parsed = JSON.parse(textOutput);
    } catch (e) {
      console.error("Failed to parse JSON output:", textOutput);
      process.exit(1);
    }

    // Ensure output directories exist
    fs.mkdirSync(path.dirname(deOutFile), { recursive: true });
    fs.mkdirSync(path.dirname(enOutFile), { recursive: true });

    fs.writeFileSync(deOutFile, parsed.de);
    fs.writeFileSync(enOutFile, parsed.en);

    console.log("Successfully wrote:", deOutFile);
    console.log("Successfully wrote:", enOutFile);

  } catch (error) {
    console.error("Failed to call Gemini API:", error);
    process.exit(1);
  }
}

generateSummary();
