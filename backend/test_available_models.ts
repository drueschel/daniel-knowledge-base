import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-2.0-pro-exp",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`\nTesting ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Sag exakt das Wort 'Erfolg' und nichts anderes.");
      console.log(`[SUCCESS] ${modelName}: ${result.response.text().trim()}`);
      return; // Return on first success
    } catch (e: any) {
      console.error(`[ERROR] ${modelName}: ${e.message}`);
    }
  }
}
run();
