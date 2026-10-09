import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

async function run() {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 100,
      messages: [{ role: "user", content: "Sag hallo" }]
    });
    console.log("SUCCESS:", JSON.stringify(msg, null, 2));
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}
run();
