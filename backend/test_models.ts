import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const modelsToTest = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "antigravity-preview-latest"
];

async function run() {
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Schreibe das Wort 'Erfolg' in einem Satz.");
      console.log(`[SUCCESS] ${modelName}:`, result.response.text().trim());
      return; // Stop on first success
    } catch (e: any) {
      console.error(`[FAILED] ${modelName}:`, e.message);
    }
  }
}
run();
